import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { createUser, cleanDb } from "./helpers";

/**
 * Fast-bet settlement is server-driven (app/api/fast-bets/[id]/resolve/route.ts):
 * an admin-gated, pari-mutuel resolution. The hook (lib/useFastBets.ts) is a
 * thin client read of GET /api/fast-bets, so the load-bearing invariant to pin
 * is the SETTLEMENT MATH, against a real db. We seed a FastBet + entries and
 * replicate the route's arithmetic exactly:
 *
 *   winners      = entries where side === outcome
 *   winnersStake = sum(winner.amount)
 *   payout       = won && winnersStake > 0 ? amount / winnersStake * pool : 0
 *   losers       = 0
 *
 * and assert per-entry won/payout plus pool conservation.
 *
 * cleanDb() (helpers.ts) does not touch FastBet/FastBetEntry, so we wipe those
 * here (entries before fastBets, before the shared cleanDb wipes users).
 */
describe("fast-bet pari-mutuel settlement (integration, real db)", () => {
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

  async function seedFastBet() {
    const yesA = await createUser({ username: "fb_yesA" });
    const yesB = await createUser({ username: "fb_yesB" });
    const no = await createUser({ username: "fb_no" });

    // YES stake total = 400, NO stake total = 200, pool = 600.
    const fastBet = await prisma.fastBet.create({
      data: {
        question: "Will PUMP reach $0.005 in 10 minutes?",
        symbol: "PUMP",
        status: "live",
        pool: 600,
        endTime: new Date(Date.now() + 60_000),
        entries: {
          create: [
            { userId: yesA.id, side: "YES", amount: 100 },
            { userId: yesB.id, side: "YES", amount: 300 },
            { userId: no.id, side: "NO", amount: 200 },
          ],
        },
      },
      include: { entries: true },
    });

    return { fastBet, yesA, yesB, no };
  }

  /** Replica of the resolve route's pari-mutuel settlement, applied to the db. */
  async function settle(fastBetId: string, outcome: "YES" | "NO") {
    const fastBet = await prisma.fastBet.findUniqueOrThrow({
      where: { id: fastBetId },
      include: { entries: true },
    });
    const winners = fastBet.entries.filter((e) => e.side === outcome);
    const winnersStake = winners.reduce((s, e) => s + e.amount, 0);

    for (const e of fastBet.entries) {
      const won = e.side === outcome;
      const payout = won && winnersStake > 0 ? (e.amount / winnersStake) * fastBet.pool : 0;
      await prisma.fastBetEntry.update({ where: { id: e.id }, data: { won, payout } });
    }
    await prisma.fastBet.update({
      where: { id: fastBetId },
      data: { status: "resolved", outcome },
    });
  }

  it("settles winners pro-rata, zeroes losers, and conserves the pool", async () => {
    const { fastBet, yesA, yesB, no } = await seedFastBet();

    await settle(fastBet.id, "YES");

    const entries = await prisma.fastBetEntry.findMany({ where: { fastBetId: fastBet.id } });
    const byUser = Object.fromEntries(entries.map((e) => [e.userId, e]));

    // winnersStake = 400, pool = 600.
    // yesA: 100/400 * 600 = 150
    expect(byUser[yesA.id].won).toBe(true);
    expect(byUser[yesA.id].payout).toBeCloseTo(150, 6);

    // yesB: 300/400 * 600 = 450
    expect(byUser[yesB.id].won).toBe(true);
    expect(byUser[yesB.id].payout).toBeCloseTo(450, 6);

    // loser gets 0.
    expect(byUser[no.id].won).toBe(false);
    expect(byUser[no.id].payout).toBe(0);

    // Payouts conserve the pool exactly.
    const totalPaid = entries.reduce((s, e) => s + e.payout, 0);
    expect(totalPaid).toBeCloseTo(600, 6);

    // Round flipped to resolved with the recorded outcome.
    const resolved = await prisma.fastBet.findUnique({ where: { id: fastBet.id } });
    expect(resolved?.status).toBe("resolved");
    expect(resolved?.outcome).toBe("YES");
  });

  it("pays the entire pool to the winning side regardless of which side wins", async () => {
    const { fastBet, yesA, yesB, no } = await seedFastBet();

    await settle(fastBet.id, "NO");

    const entries = await prisma.fastBetEntry.findMany({ where: { fastBetId: fastBet.id } });
    const byUser = Object.fromEntries(entries.map((e) => [e.userId, e]));

    // Only NO bettor wins: winnersStake = 200, payout = 200/200 * 600 = 600.
    expect(byUser[no.id].won).toBe(true);
    expect(byUser[no.id].payout).toBeCloseTo(600, 6);
    expect(byUser[yesA.id].won).toBe(false);
    expect(byUser[yesA.id].payout).toBe(0);
    expect(byUser[yesB.id].won).toBe(false);

    const totalPaid = entries.reduce((s, e) => s + e.payout, 0);
    expect(totalPaid).toBeCloseTo(600, 6);
  });
});
