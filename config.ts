"use client";

import * as anchor from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

export const BACKEND_URL = "http://localhost:8000"

export const PROGRAM_ID = new PublicKey("3TECSe2FnZu94CmwpoRdTb25iV5uRUtu7Y81EpFrfXEe")

export const treasury = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5")

export const emergencyAdmin = new PublicKey("9Mv6tanREUmkYVS1jSgj27GrapJvK3ynkCWsRJKCMpn5");

export const getConfigPDA = async () => {
    
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        PROGRAM_ID
    );
    return pda;
};

