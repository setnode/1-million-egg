CREATE TABLE "DailyCheckin" (
	"id" text PRIMARY KEY NOT NULL,
	"blockNumber" bigint NOT NULL,
	"blockTimestamp" bigint NOT NULL,
	"transactionHash" text NOT NULL,
	"logIndex" integer NOT NULL,
	"chainId" integer NOT NULL,
	"contractAddress" text NOT NULL,
	"player" text NOT NULL,
	"streak" bigint NOT NULL,
	"eggsGiven" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_NotificationQueue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playerAddress" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sendAt" bigint NOT NULL,
	"retryCount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "uq_nq_player_type_send_at" UNIQUE("playerAddress","type","sendAt")
);
--> statement-breakpoint
CREATE TABLE "app_NotificationToken" (
	"fid" integer PRIMARY KEY NOT NULL,
	"notificationUrl" text NOT NULL,
	"notificationToken" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Player" (
	"id" text PRIMARY KEY NOT NULL,
	"lifetimePoints" bigint NOT NULL,
	"lastActive" bigint NOT NULL,
	"totalTaps" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_PlayerFid" (
	"address" text PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "RewardClaim" (
	"id" text PRIMARY KEY NOT NULL,
	"blockNumber" bigint NOT NULL,
	"blockTimestamp" bigint NOT NULL,
	"transactionHash" text NOT NULL,
	"logIndex" integer NOT NULL,
	"chainId" integer NOT NULL,
	"contractAddress" text NOT NULL,
	"player" text NOT NULL,
	"usdcAmount" bigint NOT NULL,
	"eggsSpent" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Season" (
	"id" integer PRIMARY KEY NOT NULL,
	"target" bigint NOT NULL,
	"totalEggs" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SeasonPlayer" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"seasonId" integer NOT NULL,
	"seasonEggs" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TapEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"blockNumber" bigint NOT NULL,
	"blockTimestamp" bigint NOT NULL,
	"transactionHash" text NOT NULL,
	"logIndex" integer NOT NULL,
	"chainId" integer NOT NULL,
	"contractAddress" text NOT NULL,
	"player" text NOT NULL,
	"newScore" bigint NOT NULL,
	"globalScore" bigint NOT NULL,
	"newEggBalance" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_nq_status_send_at" ON "app_NotificationQueue" USING btree ("status","sendAt");--> statement-breakpoint
CREATE INDEX "idx_player_lifetime_points" ON "Player" USING btree ("lifetimePoints");--> statement-breakpoint
CREATE INDEX "idx_player_last_active" ON "Player" USING btree ("lastActive");--> statement-breakpoint
CREATE INDEX "idx_season_player_eggs" ON "SeasonPlayer" USING btree ("seasonEggs");--> statement-breakpoint
CREATE INDEX "idx_season_player_address" ON "SeasonPlayer" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_tap_event_player" ON "TapEvent" USING btree ("player");--> statement-breakpoint
CREATE INDEX "idx_tap_event_timestamp" ON "TapEvent" USING btree ("blockTimestamp");