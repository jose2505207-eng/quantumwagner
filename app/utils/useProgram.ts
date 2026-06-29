"use client";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import idl from "@/idl/prediction_market.json";
import type { PredictionMarket } from "@/idl/types"

export function useProgram() {
    const wallet = useAnchorWallet();
    if (!wallet) return null;

    const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpc, "confirmed");
    const provider = new AnchorProvider(connection, wallet, {});

    return new Program<PredictionMarket>(
        idl as PredictionMarket,
        provider
    );
}
