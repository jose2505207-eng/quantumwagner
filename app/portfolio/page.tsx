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
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Users,
  XCircle,
} from "lucide-react";
import ProfileCard from "@/components/custom/UserRepution";
import { useRouter } from "next/navigation";
import { toDisplay } from "./token/[mid]/page";
import Image from "next/image";
import Methods from "../utils/methods";
import { useUserTokens } from "../utils/useUserTokens";

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

        {/* User Tokens Section */}
        <div className="relative overflow-hidden">
          <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent mb-8 ">
            Your Tokens
          </h3>

          {tokenLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
          ) : userToken.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center items-start w-full max-w-6xl mx-auto">
              {userToken.map((token, i: number) => {
                const acc = token.account;
                const mint = acc.tokenMint?.toBase58?.() ?? acc.tokenMint;

                return (
                  <div
                    key={i}
                    onClick={() => router.push(`portfolio/token/${mint}`)}
                    className="relative
    w-full max-w-[500px]
    rounded-2xl
    p-6
    overflow-hidden
    border border-[rgba(255,255,255,0.06)]
    shadow-[0_8px_25px_rgba(0,0,0,0.45)]
    hover:shadow-[0_0_30px_rgba(140,120,255,0.2)]
    transition-all duration-500
    cursor-pointer
    hover:-translate-y-[2px]
  "
                  >
                    <div
                      className="
      absolute inset-0 rounded-2xl
      bg-[#0F1521]
      backdrop-blur-2xl backdrop-saturate-150
      pointer-events-none
      -z-10
    "
                    />

                    <div className="flex items-center gap-5 w-full relative z-10">
                      {/* Token Image */}
                      <div className="flex-shrink-0">
                        {acc.imageUri && acc.imageUri.startsWith("http") ? (
                          <Image
                            src={
                              acc.imageUri ||
                              "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                            }
                            alt={acc.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-full border border-[#22242c] shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                          />
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-[#10131d] text-gray-400 rounded-full text-xs font-medium border border-[#1f2230]">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Token Info */}
                      <div className="flex-1 text-left leading-relaxed">
                        <p className="text-[13px] text-[#9ca3af] mb-1">
                          Token Address:{" "}
                          <span className="font-mono text-[#b7bdfb]">
                            {shortenAddress(mint)}
                          </span>
                          <a
                            href={`https://solscan.io/account/${mint}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-1 underline text-[#7c81ff] hover:text-[#9fa4ff] text-[11px]"
                          >
                            View ↗
                          </a>
                        </p>

                        <p className="text-sm sm:text-base font-medium text-[#E5E7EB]/90">
                          Total Supply:&nbsp;
                          <span className="text-xl font-semibold text-[#C8CCFF] align-middle">
                            {toDisplay(acc.totalSupply)}
                          </span>
                          &nbsp;
                          <span className="text-[#A1A5B7] text-base font-normal">
                            {acc.symbol}
                          </span>
                        </p>

                        <p className="text-sm sm:text-base font-medium text-[#E5E7EB]/90 mt-1">
                          Current Price:&nbsp;
                          <span className="text-lg font-semibold text-[#BFC3FF] align-middle">
                            {toDisplay(acc.currentPrice)}
                          </span>
                          &nbsp;
                          <span className="text-[#9CA3AF]/80 text-sm">
                            lamports
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No tokens found</p>
          )}
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
