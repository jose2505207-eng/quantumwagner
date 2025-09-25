export interface Market {
    id: string;
    question: string;
    category: string;
    status: string;
    total_volume: string;
    created_at: string;
    end_time: string;
    _count: {
        positions: number;
        transactions: number;
    };
    market_type: "BINARY";
    fee_percentage: "0.03";
    tags: "";
    featured: false;
    image_url: "";
    resolution_criteria: string,
    oracle_config: string
    oracle_source: string,
    description: string
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
