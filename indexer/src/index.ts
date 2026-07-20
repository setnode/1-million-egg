import { ponder } from "@/generated";

// Ensure all addresses are lowercase
const formatId = (address: string) => address.toLowerCase();

ponder.on("MillionEgg:Tapped", async ({ event, context }) => {
  const { player, newScore, globalScore, newEggBalance } = event.args;
  const playerId = formatId(player);
  
  const txHash = event.transaction.hash;
  const logIndex = event.log.logIndex;
  const eventId = `${txHash}-${logIndex}`;

  // 1. Insert Raw Event
  await context.db.TapEvent.create({
    id: eventId,
    data: {
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      transactionHash: txHash,
      logIndex: logIndex,
      chainId: context.network.chainId,
      contractAddress: event.log.address,
      
      player: playerId,
      newScore: newScore,
      globalScore: globalScore,
      newEggBalance: newEggBalance,
    }
  });

  // 2. Update Lifetime Aggregate (Player)
  const existingPlayer = await context.db.Player.findUnique({ id: playerId });
  if (existingPlayer) {
    await context.db.Player.update({
      id: playerId,
      data: {
        lifetimePoints: newScore,
        lastActive: event.block.timestamp,
        totalTaps: existingPlayer.totalTaps + 1,
      }
    });
  } else {
    await context.db.Player.create({
      id: playerId,
      data: {
        lifetimePoints: newScore,
        lastActive: event.block.timestamp,
        totalTaps: 1,
      }
    });
  }
});

ponder.on("MillionEgg:RewardClaimed", async ({ event, context }) => {
  const { player, usdcAmount, eggsSpent } = event.args;
  const playerId = formatId(player);
  const eventId = `${event.transaction.hash}-${event.log.logIndex}`;

  await context.db.RewardClaim.create({
    id: eventId,
    data: {
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
      logIndex: event.log.logIndex,
      chainId: context.network.chainId,
      contractAddress: event.log.address,
      
      player: playerId,
      usdcAmount: usdcAmount,
      eggsSpent: eggsSpent,
    }
  });
});

ponder.on("MillionEgg:DailyClaimed", async ({ event, context }) => {
  const { player, currentStreak, eggsGiven } = event.args;
  const playerId = formatId(player);
  const eventId = `${event.transaction.hash}-${event.log.logIndex}`;

  await context.db.DailyCheckin.create({
    id: eventId,
    data: {
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
      logIndex: event.log.logIndex,
      chainId: context.network.chainId,
      contractAddress: event.log.address,
      
      player: playerId,
      streak: currentStreak,
      eggsGiven: eggsGiven,
    }
  });
});

ponder.on("MillionEgg:SeasonEggsUpdated", async ({ event, context }) => {
  const { season, player, newBalance } = event.args;
  const playerId = formatId(player);
  const seasonId = Number(season);
  const seasonPlayerId = `${playerId}-${seasonId}`;

  // Update SeasonPlayer Aggregate
  await context.db.SeasonPlayer.upsert({
    id: seasonPlayerId,
    create: {
      address: playerId,
      seasonId: seasonId,
      seasonEggs: newBalance,
    },
    update: {
      seasonEggs: newBalance,
    }
  });
});

ponder.on("MillionEgg:SeasonTargetUpdated", async ({ event, context }) => {
  const { newTarget } = event.args;
  
  // We don't have the season ID in the event, but we can assume the latest or update a config.
  // We'll upsert season 0 as current for now, or fetch from contract if needed.
  // For production, the event should emit the season ID, or we track current season globally.
  await context.db.Season.upsert({
    id: 0,
    create: {
      target: newTarget,
      totalEggs: 0n,
    },
    update: {
      target: newTarget,
    }
  });
});
