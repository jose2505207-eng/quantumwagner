
export interface U {
    "id": string;
    "wallet_address": string;
    "username": string | null;
    "role": RoleEnum;
    "reputation_score": number;
    "total_volume": number;
    "win_rate": number;
    "total_predictions": number;
    "correct_predictions": number;
    "is_verified": boolean;
    "created_at": Date;
    "last_active": Date;
    "_count": {
        "positions": number;
        "created_markets": number;
    }
}


enum RoleEnum {
    SUPER_USER = "SUPER_USER",
    USER = "USER",
    ADMIN = "ADMIN"
}

export type User = U