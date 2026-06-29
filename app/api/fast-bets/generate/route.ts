import type { FastBet } from "@prisma/client";
import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { generateFastBetsSchema } from "@/server/validators";
import { getPriceFeedProvider } from "@/server/oracleProviders";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Authorize a scheduled (cron) invocation. Vercel Cron and the GitHub Actions
 * fallback both send `Authorization: Bearer <CRON_SECRET>`. When CRON_SECRET is
 * unset we never authorize a cron request (admin POST remains the only path).
 */
function authorizeCron(req: Request): boolean {
  if (!env.CRON_SECRET) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${env.CRON_SECRET}`;
}

/**
 * Capture a baseline price for a round batch. Fetched ONCE per call and reused
 * for every round (same symbol). Honesty boundary: if the provider is
 * unconfigured or the feed throws, we store startPrice=null and NEVER invent a
 * price — a null-baseline round simply isn't auto-resolvable.
 */
async function captureStartPrice(symbol: string): Promise<number | null> {
  try {
    const provider = getPriceFeedProvider();
    const feed = await provider.getPrice(symbol);
    return feed.price;
  } catch {
    return null;
  }
}

/** Shared round-creation used by both the admin POST and the cron GET paths. */
async function createRounds(
  opts: { symbol: string; count: number; durationSec: number },
  audit: { actorId?: string | null; source: string }
) {
  const { symbol, count, durationSec } = opts;
  const minutes = Math.max(1, Math.round(durationSec / 60));
  const now = Date.now();

  // One baseline price for the whole batch (never invented; may be null).
  const startPrice = await captureStartPrice(symbol);

  const fastBets: FastBet[] = [];
  for (let i = 0; i < count; i++) {
    const fastBet = await prisma.fastBet.create({
      data: {
        question: `Will ${symbol} be higher in ${minutes}m?`,
        symbol,
        status: "live",
        endTime: new Date(now + durationSec * 1000),
        isDemo: false,
        startPrice,
      },
    });
    fastBets.push(fastBet);
  }

  await logAudit({
    actorId: audit.actorId ?? null,
    action: "fastbet.generate",
    meta: { count: fastBets.length, symbol, durationSec, source: audit.source },
  });

  return fastBets;
}

/**
 * Admin/cron-driven endpoint that spawns LIVE FastBet rounds so the feed is
 * normally `live` (not demo). A cron hits this on an interval to keep fresh
 * rounds open; it is admin-gated by ADMIN_RESOLUTION_KEY exactly like resolve.
 */
export const POST = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const body = generateFastBetsSchema.parse(await req.json());
  if (body.adminKey !== env.ADMIN_RESOLUTION_KEY) return fail("invalid admin key", 403);

  const fastBets = await createRounds(
    { symbol: body.symbol, count: body.count, durationSec: body.durationSec },
    { actorId: claims.sub, source: "admin" }
  );

  return ok({ created: fastBets.length, fastBets }, { status: 201 });
});

/**
 * Vercel Cron path (GET-only). Authorized via CRON_SECRET; creates rounds using
 * the validator DEFAULTS so the scheduler keeps fresh live rounds open with zero
 * body. Falls back to 403 when the cron secret is absent/mismatched.
 */
export const GET = handler(async (req: Request) => {
  if (!authorizeCron(req)) return fail("unauthorized", 403);

  // Mirror generateFastBetsSchema defaults (symbol/count/durationSec).
  const defaults = generateFastBetsSchema.parse({ adminKey: env.ADMIN_RESOLUTION_KEY });
  const fastBets = await createRounds(
    { symbol: defaults.symbol, count: defaults.count, durationSec: defaults.durationSec },
    { actorId: null, source: "cron" }
  );

  return ok({ created: fastBets.length, fastBets }, { status: 201 });
});
