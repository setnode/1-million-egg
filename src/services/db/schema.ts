import { pgTable, text, bigint, integer, index, timestamp, uuid, unique } from "drizzle-orm/pg-core";

export const player = pgTable("Player", {
  id: text("id").primaryKey(), // lowercase address
  lifetimePoints: bigint("lifetimePoints", { mode: "number" }).notNull(),
  lastActive: bigint("lastActive", { mode: "number" }).notNull(),
  totalTaps: integer("totalTaps").notNull(),
}, (table) => ([
  index("idx_player_lifetime_points").on(table.lifetimePoints),
  index("idx_player_last_active").on(table.lastActive),
]));

export const seasonPlayer = pgTable("SeasonPlayer", {
  id: text("id").primaryKey(),
  address: text("address").notNull(),
  seasonId: integer("seasonId").notNull(),
  seasonEggs: bigint("seasonEggs", { mode: "number" }).notNull(),
}, (table) => ([
  index("idx_season_player_eggs").on(table.seasonEggs),
  index("idx_season_player_address").on(table.address),
]));

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
}, (table) => ([
  index("idx_tap_event_player").on(table.player),
  index("idx_tap_event_timestamp").on(table.blockTimestamp),
]));

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

export const dailyCheckin = pgTable("DailyCheckin", {
  id: text("id").primaryKey(),
  blockNumber: bigint("blockNumber", { mode: "number" }).notNull(),
  blockTimestamp: bigint("blockTimestamp", { mode: "number" }).notNull(),
  transactionHash: text("transactionHash").notNull(),
  logIndex: integer("logIndex").notNull(),
  chainId: integer("chainId").notNull(),
  contractAddress: text("contractAddress").notNull(),

  player: text("player").notNull(),
  streak: bigint("streak", { mode: "number" }).notNull(),
  eggsGiven: bigint("eggsGiven", { mode: "number" }).notNull(),
});

export const playerFid = pgTable("app_PlayerFid", {
  address: text("address").primaryKey(), // lowercase address
  fid: integer("fid").notNull(),
});

export const notificationToken = pgTable("app_NotificationToken", {
  fid: integer("fid").primaryKey(),
  notificationUrl: text("notificationUrl").notNull(),
  notificationToken: text("notificationToken").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notificationQueue = pgTable("app_NotificationQueue", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerAddress: text("playerAddress").notNull(),
  type: text("type").notNull(), // e.g., 'daily_claim'
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'sent', 'failed', 'cancelled'
  sendAt: bigint("sendAt", { mode: "number" }).notNull(), // Unix timestamp in seconds
  retryCount: integer("retryCount").notNull().default(0),
}, (table) => ([
  index("idx_nq_status_send_at").on(table.status, table.sendAt),
  // Benzersiz kayıt constrainti: Aynı kullanıcıya, aynı tipte ve aynı zamanda birden fazla bildirim oluşturulamaz
  unique("uq_nq_player_type_send_at").on(table.playerAddress, table.type, table.sendAt),
]));
