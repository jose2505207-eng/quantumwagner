import { handler, ok, fail } from "@/server/http";
import { prisma } from "@/server/db";
import { serializeMarket } from "@/server/markets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const market = await prisma.market.findUnique({
      where: { id },
      include: { _count: { select: { predictions: true } }, creator: true },
    });
    if (!market) return fail("market not found", 404);

    const total = market.yesPool + market.noPool;
    const summary = {
      total_positions: market._count.predictions,
      total_transactions: market._count.predictions,
      total_volume: total,
      yes_percentage: total > 0 ? (market.yesPool / total) * 100 : 0,
      no_percentage: total > 0 ? (market.noPool / total) * 100 : 0,
      days_remaining: Math.max(
        0,
        Math.floor((market.endTime.getTime() - Date.now()) / 86_400_000)
      ),
    };
    return ok({ market: serializeMarket(market), summary });
  }
);
