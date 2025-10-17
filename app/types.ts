export interface Market {
    id: string;
    question: string;
    category: string;
    status: string;
    total_volume: string;
    created_at: string;
    end_time: string;
    outcome: outcomeEnum;
    _count: {
        positions: number;
        transactions: number;
    };
    market_type: "BINARY";
    fee_percentage: "0.03";
    tags: "";
    featured: boolean;
    image_url: "";
    pda: string;
    resolution_criteria: string,
    oracle_config: string
    oracle_source: string,
    description: string,
    yes_pool: number;
    no_pool: number;
}

export enum outcomeEnum {
    yes = "yes",
    no = "no    "
}

export enum MarketStatus {
    ACTIVE = "ACTIVE",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED",
}

export enum MarketCategory {
    CRYPTO = "CRYPTO",
    STOCKS = "STOCKS",
    TECHNOLOGY = "TECHNOLOGY",
    GAMING = "GAMING",
    DEFI_EVENTS = "DEFI_EVENTS",
    CELEBRITY_CRYPTO = "CELEBRITY_CRYPTO",
    AI_GAMING = "AI_GAMING",
    MARKET_EVENTS = "MARKET_EVENTS",
}

export const MarketCategoryLabels: Record<MarketCategory, string> = {
    [MarketCategory.CRYPTO]: "Crypto Coins",
    [MarketCategory.STOCKS]: "Stocks",
    [MarketCategory.TECHNOLOGY]: "Technology",
    [MarketCategory.GAMING]: "Gaming",
    [MarketCategory.DEFI_EVENTS]: "DeFi Events",
    [MarketCategory.CELEBRITY_CRYPTO]: "Celebrity Crypto",
    [MarketCategory.AI_GAMING]: "AI & Gaming",
    [MarketCategory.MARKET_EVENTS]: "Market Events",
};

export interface PositoinMarket {
    id: string;
    question: string;
    category: string;
    status: string;
    end_time: string;
    outcome: string | null;
}

export interface Position {
    id: string;
    market_id: string;
    user_id: string;
    amount_staked: number;
    position_type: "YES" | "NO";
    created_at: string;
    stake_tx_hash: string;
    market: PositoinMarket;
}

export interface UserProfile {
    id: string;
    wallet_address: string;
    username: string | null;
    email: string | null;
    reputation_score: number;
    total_volume: string;
    win_rate: string;
    total_predictions: number;
    correct_predictions: number;
    created_at: string;
    is_verified: boolean;
    kyc_level: number;
    referral_code: string | null;
    referred_by: string | null;
    signature_count: number;
    positions: Position[];
}

export interface UserProfileResponse {
    success: boolean;
    message: string;
    user: UserProfile;
}




