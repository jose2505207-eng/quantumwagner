import { prisma } from "@/server/db";
import { awardXp, completeLevelServer } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { payFastBetWinners, type PayoutSummary } from "@/server/fastbetVault";

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
  /**
   * Optional settlement context merged into the audit log meta — e.g. the
   * deriving price, the round's startPrice, the price's publishTime, and the
   * capture method ("asof"/"spot"). Persisting WHY a round settled the way it
   * did keeps auto-resolution auditable without a schema change. Pure metadata:
   * it never affects the outcome (which the caller already derived).
   */
  context?: Record<string, unknown>;
}): Promise<{
  resolved: boolean;
  outcome: "YES" | "NO";
  source: string;
  payouts: PayoutSummary;
}> {
  const { fastBetId, outcome, source, context } = params;

  const fastBet = await prisma.fastBet.findUnique({
    where: { id: fastBetId },
    include: { entries: true },
  });
  if (!fastBet) throw new Error("fast bet not found");
  if (fastBet.status === "resolved") throw new Error("already resolved");

  const winners = fastBet.entries.filter((e) => e.side === outcome);
  const winnersStake = winners.reduce((s, e) => s + e.amount, 0);
  // Nobody backed the winning side: there is no one to split the pool between,
  // and the stakes are REAL SOL sitting in the platform vault. Refund every
  // entry its own stake instead of keeping the pool. (`won` stays false — a
  // refund is not a win, so it grants no XP and no milestone.)
  const refundOnly = winnersStake === 0;

  for (const e of fastBet.entries) {
    const won = e.side === outcome;
    const payout = refundOnly
      ? e.amount
      : won
        ? (e.amount / winnersStake) * fastBet.pool
        : 0;
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
        // A player's FIRST fast-bet win grants the Level-3 milestone AND is still a
        // win — pass win:true so profile.wins (and the season leaderboard, synced
        // inside awardXp) increments on the first win, not only on second+ wins.
        await completeLevelServer({
          userId: e.userId,
          levelId: lvl.id,
          levelNumber: lvl.level,
          levelXp: lvl.xp,
          win: true,
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

  // Promote the settlement price + capture method out of the audit-log meta into
  // first-class FastBet columns so the actual price a round settled on is a
  // queryable, UI-renderable value — not just a buried audit detail. Derived from
  // the same `context` the caller already supplies (auto-resolve passes
  // settlePrice/method from captureSettlementPrice); the admin path supplies no
  // price, so both stay null. Honesty boundary: ONLY a real recorded number/string
  // is persisted — anything else is null, never an invented price.
  const settlePrice =
    typeof context?.settlePrice === "number" && Number.isFinite(context.settlePrice)
      ? context.settlePrice
      : null;
  const settleMethod = typeof context?.method === "string" ? context.method : null;

  await prisma.fastBet.update({
    where: { id: fastBetId },
    data: { status: "resolved", outcome, resolutionSource: source, settlePrice, settleMethod },
  });
  await logAudit({
    action: "fastbet.resolve",
    target: fastBetId,
    meta: { outcome, source, ...(context ?? {}) },
  });

  // Move the actual SOL. Settlement and payment live on the SAME path so a
  // round can never be "resolved" in the database while the stakes stay stuck
  // in the vault. payFastBetWinners is idempotent and records its own failures,
  // so a retry (cron rerun) settles the remainder without paying anyone twice.
  const payouts = await payFastBetWinners(fastBetId);

  return { resolved: true, outcome, source, payouts };
}
