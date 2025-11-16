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
// import { useProgram } from "../utils/useProgram";

function short(pk?: PublicKey | string | null) {
  if (!pk) return "";
  const s = pk.toString();
  return s.slice(0, 6) + "…" + s.slice(-6);
}

const GreenInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  helper,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  helper?: string | React.ReactNode;
}) => {
  const isFilled =
    value !== undefined &&
    value !== null &&
    (typeof value === "number" ? true : value.toString().trim().length > 0);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
        <span>{label}</span>
        {isFilled && (
          <span className="text-xs text-green-400 font-medium">✔</span>
        )}
      </label>
      <input
        type={type}
        value={value as any}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg px-3 py-2 text-sm bg-[#0b0b0c] border transition-all duration-200 outline-none text-white placeholder:text-zinc-500
          ${
            isFilled
              ? "border-green-600 shadow-[0_0_10px_#00ff8050]"
              : "border-zinc-800 focus:border-green-500"
          }`}
      />
      {helper && <div className="text-xs text-zinc-500 mt-1">{helper}</div>}
      {isFilled && (
        <p className="text-xs text-green-400 mt-1">{`✔ Valid ${label.toLowerCase()}`}</p>
      )}
    </div>
  );
};

export default function LaunchPage() {
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

  const [featureMintable, setFeatureMintable] = useState(true);
  const [featureBurnable, setFeatureBurnable] = useState(true);
  const [featurePausable, setFeaturePausable] = useState(false);
  const [featureTax, setFeatureTax] = useState(false);

  const [network] = useState("Solana");

  function formatNumber(num: number): string {
    if (num >= 1_000_000_000_000)
      return (num / 1_000_000_000_000).toFixed(2) + " Trillion";
    if (num >= 1_000_000_000)
      return (num / 1_000_000_000).toFixed(2) + " Billion";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + " Million";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + " Thousand";
    return num.toString();
  }

  function validateInputs() {
    const errors: string[] = [];
    if (!name) errors.push("Token Name");
    if (!symbol) errors.push("Token Symbol");
    if (!desc) errors.push("Description");
    if (!supply) errors.push("Total Supply");
    if (decimals === undefined || decimals === null) errors.push("Decimals");
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
      const msg = err.message || "Error creating token";
      toast.error(msg);
      setStatus(msg);
    } finally {
      setDeploying(false);
    }
  }

  const FeatureCard = ({
    title,
    subtitle,
    active,
    onToggle,
    color = "purple",
    disabled = false,
    pill,
  }: {
    title: string;
    subtitle: string;
    active: boolean;
    onToggle: () => void;
    color?: "purple" | "orange" | "gray";
    disabled?: boolean;
    pill?: string;
  }) => {
    const base =
      "rounded-xl p-4 border transition cursor-pointer select-none flex flex-col justify-between min-h-[92px]";
    const colors: Record<string, string> = {
      purple:
        "bg-gradient-to-r from-[#22142f]/70 to-[#2f163c]/50 border-[#6f3fc6]/60 shadow-[0_8px_40px_rgba(111,63,198,0.06)]",
      orange:
        "bg-gradient-to-r from-[#241507]/70 to-[#2b1407]/50 border-[#b86a00]/60 shadow-[0_8px_40px_rgba(184,106,0,0.04)]",
      gray: "bg-[#0c0c0d] border-[#282828] text-zinc-400 opacity-80 cursor-not-allowed",
    };
    const activeBadge =
      "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider";

    return (
      <div
        onClick={() => {
          if (!disabled) onToggle();
        }}
        className={`${base} ${disabled ? colors.gray : colors[color]} ${
          active && !disabled ? "ring-2 ring-offset-0 ring-[#8de19c33]" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-md flex items-center justify-center ${
                disabled ? "bg-zinc-900/40" : "bg-white/10"
              }`}
            >
              {/* simple icon placeholder */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-90"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" />
              </svg>
            </div>
            <div>
              <div
                className={`text-sm font-semibold ${
                  disabled ? "text-zinc-400" : "text-white"
                }`}
              >
                {title}
              </div>
              <div className="text-xs mt-1 text-zinc-400">{subtitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pill && (
              <div
                className={`text-xs rounded-full px-2 py-0.5 ${
                  disabled
                    ? "bg-zinc-800 text-zinc-500"
                    : "bg-white/10 text-white"
                }`}
              >
                {pill}
              </div>
            )}
            <div
              className={`w-4 h-4 rounded-sm border ${
                active && !disabled
                  ? "bg-green-500 border-green-600"
                  : "bg-transparent border-zinc-700"
              }`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen mt-20 flex justify-center p-6 pb-20">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#0f0f10]/80 border border-[#1b1b1d] rounded-2xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Header */}
          <header className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Deploy Your Token
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Preview:{" "}
                {symbol
                  ? `${symbol} Token ready for deployment`
                  : "Fill details to preview"}
              </p>
            </div>
            <div className="ml-auto text-sm text-zinc-500">
              <div>Program: Token-2022</div>
              <div className="mt-2">
                {wallet.connected ? (
                  <button
                    className="px-3 py-1 rounded-full bg-zinc-800/60 text-white text-xs border border-zinc-700"
                    onClick={() => wallet.disconnect()}
                  >
                    {short(wallet.publicKey)}
                  </button>
                ) : (
                  <button
                    onClick={() => wallet.connect()}
                    className="px-3 py-1 rounded-full bg-zinc-800/60 text-white text-xs border border-zinc-700"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </header>

          {/*  Basic Information Section  */}
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white">
                ✓
              </div>
              <h2 className="text-lg font-semibold text-white">
                Basic Information
              </h2>
            </div>

            <div className="bg-[#0b0b0c] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GreenInput
                  label="Token Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Polkadot"
                />
                <GreenInput
                  label="Token Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. DOT"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <GreenInput
                    label={`Total Supply — Min: ${formatNumber(
                      MIN_TOKEN_SUPPLY
                    )}, Max: ${formatNumber(MAX_TOKEN_SUPPLY)}`}
                    type="number"
                    value={supply}
                    onChange={(e) => setSupply(Number(e.target.value || 0))}
                    placeholder="1,000,000,000"
                  />
                </div>
                <div>
                  <GreenInput
                    label="Decimals"
                    type="number"
                    value={decimals ?? ""}
                    onChange={(e) => setDecimals(Number(e.target.value))}
                    placeholder="18"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Token Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe your token's purpose, use case, and unique features..."
                  className={`w-full bg-[#070707] border rounded-lg px-4 py-3 text-sm text-white resize-none transition-all duration-200 ${
                    desc.trim()
                      ? "border-green-600 shadow-[0_0_12px_#00ff8050]"
                      : "border-zinc-800 focus:border-green-500"
                  }`}
                  rows={4}
                />
                {desc.trim() && (
                  <p className="text-xs text-green-400 mt-2">
                    ✔ Comprehensive description provided
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GreenInput
                  label="Image URL"
                  value={imgUrl ?? ""}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://example.com/token.png"
                />
                <GreenInput
                  label="Initial Price (Lamports)"
                  type="number"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(Number(e.target.value || 0))}
                  placeholder="100000000"
                />
                <GreenInput
                  label="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="defi, utility"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GreenInput
                  label="Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://myproject.xyz"
                />
                <GreenInput
                  label="Twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@project"
                />
                <GreenInput
                  label="Telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="t.me/project"
                />
              </div>
            </div>
          </section>

          {/* Token Features Section  */}
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white">
                ✓
              </div>
              <h2 className="text-lg font-semibold text-white">
                Token Features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FeatureCard
                title="Mintable"
                subtitle="Enable creating additional tokens after deployment. Perfect for gradual releases."
                active={featureMintable}
                onToggle={() => setFeatureMintable((s) => !s)}
                color="purple"
                pill={featureMintable ? "ENABLED" : undefined}
              />
              <FeatureCard
                title="Burnable"
                subtitle="Allow token holders to permanently destroy their tokens, reducing total supply."
                active={featureBurnable}
                onToggle={() => setFeatureBurnable((s) => !s)}
                color="orange"
                pill={featureBurnable ? "ENABLED" : undefined}
              />
              <FeatureCard
                title="Pausable"
                subtitle="Emergency pause mechanism to freeze all token transfers in case of security issues."
                active={featurePausable}
                onToggle={() => setFeaturePausable((s) => !s)}
                color="gray"
                disabled={true}
                pill={featurePausable ? "ENABLED" : "DISABLED"}
              />
              <FeatureCard
                title="Tax System"
                subtitle="Automatic fee deduction on transfers. Useful for liquidity pools and rewards."
                active={featureTax}
                onToggle={() => setFeatureTax((s) => !s)}
                color="gray"
                disabled={true}
                pill={featureTax ? "ENABLED" : "DISABLED"}
              />
            </div>

            {/* Security Features Included */}
            <div className="rounded-xl border border-green-700/30 bg-[#04200b]/60 p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-700 flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L3 6v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V6l-9-4z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">
                    Security Features Included
                  </div>
                  <ul className="list-none mt-2 text-sm text-zinc-200">
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✔</span> Ownership
                      management with renounce capability
                    </li>
                    <li className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-green-400">✔</span> Reentrancy
                      protection on all transfers
                    </li>
                    <li className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-green-400">✔</span> OpenZeppelin
                      audited smart contract library
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Network Selection  */}
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white">
                ✓
              </div>
              <h2 className="text-lg font-semibold text-white">
                Network Selection
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`rounded-xl p-4 border transition cursor-pointer flex flex-col items-start gap-3 ${
                  network === "Solana"
                    ? "border-[#7b4dff] bg-[#241433] shadow-[0_8px_40px_rgba(123,77,255,0.06)]"
                    : "border-[#252526] bg-[#070708]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#3b2c50] flex items-center justify-center text-white">
                    S
                  </div>
                  <div>
                    <div className="text-white font-semibold">Solana</div>
                    <div className="text-xs text-zinc-500">
                      Gas: ~0.00001 SOL
                    </div>
                  </div>
                </div>
                {network === "Solana" && (
                  <div className="text-xs text-[#7b4dff] font-semibold">
                    SELECTED
                  </div>
                )}
              </div>
            </div>
          </section>

          {/*  Deployment Summary  */}
          <section className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Deployment Summary
              </h3>
            </div>

            <div className="rounded-xl border border-[#381b52] bg-gradient-to-r from-[#20132a] to-[#291634] p-5 text-sm text-zinc-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-xs text-zinc-400">Token Name</div>
                  <div className="text-sm font-semibold text-white">
                    {name || "—"}
                  </div>

                  <div className="text-xs text-zinc-400 mt-3">Symbol</div>
                  <div className="text-sm font-semibold text-white">
                    {symbol || "—"}
                  </div>

                  <div className="text-xs text-zinc-400 mt-3">Total Supply</div>
                  <div className="text-sm font-semibold text-white">
                    {supply ? formatNumber(supply) : "—"}
                  </div>

                  <div className="text-xs text-zinc-400 mt-3">Network</div>
                  <div className="text-sm font-semibold text-[#9ad6ff]">
                    {network}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-zinc-400">Mintable</div>
                  <div
                    className={`text-sm font-semibold ${
                      featureMintable ? "text-green-400" : "text-zinc-400"
                    }`}
                  >
                    {featureMintable ? "Yes" : "No"}
                  </div>

                  <div className="text-xs text-zinc-400 mt-3">Burnable</div>
                  <div
                    className={`text-sm font-semibold ${
                      featureBurnable ? "text-green-400" : "text-zinc-400"
                    }`}
                  >
                    {featureBurnable ? "Yes" : "No"}
                  </div>

                  <div className="text-xs text-zinc-400 mt-3">Est. Gas</div>
                  <div className="text-sm font-semibold text-white">
                    0.00001 SOL
                  </div>

                  <div className="text-xs text-zinc-400 mt-3">≈ USD</div>
                  <div className="text-sm font-semibold text-white">$150</div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons  */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleCreateToken}
                disabled={deploying || !wallet.publicKey}
                className="md:col-span-2 py-3 rounded-full font-semibold text-white text-sm
               bg-gradient-to-r from-[#7b4dff] via-[#c53aff] to-[#ff3895]
               hover:brightness-105 transition-all duration-300 shadow-[0_8px_40px_rgba(123,77,255,0.12)]
               disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deploying
                  ? "Deploying..."
                  : `Deploy ${name || "Token"} (${symbol || ""})`}
              </button>

              <button
                onClick={() => wallet.connect()}
                className="py-3 rounded-full bg-[#0b0b0c] border border-zinc-800 text-sm text-white"
              >
                {wallet.connected ? short(wallet.publicKey) : "Connect Wallet"}
              </button>
            </div>

            {/* Ready to Deploy Box (Solana friendly) */}
            <div className="rounded-xl border border-green-700/30 bg-[#052013]/60 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-green-600 flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Ready to Deploy
                </div>
                <div className="text-xs text-zinc-300">
                  All checks passed · Token ready for deployment on Solana
                </div>
              </div>
              <div className="ml-auto text-sm text-zinc-400">Verified</div>
            </div>
          </div>

          {/*  Token Info (after deploy)  */}
          {mintPubkey && (
            <div className="mt-6 flex items-center gap-3 bg-[#070707]/60 border border-zinc-800 rounded-xl p-4">
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

      {/* Remove number input spinners */}
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
