import { prisma } from "@/server/db";
import { awardXp, completeLevelServer } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";

/**
 * Reusable pari-mutuel settlement for a FastBet round.
 *
 * Extracted verbatim from app/api/fast-bets/[id]/resolve/route.ts so both the
 * admin resolve route and the live-feed auto-resolve cron share ONE settlement
 * path — winners split the pool pro-rata to stake, the Level-3 "win-fast-bet"
 * milestone is granted on a player's FIRST win, and the round is marked resolved.
 *
 * Honesty boundary: this function NEVER invents an outcome. The caller supplies
 * the already-derived `outcome` plus a `source` string identifying WHERE it came
 * from ("admin" for a human, "provider:pyth" for the price feed). That source is
 * persisted on the FastBet (resolutionSource) and recorded in the audit log so
 * every settlement is traceable to its origin.
 */
export async function settleFastBet(params: {
  fastBetId: string;
  outcome: "YES" | "NO";
  source: string;
}): Promise<{ resolved: boolean; outcome: "YES" | "NO"; source: string }> {
  const { fastBetId, outcome, source } = params;

  const fastBet = await prisma.fastBet.findUnique({
    where: { id: fastBetId },
    include: { entries: true },
  });
  if (!fastBet) throw new Error("fast bet not found");
  if (fastBet.status === "resolved") throw new Error("already resolved");

  const winners = fastBet.entries.filter((e) => e.side === outcome);
  const winnersStake = winners.reduce((s, e) => s + e.amount, 0);

  for (const e of fastBet.entries) {
    const won = e.side === outcome;
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
    where: { id: fastBetId },
    data: { status: "resolved", outcome, resolutionSource: source },
  });
  await logAudit({ action: "fastbet.resolve", target: fastBetId, meta: { outcome, source } });

  return { resolved: true, outcome, source };
}
