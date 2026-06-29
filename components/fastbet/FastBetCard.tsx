"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, TrendingDown, Users, ArrowRight, Zap, Trophy, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FastBetCardProps {
  /** number for demo seed rows, string (cuid) for live backend rows. */
  id: string | number;
  question: string;
  /** Optional: not exposed by the fast-bets list endpoint, so omitted for live. */
  currentPrice?: number;
  /** YES/NO split. Omitted for live (list endpoint has no per-side breakdown). */
  yesPercentage?: number;
  noPercentage?: number;
  totalPool: number;
  timeRemaining: string;
  status: "live" | "closing-soon" | "upcoming" | "resolving" | "resolved";
  riskLevel?: "low" | "medium" | "high";
  /** Live extras used when price/percentage are unknown. */
  symbol?: string;
  entries?: number;
  index?: number;
}

export default function FastBetCard({
  id,
  question,
  currentPrice,
  yesPercentage,
  noPercentage,
  totalPool,
  timeRemaining,
  status,
  riskLevel = "medium",
  symbol,
  entries,
  index = 0,
}: FastBetCardProps) {

  const hasSplit =
    typeof yesPercentage === "number" && typeof noPercentage === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      {/* Animated Glow Background */}
      <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative h-full bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col">
        {/* Top Decoration Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

        <div className="p-6 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                status === "live" ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10" :
                status === "closing-soon" ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse shadow-red-500/10" :
                "bg-white/5 text-white/40 border-white/10"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", 
                  status === "live" ? "bg-green-400 animate-pulse" :
                  status === "closing-soon" ? "bg-red-400 animate-pulse" :
                  "bg-white/40"
                )} />
                {status.replace("-", " ")}
              </div>
              {riskLevel === "high" && (
                <div className="px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold" title="High Volatility">
                  <Zap className="w-3 h-3" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-medium text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="tabular-nums">{timeRemaining}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-6 flex-grow">
            <h3 className="text-xl font-bold text-white leading-snug mb-3 group-hover:text-purple-200 transition-colors">
              {question}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-white/60 bg-white/[0.02] px-2 py-1 rounded-lg border border-white/5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                {Number.isFinite(currentPrice) ? (
                  <span>Price: <span className="text-white font-mono">${currentPrice}</span></span>
                ) : (
                  <span>{symbol ? <span className="text-white font-mono">{symbol}</span> : "Live"}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-white/60 bg-white/[0.02] px-2 py-1 rounded-lg border border-white/5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Pool: <span className="text-white font-mono">${(totalPool / 1000).toFixed(1)}k</span></span>
              </div>
            </div>
          </div>

          {/* Visual Stats Bar */}
          {hasSplit ? (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs font-bold tracking-wider">
                <span className="text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {yesPercentage}% YES
                </span>
                <span className="text-red-400 flex items-center gap-1">
                  {noPercentage}% NO <TrendingDown className="w-3 h-3" />
                </span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${yesPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${noPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 ml-auto shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-white/50">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  {typeof entries === "number" ? `${entries} ${entries === 1 ? "entry" : "entries"}` : "Open for bets"}
                </span>
                <span className="text-white/30">Pick a side below</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Link href={`/fastbet/${id}?side=yes`} className="w-full">
              <button className="w-full group/btn relative overflow-hidden rounded-xl bg-green-500/10 border border-green-500/20 p-3 transition-all duration-300 hover:bg-green-500 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-sm font-black text-green-400 group-hover/btn:text-black uppercase tracking-wider">Bet Yes</span>
                  <span className="text-[10px] font-medium text-green-400/60 group-hover/btn:text-black/60">Multiplier 1.8x</span>
                </div>
              </button>
            </Link>

            <Link href={`/fastbet/${id}?side=no`} className="w-full">
              <button className="w-full group/btn relative overflow-hidden rounded-xl bg-red-500/10 border border-red-500/20 p-3 transition-all duration-300 hover:bg-red-500 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-sm font-black text-red-400 group-hover/btn:text-black uppercase tracking-wider">Bet No</span>
                  <span className="text-[10px] font-medium text-red-400/60 group-hover/btn:text-black/60">Multiplier 2.1x</span>
                </div>
              </button>
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
