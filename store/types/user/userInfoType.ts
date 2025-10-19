
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
