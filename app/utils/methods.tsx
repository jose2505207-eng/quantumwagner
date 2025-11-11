"use client";

import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { useProgram } from "@/app/utils/useProgram";
import * as anchor from "@coral-xyz/anchor";
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
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
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
  };
  initialPrice: number;
  totalSupply: number;
  CurveTypes: "linear" | "exponential" | "logarithmic";
  tags: string[];
}

type BoughtToken = {
  mint: string;
  balance: number;
  ata: string;
  tokenData: any; // You can make this more specific later with your TokenLaunch type
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
      console.log("Config account exists:", configAccount);
    } catch (err) {
      console.log("Config account not found, safe to initialize.");
    }

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
          { exponential: {} },
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
      return {
        tx,
        tokenMint: tokenMintPda.toBase58(),
        tokenVault: tokenVaultPda.toBase58(),
        solVault: solVaultPda.toBase58(),
      };
    } catch (e) {
      console.error(e);
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
        .accounts({
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

      console.log("✅ Buy Token TX:", tx);
      toast.success("Token purchase successful!");
    } catch (e) {
      console.error("❌ Buy token failed:", e);
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

    // 3) Seller’s ATA for this mint (must exist and have tokens)
    const sellerTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      seller,
      false
    );

    // (optional) quick client-side sanity check
    const bal = await program.provider.connection
      .getTokenAccountBalance(sellerTokenAccount)
      .catch(() => null);
    if (!bal || Number(bal.value.amount) < tokenAmount)
      throw new Error("Not enough tokens in seller ATA");

    // 4) Build + send tx
    const tx = await program.methods
      .sellToken(new anchor.BN(tokenAmount))
      .accounts({
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

    console.log("✅ Sell Token TX:", tx);
    return tx;
  };

  // const migrateToDex = async (tokenId: number) => {
  //   try {
  //     if (!program) throw new Error("Program not ready!");
  //     const provider = program.provider as anchor.AnchorProvider;
  //     const creator = provider.publicKey;
  //     if (!creator) throw new Error("Wallet not connected!");

  //     toast.loading("Migrating token to DEX...");

  //     // === Derive PDAs ===
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

  //     // === Fetch Accounts ===
  //     const configAccount = await program.account.platformConfig.fetch(
  //       configPDA
  //     );
  //     const tokenLaunchAccount = await program.account.tokenLaunch.fetch(
  //       tokenLaunchPDA
  //     );

  //     // === Pool-related PDAs (mock Raydium) ===
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

  //     // === Creator LP Account (must exist before call) ===
  //     const creatorLpAccount = await getOrCreateAssociatedTokenAccount(
  //       provider.connection,
  //       provider.wallet.payer,
  //       poolTokenMint, // LP mint from DEX mock
  //       creator,
  //       true // allow owner off-curve
  //     );

  //     // === Execute Transaction ===
  //     const tx = await program.methods
  //       .migrateToDex()
  //       .accounts({
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
  //     console.log("Transaction Signature:", tx);
  //     return tx;
  //   } catch (err: any) {
  //     toast.dismiss();
  //     console.error("Migration error:", err);
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
      console.log("Claiming creator token...");

      const tx = await program.methods
        .claimCreatorTokens()
        .accounts({
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
      console.log("Token claimed successfully :", tx);
    } catch (e: any) {
      const message = e?.error?.message || e?.message || String(e);
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
    console.log(accounts);

    return accounts;
  };

  const getBoughtTokens = async (): Promise<BoughtToken[]> => {
    try {
      if (!program) throw new Error("Program not found");

      const user = program.provider?.publicKey;
      if (!user) throw new Error("Wallet not connected");

      const allTokens = await program.account.tokenLaunch.all();
      if (!allTokens || allTokens.length === 0) {
        console.log("No token launches found.");
        return [];
      }

      const boughtTokens: BoughtToken[] = [];

      for (const token of allTokens) {
        if (!token?.account) continue;

        const mintAddress = token.account.tokenMint || token.account.token_mint;
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
          if (!err.message.includes("could not find account")) {
            console.warn("Skipping mint:", mintAddress, err.message);
          }
        }
      }

      console.log("Bought Tokens:", boughtTokens);
      return boughtTokens;
    } catch (err) {
      console.error("Error fetching bought tokens:", err);
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

      // === Derive PDAs ===
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

      // === Fetch program data ===
      const configAccount = await program.account.platformConfig.fetch(
        configPDA
      );
      const tokenLaunchAccount = await program.account.tokenLaunch.fetch(
        tokenLaunchPDA
      );

      // Royalty vault (comes from config)
      const royaltyVault = configAccount.royaltyVault as PublicKey;

      // === Execute transaction ===
      const tx = await program.methods
        .withdrawCreatorRoyalties()
        .accounts({
          creator,
          config: configPDA,
          tokenLaunch: tokenLaunchPDA,
          royaltyVault,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.dismiss();
      toast.success("💰 Royalties withdrawn successfully!");
      console.log("Transaction Signature:", tx);
      return tx;
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || "";

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
  };
}
