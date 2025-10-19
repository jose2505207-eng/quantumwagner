import { MarketCategory } from "@/app/types";

export type PositionsResponse = {
    data: {
        positions: Position[];
        summary: Summary;
        market_summary: MarketSummary;
        filters: {
            userId: string;
        };
        meta: {
            timestamp: string;
        };
    };
};

export type Position = {
    id: string;
    user_id: string;
    market_id: string;
    position_type: "YES" | "NO";
    amount_staked: string;
    settled: boolean;
    stake_tx_hash: string;
    created_at: string; // ISO date
    market: Market;
    user: User;

    //optional
    shares_owned: string;
    average_price: string;
    payout_amount: string;
    profit_loss: string;
    settled_at: string | null;
    payout_tx_hash: string | null;

};

export type Market = {
    id: string;
    question: string;
    category: string;
    status: "OPEN" | "CLOSED" | "RESOLVED" | string;
    end_time: string; // ISO date
    outcome: string | null;
    pda: string;
    total_volume: string;
    yes_pool: string;
    no_pool: string;
};

export type User = {
    id: string;
    username: string | null;
    wallet_address: string;
    is_verified: boolean;
};

export type Summary = {
    total_positions: number;
    active_positions: number;
    total_value: number;
    total_staked: number;
    profit_loss: number;
    win_rate: number;
};

export type MarketSummary = {
    categories: MarketCategory;
    markets: {
        id: string;
        question: string;
        total_volume: number;
        position_type: "YES" | "NO";
        current_odds: number;
    }[];
};
