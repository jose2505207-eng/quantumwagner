import { describe, it, expect } from "vitest";
import {
  placePredictionSchema,
  resolveMarketSchema,
  joinBattleSchema,
} from "@/server/validators";

/**
 * The zod validators are the first server-side gate on untrusted client input.
 * A loosened bound here lets the frontend smuggle a bad stake/side straight
 * into the settlement math, so these bounds are load-bearing.
 */
describe("server/validators", () => {
  describe("placePredictionSchema", () => {
    it("accepts a valid YES bet with a positive amount", () => {
      const parsed = placePredictionSchema.parse({ side: "YES", amount: 100 });
      expect(parsed.side).toBe("YES");
      expect(parsed.amount).toBe(100);
    });

    it("accepts NO and coerces a numeric string amount", () => {
      const parsed = placePredictionSchema.parse({ side: "NO", amount: "250" });
      expect(parsed.side).toBe("NO");
      expect(parsed.amount).toBe(250);
    });

    it("accepts the maximum amount of 1,000,000", () => {
      expect(placePredictionSchema.parse({ side: "YES", amount: 1_000_000 }).amount).toBe(1_000_000);
    });

    it("rejects a negative amount", () => {
      expect(() => placePredictionSchema.parse({ side: "YES", amount: -1 })).toThrow();
    });

    it("rejects zero (must be positive)", () => {
      expect(() => placePredictionSchema.parse({ side: "YES", amount: 0 })).toThrow();
    });

    it("rejects an amount over the 1,000,000 cap (overflow guard)", () => {
      expect(() => placePredictionSchema.parse({ side: "YES", amount: 1_000_001 })).toThrow();
    });

    it("rejects an invalid side", () => {
      expect(() => placePredictionSchema.parse({ side: "MAYBE", amount: 10 })).toThrow();
    });
  });

  describe("resolveMarketSchema", () => {
    it("defaults the source to admin", () => {
      expect(resolveMarketSchema.parse({ outcome: "YES" }).source).toBe("admin");
    });

    it("rejects an unknown outcome", () => {
      expect(() => resolveMarketSchema.parse({ outcome: "DRAW" })).toThrow();
    });
  });

  describe("joinBattleSchema", () => {
    it("accepts A/B sides", () => {
      expect(joinBattleSchema.parse({ side: "A", amount: 5 }).side).toBe("A");
    });

    it("rejects a YES/NO side (battles use A/B)", () => {
      expect(() => joinBattleSchema.parse({ side: "YES", amount: 5 })).toThrow();
    });
  });
});
