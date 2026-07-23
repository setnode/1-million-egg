const postgres = require('postgres');
const connectionString = "postgresql://neondb_owner:npg_DT7X8yoZdBtK@ep-royal-poetry-avgftzzi.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = postgres(connectionString);

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "app_NotificationQueue" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "playerAddress" text NOT NULL,
        "type" text NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "sendAt" bigint NOT NULL,
        "retryCount" integer DEFAULT 0 NOT NULL,
        CONSTRAINT "uq_nq_player_type_send_at" UNIQUE("playerAddress","type","sendAt")
      );
    `;
    console.log("Created app_NotificationQueue");

    await sql`
      CREATE TABLE IF NOT EXISTS "app_NotificationToken" (
        "fid" integer PRIMARY KEY NOT NULL,
        "notificationUrl" text NOT NULL,
        "notificationToken" text NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("Created app_NotificationToken");

    await sql`
      CREATE TABLE IF NOT EXISTS "app_PlayerFid" (
        "address" text PRIMARY KEY NOT NULL,
        "fid" integer NOT NULL
      );
    `;
    console.log("Created app_PlayerFid");

    await sql`
      CREATE INDEX IF NOT EXISTS "idx_nq_status_send_at" ON "app_NotificationQueue" USING btree ("status","sendAt");
    `;
    console.log("Created index idx_nq_status_send_at");

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await sql.end();
  }
}

run();
