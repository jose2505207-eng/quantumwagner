import { describe, it, expect } from "vitest";
import {
  placePredictionSchema,
  resolveMarketSchema,
  createMarketSchema,
  verifyWalletSchema,
} from "@/server/validators";

describe("server-side validation (never trust the client)", () => {
  it("accepts a valid prediction and rejects bad sides/amounts", () => {
    expect(placePredictionSchema.safeParse({ side: "YES", amount: 1 }).success).toBe(true);
    expect(placePredictionSchema.safeParse({ side: "MAYBE", amount: 1 }).success).toBe(false);
    expect(placePredictionSchema.safeParse({ side: "YES", amount: -1 }).success).toBe(false);
    expect(placePredictionSchema.safeParse({ side: "YES", amount: 0 }).success).toBe(false);
  });

  it("only allows YES/NO outcomes on resolution", () => {
    expect(resolveMarketSchema.safeParse({ outcome: "YES" }).success).toBe(true);
    expect(resolveMarketSchema.safeParse({ outcome: "DRAW" }).success).toBe(false);
  });

  it("requires a non-trivial market question", () => {
    expect(
      createMarketSchema.safeParse({ question: "short", endTime: new Date().toISOString() }).success
    ).toBe(false);
    expect(
      createMarketSchema.safeParse({
        question: "Will SOL close above $250 this month?",
        endTime: new Date(Date.now() + 3600e3).toISOString(),
      }).success
    ).toBe(true);
  });

  it("requires all wallet-verify fields", () => {
    expect(verifyWalletSchema.safeParse({ wallet_address: "x".repeat(40) }).success).toBe(false);
  });
});
