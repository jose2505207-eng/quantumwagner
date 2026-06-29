import { handler, ok, fail } from "@/server/http";
import { env } from "@/server/env";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ops/debug probe: GET /api/oracle/settle-stats
 *
 * Summarizes the `settleMethod` distribution across RESOLVED fast-bets so
 * operators can quantify oracle-history reliability: how often auto-resolve
 * settled on the price AS OF endTime ("asof" — the fair outcome) vs the weaker
 * "spot-fallback" / "spot" paths. Admin-gated by ADMIN_RESOLUTION_KEY (no JWT —
 * this is a bare ops probe, the admin key is the gate). The key is accepted via
 * the `x-admin-key` header OR an `?adminKey=` query param.
 *
 * Honesty doctrine: this reports ONLY real recorded values from the DB and
 * NEVER fabricates a distribution. A null `settleMethod` (admin / unresolved
 * settle path) is reported honestly in its own `unrecorded` bucket — it is never
 * coerced into a real method. `asofShare` quantifies reliability (a higher asof
 * share means more rounds settled fairly on the as-of-endTime price); when there
 * are zero resolved rounds we have measured nothing, so `asofShare` is `null`
 * (NOT 0 — we never report 0% as if it were measured).
 */
export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);

  const adminKey = req.headers.get("x-admin-key") ?? url.searchParams.get("adminKey");
  if (adminKey !== env.ADMIN_RESOLUTION_KEY) return fail("invalid admin key", 403);

  const [methodGroups, sourceGroups] = await Promise.all([
    prisma.fastBet.groupBy({
      by: ["settleMethod"],
      where: { status: "resolved" },
      _count: { _all: true },
    }),
    prisma.fastBet.groupBy({
      by: ["resolutionSource"],
      where: { status: "resolved" },
      _count: { _all: true },
    }),
  ]);

  // Fixed-key method buckets so the shape is stable; null -> "unrecorded".
  const byMethod = { asof: 0, "spot-fallback": 0, spot: 0, unrecorded: 0 } as Record<
    "asof" | "spot-fallback" | "spot" | "unrecorded",
    number
  >;
  for (const g of methodGroups) {
    const n = g._count._all;
    if (g.settleMethod === null) byMethod.unrecorded += n;
    else if (g.settleMethod === "asof") byMethod.asof += n;
    else if (g.settleMethod === "spot-fallback") byMethod["spot-fallback"] += n;
    else if (g.settleMethod === "spot") byMethod.spot += n;
    else byMethod.unrecorded += n; // unknown recorded value -> still honest, bucketed as unrecorded
  }

  // Dynamic source keys straight from the data; null source -> "unrecorded".
  const bySource: Record<string, number> = {};
  for (const g of sourceGroups) {
    const key = g.resolutionSource ?? "unrecorded";
    bySource[key] = (bySource[key] ?? 0) + g._count._all;
  }

  const totalResolved =
    byMethod.asof + byMethod["spot-fallback"] + byMethod.spot + byMethod.unrecorded;

  // Honesty: with nothing measured, asofShare is null (never reported as 0%).
  const asofShare =
    totalResolved > 0 ? Math.round((byMethod.asof / totalResolved) * 10000) / 10000 : null;

  return ok({ totalResolved, byMethod, bySource, asofShare });
});
