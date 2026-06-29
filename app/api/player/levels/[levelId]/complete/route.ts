import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { completeLevelServer } from "@/server/xp";
import { LEVEL_BY_ID, isVisitLevel } from "@/lib/game/levels";
import type { LevelId } from "@/lib/game/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Complete a VISIT-based milestone server-side (the honesty boundary).
 *
 * The server is the truth for XP/levels; the local HUD store is only a labelled
 * display. This endpoint closes the Level 6 gap where "enter-leaderboard" was
 * previously completed client-side only.
 *
 * CRITICAL HONESTY GUARD: only genuinely visit-based levels are accepted
 * (allowlist via isVisitLevel). Action milestones — first-prediction,
 * win-fast-bet, join-meme-battle, launch-token — and connect-wallet are
 * rejected here so a visit can never fake an action milestone; those are
 * completed only from their real action/on-chain success handlers.
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ levelId: string }> }) => {
    const claims = requireAuth(req);
    const { levelId } = await ctx.params;

    if (!isVisitLevel(levelId)) {
      return fail("level not completable via visit", 400);
    }

    const lvl = LEVEL_BY_ID[levelId as LevelId];
    if (!lvl) return fail("unknown level", 404);

    const result = await completeLevelServer({
      userId: claims.sub,
      levelId: lvl.id,
      levelNumber: lvl.level,
      levelXp: lvl.xp,
    });

    return ok({ levelId: lvl.id, ...result });
  }
);
