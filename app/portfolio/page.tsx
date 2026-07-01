"use client";

import React, { useEffect, useState } from "react";
import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import PositionCard from "@/components/positions/PositionCard";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useUserStore } from "@/store/userInfo";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Swords,
  Users,
  XCircle,
  Wallet,
  ArrowUpRight,
  Trophy,
  Zap,
  ShieldCheck
} from "lucide-react";
import ProfileCard from "@/components/custom/UserRepution";
import { useRouter } from "next/navigation";
import Methods from "../utils/methods";
import Tokens from "@/components/portfolio/token/useToken";
import UserBattlesList from "@/components/portfolio/battle/userBattleList";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Position } from "@/store/types/user/postionType";
import { Spinner } from "@/components/custom/Spinner";


export default function Portfolio() {
  const {
    withdrawWinnings,
    getAllBattles,
    enterBattle,
    increaseBattlePosition,
    getUserBattles,
  } = Methods();
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active");
  const [withdrawingMap, setWithdrawingMap] = useState<Record<string, boolean>>(
    {}
  );

  const { userInfo } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    loadPositions();
  }, []);

  // Real positions only — no demo fallback. Empty state when there are none.
  const loadPositions = async () => {
    try {
      setLoading(true);
      // Auth rides the HttpOnly session cookie; an unauthenticated request 401s
      // and the catch shows the real empty state (never fabricated positions).
      const res = await axios.get(`${BACKEND_URL}/api/positions`, {
        withCredentials: true,
      });

      const real = res.data?.data?.positions;
      setPositions(real && real.length > 0 ? real : []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      setPositions([]);
      toast.error("Couldn't reach the positions service.");
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
        { withCredentials: true }
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
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Portfolio
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your performance, reputation, and assets.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push("/token")}
              className="relative overflow-hidden bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/50 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.2)] group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shine_1s_ease-in-out_infinite]" />
              <Coins className="w-4 h-4 mr-2 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold tracking-wide">Launch Token</span>
            </Button>
            
            <Button 
              onClick={() => router.push("/battlearena/new")}
              className="relative overflow-hidden bg-gradient-to-r from-primary/20 to-purple-600/20 hover:from-primary/30 hover:to-purple-600/30 border border-primary/50 text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.2)] group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shine_1s_ease-in-out_infinite]" />
              <Swords className="w-4 h-4 mr-2 text-primary group-hover:rotate-12 transition-transform" />
              <span className="font-semibold tracking-wide text-primary">Create Battle</span>
            </Button>
          </div>
        </div>

        {/* Top Grid: Chart & Reputation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section - Spans 2 columns */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 h-[400px]"
          >
            <PortfolioChart />
          </motion.div>

          {/* Reputation Section - Spans 1 column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 h-[400px]"
          >
            <Card className="h-full bg-[#0A0A0A] border-white/10 flex flex-col overflow-hidden relative group">
                {/* Decorative Gradients */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                                {userInfo?.user.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            {userInfo?.user.is_verified && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-[3px] border-[3px] border-[#0A0A0A] shadow-sm" title="Verified User">
                                    <BadgeCheck className="w-3.5 h-3.5 fill-white text-blue-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-white truncate">{userInfo?.user.username || "User"}</h3>
                                <span className="text-[10px] font-medium text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                    #{userInfo?.user.id?.toString().slice(0,4) || "0000"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                        KYC Level {userInfo?.user.kyc_level || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Centered Badge & Stats */}
                <div className="flex-1 flex flex-col justify-between p-6 relative z-10">
                    <div className="flex-1 flex items-center justify-center py-2">
                        <div className="w-full">
                             {/* We pass the hardcoded score for mock as requested */}
                            <ProfileCard
                                reputation_score={42500}
                                win_rate={userInfo?.user.win_rate || "0"}
                                battels_won={userInfo?.user.correct_predictions?.toString() || "0"}
                                total_wagged={userInfo?.user.total_volume ? Number(userInfo.user.total_volume) / LAMPORTS_PER_SOL : 0}
                                current_strak={0}
                            />
                        </div>
                    </div>
                </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Tabs defaultValue="positions" className="w-full space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <TabsList className="bg-transparent p-0 gap-6">
                        <TabsTrigger 
                            value="positions" 
                            className="bg-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary text-lg rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            My Positions
                        </TabsTrigger>
                        <TabsTrigger 
                            value="battles" 
                            className="bg-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary text-lg rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            Battles
                        </TabsTrigger>
                        <TabsTrigger 
                            value="tokens" 
                            className="bg-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary text-lg rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                        >
                            My Tokens
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="positions" className="space-y-6">
                    {/* Sub-tabs for Active/Expired */}
                    <Tabs defaultValue="active" onValueChange={setTab} className="w-full">
                        <div className="flex items-center gap-4 mb-6">
                            <TabsList className="bg-white/5 border border-white/10">
                                <TabsTrigger value="active">Active Positions</TabsTrigger>
                                <TabsTrigger value="expired">History</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="active" className="mt-0">
                            {loading ? (
                                <Spinner />
                            ) : activePositions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <Wallet className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium">No active positions</h3>
                                    <p className="text-muted-foreground mb-6">Start trading to build your portfolio</p>
                                    <Button onClick={() => router.push('/markets')}>Explore Markets</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

                        <TabsContent value="expired" className="mt-0">
                            {loading ? (
                                <Spinner />
                            ) : expiredPositions.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">No history available</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {expiredPositions.map((p) => (
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
                    </Tabs>
                </TabsContent>

                <TabsContent value="battles">
                    <UserBattlesList />
                </TabsContent>

                <TabsContent value="tokens">
                    <Tokens />
                </TabsContent>
            </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
