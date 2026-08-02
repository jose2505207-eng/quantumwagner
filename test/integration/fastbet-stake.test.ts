import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

/**
 * Fast bets now move REAL devnet SOL: the stake is a transfer into the platform
 * vault, and winners are paid back out of it. These tests cover the money rules
 * that must never regress — a stake is only recorded when the transfer verifies,
 * one transfer funds one entry, and a round nobody won refunds every stake
 * instead of the platform keeping the pool.
 *
 * The chain call is stubbed; payouts are disabled in tests (see test/setup.ts),
 * so nothing here can spend from the real vault.
 */
vi.mock("@/server/solana", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/solana")>();
  return {
    ...actual,
    REQUIRE_ONCHAIN: true,
    verifySolTransfer: vi.fn(async ({ minLamports }: { minLamports: number }) => ({
      confirmed: true,
      slot: 7,
      status: "confirmed",
      signer: "W",
      lamportsCredited: minLamports,
    })),
  };
});

vi.mock("@/server/fastbetVault", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/fastbetVault")>();
  return {
    ...actual,
    vaultAddress: () => "VaultAddress11111111111111111111111111111111",
  };
});

import { prisma } from "@/server/db";
import { signToken } from "@/server/auth";
import { createUser, cleanDb } from "./helpers";
import { POST as enter } from "@/app/api/fast-bets/[id]/enter/route";
import { settleFastBet } from "@/server/fastbetSettlement";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

function post(token: string, body: unknown): Request {
  return new Request("http://t/api/fast-bets/x/enter", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function makeRound() {
  return prisma.fastBet.create({
    data: {
      question: "Is SOL higher in 5 minutes?",
      symbol: "SOL/USD",
      status: "live",
      endTime: new Date(Date.now() + 300_000),
    },
  });
}

describe("fast-bet staking (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await cleanDb();
  });
  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.$disconnect();
  });

  it("refuses an entry with no on-chain stake transfer", async () => {
    const user = await createUser({ username: "nostake" });
    const round = await makeRound();

    const res = await enter(
      post(signToken({ sub: user.id, wallet: "W" }), { side: "YES", amount: 0.5 }),
      ctx(round.id)
    );

    expect(res.status).toBe(400);
    expect(await prisma.fastBetEntry.count()).toBe(0);
  });

  it("records a verified stake and grows the pool", async () => {
    const user = await createUser({ username: "staker" });
    const round = await makeRound();

    const res = await enter(
      post(signToken({ sub: user.id, wallet: "W" }), {
        side: "YES",
        amount: 0.5,
        txSignature: "STAKE_SIG",
      }),
      ctx(round.id)
    );

    expect(res.status).toBe(201);
    const entry = await prisma.fastBetEntry.findFirst();
    expect(entry?.amount).toBe(0.5);
    expect(entry?.txSignature).toBe("STAKE_SIG");
    const after = await prisma.fastBet.findUnique({ where: { id: round.id } });
    expect(after?.pool).toBe(0.5);
  });

  it("funds exactly one entry per transfer, even if posted twice", async () => {
    const user = await createUser({ username: "retry" });
    const round = await makeRound();
    const body = { side: "YES", amount: 0.25, txSignature: "SAME_TRANSFER" };
    const token = signToken({ sub: user.id, wallet: "W" });

    await enter(post(token, body), ctx(round.id));
    const second = await enter(post(token, body), ctx(round.id));

    expect((await second.json()).data.deduped).toBe(true);
    expect(await prisma.fastBetEntry.count()).toBe(1);
    const after = await prisma.fastBet.findUnique({ where: { id: round.id } });
    expect(after?.pool).toBe(0.25); // not double-counted
  });

  it("refuses a round that has already closed", async () => {
    const user = await createUser({ username: "late" });
    const round = await prisma.fastBet.create({
      data: {
        question: "Closed round",
        symbol: "SOL/USD",
        status: "live",
        endTime: new Date(Date.now() - 1_000),
      },
    });

    const res = await enter(
      post(signToken({ sub: user.id, wallet: "W" }), {
        side: "NO",
        amount: 1,
        txSignature: "TOO_LATE",
      }),
      ctx(round.id)
    );

    expect(res.status).toBe(409);
    expect(await prisma.fastBetEntry.count()).toBe(0);
  });

  it("refunds every stake when nobody backed the winning side", async () => {
    const a = await createUser({ username: "loserA" });
    const b = await createUser({ username: "loserB" });
    const round = await makeRound();
    await prisma.fastBetEntry.createMany({
      data: [
        { fastBetId: round.id, userId: a.id, side: "NO", amount: 1 },
        { fastBetId: round.id, userId: b.id, side: "NO", amount: 3 },
      ],
    });
    await prisma.fastBet.update({ where: { id: round.id }, data: { pool: 4 } });

    // YES wins, but nobody staked YES.
    await settleFastBet({ fastBetId: round.id, outcome: "YES", source: "admin" });

    const entries = await prisma.fastBetEntry.findMany({ where: { fastBetId: round.id } });
    expect(entries.map((e) => e.payout).sort()).toEqual([1, 3]);
    // A refund is not a win: no XP, no milestone.
    expect(entries.every((e) => e.won === false)).toBe(true);
    expect(await prisma.xPEvent.count()).toBe(0);
  });

  it("marks winners as owed when the deployment cannot pay out", async () => {
    const winner = await createUser({ username: "winner" });
    const loser = await createUser({ username: "loser" });
    const round = await makeRound();
    await prisma.fastBetEntry.createMany({
      data: [
        { fastBetId: round.id, userId: winner.id, side: "YES", amount: 1 },
        { fastBetId: round.id, userId: loser.id, side: "NO", amount: 1 },
      ],
    });
    await prisma.fastBet.update({ where: { id: round.id }, data: { pool: 2 } });

    const result = await settleFastBet({
      fastBetId: round.id,
      outcome: "YES",
      source: "admin",
    });

    // Payouts are disabled in tests, so the debt is recorded, never invented as paid.
    expect(result.payouts.paid).toBe(0);
    expect(result.payouts.failed).toBe(1);
    const paidEntry = await prisma.fastBetEntry.findFirst({
      where: { userId: winner.id },
    });
    expect(paidEntry?.payout).toBe(2);
    expect(paidEntry?.payoutTxSignature).toBeNull();
    expect(paidEntry?.payoutError).toBe("vault payout key not configured");
  });
});
