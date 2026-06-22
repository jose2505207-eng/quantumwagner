import { handler, ok } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The authenticated user's positions (predictions), shaped for the existing
 * portfolio UI (PositionsResponse). Returns real persisted predictions.
 */
export const GET = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const user = await prisma.user.findUnique({ where: { id: claims.sub } });
  const predictions = await prisma.prediction.findMany({
    where: { userId: claims.sub },
    include: { market: true },
    orderBy: { createdAt: "desc" },
  });

  const positions = predictions.map((p) => ({
    id: p.id,
    user_id: p.userId,
    market_id: p.marketId,
    position_type: p.side as "YES" | "NO",
    amount_staked: String(p.amount),
    settled: p.settled,
    stake_tx_hash: p.txSignature ?? "",
    created_at: p.createdAt.toISOString(),
    market: {
      id: p.market.id,
      question: p.market.question,
      category: p.market.category,
      status: p.market.status,
      end_time: p.market.endTime.toISOString(),
      outcome: p.market.outcome,
      pda: p.market.pda ?? "",
      total_volume: String(p.market.yesPool + p.market.noPool),
      yes_pool: String(p.market.yesPool),
      no_pool: String(p.market.noPool),
    },
    user: {
      id: claims.sub,
      username: user?.username ?? null,
      wallet_address: claims.wallet,
      is_verified: true,
    },
    shares_owned: String(p.amount),
    average_price: "0",
    payout_amount: String(p.payout),
    profit_loss: String(p.payout - p.amount),
    settled_at: p.settledAt ? p.settledAt.toISOString() : null,
    payout_tx_hash: null,
  }));

  return ok({ positions });
});
