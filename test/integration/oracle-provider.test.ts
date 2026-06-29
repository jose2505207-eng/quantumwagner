import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { providerResolver, adminResolver, applyResolution } from "@/server/oracle";
import { StubPriceFeedProvider } from "@/server/oracleProviders";
import { createUser, cleanDb } from "./helpers";

/**
 * Provider-mode oracle: the outcome is DERIVED from a price feed, never
 * hardcoded. We drive providerResolver with an INJECTED deterministic fetcher
 * so the price is fixed, assert the gte/lte comparison logic, that the source +
 * confidence flow through, that an unconfigured provider FAILS LOUDLY, and that
 * applyResolution still settles a seeded market exactly as in oracle.test.ts.
 */
describe("server/oracle providerResolver (integration, real db)", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedMarket() {
    const yesA = await createUser({ username: "p_yesA" });
    const yesB = await createUser({ username: "p_yesB" });
    const no = await createUser({ username: "p_no" });

    // YES stake total = 400, NO stake total = 200, totalPool = 600.
    const market = await prisma.market.create({
      data: {
        question: "Will SOL be >= threshold at close?",
        endTime: new Date(Date.now() + 60_000),
        yesPool: 400,
        noPool: 200,
        predictions: {
          create: [
            { userId: yesA.id, side: "YES", amount: 100 },
            { userId: yesB.id, side: "YES", amount: 300 },
            { userId: no.id, side: "NO", amount: 200 },
          ],
        },
      },
      include: { predictions: true },
    });

    return { market, yesA, yesB, no };
  }

  /** Deterministic stub feed: fixed price + confidence + publishTime. */
  function fixedFeed(price: number, confidence = 0.95, publishTime = 1_700_000_000) {
    return new StubPriceFeedProvider(async () => ({ price, confidence, publishTime }), "pyth-test");
  }

  it("derives YES when price >= threshold (gte) and settles the market", async () => {
    const { market, yesA, yesB, no } = await seedMarket();

    // Feed price 150 >= threshold 100 -> YES.
    const provider = fixedFeed(150, 0.92);
    const resolver = providerResolver(provider, {
      symbol: "SOL/USD",
      comparator: "gte",
      threshold: 100,
    });

    const proposal = await resolver.propose({ marketId: market.id });
    expect(proposal.outcome).toBe("YES");
    expect(proposal.source).toBe("provider:pyth-test");
    expect(proposal.confidence).toBe(0.92); // confidence carried from the feed
    expect(proposal.raw).toMatchObject({ price: 150, confidence: 0.92 });

    const resolution = await applyResolution(proposal);
    expect(resolution.source).toBe("provider:pyth-test");
    expect(resolution.status).toBe("resolved");
    expect(resolution.outcome).toBe("YES");

    // Market flipped to RESOLVED with the derived outcome.
    const resolved = await prisma.market.findUnique({ where: { id: market.id } });
    expect(resolved?.status).toBe("RESOLVED");
    expect(resolved?.outcome).toBe("YES");

    // Pari-mutuel: winnersStake = 400, totalPool = 600.
    const preds = await prisma.prediction.findMany({ where: { marketId: market.id } });
    const byUser = Object.fromEntries(preds.map((p) => [p.userId, p]));
    expect(byUser[yesA.id].payout).toBeCloseTo(150, 6);
    expect(byUser[yesB.id].payout).toBeCloseTo(450, 6);
    expect(byUser[no.id].won).toBe(false);
    expect(byUser[no.id].payout).toBe(0);
  });

  it("derives NO when price < threshold (gte)", async () => {
    const { market } = await seedMarket();

    // Feed price 80 < threshold 100 -> NO.
    const resolver = providerResolver(fixedFeed(80), {
      symbol: "SOL/USD",
      comparator: "gte",
      threshold: 100,
    });

    const proposal = await resolver.propose({ marketId: market.id });
    expect(proposal.outcome).toBe("NO");
    expect(proposal.source).toBe("provider:pyth-test");

    const resolved = await applyResolution(proposal);
    expect(resolved.outcome).toBe("NO");
  });

  it("derives YES when price <= threshold (lte) and NO above it", async () => {
    const yesCase = await providerResolver(fixedFeed(90), {
      symbol: "SOL/USD",
      comparator: "lte",
      threshold: 100,
    }).propose({ marketId: "x" });
    expect(yesCase.outcome).toBe("YES");

    const noCase = await providerResolver(fixedFeed(110), {
      symbol: "SOL/USD",
      comparator: "lte",
      threshold: 100,
    }).propose({ marketId: "x" });
    expect(noCase.outcome).toBe("NO");
  });

  it("FAILS LOUDLY when the provider is unconfigured (no injected fetcher)", async () => {
    const provider = new StubPriceFeedProvider();
    await expect(provider.getPrice("SOL/USD")).rejects.toThrow(/not configured/i);

    // Same failure surfaces through providerResolver.propose().
    const resolver = providerResolver(provider, {
      symbol: "SOL/USD",
      comparator: "gte",
      threshold: 100,
    });
    await expect(resolver.propose({ marketId: "x" })).rejects.toThrow(/not configured/i);
  });

  it("leaves the admin path unaffected (light assertion)", async () => {
    const { market } = await seedMarket();
    // ADMIN_RESOLUTION_KEY is set to "test-admin-key" in test/setup.ts.
    const proposal = await adminResolver("test-admin-key").propose({
      marketId: market.id,
      outcome: "NO",
    });
    expect(proposal.source).toBe("admin");
    const resolution = await applyResolution(proposal);
    expect(resolution.outcome).toBe("NO");
  });
});
