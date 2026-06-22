import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { resolveMarketSchema } from "@/server/validators";
import { devResolver, adminResolver, applyResolution } from "@/server/oracle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolve a market through the oracle layer. The outcome is never hardcoded —
 * it flows through a resolver (dev/admin) that records the resolution, settles
 * predictions, and updates XP + leaderboard. Admin source requires the key.
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    requireAuth(req);
    const { id } = await ctx.params;
    const body = resolveMarketSchema.parse(await req.json());

    const resolver =
      body.source === "admin" ? adminResolver(body.adminKey || "") : devResolver;

    try {
      const proposal = await resolver.propose({ marketId: id, outcome: body.outcome });
      const resolution = await applyResolution(proposal);
      return ok({ resolution });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "resolution failed", 400);
    }
  }
);
