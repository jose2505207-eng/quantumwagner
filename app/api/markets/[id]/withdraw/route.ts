import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { marketTxSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";
import { verifySignature } from "@/server/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST records an on-chain "withdraw winnings" event. The payout amount and
// eligibility are enforced ON-CHAIN; this only logs the withdrawal for the
// user's portfolio/analytics (a value-out we never compute client-side).
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = marketTxSchema.parse(await req.json().catch(() => ({})));

    const market = await prisma.market.findFirst({
      where: { OR: [{ id }, { pda: id }] },
    });
    if (!market) return fail("market not found", 404);

    const verification = await verifySignature(body.txSignature);
    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Withdrawal not recorded — Devnet transaction not confirmed (${verification.reason}).`,
        409
      );
    }

    const txn = await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "claim",
        amount: 0,
        signature: verification.confirmed ? body.txSignature : null,
        status: verification.confirmed ? "confirmed" : "local-unconfirmed",
        refType: "market",
        refId: market.id,
      },
    });
    await logAudit({
      actorId: claims.sub,
      action: "market.withdraw",
      target: market.id,
      meta: { confirmed: verification.confirmed },
    });
    return ok({
      recorded: true,
      transactionId: txn.id,
      onchain: { confirmed: verification.confirmed },
    });
  }
);
