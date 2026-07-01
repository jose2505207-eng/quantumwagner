import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { createBattleSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const battles = await prisma.memeBattle.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { entries: true, votes: true } } },
    take: 100,
  });
  return ok({ battles });
});

// POST records an on-chain "create battle" event. Idempotent on the PDA, and —
// like predictions — only persists a signature we actually confirmed on Devnet.
export const POST = handler(async (req: Request) => {
  await rateLimit(req, "battles-create", 10, 60_000);
  const claims = requireAuth(req);
  const body = createBattleSchema.parse(await req.json());

  // Idempotent on the on-chain PDA: a client retry (same created battle) returns
  // the existing row rather than duplicating it.
  if (body.pda) {
    const existing = await prisma.memeBattle.findFirst({ where: { pda: body.pda } });
    if (existing) return ok({ battle: existing, deduped: true });
  }

  // On-chain confirmation gate (Devnet): creating a battle is a real tx.
  const verification = await verifySignature(body.txSignature);
  if (body.txSignature && !verification.confirmed) {
    return fail(
      `Battle not recorded — Devnet transaction not confirmed (${verification.reason}).`,
      409
    );
  }
  if (!body.txSignature && REQUIRE_ONCHAIN) {
    return fail(
      "An on-chain (Devnet) transaction signature is required to create a battle.",
      400
    );
  }

  const battle = await prisma.memeBattle.create({
    data: {
      title: body.title,
      description: body.description,
      sideA: body.sideA,
      sideB: body.sideB,
      pda: body.pda,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: claims.sub,
      kind: "battle",
      amount: 0,
      signature: verification.confirmed ? body.txSignature : null,
      status: verification.confirmed ? "confirmed" : "local-unconfirmed",
      refType: "battle",
      refId: battle.id,
    },
  });

  await logAudit({
    actorId: claims.sub,
    action: "battle.create",
    target: battle.id,
    meta: { signature: body.txSignature ?? null, confirmed: verification.confirmed },
  });

  return ok(
    { battle, onchain: { confirmed: verification.confirmed, status: verification.status ?? null } },
    { status: 201 }
  );
});
