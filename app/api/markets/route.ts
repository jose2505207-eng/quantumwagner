import { handler, ok, fail } from "@/server/http";
import { optionalAuth, requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { serializeMarket } from "@/server/markets";
import { createMarketSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";
import { verifySignature } from "@/server/solana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/markets — list markets (newest first).
export const GET = handler(async (req: Request) => {
  optionalAuth(req);
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { predictions: true } } },
    take: 100,
  });
  return ok({ markets: markets.map(serializeMarket) });
});

// POST /api/markets — create a market (auth required).
//
// Dual-path by design: the admin UI creates OFF-CHAIN (demo) markets, while the
// on-chain `initMarket` records a real one with a pda + txSignature. So this is
// SOFT-verified: a provided signature is checked on-chain (and never stored
// unless it confirmed), but a signature is NOT hard-required — that would break
// admin/off-chain creation. The value action (placing a bet) hard-requires it.
export const POST = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const body = createMarketSchema.parse(await req.json());

  // Idempotent on the on-chain PDA (client retry returns the existing row).
  if (body.pda) {
    const existing = await prisma.market.findFirst({
      where: { pda: body.pda },
      include: { _count: { select: { predictions: true } } },
    });
    if (existing) return ok({ market: serializeMarket(existing), deduped: true });
  }

  const verification = await verifySignature(body.txSignature);
  if (body.txSignature && !verification.confirmed) {
    return fail(
      `Market not recorded — Devnet transaction not confirmed (${verification.reason}).`,
      409
    );
  }

  const market = await prisma.market.create({
    data: {
      question: body.question,
      description: body.description,
      category: body.category,
      endTime: body.endTime,
      pda: body.pda,
      creatorId: claims.sub,
      // Off-chain (no confirmed tx) markets are demo; an on-chain one is not.
      isDemo: !verification.confirmed,
    },
    include: { _count: { select: { predictions: true } } },
  });

  if (verification.confirmed) {
    await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "market",
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
    action: "market.create",
    target: market.id,
    meta: { confirmed: verification.confirmed, pda: body.pda ?? null },
  });
  return ok(
    { market: serializeMarket(market), onchain: { confirmed: verification.confirmed } },
    { status: 201 }
  );
});
