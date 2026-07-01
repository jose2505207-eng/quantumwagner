import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { createTokenSchema } from "@/server/validators";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const tokens = await prisma.launchToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok({ tokens });
});

export const POST = handler(async (req: Request) => {
  await rateLimit(req, "launchpad-create", 10, 60_000);
  const claims = requireAuth(req);
  const body = createTokenSchema.parse(await req.json());

  // Idempotent on the SPL mint (client retry returns the existing row).
  if (body.mint) {
    const existing = await prisma.launchToken.findFirst({ where: { mint: body.mint } });
    if (existing) return ok({ token: existing, deduped: true });
  }

  // On-chain confirmation gate (Devnet): a launched token is a real tx.
  const verification = await verifySignature(body.txSignature);
  if (body.txSignature && !verification.confirmed) {
    return fail(
      `Token not recorded — Devnet transaction not confirmed (${verification.reason}).`,
      409
    );
  }
  if (!body.txSignature && REQUIRE_ONCHAIN) {
    return fail(
      "An on-chain (Devnet) transaction signature is required to launch a token.",
      400
    );
  }

  const isFirst =
    (await prisma.launchToken.count({ where: { creatorId: claims.sub } })) === 0;

  const token = await prisma.launchToken.create({
    data: {
      name: body.name,
      symbol: body.symbol,
      description: body.description,
      imageUri: body.imageUri,
      totalSupply: body.totalSupply,
      mint: body.mint,
      txSignature: verification.confirmed ? body.txSignature : null,
      isDemo: !verification.confirmed,
      creatorId: claims.sub,
    },
  });
  await prisma.transaction.create({
    data: {
      userId: claims.sub,
      kind: "launch",
      signature: verification.confirmed ? body.txSignature : null,
      status: verification.confirmed ? "confirmed" : "local-unconfirmed",
      refType: "launch",
      refId: token.id,
    },
  });

  // Level 5 milestone (launch token).
  if (isFirst) {
    const lvl = LEVEL_BY_ID["launch-token"];
    await completeLevelServer({
      userId: claims.sub,
      levelId: lvl.id,
      levelNumber: lvl.level,
      levelXp: lvl.xp,
    });
  } else {
    await awardXp({
      userId: claims.sub,
      amount: 50,
      reason: "Launched a token",
      refType: "launch",
      refId: token.id,
    });
  }

  await logAudit({ actorId: claims.sub, action: "launch.create", target: token.id });
  return ok({ token }, { status: 201 });
});
