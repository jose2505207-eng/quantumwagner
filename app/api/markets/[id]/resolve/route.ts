import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { resolveMarketSchema } from "@/server/validators";
import {
  devResolver,
  adminResolver,
  providerResolver,
  applyResolution,
} from "@/server/oracle";
import { getPriceFeedProvider } from "@/server/oracleProviders";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolve a market through the oracle layer. The outcome is never hardcoded —
 * it flows through a resolver (dev/admin) that records the resolution, settles
 * predictions, and updates XP + leaderboard. Admin source requires the key.
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "markets-resolve", 20, 60_000);
    requireAuth(req);
    const { id } = await ctx.params;
    const body = resolveMarketSchema.parse(await req.json());

    // Provider mode derives the outcome from a price feed instead of trusting a
    // caller-supplied outcome. getPriceFeedProvider() returns a real Pyth Hermes
    // provider when ORACLE_PROVIDER=pyth / PYTH_FEED_IDS is set, else the loud
    // StubPriceFeedProvider. Either way, an unconfigured/unmapped symbol throws
    // (e.g. "no feed id configured for SOL/USD"), which the catch below turns
    // into a 400 — provider mode never fabricates a result.
    let resolver;
    if (body.source === "provider") {
      resolver = providerResolver(getPriceFeedProvider(), {
        symbol: body.symbol || "",
        comparator: body.comparator || "gte",
        threshold: body.threshold ?? 0,
      });
    } else if (body.source === "admin") {
      resolver = adminResolver(body.adminKey || "");
    } else {
      resolver = devResolver;
    }

    try {
      const proposal = await resolver.propose({ marketId: id, outcome: body.outcome });
      const resolution = await applyResolution(proposal);
      return ok({ resolution });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "resolution failed", 400);
    }
  }
);
