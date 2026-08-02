/**
 * Single source of truth for recording a prediction from a REAL on-chain stake.
 *
 * Two endpoints accept a bet (`/api/markets/[id]/predictions`, keyed by market
 * id or PDA, and `/api/positions/add`, the markets UI payload). They used to
 * duplicate this logic, and the frontend called BOTH for one bet — producing two
 * prediction rows, double XP, and pools polluted with mixed units (lamports from
 * one path, SOL from the other). Everything now funnels through here:
 *
 *  - amounts are SOL everywhere (never lamports) — the callers convert once
 *  - a signature already recorded returns the existing row instead of a new one
 *  - the transaction is verified in depth (real `place_bet` on our program, by
 *    this wallet, crediting this market's PDA with at least this stake)
 */
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { prisma } from "@/server/db";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { REQUIRE_ONCHAIN, verifyProgramAction } from "@/server/solana";
import type { Prediction } from "@prisma/client";

/** Rounding slack between the client's SOL float and on-chain lamports. */
const LAMPORT_TOLERANCE = 10_000;

export type RecordPredictionResult =
  | {
      ok: true;
      prediction: Prediction;
      firstPrediction: boolean;
      deduped: boolean;
      onchain: { confirmed: boolean; slot?: number | null; status?: string | null };
    }
  | { ok: false; error: string; status: number };

export async function recordPrediction(params: {
  /** Market cuid or on-chain PDA — the frontend has whichever is handy. */
  marketRef: string;
  userId: string;
  wallet: string;
  side: "YES" | "NO";
  /** Stake in SOL. Callers holding lamports must divide before calling. */
  amountSol: number;
  txSignature?: string;
}): Promise<RecordPredictionResult> {
  const { marketRef, userId, wallet, side, amountSol, txSignature } = params;

  const market = await prisma.market.findFirst({
    where: { OR: [{ id: marketRef }, { pda: marketRef }] },
  });
  if (!market) return { ok: false, error: "market not found", status: 404 };
  if (market.status !== "ACTIVE")
    return { ok: false, error: "market is not active", status: 409 };
  if (market.endTime.getTime() < Date.now())
    return { ok: false, error: "market has ended", status: 409 };

  // Idempotency + replay protection. One on-chain stake is one prediction: a
  // retry (or a second endpoint being called for the same bet) returns the row
  // that already exists, and a signature spent by another user is refused.
  if (txSignature) {
    const existing = await prisma.prediction.findUnique({ where: { txSignature } });
    if (existing) {
      if (existing.userId !== userId) {
        return {
          ok: false,
          error: "this transaction was already used by another wallet",
          status: 409,
        };
      }
      return {
        ok: true,
        prediction: existing,
        firstPrediction: false,
        deduped: true,
        onchain: { confirmed: true, status: "confirmed" },
      };
    }
  }

  // ---- Deep on-chain gate ------------------------------------------------
  // Not just "did the signature confirm" — it must be a `place_bet` call to our
  // program, signed by THIS wallet, that moved at least this stake into THIS
  // market's PDA. Anything less is refused with the concrete reason.
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  const verification = txSignature
    ? await verifyProgramAction({
        signature: txSignature,
        instruction: "place_bet",
        signer: wallet,
        creditedAccount: market.pda ?? undefined,
        minLamports: lamports,
        toleranceLamports: LAMPORT_TOLERANCE,
      })
    : { confirmed: false, reason: "no transaction signature supplied" };

  if (txSignature && !verification.confirmed) {
    return {
      ok: false,
      error: `Bet not recorded — Devnet transaction rejected (${verification.reason}).`,
      status: 409,
    };
  }
  if (!txSignature && REQUIRE_ONCHAIN) {
    return {
      ok: false,
      error: "An on-chain (Devnet) transaction is required to place a bet.",
      status: 400,
    };
  }

  const isFirst = (await prisma.prediction.count({ where: { userId } })) === 0;

  const prediction = await prisma.prediction.create({
    data: {
      marketId: market.id,
      userId,
      side,
      amount: amountSol,
      txSignature: verification.confirmed ? txSignature : null,
    },
  });

  await prisma.market.update({
    where: { id: market.id },
    data:
      side === "YES"
        ? { yesPool: market.yesPool + amountSol }
        : { noPool: market.noPool + amountSol },
  });

  await prisma.transaction.create({
    data: {
      userId,
      kind: "prediction",
      amount: amountSol,
      signature: verification.confirmed ? txSignature : null,
      status: verification.confirmed ? "confirmed" : "local-unconfirmed",
      refType: "prediction",
      refId: prediction.id,
    },
  });

  if (isFirst) {
    const lvl = LEVEL_BY_ID["first-prediction"];
    await completeLevelServer({
      userId,
      levelId: lvl.id,
      levelNumber: lvl.level,
      levelXp: lvl.xp,
    });
  } else {
    await awardXp({
      userId,
      amount: 20,
      reason: "Placed a prediction",
      refType: "prediction",
      refId: prediction.id,
    });
  }

  await logAudit({
    actorId: userId,
    action: "prediction.place",
    target: prediction.id,
    meta: {
      signature: txSignature ?? null,
      confirmed: verification.confirmed,
      slot: verification.slot ?? null,
      lamports,
    },
  });

  return {
    ok: true,
    prediction,
    firstPrediction: isFirst,
    deduped: false,
    onchain: {
      confirmed: verification.confirmed,
      slot: verification.slot ?? null,
      status: verification.status ?? null,
    },
  };
}
