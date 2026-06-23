import { describe, it, expect } from "vitest";
import { getRank, getNextRank, rankProgress } from "@/lib/game/ranks";
import { arenaLevelNumber, formatXp } from "@/lib/game/xp";
import { getActiveLevel, isLevelUnlocked, LEVELS } from "@/lib/game/levels";

describe("ranks", () => {
  it("maps XP to the correct tier", () => {
    expect(getRank(0).id).toBe("unranked");
    expect(getRank(250).id).toBe("rookie");
    expect(getRank(12000).id).toBe("arena-legend");
  });
  it("rankProgress is 0..1 and 1 at max", () => {
    expect(rankProgress(0)).toBeGreaterThanOrEqual(0);
    expect(rankProgress(0)).toBeLessThanOrEqual(1);
    expect(getNextRank(12000)).toBeNull();
    expect(rankProgress(99999)).toBe(1);
  });
});

describe("levels / arena level number (order-independent, never overstates)", () => {
  it("starts at level 1 with nothing cleared", () => {
    expect(arenaLevelNumber([])).toBe(1);
  });
  it("counts cleared milestones, capped at 6", () => {
    expect(arenaLevelNumber(["connect-wallet"])).toBe(2);
    expect(arenaLevelNumber(["connect-wallet", "enter-leaderboard"])).toBe(3);
    expect(
      arenaLevelNumber(LEVELS.map((l) => l.id))
    ).toBe(6);
  });
  it("gates levels sequentially", () => {
    expect(isLevelUnlocked(LEVELS[0], [])).toBe(true);
    expect(isLevelUnlocked(LEVELS[1], [])).toBe(false);
    expect(isLevelUnlocked(LEVELS[1], ["connect-wallet"])).toBe(true);
  });
  it("active level is the first not-yet-completed", () => {
    expect(getActiveLevel([]).id).toBe("connect-wallet");
    expect(getActiveLevel(["connect-wallet"]).id).toBe("first-prediction");
  });
});

describe("formatXp", () => {
  it("compacts large numbers", () => {
    expect(formatXp(500)).toBe("500");
    expect(formatXp(1500)).toBe("1.5K");
    expect(formatXp(2_000_000)).toBe("2.0M");
  });
});
