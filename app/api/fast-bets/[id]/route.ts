import { handler, ok, fail } from "@/server/http";
import { optionalAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getPriceFeedProvider } from "@/server/oracleProviders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A single fast-bet round, for the round detail screen.
 *
 * Everything here is real: pools are summed from actual staked entries, the
 * price comes from the configured feed (null — never invented — when the feed
 * is unavailable), and `myEntries` is the caller's own staked positions when a
 * session cookie is present.
 */
export const GET = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;

    const fastBet = await prisma.fastBet.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });
    if (!fastBet) return fail("fast bet not found", 404);

    const sideSums = await prisma.fastBetEntry.groupBy({
      by: ["side"],
      where: { fastBetId: id },
      _sum: { amount: true },
    });
    const poolFor = (side: string) =>
      sideSums.find((row) => row.side === side)?._sum.amount ?? 0;

    // Live price for an open round. A provider that is unconfigured or failing
    // yields null so the UI can say "price unavailable" rather than show a
    // fabricated number.
    let currentPrice: number | null = null;
    const isOpen = fastBet.status === "live" || fastBet.status === "closing-soon";
    if (isOpen && fastBet.symbol) {
      try {
        const feed = await getPriceFeedProvider().getPrice(fastBet.symbol);
        currentPrice = feed.price;
      } catch {
        currentPrice = null;
      }
    }

    const claims = optionalAuth(req);
    const myEntries = claims
      ? await prisma.fastBetEntry.findMany({
          where: { fastBetId: id, userId: claims.sub },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return ok({
      fastBet: {
        ...fastBet,
        yesPool: poolFor("YES"),
        noPool: poolFor("NO"),
        currentPrice,
      },
      myEntries,
    });
  }
);
