import { describe, it, expect } from "vitest";
import { getRank, getNextRank, rankProgress, RANKS } from "@/lib/game/ranks";

/**
 * The rank ladder drives every "what rank am I" UI and the XP authority layer
 * (xp.ts persists `getRank(newXp).id`). Boundary bugs here silently mis-rank
 * every player, so we pin the exact thresholds.
 */
describe("lib/game/ranks", () => {
  describe("getRank", () => {
    it("returns unranked at 0 xp and below the first threshold", () => {
      expect(getRank(0).id).toBe("unranked");
      expect(getRank(249).id).toBe("unranked");
    });

    it("promotes exactly at each threshold (inclusive lower bound)", () => {
      expect(getRank(250).id).toBe("rookie");
      expect(getRank(750).id).toBe("signal-hunter");
      expect(getRank(1500).id).toBe("market-mage");
      expect(getRank(3000).id).toBe("quantum-shark");
      expect(getRank(6000).id).toBe("oracle");
      expect(getRank(12000).id).toBe("arena-legend");
    });

    it("stays at the previous rank one xp below a threshold", () => {
      expect(getRank(749).id).toBe("rookie");
      expect(getRank(11999).id).toBe("oracle");
    });

    it("caps at the top rank for arbitrarily large xp", () => {
      expect(getRank(1_000_000).id).toBe("arena-legend");
    });
  });

  describe("getNextRank", () => {
    it("returns the next rank above current xp", () => {
      expect(getNextRank(0)?.id).toBe("rookie");
      expect(getNextRank(250)?.id).toBe("signal-hunter");
      expect(getNextRank(11999)?.id).toBe("arena-legend");
    });

    it("returns null once the top rank is reached", () => {
      expect(getNextRank(12000)).toBeNull();
      expect(getNextRank(50000)).toBeNull();
    });
  });

  describe("rankProgress", () => {
    it("is 0 at a rank floor", () => {
      expect(rankProgress(250)).toBe(0);
    });

    it("is the fractional position between current and next floor", () => {
      // rookie floor 250, next signal-hunter floor 750 -> span 500.
      expect(rankProgress(500)).toBeCloseTo((500 - 250) / 500, 10);
    });

    it("clamps to 1 at the top rank (no next rank)", () => {
      expect(rankProgress(12000)).toBe(1);
      expect(rankProgress(99999)).toBe(1);
    });

    it("never returns outside [0, 1]", () => {
      for (const r of RANKS) {
        const p = rankProgress(r.minXp + 1);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    });
  });
});
