import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { placePredictionSchema } from "@/server/validators";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET predictions for a market.
export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const predictions = await prisma.prediction.findMany({
      where: { marketId: id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok({ predictions });
  }
);

// POST a prediction (auth required). Persists stake, updates pools, awards XP.
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "markets-predict", 30, 60_000);
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = placePredictionSchema.parse(await req.json());

    // Accept either the market cuid or its on-chain pda (the frontend has the pda).
    const market = await prisma.market.findFirst({
      where: { OR: [{ id }, { pda: id }] },
    });
    if (!market) return fail("market not found", 404);
    if (market.status !== "ACTIVE") return fail("market is not active", 409);
    if (market.endTime.getTime() < Date.now()) return fail("market has ended", 409);

    // ---- On-chain confirmation gate (Devnet) -------------------------------
    // Never record a "placed" prediction unless its Devnet tx confirmed.
    // - a provided signature is verified on-chain (reject if it didn't confirm)
    // - with no signature: required in devnet/prod, allowed (unconfirmed) in demo
    const verification = await verifySignature(body.txSignature);
    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Prediction not recorded — Devnet transaction not confirmed (${verification.reason}).`,
        409
      );
    }
    if (!body.txSignature && REQUIRE_ONCHAIN) {
      return fail(
        "An on-chain (Devnet) transaction signature is required to place a prediction.",
        400
      );
    }
    const txStatus = verification.confirmed ? "confirmed" : "local-unconfirmed";

    const isFirst =
      (await prisma.prediction.count({ where: { userId: claims.sub } })) === 0;

    const prediction = await prisma.prediction.create({
      data: {
        marketId: market.id,
        userId: claims.sub,
        side: body.side,
        amount: body.amount,
        // only persist a signature we actually confirmed on-chain
        txSignature: verification.confirmed ? body.txSignature : null,
      },
    });

    await prisma.market.update({
      where: { id: market.id },
      data:
        body.side === "YES"
          ? { yesPool: market.yesPool + body.amount }
          : { noPool: market.noPool + body.amount },
    });

    await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "prediction",
        amount: body.amount,
        signature: verification.confirmed ? body.txSignature : null,
        status: txStatus,
        refType: "prediction",
        refId: prediction.id,
      },
    });

    // Level 2 (first prediction) milestone — real action, server-authoritative.
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
        signature: body.txSignature ?? null,
        confirmed: verification.confirmed,
        slot: verification.slot ?? null,
        status: verification.status ?? null,
      },
    });
    return ok(
      {
        prediction,
        firstPrediction: isFirst,
        onchain: {
          confirmed: verification.confirmed,
          slot: verification.slot ?? null,
          status: verification.status ?? null,
        },
      },
      { status: 201 }
    );
  }
);
