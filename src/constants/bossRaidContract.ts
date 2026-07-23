// Boss Raid Manager Contract - Base Sepolia (Testnet)
// Deploy sonrası bu adresi güncelleyin
export const BOSS_RAID_ADDRESS = (process.env.NEXT_PUBLIC_BOSS_RAID_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Base Sepolia Testnet USDC
export const SEPOLIA_USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;

export const BOSS_RAID_ABI = [
  // Read Functions
  {
    inputs: [],
    name: 'activeRaidId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextRaidId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'getRaid',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'health', type: 'uint256' },
          { internalType: 'uint256', name: 'remainingHealth', type: 'uint256' },
          { internalType: 'uint256', name: 'tapFeeWei', type: 'uint256' },
          { internalType: 'uint256', name: 'prizePool', type: 'uint256' },
          { internalType: 'uint256', name: 'totalPaidEth', type: 'uint256' },
          { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'raidDeadline', type: 'uint256' },
          { internalType: 'uint256', name: 'claimDeadline', type: 'uint256' },
          { internalType: 'uint256', name: 'claimedPrize', type: 'uint256' },
          { internalType: 'uint256', name: 'sequence', type: 'uint256' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'bool', name: 'revenueWithdrawn', type: 'bool' },
        ],
        internalType: 'struct BossRaidManager.Raid',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'getTopFive',
    outputs: [
      { internalType: 'address[5]', name: 'players', type: 'address[5]' },
      { internalType: 'uint256[5]', name: 'scores', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'damageByUser',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'paidByUser',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'claimablePrize',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint8', name: '', type: 'uint8' },
    ],
    name: 'prizeByRank',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'usdcToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write Functions
  {
    inputs: [
      { internalType: 'uint256', name: 'health', type: 'uint256' },
      { internalType: 'uint256', name: 'tapFeeWei', type: 'uint256' },
      { internalType: 'uint256[5]', name: 'prizeAmounts', type: 'uint256[5]' },
    ],
    name: 'startRaid',
    outputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'raidId', type: 'uint256' },
      { internalType: 'uint16', name: 'hits', type: 'uint16' },
    ],
    name: 'bossTap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'cancelRaid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'expireRaid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'claimPrize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'raidId', type: 'uint256' },
      { internalType: 'address payable', name: 'recipient', type: 'address' },
    ],
    name: 'withdrawCompletedRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'withdrawCancelledPrize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'sweepExpiredPrize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'raidId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'health', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'tapFeeWei', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'prizePool', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'RaidStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'raidId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint16', name: 'hits', type: 'uint16' },
      { indexed: false, internalType: 'uint256', name: 'playerDamage', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'remainingHealth', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'sequence', type: 'uint256' },
    ],
    name: 'BossTapped',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'raidId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'completedAt', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'claimDeadline', type: 'uint256' },
    ],
    name: 'RaidCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'RaidCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'raidId', type: 'uint256' }],
    name: 'RaidExpired',
    type: 'event',
  },
] as const;

// ERC20 approve ABI (USDC için)
export const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Raid Status Enum
export enum RaidStatus {
  None = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Expired = 4,
}

export type RaidStatusKey = keyof typeof RaidStatus;
