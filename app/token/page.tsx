"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import {
  MAX_TOKEN_SUPPLY,
  MIN_INITIAL_PRICE,
  MIN_TOKEN_SUPPLY,
} from "@/config";
import Methods, { createToeknParams } from "../utils/methods";
import { useProgram } from "../utils/useProgram";

// Shorten wallet pubkey
function short(pk?: PublicKey | string | null) {
  if (!pk) return "";
  const s = pk.toString();
  return s.slice(0, 6) + "…" + s.slice(-6);
}

//  Custom input with green highlight
const GreenInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) => {
  const isFilled = value && value.toString().trim().length > 0;

  return (
    <div className="flex flex-col">
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg px-3 py-2 text-sm bg-zinc-900/60 border transition-all duration-200 outline-none text-white ${
          isFilled
            ? "border-green-500 shadow-[0_0_10px_#00ff8050]"
            : "border-zinc-700 focus:border-green-400"
        }`}
      />
      {isFilled && (
        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
          ✔ Valid {label.toLowerCase()}
        </p>
      )}
    </div>
  );
};

export default function LaunchPage() {
  const program = useProgram();
  const wallet = useWallet();
  const { createTokenLaunch } = Methods();

  const [desc, setDesc] = useState("");
  const [initialPrice, setInitialPrice] = useState<number>(MIN_INITIAL_PRICE);
  const [tags, setTags] = useState<string>("defi,utility");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState<string>("");
  const [supply, setSupply] = useState<number>(MIN_TOKEN_SUPPLY);
  const [decimals, setDecimals] = useState<number>();
  const [imgUrl, setImgUrl] = useState<string>();

  const [status, setStatus] = useState<string>("Idle");
  const [mintPubkey, setMintPubkey] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);

  function formatNumber(num: number): string {
    if (num >= 1_000_000_000_000)
      return (num / 1_000_000_000_000).toFixed(2) + " Trillion";
    if (num >= 1_000_000_000)
      return (num / 1_000_000_000).toFixed(2) + " Billion";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + " Million";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + " Thousand";
    return num.toString();
  }

  //  Validation before creating
  function validateInputs() {
    const errors = [];
    if (!name) errors.push("Token Name");
    if (!symbol) errors.push("Token Symbol");
    if (!desc) errors.push("Description");
    if (!supply) errors.push("Total Supply");
    if (!decimals && decimals !== 0) errors.push("Decimals");
    if (!imgUrl) errors.push("Image URL");
    if (!initialPrice) errors.push("Initial Price");
    if (!tags) errors.push("Tags");
    if (!website) errors.push("Website");
    if (!twitter) errors.push("Twitter");
    if (!telegram) errors.push("Telegram");

    if (errors.length > 0) {
      const msg = `⚠️ Please fill required fields: ${errors.join(", ")}`;
      setStatus(msg);
      toast.error(msg);
      return false;
    }
    return true;
  }

  async function handleCreateToken() {
    if (!validateInputs()) return;

    try {
      setDeploying(true);
      setStatus("Deploying token...");
      const data: createToeknParams = {
        name,
        symbol,
        description: desc,
        imageUrl:
          imgUrl ||
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        socialLinks: { website, twitter, telegram },
        initialPrice,
        totalSupply: supply,
        CurveTypes: "exponential",
        tags: tags.split(",").map((t) => t.trim()),
      };

      const result = await createTokenLaunch(data);
      if (result) {
        const { tokenMint } = result;
        setMintPubkey(tokenMint);
        setStatus("Token launched successfully!");
      }
    } catch (err: any) {
      console.error(err);
      const msg = "❌ " + (err.message || "Error creating token");
      toast.error(msg);
      setStatus(msg);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 mt-20">
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

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GreenInput
              label="Token Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Polkadot"
              required
            />
            <GreenInput
              label="Token Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. DOT"
              required
            />

            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description about your token"
                className={`w-full bg-zinc-900/60 border rounded-lg px-3 py-2 text-sm text-white resize-none transition-all duration-200 ${
                  desc.trim()
                    ? "border-green-500 shadow-[0_0_10px_#00ff8050]"
                    : "border-zinc-700 focus:border-green-400"
                }`}
              />
              {desc.trim() && (
                <p className="text-xs text-green-500 mt-1">
                  ✔ Valid description
                </p>
              )}
            </div>

            <GreenInput
              label={`Total Supply Min: ${formatNumber(
                MIN_TOKEN_SUPPLY
              )}, Max: ${formatNumber(MAX_TOKEN_SUPPLY)}`}
              type="number"
              value={supply}
              onChange={(e) => setSupply(Number(e.target.value))}
              placeholder="1000000"
              required
            />

            <GreenInput
              label="Decimals"
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
              placeholder="9"
              required
            />

            <GreenInput
              label="Image URL"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://example.com/token.png"
              required
            />

            <GreenInput
              label="Initial Price (Lamports)"
              type="number"
              value={initialPrice}
              onChange={(e) => setInitialPrice(Number(e.target.value))}
              placeholder="100000000"
              required
            />

            <GreenInput
              label="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="defi, utility"
              required
            />

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GreenInput
                label="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL"
              />
              <GreenInput
                label="Twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter link"
              />
              <GreenInput
                label="Telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Telegram link"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-6">
            {/* Create & Mint Token — Subtle Solana Gradient */}
            <button
              onClick={handleCreateToken}
              disabled={deploying || !wallet.publicKey}
              className="px-6 py-2.5 rounded-full font-semibold text-sm text-white
               bg-gradient-to-r from-[#3a1c71] via-[#5f2c82] to-[#00c9a7]
               hover:from-[#4b257f] hover:via-[#6934a3] hover:to-[#00e6be]
               transition-all duration-300 shadow-md border border-[#2b2b2b]
               disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deploying ? "Deploying..." : "Create & Mint Token"}
            </button>

            {/* Connect Wallet */}
            <button
              onClick={() => wallet.connect()}
              className="px-4 py-2 rounded-full bg-zinc-800/60 text-sm border border-zinc-700 
               hover:bg-zinc-700/50 transition text-white"
            >
              {wallet.connected ? short(wallet.publicKey) : "Connect Wallet"}
            </button>

            <span className="ml-auto text-xs text-zinc-500">
              Cluster: Mainnet
            </span>
          </div>

          {/* Token Info */}
          {mintPubkey && (
            <div className="mt-6 flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <img
                src={imgUrl || ""}
                alt="Token"
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
              />
              <div>
                <div className="text-sm text-white font-semibold">
                  {name} ({symbol})
                </div>
                <div className="text-xs text-zinc-400">
                  Mint:{" "}
                  <span className="font-mono text-green-400">
                    {short(mintPubkey)}
                  </span>
                </div>
                <a
                  href={`https://solscan.io/token/${mintPubkey}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:underline"
                >
                  View on Solscan ↗
                </a>
              </div>
            </div>
          )}

          {/* Status */}
          <div
            className={`mt-4 border rounded-xl p-4 ${
              status.startsWith("⚠️") || status.startsWith("❌")
                ? "border-red-500/40 bg-red-900/20"
                : status.startsWith("✅")
                ? "border-green-500/40 bg-green-900/20"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            <div className="text-xs text-zinc-400">Status</div>
            <div className="text-sm text-white mt-1">{status}</div>
          </div>
        </motion.div>
      </div>

      {/* Remove sliders */}
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
