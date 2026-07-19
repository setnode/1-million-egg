// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }
}

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EggClickerV2 is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public usdcToken;

    uint256 public tapFee = 0.0000055 ether;
    uint256 public dailyClaimFee = 0.000070 ether;
    uint256 public globalScore;
    
    mapping(address => uint256) public scores;
    mapping(address => uint256) public eggBalances;
    mapping(address => bool) public imported;
    
    // Season System State
    uint256 public currentSeason = 0;
    uint256 public seasonTarget = 1_000_000;
    uint256 public seasonTotalEggs;
    mapping(uint256 => mapping(address => uint256)) public seasonEggs;
    
    // Daily Claim State
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public streakCount;
    mapping(address => uint256) public brokenStreak;

    event Tapped(address indexed player, uint256 newScore, uint256 globalScore, uint256 newEggBalance);
    event RewardClaimed(address indexed player, uint256 usdcAmount, uint256 eggsSpent);
    event DailyClaimed(address indexed player, uint256 currentStreak, uint256 eggsGiven);
    event StreakRestored(address indexed player, uint256 restoredStreak);
    event WithdrawnETH(address indexed owner, uint256 amount);
    event WithdrawnUSDC(address indexed owner, uint256 amount);
    event FeesUpdated(uint256 newTapFee, uint256 newDailyClaimFee);
    event SeasonChanged(uint256 indexed oldSeason, uint256 indexed newSeason);
    event SeasonTargetUpdated(uint256 newTarget);
    event SeasonEggsUpdated(uint256 indexed season, address indexed player, uint256 newBalance);

    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }

    function setFees(uint256 _tapFee, uint256 _dailyClaimFee) external onlyOwner {
        tapFee = _tapFee;
        dailyClaimFee = _dailyClaimFee;
        emit FeesUpdated(_tapFee, _dailyClaimFee);
    }

    function setSeasonTarget(uint256 _newTarget) external onlyOwner {
        seasonTarget = _newTarget;
        emit SeasonTargetUpdated(_newTarget);
    }

    function nextSeason() external onlyOwner {
        require(seasonTotalEggs >= seasonTarget, "Season target not reached");
        uint256 endedSeason = currentSeason;
        currentSeason++;
        seasonTotalEggs = 0;
        emit SeasonChanged(endedSeason, currentSeason);
    }

    function _addEggs(address player, uint256 scoreAmount, uint256 eggAmount) internal {
        if (scoreAmount > 0) {
            scores[player] += scoreAmount;
            globalScore += scoreAmount;
        }
        if (eggAmount > 0) {
            eggBalances[player] += eggAmount;
            seasonEggs[currentSeason][player] += eggAmount;
            seasonTotalEggs += eggAmount;
            emit SeasonEggsUpdated(currentSeason, player, seasonEggs[currentSeason][player]);
        }
    }

    function _deductEggs(address player, uint256 amount) internal {
        require(eggBalances[player] >= amount, "Insufficient eggs");
        eggBalances[player] -= amount;
        
        if (seasonEggs[currentSeason][player] >= amount) {
            seasonEggs[currentSeason][player] -= amount;
        } else {
            seasonEggs[currentSeason][player] = 0;
        }
        emit SeasonEggsUpdated(currentSeason, player, seasonEggs[currentSeason][player]);
    }

    function tap() external payable {
        require(msg.value == tapFee, "Incorrect fee amount");
        
        _addEggs(msg.sender, 1, 1);

        emit Tapped(msg.sender, scores[msg.sender], globalScore, eggBalances[msg.sender]);
    }

    function dailyClaim() external payable nonReentrant {
        require(msg.value == dailyClaimFee, "Incorrect fee amount");
        
        uint256 lastTime = lastClaimTime[msg.sender];
        uint256 currentTime = block.timestamp;
        
        require(lastTime == 0 || currentTime >= lastTime + 24 hours, "Come back tomorrow");
        
        if (lastTime != 0 && currentTime > lastTime + 48 hours) {
            brokenStreak[msg.sender] = streakCount[msg.sender];
            streakCount[msg.sender] = 0;
        }
        
        streakCount[msg.sender] += 1;
        uint256 currentStreak = streakCount[msg.sender];
        
        uint256 cycleDay = currentStreak % 30;
        if (cycleDay == 0) cycleDay = 30;
        
        uint256 eggsToGive = 10;
        if (cycleDay == 7) {
            eggsToGive = 20;
        } else if (cycleDay == 14) {
            eggsToGive = 20;
        } else if (cycleDay == 30) {
            eggsToGive = 30;
        }
        
        _addEggs(msg.sender, 10, eggsToGive);
        
        lastClaimTime[msg.sender] = currentTime;
        
        emit DailyClaimed(msg.sender, currentStreak, eggsToGive);
    }

    function restoreStreak() external payable nonReentrant {
        require(msg.value == dailyClaimFee, "Incorrect fee amount");
        require(brokenStreak[msg.sender] > 0, "No broken streak to restore");
        
        streakCount[msg.sender] = brokenStreak[msg.sender] + 1;
        brokenStreak[msg.sender] = 0;
        
        uint256 currentStreak = streakCount[msg.sender];
        uint256 cycleDay = currentStreak % 30;
        if (cycleDay == 0) cycleDay = 30;
        
        uint256 eggsToGive = 10;
        if (cycleDay == 7) {
            eggsToGive = 20;
        } else if (cycleDay == 14) {
            eggsToGive = 20;
        } else if (cycleDay == 30) {
            eggsToGive = 30;
        }
        
        _addEggs(msg.sender, 10, eggsToGive);
        
        lastClaimTime[msg.sender] = block.timestamp;
        
        emit StreakRestored(msg.sender, currentStreak);
        emit DailyClaimed(msg.sender, currentStreak, eggsToGive);
    }

    function importState(address[] calldata players, uint256[] calldata _scores, uint256[] calldata _eggs) external onlyOwner {
        require(players.length == _scores.length && players.length == _eggs.length, "Mismatched lengths");
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            if (!imported[player]) { // Only import if empty
                imported[player] = true;
                _addEggs(player, _scores[i], _eggs[i]);
            }
        }
    }

    function claimReward(uint8 tier) external nonReentrant {
        uint256 requiredEggs = 0;
        uint256 usdcReward = 0;

        if (tier == 1) {
            requiredEggs = 30;
            usdcReward = 100000; // 0.10 USDC (USDC has 6 decimals)
        } else if (tier == 2) {
            requiredEggs = 80;
            usdcReward = 500000; // 0.50 USDC
        } else if (tier == 3) {
            requiredEggs = 150;
            usdcReward = 1000000; // 1.00 USDC
        } else if (tier == 4) {
            requiredEggs = 650;
            usdcReward = 5000000; // 5.00 USDC
        } else if (tier == 5) {
            requiredEggs = 1200;
            usdcReward = 10000000; // 10.00 USDC
        } else if (tier == 6) {
            requiredEggs = 5500;
            usdcReward = 50000000; // 50.00 USDC
        } else if (tier == 7) {
            requiredEggs = 10500;
            usdcReward = 100000000; // 100.00 USDC
        } else {
            revert("Invalid tier");
        }

        require(eggBalances[msg.sender] >= requiredEggs, "Insufficient eggs");
        require(usdcToken.balanceOf(address(this)) >= usdcReward, "Contract out of USDC");

        _deductEggs(msg.sender, requiredEggs);
        
        usdcToken.safeTransfer(msg.sender, usdcReward);

        emit RewardClaimed(msg.sender, usdcReward, requiredEggs);
    }

    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH Transfer failed");

        emit WithdrawnETH(owner(), balance);
    }

    function withdrawUSDC(uint256 amount) external onlyOwner {
        require(usdcToken.balanceOf(address(this)) >= amount, "Insufficient USDC");
        usdcToken.safeTransfer(owner(), amount);

        emit WithdrawnUSDC(owner(), amount);
    }
}
