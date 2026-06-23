import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { voteBattleSchema } from "@/server/validators";
import { awardXp } from "@/server/xp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = voteBattleSchema.parse(await req.json());

    const battle = await prisma.memeBattle.findUnique({ where: { id } });
    if (!battle) return fail("battle not found", 404);

    // One vote per user per battle (unique constraint).
    const existing = await prisma.memeBattleVote.findUnique({
      where: { battleId_userId: { battleId: id, userId: claims.sub } },
    });
    if (existing) return fail("already voted", 409);

    const vote = await prisma.memeBattleVote.create({
      data: { battleId: id, userId: claims.sub, side: body.side },
    });
    await awardXp({
      userId: claims.sub,
      amount: 5,
      reason: "Voted in a meme battle",
      refType: "battle-vote",
      refId: vote.id,
    });
    return ok({ vote }, { status: 201 });
  }
);
