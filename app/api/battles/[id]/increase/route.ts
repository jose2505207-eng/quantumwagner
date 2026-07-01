import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { increaseBattleSchema } from "@/server/validators";
import { awardXp } from "@/server/xp";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST records an on-chain "increase battle position" event: the on-chain
// instruction adds to an existing position (side is fixed), so we bump the
// caller's existing entry amount rather than creating a new participant row.
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "battles-increase", 30, 60_000);
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = increaseBattleSchema.parse(await req.json());

    const battle = await prisma.memeBattle.findFirst({
      where: { OR: [{ id }, { pda: id }] },
    });
    if (!battle) return fail("battle not found", 404);
    if (battle.status === "RESOLVED") return fail("battle already resolved", 409);

    // You can only increase a position you already hold (matches on-chain).
    const existing = await prisma.memeBattleEntry.findFirst({
      where: { battleId: battle.id, userId: claims.sub },
      orderBy: { createdAt: "desc" },
    });
    if (!existing) {
      return fail("no existing position to increase — enter the battle first", 409);
    }

    // On-chain confirmation gate (Devnet) — same policy as join/predictions.
    const verification = await verifySignature(body.txSignature);
    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Increase not recorded — Devnet transaction not confirmed (${verification.reason}).`,
        409
      );
    }
    if (!body.txSignature && REQUIRE_ONCHAIN) {
      return fail(
        "An on-chain (Devnet) transaction signature is required to increase a position.",
        400
      );
    }

    const entry = await prisma.memeBattleEntry.update({
      where: { id: existing.id },
      data: { amount: existing.amount + body.amount },
    });
    await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "battle",
        amount: body.amount,
        signature: verification.confirmed ? body.txSignature : null,
        status: verification.confirmed ? "confirmed" : "local-unconfirmed",
        refType: "battle",
        refId: entry.id,
      },
    });
    await awardXp({
      userId: claims.sub,
      amount: 10,
      reason: "Increased a battle position",
      refType: "battle",
      refId: entry.id,
    });
    await logAudit({
      actorId: claims.sub,
      action: "battle.increase",
      target: entry.id,
      meta: { added: body.amount, confirmed: verification.confirmed },
    });
    return ok({
      entry,
      added: body.amount,
      onchain: { confirmed: verification.confirmed },
    });
  }
);
