import { handler, ok, fail } from "@/server/http";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { getPriceFeedProvider } from "@/server/oracleProviders";
import { settleFastBet } from "@/server/fastbetSettlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Authorize a scheduled (cron) invocation. Vercel Cron (GET) and the GitHub
 * Actions fallback (POST) both send `Authorization: Bearer <CRON_SECRET>`. When
 * CRON_SECRET is unset we never authorize a cron request.
 */
function authorizeCron(req: Request): boolean {
  if (!env.CRON_SECRET) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${env.CRON_SECRET}`;
}

/**
 * Auto-resolve EXPIRED live rounds honestly from the price feed.
 *
 * Honesty boundary: the outcome is DERIVED from the provider — currentPrice vs
 * the round's captured startPrice — never invented. Every settlement records
 * source "provider:pyth". Any round whose price can't be fetched (provider
 * unconfigured/unmapped/HTTP error) is SKIPPED and left unresolved rather than
 * resolved off a fabricated price.
 */
async function runAutoResolve() {
  const now = new Date();
  const rounds = await prisma.fastBet.findMany({
    where: {
      status: { in: ["live", "closing-soon"] },
      endTime: { lte: now },
      startPrice: { not: null },
      symbol: { not: "" },
    },
  });

  const provider = getPriceFeedProvider();
  const resolved: string[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const round of rounds) {
    // startPrice is guaranteed non-null by the query, but narrow for TS.
    if (round.startPrice === null) {
      skipped.push({ id: round.id, reason: "no start price" });
      continue;
    }
    let currentPrice: number;
    try {
      const feed = await provider.getPrice(round.symbol);
      currentPrice = feed.price;
    } catch (e) {
      // Never invent a price — leave this round unresolved for a later run.
      skipped.push({ id: round.id, reason: e instanceof Error ? e.message : "price fetch failed" });
      continue;
    }

    // Outcome derived strictly from the feed vs the captured baseline.
    const outcome: "YES" | "NO" = currentPrice > round.startPrice ? "YES" : "NO";
    try {
      await settleFastBet({ fastBetId: round.id, outcome, source: "provider:pyth" });
      resolved.push(round.id);
    } catch (e) {
      // e.g. a concurrent settle marked it resolved between query and settle.
      skipped.push({ id: round.id, reason: e instanceof Error ? e.message : "settle failed" });
    }
  }

  return { resolved, skipped };
}

/**
 * Read an admin key from header `x-admin-key` or a JSON body `adminKey`.
 * Tolerates an empty/non-JSON body (returns null).
 */
async function readAdminKey(req: Request): Promise<string | null> {
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey) return headerKey;
  try {
    const body = (await req.json()) as { adminKey?: unknown };
    return typeof body?.adminKey === "string" ? body.adminKey : null;
  } catch {
    return null;
  }
}

/** Vercel Cron path (GET): authorized via CRON_SECRET only. */
export const GET = handler(async (req: Request) => {
  if (!authorizeCron(req)) return fail("unauthorized", 403);
  const result = await runAutoResolve();
  return ok(result);
});

/** GitHub Actions / admin path (POST): cron Bearer OR admin key. */
export const POST = handler(async (req: Request) => {
  let authorized = authorizeCron(req);
  if (!authorized) {
    const adminKey = await readAdminKey(req);
    authorized = adminKey !== null && adminKey === env.ADMIN_RESOLUTION_KEY;
  }
  if (!authorized) return fail("unauthorized", 403);
  const result = await runAutoResolve();
  return ok(result);
});
