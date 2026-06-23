import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { z } from "zod";
import { awardXp, completeLevelServer } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  outcome: z.enum(["YES", "NO"]),
  adminKey: z.string(),
});

/**
 * Resolve a fast bet (admin-gated). Settles entries pari-mutuel, awards XP, and
 * grants the Level 3 milestone ("win a fast bet") on a player's FIRST win.
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    requireAuth(req);
    const { id } = await ctx.params;
    const body = schema.parse(await req.json());
    if (body.adminKey !== env.ADMIN_RESOLUTION_KEY) return fail("invalid admin key", 403);

    const fastBet = await prisma.fastBet.findUnique({
      where: { id },
      include: { entries: true },
    });
    if (!fastBet) return fail("fast bet not found", 404);
    if (fastBet.status === "resolved") return fail("already resolved", 409);

    const winners = fastBet.entries.filter((e) => e.side === body.outcome);
    const winnersStake = winners.reduce((s, e) => s + e.amount, 0);

    for (const e of fastBet.entries) {
      const won = e.side === body.outcome;
      const payout = won && winnersStake > 0 ? (e.amount / winnersStake) * fastBet.pool : 0;
      await prisma.fastBetEntry.update({
        where: { id: e.id },
        data: { won, payout },
      });
      if (won) {
        const priorWins = await prisma.fastBetEntry.count({
          where: { userId: e.userId, won: true, NOT: { id: e.id } },
        });
        if (priorWins === 0) {
          const lvl = LEVEL_BY_ID["win-fast-bet"];
          await completeLevelServer({
            userId: e.userId,
            levelId: lvl.id,
            levelNumber: lvl.level,
            levelXp: lvl.xp,
          });
        } else {
          await awardXp({
            userId: e.userId,
            amount: 60,
            reason: "Won a fast bet",
            refType: "fastbet",
            refId: e.id,
            win: true,
          });
        }
      }
    }

    await prisma.fastBet.update({
      where: { id },
      data: { status: "resolved", outcome: body.outcome },
    });
    await logAudit({ action: "fastbet.resolve", target: id, meta: { outcome: body.outcome } });
    return ok({ resolved: true, outcome: body.outcome });
  }
);
