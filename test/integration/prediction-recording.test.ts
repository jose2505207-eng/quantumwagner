import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

/**
 * Regression tests for the bet-recording path.
 *
 * The bug this locks down: the frontend recorded ONE on-chain bet through TWO
 * endpoints — `placeBet()` posted lamports to /api/markets/[id]/predictions and
 * the markets page posted the same signature (converted to SOL) to
 * /api/positions/add. Result: two Prediction rows, XP awarded twice, and market
 * pools mixing units so a 0.1 SOL bet added 100,000,000 to the pool.
 *
 * Both endpoints now share `server/predictions.ts`, which de-duplicates on the
 * transaction signature. On-chain verification is stubbed here so the test is
 * deterministic — the verifier itself is covered in test/unit/onchainVerify.
 */
vi.mock("@/server/solana", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/solana")>();
  return {
    ...actual,
    REQUIRE_ONCHAIN: true,
    verifyProgramAction: vi.fn(async () => ({
      confirmed: true,
      slot: 1,
      status: "confirmed",
      signer: "W",
      lamportsCredited: 100_000_000,
    })),
  };
});

import { prisma } from "@/server/db";
import { signToken } from "@/server/auth";
import { createUser, cleanDb } from "./helpers";
import { POST as predict } from "@/app/api/markets/[id]/predictions/route";
import { POST as addPosition } from "@/app/api/positions/add/route";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

function post(url: string, token: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function makeMarket() {
  return prisma.market.create({
    data: {
      question: "Will SOL close above $200?",
      endTime: new Date(Date.now() + 3_600_000),
      pda: "MKT_PDA_ONCHAIN",
    },
  });
}

describe("prediction recording (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await cleanDb();
  });
  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.$disconnect();
  });

  it("records ONE prediction when both endpoints receive the same signature", async () => {
    const user = await createUser({ username: "bettor" });
    const token = signToken({ sub: user.id, wallet: "W" });
    const market = await makeMarket();

    // Path 1: placeBet() → /api/markets/[pda]/predictions, amount in SOL.
    const first = await predict(
      post("http://t/api/markets/MKT_PDA_ONCHAIN/predictions", token, {
        side: "YES",
        amount: 0.1,
        txSignature: "SIG_SAME",
      }),
      ctx("MKT_PDA_ONCHAIN")
    );
    expect(first.status).toBe(201);

    // Path 2: the markets page → /api/positions/add, same tx, amount in lamports.
    const second = await addPosition(
      post("http://t/api/positions/add", token, {
        market_id: market.id,
        position_type: "YES",
        amount_staked: 100_000_000,
        stake_tx_hash: "SIG_SAME",
      })
    );
    expect(second.status).toBe(200);
    expect((await second.json()).data.deduped).toBe(true);

    const predictions = await prisma.prediction.findMany({ where: { userId: user.id } });
    expect(predictions).toHaveLength(1);
    // Stored in SOL — not 100000000.
    expect(predictions[0].amount).toBe(0.1);

    const after = await prisma.market.findUnique({ where: { id: market.id } });
    expect(after?.yesPool).toBe(0.1);
  });

  it("converts lamports to SOL exactly once on /api/positions/add", async () => {
    const user = await createUser({ username: "lamports" });
    const token = signToken({ sub: user.id, wallet: "W" });
    const market = await makeMarket();

    const res = await addPosition(
      post("http://t/api/positions/add", token, {
        market_id: market.id,
        position_type: "NO",
        amount_staked: 250_000_000,
        stake_tx_hash: "SIG_LAMPORTS",
      })
    );
    expect(res.status).toBe(201);

    const row = await prisma.prediction.findFirst({ where: { userId: user.id } });
    expect(row?.amount).toBe(0.25);
    const after = await prisma.market.findUnique({ where: { id: market.id } });
    expect(after?.noPool).toBe(0.25);
  });

  it("awards XP once per bet, not once per endpoint call", async () => {
    const user = await createUser({ username: "xponce" });
    const token = signToken({ sub: user.id, wallet: "W" });
    const market = await makeMarket();

    const body = { side: "YES", amount: 0.5, txSignature: "SIG_XP" };
    await predict(post("http://t/p", token, body), ctx(market.id));
    await predict(post("http://t/p", token, body), ctx(market.id));

    const events = await prisma.xPEvent.findMany({ where: { userId: user.id } });
    expect(events).toHaveLength(1);
  });

  it("refuses a signature already spent by a different wallet", async () => {
    const a = await createUser({ username: "first" });
    const b = await createUser({ username: "second" });
    const market = await makeMarket();

    const r1 = await predict(
      post("http://t/p", signToken({ sub: a.id, wallet: "WA" }), {
        side: "YES",
        amount: 0.2,
        txSignature: "SIG_STOLEN",
      }),
      ctx(market.id)
    );
    expect(r1.status).toBe(201);

    const r2 = await predict(
      post("http://t/p", signToken({ sub: b.id, wallet: "WB" }), {
        side: "NO",
        amount: 0.2,
        txSignature: "SIG_STOLEN",
      }),
      ctx(market.id)
    );
    expect(r2.status).toBe(409);
    expect(await prisma.prediction.count()).toBe(1);
  });
});
