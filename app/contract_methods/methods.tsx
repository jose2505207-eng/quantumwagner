"use client";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/lib/useProgram";
import * as anchor from "@coral-xyz/anchor";
import {
  treasury,
  royaltyVault,
  emergencyAdmin,
  platformFeeBps,
  minBetAmount,
  maxBetAmount,
  marketCreationFee,
  minMarketDuration,
  maxMarketDuration,
  PROGRAM_ID,
  tokenTradingFeeBps,
  battlePoolVault,
  battleFeeBps,
  creatorRoyaltyBps,
  battleCreationReputation,
  minTokenCreationFee,
  minTokenSupply,
  minInitialPrice,
  creatorAllocationBps,
  minLockDuration,
  curveSteepness,
  migrationThreshold,
  dexMigrationFee,
  minLiquidityPercentage,
  battleEligibilityThreshold,
  minBattleDuration,
  maxBattleDuration,
  marketCreationReputation,
  maxTokenSupply,
  minBattlePool,
  maxTokensPerBattleSide,
  CurveTypes,
  battleContributionBps,
  BondingCurveKey,
} from "@/config";

import toast from "react-hot-toast";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface createToeknParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    telegram?: string;
  };
  initialPrice: number;
  totalSupply: number;
  CurveTypes: "linear" | "exponential" | "logarithmic";
  tags: string[];
}

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

  const initializeLaunchpad = async () => {
    if (!program) throw new Error("Program not connected");
    const admin = program.provider.publicKey;
    if (!admin) throw new Error("Wallet not connected");

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    try {
      const tx = await program.methods
        .initializeLaunchpad(
          platformFeeBps, // u16
          tokenTradingFeeBps, // u16
          battleFeeBps, // u16
          creatorRoyaltyBps, // u16
          battleContributionBps, // u16
          minTokenCreationFee, // u64
          minTokenSupply, // u64
          maxTokenSupply, // u64
          minInitialPrice, // u64
          creatorAllocationBps, // u16
          minLockDuration, // i64
          CurveTypes.linear, // enum
          curveSteepness, // u64
          migrationThreshold, // u64
          dexMigrationFee, // u64
          minLiquidityPercentage, // u16
          battleEligibilityThreshold, // u64
          minBattleDuration, // i64
          maxBattleDuration, // i64
          minBattlePool, // u64
          maxTokensPerBattleSide, // u8
          marketCreationFee, // u64
          minMarketDuration, // i64
          maxMarketDuration, // i64
          marketCreationReputation, // u64
          battleCreationReputation, // u64
          minBetAmount, // u64
          maxBetAmount // u64
        )
        .accounts({
          config: configPda,
          admin,
          emergencyAdmin,
          treasury,
          battlePoolVault,
          royaltyVault,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      toast.success("Launchpad initialized successfully ");
      console.log("Transaction Signature:", tx);
      return tx;
    } catch (e) {
      console.error("Launchpad initialization failed:", e);
      toast.error("Launchpad failed to initialize ");
    }
  };

  const createTokenLaunch = async (data: createToeknParams) => {
    if (!program) throw new Error("Program not ready");

    const user = program.provider.publicKey;
    if (!user) throw new Error("Wallet not connected");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    // Fetch config to get treasury
    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const treasury = configAccount.treasury;

    const nextLaunchId = Number(configAccount.nextLaunchId);

    const [tokenLaunchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_launch"),
        new anchor.BN(nextLaunchId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [tokenMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_mint"), tokenLaunchPda.toBuffer()],
      program.programId
    );

    const [tokenVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_vault"), tokenLaunchPda.toBuffer()],
      program.programId
    );

    const [solVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault"), tokenLaunchPda.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .createTokenLaunch(
          data.name,
          data.symbol,
          data.description,
          data.imageUrl,
          {
            website: data.socialLinks.website ?? "",
            twitter: data.socialLinks.twitter ?? "",
            telegram: data.socialLinks.telegram ?? "",
          },
          new anchor.BN(data.initialPrice),
          new anchor.BN(data.totalSupply),
          CurveTypes[data.CurveTypes],
          data.tags
        )
        .accounts({
          creator: user,
          config: configPDA,
          tokenLaunch: tokenLaunchPda,
          tokenMint: tokenMintPda,
          tokenVault: tokenVaultPda,
          solVault: solVaultPda,
          treasury,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log("Token Launch Created:", tx);
      toast.success("Token launched successfully!");
      return tx;
    } catch (e) {
      console.error(e);
      toast.error("Token failed to create");
    }
  };

  return {
    initProgram,
    initMarket,
    placeBet,
    cancelMarket,
    settleMarket,
    withdrawWinnings,
    initializeLaunchpad,
    createTokenLaunch,
  };
}
