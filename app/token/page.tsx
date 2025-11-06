"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Methods, { createToeknParams } from "../contract_methods/methods";
import * as anchor from "@coral-xyz/anchor";
import { useProgram } from "@/lib/useProgram";
import toast from "react-hot-toast";

function short(pk?: PublicKey | string | null) {
  if (!pk) return "";
  const s = pk.toString();
  return s.slice(0, 6) + "…" + s.slice(-6);
}

export default function LaunchPage() {
  const program = useProgram();
  const wallet = useWallet();
  const [desc, setDesc] = useState("");
  const [initialPrice, setInitialPrice] = useState<number>(100000000);
  // const [curve, setCurve] = useState<"linear" | "exponential" | "logarithmic">(
  //   "linear"
  // );
  const [tags, setTags] = useState<string>("defi,utility");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState<string>("");
  const [supply, setSupply] = useState<number>();
  const [decimals, setDecimals] = useState<number>();
  const [imgUrl, setImgUrl] = useState<string>();

  const [status, setStatus] = useState<string>("Idle");
  const [mintPubkey, setMintPubkey] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const { createTokenLaunch, buyToken, sellToken, claimCreatorTokens } =
    Methods();

  const findLaunchIdByMint = async (mintAddress: PublicKey) => {
    try {
      // Fetch all token launch accounts
      const launches = await program?.account.tokenLaunch.all();
      if (!launches) {
        toast.error("token not found ");
        return;
      }
      // Look for the one that matches the mint address
      for (const launch of launches) {
        if (launch.account.tokenMint.toBase58() === mintAddress.toBase58()) {
          console.log(
            "✅ Found Launch ID:",
            launch.account.launchId.toNumber()
          );
          return launch.account.launchId.toNumber();
        }
      }

      console.warn("⚠️ No launch found for mint:", mintAddress.toBase58());
      return null;
    } catch (e) {
      console.error("❌ Failed to fetch TokenLaunch accounts:", e);
      return null;
    }
  };

  async function handleCreateToken() {
    try {
      const tokenID = await findLaunchIdByMint(
        new PublicKey("33T6Lj5hgYnR1Q9u5vngqDHmEXp3FLacfddWGxxT8vA5")
      );

      await claimCreatorTokens(tokenID);
      // await buyToken(tokenID, 100);
      // await sellToken(tokenID, 10);

      // const data: createToeknParams = {
      //   name,
      //   symbol,
      //   description: desc,
      //   imageUrl:
      //     imgUrl ||
      //     " https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      //   socialLinks: {
      //     website,
      //     twitter,
      //     telegram,
      //   },
      //   initialPrice,
      //   totalSupply: supply || 100000000,
      //   CurveTypes: "exponential",
      //   tags: tags.split(",").map((t) => t.trim()),
      // };
      // const { tx, tokenMint, tokenVault, solVault } = await createTokenLaunch(
      //   data
      // );
      // console.table({ tx, tokenMint, tokenVault, solVault });
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err?.message || String(err)));
    } finally {
      setDeploying(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 mt-20">
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

          {/* Input Fields */}
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

            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description about your token"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm h-20 focus:ring-2 focus:ring-purple-500"
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

            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">
                Initial Price (Lamports)
              </label>
              <input
                value={initialPrice}
                onChange={(e) => setInitialPrice(Number(e.target.value))}
                type="number"
                placeholder="100000000"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Curve Type
              </label>
              <select
                value={curve}
                onChange={(e) => setCurve(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="sigmoid">Sigmoid</option>
              </select>
            </div> */}

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Tags (comma separated)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="defi, utility"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL"
                className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter link"
                className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Telegram link"
                className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
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
