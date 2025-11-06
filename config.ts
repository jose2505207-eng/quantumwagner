"use client";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { BN } from "@coral-xyz/anchor";

export const BACKEND_URL = "http://localhost:8000"

export const PROGRAM_ID = new PublicKey("E2cK464TgkSX1VWr3r95FX4kiS5zuYiaberVJvGQBBpy")

//admin treasury
export const treasury = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5")


export const royaltyVault = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5");


export const emergencyAdmin = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5");

export const battlePoolVault = new PublicKey("Ed37WgLJDfsbfoa8cpS2FkeAyRFb1xDkTMKEeNa7drZQ");


// plateform init config
export const PLATFORM_FEE_BPS = 300; // 3%
export const MIN_BET_AMOUNT = new BN(0.01 * LAMPORTS_PER_SOL);
export const MAX_BET_AMOUNT = new BN(100 * LAMPORTS_PER_SOL);
export const MARKET_CREATION_FEE = new BN(0.1 * LAMPORTS_PER_SOL);
export const MIN_MARKET_DURATION = new BN(5); // 5 minutes
export const MAX_MARKET_DURATION = new BN(31536000); // 1 year
export const BET_AMOUNT = new BN(1 * LAMPORTS_PER_SOL);
export const MARKET_DURATION = new BN(310); // 310 seconds (~5 minutes) - just above minimum


// token
// export const tokenTradingFeeBps = 300;
// export const battleFeeBps = 200;
// export const creatorRoyaltyBps = 800;
// export const creatorAllocationBps = 1500;// 15%
// export const minLiquidityPercentage = 6000; //60 %
// export const maxTokensPerBattleSide = 5;
// export const minTokenCreationFee = new BN(100000000);
// export const minTokenSupply = new BN(1000);
// export const maxTokenSupply = new BN(1000000);
// export const minInitialPrice = new BN(1_000_000);
// export const minLockDuration = new BN(3600);
// export const CurveTypes = {
//     linear: { linear: {} },
//     exponential: { exponential: {} },
//     logarithmic: { logarithmic: {} },
// } as const;
// export type BondingCurveKey = keyof typeof CurveTypes;

// export const curveSteepness = new BN(100);
// export const migrationThreshold = new BN(1000000000);
// export const dexMigrationFee = new BN(1000000);
// export const battleEligibilityThreshold = new BN(10000);
// export const minBattleDuration = new BN(60);// 60 sec
// export const maxBattleDuration = new BN(604800);//  7 days
// export const minBattlePool = new BN(1000000);
// export const maxMarketDuration = new BN(604800); //7 Days
// export const battleCreationReputation = new BN(50);
// export const marketCreationReputation = new BN(100);




// Platform Config Parameters
export const TOKEN_TRADING_FEE_BPS = 100; // 1%
export const BATTLE_FEE_BPS = 200; // 2%
export const CREATOR_ROYALTY_BPS = 150; // 1.5%
export const BATTLE_CONTRIBUTION_BPS = 1000; // 10%

// Token Launch Parameters
export const MIN_TOKEN_CREATION_FEE = new BN(0.1 * LAMPORTS_PER_SOL);
export const MIN_TOKEN_SUPPLY = new BN(1_000_000); // 1M tokens
export const MAX_TOKEN_SUPPLY = new BN(1_000_000_000_000); // 1T tokens
export const MIN_INITIAL_PRICE = new BN(0.0001 * LAMPORTS_PER_SOL);
export const CREATOR_ALLOCATION_BPS = 1000; // 10%
export const MIN_LOCK_DURATION = new BN(0); // No minimum lock

// Bonding Curve Config
export const DEFAULT_CURVE_TYPE = { exponential: {} }; // or { linear: {} } or { logarithmic: {} }
export const CURVE_STEEPNESS = new BN(1000);

// Migration Parameters
export const MIGRATION_THRESHOLD = new BN(1_000_000 * 1_000_000); // 1M market cap
export const DEX_MIGRATION_FEE = new BN(0.5 * LAMPORTS_PER_SOL);
export const MIN_LIQUIDITY_PERCENTAGE = 8000; // 80%

// Battle Parameters
export const BATTLE_ELIGIBILITY_THRESHOLD = new BN(500_000 * 1_000_000); // 500K market cap
export const MIN_BATTLE_DURATION = new BN(300); // 5 minutes
export const MAX_BATTLE_DURATION = new BN(604800); // 1 week
export const MIN_BATTLE_POOL = new BN(1 * LAMPORTS_PER_SOL);
export const MAX_TOKENS_PER_BATTLE_SIDE = 10;


// Reputation Thresholds
export const MARKET_CREATION_REPUTATION = new BN(7500);
export const BATTLE_CREATION_REPUTATION = new BN(10000);

