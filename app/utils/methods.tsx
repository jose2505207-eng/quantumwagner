"use client";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/app/utils/useProgram";
import * as anchor from "@coral-xyz/anchor";
import type { IdlAccounts } from "@coral-xyz/anchor";
import type { PredictionMarket } from "@/idl/types";
import {
  treasury,
  royaltyVault,
  emergencyAdmin,
  PLATFORM_FEE_BPS,
  MIN_BET_AMOUNT,
  MAX_BET_AMOUNT,
  MARKET_CREATION_FEE,
  MIN_MARKET_DURATION,
  MAX_MARKET_DURATION,
  PROGRAM_ID,
  battlePoolVault,
  TOKEN_TRADING_FEE_BPS,
  BATTLE_FEE_BPS,
  CREATOR_ROYALTY_BPS,
  BATTLE_CONTRIBUTION_BPS,
  MIN_TOKEN_CREATION_FEE,
  MIN_TOKEN_SUPPLY,
  MAX_TOKEN_SUPPLY,
  MIN_INITIAL_PRICE,
  CREATOR_ALLOCATION_BPS,
  MIN_LOCK_DURATION,
  DEFAULT_CURVE_TYPE,
  CURVE_STEEPNESS,
  MIGRATION_THRESHOLD,
  DEX_MIGRATION_FEE,
  MIN_LIQUIDITY_PERCENTAGE,
  BATTLE_ELIGIBILITY_THRESHOLD,
  MIN_BATTLE_DURATION,
  MAX_BATTLE_DURATION,
  MIN_BATTLE_POOL,
  MAX_TOKENS_PER_BATTLE_SIDE,
  MARKET_CREATION_REPUTATION,
  BATTLE_CREATION_REPUTATION,
} from "@/config";

import toast from "react-hot-toast";
import { useGameStore } from "@/store/useGameStore";
import {
  recordBattleCreated,
  recordBattleEntry,
  recordBattleIncrease,
  recordMarketCreated,
  recordPrediction,
  recordMarketCancel,
  recordMarketWithdraw,
} from "@/lib/api";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";

export interface createToeknParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  initialPrice: number;
  totalSupply: number;
  tags: string[];
}

// Precise Anchor-decoded account shapes from the IDL. Loop 7 aligned the UI
// consumer types to these (PublicKey, BN, option->null), so the container types
// below are now the real decoded shapes instead of `any`.
type DecodedBattle = IdlAccounts<PredictionMarket>["battle"];
type DecodedTokenLaunch = IdlAccounts<PredictionMarket>["tokenLaunch"];

type BoughtToken = {
  mint: string;
  balance: number;
  ata: string;
  tokenData: DecodedTokenLaunch;
};

// Anchor enum args are encoded as a single-key object whose value is an empty
// struct, e.g. `{ priceGain: {} }`. `Record<string, never>` is the lint-clean
// spelling of that empty struct (the bare `{}` type is disallowed) and the
// `{}` literal at the call sites remains assignable to it — runtime unchanged.
type AnchorUnitVariant = Record<string, never>;

// The on-chain market `category` enum (idl: price | events | social | other).
// Matches the Anchor-decoded arg type for `initializeMarket`.
type MarketCategory =
  | { price: AnchorUnitVariant }
  | { events: AnchorUnitVariant }
  | { social: AnchorUnitVariant }
  | { other: AnchorUnitVariant };

type BattleMetric =
  | { totalVolume: AnchorUnitVariant }
  | { priceGain: AnchorUnitVariant }
  | { holderGrowth: AnchorUnitVariant }
  | { socialEngagement: AnchorUnitVariant };

export type CreateBattleArgs = {
  title: string;
  description: string;
  sideATokens: PublicKey[];
  sideBTokens: PublicKey[];
  sideAName: string;
  sideBName: string;
  startTime: number;
  endTime: number;
  winningMetric?: BattleMetric;
  metaMarketEnabled: boolean;
  imageUrl?: string | null;
};

export type EnterBattleArgs = {
  battlePDA: PublicKey;
  side: { a: AnchorUnitVariant } | { b: AnchorUnitVariant };
  amount: number;
};

export default function Methods() {
  const program = useProgram();
  const { connection } = useConnection();
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
    } catch (err) {}

    try {
      const tx = await program.methods
        .initializePlatform(
          PLATFORM_FEE_BPS,
          MIN_BET_AMOUNT,
          MAX_BET_AMOUNT,
          MARKET_CREATION_FEE,
          MIN_MARKET_DURATION,
          MAX_MARKET_DURATION
        )

        .accountsPartial({
          config: configPDA,
          admin,
          treasury,
          emergencyAdmin,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      toast.success(`Platform initialized! Transaction :  ${tx}`);
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
    category?: MarketCategory;
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

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );

    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const nextMarketId = configAccount.nextMarketId.toNumber();

    const [marketPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        new anchor.BN(nextMarketId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

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
        .accountsPartial({
          creator,
          config: configPDA,
          market: marketPDA,
          treasury: configAccount.treasury,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      toast.success("Market created succssfully!");

      // Best-effort: record the confirmed on-chain market to the backend.
      try {
        await recordMarketCreated({
          question: questionId,
          category: Object.keys(category)[0] ?? "CRYPTO",
          endTime: new Date(Date.now() + durationSeconds.toNumber() * 1000),
          pda: marketPDA.toBase58(),
          txSignature: tx,
        });
      } catch (e) {
        console.warn("market create not recorded to backend:", e);
      }

      return marketPDA.toBase58();
    } catch (err) {
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

    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const treasury = configAccount.treasury;

    const [userPositionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("position"), marketPDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .placeBet(outcome, new anchor.BN(amount))
        .accountsPartial({
          user,
          config: configPDA,
          market: marketPDA,
          userPosition: userPositionPDA,
          // NOTE: place_bet has no `treasury` account in the IDL; it was a
          // no-op key (Anchor ignores unknown accounts). Removed to satisfy
          // strict typing without changing on-chain behaviour.
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      toast.success("Bet placed successfully");
      // Real on-chain action → completes the "first prediction" milestone.
      useGameStore.getState().completeLevel("first-prediction");

      // Best-effort: record the confirmed on-chain bet to the backend.
      try {
        await recordPrediction(marketPDA.toBase58(), {
          side: outcome ? "YES" : "NO",
          amount,
          txSignature: tx,
        });
      } catch (e) {
        console.warn("prediction not recorded to backend:", e);
      }
      return tx;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
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
        .accountsPartial({
          admin,
          market: marketPDA,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      // Best-effort: record the confirmed on-chain cancellation to the backend.
      try {
        await recordMarketCancel(marketPDA.toBase58(), { txSignature: tx });
      } catch (e) {
        console.warn("market cancel not recorded to backend:", e);
      }
    } catch (err) {
      throw err;
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
        .accountsPartial({
          admin,
          market: marketPDA,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      return tx;
    } catch (err) {
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

    const configAccount = await program.account.platformConfig.fetch(configPDA);
    const treasury = configAccount.treasury;

    const [userPositionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), marketPDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .withdrawWinnings()
        .accountsPartial({
          user,
          market: marketPDA,
          userPosition: userPositionPDA,
          config: configPDA,
          treasury,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });

      // Best-effort: record the confirmed on-chain withdrawal to the backend.
      try {
        await recordMarketWithdraw(marketPDA.toBase58(), { txSignature: tx });
      } catch (e) {
        console.warn("withdraw not recorded to backend:", e);
      }

      return tx;
    } catch (err) {
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
          PLATFORM_FEE_BPS,
          TOKEN_TRADING_FEE_BPS,
          BATTLE_FEE_BPS,
          CREATOR_ROYALTY_BPS,
          BATTLE_CONTRIBUTION_BPS,
          MIN_TOKEN_CREATION_FEE,
          MIN_TOKEN_SUPPLY,
          MAX_TOKEN_SUPPLY,
          MIN_INITIAL_PRICE,
          CREATOR_ALLOCATION_BPS,
          MIN_LOCK_DURATION,
          DEFAULT_CURVE_TYPE,
          CURVE_STEEPNESS,
          MIGRATION_THRESHOLD,
          DEX_MIGRATION_FEE,
          MIN_LIQUIDITY_PERCENTAGE,
          BATTLE_ELIGIBILITY_THRESHOLD,
          MIN_BATTLE_DURATION,
          MAX_BATTLE_DURATION,
          MIN_BATTLE_POOL,
          MAX_TOKENS_PER_BATTLE_SIDE,
          MARKET_CREATION_FEE,
          MIN_MARKET_DURATION,
          MAX_MARKET_DURATION,
          MARKET_CREATION_REPUTATION,
          BATTLE_CREATION_REPUTATION,
          MIN_BET_AMOUNT,
          MAX_BET_AMOUNT
        )
        .accountsPartial({
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
      return tx;
    } catch (e) {
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
            discord: data.socialLinks.discord ?? "",
          },
          new anchor.BN(data.initialPrice),
          new anchor.BN(data.totalSupply),
          { exponential: {} },
          data.tags
        )
        .accountsPartial({
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

      toast.success("Token launched successfully!");
      // Real on-chain action → completes the "launch token" milestone.
      useGameStore.getState().completeLevel("launch-token");
      return {
        tx,
        tokenMint: tokenMintPda.toBase58(),
        tokenVault: tokenVaultPda.toBase58(),
        solVault: solVaultPda.toBase58(),
      };
    } catch (e) {
      toast.error("Token failed to create");
    }
  };

  const buyToken = async (launchId: number, tokenAmount: number) => {
    if (!program) throw new Error("Program not ready");

    const buyer = program.provider.publicKey;
    if (!buyer) throw new Error("Wallet not connected");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const [tokenLaunchPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_launch"),
        new anchor.BN(launchId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [solVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault"), tokenLaunchPDA.toBuffer()],
      program.programId
    );

    const config = await program.account.platformConfig.fetch(configPDA);
    const treasury = config.treasury;
    const royaltyVault = config.royaltyVault;
    const battlePoolVault = config.battlePoolVault;

    const tokenLaunch = await program.account.tokenLaunch.fetch(tokenLaunchPDA);
    const tokenMint = tokenLaunch.tokenMint;
    const tokenVault = tokenLaunch.tokenVault;

    const buyerTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      buyer,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    try {
      const tx = await program.methods
        .buyToken(new anchor.BN(tokenAmount))
        .accountsPartial({
          buyer,
          config: configPDA,
          tokenLaunch: tokenLaunchPDA,
          tokenVault,
          solVault: solVaultPDA,
          buyerTokenAccount,
          tokenMint,
          treasury,
          royaltyVault,
          battlePoolVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Token purchase successful!");
    } catch (e) {
      toast.error("Token purchase failed");
    }
  };

  const sellToken = async (launchId: number, tokenAmount: number) => {
    if (!program) throw new Error("Program not ready");
    const seller = program.provider.publicKey;
    if (!seller) throw new Error("Wallet not connected");

    // 1) PDAs
    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const [tokenLaunchPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_launch"),
        new anchor.BN(launchId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [solVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault"), tokenLaunchPDA.toBuffer()],
      program.programId
    );

    // 2) Fetch config + tokenLaunch to get authoritative addresses
    const config = await program.account.platformConfig.fetch(configPDA);
    const tokenLaunch = await program.account.tokenLaunch.fetch(tokenLaunchPDA);

    const tokenMint: PublicKey = tokenLaunch.tokenMint;
    const tokenVault: PublicKey = tokenLaunch.tokenVault;

    const sellerTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      seller,
      false
    );

    const bal = await program.provider.connection
      .getTokenAccountBalance(sellerTokenAccount)
      .catch(() => null);
    if (!bal || Number(bal.value.amount) < tokenAmount)
      throw new Error("Not enough tokens in seller ATA");

    const tx = await program.methods
      .sellToken(new anchor.BN(tokenAmount))
      .accountsPartial({
        seller,
        config: configPDA,
        tokenLaunch: tokenLaunchPDA,
        tokenVault,
        solVault: solVaultPDA,
        sellerTokenAccount,
        treasury: config.treasury,
        royaltyVault: config.royaltyVault,
        battlePoolVault: config.battlePoolVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  // const migrateToDex = async (tokenId: number) => {
  //   try {
  //     if (!program) throw new Error("Program not ready!");
  //     const provider = program.provider as anchor.AnchorProvider;
  //     const creator = provider.publicKey;
  //     if (!creator) throw new Error("Wallet not connected!");

  //     toast.loading("Migrating token to DEX...");

  //     const [configPDA] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("platform_config")],
  //       program.programId
  //     );

  //     const [tokenLaunchPDA] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("token_launch"),
  //         new anchor.BN(tokenId).toArrayLike(Buffer, "le", 8),
  //       ],
  //       program.programId
  //     );

  //     const [solVaultPDA] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("sol_vault"), tokenLaunchPDA.toBuffer()],
  //       program.programId
  //     );

  //     const configAccount = await program.account.platformConfig.fetch(
  //       configPDA
  //     );
  //     const tokenLaunchAccount = await program.account.tokenLaunch.fetch(
  //       tokenLaunchPDA
  //     );

  //     const [poolAccount] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool_account"), tokenLaunchPDA.toBuffer()],
  //       program.programId
  //     );
  //     const [poolTokenMint] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool_token_mint"), tokenLaunchPDA.toBuffer()],
  //       program.programId
  //     );
  //     const [poolSolAccount] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool_sol_account"), tokenLaunchPDA.toBuffer()],
  //       program.programId
  //     );
  //     const [poolTokenAccount] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool_token_account"), tokenLaunchPDA.toBuffer()],
  //       program.programId
  //     );
  //     const [raydiumProgram] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("mock_raydium")],
  //       program.programId
  //     );

  //     const creatorLpAccount = await getOrCreateAssociatedTokenAccount(
  //       provider.connection,
  //       provider.wallet.payer,
  //       poolTokenMint, // LP mint from DEX mock
  //       creator,
  //       true // allow owner off-curve
  //     );

  //     const tx = await program.methods
  //       .migrateToDex()
  //       .accountsPartial({
  //         creator,
  //         config: configPDA,
  //         tokenLaunch: tokenLaunchPDA,
  //         tokenMint: tokenLaunchAccount.tokenMint,
  //         tokenVault: tokenLaunchAccount.tokenVault,
  //         solVault: solVaultPDA,
  //         treasury: configAccount.treasury,
  //         raydiumProgram,
  //         poolAccount,
  //         poolTokenMint,
  //         poolSolAccount,
  //         poolTokenAccount,
  //         creatorLpAccount: creatorLpAccount.address,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //         rent: SYSVAR_RENT_PUBKEY,
  //       })
  //       .rpc();

  //     toast.dismiss();
  //     toast.success("Token migrated to DEX successfully!");
  //     return tx;
  //   } catch (err: any) {
  //     toast.dismiss();
  //     toast.error(err.message || "Migration failed!");
  //     throw err;
  //   }
  // };

  const claimCreatorTokens = async (tokenId: number) => {
    if (!program) {
      throw new Error("Program not ready!");
    }
    const creator = program.provider.publicKey;
    if (!creator) {
      throw new Error("Wallet not connected!");
    }

    const [tokenLaunchPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_launch"),
        new anchor.BN(tokenId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tokenLaunchAccount = await program.account.tokenLaunch.fetch(
      tokenLaunchPDA
    );

    const tokenMint = new PublicKey(tokenLaunchAccount.tokenMint);
    const tokenVault = new PublicKey(tokenLaunchAccount.tokenVault);

    const creatorTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      creator,
      false
    );

    try {
      const tx = await program.methods
        .claimCreatorTokens()
        .accountsPartial({
          creator,
          tokenLaunch: tokenLaunchPDA,
          tokenMint,
          tokenVault,
          creatorTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Token claimed successfully!");
    } catch (e) {
      // Anchor surfaces program errors either as `e.error.message` or `e.message`.
      const anchorErr = e as { error?: { message?: string }; message?: string };
      const message = anchorErr?.error?.message || anchorErr?.message || String(e);
      if (message.includes("No tokens available to claim")) {
        toast.success("Already Claimed!");
        return;
      } else if (message.includes("UnauthorizedCreator")) {
        toast.error("You are not the creator of this token.");
        return;
      } else if (message.includes("InsufficientTokens")) {
        toast.error("Vault doesn't have enough tokens to transfer.");
        return;
      } else if (message.includes("LaunchCancelled")) {
        toast.error("Launch is not active or has been cancelled.");
        return;
      } else {
        toast.error("Creator claim failed!");
        console.error("Claim failed:", e);
        return;
      }
    }
  };
  const getUserAllTokens = async () => {
    if (!program) {
      throw new Error("Progrma not found");
    }

    const creator = program.provider.publicKey;
    if (!creator) {
      throw new Error("Wallet not connected!");
    }

    const accounts = await program.account.tokenLaunch.all([
      {
        memcmp: {
          offset: 48,
          bytes: creator.toBase58(),
        },
      },
    ]);

    return accounts;
  };
  const getAllTokens = async () => {
    if (!program) {
      throw new Error("Progrma not found");
    }

    const accounts = await program.account.tokenLaunch.all();
    console.log("all TOkens :", accounts);

    return accounts;
  };

  const getBoughtTokens = async (): Promise<BoughtToken[]> => {
    try {
      if (!program) throw new Error("Program not found");

      const user = program.provider?.publicKey;
      if (!user) throw new Error("Wallet not connected");

      const allTokens = await program.account.tokenLaunch.all();
      if (!allTokens || allTokens.length === 0) {
        return [];
      }

      const boughtTokens: BoughtToken[] = [];

      for (const token of allTokens) {
        if (!token?.account) continue;

        const mintAddress = token.account.tokenMint;
        if (!mintAddress) continue;

        let mint: PublicKey;
        try {
          mint = new PublicKey(mintAddress);
        } catch {
          console.warn("Invalid mint address:", mintAddress);
          continue;
        }

        try {
          const ata = await getAssociatedTokenAddress(mint, user);
          const account = await getAccount(connection, ata).catch(() => null);

          if (account && Number(account.amount) > 0) {
            boughtTokens.push({
              mint: mint.toBase58(),
              balance: Number(account.amount),
              ata: ata.toBase58(),
              tokenData: token.account,
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes("could not find account")) {
            console.warn("Skipping mint:", mintAddress, msg);
          }
        }
      }
      return boughtTokens;
    } catch (err) {
      toast.error("Failed to fetch bought tokens");
      return [];
    }
  };

  const withdrawCreatorRoyalties = async (tokenId: number) => {
    try {
      if (!program) throw new Error("Program not ready!");
      const provider = program.provider as anchor.AnchorProvider;
      const creator = provider.publicKey;
      if (!creator) throw new Error("Wallet not connected!");

      toast.loading("Withdrawing royalties...");

      const [configPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        program.programId
      );

      const [tokenLaunchPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("token_launch"),
          new anchor.BN(tokenId).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const configAccount = await program.account.platformConfig.fetch(
        configPDA
      );
      const tokenLaunchAccount = await program.account.tokenLaunch.fetch(
        tokenLaunchPDA
      );

      const royaltyVault = configAccount.royaltyVault as PublicKey;

      const tx = await program.methods
        .withdrawCreatorRoyalties()
        .accountsPartial({
          creator,
          config: configPDA,
          tokenLaunch: tokenLaunchPDA,
          royaltyVault,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.dismiss();
      toast.success("Royalties withdrawn successfully!");
      return tx;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err ?? "");

      if (errMsg.includes("NoRoyaltiesToWithdraw")) {
        toast.dismiss();
        toast.success("No royalties found to withdraw!");
        return;
      }

      toast.dismiss();
      console.error("Withdraw error:", err);
      toast.error(errMsg || "Withdraw failed!");
      throw err;
    }
  };

  const createBattle = async (args: CreateBattleArgs) => {
    const {
      title,
      description,
      sideATokens,
      sideBTokens,
      sideAName,
      sideBName,
      startTime,
      endTime,
      winningMetric = { priceGain: {} },
      metaMarketEnabled,
      imageUrl,
    } = args;

    if (!program) throw new Error("Program not ready");

    const creator = program.provider.publicKey;
    if (!creator) throw new Error("Wallet not connected");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const config = await program.account.platformConfig.fetch(configPDA);
    const nextBattleId = new anchor.BN(config.nextBattleId);

    const [battlePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("battle"), nextBattleId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .createBattle(
        title,
        description,
        sideATokens,
        sideBTokens,
        sideAName,
        sideBName,
        new anchor.BN(startTime),
        new anchor.BN(endTime),
        winningMetric,
        metaMarketEnabled,
        imageUrl ? imageUrl : null
      )
      .accountsPartial({
        creator,
        config: configPDA,
        battle: battlePDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    toast.success("Battle Created successfully!");

    // Best-effort: record the confirmed on-chain event to the backend (indexing,
    // XP, leaderboard). The tx already landed, so a backend hiccup must not throw.
    try {
      await recordBattleCreated({
        title,
        description,
        sideA: sideAName,
        sideB: sideBName,
        pda: battlePDA.toBase58(),
        txSignature: tx,
      });
    } catch (e) {
      console.warn("battle create not recorded to backend:", e);
    }

    return {
      tx,
      battlePDA,
    };
  };

  const getAllBattles = async () => {
    if (!program) throw new Error("Program not ready");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const config = await program.account.platformConfig.fetch(configPDA);
    const nextBattleId = Number(config.nextBattleId); // total battles created

    const battles: Array<{
      id: number;
      pda: PublicKey;
      data: DecodedBattle;
    }> = [];

    for (let id = 0; id < nextBattleId; id++) {
      const battleIdBN = new anchor.BN(id);

      const [battlePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("battle"), battleIdBN.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      try {
        const battleData = await program.account.battle.fetch(battlePDA);

        battles.push({
          id,
          pda: battlePDA,
          data: battleData,
        });
      } catch (err) {
        console.warn(`Skipping battle ${id}:`, err instanceof Error ? err.message : String(err));
      }
    }

    return battles;
  };

  const getUserBattles = async () => {
    if (!program) throw new Error("Program not ready");

    const user = program.provider.publicKey;
    if (!user) throw new Error("Wallet not connected");

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const config = await program.account.platformConfig.fetch(configPDA);
    const nextBattleId = Number(config.nextBattleId); // total created

    const battles: Array<{
      id: number;
      pda: PublicKey;
      data: DecodedBattle;
    }> = [];

    for (let id = 0; id < nextBattleId; id++) {
      const battleIdBN = new anchor.BN(id);

      const [battlePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("battle"), battleIdBN.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      try {
        const battleData = await program.account.battle.fetch(battlePDA);

        if (battleData.creator.toBase58() === user.toBase58()) {
          battles.push({
            id,
            pda: battlePDA,
            data: battleData,
          });
        }
      } catch (err) {
        console.warn(`Skipping battle ${id}:`, err instanceof Error ? err.message : String(err));
      }
    }

    console.log("user BAttles:", battles);

    return battles;
  };

  const enterBattle = async ({ battlePda, side, amount }) => {
    if (!program) throw new Error("Program not ready");

    const user = program.provider.publicKey;
    if (!user) throw new Error("Wallet not connected");

    const battleAccount = await program.account.battle.fetch(battlePda);
    const battleId = battleAccount.battleId;

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const battlePDA = battlePda;

    const [battlePositionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("battle_position"), battlePDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    const [battleVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("battle_vault"), battlePDA.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .enterBattle(side, new anchor.BN(amount))
      .accountsPartial({
        user,
        config: configPDA,
        battle: battlePDA,
        battlePosition: battlePositionPDA,
        battleVault: battleVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Real on-chain action → completes the "join meme battle" milestone.
    useGameStore.getState().completeLevel("join-meme-battle");

    // Best-effort: record the confirmed on-chain entry to the backend. The enum
    // arrives as { sideA: {} } / { sideB: {} } (or { a }/{ b }); map to "A"/"B".
    try {
      const sideLetter = side && ("sideA" in side || "a" in side) ? "A" : "B";
      await recordBattleEntry(battlePDA.toBase58(), {
        side: sideLetter,
        amount,
        txSignature: tx,
      });
    } catch (e) {
      console.warn("battle entry not recorded to backend:", e);
    }

    return { tx, battlePositionPDA };
  };

  const increaseBattlePosition = async ({ battlePda, additionalAmount }) => {
    if (!program) throw new Error("Program not ready");

    const user = program.provider.publicKey;
    if (!user) throw new Error("Wallet not connected");

    const battleAccount = await program.account.battle.fetch(battlePda);
    const battleId = battleAccount.battleId;

    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const battlePDA = battlePda;

    const [battlePositionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("battle_position"), battlePDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    const [battleVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("battle_vault"), battlePDA.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .increaseBattlePosition(new anchor.BN(additionalAmount))
      .accountsPartial({
        user,
        config: configPDA,
        battle: battlePDA,
        battlePosition: battlePositionPDA,
        battleVault: battleVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Best-effort: record the confirmed on-chain increase to the backend.
    try {
      await recordBattleIncrease(battlePDA.toBase58(), {
        amount: additionalAmount,
        txSignature: tx,
      });
    } catch (e) {
      console.warn("battle increase not recorded to backend:", e);
    }

    return { tx };
  };

  const resolveBattle = async ({ battlePda, winner }) => {
    if (!program) throw new Error("Program not ready");

    const resolver = program.provider.publicKey;
    if (!resolver) throw new Error("Wallet not connected");

    const battleAccount = await program.account.battle.fetch(battlePda);
    const battleId = battleAccount.battleId;

    // Config PDA
    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    const battlePDA = battlePda;

    const tx = await program.methods
      .resolveBattle(winner) // { sideA: {} } or { sideB: {} }
      .accountsPartial({
        resolver,
        config: configPDA,
        battle: battlePDA,
      })
      .rpc();

    return { tx };
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
    buyToken,
    sellToken,
    // migrateToDex,
    claimCreatorTokens,
    getUserAllTokens,
    getAllTokens,
    getBoughtTokens,
    withdrawCreatorRoyalties,
    createBattle,
    getAllBattles,
    getUserBattles,
    enterBattle,
    increaseBattlePosition,
    resolveBattle,
  };
}
