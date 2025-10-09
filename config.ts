"use client";

import * as anchor from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

export const BACKEND_URL = "http://localhost:8000"

export const PROGRAM_ID = new PublicKey("FGLMNq1zYi5iTzja9fzZ6vStrYvZ9E1npzgNUAZtgGic")
export const treasury = new PublicKey("HsP7XPrxgjNcWmfwuzgikL4qi4MASdbxd2eQ77AzBGme")
export const emergencyAdmin = new PublicKey("HsP7XPrxgjNcWmfwuzgikL4qi4MASdbxd2eQ77AzBGme");

export const getConfigPDA = async () => {
    const [pda] = await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        PROGRAM_ID
    );
    return pda;
};

