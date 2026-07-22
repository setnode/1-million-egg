import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { db } from "@/services/db";
import { playerFid } from "@/services/db/schema";
import { redis } from "@/services/redis";

export async function POST(req: NextRequest) {
  try {
    const { address, fid, nonce, timestamp, signature } = await req.json();

    if (!address || !fid || !nonce || !timestamp || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Timestamp validation (Reject if older than 10 minutes)
    const now = Date.now();
    const messageTime = parseInt(timestamp, 10);
    const TEN_MINUTES = 10 * 60 * 1000;
    if (isNaN(messageTime) || Math.abs(now - messageTime) > TEN_MINUTES) {
      return NextResponse.json({ error: "Signature expired or invalid timestamp" }, { status: 400 });
    }

    // 2. Replay attack validation (Check if nonce was already used)
    const nonceKey = `nonce:used:${nonce}`;
    if (redis) {
      const isUsed = await redis.get(nonceKey);
      if (isUsed) {
        return NextResponse.json({ error: "Nonce already used (Replay attack protection)" }, { status: 400 });
      }
    }

    // 3. Signature validation
    const messageToVerify = `Link Farcaster FID ${fid} to address ${address}.\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
    
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: address as `0x${string}`,
        message: messageToVerify,
        signature: signature as `0x${string}`,
      });
    } catch (e) {
      console.error("[Link API] Signature verification execution failed:", e);
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 4. Invalidate nonce after successful verification
    if (redis) {
      // 10 dakika TTL (Timestamp window ile aynı süre boyunca sakla ki tekrar kullanılamasın)
      await redis.set(nonceKey, "1", { ex: 600 }); 
    }

    // 5. Database UPSERT (Address -> FID)
    if (db) {
      await db.insert(playerFid)
        .values({
          address: address.toLowerCase(),
          fid: Number(fid),
        })
        .onConflictDoUpdate({
          target: playerFid.address,
          set: {
            fid: Number(fid),
          },
        });
    } else {
      console.error("[Link API] No DB connection available");
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // 6. Minimum gerekli veriyi dön
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[Link API] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
