import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { awardXp } from "@/server/xp";
import { getRank } from "@/lib/game/ranks";
import { createUser, cleanDb } from "./helpers";

/**
 * awardXp is THE single authoritative path for granting XP (the frontend can
 * never set XP directly). It must: write an immutable XPEvent, upsert the
 * PlayerProfile with the right xp/rank/wins/losses, and sync the active-season
 * LeaderboardEntry. We assert all three against a real SQLite db.
 */
describe("server/xp awardXp (integration, real db)", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates an XPEvent, profile, and leaderboard entry on a winning award", async () => {
    const user = await createUser();

    const newXp = await awardXp({
      userId: user.id,
      amount: 300,
      reason: "Won a prediction",
      refType: "prediction",
      refId: "pred_1",
      win: true,
    });

    expect(newXp).toBe(300);

    // Immutable XP ledger event.
    const events = await prisma.xPEvent.findMany({ where: { userId: user.id } });
    expect(events).toHaveLength(1);
    expect(events[0].amount).toBe(300);
    expect(events[0].reason).toBe("Won a prediction");

    // Profile reflects xp, derived rank, and the win.
    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    expect(profile?.xp).toBe(300);
    expect(profile?.rankId).toBe(getRank(300).id); // 300 xp -> "rookie"
    expect(profile?.rankId).toBe("rookie");
    expect(profile?.wins).toBe(1);
    expect(profile?.losses).toBe(0);

    // Leaderboard entry for the active season mirrors xp + wins.
    const season = await prisma.leaderboardSeason.findFirst({ where: { active: true } });
    expect(season).not.toBeNull();
    const entry = await prisma.leaderboardEntry.findUnique({
      where: { seasonId_userId: { seasonId: season!.id, userId: user.id } },
    });
    expect(entry?.xp).toBe(300);
    expect(entry?.wins).toBe(1);
  });

  it("accumulates xp across awards and records a loss", async () => {
    const user = await createUser();

    await awardXp({ userId: user.id, amount: 120, reason: "win", win: true });
    await awardXp({ userId: user.id, amount: 10, reason: "loss", win: false });

    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    expect(profile?.xp).toBe(130);
    expect(profile?.wins).toBe(1);
    expect(profile?.losses).toBe(1);

    const events = await prisma.xPEvent.findMany({ where: { userId: user.id } });
    expect(events).toHaveLength(2);

    // Leaderboard xp reflects the cumulative total.
    const season = await prisma.leaderboardSeason.findFirst({ where: { active: true } });
    const entry = await prisma.leaderboardEntry.findUnique({
      where: { seasonId_userId: { seasonId: season!.id, userId: user.id } },
    });
    expect(entry?.xp).toBe(130);
    // Only one win was recorded.
    expect(entry?.wins).toBe(1);
  });

  it("promotes the rank when xp crosses a threshold", async () => {
    const user = await createUser();
    await awardXp({ userId: user.id, amount: 800, reason: "big win", win: true });
    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    // 800 xp -> signal-hunter (>= 750).
    expect(profile?.rankId).toBe("signal-hunter");
  });
});
