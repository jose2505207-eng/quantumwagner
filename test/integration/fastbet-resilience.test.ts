import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { GET } from "@/app/api/fast-bets/route";
import { cleanDb } from "./helpers";

/**
 * Oracle-outage resilience of the live fast-bets feed (GET /api/fast-bets).
 *
 * The feed enriches each LIVE bet with a `currentPrice` from the price-feed
 * provider. Honesty doctrine (server/oracleProviders.ts): an unconfigured or
 * unmapped provider THROWS rather than invent a price. The route
 * (app/api/fast-bets/route.ts) wraps every provider call in try/catch and
 * yields `currentPrice: null` on failure, so a price outage must DEGRADE
 * GRACEFULLY — never 500 the whole feed.
 *
 * This test PINS that invariant: with the default (unconfigured) provider, a
 * live bet on a symbol with no configured feed id ("NOFEED/USD", absent from
 * DEFAULT_FEED_IDS) drives the provider to throw, and the endpoint must still
 * return a 200 success envelope with `currentPrice === null`. A future change
 * that lets the oracle failure escape would break this test instead of silently
 * 500-ing production.
 *
 * cleanDb() (helpers.ts) does not touch FastBet/FastBetEntry, so we wipe those
 * here (entries before fastBets, before the shared cleanDb wipes users).
 */
describe("fast-bets feed oracle-outage resilience (integration, real db)", () => {
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

  it("never 500s and yields currentPrice null when the provider cannot price a live bet", async () => {
    // "NOFEED/USD" is not in DEFAULT_FEED_IDS and has no env feed id, so the
    // provider throws for it. The route must catch that and degrade to null.
    const bet = await prisma.fastBet.create({
      data: {
        question: "Will NOFEED reach $1 in 10 minutes?",
        symbol: "NOFEED/USD",
        status: "live",
        endTime: new Date(Date.now() + 60_000),
      },
    });

    // The handler must not reject/throw on an oracle failure.
    const res = await GET();

    // Never a 500 — the price outage degrades gracefully.
    expect(res.status).not.toBe(500);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    const seeded = body.data.fastBets.find(
      (b: { id: string }) => b.id === bet.id
    );
    expect(seeded).toBeDefined();
    // Honest degradation: no invented price, just null.
    expect(seeded.currentPrice).toBeNull();
  });

  it("returns currentPrice null for a resolved (non-live) bet regardless of the provider", async () => {
    const bet = await prisma.fastBet.create({
      data: {
        question: "Did NOFEED reach $1?",
        symbol: "NOFEED/USD",
        status: "resolved",
        outcome: "YES",
        endTime: new Date(Date.now() - 60_000),
      },
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const seeded = body.data.fastBets.find(
      (b: { id: string }) => b.id === bet.id
    );
    expect(seeded).toBeDefined();
    expect(seeded.currentPrice).toBeNull();
  });
});
