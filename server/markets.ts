import type { Market as DbMarket, Prediction, User } from "@prisma/client";

type MarketWithCounts = DbMarket & {
  predictions?: Prediction[];
  _count?: { predictions: number };
  creator?: User | null;
};

/** Serialize a DB market into the shape the frontend Market type expects. */
export function serializeMarket(m: MarketWithCounts) {
  const positions = m._count?.predictions ?? m.predictions?.length ?? 0;
  return {
    // Present only when the caller `include`d the creator relation; a market may
    // also legitimately have no creator (off-chain / admin-created markets).
    creator: m.creator
      ? {
          id: m.creator.id,
          username: m.creator.username,
          wallet_address: m.creator.walletAddress,
        }
      : undefined,
    id: m.id,
    question: m.question,
    description: m.description,
    category: m.category,
    status: m.status,
    outcome: m.outcome,
    yes_pool: m.yesPool,
    no_pool: m.noPool,
    total_volume: String(m.yesPool + m.noPool),
    end_time: m.endTime.toISOString(),
    created_at: m.createdAt.toISOString(),
    pda: m.pda ?? "",
    market_type: "BINARY",
    fee_percentage: "0.03",
    tags: "",
    featured: false,
    image_url: "",
    resolution_criteria: "",
    oracle_config: "",
    oracle_source: "",
    isDemo: m.isDemo,
    _count: { positions, transactions: positions },
  };
}
