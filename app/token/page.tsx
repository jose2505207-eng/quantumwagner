"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Methods, { createToeknParams } from "../contract_methods/methods";
import { CurveTypes } from "@/config";
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

function short(pk?: PublicKey | string | null) {
  if (!pk) return "";
  const s = pk.toString();
  return s.slice(0, 6) + "…" + s.slice(-6);
}

export default function LaunchPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState("Nebula");
  const [symbol, setSymbol] = useState("NEB");
  const [supply, setSupply] = useState<number>(1000000);
  const [decimals, setDecimals] = useState<number>(9);
  const [imgUrl, setImgUrl] = useState<string>(
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
  );

  const [status, setStatus] = useState<string>("Idle");
  const [mintPubkey, setMintPubkey] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const { createTokenLaunch } = Methods();
  async function handleCreateToken() {
    // try {
    //   if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    //     setStatus("Please connect your wallet (Phantom).");
    //     return;
    //   }
    //   setDeploying(true);
    //   setStatus("Preparing mint account...");
    //   const payerPubkey = wallet.publicKey;
    //   const mintKeypair = Keypair.generate();
    //   const mintRent = await getMinimumBalanceForRentExemptMint(connection);
    //   const tx = new Transaction();
    //   tx.add(
    //     SystemProgram.createAccount({
    //       fromPubkey: payerPubkey,
    //       newAccountPubkey: mintKeypair.publicKey,
    //       space: 82,
    //       lamports: mintRent,
    //       programId: TOKEN_2022_PROGRAM_ID,
    //     })
    //   );
    //   // signer = mint authority, no freeze authority => mintable only by signer
    //   tx.add(
    //     createInitializeMintInstruction(
    //       mintKeypair.publicKey,
    //       decimals,
    //       payerPubkey,
    //       null,
    //       TOKEN_2022_PROGRAM_ID
    //     )
    //   );
    //   tx.feePayer = payerPubkey;
    //   tx.recentBlockhash = (
    //     await connection.getLatestBlockhash("finalized")
    //   ).blockhash;
    //   setStatus("Requesting wallet signature...");
    //   const signedByWallet = await wallet.signTransaction!(tx);
    //   signedByWallet.partialSign(mintKeypair);
    //   setStatus("Creating mint...");
    //   const txid = await connection.sendRawTransaction(
    //     signedByWallet.serialize()
    //   );
    //   await connection.confirmTransaction(txid, "finalized");
    //   setMintPubkey(mintKeypair.publicKey.toBase58());
    //   setStatus(`Mint created: ${mintKeypair.publicKey.toBase58()}`);
    //   const ata = await getAssociatedTokenAddress(
    //     mintKeypair.publicKey,
    //     payerPubkey,
    //     false,
    //     TOKEN_2022_PROGRAM_ID,
    //     ASSOCIATED_TOKEN_PROGRAM_ID
    //   );
    //   const mintTx = new Transaction();
    //   mintTx.feePayer = payerPubkey;
    //   mintTx.recentBlockhash = (
    //     await connection.getLatestBlockhash("finalized")
    //   ).blockhash;
    //   const ataInfo = await connection.getAccountInfo(ata);
    //   if (!ataInfo) {
    //     mintTx.add(
    //       createAssociatedTokenAccountInstruction(
    //         payerPubkey,
    //         ata,
    //         payerPubkey,
    //         mintKeypair.publicKey,
    //         TOKEN_2022_PROGRAM_ID,
    //         ASSOCIATED_TOKEN_PROGRAM_ID
    //       )
    //     );
    //   }
    //   const amountToMint = BigInt(supply) * BigInt(10 ** decimals);
    //   mintTx.add(
    //     createMintToInstruction(
    //       mintKeypair.publicKey,
    //       ata,
    //       payerPubkey,
    //       amountToMint,
    //       [],
    //       TOKEN_2022_PROGRAM_ID
    //     )
    //   );
    //   const signedMintTx = await wallet.signTransaction!(mintTx);
    //   const mintTxid = await connection.sendRawTransaction(
    //     signedMintTx.serialize()
    //   );
    //   await connection.confirmTransaction(mintTxid, "finalized");
    //   setStatus("Minted initial supply to your wallet.");
    // } catch (err: any) {
    //   console.error(err);
    //   setStatus("Error: " + (err?.message || String(err)));
    // } finally {
    //   setDeploying(false);
    // }

    const data: createToeknParams = {
      name: "AD",
      symbol: "AD",
      description: "Demo token",
      imageUrl:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      socialLinks: {
        website: "https://github.com/akash-wt",
        twitter: "https://twitter.com/example",
        telegram: "https://t.me/example",
      },
      initialPrice: 100000000,
      totalSupply: 1_000_000,
      CurveTypes: "linear", //
      tags: ["defi", "utility"],
    };

    await createTokenLaunch(data);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-lg"
        >
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Token Launchpad</h1>
              <p className="text-sm text-zinc-400">
                Create and mint a Token-2022 on Solana Devnet
              </p>
            </div>
            <span className="text-xs text-zinc-500">Program: Token-2022</span>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Token Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nebula"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Symbol</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. NEB"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Total Supply
              </label>
              <input
                value={supply}
                onChange={(e) => setSupply(Number(e.target.value))}
                type="number"
                placeholder="1000000"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 no-spinner"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Decimals
              </label>
              <input
                value={decimals}
                onChange={(e) => setDecimals(Number(e.target.value))}
                type="number"
                placeholder="9"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 no-spinner"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">
                Image URL
              </label>
              <input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="https://example.com/token.png"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleCreateToken}
              disabled={deploying || !wallet.publicKey}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 font-semibold text-sm text-white disabled:opacity-50"
            >
              {deploying ? "Deploying..." : "Create & Mint Token"}
            </button>

            <button
              onClick={() => wallet.connect()}
              className="px-4 py-2 rounded-full bg-zinc-800/50 text-sm border border-zinc-700 hover:bg-zinc-700/40 transition"
            >
              {wallet.connected ? short(wallet.publicKey) : "Connect Wallet"}
            </button>

            <span className="ml-auto text-xs text-zinc-500">
              Cluster: devnet
            </span>
          </div>

          {mintPubkey && (
            <div className="mt-6 flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <Image
                src={imgUrl}
                alt="Token"
                className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
              />
              <div>
                <div className="text-sm text-white font-semibold">
                  {name} ({symbol})
                </div>
                <div className="text-xs text-zinc-400">
                  Mint:{" "}
                  <span className="font-mono text-purple-400">
                    {short(mintPubkey)}
                  </span>
                </div>
                <a
                  href={`https://solscan.io/token/${mintPubkey}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pink-400 hover:underline"
                >
                  View on Solscan ↗
                </a>
              </div>
            </div>
          )}

          <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400">Status</div>
            <div className="text-sm text-white mt-1">{status}</div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </main>
  );
}
