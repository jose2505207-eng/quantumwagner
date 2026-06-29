import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { generateFastBetsSchema } from "@/server/validators";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin/cron-driven endpoint that spawns LIVE FastBet rounds so the feed is
 * normally `live` (not demo). A cron hits this on an interval to keep fresh
 * rounds open; it is admin-gated by ADMIN_RESOLUTION_KEY exactly like resolve.
 */
export const POST = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const body = generateFastBetsSchema.parse(await req.json());
  if (body.adminKey !== env.ADMIN_RESOLUTION_KEY) return fail("invalid admin key", 403);

  const symbol = body.symbol;
  const minutes = Math.max(1, Math.round(body.durationSec / 60));
  const now = Date.now();

  const fastBets = [];
  for (let i = 0; i < body.count; i++) {
    const fastBet = await prisma.fastBet.create({
      data: {
        question: `Will ${symbol} be higher in ${minutes}m?`,
        symbol,
        status: "live",
        endTime: new Date(now + body.durationSec * 1000),
        isDemo: false,
      },
    });
    fastBets.push(fastBet);
  }

  await logAudit({
    actorId: claims.sub,
    action: "fastbet.generate",
    meta: { count: fastBets.length, symbol, durationSec: body.durationSec },
  });

  return ok({ created: fastBets.length, fastBets }, { status: 201 });
});
