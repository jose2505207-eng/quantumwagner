import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { runAutoResolve } from "@/server/fastbetAutoResolve";
import {
  StubPriceFeedProvider,
  type PriceFetcher,
  type PriceAtFetcher,
} from "@/server/oracleProviders";
import { createUser, cleanDb } from "./helpers";

/**
 * Auto-resolve of expired live fast-bet rounds (server/fastbetAutoResolve.ts).
 *
 * The cron derives each expired round's outcome from the price feed — the
 * settle price (price AS OF endTime where available — the Loop-4 fairness fix)
 * vs the captured startPrice — and NEVER invents a price: a round it can't price
 * is SKIPPED and left live. Loop 3 shipped this logic untested; these pin the
 * derivation, the as-of-endTime preference, the honest skip-on-outage, the
 * expiry gate, and idempotency, with an injected provider/clock (no network).
 */

const PUBLISH = 1_777_000_000; // arbitrary fixed publish_time (seconds)

/** A stub whose getPriceAt returns `atPrice` and spot returns `spotPrice`. */
function provider(opts: {
  atPrice?: number;
  spotPrice?: number;
  atThrows?: boolean;
  spotThrows?: boolean;
  withHistory?: boolean; // when false, omit getPriceAt entirely (spot-only)
}) {
  const spot: PriceFetcher = async () => {
    if (opts.spotThrows) throw new Error("spot outage");
    return { price: opts.spotPrice ?? 0, confidence: 1, publishTime: PUBLISH };
  };
  const at: PriceAtFetcher = async (_sym, ts) => {
    if (opts.atThrows) throw new Error("history pruned");
    return { price: opts.atPrice ?? 0, confidence: 1, publishTime: ts };
  };
  return new StubPriceFeedProvider(
    spot,
    "stub",
    opts.withHistory === false ? undefined : at
  );
}

async function makeExpiredRound(opts: { startPrice: number | null; endTime?: Date }) {
  const u = await createUser();
  const bet = await prisma.fastBet.create({
    data: {
      question: "Will SOL be higher in 5m?",
      symbol: "SOL/USD",
      status: "live",
      endTime: opts.endTime ?? new Date(Date.now() - 60_000),
      startPrice: opts.startPrice,
      pool: 100,
      entries: { create: [{ userId: u.id, side: "YES", amount: 100 }] },
    },
  });
  return bet;
}

async function auditMeta(betId: string) {
  const row = await prisma.auditLog.findFirst({
    where: { action: "fastbet.resolve", target: betId },
  });
  return row ? JSON.parse(row.meta ?? "{}") : null;
}

describe("fast-bet auto-resolve (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await cleanDb();
  });

  afterAll(async () => {
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await prisma.$disconnect();
  });

  it("settles YES on the price AS OF endTime when it is above startPrice", async () => {
    const endTime = new Date(Date.now() - 60_000);
    const bet = await makeExpiredRound({ startPrice: 100, endTime });

    const result = await runAutoResolve({ provider: provider({ atPrice: 150 }) });
    expect(result.resolved).toContain(bet.id);

    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.status).toBe("resolved");
    expect(settled?.outcome).toBe("YES");
    expect(settled?.resolutionSource).toBe("provider:stub");

    // Fairness: it settled on the as-of-endTime price, recorded with method+asOf.
    const meta = await auditMeta(bet.id);
    expect(meta.method).toBe("asof");
    expect(meta.settlePrice).toBe(150);
    expect(meta.asOf).toBe(Math.floor(endTime.getTime() / 1000));
    // The stubbed getPriceAt echoes the requested ts as publishTime -> zero drift.
    expect(meta.driftSec).toBe(0);
  });

  it("settles NO when the as-of price is at or below startPrice", async () => {
    const bet = await makeExpiredRound({ startPrice: 100 });
    await runAutoResolve({ provider: provider({ atPrice: 80 }) });
    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.outcome).toBe("NO");
  });

  it("falls back to spot (recorded honestly) when getPriceAt throws", async () => {
    const bet = await makeExpiredRound({ startPrice: 100 });
    await runAutoResolve({ provider: provider({ atThrows: true, spotPrice: 130 }) });
    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.outcome).toBe("YES");
    const meta = await auditMeta(bet.id);
    expect(meta.method).toBe("spot-fallback");
    expect(meta.settlePrice).toBe(130);
  });

  it("uses spot (method 'spot') when the provider has no history capability", async () => {
    const bet = await makeExpiredRound({ startPrice: 100 });
    await runAutoResolve({ provider: provider({ withHistory: false, spotPrice: 90 }) });
    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.outcome).toBe("NO");
    const meta = await auditMeta(bet.id);
    expect(meta.method).toBe("spot");
  });

  it("SKIPS (never invents) a round when both as-of and spot prices fail", async () => {
    const bet = await makeExpiredRound({ startPrice: 100 });
    const result = await runAutoResolve({
      provider: provider({ atThrows: true, spotThrows: true }),
    });
    expect(result.resolved).not.toContain(bet.id);
    expect(result.skipped.map((s) => s.id)).toContain(bet.id);

    // Left live + unresolved — honest, retried on a later run.
    const round = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(round?.status).toBe("live");
    expect(round?.outcome).toBeNull();
  });

  it("never selects a round with a null startPrice (not auto-resolvable)", async () => {
    const bet = await makeExpiredRound({ startPrice: null });
    const result = await runAutoResolve({ provider: provider({ atPrice: 150 }) });
    expect(result.resolved).not.toContain(bet.id);
    const round = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(round?.status).toBe("live");
  });

  it("only settles EXPIRED rounds (endTime <= now)", async () => {
    const future = await makeExpiredRound({
      startPrice: 100,
      endTime: new Date(Date.now() + 10 * 60_000),
    });
    const result = await runAutoResolve({ provider: provider({ atPrice: 150 }) });
    expect(result.resolved).not.toContain(future.id);
    const round = await prisma.fastBet.findUnique({ where: { id: future.id } });
    expect(round?.status).toBe("live");
  });

  it("is idempotent — a second run re-settles nothing", async () => {
    const bet = await makeExpiredRound({ startPrice: 100 });
    const first = await runAutoResolve({ provider: provider({ atPrice: 150 }) });
    expect(first.resolved).toContain(bet.id);

    const second = await runAutoResolve({ provider: provider({ atPrice: 999 }) });
    expect(second.resolved).toHaveLength(0);

    // Outcome from the FIRST run stands; the second never flipped it.
    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.outcome).toBe("YES");
  });
});
