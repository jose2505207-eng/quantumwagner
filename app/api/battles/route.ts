import { handler, ok } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { createBattleSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";

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

export const POST = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const body = createBattleSchema.parse(await req.json());
  const battle = await prisma.memeBattle.create({
    data: {
      title: body.title,
      description: body.description,
      sideA: body.sideA,
      sideB: body.sideB,
      pda: body.pda,
    },
  });
  await logAudit({ actorId: claims.sub, action: "battle.create", target: battle.id });
  return ok({ battle }, { status: 201 });
});
