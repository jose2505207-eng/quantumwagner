import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { resolveBattleSchema } from "@/server/validators";
import { awardXp } from "@/server/xp";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    requireAuth(req);
    const { id } = await ctx.params;
    const body = resolveBattleSchema.parse(await req.json());
    if (body.adminKey !== env.ADMIN_RESOLUTION_KEY) return fail("invalid admin key", 403);

    const battle = await prisma.memeBattle.findUnique({
      where: { id },
      include: { entries: true },
    });
    if (!battle) return fail("battle not found", 404);
    if (battle.status === "RESOLVED") return fail("already resolved", 409);

    for (const e of battle.entries) {
      const won = e.side === body.winner;
      if (won) {
        await awardXp({
          userId: e.userId,
          amount: 80,
          reason: "Won a meme battle",
          refType: "battle",
          refId: e.id,
          win: true,
        });
      }
    }

    await prisma.memeBattle.update({
      where: { id },
      data: { status: "RESOLVED", winner: body.winner },
    });
    await logAudit({ action: "battle.resolve", target: id, meta: { winner: body.winner } });
    return ok({ resolved: true, winner: body.winner });
  }
);
