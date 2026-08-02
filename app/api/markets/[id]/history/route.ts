import { handler, ok, fail } from "@/server/http";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real probability history for a market.
 *
 * The market screen used to draw a `Math.random()` walk and label it
 * "Probability History" — a fabricated chart on the very screen where people
 * decide what to bet. This replays the market's ACTUAL predictions in order and
 * reports the YES share of the pool after each one. No bets, no series: the UI
 * shows an empty state instead of inventing a line.
 */
export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;

    const market = await prisma.market.findFirst({
      where: { OR: [{ id }, { pda: id }] },
      select: { id: true, createdAt: true },
    });
    if (!market) return fail("market not found", 404);

    const predictions = await prisma.prediction.findMany({
      where: { marketId: market.id },
      orderBy: { createdAt: "asc" },
      select: { side: true, amount: true, createdAt: true },
    });

    let yes = 0;
    let no = 0;
    const points = predictions.map((p) => {
      if (p.side === "YES") yes += p.amount;
      else no += p.amount;
      const total = yes + no;
      return {
        t: p.createdAt.toISOString(),
        yesPercent: total > 0 ? (yes / total) * 100 : 50,
        volume: total,
      };
    });

    return ok({
      points,
      totalVolume: yes + no,
      yesPool: yes,
      noPool: no,
    });
  }
);
