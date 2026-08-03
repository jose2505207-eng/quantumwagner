"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Copy,
  CheckCircle2,
  Twitter,
  Send,
  Globe,
  Coins,
  BarChart3,
  ActivitySquare,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useUserBoughtTokens } from "@/app/utils/useUserBoughtTokens";
import { toDisplay, formatSolFromLamports } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import Methods from "@/app/utils/methods";

export default function BoughtTokenDetails() {
  const { ata } = useParams();
  const { tokens: boughtTokens, loading } = useUserBoughtTokens();
  const [copied, setCopied] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);
  const tokenData = boughtTokens.find((t) => t.mint === ata);
  const { sellToken } = Methods();
  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (!tokenData)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-400">
        <p>No token data found for this address.</p>
      </div>
    );

  const acc = tokenData.tokenData;

  const balance = tokenData.balance;

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenData.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const safeDisplay = (val) => {
    if (!val) return "—";
    if (typeof val === "object") {
      if ("toBase58" in val) return val.toBase58();
      if ("toString" in val) return val.toString();
      return JSON.stringify(val);
    }
    return String(val);
  };

  const shorten = (str: string, chars = 4) =>
    str.length > 10 ? `${str.slice(0, chars)}...${str.slice(-chars)}` : str;

  const handleSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast.error("Enter a valid amount!");
      return;
    }

    if (parseFloat(sellAmount) > balance) {
      toast.error("Cannot sell more than your balance!");
      return;
    }

    try {
      setSellLoading(true);
      toast.loading("Processing sale...");

      await sellToken(safeDisplay(acc.launchId), Number(sellAmount));

      setSellSuccess(true);
      toast.dismiss();
      toast.success("Token sold successfully!");
      setSellAmount("");
    } catch (err) {
      console.error("Sell failed:", err);
      toast.dismiss();
      toast.error("Failed to sell token.");
    } finally {
      setSellLoading(false);
      setTimeout(() => setSellSuccess(false), 2000);
    }
  };
  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 px-6 py-20 flex justify-center mt-20">
      <div className="w-full max-w-5xl space-y-10">
        {/* Header Section */}
        <Card className="bg-[#101217] border-gray-800/60 shadow-lg hover:border-gray-700 transition-all duration-300">
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {acc.imageUri && acc.imageUri.startsWith("http") ? (
              <Image
                src={acc.imageUri}
                alt={acc.name}
                width={100}
                height={100}
                className="rounded-full border border-gray-800"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-[#10131d] text-gray-400 rounded-full text-xs border border-[#1f2230]">
                No Image
              </div>
            )}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-3">
                {acc.name || "Unnamed Token"}
                {acc.status?.active ? (
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-700/50 text-gray-400 border border-gray-700">
                    Inactive
                  </Badge>
                )}
              </CardTitle>
              <p className="text-gray-400 text-sm">{acc.symbol}</p>
              <p className="text-gray-400 text-sm">
                {acc.description || "No description provided."}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex justify-between items-center text-sm mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Mint Address</p>
                <p className="font-mono text-white">
                  {shorten(tokenData.mint)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCopy}
                className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Sell Token Section */}
            <div className="mt-6 bg-[#0f1118] border border-gray-800 rounded-xl p-5 space-y-4 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                Sell {acc.symbol}
              </h3>

              <p className="text-gray-400 text-sm">
                You own{" "}
                <span className="text-white font-medium">{balance}</span>{" "}
                {acc.symbol}. Enter the amount to sell.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={balance}
                  placeholder="Amount to sell"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-[#0b0d13] border border-gray-700 
                            focus:border-blue-500 focus:ring-0 text-gray-200 w-full sm:w-[200px] 
                            appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                            [&::-webkit-inner-spin-button]:appearance-none"
                />

                <Button
                  disabled={
                    sellLoading ||
                    !sellAmount ||
                    parseFloat(sellAmount) <= 0 ||
                    parseFloat(sellAmount) > balance
                  }
                  onClick={handleSell}
                  className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-all
                            border border-[#3041ff]/30 
                            ${
                              sellLoading
                                ? "bg-[#18213d] text-blue-300 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#18213d] via-[#1a1f40] to-[#121a30] text-[#8db9ff] hover:text-[#bcd5ff] hover:shadow-[0_0_15px_rgba(100,149,237,0.2)]"
                            }`}
                >
                  {sellLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" /> Selling...
                    </>
                  ) : sellSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Sold!
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 text-[#8db9ff]" />
                      Sell Token
                    </>
                  )}
                </Button>
              </div>

              {sellAmount && parseFloat(sellAmount) > balance && (
                <p className="text-red-400 text-sm mt-2">
                  You cannot sell more than your balance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<Coins className="w-5 h-5 text-blue-400" />}
            label="Balance"
            value={`${balance} ${acc.symbol}`}
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
            label="Price"
            value={`${formatSolFromLamports(acc.currentPrice)} SOL`}
          />
          <StatCard
            icon={<ActivitySquare className="w-5 h-5 text-pink-400" />}
            label="Total Supply"
            value={toDisplay(acc.totalSupply)}
          />
          <StatCard
            icon={<Globe className="w-5 h-5 text-yellow-400" />}
            label="Market Cap"
            value={`${formatSolFromLamports(acc.currentMarketCap, 4)} SOL`}
          />
        </div>

        {/* Token Info Section */}
        <Card className="bg-[#101217] border-gray-800/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Token Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Creator" value={safeDisplay(acc.creator)} />
            <InfoRow label="Launch ID" value={safeDisplay(acc.launchId)} />
            <InfoRow label="Vault" value={safeDisplay(acc.tokenVault)} />
            <InfoRow
              label="Circulating Supply"
              value={toDisplay(acc.circulatingSupply)}
            />
            <InfoRow
              label="Trading Fee (%)"
              value={toDisplay(acc.tradingFeePercentage)}
            />
            <InfoRow label="Total Trades" value={toDisplay(acc.totalTrades)} />
          </CardContent>
        </Card>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-5">
          {acc.socialLinks?.website && (
            <SocialLink
              href={acc.socialLinks.website}
              label="Website"
              icon={<Globe className="w-4 h-4" />}
            />
          )}
          {acc.socialLinks?.twitter && (
            <SocialLink
              href={acc.socialLinks.twitter}
              label="Twitter"
              icon={<Twitter className="w-4 h-4" />}
            />
          )}
          {acc.socialLinks?.telegram && (
            <SocialLink
              href={acc.socialLinks.telegram}
              label="Telegram"
              icon={<Send className="w-4 h-4" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* Helper Components */
const StatCard = ({ icon, label, value }) => (
  <Card className="bg-[#101217] border-gray-800/60 p-4 text-center hover:border-gray-700 transition-all">
    <div className="flex flex-col items-center space-y-2">
      {icon}
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white font-semibold text-lg">{value}</p>
    </div>
  </Card>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1 border-b border-gray-800/50">
    <span className="text-gray-400">{label}</span>
    <span className="text-gray-200 font-mono break-all text-right">
      {value || "—"}
    </span>
  </div>
);

const SocialLink = ({ href, label, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition"
  >
    {icon} {label}
  </a>
);
