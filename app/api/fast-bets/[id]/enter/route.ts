import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { enterFastBetSchema } from "@/server/validators";
import { awardXp } from "@/server/xp";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/rateLimit";
import { REQUIRE_ONCHAIN, verifySolTransfer } from "@/server/solana";
import { vaultAddress } from "@/server/fastbetVault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Rounding slack between the client's SOL float and on-chain lamports. */
const LAMPORT_TOLERANCE = 10_000;

/**
 * Enter a fast-bet round with a REAL stake.
 *
 * The deployed program has no fast-bet instruction, so the stake is a plain SOL
 * transfer into the platform vault (server/fastbetVault.ts). An entry is only
 * recorded once that transfer is verified on Devnet: right recipient, right
 * signer, at least the claimed amount. Winners are paid back out of the same
 * vault when the round settles.
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "fastbets-enter", 30, 60_000);
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = enterFastBetSchema.parse(await req.json());

    const fastBet = await prisma.fastBet.findUnique({ where: { id } });
    if (!fastBet) return fail("fast bet not found", 404);
    if (fastBet.status === "resolved") return fail("fast bet already resolved", 409);
    if (fastBet.endTime.getTime() < Date.now())
      return fail("this round has closed", 409);

    // Idempotency + replay protection: one transfer funds exactly one entry.
    if (body.txSignature) {
      const existing = await prisma.fastBetEntry.findUnique({
        where: { txSignature: body.txSignature },
      });
      if (existing) {
        if (existing.userId !== claims.sub) {
          return fail("this transaction was already used by another wallet", 409);
        }
        return ok({ entry: existing, deduped: true });
      }
    }

    const vault = vaultAddress();
    const lamports = Math.round(body.amount * LAMPORTS_PER_SOL);

    if (REQUIRE_ONCHAIN && !vault) {
      return fail(
        "Fast-bet staking is not configured on this deployment (no vault address). No bet was placed.",
        503
      );
    }

    const verification =
      body.txSignature && vault
        ? await verifySolTransfer({
            signature: body.txSignature,
            signer: claims.wallet,
            recipient: vault,
            minLamports: lamports,
            toleranceLamports: LAMPORT_TOLERANCE,
          })
        : { confirmed: false, reason: "no stake transfer supplied" };

    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Entry not recorded — Devnet stake transfer rejected (${verification.reason}).`,
        409
      );
    }
    if (!body.txSignature && REQUIRE_ONCHAIN) {
      return fail(
        "An on-chain (Devnet) SOL transfer is required to enter a fast bet.",
        400
      );
    }

    const entry = await prisma.fastBetEntry.create({
      data: {
        fastBetId: id,
        userId: claims.sub,
        side: body.side,
        amount: body.amount,
        txSignature: verification.confirmed ? body.txSignature : null,
      },
    });
    await prisma.fastBet.update({
      where: { id },
      data: { pool: fastBet.pool + body.amount },
    });
    await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "fastbet",
        amount: body.amount,
        signature: verification.confirmed ? body.txSignature : null,
        status: verification.confirmed ? "confirmed" : "local-unconfirmed",
        refType: "fastbet",
        refId: entry.id,
      },
    });
    await awardXp({
      userId: claims.sub,
      amount: 15,
      reason: "Entered a fast bet",
      refType: "fastbet",
      refId: entry.id,
    });
    await logAudit({
      actorId: claims.sub,
      action: "fastbet.enter",
      target: entry.id,
      meta: { confirmed: verification.confirmed, lamports },
    });
    return ok({ entry, deduped: false }, { status: 201 });
  }
);
