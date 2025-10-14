"use client";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/lib/useProgram";
import * as anchor from "@coral-xyz/anchor";
import { treasury, emergencyAdmin, getConfigPDA } from "@/config";
import toast from "react-hot-toast";

export default function Methods() {
  const program = useProgram();
  const configPDA = getConfigPDA();

  const initProgram = async () => {
    if (!program) {
      console.error("Program not ready");
      return;
    }

    const admin = program.provider.publicKey;
    if (!admin) {
      console.error("Wallet not connected");
      return;
    }

    const platformFeeBps = 1000; // 5%
    const minBetAmount = new anchor.BN(10_000_000);
    const maxBetAmount = new anchor.BN(1_000_000_000);
    const marketCreationFee = new anchor.BN(0);
    const minMarketDuration = new anchor.BN(60); // 1 min
    const maxMarketDuration = new anchor.BN(604800); // 7 days

    try {
      const configAccount = await program.account.platformConfig.fetch(
        await configPDA
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
        .rpc();

      console.log("✅ Platform initialized! Transaction:", tx);
      return tx;
    } catch (err) {
      console.error("❌ Error initializing platform:", err);
      throw err;
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
      console.error("Program not ready");
      return;
    }

    const creator = program.provider.publicKey;
    if (!creator) {
      console.error("wallet not connected");
      return;
    }

    // fetching Market PDA
    // You’ll need to fetch config.next_market_id first
    const configAccount = await program.account.platformConfig.fetch(
      await configPDA
    );
    const nextMarketId = configAccount.nextMarketId.toNumber();

    const [marketPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        new anchor.BN(nextMarketId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

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
        .rpc();

      console.log(
        "✅ Market initialized! Tx:",
        tx,
        "Market PDA:",
        marketPDA.toBase58()
      );
      return marketPDA.toBase58();
    } catch (err) {
      console.error("❌ Error initializing market:", err);
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
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Bet placed successfully");
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
        .rpc();
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
        .rpc();

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
          user_position: userPositionPDA, // match IDL exactly
          system_program: SystemProgram.programId,
        })
        .rpc();

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
