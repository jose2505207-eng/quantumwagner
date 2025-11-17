"use client";

import React, { useEffect, useState } from "react";
import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import PositionCard from "@/components/positions/PositionCard";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useUserStore } from "@/store/userInfo";
import {
  ArrowDownRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Copy,
  Crown,
  ExternalLink,
  Users,
  XCircle,
} from "lucide-react";
import ProfileCard from "@/components/custom/UserRepution";
import { useRouter } from "next/navigation";
import { toDisplay } from "./token/[mid]/page";
import { useUserTokens } from "../utils/useUserTokens";
import { useUserBoughtTokens } from "../utils/useUserBoughtTokens";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Methods from "../utils/methods";

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
  const { withdrawWinnings, enterBattle,getAllBattles } = Methods();
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

  // const handleCreateBattle = async () => {
  //   try {
  //     const { tx, battlePDA } = await createBattle({
  //       title: "Solana Ecosystem Clash",
  //       description: "Whose tokens dominate?",
  //       sideATokens: [
  //         new PublicKey("5qBXPH1MnYHqw1WEgNFhyzuPEzvJoJBcquuDvdTMtoHA"),
  //       ], //USDC
  //       sideBTokens: [
  //         new PublicKey("JCBajpXBZsDMVWQZG7CCYt22NuaZ6jpuvawGCPQ3nEpg"), //USDT
  //       ],
  //       sideAName: "Side A",
  //       sideBName: "Side B",
  //       startTime: Math.floor(Date.now() / 1000) + 300, // start in 5 mins
  //       endTime: Math.floor(Date.now() / 1000) + 3600, // end in 1 hr
  //       metaMarketEnabled: true,
  //       imageUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  //     });

  //     console.log("Battle created:", battlePDA.toBase58());
  //     alert("Battle Created!");
  //   } catch (err: any) {
  //     console.error(err);
  //     alert("Error: " + err.message);
  //   }
  // };

  // const handleCreateBattle = async () => {
  //   try {
  //     const res = await getAllBattles();

  //     console.log("All battles :", res);

  //     alert("Battle Created!");
  //   } catch (err: any) {
  //     console.error(err);
  //     alert("Error: " + err.message);
  //   }
  // };

  const handleJoinBattle = async () => {
    try {
      // const res = await enterBattle({
      //   battlePDA: new PublicKey(
      //     "AdS5baQefWJUEU2Xi99fyW1oNpDHsrPWT8PJbZnqhcX7"
      //   ),
      //   side: { a: {} },
      //   amount: 1_000_000,
      // });
      const res = await getAllBattles()

      console.log("Battle joined:", res);
    } catch (err: any) {
      console.error("Join error:", err.message);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 pt-24 text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* User Info Card */}

        <button onClick={handleJoinBattle}> Join Battle</button>

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
                      <Card
                        key={i}
                        onClick={() => router.push(`portfolio/token/${mint}`)}
                        className="
    w-full max-w-[500px] cursor-pointer rounded-3xl 
    bg-[rgba(18,7,32,0.35)] backdrop-blur-md 
    border border-[rgba(168,85,247,0.25)]
    shadow-[0_0_20px_rgba(168,85,247,0.12)]
    hover:shadow-[0_0_30px_rgba(168,85,247,0.22)]
    hover:border-[rgba(168,85,247,0.45)]
    transition-all duration-300 p-8
  "
                      >
                        {/* HEADER */}
                        <CardHeader className="flex flex-row items-center justify-between p-0">
                          <div className="flex items-center gap-4">
                            {/* Token Image */}
                            {acc.imageUri && acc.imageUri.startsWith("http") ? (
                              <img
                                src={acc.imageUri}
                                alt={acc.name}
                                width={60}
                                height={60}
                                className="
            rounded-2xl border border-[rgba(59,7,100,0.25)] 
            shadow-[0_0_10px_rgba(255,255,255,0.05)]
          "
                              />
                            ) : (
                              <div
                                className="
            w-[60px] h-[60px] flex items-center justify-center 
            rounded-2xl bg-[rgba(168,85,247,0.25)]
            text-white text-xl font-bold 
            shadow-[0_0_10px_rgba(168,85,247,0.25)]
        "
                              >
                                {acc.symbol?.[0] || "?"}
                              </div>
                            )}

                            {/* Token Name + Symbol */}
                            <div>
                              <h2 className="text-xl font-semibold text-white leading-tight">
                                {acc.name}
                              </h2>
                              <p className="text-sm text-gray-400">
                                {acc.symbol} Token
                              </p>
                            </div>
                          </div>

                          {/* ICON BUTTONS */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(mint);
                                toast.success("Copied!");
                              }}
                              className="
          h-10 w-10 rounded-xl 
          bg-[rgba(26,15,39,0.35)] 
          border border-[rgba(59,7,100,0.25)]
          hover:bg-[rgba(42,15,59,0.45)]
          text-gray-300
        "
                            >
                              <Copy size={18} />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              asChild
                              className="
          h-10 w-10 rounded-xl 
          bg-[rgba(26,15,39,0.35)]
          border border-[rgba(59,7,100,0.25)]
          hover:bg-[rgba(42,15,59,0.45)]
          text-gray-300
        "
                            >
                              <a
                                href={`https://solscan.io/account/${mint}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={18} />
                              </a>
                            </Button>
                          </div>
                        </CardHeader>

                        {/* CONTENT */}
                        <CardContent className="mt-8 p-0">
                          {/* STATS GRID */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Balance */}
                            <div
                              className="
          bg-[rgba(27,12,43,0.35)] 
          border border-[rgba(168,85,247,0.15)]
          rounded-2xl p-4
        "
                            >
                              <p className="text-sm text-gray-400">Launch ID</p>
                              <p className="text-xl font-semibold text-[#e9d5ff] mt-1">
                                {toDisplay(acc.launchId)}
                              </p>
                            </div>

                            {/* Current Price */}
                            <div
                              className="
          bg-[rgba(27,12,43,0.35)] 
          border border-[rgba(168,85,247,0.15)]
          rounded-2xl p-4
        "
                            >
                              <p className="text-sm text-gray-400">
                                Current Price
                              </p>
                              <p className="text-xl font-semibold text-[#d8b4fe] mt-1">
                                {toDisplay(acc.currentPrice / LAMPORTS_PER_SOL)}{" "}
                                SOL
                              </p>
                            </div>

                            {/* Total Supply */}
                            <div
                              className="
          col-span-2 
          bg-[rgba(27,12,43,0.35)] 
          border border-[rgba(168,85,247,0.15)]
          rounded-2xl p-4
        "
                            >
                              <p className="text-sm text-gray-400">
                                Total Supply
                              </p>
                              <p className="text-xl font-semibold text-white mt-1">
                                {toDisplay(acc.totalSupply)}
                              </p>
                            </div>
                          </div>

                          {/* FOOTER - MINT */}
                          <div
                            className="
        mt-6 
        bg-[rgba(20,10,34,0.30)] 
        border border-[rgba(168,85,247,0.18)] 
        rounded-2xl p-4
      "
                          >
                            <p className="text-xs text-gray-500 font-mono flex justify-between items-center">
                              <span>{shortenAddress(mint)}</span>

                              <a
                                href={`https://solscan.io/account/${mint}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#c084fc] hover:text-[#e9d5ff] underline text-[11px]"
                              >
                                View ↗
                              </a>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
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
                      <Card
                        key={i}
                        onClick={() =>
                          router.push(`portfolio/token/bought/${mint}`)
                        }
                        className="
    w-full max-w-[420px] cursor-pointer rounded-3xl 
    bg-[#0a0f1c] border border-[#1e293b] 
    shadow-[0_0_20px_rgba(0,0,0,0.4)]
    hover:border-[#3b82f6] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]
    transition-all duration-300
  "
                      >
                        {/* Header */}
                        <CardHeader className="flex flex-row items-center justify-between p-6 pb-3">
                          <div className="flex items-center gap-4">
                            {acc.imageUri && acc.imageUri.startsWith("http") ? (
                              <img
                                src={acc.imageUri}
                                alt={acc.name}
                                width={58}
                                height={58}
                                className="rounded-2xl bg-[#172135] border border-[#233044]"
                              />
                            ) : (
                              <div
                                className="w-[58px] h-[58px] flex items-center justify-center 
                        bg-gradient-to-br from-blue-500 to-blue-700 
                        text-white rounded-2xl text-xl font-bold"
                              >
                                {acc.symbol?.[0] || "?"}
                              </div>
                            )}

                            <div>
                              <h2 className="text-xl font-semibold text-white">
                                {acc.name}
                              </h2>
                              <p className="text-sm text-gray-400">
                                {acc.symbol} Token
                              </p>
                            </div>
                          </div>

                          {/* Icons */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(mint);
                                toast.success("Copied!");
                              }}
                              className="h-10 w-10 rounded-xl bg-[#111827] border border-[#1f2937] 
                 hover:bg-[#1e293b] text-gray-300"
                            >
                              <Copy size={18} />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              asChild
                              className="h-10 w-10 rounded-xl bg-[#111827] border border-[#1f2937] 
                   hover:bg-[#1e293b] text-gray-300"
                            >
                              <a
                                href={`https://solscan.io/account/${mint}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={18} />
                              </a>
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="px-6 pb-6">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {/* Balance */}
                            <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-4">
                              <p className="text-xs text-gray-500">Balance</p>
                              <p className="text-lg font-semibold text-blue-300 mt-1">
                                {balance} {acc.symbol}
                              </p>
                            </div>

                            {/* Current Price */}
                            <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-4">
                              <p className="text-xs text-gray-500">
                                Current Price
                              </p>
                              <p className="text-lg font-semibold text-blue-200 mt-1">
                                {toDisplay(acc.currentPrice / LAMPORTS_PER_SOL)}{" "}
                                SOL
                              </p>
                            </div>

                            {/* Total Supply */}
                            <div className="rounded-2xl bg-[#111827] border border-[#1f2937] p-4 col-span-2">
                              <p className="text-xs text-gray-500">
                                Total Supply
                              </p>
                              <p className="text-lg font-semibold text-white mt-1">
                                {toDisplay(acc.totalSupply)}
                              </p>
                            </div>
                          </div>

                          {/* Mint Footer */}
                          <div className="mt-6 rounded-2xl bg-[#0b121e] border border-[#1d2533] p-4">
                            <p className="text-xs text-gray-500 font-mono flex justify-between items-center">
                              <span>{shortenAddress(mint)}</span>

                              <a
                                href={`https://solscan.io/account/${mint}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-400 hover:text-blue-300 underline text-[11px]"
                              >
                                View ↗
                              </a>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
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
