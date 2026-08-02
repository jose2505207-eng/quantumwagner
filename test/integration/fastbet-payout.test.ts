import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

/**
 * Payout state machine for fast-bet winnings — the part that can lose or
 * duplicate real money.
 *
 * The bug these lock down was found by the devnet E2E: a payout that had
 * FINALIZED on-chain was recorded as a failure (the RPC has no
 * signatureSubscribe, so confirmTransaction timed out), leaving the entry with
 * no signature. The next settlement run would have paid that winner a second
 * time. Sending now persists the signature before confirming, and
 * reconciliation asks the chain what really happened.
 */
// vi.mock is hoisted above imports, so the stub must be created inside it.
vi.mock("@/server/solana", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/solana")>();
  return { ...actual, pollConfirmation: vi.fn() };
});

import { pollConfirmation as pollConfirmationImport } from "@/server/solana";
import { prisma } from "@/server/db";
import { createUser, cleanDb } from "./helpers";
import { reconcilePendingPayouts } from "@/server/fastbetVault";

const pollConfirmation = vi.mocked(pollConfirmationImport);

const SIG = "PAYOUT_SIGNATURE_ABC";

async function makeEntryAwaitingConfirmation() {
  const user = await createUser({ username: "winner" });
  const round = await prisma.fastBet.create({
    data: {
      question: "settled round",
      symbol: "SOL/USD",
      status: "resolved",
      outcome: "YES",
      pool: 2,
      endTime: new Date(Date.now() - 1000),
    },
  });
  const entry = await prisma.fastBetEntry.create({
    data: {
      fastBetId: round.id,
      userId: user.id,
      side: "YES",
      amount: 1,
      won: true,
      payout: 2,
      payoutTxSignature: SIG,
      payoutError: "awaiting confirmation",
    },
  });
  return { user, round, entry };
}

describe("fast-bet payout reconciliation (integration, real db)", () => {
  beforeEach(async () => {
    pollConfirmation.mockReset();
    await prisma.transaction.deleteMany();
    await prisma.fastBetEntry.deleteMany();
    await prisma.fastBet.deleteMany();
    await cleanDb();
  });
  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.$disconnect();
  });

  it("marks a transfer that actually landed as paid, and ledgers it once", async () => {
    const { entry } = await makeEntryAwaitingConfirmation();
    pollConfirmation.mockResolvedValue("confirmed");

    const first = await reconcilePendingPayouts();
    expect(first.settled).toBe(1);

    const updated = await prisma.fastBetEntry.findUnique({ where: { id: entry.id } });
    expect(updated?.payoutTxSignature).toBe(SIG);
    expect(updated?.payoutError).toBeNull();
    expect(await prisma.transaction.count({ where: { signature: SIG } })).toBe(1);

    // Running again must not create a second ledger row or re-pay.
    await reconcilePendingPayouts();
    expect(await prisma.transaction.count({ where: { signature: SIG } })).toBe(1);
  });

  it("frees a definitively failed transfer for retry", async () => {
    const { entry } = await makeEntryAwaitingConfirmation();
    pollConfirmation.mockResolvedValue("failed");

    const result = await reconcilePendingPayouts();
    expect(result.retryable).toBe(1);

    const updated = await prisma.fastBetEntry.findUnique({ where: { id: entry.id } });
    expect(updated?.payoutTxSignature).toBeNull(); // eligible for a fresh send
    expect(updated?.payoutError).toBe("transfer failed on-chain");
  });

  it("keeps an unknown transfer untouched rather than paying twice", async () => {
    const { entry } = await makeEntryAwaitingConfirmation();
    pollConfirmation.mockResolvedValue("pending");

    const result = await reconcilePendingPayouts();
    expect(result.stillPending).toBe(1);

    const updated = await prisma.fastBetEntry.findUnique({ where: { id: entry.id } });
    // Signature retained: a second payout must never be sent on a maybe.
    expect(updated?.payoutTxSignature).toBe(SIG);
    expect(await prisma.transaction.count({ where: { signature: SIG } })).toBe(0);
  });
});
