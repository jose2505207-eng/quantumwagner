/**
 * DEMO seed markets — clearly isolated.
 *
 * These are NOT real markets. They are only ever shown when:
 *   1. DEMO_MODE is on, AND
 *   2. the live backend returned zero markets.
 * Every demo market carries `isDemo: true` so the UI can label it with a
 * <DemoBadge/>. Never merge these silently into live data.
 */
import { Market, outcomeEnum } from "@/app/types";

export type DemoMarket = Market & { isDemo: true };

const days = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

function demo(
  id: string,
  question: string,
  category: string,
  yes: number,
  no: number,
  volume: string,
  endInDays: number,
  featured = false
): DemoMarket {
  return {
    id,
    question,
    category,
    status: "ACTIVE",
    total_volume: volume,
    created_at: new Date().toISOString(),
    end_time: days(endInDays),
    outcome: outcomeEnum.yes,
    _count: { positions: Math.round(yes / 500), transactions: Math.round((yes + no) / 200) },
    market_type: "BINARY",
    fee_percentage: "0.03",
    tags: "",
    featured,
    image_url: "",
    pda: `demo-${id}`,
    resolution_criteria: "Demo market — resolution is illustrative only.",
    oracle_config: "demo",
    oracle_source: "demo",
    description: "Seed/demo market shown because no live markets were returned.",
    yes_pool: yes,
    no_pool: no,
    isDemo: true,
  };
}

export const DEMO_MARKETS: DemoMarket[] = [
  demo("demo-1", "Will SOL close above $250 this month?", "CRYPTO", 62000, 38000, "$1.2M", 12, true),
  demo("demo-2", "Will this meme coin 10x before it rugs?", "CELEBRITY_CRYPTO", 41000, 59000, "$640K", 5, true),
  demo("demo-3", "Will BTC make a new ATH this quarter?", "CRYPTO", 71000, 29000, "$3.1M", 40, true),
  demo("demo-4", "Will the next Fed meeting cut rates?", "MARKET_EVENTS", 55000, 45000, "$2.4M", 6),
  demo("demo-5", "Will a new AI model top the leaderboard this week?", "AI_GAMING", 48000, 52000, "$420K", 4),
  demo("demo-6", "Will ETH flip its previous high in 2026?", "CRYPTO", 33000, 67000, "$900K", 120),
];
