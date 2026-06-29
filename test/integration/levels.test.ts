import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { completeLevelServer } from "@/server/xp";
import { LEVEL_BY_ID, isVisitLevel } from "@/lib/game/levels";
import { createUser, cleanDb } from "./helpers";

/**
 * Level 6 ("enter-leaderboard") is a VISIT-based milestone, but it must still be
 * server-authoritative: completing it grants XP exactly once through the same
 * authoritative path as every other level (completeLevelServer), and a repeated
 * visit is idempotent (no double XP). We assert that against a real db.
 *
 * We also pin the honesty allowlist: only genuine visit levels may be completed
 * via a visit; action milestones are rejected.
 */
describe("levels: visit-based milestone authority (integration, real db)", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("grants enter-leaderboard XP (500) once and is idempotent on a second visit", async () => {
    const user = await createUser();
    const lvl = LEVEL_BY_ID["enter-leaderboard"];
    expect(lvl.level).toBe(6);
    expect(lvl.xp).toBe(500);

    // First completion: marks the level done and awards its XP.
    const first = await completeLevelServer({
      userId: user.id,
      levelId: lvl.id,
      levelNumber: lvl.level,
      levelXp: lvl.xp,
    });
    expect(first).toEqual({ alreadyDone: false });

    const profile1 = await prisma.playerProfile.findUnique({
      where: { userId: user.id },
    });
    expect(profile1?.xp).toBe(500);
    expect(JSON.parse(profile1?.completedLevels || "[]")).toContain(
      "enter-leaderboard"
    );

    // Exactly one XP event recorded for the level.
    const events1 = await prisma.xPEvent.findMany({ where: { userId: user.id } });
    expect(events1).toHaveLength(1);
    expect(events1[0].amount).toBe(500);

    // Second visit: idempotent — alreadyDone, no extra XP, no extra event.
    const second = await completeLevelServer({
      userId: user.id,
      levelId: lvl.id,
      levelNumber: lvl.level,
      levelXp: lvl.xp,
    });
    expect(second).toEqual({ alreadyDone: true, xp: 500 });

    const profile2 = await prisma.playerProfile.findUnique({
      where: { userId: user.id },
    });
    expect(profile2?.xp).toBe(500);

    const events2 = await prisma.xPEvent.findMany({ where: { userId: user.id } });
    expect(events2).toHaveLength(1);
  });

  it("allowlists only genuine visit levels (honesty boundary)", () => {
    // enter-leaderboard is genuinely a visit milestone.
    expect(isVisitLevel("enter-leaderboard")).toBe(true);

    // Action milestones must never be completable via a visit.
    expect(isVisitLevel("first-prediction")).toBe(false);
    expect(isVisitLevel("win-fast-bet")).toBe(false);
    expect(isVisitLevel("join-meme-battle")).toBe(false);
    expect(isVisitLevel("launch-token")).toBe(false);
    expect(isVisitLevel("connect-wallet")).toBe(false);

    // Unknown ids are rejected too.
    expect(isVisitLevel("not-a-level")).toBe(false);
  });
});
