"use client";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/lib/useProgram";
import * as anchor from "@coral-xyz/anchor";
import { treasury, emergencyAdmin, getConfigPDA } from "@/config";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

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

    const platformFeeBps = 500; // 5%
    const minBetAmount = new anchor.BN(1);
    const maxBetAmount = new anchor.BN(1_00);
    const marketCreationFee = new anchor.BN(0);
    const minMarketDuration = new anchor.BN(60);
    const maxMarketDuration = new anchor.BN(604800);

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

  const initMarket = async (question: string) => {
    if (!program) {
      console.error("Program not ready");
      return;
    }

    const creator = program.provider.publicKey;
    if (!creator) {
      console.error("wallet not connected");
      return;
    }

    const category = { crypto: {} };
    const durationSeconds = new anchor.BN(3600 * 24); // 1 day
    const minBetAmount = new anchor.BN(1); // must be >= config.min_bet_amount
    const tags = ["BTC", "Price"];
    const imageUrl = "https://example.com/btc.png";
    const oracleSource = { manual: {} };

    // --- Derive Market PDA ---
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

    const mint = new PublicKey("4zHz8z45eJ9jC1mJ2NnBqA4s9Yg2eD4x84eXw67N23rT"); //usdc devnet 
    const vault = await anchor.utils.token.associatedAddress({
      mint,
      owner: marketPDA,
    }); // the account that will securely hold all those tokens for this market.

    try {
      const tx = await program.methods
        .initializeMarket(
          question,
          category,
          durationSeconds,
          minBetAmount,
          tags,
          imageUrl || null,
          oracleSource
        )
        .accounts({
          creator,
          config: configPDA,
          market: marketPDA,
          mint,
          vault,
          treasury: configAccount.treasury,
          priceFeed: anchor.web3.PublicKey.default, // if oracle = Manual
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log(
        "✅ Market initialized! Tx:",
        tx,
        "Market PDA:",
        marketPDA.toBase58()
      );
      return tx;
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

    const creator = program.provider.publicKey;
    if (!creator) throw new Error("Wallet not connected");

    // Derive UserPosition PDA
    const [userPositionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("position"), marketPDA.toBuffer(), creator.toBuffer()],
      program.programId
    );

    // Derive vault PDA (market token account)
    const mint = new PublicKey("Hw3EdBhfWFt1LfmL5xLy9VjBUYj8E55wpTC5AaeBdQAt"); // market currency
    const vault = await anchor.utils.token.associatedAddress({
      mint,
      owner: marketPDA,
    });

    // Derive user token account (SPL token)
    const userTokenAccount = await anchor.utils.token.associatedAddress({
      mint,
      owner: creator,
    });

    try {
      const tx = await program.methods
        .placeBet(outcome, new anchor.BN(amount))
        .accounts({
          user: creator,
          config: configPDA,
          market: marketPDA,
          userTokenAccount,
          vault,
          userPosition: userPositionPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Bet placed! Tx:", tx);
      return tx;
    } catch (err) {
      console.error("❌ Error placing bet:", err);
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

  const viewPrice = async (marketPDA: PublicKey, priceFeed: PublicKey) => {
    if (!program) throw new Error("Program not ready");

    try {
      const priceInfo = await program.methods
        .viewPrice()
        .accounts({
          market: marketPDA,
          priceFeed: priceFeed,
        })
        .view(); // Use `.view()` because it’s read-only

      console.log("✅ Price info:", priceInfo);
      return priceInfo;
    } catch (err) {
      console.error("❌ Error fetching price:", err);
      throw err;
    }
  };

  const settleMarket = async (
    marketPDA: PublicKey,
    resolver: PublicKey,
    priceFeed?: PublicKey, // optional for manual markets
    manualOutcome?: boolean // optional for manual markets
  ) => {
    if (!program) throw new Error("Program not ready");

    try {
      const tx = await program.methods
        .settleMarket(manualOutcome ?? null)
        .accounts({
          resolver,
          market: marketPDA,
          priceFeed: priceFeed ?? anchor.web3.PublicKey.default,
        })
        .rpc();

      console.log("✅ Market settled. Tx:", tx);
      return tx;
    } catch (err) {
      console.error("❌ Error settling market:", err);
      throw err;
    }
  };

  const withdrawWinnings = async (
    marketPDA: PublicKey,
    user: PublicKey,
    userTokenAccount: PublicKey
  ) => {
    if (!program) throw new Error("Program not ready");

    // Derive UserPosition PDA
    const [userPositionPDA, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), marketPDA.toBuffer(), user.toBuffer()],
      program.programId
    );

    // Derive vault PDA (market token account)
    const marketAccount = await program.account.market.fetch(marketPDA);
    const mint = marketAccount.mint;
    const vault = await anchor.utils.token.associatedAddress({
      mint,
      owner: marketPDA,
    });

    // Seeds for market authority
    const seeds = [
      Buffer.from("market"),
      marketAccount.marketId.toArrayLike(Buffer, "le", 8),
      [marketAccount.bump],
    ];

    try {
      const tx = await program.methods
        .withdrawWinnings()
        .accounts({
          user,
          market: marketPDA,
          userPosition: userPositionPDA,
          vault,
          userTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([]) // signer is the connected wallet
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
    viewPrice,
    settleMarket,
    withdrawWinnings,
  };
}
