import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { settleFastBet } from "@/server/fastbetSettlement";
import { createUser, cleanDb } from "./helpers";

/**
 * Settlement authority for fast-bet rounds (server/fastbetSettlement.ts).
 *
 * This is a VALUE PATH (it pays out a pool + grants XP/wins), so it is held to
 * the honesty boundary: the caller supplies an already-derived outcome + a
 * `source`, winners split the pool PRO-RATA to their stake, the Level-3
 * "win-fast-bet" milestone is granted on a player's FIRST win only, and a
 * resolved round can never be settled twice. Loop 3 shipped this code with ZERO
 * tests — these pin the math + the milestone + the idempotency guard against a
 * real Postgres (quantum_test).
 *
 * cleanDb() does not touch FastBet/FastBetEntry, so we wipe those first (entries
 * before fastBets, before the shared cleanDb wipes users/profiles/xp/audit).
 */
describe("fast-bet settlement (integration, real db)", () => {
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

  it("splits the pool pro-rata among winners and zeroes losers", async () => {
    const u1 = await createUser(); // YES 100
    const u2 = await createUser(); // YES 300
    const u3 = await createUser(); // NO  200

    const bet = await prisma.fastBet.create({
      data: {
        question: "Will SOL be higher in 5m?",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 600, // total pari-mutuel pool
        entries: {
          create: [
            { userId: u1.id, side: "YES", amount: 100 },
            { userId: u2.id, side: "YES", amount: 300 },
            { userId: u3.id, side: "NO", amount: 200 },
          ],
        },
      },
    });

    const res = await settleFastBet({ fastBetId: bet.id, outcome: "YES", source: "admin" });
    expect(res).toMatchObject({ resolved: true, outcome: "YES", source: "admin" });

    const entries = await prisma.fastBetEntry.findMany({ where: { fastBetId: bet.id } });
    const byUser = Object.fromEntries(entries.map((e) => [e.userId, e]));
    // winnersStake = 400; pool 600 -> u1: 100/400*600=150, u2: 300/400*600=450.
    expect(byUser[u1.id].won).toBe(true);
    expect(byUser[u1.id].payout).toBeCloseTo(150, 6);
    expect(byUser[u2.id].won).toBe(true);
    expect(byUser[u2.id].payout).toBeCloseTo(450, 6);
    expect(byUser[u3.id].won).toBe(false);
    expect(byUser[u3.id].payout).toBe(0);

    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.status).toBe("resolved");
    expect(settled?.outcome).toBe("YES");
    expect(settled?.resolutionSource).toBe("admin");
  });

  it("grants the win-fast-bet milestone on a FIRST win and only 60 XP on later wins", async () => {
    const u1 = await createUser();

    // First win -> Level-3 milestone (250 XP), profile level advances.
    const bet1 = await prisma.fastBet.create({
      data: {
        question: "round 1",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });
    await settleFastBet({ fastBetId: bet1.id, outcome: "YES", source: "admin" });

    let profile = await prisma.playerProfile.findUnique({ where: { userId: u1.id } });
    expect(profile?.xp).toBe(250); // win-fast-bet level xp
    expect(JSON.parse(profile?.completedLevels ?? "[]")).toContain("win-fast-bet");
    // Loop 5 FIX: the FIRST fast-bet win now grants the Level-3 milestone AND
    // counts the win — completeLevelServer forwards win:true to awardXp, so
    // profile.wins increments on the first win instead of lagging by one.
    expect(profile?.wins).toBe(1);

    // Second win -> NOT the milestone again; a flat 60-XP win award.
    const bet2 = await prisma.fastBet.create({
      data: {
        question: "round 2",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });
    await settleFastBet({ fastBetId: bet2.id, outcome: "YES", source: "admin" });

    profile = await prisma.playerProfile.findUnique({ where: { userId: u1.id } });
    expect(profile?.xp).toBe(310); // 250 + 60
    // Both wins now count -> wins=2 after two actual wins.
    expect(profile?.wins).toBe(2);
    // The milestone is recorded exactly once.
    const completed = JSON.parse(profile?.completedLevels ?? "[]") as string[];
    expect(completed.filter((l) => l === "win-fast-bet")).toHaveLength(1);
  });

  it("reconciles the season leaderboard wins with profile.wins from the FIRST win", async () => {
    const u1 = await createUser();
    const bet = await prisma.fastBet.create({
      data: {
        question: "first win leaderboard",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });
    await settleFastBet({ fastBetId: bet.id, outcome: "YES", source: "admin" });

    const profile = await prisma.playerProfile.findUnique({ where: { userId: u1.id } });
    // The active-season leaderboard entry must mirror the authoritative profile
    // wins — the bug previously left BOTH at 0 after a first win.
    const entry = await prisma.leaderboardEntry.findFirst({ where: { userId: u1.id } });
    expect(profile?.wins).toBe(1);
    expect(entry?.wins).toBe(1);
  });

  it("persists settlePrice + settleMethod columns from the settlement context", async () => {
    const u1 = await createUser();
    const bet = await prisma.fastBet.create({
      data: {
        question: "settle price columns",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });

    // Auto-resolve-style settle: the price/method live in context and are promoted
    // to first-class columns (never invented — only the recorded number/string).
    await settleFastBet({
      fastBetId: bet.id,
      outcome: "YES",
      source: "provider:pyth",
      context: { method: "asof", settlePrice: 152.5, startPrice: 100 },
    });

    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.settlePrice).toBe(152.5);
    expect(settled?.settleMethod).toBe("asof");
  });

  it("leaves settlePrice/settleMethod null when the admin path supplies no price", async () => {
    const u1 = await createUser();
    const bet = await prisma.fastBet.create({
      data: {
        question: "admin settle no price",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });

    await settleFastBet({ fastBetId: bet.id, outcome: "YES", source: "admin" });

    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.settlePrice).toBeNull();
    expect(settled?.settleMethod).toBeNull();
  });

  it("refuses to settle an already-resolved round (no double payout)", async () => {
    const u1 = await createUser();
    const bet = await prisma.fastBet.create({
      data: {
        question: "round",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });

    await settleFastBet({ fastBetId: bet.id, outcome: "YES", source: "admin" });
    await expect(
      settleFastBet({ fastBetId: bet.id, outcome: "NO", source: "admin" })
    ).rejects.toThrow(/already resolved/);

    // The first settlement stands; the second never re-paid or flipped it.
    const settled = await prisma.fastBet.findUnique({ where: { id: bet.id } });
    expect(settled?.outcome).toBe("YES");
  });

  it("records the source + supplied context in the audit log", async () => {
    const u1 = await createUser();
    const bet = await prisma.fastBet.create({
      data: {
        question: "round",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
        pool: 100,
        entries: { create: [{ userId: u1.id, side: "YES", amount: 100 }] },
      },
    });

    await settleFastBet({
      fastBetId: bet.id,
      outcome: "YES",
      source: "provider:pyth",
      context: { method: "asof", settlePrice: 150, startPrice: 100 },
    });

    const audit = await prisma.auditLog.findFirst({
      where: { action: "fastbet.resolve", target: bet.id },
    });
    expect(audit).toBeTruthy();
    const meta = JSON.parse(audit?.meta ?? "{}");
    expect(meta.source).toBe("provider:pyth");
    expect(meta.outcome).toBe("YES");
    expect(meta.method).toBe("asof");
    expect(meta.settlePrice).toBe(150);
  });
});
