import { db } from "@/services/db";
import { sql } from "drizzle-orm";

let cachedPrefix: string | null = null;
let lastFetchTime = 0;

export async function getPonderPrefix(): Promise<string> {
  const now = Date.now();
  // Cache for 1 minute
  if (cachedPrefix !== null && now - lastFetchTime < 60000) {
    return cachedPrefix;
  }

  if (!db) return "";

  try {
    const metaRes = await db.execute(sql`
      SELECT value FROM _ponder_meta WHERE key = 'live'
    `);
    
    if (metaRes.length > 0 && metaRes[0].value) {
      const val = metaRes[0].value as any;
      if (val.instance_id) {
        const prefix = `${val.instance_id}__`;
        // Verify table actually exists AND has data (protect against syncing Ponder deployments)
        const checkRes = await db.execute(sql.raw(`
          SELECT count(*) as cnt 
          FROM "public"."${prefix}SeasonPlayer"
        `));
        
        if (checkRes.length > 0 && Number(checkRes[0].cnt) > 0) {
          cachedPrefix = prefix;
          lastFetchTime = now;
          return cachedPrefix;
        } else {
          console.warn(`Ponder live instance ${prefix} has no tables. Falling back...`);
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch ponder live prefix:", e);
  }

  // Fallback to highest heartbeat if 'live' doesn't exist
  try {
    const directTables = await db.execute(sql`
      SELECT tablename, (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
      FROM (
        SELECT tablename, query_to_xml(format('select count(*) as cnt from public.%I', tablename), false, true, '') as xml_count
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename LIKE '%__SeasonPlayer' AND tablename NOT LIKE '%reorg%'
      ) t
      ORDER BY row_count DESC
    `);
    
    if (directTables.length > 0) {
      const bestTable = directTables[0] as any;
      const prefix = bestTable.tablename.replace('SeasonPlayer', '');
      cachedPrefix = prefix;
      lastFetchTime = now;
      return prefix;
    }

    cachedPrefix = "ponder.";
    lastFetchTime = now;
    return cachedPrefix;
  } catch (e) {
    console.error("Failed to fetch fallback ponder prefix:", e);
  }

  return "";
}
