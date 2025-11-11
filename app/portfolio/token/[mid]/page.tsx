"use client";
import { useParams } from "next/navigation";
import { Spinner } from "../../page";
import { BN, web3 } from "@coral-xyz/anchor";
import Image from "next/image";
import {
  Globe,
  Send,
  Twitter,
  Copy,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Gift,
  Rocket,
  Crown,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useUserTokens } from "@/app/utils/useUserTokens";
import Methods from "@/app/utils/methods";

const { PublicKey } = web3;

export const toDisplay = (val): string => {
  if (val === null || val === undefined) return "N/A";
  try {
    if (val instanceof PublicKey) return val.toBase58();
    if (typeof val === "object" && val.words) return new BN(val).toString();
    if (BN.isBN?.(val)) return val.toString();
    if (typeof val === "string" && /^[0-9a-fA-F]+$/.test(val))
      return parseInt(val, 16).toLocaleString();
    return val.toString();
  } catch {
    return String(val);
  }
};

export default function Token() {
  const params = useParams();
  const mint_address = params.mid;
  const { tokens: userToken, loading: tokenLoading } = useUserTokens();
  const { publicKey } = useWallet();
  const { claimCreatorTokens, withdrawCreatorRoyalties } = Methods();
  const [copiedAddress, setCopiedAddress] = useState<string>("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState(false);

  if (tokenLoading)
    return (
      <div className="flex justify-center items-center h-80">
        <Spinner />
      </div>
    );

  const filtered = userToken.filter((t) => {
    const mint = toDisplay(t.account.tokenMint);
    return mint === mint_address;
  });

  if (filtered.length === 0)
    return (
      <p className="text-gray-400 text-center mt-20">
        No token found with this mint address.
      </p>
    );

  const acc = filtered[0].account;
  const mint = toDisplay(acc.tokenMint);
  const creator = toDisplay(acc.creator);

  const isCreator =
    publicKey && creator === publicKey.toBase58() ? true : false;
  const status = Object.keys(acc.status || {})[0] || "unknown";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(""), 1200);
  };

  const handleRoyaltyWithdraw = async (tokenId: number) => {
    try {
      setWithdrawLoading(true);
      await withdrawCreatorRoyalties(tokenId);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 2500);
    } catch (err) {
      console.error("Claim failed:", err);
      alert("Failed to claim tokens. Please try again.");
    } finally {
      setWithdrawLoading(false);
    }
  };
  const handleClaim = async (tokenId: number) => {
    try {
      setClaimLoading(true);
      await claimCreatorTokens(tokenId);
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 2500);
    } catch (err) {
      console.error("Claim failed:", err);
      alert("Failed to claim tokens. Please try again.");
    } finally {
      setClaimLoading(false);
    }
  };

  // const handleMigrate = async (tokenId: number) => {
  //   try {
  //     setMigrateLoading(true);
  //     // TODO: replace with your real migrateToDex() method
  //     await migrateToDex(tokenId);
  //     setMigrateSuccess(true);
  //     setTimeout(() => setMigrateSuccess(false), 2500);
  //   } catch (err) {
  //     console.error("Migrate failed:", err);
  //     alert("Failed to migrate. Please try again.");
  //   } finally {
  //     setMigrateLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 px-6 py-10 flex justify-center mt-20">
      <div className="w-full max-w-5xl">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-gray-800 pb-6">
          <div className="flex-shrink-0">
            {acc.imageUri && acc.imageUri.startsWith("http") ? (
              <Image
                src={
                  acc.imageUri ||
                  "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                }
                alt={acc.name}
                width={100}
                height={100}
                className="rounded-lg border border-gray-800"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-[#10131d] text-gray-400 rounded-full text-xs font-medium border border-[#1f2230]">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{acc.name}</h1>
              {status === "active" ? (
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-md">
                  Active
                </span>
              ) : (
                <span className="text-xs bg-gray-700/50 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-md">
                  {status}
                </span>
              )}
            </div>
            <p className="text-gray-400">{acc.symbol}</p>
            <p className="mt-2 text-sm text-gray-400 max-w-lg">
              {acc.description}
            </p>
            {acc.tags?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {acc.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isCreator && (
            <button
              onClick={() => handleClaim(Number(toDisplay(acc.launchId)))}
              disabled={claimLoading || claimSuccess}
              className={`relative group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm 
      overflow-hidden transition-all duration-300 
      ${
        claimLoading
          ? "bg-[#10131d]/60 border border-gray-700 cursor-not-allowed"
          : claimSuccess
          ? "bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/40"
          : "bg-gradient-to-r from-blue-600/20 to-purple-500/10 border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/20 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
      }`}
            >
              {!claimLoading && !claimSuccess && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out rounded-xl" />
              )}

              {claimLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              ) : claimSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Gift className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
              )}

              <span
                className={`tracking-wide relative z-10 ${
                  claimLoading
                    ? "text-gray-400"
                    : claimSuccess
                    ? "text-green-400"
                    : "text-blue-300 group-hover:text-blue-200"
                }`}
              >
                {claimLoading
                  ? "Claiming..."
                  : claimSuccess
                  ? "Claimed!"
                  : "Claim Creator Reward"}
              </span>
            </button>
          )}

          {isCreator && (
            <button
              onClick={() => handleRoyaltyWithdraw(Number(toDisplay(acc.launchId)))}
              disabled={withdrawLoading || withdrawSuccess}
              className={`relative group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm 
      overflow-hidden transition-all duration-300 
      ${
        withdrawLoading
          ? "bg-[#10131d]/60 border border-gray-700 cursor-not-allowed"
          : withdrawSuccess
          ? "bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/40"
          : "bg-gradient-to-r from-blue-600/20 to-purple-500/10 border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/20 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
      }`}
            >
              {!withdrawLoading && !withdrawSuccess && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out rounded-xl" />
              )}

              {withdrawLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              ) : withdrawSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Crown className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
              )}

              <span
                className={`tracking-wide relative z-10 ${
                  withdrawLoading
                    ? "text-gray-400"
                    : withdrawSuccess
                    ? "text-green-400"
                    : "text-blue-300 group-hover:text-blue-200"
                }`}
              >
                {withdrawLoading
                  ? "Withdraw..."
                  : withdrawSuccess
                  ? "Withdrawed!"
                  : "Withdraw Creator Raylaites"}
              </span>
            </button>
          )}

          {/* {isCreator && (
            <button
              onClick={() => handleMigrate(Number(toDisplay(acc.launchId)))}
              disabled={migrateLoading || migrateSuccess}
              className={`relative group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm 
      overflow-hidden transition-all duration-300 
      ${
        migrateLoading
          ? "bg-[#10131d]/60 border border-gray-700 cursor-not-allowed"
          : migrateSuccess
          ? "bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/40"
          : "bg-gradient-to-r from-purple-600/20 to-pink-500/10 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/20 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
      }`}
            >
              {!migrateLoading && !migrateSuccess && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out rounded-xl" />
              )}

              {migrateLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              ) : migrateSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Rocket className="w-5 h-5 text-purple-400 group-hover:-translate-y-0.5 transition-transform" />
              )}

              <span
                className={`tracking-wide relative z-10 ${
                  migrateLoading
                    ? "text-gray-400"
                    : migrateSuccess
                    ? "text-green-400"
                    : "text-purple-300 group-hover:text-purple-200"
                }`}
              >
                {migrateLoading
                  ? "Migrating..."
                  : migrateSuccess
                  ? "Migrated!"
                  : "Migrate to DEX"}
              </span>
            </button>
          )} */}
        </div>

        {/* MINT ADDRESS */}
        <div className="bg-[#101217] border border-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Mint Address</p>
            <p className="text-white text-sm font-mono">{mint}</p>
          </div>
          <button
            onClick={() => handleCopy(mint)}
            className="text-gray-400 hover:text-white transition"
          >
            {copiedAddress ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* CREATOR INFO */}
        <div className="bg-[#101217] border border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm font-medium">Creator</p>
            <p className="text-white text-sm font-mono flex items-center gap-2">
              {creator}
              {isCreator && (
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-md">
                  You
                </span>
              )}

              <a
                href={`https://solscan.io/account/${creator}`}
                target="_blank"
                className="text-gray-400 hover:text-blue-400"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </p>
          </div>
        </div>

        {/* === Summary Cards === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Initial Price", value: toDisplay(acc.initialPrice) },
            { label: "Current Price", value: toDisplay(acc.currentPrice) },
            { label: "Total Supply", value: toDisplay(acc.totalSupply) },
            { label: "Market Cap", value: toDisplay(acc.currentMarketCap) },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#101217] border border-gray-800 rounded-lg p-3 text-center"
            >
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="font-semibold text-white text-sm mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* SOCIAL LINKS */}
        <div className="flex gap-5 mb-8">
          {acc.socialLinks?.website && (
            <a
              href={acc.socialLinks.website}
              target="_blank"
              className="flex items-center gap-2 text-gray-400 hover:text-green-400"
            >
              <Globe className="w-4 h-4" /> Website
            </a>
          )}
          {acc.socialLinks?.twitter && (
            <a
              href={acc.socialLinks.twitter}
              target="_blank"
              className="flex items-center gap-2 text-gray-400 hover:text-sky-400"
            >
              <Twitter className="w-4 h-4" /> Twitter
            </a>
          )}
          {acc.socialLinks?.telegram && (
            <a
              href={acc.socialLinks.telegram}
              target="_blank"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400"
            >
              <Send className="w-4 h-4" /> Telegram
            </a>
          )}
        </div>

        {/* SECTION: TOKEN INFO */}
        <Section title="Token Info">
          <InfoRow label="Launch ID" value={toDisplay(acc.launchId)} />
          <InfoRow
            label="Trading Paused"
            value={acc.tradingPaused ? "Yes" : "No"}
          />
          <InfoRow
            label="Emergency Withdrawal"
            value={acc.emergencyWithdrawalEnabled ? "Enabled" : "Disabled"}
          />
          <InfoRow
            label="Battle Eligible"
            value={acc.battleEligible ? "Yes" : "No"}
          />
        </Section>

        {/* SECTION: TOKENOMICS */}
        <Section title="Tokenomics">
          <InfoRow label="Initial Price" value={toDisplay(acc.initialPrice)} />
          <InfoRow label="Current Price" value={toDisplay(acc.currentPrice)} />
          <InfoRow label="Total Supply" value={toDisplay(acc.totalSupply)} />
          <InfoRow
            label="Circulating Supply"
            value={toDisplay(acc.circulatingSupply)}
          />
          <InfoRow label="Market Cap" value={toDisplay(acc.currentMarketCap)} />
        </Section>

        {/* SECTION: VAULTS */}
        <Section title="Vault Info">
          <InfoRow label="Token Vault" value={toDisplay(acc.tokenVault)} />
          <InfoRow label="SOL Vault" value={toDisplay(acc.solVault)} />
          <InfoRow
            label="Creator Allocation"
            value={toDisplay(acc.creatorAllocation)}
          />
        </Section>

        {/* SECTION: PERFORMANCE */}
        <Section title="Performance">
          <InfoRow label="Total Trades" value={toDisplay(acc.totalTrades)} />
          <InfoRow label="Total Buyers" value={toDisplay(acc.totalBuyers)} />
          <InfoRow label="Total Volume" value={toDisplay(acc.totalVolume)} />
          <InfoRow
            label="Trading Fee (%)"
            value={toDisplay(acc.tradingFeePercentage)}
          />
        </Section>
      </div>
    </div>
  );
}

/* Helper Components */
const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3 border-l-4 border-purple-500 pl-3">
      {title}
    </h2>
    <div className="bg-[#101217] border border-gray-800 rounded-lg divide-y divide-gray-800">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-800/40 transition-colors">
    <span className="text-gray-400">{label}</span>
    <span className="font-mono text-gray-200 break-all max-w-[60%] text-right">
      {value || "—"}
    </span>
  </div>
);
