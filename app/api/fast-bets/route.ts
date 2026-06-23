import { handler, ok } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { createFastBetSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const fastBets = await prisma.fastBet.findMany({
    orderBy: { endTime: "asc" },
    include: { _count: { select: { entries: true } } },
    take: 100,
  });
  return ok({ fastBets });
});

export const POST = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const body = createFastBetSchema.parse(await req.json());
  const fastBet = await prisma.fastBet.create({
    data: {
      question: body.question,
      symbol: body.symbol,
      endTime: body.endTime,
      status: "live",
    },
  });
  await logAudit({ actorId: claims.sub, action: "fastbet.create", target: fastBet.id });
  return ok({ fastBet }, { status: 201 });
});
