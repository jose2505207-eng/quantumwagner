"use client";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Globe,
  Send,
  Twitter,
  Copy,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Coins,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import Methods from "@/app/utils/methods";
import { Spinner } from "@/app/portfolio/page";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { useAllTokens } from "@/app/utils/useAllTokens";

export default function TokenBuyPage() {
  const params = useParams();
  const mint_address = params.id;
  const { tokens: userToken, loading: tokenLoading } = useAllTokens();
  const { publicKey } = useWallet();
  const { buyToken } = Methods();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [buying, setBuying] = useState(false);

  if (tokenLoading)
    return (
      <div className="flex justify-center items-center h-80">
        <Spinner />
      </div>
    );

  const filtered = userToken.filter(
    (t) =>
      t.account.tokenMint?.toString().trim().toLowerCase() ===
      String(mint_address)?.trim().toLowerCase()
  );

  if (filtered.length === 0)
    return (
      <p className="text-gray-400 text-center mt-20">
        No token found with this mint address.
      </p>
    );

  const acc = filtered[0].account;
  const mint = acc.tokenMint?.toString();
  const launchId = acc.launchId;
  const status = Object.keys(acc.status || {})[0] || "unknown";

  const handleCopy = () => {
    navigator.clipboard.writeText(mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      setBuying(true);
      await buyToken(launchId, parseFloat(amount));
    } catch (err) {
      console.error(err);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 px-6 py-16 flex justify-center mt-20">
      <div className="w-full max-w-3xl">
        {/* Token Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 border-b border-gray-800 pb-6">
          {acc.imageUri && acc.imageUri.startsWith("http") ? (
            <Image
              src={acc.imageUri}
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

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center sm:justify-start gap-3">
              {acc.name}
              {status === "active" && (
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{acc.symbol}</p>
            <p className="text-gray-400 text-sm mt-2 max-w-lg">
              {acc.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Buy Section */}
        <div className="bg-[#101217] border border-gray-800 rounded-2xl p-6 text-center shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Buy {acc.symbol || "Token"}
          </h2>

          {/* Price + Supply */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6">
            <p className="text-gray-400 text-sm">
              Current Price:{" "}
              <span className="text-purple-400 font-medium">
                {toDisplay(acc.currentPrice)} SOL
              </span>
            </p>

            <p className="text-gray-400 text-sm">
              Total Supply:{" "}
              <span className="text-purple-400 font-medium">
                {toDisplay(acc.totalSupply)} {acc.symbol}
              </span>
            </p>
          </div>

          {/* Input + Button */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Amount in SOL"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#0e1016] border border-gray-700 
                 focus:border-[#5c74ff] focus:ring-0 text-gray-200 
                 w-full sm:w-[260px] text-center appearance-none
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                 [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              disabled={
                buying ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > parseFloat(acc.totalSupply || "0")
              }
              onClick={handleBuy}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-all
                  border border-[#3041ff]/30 
                  ${
                    buying ||
                    parseFloat(amount) > parseFloat(acc.totalSupply || "0")
                      ? "bg-[#18213d] text-blue-300 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-[#18213d] via-[#1a1f40] to-[#121a30] text-[#8db9ff] hover:text-[#bcd5ff] hover:shadow-[0_0_15px_rgba(100,149,237,0.2)]"
                  }`}
            >
              {buying ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Buying...
                </div>
              ) : (
                <>
                  <Coins className="w-4 h-4 text-[#8db9ff]" />
                  Buy Token
                </>
              )}
            </button>
          </div>

          {/* Inline Warning / Info Message */}
          {amount && (
            <p
              className={`text-sm mt-1 transition-all duration-300 ${
                parseFloat(amount) > parseFloat(acc.totalSupply || "0")
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {parseFloat(amount) > parseFloat(acc.totalSupply || "0") ? (
                <> Amount exceeds total supply.</>
              ) : (
                <>
                  You’ll receive approximately{" "}
                  <span className="text-white font-medium">
                    {(
                      parseFloat(amount) / parseFloat(acc.currentPrice || 1)
                    ).toFixed(2)}{" "}
                    {acc.symbol}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Mint Address Section */}
        <div className="bg-[#101217] border border-gray-800 rounded-lg p-4 mt-6 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm font-medium">Mint Address</p>
            <p className="text-white text-sm font-mono">{mint}</p>
          </div>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Social Links */}
        <div className="flex justify-center sm:justify-start gap-5 mt-6">
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
      </div>
    </div>
  );
}
