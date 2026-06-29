import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { GET } from "@/app/api/oracle/settle-stats/route";

/**
 * Admin-gated ops probe: GET /api/oracle/settle-stats
 * (app/api/oracle/settle-stats/route.ts).
 *
 * Pins the honesty boundary of the settleMethod analytics: ONLY resolved rounds
 * are counted, a null settleMethod is reported in its own `unrecorded` bucket
 * (never coerced into a real method), and `asofShare` is null when nothing has
 * been measured — never a fabricated 0%. Runs against a real Postgres
 * (quantum_test). cleanDb() does not touch FastBet/FastBetEntry, so we wipe
 * those directly (entries before fastBets). FastBet rows carry no required user
 * FK, so we seed them with prisma.fastBet.create.
 */
describe("settle-stats ops probe (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
  });

  afterAll(async () => {
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await prisma.$disconnect();
  });

  async function seedMix() {
    const rows = [
      { method: "asof", source: "provider:pyth" },
      { method: "asof", source: "provider:pyth" },
      { method: "spot-fallback", source: "provider:pyth" },
      { method: "spot", source: "provider:pyth" },
      { method: null, source: "admin" }, // resolved by admin, no recorded method
    ] as const;
    for (const r of rows) {
      await prisma.fastBet.create({
        data: {
          question: "q",
          endTime: new Date(),
          status: "resolved",
          outcome: "YES",
          settleMethod: r.method,
          resolutionSource: r.source,
        },
      });
    }
    // A non-resolved live round that MUST be excluded from every count.
    await prisma.fastBet.create({
      data: {
        question: "live one",
        endTime: new Date(),
        status: "live",
        settleMethod: "asof",
        resolutionSource: "provider:pyth",
      },
    });
  }

  it("summarizes resolved settleMethod distribution honestly", async () => {
    await seedMix();

    const res = await GET(
      new Request("http://t/api/oracle/settle-stats?adminKey=test-admin-key")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const { totalResolved, byMethod, bySource, asofShare } = body.data;
    // 5 resolved rows; the live round is excluded.
    expect(totalResolved).toBe(5);
    expect(byMethod.asof).toBe(2);
    expect(byMethod["spot-fallback"]).toBe(1);
    expect(byMethod.spot).toBe(1);
    expect(byMethod.unrecorded).toBe(1); // null settleMethod
    // bySource carries dynamic keys from the data.
    expect(bySource["provider:pyth"]).toBe(4);
    expect(bySource.admin).toBe(1);
    // asofShare = 2/5 = 0.4 (4-decimal rounded).
    expect(asofShare).toBe(0.4);
  });

  it("reports asofShare as null (not 0) when there are zero resolved rounds", async () => {
    // beforeEach already wiped FastBet — nothing measured.
    const res = await GET(
      new Request("http://t/api/oracle/settle-stats?adminKey=test-admin-key")
    );
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.totalResolved).toBe(0);
    expect(body.data.asofShare).toBeNull();
    expect(body.data.byMethod).toEqual({
      asof: 0,
      "spot-fallback": 0,
      spot: 0,
      unrecorded: 0,
    });
  });

  it("rejects a wrong admin key with 403", async () => {
    const res = await GET(
      new Request("http://t/api/oracle/settle-stats?adminKey=wrong")
    );
    expect(res.status).toBe(403);
  });

  it("rejects a missing admin key with 403", async () => {
    const res = await GET(new Request("http://t/api/oracle/settle-stats"));
    expect(res.status).toBe(403);
  });
});
