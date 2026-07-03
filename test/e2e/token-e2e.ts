/**
 * Full memecoin-launch proof on DEVNET against a running server (E2E_BASE_URL,
 * default http://localhost:3000):
 *  1. on-chain create_token_launch (real tx — pays the 0.1 SOL creation fee)
 *  2. wallet auth vs the server (nonce -> ed25519 sign -> session cookie)
 *  3. POST /api/launchpad/tokens with mint + txSignature (server verifies on-chain)
 *  4. on-chain buy_token (real bonding-curve purchase)
 *  5. POST /api/launchpad/tokens/[mint]/trade with the buy signature
 *
 * Mirrors app/utils/methods.tsx (createTokenLaunch/buyToken) exactly: same
 * PDAs (seed "platform_config"), same accounts, same arg shapes.
 */
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import nacl from "tweetnacl";
import bs58 from "bs58";
import type { PredictionMarket } from "../../idl/types";

const REPO = process.cwd(); // run from the repo root
const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
process.loadEnvFile(`${REPO}/.env`);

const idl = JSON.parse(
  readFileSync(`${REPO}/idl/prediction_market.json`, "utf8")
) as PredictionMarket;
const kp = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(`${REPO}/.devnet/id.json`, "utf8")))
);
const rpc =
  process.env.ANCHOR_PROVIDER_URL ||
  process.env.SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";
if (/mainnet/i.test(rpc)) throw new Error("mainnet RPC rejected");

// Alchemy free-tier WS lacks signatureSubscribe — confirm via the public devnet WS.
const conn = new Connection(rpc, {
  commitment: "confirmed",
  wsEndpoint: "wss://api.devnet.solana.com/",
});
const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(kp), {
  commitment: "confirmed",
});
const program = new anchor.Program<PredictionMarket>(idl, provider);
const PROGRAM_ID = new PublicKey(idl.address);

async function main() {
  console.log("wallet:", kp.publicKey.toBase58());
  const balance = await conn.getBalance(kp.publicKey);
  console.log("balance:", (balance / LAMPORTS_PER_SOL).toFixed(4), "SOL");
  if (balance < 0.3 * LAMPORTS_PER_SOL) {
    throw new Error("need >= 0.3 SOL (0.1 creation fee + rent + buy)");
  }

  // ---- 1. on-chain create_token_launch -----------------------------------
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_config")],
    PROGRAM_ID
  );
  const config = await program.account.platformConfig.fetch(configPDA);
  if (!config.tokenCreationEnabled) throw new Error("token creation disabled on-chain");
  const nextLaunchId = config.nextLaunchId;
  const [launchPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_launch"), nextLaunchId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
  const [mintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_mint"), launchPDA.toBuffer()],
    PROGRAM_ID
  );
  const [tokenVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), launchPDA.toBuffer()],
    PROGRAM_ID
  );
  const [solVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("sol_vault"), launchPDA.toBuffer()],
    PROGRAM_ID
  );
  console.log("launch id:", nextLaunchId.toString(), "mint:", mintPDA.toBase58());

  const name = "Quantum Meme";
  const symbol = "QMEME";
  const description = "E2E proof memecoin launched by a regular user wallet.";
  const imageUri = "/quantlogo.svg"; // the optional-image default the UI uses
  const initialPrice = config.minInitialPrice; // smallest the program allows
  const totalSupply = new anchor.BN(1_000_000); // program minimum

  const launchSig = await program.methods
    .createTokenLaunch(
      name,
      symbol,
      description,
      imageUri,
      { website: "", twitter: "", telegram: "", discord: "" },
      initialPrice,
      totalSupply,
      { exponential: {} },
      ["MEME", "E2E"]
    )
    .accountsPartial({
      creator: kp.publicKey,
      config: configPDA,
      tokenLaunch: launchPDA,
      tokenMint: mintPDA,
      tokenVault: tokenVaultPDA,
      solVault: solVaultPDA,
      treasury: config.treasury,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("create_token_launch tx:", launchSig);
  console.log(`  https://explorer.solana.com/tx/${launchSig}?cluster=devnet`);

  // ---- 2. wallet auth ------------------------------------------------------
  const walletAddress = kp.publicKey.toBase58();
  const nonceRes = await fetch(`${BASE}/api/auth/nonce`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
  const { message } = await nonceRes.json();
  if (!message) throw new Error("no nonce message");
  const signature = bs58.encode(
    nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey)
  );
  const verifyRes = await fetch(`${BASE}/api/auth/verify-wallet`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress, message, signature }),
  });
  const cookie = verifyRes.headers.get("set-cookie")?.split(";")[0];
  if (!verifyRes.ok || !cookie) throw new Error("auth failed");
  console.log("auth OK");

  // ---- 3. record the launch (server re-verifies the tx) --------------------
  const recRes = await fetch(`${BASE}/api/launchpad/tokens`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      name,
      symbol,
      description,
      imageUri,
      totalSupply: totalSupply.toString(),
      mint: mintPDA.toBase58(),
      txSignature: launchSig,
    }),
  });
  const recBody = await recRes.json();
  if (!recRes.ok) throw new Error(`record launch failed: ${JSON.stringify(recBody)}`);
  console.log("launch recorded:", recBody.data?.token?.id ?? recBody);

  // ---- 4. on-chain buy_token ------------------------------------------------
  const launch = await program.account.tokenLaunch.fetch(launchPDA);
  const buyerTokenAccount = getAssociatedTokenAddressSync(
    launch.tokenMint,
    kp.publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const buyAmount = new anchor.BN(100); // 100 tokens off the curve
  const buySig = await program.methods
    .buyToken(buyAmount)
    .accountsPartial({
      buyer: kp.publicKey,
      config: configPDA,
      tokenLaunch: launchPDA,
      tokenVault: launch.tokenVault,
      solVault: solVaultPDA,
      buyerTokenAccount,
      tokenMint: launch.tokenMint,
      treasury: config.treasury,
      royaltyVault: config.royaltyVault,
      battlePoolVault: config.battlePoolVault,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("buy_token tx:", buySig);
  console.log(`  https://explorer.solana.com/tx/${buySig}?cluster=devnet`);

  // ---- 5. record the buy ----------------------------------------------------
  const tradeRes = await fetch(
    `${BASE}/api/launchpad/tokens/${mintPDA.toBase58()}/trade`,
    {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ action: "buy", amount: 100, txSignature: buySig }),
    }
  );
  const tradeBody = await tradeRes.json();
  if (!tradeRes.ok) throw new Error(`record buy failed: ${JSON.stringify(tradeBody)}`);
  console.log("buy recorded:", JSON.stringify(tradeBody.data ?? tradeBody).slice(0, 200));

  console.log("\n✅ FULL MEMECOIN JOURNEY PASSED (launch + buy, on-chain + backend, devnet)");
}

main().catch((e) => {
  console.error("❌ FAILED:", e.message ?? e);
  process.exit(1);
});
