"use client";

import { PublicKey } from "@solana/web3.js"
import * as anchor from "@coral-xyz/anchor";

export const BACKEND_URL = "http://localhost:8000"

export const PROGRAM_ID = new PublicKey("E2cK464TgkSX1VWr3r95FX4kiS5zuYiaberVJvGQBBpy")

//admin treasury
export const treasury = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5")


export const royaltyVault = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5");


export const emergencyAdmin = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5");

export const battlePoolVault = new PublicKey("Ed37WgLJDfsbfoa8cpS2FkeAyRFb1xDkTMKEeNa7drZQ");


// plateform init config
export const platformFeeBps = 500;//5%
export const minBetAmount = new anchor.BN(10_000); // 0.01  sol
export const maxBetAmount = new anchor.BN(1_000_000_000); //1 sol
export const marketCreationFee = new anchor.BN(0);
export const minMarketDuration = new anchor.BN(60); // 1 min

// token
export const tokenTradingFeeBps = 300;
export const battleFeeBps = 200;
export const creatorRoyaltyBps = 800;
export const creatorAllocationBps = 1500;// 15%
export const minLiquidityPercentage = 6000; //60 %
export const maxTokensPerBattleSide = 5;
export const minTokenCreationFee = new anchor.BN(100000000);
export const minTokenSupply = new anchor.BN(1000);
export const maxTokenSupply = new anchor.BN(1000000);
export const minInitialPrice = new anchor.BN(1_000_000);
export const minLockDuration = new anchor.BN(3600);
export const CurveTypes = {
    linear: { linear: {} },
    exponential: { exponential: {} },
    logarithmic: { logarithmic: {} },
} as const;
export type BondingCurveKey = keyof typeof CurveTypes;

export const curveSteepness = new anchor.BN(100);
export const migrationThreshold = new anchor.BN(1000000000);
export const dexMigrationFee = new anchor.BN(1000000);
export const battleEligibilityThreshold = new anchor.BN(10000);
export const minBattleDuration = new anchor.BN(60);// 60 sec
export const maxBattleDuration = new anchor.BN(604800);//  7 days
export const minBattlePool = new anchor.BN(1000000);
export const maxMarketDuration = new anchor.BN(604800); //7 Days
export const battleCreationReputation = new anchor.BN(50);
export const marketCreationReputation = new anchor.BN(100);
export const battleContributionBps = 5000; // 50% 