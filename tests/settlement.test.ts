import { describe, it, expect } from "vitest";
import { computePayout, settle } from "@/server/settlement";

describe("computePayout (pari-mutuel)", () => {
  it("pays the whole pool to a sole winner", () => {
    expect(computePayout(10, 10, 100)).toBe(100);
  });

  it("splits pro-rata among winners", () => {
    // two winners 30/70 of a 100-winner-stake pool, total 200
    expect(computePayout(30, 100, 200)).toBeCloseTo(60);
    expect(computePayout(70, 100, 200)).toBeCloseTo(140);
  });

  it("returns 0 when there are no winners", () => {
    expect(computePayout(10, 0, 100)).toBe(0);
  });

  it("returns 0 for non-positive stake/pool", () => {
    expect(computePayout(0, 10, 100)).toBe(0);
    expect(computePayout(10, 10, 0)).toBe(0);
    expect(computePayout(-5, 10, 100)).toBe(0);
  });

  it("never lets a single stake exceed the winners pool", () => {
    expect(computePayout(20, 10, 100)).toBe(0);
  });
});

describe("settle", () => {
  it("conserves the total pool across winners", () => {
    const stakes = [
      { id: "a", side: "YES", amount: 30 },
      { id: "b", side: "YES", amount: 70 },
      { id: "c", side: "NO", amount: 50 },
    ];
    const res = settle(stakes, "YES");
    const totalPaid = res.reduce((s, r) => s + r.payout, 0);
    expect(totalPaid).toBeCloseTo(150); // entire pool 30+70+50
    expect(res.find((r) => r.id === "c")!.won).toBe(false);
    expect(res.find((r) => r.id === "c")!.payout).toBe(0);
  });

  it("pays nobody when no stake matches the winning side", () => {
    const res = settle([{ id: "a", side: "YES", amount: 10 }], "NO");
    expect(res[0].payout).toBe(0);
    expect(res[0].won).toBe(false);
  });
});
