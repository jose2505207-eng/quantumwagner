import { prisma } from "./db";

/** Find or create a user (and profile, wallet, streak) for a wallet address. */
export async function getOrCreateUserByWallet(walletAddress: string) {
  const existing = await prisma.user.findUnique({
    where: { walletAddress },
    include: { profile: true },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      walletAddress,
      wallets: { create: { address: walletAddress } },
      profile: { create: {} },
      streak: { create: {} },
    },
    include: { profile: true },
  });
}

/**
 * Build a user-profile payload compatible with the existing frontend store
 * (UserProfileResponse). Derives stats from real persisted data.
 */
export async function serializeUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      predictions: { include: { market: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) return null;

  const total = user.predictions.length;
  const correct = user.predictions.filter((p) => p.won === true).length;
  const winRate = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";

  return {
    success: true,
    message: "ok",
    user: {
      id: user.id,
      wallet_address: user.walletAddress,
      username: user.username,
      email: null,
      reputation_score: user.profile?.xp ?? 0,
      total_volume: "0",
      win_rate: winRate,
      total_predictions: total,
      correct_predictions: correct,
      created_at: user.createdAt.toISOString(),
      is_verified: true,
      kyc_level: 0,
      referral_code: null,
      referred_by: null,
      signature_count: 0,
      xp: user.profile?.xp ?? 0,
      rank_id: user.profile?.rankId ?? "unranked",
      level: user.profile?.level ?? 1,
      completed_levels: JSON.parse(user.profile?.completedLevels || "[]"),
      positions: user.predictions.map((p) => ({
        id: p.id,
        market_id: p.marketId,
        user_id: p.userId,
        amount_staked: p.amount,
        position_type: p.side,
        created_at: p.createdAt.toISOString(),
        stake_tx_hash: p.txSignature ?? "",
        market: {
          id: p.market.id,
          question: p.market.question,
          category: p.market.category,
          status: p.market.status,
          end_time: p.market.endTime.toISOString(),
          outcome: p.market.outcome,
        },
      })),
    },
  };
}

/** Get (or lazily create) the active leaderboard season. */
export async function getActiveSeason() {
  const active = await prisma.leaderboardSeason.findFirst({
    where: { active: true },
    orderBy: { startsAt: "desc" },
  });
  if (active) return active;
  return prisma.leaderboardSeason.create({
    data: { name: "Season 1" },
  });
}
