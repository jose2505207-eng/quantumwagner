import { handler, ok } from "@/server/http";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real platform statistics.
 *
 * Several screens advertised hardcoded figures — "$2.4M+ total volume",
 * "8,924 active traders", "156 active markets", "89.2% accuracy" — none of
 * which came from anywhere. Everything here is counted from persisted, on-chain
 * backed activity, so an empty deployment honestly reports zeros.
 */
export const GET = handler(async () => {
  const [
    predictions,
    fastBetEntries,
    battleEntries,
    activeMarkets,
    resolvedMarkets,
    openRounds,
    battles,
    tokens,
    traders,
  ] = await Promise.all([
    prisma.prediction.findMany({ select: { amount: true, won: true, settled: true } }),
    prisma.fastBetEntry.findMany({ select: { amount: true } }),
    prisma.memeBattleEntry.findMany({ select: { amount: true } }),
    prisma.market.count({ where: { status: "ACTIVE" } }),
    prisma.market.count({ where: { status: "RESOLVED" } }),
    prisma.fastBet.count({ where: { NOT: { status: "resolved" } } }),
    prisma.memeBattle.count(),
    prisma.launchToken.count(),
    prisma.user.count(),
  ]);

  const sum = (rows: { amount: number }[]) =>
    rows.reduce((total, row) => total + row.amount, 0);

  const settled = predictions.filter((p) => p.settled);
  const correct = settled.filter((p) => p.won === true).length;

  return ok({
    // All volumes are SOL, staked through real confirmed transactions.
    totalVolumeSol: sum(predictions) + sum(fastBetEntries) + sum(battleEntries),
    marketVolumeSol: sum(predictions),
    fastBetVolumeSol: sum(fastBetEntries),
    battleVolumeSol: sum(battleEntries),
    traders,
    activeMarkets,
    resolvedMarkets,
    openFastBetRounds: openRounds,
    battles,
    tokensLaunched: tokens,
    totalPredictions: predictions.length,
    // Null rather than a flattering default when nothing has settled yet.
    accuracyPercent: settled.length > 0 ? (correct / settled.length) * 100 : null,
  });
});
