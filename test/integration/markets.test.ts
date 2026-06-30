import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { signToken } from "@/server/auth";
import { createUser, cleanDb } from "./helpers";
import { POST as createMarket } from "@/app/api/markets/route";
import { POST as predict } from "@/app/api/markets/[id]/predictions/route";
import { POST as cancelMarket } from "@/app/api/markets/[id]/cancel/route";
import { POST as withdraw } from "@/app/api/markets/[id]/withdraw/route";

/**
 * Market event endpoints (integration, real db). DEMO_MODE is on in tests, so
 * REQUIRE_ONCHAIN is false. Market CREATION is soft-verified (off-chain admin
 * markets allowed → isDemo true with no confirmed tx); placing a bet awards XP
 * server-side; cancel is creator-only; withdraw logs a claim Transaction.
 * Everything resolves a market by cuid OR on-chain pda.
 */
function tokenFor(userId: string, wallet = "W"): string {
  return signToken({ sub: userId, wallet });
}
function req(token: string, body: unknown): Request {
  return new Request("http://t/api/markets", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const futureISO = () => new Date(Date.now() + 3_600_000).toISOString();

describe("market event endpoints (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await cleanDb(); // wipes predictions + markets
  });
  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.$disconnect();
  });

  it("creates an off-chain market (isDemo) and is idempotent on the pda", async () => {
    const u = await createUser({ username: "mcreator" });
    const t = tokenFor(u.id);

    const r1 = await createMarket(
      req(t, { question: "Will BTC top 100k this week?", endTime: futureISO(), pda: "MKT_PDA" })
    );
    expect(r1.status).toBe(201);
    const j1 = await r1.json();
    expect(j1.data.market.id).toBeTruthy();
    // no confirmed tx => demo market
    const row = await prisma.market.findFirst({ where: { pda: "MKT_PDA" } });
    expect(row?.isDemo).toBe(true);

    const r2 = await createMarket(
      req(t, { question: "Will BTC top 100k this week?", endTime: futureISO(), pda: "MKT_PDA" })
    );
    expect(r2.status).toBe(200);
    expect((await r2.json()).data.deduped).toBe(true);
    expect(await prisma.market.count({ where: { pda: "MKT_PDA" } })).toBe(1);
  });

  it("records a bet by PDA, updates the pool, and awards XP server-side", async () => {
    const creator = await createUser({ username: "mc" });
    const better = await createUser({ username: "mb" });
    await createMarket(
      req(tokenFor(creator.id), { question: "ETH above 4k by Friday?", endTime: futureISO(), pda: "MKT_BET" })
    );

    const res = await predict(
      req(tokenFor(better.id), { side: "YES", amount: 100 }),
      ctx("MKT_BET") // resolve by pda
    );
    expect(res.status).toBe(201);

    const market = await prisma.market.findFirst({ where: { pda: "MKT_BET" } });
    expect(market?.yesPool).toBe(100);
    const xp = await prisma.xPEvent.count({ where: { userId: better.id } });
    expect(xp).toBeGreaterThan(0);
  });

  it("cancel is creator-only and flips the market to CANCELLED", async () => {
    const creator = await createUser({ username: "mc2" });
    const other = await createUser({ username: "other" });
    await createMarket(
      req(tokenFor(creator.id), { question: "Doge to a dollar in 2026?", endTime: futureISO(), pda: "MKT_CAN" })
    );

    const denied = await cancelMarket(req(tokenFor(other.id), {}), ctx("MKT_CAN"));
    expect(denied.status).toBe(403);

    const okRes = await cancelMarket(req(tokenFor(creator.id), {}), ctx("MKT_CAN"));
    expect(okRes.status).toBe(200);
    const market = await prisma.market.findFirst({ where: { pda: "MKT_CAN" } });
    expect(market?.status).toBe("CANCELLED");
  });

  it("withdraw logs a claim Transaction for the user", async () => {
    const creator = await createUser({ username: "mc3" });
    const winner = await createUser({ username: "winner" });
    await createMarket(
      req(tokenFor(creator.id), { question: "SOL flips ETH this cycle?", endTime: futureISO(), pda: "MKT_W" })
    );

    const res = await withdraw(req(tokenFor(winner.id), {}), ctx("MKT_W"));
    expect(res.status).toBe(200);
    const claims = await prisma.transaction.count({
      where: { userId: winner.id, kind: "claim" },
    });
    expect(claims).toBe(1);
  });
});
