import { describe, it, expect } from "vitest";
import {
  deriveBattleLifecycle,
  battleStatusLabel,
  battleTimeLabel,
  canAcceptBets,
} from "@/lib/battleStatus";

/**
 * Regression cover for a reported UI bug: the arena list tagged a battle
 * "UPCOMING" (raw on-chain enum) while its detail page showed a hardcoded
 * "LIVE BATTLE" badge and an "Ends in ... 9 months ago" countdown.
 *
 * The on-chain status enum only advances when a transaction pokes it, so it
 * goes stale. Presentation must derive from the enum AND the clock, and both
 * views must go through this one function or they will disagree again.
 */
const SEC = 1000;
const NOW = 1_700_000_000_000; // fixed clock; no Date.now() in assertions
const past = (s: number) => (NOW - s * SEC) / 1000;
const future = (s: number) => (NOW + s * SEC) / 1000;

describe("lib/battleStatus", () => {
  describe("deriveBattleLifecycle", () => {
    it("reports a stale `upcoming` battle whose end time has passed as ended", () => {
      // The exact reported case: enum never advanced, end time long gone.
      const lifecycle = deriveBattleLifecycle(
        { upcoming: {} },
        past(60 * 60 * 24 * 300),
        past(60 * 60 * 24 * 270),
        NOW
      );
      expect(lifecycle).toBe("ended");
      expect(canAcceptBets(lifecycle)).toBe(false);
    });

    it("treats a started, unexpired battle as live", () => {
      expect(
        deriveBattleLifecycle({ active: {} }, past(3600), future(3600), NOW)
      ).toBe("live");
    });

    it("treats a not-yet-started battle as upcoming", () => {
      expect(
        deriveBattleLifecycle({ upcoming: {} }, future(3600), future(7200), NOW)
      ).toBe("upcoming");
    });

    it("keeps an `active` battle upcoming until its start time arrives", () => {
      // Enum can run ahead of the clock too, not just behind it.
      expect(
        deriveBattleLifecycle({ active: {} }, future(600), future(7200), NOW)
      ).toBe("upcoming");
    });

    it("lets terminal on-chain states win over the clock", () => {
      // A resolved/cancelled battle stays so even inside its original window.
      expect(
        deriveBattleLifecycle({ resolved: {} }, past(3600), future(3600), NOW)
      ).toBe("resolved");
      expect(
        deriveBattleLifecycle({ cancelled: {} }, past(3600), future(3600), NOW)
      ).toBe("cancelled");
    });

    it("treats a resolving battle as ended so it stops taking bets", () => {
      const lifecycle = deriveBattleLifecycle(
        { resolving: {} },
        past(7200),
        past(3600),
        NOW
      );
      expect(lifecycle).toBe("ended");
      expect(canAcceptBets(lifecycle)).toBe(false);
    });

    it("falls back to the enum when timestamps are missing", () => {
      expect(deriveBattleLifecycle({ upcoming: {} }, null, null, NOW)).toBe(
        "upcoming"
      );
      expect(deriveBattleLifecycle({ active: {} }, null, null, NOW)).toBe("live");
    });

    it("accepts BN-like and string timestamps, not just numbers", () => {
      // Decoded anchor accounts hand back BNs; other paths pass strings.
      const bnLike = { toString: () => String(future(3600)) };
      expect(
        deriveBattleLifecycle({ active: {} }, String(past(60)), bnLike, NOW)
      ).toBe("live");
    });
  });

  describe("battleTimeLabel", () => {
    it("says 'Ended' for a past date so the caption matches an 'ago' value", () => {
      // "Ends In / 9 months ago" was the reported contradiction.
      const label = battleTimeLabel(past(60 * 60 * 24 * 270), NOW);
      expect(label.caption).toBe("Ended");
      expect(label.isPast).toBe(true);
    });

    it("says 'Ends In' for a future date", () => {
      const label = battleTimeLabel(future(3600), NOW);
      expect(label.caption).toBe("Ends In");
      expect(label.isPast).toBe(false);
    });
  });

  describe("battleStatusLabel", () => {
    it("never renders the raw 'unknown' enum fallback as a status", () => {
      const labels = (
        ["upcoming", "live", "ended", "resolved", "cancelled"] as const
      ).map(battleStatusLabel);
      expect(labels).toEqual([
        "UPCOMING",
        "LIVE",
        "ENDED",
        "RESOLVED",
        "CANCELLED",
      ]);
    });
  });
});
