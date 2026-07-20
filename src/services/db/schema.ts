import { pgTable, text, bigint, integer } from "drizzle-orm/pg-core";

export const player = pgTable("Player", {
  id: text("id").primaryKey(), // lowercase address
  lifetimePoints: bigint("lifetimePoints", { mode: "number" }).notNull(),
  lastActive: bigint("lastActive", { mode: "number" }).notNull(),
  totalTaps: integer("totalTaps").notNull(),
});

export const seasonPlayer = pgTable("SeasonPlayer", {
  id: text("id").primaryKey(),
  address: text("address").notNull(),
  seasonId: integer("seasonId").notNull(),
  seasonEggs: bigint("seasonEggs", { mode: "number" }).notNull(),
});

export const season = pgTable("Season", {
  id: integer("id").primaryKey(),
  target: bigint("target", { mode: "number" }).notNull(),
  totalEggs: bigint("totalEggs", { mode: "number" }).notNull(),
});

// We might not need to query raw events from API often, 
// but we map them just in case (e.g. for /recent feed)
export const tapEvent = pgTable("TapEvent", {
  id: text("id").primaryKey(),
  blockNumber: bigint("blockNumber", { mode: "number" }).notNull(),
  blockTimestamp: bigint("blockTimestamp", { mode: "number" }).notNull(),
  transactionHash: text("transactionHash").notNull(),
  logIndex: integer("logIndex").notNull(),
  chainId: integer("chainId").notNull(),
  contractAddress: text("contractAddress").notNull(),
  
  player: text("player").notNull(),
  newScore: bigint("newScore", { mode: "number" }).notNull(),
  globalScore: bigint("globalScore", { mode: "number" }).notNull(),
  newEggBalance: bigint("newEggBalance", { mode: "number" }).notNull(),
});

export const rewardClaim = pgTable("RewardClaim", {
  id: text("id").primaryKey(),
  blockNumber: bigint("blockNumber", { mode: "number" }).notNull(),
  blockTimestamp: bigint("blockTimestamp", { mode: "number" }).notNull(),
  transactionHash: text("transactionHash").notNull(),
  logIndex: integer("logIndex").notNull(),
  chainId: integer("chainId").notNull(),
  contractAddress: text("contractAddress").notNull(),

  player: text("player").notNull(),
  usdcAmount: bigint("usdcAmount", { mode: "number" }).notNull(),
  eggsSpent: bigint("eggsSpent", { mode: "number" }).notNull(),
});
