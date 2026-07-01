import { prisma } from "./db";
import { isValidAdminKey } from "./adminKey";
import { awardXp } from "./xp";
import { logAudit } from "./audit";
import { computePayout } from "./settlement";
import type { PriceFeedProvider } from "./oracleProviders";

/**
 * Oracle resolution architecture.
 *
 * An OracleAdapter proposes an outcome for a market. We ship two adapters:
 *  - dev:   resolves from a caller-supplied outcome (local testing)
 *  - admin: same, but requires the ADMIN_RESOLUTION_KEY (controlled devnet demo)
 * A future provider adapter (Pyth/Switchboard/etc.) implements the same
 * interface. Outcomes are NEVER hardcoded — every resolution is recorded with a
 * source, confidence, status, and full audit trail.
 */
export type Outcome = "YES" | "NO";
export type ResolutionStatus =
  | "pending"
  | "proposed"
  | "resolved"
  | "disputed"
  | "failed";

export interface ResolutionProposal {
  marketId: string;
  outcome: Outcome;
  confidence: number; // 0..1
  source: string; // dev | admin | provider:<name>
  raw?: unknown;
}

export interface OracleAdapter {
  name: string;
  propose(input: {
    marketId: string;
    outcome?: Outcome;
    raw?: unknown;
  }): Promise<ResolutionProposal>;
}

/** Dev resolver: trusts the caller-supplied outcome (local only). */
export const devResolver: OracleAdapter = {
  name: "dev",
  async propose({ marketId, outcome, raw }) {
    if (!outcome) throw new Error("dev resolver requires an outcome");
    return { marketId, outcome, confidence: 1, source: "dev", raw };
  },
};

/** Admin resolver: same as dev but gated behind ADMIN_RESOLUTION_KEY. */
export function adminResolver(adminKey: string): OracleAdapter {
  return {
    name: "admin",
    async propose({ marketId, outcome, raw }) {
      if (!isValidAdminKey(adminKey)) {
        throw new Error("invalid admin resolution key");
      }
      if (!outcome) throw new Error("admin resolver requires an outcome");
      return { marketId, outcome, confidence: 1, source: "admin", raw };
    },
  };
}

/**
 * Provider resolver: derives an outcome from a real price feed.
 *
 * It fetches the price for `symbol`, then compares it to `threshold`:
 *   - comparator "gte": price >= threshold -> YES, else NO
 *   - comparator "lte": price <= threshold -> YES, else NO
 * The outcome is ALWAYS derived from the feed (never hardcoded), the source is
 * `provider:<name>`, confidence is carried from the feed, and the full feed
 * payload is stored as raw for auditability. If the provider is unconfigured it
 * throws (StubPriceFeedProvider), which surfaces as a 400 — never a fake result.
 */
export function providerResolver(
  provider: PriceFeedProvider,
  opts: { symbol: string; comparator: "gte" | "lte"; threshold: number }
): OracleAdapter {
  return {
    name: `provider:${provider.name}`,
    async propose({ marketId }) {
      const feed = await provider.getPrice(opts.symbol);
      const hit =
        opts.comparator === "gte"
          ? feed.price >= opts.threshold
          : feed.price <= opts.threshold;
      const outcome: Outcome = hit ? "YES" : "NO";
      return {
        marketId,
        outcome,
        confidence: feed.confidence,
        source: `provider:${provider.name}`,
        raw: feed,
      };
    },
  };
}

/**
 * Apply a proposal: persist the OracleResolution, resolve the market, settle
 * every prediction (win/loss + simple pari-mutuel payout), award XP/wins, and
 * audit. Returns the resolution record.
 */
export async function applyResolution(proposal: ResolutionProposal) {
  const market = await prisma.market.findUnique({
    where: { id: proposal.marketId },
    include: { predictions: true },
  });
  if (!market) throw new Error("market not found");
  if (market.status === "RESOLVED") throw new Error("market already resolved");

  const resolution = await prisma.oracleResolution.create({
    data: {
      marketId: market.id,
      source: proposal.source,
      status: "resolved",
      outcome: proposal.outcome,
      confidence: proposal.confidence,
      raw: proposal.raw ? JSON.stringify(proposal.raw) : null,
      resolvedAt: new Date(),
    },
  });

  await prisma.market.update({
    where: { id: market.id },
    data: { status: "RESOLVED", outcome: proposal.outcome },
  });

  // Pari-mutuel settlement: winners split the total pool pro-rata to stake.
  const winningSide = proposal.outcome;
  const winners = market.predictions.filter((p) => p.side === winningSide);
  const winnersStake = winners.reduce((s, p) => s + p.amount, 0);
  const totalPool = market.yesPool + market.noPool;

  for (const p of market.predictions) {
    const won = p.side === winningSide;
    const payout = won ? computePayout(p.amount, winnersStake, totalPool) : 0;
    await prisma.prediction.update({
      where: { id: p.id },
      data: { settled: true, won, payout, settledAt: new Date() },
    });
    // XP: reward correct calls; a small consolation keeps losers engaged.
    await awardXp({
      userId: p.userId,
      amount: won ? 120 : 10,
      reason: won ? "Won a prediction" : "Prediction settled",
      refType: "prediction",
      refId: p.id,
      win: won,
    });
  }

  await logAudit({
    action: "market.resolve",
    target: market.id,
    meta: { outcome: proposal.outcome, source: proposal.source, resolutionId: resolution.id },
  });

  return resolution;
}
