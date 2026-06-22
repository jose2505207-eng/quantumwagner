import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { placePredictionSchema } from "@/server/validators";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";

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
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = placePredictionSchema.parse(await req.json());

    const market = await prisma.market.findUnique({ where: { id } });
    if (!market) return fail("market not found", 404);
    if (market.status !== "ACTIVE") return fail("market is not active", 409);
    if (market.endTime.getTime() < Date.now()) return fail("market has ended", 409);

    const isFirst =
      (await prisma.prediction.count({ where: { userId: claims.sub } })) === 0;

    const prediction = await prisma.prediction.create({
      data: {
        marketId: id,
        userId: claims.sub,
        side: body.side,
        amount: body.amount,
        txSignature: body.txSignature,
      },
    });

    await prisma.market.update({
      where: { id },
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
        signature: body.txSignature,
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

    await logAudit({ actorId: claims.sub, action: "prediction.place", target: prediction.id });
    return ok({ prediction, firstPrediction: isFirst }, { status: 201 });
  }
);
