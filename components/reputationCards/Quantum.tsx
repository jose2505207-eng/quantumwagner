"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface ReputationCardProps {
  score?: number;
  nextTier?: string;
  nextScore?: number;
  percentile?: number;
}

export default function QuantumReputationCard({
  score = 87300,
  nextTier = "MAX",
  nextScore = 12700,
  percentile = 0.3,
}: ReputationCardProps) {
  const totalNeeded = score + nextScore;
  const progress = Math.min((score / totalNeeded) * 100, 100);

  return (
    <div className="relative w-[200px] h-[260px] mx-auto group perspective-1000">
      <div className="relative w-full h-full transition-all duration-500 transform preserve-3d group-hover:rotate-y-6">
        {/* Main Card Body */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-fuchsia-950 to-black rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden flex flex-col items-center pt-6 pb-4 px-4">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.4),transparent_70%)]"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-600/10 blur-3xl rounded-full"></div>

            {/* Icon */}
            <div className="relative z-10 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-purple-400 to-fuchsia-600 p-[1px] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                        <Zap className="w-6 h-6 text-purple-400 fill-purple-400/20" />
                    </div>
                </div>
            </div>

            {/* Text Info */}
            <div className="relative z-10 text-center mb-auto">
                <h3 className="text-lg font-bold text-white tracking-wide">QUANTUM</h3>
                <p className="text-[9px] text-purple-200/60 uppercase tracking-[0.2em] font-medium mt-1">Legendary Trader</p>
            </div>

            {/* Score */}
            <div className="relative z-10 text-center mb-5">
                <div className="text-3xl font-black text-white tracking-tighter drop-shadow-md">
                    {score.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Reputation Score</div>
            </div>

            {/* Progress */}
            <div className="relative z-10 w-full">
                <div className="flex justify-between text-[9px] text-slate-400 mb-1.5 px-1">
                    <span>Next: {nextTier}</span>
                    <span className="text-purple-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                    />
                </div>
                <div className="mt-2 text-center">
                    <span className="text-[9px] text-slate-500">Top <span className="text-purple-400">{percentile}%</span> of players</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
