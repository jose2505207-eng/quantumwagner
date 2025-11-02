"use client";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/lib/useProgram";
import * as anchor from "@coral-xyz/anchor";
import {
  treasury,
  emergencyAdmin,
  platformFeeBps,
  minBetAmount,
  maxBetAmount,
  marketCreationFee,
  minMarketDuration,
  maxMarketDuration,
  PROGRAM_ID,
} from "@/config";

import toast from "react-hot-toast";

export default function Methods() {
  const program = useProgram();

  const initProgram = async () => {
    if (!program) {
      toast.error("Please connect wallet!");
      return;
    }

    const admin = program.provider.publicKey;
    if (!admin) {
      toast.error("Wallet not connected");
      return;
    }
    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );

    try {
      const configAccount = await program.account.platformConfig.fetch(
        configPDA
      );
      console.log("Config account exists:", configAccount);
    } catch (err) {
      console.log("Config account not found, safe to initialize.");
    }

    try {
      const tx = await program.methods
        .initializePlatform(
          platformFeeBps,
          minBetAmount,
          maxBetAmount,
          marketCreationFee,
          minMarketDuration,
          maxMarketDuration
        )

        .accounts({
          config: configPDA,
          admin,
          treasury,
          emergencyAdmin,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      toast.success(`Platform initialized! Transaction :  ${tx}`);
      console.log(`Platform initialized! Transaction : `, tx);
      return tx;
    } catch (err) {
      console.error(" Error initializing platform:", err);
    }
  };

  const initMarket = async ({
    questionId,
    category = { price: {} },
    durationSeconds = new anchor.BN(3600 * 24),
    minBetAmount = new anchor.BN(1),
    tags = ["BTC", "Price"],
    imageUrl,
  }: {
    questionId: string;
    category?: any;
    durationSeconds?: anchor.BN;
    minBetAmount?: anchor.BN;
    tags?: string[];
    imageUrl?: string | null;
  }) => {
    if (!program) {
      toast.error("Program not ready");
      return;
    }

    const creator = program.provider.publicKey;
    if (!creator) {
      toast.error("wallet not connected");
      return;
    }

    // 🧩 Derive config PDA

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );

    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const nextMarketId = configAccount.nextMarketId.toNumber();

    // 🧩 Derive market PDA using nextMarketId
    const [marketPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        new anchor.BN(nextMarketId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    console.log("🧠 Creating market...");
    console.table({
      creator: creator.toBase58(),
      config: configPDA.toBase58(),
      market: marketPDA.toBase58(),
      treasury: configAccount.treasury.toBase58(),
    });

    try {
      const tx = await program.methods
        .initializeMarket(
          questionId,
          category,
          durationSeconds,
          minBetAmount,
          tags,
          imageUrl ? imageUrl : null
        )
        .accounts({
          creator,
          config: configPDA,
          market: marketPDA,
          treasury: configAccount.treasury,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      console.log(
        "✅ Market initialized! Tx:",
        tx,
        "Market PDA:",
        marketPDA.toBase58()
      );

      toast.success("Market created succssfully!");
      return marketPDA.toBase58();
    } catch (err: any) {
      console.error("❌ Error initializing market:", err);
      if (err instanceof anchor.AnchorError)
        toast.error(`AnchorError: ${err.error.errorMessage}`);
      else toast.error("Market creation failed");
      throw err;
    }
  };

  const placeBet = async (
    marketPDA: PublicKey,
    amount: number,
    outcome: boolean
  ) => {
    if (!program) throw new Error("Program not ready");

    const user = program.provider.publicKey;
    if (!user) throw new Error("Wallet not connected");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );

    //  Fetch config to get treasury address

    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const treasury = configAccount.treasury;

    // Derive UserPosition PDA
    const [userPositionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("position"), marketPDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .placeBet(outcome, new anchor.BN(amount))
        .accounts({
          user,
          config: configPDA,
          market: marketPDA,
          userPosition: userPositionPDA,
          treasury,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      toast.success("Bet placed successfully");
      console.log("✅ Bet placed TX:", tx);
      return tx;
    } catch (err: any) {
      console.error("Error placing bet:", err);
      const msg =
        err.message ||
        (err.logs ? err.logs.join("\n") : "Unknown error placing bet");
      toast.error(`Error placing bet: ${msg}`);
      throw err;
    }
  };

  const cancelMarket = async (marketPDA: PublicKey) => {
    if (!program) throw new Error("Program not ready");
    const admin = program.provider.publicKey;
    try {
      const tx = await program.methods
        .cancelMarket()
        .accounts({
          admin,
          market: marketPDA,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });
      console.log("✅ Market cancelled! Tx:", tx);
    } catch (err) {
      console.error("❌ Error cancelling market:", err);
    }
  };

  const settleMarket = async (
    marketPDA: PublicKey,
    winningOutcome: boolean
  ) => {
    if (!program) throw new Error("Program not ready");

    const admin = program.provider.publicKey;
    if (!admin) throw new Error("Wallet not connected");

    try {
      const tx = await program.methods
        .settleMarket(winningOutcome)
        .accounts({
          admin,
          market: marketPDA,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      console.log("✅ Market settled. Tx:", tx);
      return tx;
    } catch (err) {
      console.error("❌ Error settling market:", err);
      throw err;
    }
  };

  const withdrawWinnings = async (marketPDA: PublicKey) => {
    if (!program) throw new Error("Program not ready");

    const user = program.provider.publicKey;
    if (!user) throw new Error("Wallet not connected");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    // Fetch config to get treasury
    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const treasury = configAccount.treasury;

    // Derive UserPosition PDA
    const [userPositionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), marketPDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .withdrawWinnings()
        .accounts({
          user,
          market: marketPDA,
          userPosition: userPositionPDA,
          config: configPDA,
          treasury,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      console.log("✅ Winnings withdrawn. Tx:", tx);
      return tx;
    } catch (err) {
      console.error("❌ Error withdrawing winnings:", err);
      throw err;
    }
  };

  return {
    initProgram,
    initMarket,
    placeBet,
    cancelMarket,
    settleMarket,
    withdrawWinnings,
  };
}
