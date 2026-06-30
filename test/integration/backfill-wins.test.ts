import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { backfillWins } from "@/scripts/backfill-wins";
import { createUser, cleanDb } from "./helpers";

/**
 * Reconciliation backfill for the Loop-5 first-win `profile.wins` undercount
 * (scripts/backfill-wins.ts).
 *
 * The Loop-5 fix (commit d663145) was forward-only: a player whose FIRST
 * fast-bet win predates it still has `profile.wins` short by one. This pins the
 * backfill that recomputes the TRUE win count from the authoritative settled
 * record ledger (FastBetEntry.won / Prediction.won / resolved MemeBattle winner)
 * — the same source the live `awardXp({win:true})` paths counted — and proves:
 *   1. --dry-run reports the diff but writes NOTHING,
 *   2. --apply corrects the count (and the active-season leaderboard entry),
 *   3. a second --apply is a no-op (idempotent).
 *
 * cleanDb() does not touch FastBet/FastBetEntry/MemeBattle, so we wipe those
 * first; it DOES wipe profiles/leaderboard/predictions/seasons.
 */
describe("backfill-wins (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await prisma.memeBattleEntry.deleteMany();
    await prisma.memeBattleVote.deleteMany();
    await prisma.memeBattle.deleteMany();
    await cleanDb();
  });

  afterAll(async () => {
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await prisma.memeBattleEntry.deleteMany();
    await prisma.memeBattleVote.deleteMany();
    await prisma.memeBattle.deleteMany();
    await prisma.$disconnect();
  });

  /**
   * Seed an UNDER-counted player (the pre-fix bug state) plus a correctly
   * counted control player, and the active-season leaderboard entries that
   * awardXp would have created.
   *
   * - u1 has TWO authoritative wins (1 fast-bet win + 1 prediction win) and one
   *   fast-bet LOSS, but profile.wins was left at 1 (the first win never
   *   counted) — true count is 2.
   * - u2 has ONE authoritative fast-bet win and profile.wins == 1 already — it
   *   must be left untouched.
   */
  async function seedUndercount() {
    const u1 = await createUser();
    const u2 = await createUser();

    // Active season + the leaderboard entries awardXp keeps in sync.
    const season = await prisma.leaderboardSeason.create({
      data: { name: "Test Season", active: true },
    });

    // --- u1: a resolved fast bet with one WIN entry and one LOSS entry ---
    await prisma.fastBet.create({
      data: {
        question: "u1 fastbet",
        symbol: "SOL/USD",
        status: "resolved",
        outcome: "YES",
        endTime: new Date(Date.now() - 1_000),
        pool: 200,
        entries: {
          create: [
            { userId: u1.id, side: "YES", amount: 100, won: true, payout: 200 },
            { userId: u1.id, side: "NO", amount: 50, won: false, payout: 0 },
          ],
        },
      },
    });
    // --- u1: a resolved market with one WINNING prediction ---
    const market = await prisma.market.create({
      data: {
        question: "u1 market",
        status: "RESOLVED",
        outcome: "YES",
        endTime: new Date(Date.now() - 1_000),
      },
    });
    await prisma.prediction.create({
      data: { marketId: market.id, userId: u1.id, side: "YES", amount: 100, settled: true, won: true, payout: 150 },
    });

    // --- u2: a single resolved fast-bet WIN ---
    await prisma.fastBet.create({
      data: {
        question: "u2 fastbet",
        symbol: "SOL/USD",
        status: "resolved",
        outcome: "YES",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u2.id, side: "YES", amount: 100, won: true, payout: 100 }] },
      },
    });

    // Profiles in their (buggy / correct) recorded state.
    await prisma.playerProfile.create({ data: { userId: u1.id, wins: 1 } }); // UNDER by one
    await prisma.playerProfile.create({ data: { userId: u2.id, wins: 1 } }); // correct

    // Leaderboard entries mirror the recorded (buggy) profile.wins.
    await prisma.leaderboardEntry.create({ data: { seasonId: season.id, userId: u1.id, wins: 1 } });
    await prisma.leaderboardEntry.create({ data: { seasonId: season.id, userId: u2.id, wins: 1 } });

    return { u1, u2, season };
  }

  it("dry-run reports the undercount diff but writes nothing", async () => {
    const { u1, u2 } = await seedUndercount();

    const report = await backfillWins({ apply: false });

    expect(report.applied).toBe(false);
    expect(report.profilesInspected).toBe(2);
    expect(report.profilesChanged).toBe(1);
    expect(report.profileChanges).toEqual([{ userId: u1.id, before: 1, after: 2 }]);
    // The active-season leaderboard entry for u1 is also flagged.
    expect(report.leaderboardChanges).toEqual([{ userId: u1.id, before: 1, after: 2 }]);

    // NOTHING was written.
    const p1 = await prisma.playerProfile.findUnique({ where: { userId: u1.id } });
    const p2 = await prisma.playerProfile.findUnique({ where: { userId: u2.id } });
    expect(p1?.wins).toBe(1);
    expect(p2?.wins).toBe(1);
    const e1 = await prisma.leaderboardEntry.findFirst({ where: { userId: u1.id } });
    expect(e1?.wins).toBe(1);
  });

  it("apply corrects profile.wins and the active-season leaderboard, leaving correct rows untouched", async () => {
    const { u1, u2 } = await seedUndercount();

    const report = await backfillWins({ apply: true });

    expect(report.applied).toBe(true);
    expect(report.profilesChanged).toBe(1);
    expect(report.leaderboardEntriesChanged).toBe(1);

    // u1 reconciled to the TRUE count (2); u2 untouched (already 1).
    const p1 = await prisma.playerProfile.findUnique({ where: { userId: u1.id } });
    const p2 = await prisma.playerProfile.findUnique({ where: { userId: u2.id } });
    expect(p1?.wins).toBe(2);
    expect(p2?.wins).toBe(1);

    const e1 = await prisma.leaderboardEntry.findFirst({ where: { userId: u1.id } });
    const e2 = await prisma.leaderboardEntry.findFirst({ where: { userId: u2.id } });
    expect(e1?.wins).toBe(2);
    expect(e2?.wins).toBe(1);
  });

  it("is idempotent: a second apply changes nothing", async () => {
    await seedUndercount();

    await backfillWins({ apply: true });
    const second = await backfillWins({ apply: true });

    expect(second.profilesChanged).toBe(0);
    expect(second.leaderboardEntriesChanged).toBe(0);
    expect(second.profileChanges).toEqual([]);
    expect(second.leaderboardChanges).toEqual([]);
  });
});
