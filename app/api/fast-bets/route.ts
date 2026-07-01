import { handler, ok } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { createFastBetSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";
import { getPriceFeedProvider } from "@/server/oracleProviders";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const fastBets = await prisma.fastBet.findMany({
    orderBy: { endTime: "asc" },
    include: { _count: { select: { entries: true } } },
    take: 100,
  });

  // Per-side pool split: one efficient groupBy over the fetched bet ids (no N+1).
  const ids = fastBets.map((b) => b.id);
  const sideSums =
    ids.length > 0
      ? await prisma.fastBetEntry.groupBy({
          by: ["fastBetId", "side"],
          where: { fastBetId: { in: ids } },
          _sum: { amount: true },
        })
      : [];
  const yesByBet = new Map<string, number>();
  const noByBet = new Map<string, number>();
  for (const row of sideSums) {
    const amt = row._sum.amount ?? 0;
    if (row.side === "YES") yesByBet.set(row.fastBetId, amt);
    else if (row.side === "NO") noByBet.set(row.fastBetId, amt);
  }

  // Live price per DISTINCT symbol, fetched at most once per request. HONEST:
  // an unconfigured/throwing provider yields null — never an invented price, and
  // a price failure must never 500 the whole feed.
  const priceBySymbol = new Map<string, number | null>();
  const livePriced = fastBets.filter(
    (b) =>
      (b.status === "live" || b.status === "closing-soon") &&
      typeof b.symbol === "string" &&
      b.symbol.length > 0
  );
  const distinctSymbols = Array.from(new Set(livePriced.map((b) => b.symbol)));
  if (distinctSymbols.length > 0) {
    let provider: ReturnType<typeof getPriceFeedProvider> | null = null;
    try {
      provider = getPriceFeedProvider();
    } catch {
      provider = null;
    }
    for (const symbol of distinctSymbols) {
      let price: number | null = null;
      if (provider) {
        try {
          const feed = await provider.getPrice(symbol);
          price = feed.price;
        } catch {
          price = null;
        }
      }
      priceBySymbol.set(symbol, price);
    }
  }

  const enriched = fastBets.map((b) => ({
    ...b,
    yesPool: yesByBet.get(b.id) ?? 0,
    noPool: noByBet.get(b.id) ?? 0,
    currentPrice:
      (b.status === "live" || b.status === "closing-soon") && b.symbol
        ? priceBySymbol.get(b.symbol) ?? null
        : null,
  }));

  return ok({ fastBets: enriched });
});

export const POST = handler(async (req: Request) => {
  await rateLimit(req, "fastbets-create", 10, 60_000);
  const claims = requireAuth(req);
  const body = createFastBetSchema.parse(await req.json());
  const fastBet = await prisma.fastBet.create({
    data: {
      question: body.question,
      symbol: body.symbol,
      endTime: body.endTime,
      status: "live",
    },
  });
  await logAudit({ actorId: claims.sub, action: "fastbet.create", target: fastBet.id });
  return ok({ fastBet }, { status: 201 });
});
