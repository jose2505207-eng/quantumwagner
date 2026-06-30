import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { tokenEventSchema } from "@/server/validators";
import { awardXp } from "@/server/xp";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const XP_BY_ACTION: Record<string, number> = {
  buy: 10,
  sell: 5,
  claim: 0,
  royalties: 0,
};

// POST records an on-chain token event: buy | sell | claim (creator tokens) |
// royalties (creator royalties). `id` may be the token cuid OR the SPL mint.
// Events are logged even if the token isn't in our DB (keyed by mint) — the
// signature is verified on-chain regardless, so we never lose a real action.
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = tokenEventSchema.parse(await req.json());

    const token = await prisma.launchToken.findFirst({
      where: { OR: [{ id }, { mint: id }] },
    });

    const verification = await verifySignature(body.txSignature);
    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Not recorded — Devnet transaction not confirmed (${verification.reason}).`,
        409
      );
    }
    if (!body.txSignature && REQUIRE_ONCHAIN) {
      return fail(
        "An on-chain (Devnet) transaction signature is required.",
        400
      );
    }

    const refId = token?.id ?? id;
    const txn = await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: body.action,
        amount: body.amount,
        signature: verification.confirmed ? body.txSignature : null,
        status: verification.confirmed ? "confirmed" : "local-unconfirmed",
        refType: "launch",
        refId,
      },
    });

    const xp = XP_BY_ACTION[body.action] ?? 0;
    if (xp > 0) {
      await awardXp({
        userId: claims.sub,
        amount: xp,
        reason: `Token ${body.action}`,
        refType: "launch",
        refId,
      });
    }
    await logAudit({
      actorId: claims.sub,
      action: `launch.${body.action}`,
      target: refId,
      meta: { confirmed: verification.confirmed, amount: body.amount },
    });
    return ok({
      recorded: true,
      action: body.action,
      transactionId: txn.id,
      onchain: { confirmed: verification.confirmed },
    });
  }
);
