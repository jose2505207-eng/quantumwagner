import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Body shape posted by the markets bet UI (app/markets/[id]/page.tsx).
const schema = z.object({
  market_id: z.string(),
  position_type: z.enum(["YES", "NO"]),
  amount_staked: z.coerce.number().positive(), // lamports
  stake_tx_hash: z.string().optional(), // real Devnet signature from placeBet()
});

/**
 * Record a prediction from a REAL on-chain stake. The frontend calls the Anchor
 * `placeBet` instruction first, then posts the resulting signature here; we
 * verify it on Devnet before recording anything. Same trust rules as
 * /api/markets/[id]/predictions.
 */
export const POST = handler(async (req: Request) => {
  await rateLimit(req, "positions-add", 30, 60_000);
  const claims = requireAuth(req);
  const body = schema.parse(await req.json());

  const market = await prisma.market.findUnique({ where: { id: body.market_id } });
  if (!market) return fail("market not found", 404);
  if (market.status !== "ACTIVE") return fail("market is not active", 409);

  // On-chain confirmation gate (Devnet).
  const verification = await verifySignature(body.stake_tx_hash);
  if (body.stake_tx_hash && !verification.confirmed) {
    return fail(
      `Bet not recorded — Devnet transaction not confirmed (${verification.reason}).`,
      409
    );
  }
  if (!body.stake_tx_hash && REQUIRE_ONCHAIN) {
    return fail("An on-chain (Devnet) transaction is required to place a bet.", 400);
  }

  const amountSol = body.amount_staked / LAMPORTS_PER_SOL;
  const isFirst =
    (await prisma.prediction.count({ where: { userId: claims.sub } })) === 0;

  const prediction = await prisma.prediction.create({
    data: {
      marketId: body.market_id,
      userId: claims.sub,
      side: body.position_type,
      amount: amountSol,
      txSignature: verification.confirmed ? body.stake_tx_hash : null,
    },
  });

  await prisma.market.update({
    where: { id: body.market_id },
    data:
      body.position_type === "YES"
        ? { yesPool: market.yesPool + amountSol }
        : { noPool: market.noPool + amountSol },
  });

  await prisma.transaction.create({
    data: {
      userId: claims.sub,
      kind: "prediction",
      amount: amountSol,
      signature: verification.confirmed ? body.stake_tx_hash : null,
      status: verification.confirmed ? "confirmed" : "local-unconfirmed",
      refType: "prediction",
      refId: prediction.id,
    },
  });

  if (isFirst) {
    const lvl = LEVEL_BY_ID["first-prediction"];
    await completeLevelServer({
      userId: claims.sub,
      levelId: lvl.id,
      levelNumber: lvl.level,
      levelXp: lvl.xp,
    });
  } else {
    await awardXp({
      userId: claims.sub,
      amount: 20,
      reason: "Placed a prediction",
      refType: "prediction",
      refId: prediction.id,
    });
  }

  await logAudit({
    actorId: claims.sub,
    action: "prediction.place",
    target: prediction.id,
    meta: {
      signature: body.stake_tx_hash ?? null,
      confirmed: verification.confirmed,
      slot: verification.slot ?? null,
    },
  });

  return ok(
    {
      prediction,
      firstPrediction: isFirst,
      onchain: { confirmed: verification.confirmed, slot: verification.slot ?? null },
    },
    { status: 201 }
  );
});
