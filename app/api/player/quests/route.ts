import { handler, ok } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { ensureQuests, todayKey } from "@/server/quests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request) => {
  const claims = requireAuth(req);
  await ensureQuests();
  const day = todayKey();

  const [quests, claimed] = await Promise.all([
    prisma.quest.findMany({ where: { active: true } }),
    prisma.userQuest.findMany({ where: { userId: claims.sub, day } }),
  ]);
  const claimedIds = new Set(claimed.map((c) => c.questId));

  return ok({
    day,
    quests: quests.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      xp: q.xp,
      kind: q.kind,
      claimed: claimedIds.has(q.id),
    })),
  });
});
