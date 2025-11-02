"use client";

import { PublicKey } from "@solana/web3.js"
import * as anchor from "@coral-xyz/anchor";

export const BACKEND_URL = "http://localhost:8000"

export const PROGRAM_ID = new PublicKey("E2cK464TgkSX1VWr3r95FX4kiS5zuYiaberVJvGQBBpy")

export const treasury = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5")

export const emergencyAdmin = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5");


// plateform init config
export const platformFeeBps = 1000;//10%
export const minBetAmount = new anchor.BN(10_000); // 0.01  sol
export const maxBetAmount = new anchor.BN(1_000_000_000); //1 sol
export const marketCreationFee = new anchor.BN(0);
export const minMarketDuration = new anchor.BN(60); // 1 min
export const maxMarketDuration = new anchor.BN(604800); //7 Days
