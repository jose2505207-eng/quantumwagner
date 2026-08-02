import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { placePredictionSchema } from "@/server/validators";
import { recordPrediction } from "@/server/predictions";
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

/**
 * POST a prediction (auth required). The stake happens on-chain first; this
 * records it once `server/predictions.ts` has verified the transaction really
 * was a `place_bet` by this wallet into this market. Amounts are in SOL.
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "markets-predict", 30, 60_000);
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = placePredictionSchema.parse(await req.json());

    const result = await recordPrediction({
      marketRef: id,
      userId: claims.sub,
      wallet: claims.wallet,
      side: body.side,
      amountSol: body.amount,
      txSignature: body.txSignature,
    });

    if (!result.ok) return fail(result.error, result.status);

    return ok(
      {
        prediction: result.prediction,
        firstPrediction: result.firstPrediction,
        deduped: result.deduped,
        onchain: result.onchain,
      },
      { status: result.deduped ? 200 : 201 }
    );
  }
);
