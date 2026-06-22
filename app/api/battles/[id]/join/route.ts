import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { joinBattleSchema } from "@/server/validators";
import { completeLevelServer, awardXp } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = joinBattleSchema.parse(await req.json());

    const battle = await prisma.memeBattle.findUnique({ where: { id } });
    if (!battle) return fail("battle not found", 404);
    if (battle.status === "RESOLVED") return fail("battle already resolved", 409);

    const isFirst =
      (await prisma.memeBattleEntry.count({ where: { userId: claims.sub } })) === 0;

    const entry = await prisma.memeBattleEntry.create({
      data: {
        battleId: id,
        userId: claims.sub,
        side: body.side,
        amount: body.amount,
        txSignature: body.txSignature,
      },
    });
    await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "battle",
        amount: body.amount,
        signature: body.txSignature,
        refType: "battle",
        refId: entry.id,
      },
    });

    // Level 4 milestone (join meme battle) — real action.
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

    await logAudit({ actorId: claims.sub, action: "battle.join", target: entry.id });
    return ok({ entry, firstBattle: isFirst }, { status: 201 });
  }
);
