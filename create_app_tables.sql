CREATE TABLE IF NOT EXISTS "app_NotificationQueue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playerAddress" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sendAt" bigint NOT NULL,
	"retryCount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "uq_nq_player_type_send_at" UNIQUE("playerAddress","type","sendAt")
);

CREATE TABLE IF NOT EXISTS "app_NotificationToken" (
	"fid" integer PRIMARY KEY NOT NULL,
	"notificationUrl" text NOT NULL,
	"notificationToken" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "app_PlayerFid" (
	"address" text PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_nq_status_send_at" ON "app_NotificationQueue" USING btree ("status","sendAt");
