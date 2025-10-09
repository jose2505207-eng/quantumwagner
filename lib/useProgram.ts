"use client";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import idl from "@/idl/prediction_market.json";
import type { PredictionMarket } from "@/lib/types"

export function useProgram() {
    const wallet = useAnchorWallet();
    if (!wallet) return null;

    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const provider = new AnchorProvider(connection, wallet, {});

    return new Program<PredictionMarket>(
        idl as PredictionMarket,

        provider
    );
}
