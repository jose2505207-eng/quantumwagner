/**
 * The fast-bet SOL vault (Devnet).
 *
 * The deployed program has no fast-bet instruction, so a round's stakes cannot
 * live in a PDA. Instead players transfer SOL to a platform vault address and
 * the server pays winners back out of it after the round settles. That makes
 * fast bets real money movement rather than a database number — at the cost of
 * a hot key, which is why this is Devnet-only and guarded accordingly.
 *
 * Two levels of configuration:
 *  - FASTBET_VAULT_ADDRESS  → stakes can be verified (deposits work)
 *  - FASTBET_VAULT_SECRET   → payouts can be sent too (full loop)
 * With neither set, fast-bet staking is reported as unavailable and the UI says
 * so instead of pretending a bet was placed.
 */
import { readFileSync } from "node:fs";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { prisma } from "@/server/db";
import { pollConfirmation, solanaConnection } from "@/server/solana";
import { logAudit } from "@/server/audit";

let cachedKeypair: Keypair | null | undefined;

/**
 * Parse the vault secret. Accepts a JSON byte array (the `solana-keygen`
 * format, inline or as a file path) — the same shape the devnet scripts use.
 */
function loadVaultKeypair(): Keypair | null {
  if (cachedKeypair !== undefined) return cachedKeypair;

  // Never sign a real transfer from a test run: the local .env points at a
  // funded devnet vault, and settlement runs inside the test suite.
  if (process.env.NODE_ENV === "test" && process.env.ALLOW_TEST_PAYOUTS !== "true") {
    cachedKeypair = null;
    return null;
  }

  const raw = process.env.FASTBET_VAULT_SECRET?.trim();
  if (!raw) {
    cachedKeypair = null;
    return null;
  }
  try {
    const json = raw.startsWith("[") ? raw : readFileSync(raw, "utf8");
    const bytes = JSON.parse(json) as number[];
    if (!Array.isArray(bytes) || (bytes.length !== 64 && bytes.length !== 32)) {
      throw new Error("not a 32/64-byte secret key array");
    }
    cachedKeypair = Keypair.fromSecretKey(Uint8Array.from(bytes));
  } catch (e) {
    // Never fall back to an invented key — payouts simply stay disabled.
    console.error(
      "FASTBET_VAULT_SECRET is set but unusable; fast-bet payouts are disabled:",
      e instanceof Error ? e.message : e
    );
    cachedKeypair = null;
  }
  return cachedKeypair;
}

/** Vault address stakes must be sent to, or null when staking is unconfigured. */
export function vaultAddress(): string | null {
  const explicit = process.env.FASTBET_VAULT_ADDRESS?.trim();
  if (explicit) {
    try {
      return new PublicKey(explicit).toBase58();
    } catch {
      console.error(`FASTBET_VAULT_ADDRESS is not a valid pubkey: ${explicit}`);
      return null;
    }
  }
  return loadVaultKeypair()?.publicKey.toBase58() ?? null;
}

/** True when the server can actually send winnings back out of the vault. */
export function canPayout(): boolean {
  const keypair = loadVaultKeypair();
  if (!keypair) return false;
  const address = vaultAddress();
  // A vault we cannot sign for can take deposits but must never be advertised
  // as payable.
  return address === keypair.publicKey.toBase58();
}

/**
 * Decide the fate of payouts that were sent but never confirmed.
 *
 * A transfer whose confirmation timed out may well have landed (this is exactly
 * what happened with the websocket-less devnet RPC: finalized transfers were
 * reported as failures). Asking the chain is the only honest way to tell:
 *  - confirmed on-chain → mark it paid, ledger the transaction, never re-send
 *  - failed / never landed → clear the signature so the next run pays properly
 *  - still unknown → leave it alone and look again next time
 */
export async function reconcilePendingPayouts(fastBetId?: string): Promise<{
  settled: number;
  retryable: number;
  stillPending: number;
}> {
  const result = { settled: 0, retryable: 0, stillPending: 0 };
  const pending = await prisma.fastBetEntry.findMany({
    where: {
      ...(fastBetId ? { fastBetId } : {}),
      payoutTxSignature: { not: null },
      payoutError: { not: null },
    },
  });

  for (const entry of pending) {
    const signature = entry.payoutTxSignature!;
    const state = await pollConfirmation(signature, { timeoutMs: 4_000, intervalMs: 1_000 });

    if (state === "confirmed") {
      await prisma.fastBetEntry.update({
        where: { id: entry.id },
        data: { payoutError: null },
      });
      // Ledger it once — a re-run must not create a duplicate row.
      const already = await prisma.transaction.findFirst({ where: { signature } });
      if (!already) {
        await prisma.transaction.create({
          data: {
            userId: entry.userId,
            kind: "claim",
            amount: entry.payout,
            signature,
            status: "confirmed",
            refType: "fastbet",
            refId: entry.id,
          },
        });
      }
      result.settled += 1;
    } else if (state === "failed") {
      await prisma.fastBetEntry.update({
        where: { id: entry.id },
        data: { payoutTxSignature: null, payoutError: "transfer failed on-chain" },
      });
      result.retryable += 1;
    } else {
      result.stillPending += 1;
    }
  }

  if (result.settled || result.retryable) {
    await logAudit({
      action: "fastbet.payout.reconcile",
      target: fastBetId ?? "all",
      meta: { ...result },
    });
  }
  return result;
}

export interface PayoutSummary {
  paid: number;
  failed: number;
  skipped: number;
  totalSol: number;
}

/**
 * Pay every unpaid winner of a settled round from the vault.
 *
 * Paying real money twice is the worst failure here, so the ordering is:
 * SEND → PERSIST THE SIGNATURE → confirm. A signature is recorded before we
 * know the outcome, because a crash (or a confirmation that merely times out)
 * between send and write would otherwise leave a landed transfer invisible and
 * the next run would pay again. Entries carrying a signature are never re-sent;
 * `reconcilePendingPayouts` decides their fate by asking the chain.
 */
export async function payFastBetWinners(fastBetId: string): Promise<PayoutSummary> {
  const summary: PayoutSummary = { paid: 0, failed: 0, skipped: 0, totalSol: 0 };

  // First settle the fate of anything sent by an earlier run.
  await reconcilePendingPayouts(fastBetId);

  const keypair = loadVaultKeypair();
  const entries = await prisma.fastBetEntry.findMany({
    where: { fastBetId, payout: { gt: 0 }, payoutTxSignature: null },
    include: { user: true },
  });
  if (entries.length === 0) return summary;

  if (!keypair) {
    // Be loud: the round is settled but the money cannot move.
    await prisma.fastBetEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { payoutError: "vault payout key not configured" },
    });
    await logAudit({
      action: "fastbet.payout.unconfigured",
      target: fastBetId,
      meta: { owed: entries.length },
    });
    summary.failed = entries.length;
    return summary;
  }

  const connection = solanaConnection();

  for (const entry of entries) {
    const lamports = Math.floor(entry.payout * LAMPORTS_PER_SOL);
    if (lamports <= 0) {
      summary.skipped += 1;
      continue;
    }

    let signature: string | null = null;
    try {
      const recipient = new PublicKey(entry.user.walletAddress);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: recipient,
          lamports,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = keypair.publicKey;
      tx.sign(keypair);

      signature = await connection.sendRawTransaction(tx.serialize(), {
        preflightCommitment: "confirmed",
      });

      // Persist BEFORE confirming — see the note above.
      await prisma.fastBetEntry.update({
        where: { id: entry.id },
        data: { payoutTxSignature: signature, payoutError: "awaiting confirmation" },
      });

      // Poll instead of subscribing: the authenticated devnet RPC has no
      // signatureSubscribe, and confirmTransaction() reported real, finalized
      // payouts as failures because of it.
      const state = await pollConfirmation(signature);
      if (state === "failed") {
        // The transfer definitively did not happen — clear the signature so a
        // later run retries it.
        await prisma.fastBetEntry.update({
          where: { id: entry.id },
          data: { payoutTxSignature: null, payoutError: "transfer failed on-chain" },
        });
        summary.failed += 1;
        continue;
      }
      if (state === "pending") {
        // Unknown: keep the signature, let reconciliation resolve it later.
        summary.failed += 1;
        continue;
      }

      await prisma.fastBetEntry.update({
        where: { id: entry.id },
        data: { payoutError: null },
      });
      await prisma.transaction.create({
        data: {
          userId: entry.userId,
          kind: "claim",
          amount: entry.payout,
          signature,
          status: "confirmed",
          refType: "fastbet",
          refId: entry.id,
        },
      });
      summary.paid += 1;
      summary.totalSol += entry.payout;
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      await prisma.fastBetEntry.update({
        where: { id: entry.id },
        // Keep any signature we managed to send: never re-pay blindly.
        data: { payoutError: message },
      });
      summary.failed += 1;
    }
  }

  await logAudit({
    action: "fastbet.payout",
    target: fastBetId,
    meta: { ...summary },
  });
  return summary;
}
