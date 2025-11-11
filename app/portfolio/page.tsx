"use client";

import React, { useEffect, useState } from "react";
import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import PositionCard from "@/components/positions/PositionCard";
import { PublicKey } from "@solana/web3.js";
import { useUserStore } from "@/store/userInfo";
import {
  ArrowDownRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Crown,
  Users,
  XCircle,
} from "lucide-react";
import ProfileCard from "@/components/custom/UserRepution";
import { useRouter } from "next/navigation";
import { toDisplay } from "./token/[mid]/page";
import Image from "next/image";
import Methods from "../utils/methods";
import { useUserTokens } from "../utils/useUserTokens";
import { useUserBoughtTokens } from "../utils/useUserBoughtTokens";

export const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-gray-500 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
);

export function shortenAddress(addr: string) {
  if (!addr) return "Unknown";
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

export default function Portfolio() {
  const { withdrawWinnings } = Methods();
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active");
  const [withdrawingMap, setWithdrawingMap] = useState<Record<string, boolean>>(
    {}
  );

  const { tokens: userToken, loading: tokenLoading } = useUserTokens();
  const { tokens: userBoughtToken, loading: boughtTokenLoading } =
    useUserBoughtTokens();
  const { userInfo } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Not authorized!");

      const res = await axios.get(`${BACKEND_URL}/api/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPositions(res.data.data.positions || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      toast.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (marketPda: string, positionId: string) => {
    try {
      setWithdrawingMap((prev) => ({ ...prev, [marketPda]: true }));

      await withdrawWinnings(new PublicKey(marketPda));

      const res = await axios.put(
        `${BACKEND_URL}/api/positions`,
        {
          settled: true,
          settled_at: new Date(),
          position_id: positionId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Bet withdrawn");
      await loadPositions();
    } catch (err) {
      const msg = err?.toString() || "";
      if (msg.includes("AlreadyClaimed")) {
        toast.success("Already claimed");
        return;
      }
      toast.error(`Withdraw failed: ${msg}`);
    } finally {
      setWithdrawingMap((prev) => ({ ...prev, [marketPda]: false }));
    }
  };

  const activePositions = positions.filter(
    (p) => new Date(p.market.end_time).getTime() >= Date.now()
  );
  const expiredPositions = positions.filter(
    (p) => new Date(p.market.end_time).getTime() < Date.now()
  );

  return (
    <div className="min-h-screen p-6 pt-24 text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* User Info Card */}

        <div className="flex flex-wrap items-center gap-6 bg-gray-900/70 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">
              KYC: {userInfo?.user.kyc_level || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">
              Rep: {userInfo?.user.reputation_score ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">
              Predictions: {userInfo?.user.total_predictions ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {userInfo?.user.is_verified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-500">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-500">Not Verified</span>
              </>
            )}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all cursor-pointer"
            onClick={() => router.push("/token")}
          >
            <Coins className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">
              Launch Token
            </span>
          </div>
        </div>

        {/* Reputation Card */}
        <ProfileCard
          reputation_score={userInfo?.user.reputation_score || 0}
          win_rate={userInfo?.user.win_rate || "error"}
          battels_won={userInfo?.user.win_rate || "error"}
        />

        {/* === Token Tabs Section === */}
        <div className="mt-12">
          <Tabs defaultValue="created" className="w-full">
            {/* Header + Tabs */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
              <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
                Your Tokens
              </h3>

              <TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg flex justify-center sm:justify-start">
                <TabsTrigger
                  value="created"
                  className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea]
            data-[state=active]:text-white 
            data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
            transition"
                >
                  Created
                </TabsTrigger>

                <TabsTrigger
                  value="bought"
                  className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#60a5fa] data-[state=active]:to-[#3b82f6]
            data-[state=active]:text-white 
            data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
            transition"
                >
                  Bought
                </TabsTrigger>
              </TabsList>
            </div>

            {/* === Created Tokens === */}
            <TabsContent value="created">
              {tokenLoading ? (
                <Spinner />
              ) : userToken.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-7xl mx-auto">
                  {userToken.map((token, i: number) => {
                    const acc = token.account;
                    const mint = acc.tokenMint?.toBase58?.() ?? acc.tokenMint;

                    return (
                      <div
                        key={i}
                        onClick={() => router.push(`portfolio/token/${mint}`)}
                        className="relative group w-full max-w-[360px] rounded-2xl border border-[#2e1065]/40
                       bg-gradient-to-br from-[#0f0a1a] via-[#120c20] to-[#1a0f2e]
                       hover:border-[#a855f7]/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]
                       transition-all duration-500 cursor-pointer overflow-hidden p-6"
                      >
                        {/* Glow Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Token Header */}
                        <div className="flex items-center gap-4 mb-4">
                          {acc.imageUri && acc.imageUri.startsWith("http") ? (
                            <Image
                              src={acc.imageUri}
                              alt={acc.name}
                              width={60}
                              height={60}
                              className="rounded-full border border-[#3b0764]/50 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                            />
                          ) : (
                            <div className="w-[60px] h-[60px] flex items-center justify-center bg-[#1e1b2e] text-gray-400 rounded-full text-xs border border-[#3b0764]/50">
                              No Image
                            </div>
                          )}

                          <div className="flex flex-col">
                            <h4 className="text-lg font-semibold text-white leading-tight">
                              {acc.name || "Unnamed Token"}
                            </h4>
                            <p className="text-sm text-gray-400 tracking-wide">
                              {acc.symbol || "--"}
                            </p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-800/60 my-4"></div>

                        {/* Token Stats */}
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Launch ID</span>
                            <span className="text-[#c084fc] font-medium">
                              {toDisplay(acc.launchId)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Current Price</span>
                            <span className="text-[#d8b4fe] font-medium">
                              {toDisplay(acc.currentPrice)} SOL
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Supply</span>
                            <span className="text-[#e9d5ff] font-medium">
                              {toDisplay(acc.totalSupply)}
                            </span>
                          </div>
                        </div>

                        {/* Mint Address */}
                        <div className="mt-5 border-t border-gray-800/60 pt-3">
                          <p className="text-xs text-gray-500 font-mono flex justify-between items-center">
                            <span>{shortenAddress(mint)}</span>
                            <a
                              href={`https://solscan.io/account/${mint}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#c084fc] hover:text-[#e9d5ff] text-[11px] underline"
                            >
                              View ↗
                            </a>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center text-sm sm:text-base">
                  You haven’t created any tokens yet.
                </p>
              )}
            </TabsContent>

            {/* === Bought Tokens === */}
            <TabsContent value="bought">
              {boughtTokenLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : userBoughtToken && userBoughtToken.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-7xl mx-auto">
                  {userBoughtToken.map((token, i: number) => {
                    const acc = token.tokenData;
                    const mint = token.mint;
                    const balance = token.balance;

                    return (
                      <div
                        key={i}
                        onClick={() =>
                          router.push(`portfolio/token/bought/${mint}`)
                        }
                        className="relative group w-full max-w-[360px] rounded-2xl border border-[#1e293b]/60
                       bg-gradient-to-br from-[#0f172a] via-[#0a0f1e] to-[#0b1120]
                       hover:border-[#3b82f6]/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]
                       transition-all duration-500 cursor-pointer overflow-hidden p-6"
                      >
                        {/* Glow Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1d4ed8]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Token Header */}
                        <div className="flex items-center gap-4 mb-4">
                          {acc.imageUri && acc.imageUri.startsWith("http") ? (
                            <Image
                              src={acc.imageUri}
                              alt={acc.name}
                              width={60}
                              height={60}
                              className="rounded-full border border-[#1e293b] shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                            />
                          ) : (
                            <div className="w-[60px] h-[60px] flex items-center justify-center bg-[#1e293b] text-gray-400 rounded-full text-xs border border-[#334155]">
                              No Image
                            </div>
                          )}

                          <div className="flex flex-col">
                            <h4 className="text-lg font-semibold text-white leading-tight">
                              {acc.name || "Unnamed Token"}
                            </h4>
                            <p className="text-sm text-gray-400 tracking-wide">
                              {acc.symbol || "--"}
                            </p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-800/60 my-4"></div>

                        {/* Token Stats */}
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Balance</span>
                            <span className="text-[#93c5fd] font-medium">
                              {balance} {acc.symbol}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Current Price</span>
                            <span className="text-[#b3c6ff] font-medium">
                              {toDisplay(acc.currentPrice)} SOL
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Supply</span>
                            <span className="text-[#cbd5e1] font-medium">
                              {toDisplay(acc.totalSupply)}
                            </span>
                          </div>
                        </div>

                        {/* Mint Address */}
                        <div className="mt-5 border-t border-gray-800/60 pt-3">
                          <p className="text-xs text-gray-500 font-mono flex justify-between items-center">
                            <span>{shortenAddress(mint)}</span>
                            <a
                              href={`https://solscan.io/account/${mint}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#60a5fa] hover:text-[#93c5fd] text-[11px] underline"
                            >
                              View ↗
                            </a>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center text-sm sm:text-base">
                  You haven&#39;t bought any tokens yet.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Positions Section */}
        <Tabs defaultValue="active" onValueChange={setTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
              Positions
            </h3>

            <TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg flex justify-center sm:justify-start">
              <TabsTrigger
                value="active"
                className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea]
                data-[state=active]:text-white 
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
                transition"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="expired"
                className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea]
                data-[state=active]:text-white 
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
                transition"
              >
                Expired
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Active Tab */}
          <TabsContent value="active">
            {loading ? (
              <Spinner />
            ) : activePositions.length === 0 ? (
              <p className="text-center text-gray-400">No active positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activePositions.map((p) => (
                  <PositionCard
                    key={p.id}
                    position={p}
                    withdrawing={!!withdrawingMap[p.market.pda]}
                    handleWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expired Tab */}
          <TabsContent value="expired">
            {loading ? (
              <Spinner />
            ) : expiredPositions.length === 0 ? (
              <p className="text-center text-gray-400">No expired positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {expiredPositions.filter((p) => !p.settled).length === 0 ? (
                  <p className="text-gray-400 text-center">
                    No unsettled positions
                  </p>
                ) : (
                  expiredPositions
                    .filter(
                      (p) => !p.settled && p.position_type !== p.market.outcome
                    )
                    .map((p) => (
                      <PositionCard
                        key={p.id}
                        position={p}
                        withdrawing={!!withdrawingMap[p.market.pda]}
                        handleWithdraw={handleWithdraw}
                      />
                    ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
