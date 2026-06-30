import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { marketTxSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";
import { verifySignature } from "@/server/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST records an on-chain "cancel market" event. Creator-only (matches the
// on-chain authority). Soft-verified: a provided signature is checked and only
// stored if confirmed, but cancelling a demo/off-chain market needs no tx.
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = marketTxSchema.parse(await req.json().catch(() => ({})));

    const market = await prisma.market.findFirst({
      where: { OR: [{ id }, { pda: id }] },
    });
    if (!market) return fail("market not found", 404);
    if (market.creatorId && market.creatorId !== claims.sub) {
      return fail("only the market creator can cancel it", 403);
    }
    if (market.status === "RESOLVED") return fail("market already resolved", 409);
    if (market.status === "CANCELLED") {
      return ok({ market, alreadyCancelled: true });
    }

    const verification = await verifySignature(body.txSignature);
    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Cancel not recorded — Devnet transaction not confirmed (${verification.reason}).`,
        409
      );
    }

    const updated = await prisma.market.update({
      where: { id: market.id },
      data: { status: "CANCELLED" },
    });
    if (verification.confirmed) {
      await prisma.transaction.create({
        data: {
          userId: claims.sub,
          kind: "cancel",
          amount: 0,
          signature: body.txSignature,
          status: "confirmed",
          refType: "market",
          refId: market.id,
        },
      });
    }
    await logAudit({
      actorId: claims.sub,
      action: "market.cancel",
      target: market.id,
      meta: { confirmed: verification.confirmed },
    });
    return ok({ market: updated, onchain: { confirmed: verification.confirmed } });
  }
);
