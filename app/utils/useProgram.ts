"use client";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import idl from "@/idl/prediction_market.json";
import type { PredictionMarket } from "@/idl/types"
import { SOLANA_RPC_URL } from "@/lib/solana";

export function useProgram() {
    const wallet = useAnchorWallet();
    if (!wallet) return null;

    // Single source of truth for the RPC endpoint: lib/solana (env-driven,
    // devnet fallback). SolanaProvider reads the same constant, so the wallet
    // connection and the Anchor program can no longer drift onto two endpoints.
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const provider = new AnchorProvider(connection, wallet, {});

    return new Program<PredictionMarket>(
        idl as PredictionMarket,
        provider
    );
}
