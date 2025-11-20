"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, ArrowRight, RefreshCcw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FastBetResolutionProps {
  outcome: "yes" | "no" | "platform";
  question: string;
  userSide?: "yes" | "no";
  userAmount?: number;
  payout?: number;
  onClose?: () => void;
}

export default function FastBetResolution({
  outcome,
  question,
  userSide,
  userAmount = 0,
  payout = 0,
  onClose
}: FastBetResolutionProps) {
  
  const isWinner = userSide && outcome === userSide;
  const isPlatformWin = outcome === "platform";
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-md mx-auto relative group"
    >
      {/* Animated Glow Background */}
      <div className={cn(
        "absolute -inset-1 rounded-[2.5rem] blur-xl opacity-50 transition-all duration-1000",
        isPlatformWin ? "bg-orange-500/30" : 
        isWinner ? "bg-green-500/30" : "bg-red-500/30"
      )} />

      <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Top Decoration */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1.5 opacity-80",
          isPlatformWin ? "bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" : 
          isWinner ? "bg-gradient-to-r from-green-600 via-green-400 to-green-600" : 
          "bg-gradient-to-r from-red-600 via-red-400 to-red-600"
        )} />

        <div className="p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Icon Section */}
          <div className="mb-8 relative">
            <div className={cn(
              "absolute inset-0 blur-2xl opacity-40",
              isPlatformWin ? "bg-orange-500" : isWinner ? "bg-green-500" : "bg-red-500"
            )} />
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className={cn(
                "relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl",
                isPlatformWin ? "bg-orange-500/10 border-orange-500 text-orange-500" : 
                isWinner ? "bg-green-500/10 border-green-500 text-green-500" : 
                "bg-red-500/10 border-red-500 text-red-500"
              )}
            >
              {isPlatformWin ? <ShieldAlert className="w-12 h-12" /> : 
               isWinner ? <Trophy className="w-12 h-12" /> : 
               <XCircle className="w-12 h-12" />}
            </motion.div>
          </div>

          {/* Title & Description */}
          <div className="mb-8 space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">
              {isPlatformWin ? "DRAW" : isWinner ? "YOU WON!" : "YOU LOST"}
            </h2>
            <p className="text-white/60 font-medium">
              {isPlatformWin 
                ? "Price stayed within the neutral zone." 
                : isWinner 
                  ? "Incredible prediction! You crushed it." 
                  : "Don't give up. The next one is yours."}
            </p>
          </div>

          {/* Stats Card */}
          <div className="w-full bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white/40">Outcome</span>
              <span className={cn(
                "text-sm font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-white/5 border border-white/5",
                outcome === "yes" ? "text-green-400" : 
                outcome === "no" ? "text-red-400" : "text-orange-400"
              )}>
                {outcome === "platform" ? "Neutral" : `${outcome} Wins`}
              </span>
            </div>
            
            {userSide && (
              <>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/40">Your Bet</span>
                  <span className="text-sm font-bold text-white font-mono">{userAmount} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/40">Payout</span>
                  <span className={cn(
                    "text-xl font-black font-mono",
                    isWinner ? "text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "text-white/20"
                  )}>
                    {isWinner ? `+${payout} SOL` : "0 SOL"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <Link href="/fastbet" className="w-full">
              <button className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-wider hover:bg-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-white/10">
                <RefreshCcw className="w-5 h-5" />
                Play Again
              </button>
            </Link>
            <Link href="/leaderboard" className="w-full">
              <button className="w-full py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all border border-white/10">
                View Leaderboard
              </button>
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
