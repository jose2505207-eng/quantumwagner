import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { joinBattleSchema } from "@/server/validators";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { verifySignature, REQUIRE_ONCHAIN } from "@/server/solana";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "battles-join", 30, 60_000);
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = joinBattleSchema.parse(await req.json());

    // The frontend works in on-chain PDAs; the backend keys on cuid. Accept either.
    const battle = await prisma.memeBattle.findFirst({
      where: { OR: [{ id }, { pda: id }] },
    });
    if (!battle) return fail("battle not found", 404);
    if (battle.status === "RESOLVED") return fail("battle already resolved", 409);

    // On-chain confirmation gate (Devnet) — identical policy to predictions:
    // verify a provided signature; require one in devnet/prod; allow unconfirmed
    // (clearly labelled) only in demo.
    const verification = await verifySignature(body.txSignature);
    if (body.txSignature && !verification.confirmed) {
      return fail(
        `Entry not recorded — Devnet transaction not confirmed (${verification.reason}).`,
        409
      );
    }
    if (!body.txSignature && REQUIRE_ONCHAIN) {
      return fail(
        "An on-chain (Devnet) transaction signature is required to enter a battle.",
        400
      );
    }

    const isFirst =
      (await prisma.memeBattleEntry.count({ where: { userId: claims.sub } })) === 0;

    const entry = await prisma.memeBattleEntry.create({
      data: {
        battleId: battle.id,
        userId: claims.sub,
        side: body.side,
        amount: body.amount,
        txSignature: verification.confirmed ? body.txSignature : null,
      },
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

    // Level 4 milestone (join meme battle) — real action, server-authoritative.
    if (isFirst) {
      const lvl = LEVEL_BY_ID["join-meme-battle"];
      await completeLevelServer({
        userId: claims.sub,
        levelId: lvl.id,
        levelNumber: lvl.level,
        levelXp: lvl.xp,
      });
    } else {
      await awardXp({
        userId: claims.sub,
        amount: 25,
        reason: "Joined a meme battle",
        refType: "battle",
        refId: entry.id,
      });
    }

    await logAudit({
      actorId: claims.sub,
      action: "battle.join",
      target: entry.id,
      meta: { confirmed: verification.confirmed, slot: verification.slot ?? null },
    });
    return ok(
      { entry, firstBattle: isFirst, onchain: { confirmed: verification.confirmed } },
      { status: 201 }
    );
  }
);
