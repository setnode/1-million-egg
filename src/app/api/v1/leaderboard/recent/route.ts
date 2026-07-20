import { NextResponse } from 'next/server';
import { db } from '@/services/db';
import { sql } from 'drizzle-orm';
import { withCache } from '@/services/redis';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cacheKey = `v1:leaderboard:recent`;
    
    const data = await withCache(cacheKey, 10, async () => {
      if (!db) throw new Error("Database not configured");

      const result = await db.execute(sql`
        SELECT 
          "transactionHash", 
          "player", 
          "newScore", 
          "blockTimestamp"
        FROM "TapEvent"
        ORDER BY "blockTimestamp" DESC
        LIMIT 50
      `);

      return result;
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Leaderboard Recent API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
