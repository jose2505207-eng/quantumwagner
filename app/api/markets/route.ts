import { handler, ok } from "@/server/http";
import { optionalAuth, requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { serializeMarket } from "@/server/markets";
import { createMarketSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";

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
export const POST = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const body = createMarketSchema.parse(await req.json());
  const market = await prisma.market.create({
    data: {
      question: body.question,
      description: body.description,
      category: body.category,
      endTime: body.endTime,
      pda: body.pda,
      creatorId: claims.sub,
    },
    include: { _count: { select: { predictions: true } } },
  });
  await logAudit({ actorId: claims.sub, action: "market.create", target: market.id });
  return ok({ market: serializeMarket(market) }, { status: 201 });
});
