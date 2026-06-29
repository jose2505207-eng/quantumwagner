import { prisma } from "@/server/db";
import { getPriceFeedProvider, type PriceFeedProvider } from "@/server/oracleProviders";
import { settleFastBet } from "@/server/fastbetSettlement";

/**
 * Capture the settlement price for a round, preferring the price AS OF the
 * round's endTime (Pyth Benchmarks via provider.getPriceAt) over the jittery
 * cron-tick spot price. This is the fairness fix for the Loop-3 known risk:
 * a round that expired at T should settle on the price at T, not at whenever the
 * cron happened to fire.
 *
 *  - method "asof"          -> settled on the price as of endTime (preferred).
 *  - method "spot-fallback" -> getPriceAt threw (history pruned/outage) so we
 *                              fell back to the latest spot price; recorded
 *                              honestly so the degradation is auditable.
 *  - method "spot"          -> provider has no history capability at all.
 *
 * Honesty boundary: still NEVER invents a price — if every path throws, the
 * error propagates to the caller which SKIPS the round (leaves it unresolved).
 */
export async function captureSettlementPrice(
  provider: PriceFeedProvider,
  symbol: string,
  endTime: Date
): Promise<{ price: number; publishTime: number; method: string }> {
  const endSec = Math.floor(endTime.getTime() / 1000);
  if (typeof provider.getPriceAt === "function") {
    try {
      const p = await provider.getPriceAt(symbol, endSec);
      return { price: p.price, publishTime: p.publishTime, method: "asof" };
    } catch {
      // History unavailable — fall back to spot, but record it as a fallback so
      // the settlement record tells the truth about which price was used.
      const p = await provider.getPrice(symbol);
      return { price: p.price, publishTime: p.publishTime, method: "spot-fallback" };
    }
  }
  const p = await provider.getPrice(symbol);
  return { price: p.price, publishTime: p.publishTime, method: "spot" };
}

/**
 * Auto-resolve EXPIRED live rounds honestly from the price feed.
 *
 * Honesty boundary: the outcome is DERIVED from the provider — the settle price
 * (price as of endTime where available) vs the round's captured startPrice —
 * never invented. Every settlement records source "provider:<name>" plus an
 * audit-meta context (method/settlePrice/publishTime/drift). Any round whose
 * price can't be fetched (provider unconfigured/unmapped/HTTP error) is SKIPPED
 * and left unresolved rather than resolved off a fabricated price.
 *
 * Injectable `provider`/`now` make this testable without the network or a clock.
 */
export async function runAutoResolve(
  opts: { provider?: PriceFeedProvider; now?: Date } = {}
) {
  const now = opts.now ?? new Date();
  const rounds = await prisma.fastBet.findMany({
    where: {
      status: { in: ["live", "closing-soon"] },
      endTime: { lte: now },
      startPrice: { not: null },
      symbol: { not: "" },
    },
  });

  const provider = opts.provider ?? getPriceFeedProvider();
  const resolved: string[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const round of rounds) {
    // startPrice is guaranteed non-null by the query, but narrow for TS.
    if (round.startPrice === null) {
      skipped.push({ id: round.id, reason: "no start price" });
      continue;
    }

    // Settle on the price AS OF endTime where possible (fairness fix), not the
    // jittery cron-tick spot. Any price failure -> skip (never invent).
    let settlePrice: number;
    let publishTime: number;
    let method: string;
    try {
      const captured = await captureSettlementPrice(provider, round.symbol, round.endTime);
      settlePrice = captured.price;
      publishTime = captured.publishTime;
      method = captured.method;
    } catch (e) {
      skipped.push({ id: round.id, reason: e instanceof Error ? e.message : "price fetch failed" });
      continue;
    }

    // Outcome derived strictly from the settle price vs the captured baseline.
    const outcome: "YES" | "NO" = settlePrice > round.startPrice ? "YES" : "NO";
    const asOf = Math.floor(round.endTime.getTime() / 1000);
    try {
      await settleFastBet({
        fastBetId: round.id,
        outcome,
        // Stable attribution = which oracle settled it (the HOW lives in context).
        source: `provider:${provider.name}`,
        context: {
          method,
          settlePrice,
          startPrice: round.startPrice,
          settlePublishTime: publishTime,
          asOf,
          // How far the served price's publish time drifted from endTime (s).
          driftSec: publishTime - asOf,
        },
      });
      resolved.push(round.id);
    } catch (e) {
      // e.g. a concurrent settle marked it resolved between query and settle.
      skipped.push({ id: round.id, reason: e instanceof Error ? e.message : "settle failed" });
    }
  }

  return { resolved, skipped };
}
