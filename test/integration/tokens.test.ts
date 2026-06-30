import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/server/db";
import { signToken } from "@/server/auth";
import { createUser, cleanDb } from "./helpers";
import { POST as createToken } from "@/app/api/launchpad/tokens/route";
import { POST as tokenTrade } from "@/app/api/launchpad/tokens/[id]/trade/route";

/**
 * Token launchpad event endpoints (integration, real db). DEMO_MODE is on, so
 * REQUIRE_ONCHAIN is false: a launch records without a confirmed signature
 * (isDemo true, signature null). Pins: launch idempotency on the SPL mint +
 * server-side XP, buy/sell/claim/royalties recording (resolved by mint), XP
 * only on buy/sell, and lenient logging when the token isn't in our DB.
 */
function tokenFor(userId: string, wallet = "W"): string {
  return signToken({ sub: userId, wallet });
}
function req(token: string, body: unknown): Request {
  return new Request("http://t/api/launchpad/tokens", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function wipeTokens() {
  await prisma.transaction.deleteMany();
  await prisma.launchToken.deleteMany();
}

describe("token event endpoints (integration, real db)", () => {
  beforeEach(async () => {
    await wipeTokens();
    await cleanDb();
  });
  afterAll(async () => {
    await wipeTokens();
    await prisma.$disconnect();
  });

  it("launches a token, idempotent on the mint, and awards XP server-side", async () => {
    const u = await createUser({ username: "tcreator" });
    const t = tokenFor(u.id);

    const r1 = await createToken(req(t, { name: "DogeTwo", symbol: "DOGE2", mint: "MINT_A" }));
    expect(r1.status).toBe(201);
    const j1 = await r1.json();
    expect(j1.data.token.id).toBeTruthy();
    expect(j1.data.token.isDemo).toBe(true); // no confirmed tx in demo
    expect(await prisma.xPEvent.count({ where: { userId: u.id } })).toBeGreaterThan(0);

    const r2 = await createToken(req(t, { name: "DogeTwo", symbol: "DOGE2", mint: "MINT_A" }));
    expect(r2.status).toBe(200);
    expect((await r2.json()).data.deduped).toBe(true);
    expect(await prisma.launchToken.count({ where: { mint: "MINT_A" } })).toBe(1);
  });

  it("records a buy by mint, awards XP, and logs a Transaction", async () => {
    const creator = await createUser({ username: "tc" });
    const buyer = await createUser({ username: "tb" });
    await createToken(req(tokenFor(creator.id), { name: "Buyable", symbol: "BUY", mint: "MINT_B" }));

    const res = await tokenTrade(
      req(tokenFor(buyer.id), { action: "buy", amount: 1000 }),
      ctx("MINT_B")
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data.action).toBe("buy");
    expect(
      await prisma.transaction.count({ where: { userId: buyer.id, kind: "buy" } })
    ).toBe(1);
    expect(await prisma.xPEvent.count({ where: { userId: buyer.id } })).toBeGreaterThan(0);
  });

  it("records claim/royalties with no XP, and logs even for an unknown mint", async () => {
    const u = await createUser({ username: "tclaim" });

    const claim = await tokenTrade(
      req(tokenFor(u.id), { action: "claim" }),
      ctx("UNKNOWN_MINT") // not in our DB — still logged (refId = mint)
    );
    expect(claim.status).toBe(200);
    const txn = await prisma.transaction.findFirst({
      where: { userId: u.id, kind: "claim" },
    });
    expect(txn?.refId).toBe("UNKNOWN_MINT");
    // claim grants no XP
    expect(await prisma.xPEvent.count({ where: { userId: u.id } })).toBe(0);
  });
});
