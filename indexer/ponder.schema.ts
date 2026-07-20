import { onchainTable } from "@ponder/core";

export const player = onchainTable("Player", (t) => ({
  id: t.text().primaryKey(), // Lowercase address
  lifetimePoints: t.bigint().notNull(),
  lastActive: t.bigint().notNull(),
  totalTaps: t.integer().notNull(),
}));

export const seasonPlayer = onchainTable("SeasonPlayer", (t) => ({
  id: t.text().primaryKey(), // {address}-{seasonId}
  address: t.text().notNull(),
  seasonId: t.integer().notNull(),
  seasonEggs: t.bigint().notNull(),
}));

export const season = onchainTable("Season", (t) => ({
  id: t.integer().primaryKey(), // season ID
  target: t.bigint().notNull(),
  totalEggs: t.bigint().notNull(),
}));

// Raw Events
export const tapEvent = onchainTable("TapEvent", (t) => ({
  id: t.text().primaryKey(), // {txHash}-{logIndex}
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  logIndex: t.integer().notNull(),
  chainId: t.integer().notNull(),
  contractAddress: t.text().notNull(),
  
  player: t.text().notNull(),
  newScore: t.bigint().notNull(),
  globalScore: t.bigint().notNull(),
  newEggBalance: t.bigint().notNull(),
}));

export const rewardClaim = onchainTable("RewardClaim", (t) => ({
  id: t.text().primaryKey(), // {txHash}-{logIndex}
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  logIndex: t.integer().notNull(),
  chainId: t.integer().notNull(),
  contractAddress: t.text().notNull(),

  player: t.text().notNull(),
  usdcAmount: t.bigint().notNull(),
  eggsSpent: t.bigint().notNull(),
}));

export const dailyCheckin = onchainTable("DailyCheckin", (t) => ({
  id: t.text().primaryKey(), // {txHash}-{logIndex}
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  logIndex: t.integer().notNull(),
  chainId: t.integer().notNull(),
  contractAddress: t.text().notNull(),

  player: t.text().notNull(),
  streak: t.bigint().notNull(),
  eggsGiven: t.bigint().notNull(),
}));
