// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BossRaidManager
 * @notice Runs repeatable, independently funded Boss Raids next to EggClickerV2.
 *
 * A raid has a fixed health, a fixed ETH price per damage unit and a USDC prize
 * pool deposited before the raid starts. Boss taps do not mint normal eggs.
 * If a raid expires or is cancelled, every participant can recover the ETH they
 * paid for that raid. If it completes, the top five contributors can claim the
 * configured USDC prizes for 30 days.
 */
contract BossRaidManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant RAID_DURATION = 30 days;
    uint256 public constant CLAIM_DURATION = 30 days;
    uint16 public constant MAX_HITS_PER_TX = 100;

    IERC20 public immutable usdcToken;
    uint256 public nextRaidId = 1;
    uint256 public activeRaidId;

    enum RaidStatus {
        None,
        Active,
        Completed,
        Cancelled,
        Expired
    }

    struct Raid {
        uint256 health;
        uint256 remainingHealth;
        uint256 tapFeeWei;
        uint256 prizePool;
        uint256 totalPaidEth;
        uint256 startedAt;
        uint256 raidDeadline;
        uint256 claimDeadline;
        uint256 claimedPrize;
        uint256 sequence;
        RaidStatus status;
        bool revenueWithdrawn;
    }

    mapping(uint256 => Raid) public raids;
    mapping(uint256 => mapping(address => uint256)) public damageByUser;
    mapping(uint256 => mapping(address => uint256)) public paidByUser;
    mapping(uint256 => mapping(address => uint256)) private tieBreakSequence;
    mapping(uint256 => mapping(address => uint256)) public claimablePrize;

    // Rank 0 is first place, rank 4 is fifth place.
    mapping(uint256 => mapping(uint8 => address)) public topPlayer;
    mapping(uint256 => mapping(uint8 => uint256)) public topScore;
    mapping(uint256 => mapping(uint8 => uint256)) private topSequence;
    mapping(uint256 => uint8) public topCount;
    mapping(uint256 => mapping(uint8 => uint256)) public prizeByRank;

    event RaidStarted(
        uint256 indexed raidId,
        uint256 health,
        uint256 tapFeeWei,
        uint256 prizePool,
        uint256 deadline
    );
    event BossTapped(
        uint256 indexed raidId,
        address indexed player,
        uint16 hits,
        uint256 playerDamage,
        uint256 remainingHealth,
        uint256 sequence
    );
    event RaidCompleted(uint256 indexed raidId, uint256 completedAt, uint256 claimDeadline);
    event RaidCancelled(uint256 indexed raidId);
    event RaidExpired(uint256 indexed raidId);
    event PrizeClaimed(uint256 indexed raidId, address indexed player, uint256 amount);
    event RefundClaimed(uint256 indexed raidId, address indexed player, uint256 amount);
    event CancelledPrizeWithdrawn(uint256 indexed raidId, uint256 amount);
    event ExpiredPrizeSwept(uint256 indexed raidId, uint256 amount);
    event CompletedRevenueWithdrawn(uint256 indexed raidId, address indexed recipient, uint256 amount);

    error ActiveRaidExists();
    error NoActiveRaid();
    error InvalidRaidParameters();
    error InvalidHits();
    error IncorrectPayment();
    error RaidNotActive();
    error RaidDeadlinePassed();
    error BossHasInsufficientHealth();
    error NothingToClaim();
    error ClaimPeriodEnded();
    error ClaimPeriodNotEnded();
    error NothingToRefund();
    error RevenueNotAvailable();
    error PrizeStillLocked();
    error PrizeAlreadyWithdrawn();

    constructor(address _usdcToken) Ownable(msg.sender) {
        if (_usdcToken == address(0)) revert InvalidRaidParameters();
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @notice Starts one raid. The prize is transferred into escrow before the
     * raid becomes active. Fee is fixed for this raid and denominated in ETH.
     */
    function startRaid(
        uint256 health,
        uint256 tapFeeWei,
        uint256[5] calldata prizeAmounts
    ) external onlyOwner nonReentrant returns (uint256 raidId) {
        if (activeRaidId != 0 && raids[activeRaidId].status == RaidStatus.Active) {
            revert ActiveRaidExists();
        }
        if (health == 0 || tapFeeWei == 0) revert InvalidRaidParameters();

        uint256 prizePool;
        for (uint8 i = 0; i < 5; i++) {
            if (prizeAmounts[i] == 0) revert InvalidRaidParameters();
            prizePool += prizeAmounts[i];
        }

        usdcToken.safeTransferFrom(msg.sender, address(this), prizePool);

        raidId = nextRaidId++;
        Raid storage raid = raids[raidId];
        raid.health = health;
        raid.remainingHealth = health;
        raid.tapFeeWei = tapFeeWei;
        raid.prizePool = prizePool;
        raid.startedAt = block.timestamp;
        raid.raidDeadline = block.timestamp + RAID_DURATION;
        raid.status = RaidStatus.Active;
        activeRaidId = raidId;

        for (uint8 rank = 0; rank < 5; rank++) {
            prizeByRank[raidId][rank] = prizeAmounts[rank];
        }

        emit RaidStarted(raidId, health, tapFeeWei, prizePool, raid.raidDeadline);
    }

    /**
     * @notice Deals 1, 10, 20, 50 or 100 damage in one transaction.
     * No regular EggClicker egg is minted by this function.
     */
    function bossTap(uint256 raidId, uint16 hits) external payable nonReentrant {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Active) revert RaidNotActive();
        if (block.timestamp >= raid.raidDeadline) revert RaidDeadlinePassed();
        if (hits != 1 && hits != 10 && hits != 20 && hits != 50 && hits != 100) {
            revert InvalidHits();
        }
        if (hits > raid.remainingHealth) revert BossHasInsufficientHealth();
        if (msg.value != raid.tapFeeWei * uint256(hits)) revert IncorrectPayment();

        raid.sequence += 1;
        raid.totalPaidEth += msg.value;
        raid.remainingHealth -= hits;
        damageByUser[raidId][msg.sender] += hits;
        paidByUser[raidId][msg.sender] += msg.value;
        tieBreakSequence[raidId][msg.sender] = raid.sequence;

        _updateTopFive(raidId, msg.sender);

        emit BossTapped(
            raidId,
            msg.sender,
            hits,
            damageByUser[raidId][msg.sender],
            raid.remainingHealth,
            raid.sequence
        );

        if (raid.remainingHealth == 0) {
            _completeRaid(raidId, raid);
        }
    }

    /** @notice Cancels an active raid and enables full ETH refunds. */
    function cancelRaid(uint256 raidId) external onlyOwner {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Active) revert RaidNotActive();
        raid.status = RaidStatus.Cancelled;
        if (activeRaidId == raidId) activeRaidId = 0;
        emit RaidCancelled(raidId);
    }

    /** @notice Anyone can expire an unfinished raid after its 30-day deadline. */
    function expireRaid(uint256 raidId) external {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Active) revert RaidNotActive();
        if (block.timestamp < raid.raidDeadline) revert RaidDeadlinePassed();
        raid.status = RaidStatus.Expired;
        if (activeRaidId == raidId) activeRaidId = 0;
        emit RaidExpired(raidId);
    }

    /** @notice Refunds the caller's complete Boss Tap ETH after cancellation/expiry. */
    function claimRefund(uint256 raidId) external nonReentrant {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Cancelled && raid.status != RaidStatus.Expired) {
            revert NothingToRefund();
        }

        uint256 amount = paidByUser[raidId][msg.sender];
        if (amount == 0) revert NothingToRefund();
        paidByUser[raidId][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH refund failed");
        emit RefundClaimed(raidId, msg.sender, amount);
    }

    /** @notice Claims a completed raid prize during the 30-day claim period. */
    function claimPrize(uint256 raidId) external nonReentrant {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Completed) revert NothingToClaim();
        if (block.timestamp > raid.claimDeadline) revert ClaimPeriodEnded();

        uint256 amount = claimablePrize[raidId][msg.sender];
        if (amount == 0) revert NothingToClaim();
        claimablePrize[raidId][msg.sender] = 0;
        raid.claimedPrize += amount;
        usdcToken.safeTransfer(msg.sender, amount);
        emit PrizeClaimed(raidId, msg.sender, amount);
    }

    /** @notice Returns unclaimed cancelled/expired prize funds to the owner. */
    function withdrawCancelledPrize(uint256 raidId) external onlyOwner nonReentrant {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Cancelled && raid.status != RaidStatus.Expired) {
            revert PrizeStillLocked();
        }
        if (raid.prizePool == 0) revert PrizeAlreadyWithdrawn();
        uint256 amount = raid.prizePool;
        raid.prizePool = 0;
        usdcToken.safeTransfer(owner(), amount);
        emit CancelledPrizeWithdrawn(raidId, amount);
    }

    /** @notice Returns unclaimed prizes after the completed raid's 30-day claim period. */
    function sweepExpiredPrize(uint256 raidId) external onlyOwner nonReentrant {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Completed) revert PrizeStillLocked();
        if (block.timestamp <= raid.claimDeadline) revert ClaimPeriodNotEnded();
        uint256 amount = raid.prizePool - raid.claimedPrize;
        if (amount == 0) revert PrizeAlreadyWithdrawn();
        raid.prizePool = raid.claimedPrize;
        usdcToken.safeTransfer(owner(), amount);
        emit ExpiredPrizeSwept(raidId, amount);
    }

    /** @notice Withdraws only a successfully completed raid's ETH proceeds. */
    function withdrawCompletedRevenue(uint256 raidId, address payable recipient)
        external
        onlyOwner
        nonReentrant
    {
        Raid storage raid = raids[raidId];
        if (raid.status != RaidStatus.Completed || raid.revenueWithdrawn) {
            revert RevenueNotAvailable();
        }
        if (recipient == address(0)) revert InvalidRaidParameters();
        uint256 amount = raid.totalPaidEth;
        raid.revenueWithdrawn = true;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH withdrawal failed");
        emit CompletedRevenueWithdrawn(raidId, recipient, amount);
    }

    function getRaid(uint256 raidId) external view returns (Raid memory) {
        return raids[raidId];
    }

    function getTopFive(uint256 raidId)
        external
        view
        returns (address[5] memory players, uint256[5] memory scores)
    {
        for (uint8 i = 0; i < 5; i++) {
            players[i] = topPlayer[raidId][i];
            scores[i] = topScore[raidId][i];
        }
    }

    function _completeRaid(uint256 raidId, Raid storage raid) internal {
        raid.status = RaidStatus.Completed;
        raid.claimDeadline = block.timestamp + CLAIM_DURATION;
        if (activeRaidId == raidId) activeRaidId = 0;

        for (uint8 rank = 0; rank < topCount[raidId]; rank++) {
            address winner = topPlayer[raidId][rank];
            uint256 amount = prizeByRank[raidId][rank];
            claimablePrize[raidId][winner] = amount;
        }

        emit RaidCompleted(raidId, block.timestamp, raid.claimDeadline);
    }

    function _updateTopFive(uint256 raidId, address player) internal {
        uint256 score = damageByUser[raidId][player];
        uint256 sequence = tieBreakSequence[raidId][player];
        uint8 existingIndex = type(uint8).max;

        for (uint8 i = 0; i < 5; i++) {
            if (topPlayer[raidId][i] == player) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex == type(uint8).max) {
            if (topCount[raidId] < 5) {
                existingIndex = topCount[raidId];
                topCount[raidId] += 1;
            } else if (!_outranks(score, sequence, topScore[raidId][4], topSequence[raidId][4])) {
                return;
            } else {
                existingIndex = 4;
            }
        }

        topPlayer[raidId][existingIndex] = player;
        topScore[raidId][existingIndex] = score;
        topSequence[raidId][existingIndex] = sequence;

        while (existingIndex > 0 && _outranks(
            topScore[raidId][existingIndex],
            topSequence[raidId][existingIndex],
            topScore[raidId][existingIndex - 1],
            topSequence[raidId][existingIndex - 1]
        )) {
            _swapTopEntries(raidId, existingIndex, existingIndex - 1);
            existingIndex--;
        }
    }

    function _swapTopEntries(uint256 raidId, uint8 a, uint8 b) internal {
        address player = topPlayer[raidId][a];
        uint256 score = topScore[raidId][a];
        uint256 sequence = topSequence[raidId][a];

        topPlayer[raidId][a] = topPlayer[raidId][b];
        topScore[raidId][a] = topScore[raidId][b];
        topSequence[raidId][a] = topSequence[raidId][b];
        topPlayer[raidId][b] = player;
        topScore[raidId][b] = score;
        topSequence[raidId][b] = sequence;
    }

    function _outranks(uint256 scoreA, uint256 seqA, uint256 scoreB, uint256 seqB)
        internal
        pure
        returns (bool)
    {
        return scoreA > scoreB || (scoreA == scoreB && seqA < seqB);
    }

    receive() external payable {
        revert("Use bossTap");
    }
}
