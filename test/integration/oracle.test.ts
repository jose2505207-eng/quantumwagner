import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { devResolver, adminResolver, applyResolution } from "@/server/oracle";
import { createUser, cleanDb } from "./helpers";

/**
 * applyResolution is the most load-bearing piece of the trust boundary: it
 * settles real money math (pari-mutuel payouts), grants XP/wins, and flips the
 * market to RESOLVED. We drive it exactly as the route handlers do — through a
 * resolver's proposal — against a real db, and pin the payout arithmetic.
 *
 *   payout = stake / winnersStake * totalPool   (losers get 0)
 *   totalPool = yesPool + noPool
 */
describe("server/oracle applyResolution (integration, real db)", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedMarket() {
    const yesA = await createUser({ username: "yesA" });
    const yesB = await createUser({ username: "yesB" });
    const no = await createUser({ username: "no" });

    // YES stake total = 400, NO stake total = 200, totalPool = 600.
    const market = await prisma.market.create({
      data: {
        question: "Will it resolve correctly?",
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

  it("settles pari-mutuel payouts, awards XP/wins, and resolves the market", async () => {
    const { market, yesA, yesB, no } = await seedMarket();

    // Drive it like app/api/markets/[id]/resolve/route.ts does (dev source).
    const proposal = await devResolver.propose({ marketId: market.id, outcome: "YES" });
    const resolution = await applyResolution(proposal);

    // OracleResolution row recorded.
    expect(resolution.source).toBe("dev");
    expect(resolution.status).toBe("resolved");
    expect(resolution.outcome).toBe("YES");
    const resolutions = await prisma.oracleResolution.findMany({ where: { marketId: market.id } });
    expect(resolutions).toHaveLength(1);

    // Market flipped to RESOLVED with the outcome.
    const resolved = await prisma.market.findUnique({ where: { id: market.id } });
    expect(resolved?.status).toBe("RESOLVED");
    expect(resolved?.outcome).toBe("YES");

    // Pari-mutuel: winnersStake = 400, totalPool = 600.
    const preds = await prisma.prediction.findMany({ where: { marketId: market.id } });
    const byUser = Object.fromEntries(preds.map((p) => [p.userId, p]));

    // yesA: 100/400 * 600 = 150
    expect(byUser[yesA.id].won).toBe(true);
    expect(byUser[yesA.id].settled).toBe(true);
    expect(byUser[yesA.id].payout).toBeCloseTo(150, 6);

    // yesB: 300/400 * 600 = 450
    expect(byUser[yesB.id].won).toBe(true);
    expect(byUser[yesB.id].payout).toBeCloseTo(450, 6);

    // loser gets 0.
    expect(byUser[no.id].won).toBe(false);
    expect(byUser[no.id].payout).toBe(0);

    // Payouts conserve the pool.
    const totalPaid = preds.reduce((s, p) => s + p.payout, 0);
    expect(totalPaid).toBeCloseTo(600, 6);

    // XP: winners get 120 + a win, losers get 10 consolation.
    const yesAProfile = await prisma.playerProfile.findUnique({ where: { userId: yesA.id } });
    expect(yesAProfile?.xp).toBe(120);
    expect(yesAProfile?.wins).toBe(1);

    const noProfile = await prisma.playerProfile.findUnique({ where: { userId: no.id } });
    expect(noProfile?.xp).toBe(10);
    expect(noProfile?.wins).toBe(0);
    expect(noProfile?.losses).toBe(1);
  });

  it("throws when resolving an already-RESOLVED market", async () => {
    const { market } = await seedMarket();
    const proposal = await devResolver.propose({ marketId: market.id, outcome: "YES" });
    await applyResolution(proposal);

    const second = await devResolver.propose({ marketId: market.id, outcome: "YES" });
    await expect(applyResolution(second)).rejects.toThrow(/already resolved/i);
  });

  it("throws for a market that does not exist", async () => {
    const proposal = await devResolver.propose({ marketId: "does-not-exist", outcome: "NO" });
    await expect(applyResolution(proposal)).rejects.toThrow(/market not found/i);
  });

  it("admin resolver rejects a wrong key and accepts the configured key", async () => {
    const { market } = await seedMarket();

    await expect(
      adminResolver("wrong-key").propose({ marketId: market.id, outcome: "YES" })
    ).rejects.toThrow(/invalid admin resolution key/i);

    // ADMIN_RESOLUTION_KEY is set to "test-admin-key" in test/setup.ts.
    const proposal = await adminResolver("test-admin-key").propose({
      marketId: market.id,
      outcome: "NO",
    });
    expect(proposal.source).toBe("admin");
    const resolution = await applyResolution(proposal);
    expect(resolution.outcome).toBe("NO");

    const resolved = await prisma.market.findUnique({ where: { id: market.id } });
    expect(resolved?.outcome).toBe("NO");
  });
});
