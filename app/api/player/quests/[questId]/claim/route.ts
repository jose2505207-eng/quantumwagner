import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { ensureQuests, todayKey } from "@/server/quests";
import { awardXp } from "@/server/xp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ questId: string }> }) => {
    const claims = requireAuth(req);
    const { questId } = await ctx.params;
    await ensureQuests();

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest || !quest.active) return fail("quest not found", 404);

    const day = todayKey();
    // Idempotent per day via the unique (userId, questId, day) constraint.
    const existing = await prisma.userQuest.findUnique({
      where: { userId_questId_day: { userId: claims.sub, questId, day } },
    });
    if (existing) return ok({ claimed: true, xp: 0, alreadyClaimed: true });

    await prisma.userQuest.create({
      data: { userId: claims.sub, questId, day },
    });
    await awardXp({
      userId: claims.sub,
      amount: quest.xp,
      reason: `Quest complete: ${quest.title}`,
      refType: "quest",
      refId: quest.id,
    });

    return ok({ claimed: true, xp: quest.xp });
  }
);
