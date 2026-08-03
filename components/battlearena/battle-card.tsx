"use client";

import { motion } from "framer-motion";
import { Swords, Trophy, Users, Timer, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { PublicKey } from "@solana/web3.js";
import { cn } from "@/lib/utils";
import {
  deriveBattleLifecycle,
  battleStatusLabel,
  battleTimeLabel,
} from "@/lib/battleStatus";

interface BattleData {
  status?: Record<string, unknown>;
  sideAPool?: unknown;
  sideBPool?: unknown;
  totalPool?: unknown;
  title?: string;
  imageUrl?: string | null;
  uniqueParticipants?: unknown;
  // Decoded on-chain value is a BN of unix seconds; other call paths may pass a
  // number/string. Kept `unknown` (like the pool fields) and coerced via safe().
  endTime?: unknown;
  startTime?: unknown;
}

interface BattleCardProps {
  battle: {
    pda: PublicKey | string;
    data: BattleData;
  };
  index: number;
}

export function BattleCard({ battle, index }: BattleCardProps) {
  const d = battle.data;
  // Derived, not the raw enum — see lib/battleStatus.ts for why.
  const lifecycle = deriveBattleLifecycle(d.status, d.startTime, d.endTime);
  const status = battleStatusLabel(lifecycle);
  const isActive = lifecycle === "live";

  const safe = (v: unknown) => {
    if (v === null || v === undefined) return "0";
    return String(v);
  };

  const sideAPool = parseFloat(safe(d.sideAPool));
  const sideBPool = parseFloat(safe(d.sideBPool));
  const total = sideAPool + sideBPool;
  const percentA = total > 0 ? (sideAPool / total) * 100 : 50;
  const percentB = 100 - percentA;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative h-[500px] w-full rounded-[32px] overflow-hidden bg-[#050505] border border-white/5 hover:border-white/10 transition-all duration-500 shadow-2xl"
    >
      {/* 1. Full Bleed Background Image */}
      <div className="absolute inset-0 z-0">
        {/* Top Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent z-10 h-32" />
        
        {/* Bottom Gradient - Toned down bleed */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-10" style={{ background: 'linear-gradient(to top, #050505 45%, rgba(5,5,5,0.6) 65%, transparent 100%)' }} />
        
        {d.imageUrl ? (
          <img 
            src={d.imageUrl} 
            alt={d.title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <Swords className="w-20 h-20 text-white/5" />
          </div>
        )}
      </div>

      {/* 2. Top Badges - Cleaner Look */}
      <div className="absolute top-5 left-5 right-5 z-20 flex justify-between items-start">
        {/* Status Tag - Solid & Clean */}
        <div className={cn(
          "px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md",
          isActive 
            ? "bg-emerald-500 text-emerald-950" 
            : "bg-neutral-800 text-neutral-400"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isActive ? "bg-emerald-950" : "bg-neutral-500")} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{status}</span>
        </div>

        {/* Prize Pool - Minimalist */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111]/90 border border-white/10 backdrop-blur-md shadow-lg">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white text-sm">{safe(d.totalPool)} SOL</span>
        </div>
      </div>

      {/* 3. Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-6 flex flex-col justify-end">
        {/* Title Section */}
        <div className="mb-6 transform transition-transform duration-500 group-hover:-translate-y-1">
          <h3 className="text-2xl font-bold text-white mb-3 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
            {d.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-white/50 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{safe(d.uniqueParticipants)} Players</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              <span>
                {d.endTime
                  ? `${battleTimeLabel(d.endTime).isPast ? "Ended" : "Ends"} ${new Date(
                      Number(safe(d.endTime)) * 1000
                    ).toLocaleDateString()}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider mb-0.5">Side A</span>
              <span className="text-lg font-black text-blue-400">{Math.round(percentA)}%</span>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1.5">VS</span>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-rose-400/80 uppercase tracking-wider mb-0.5">Side B</span>
              <span className="text-lg font-black text-rose-400">{Math.round(percentB)}%</span>
            </div>
          </div>
          
          <div className="relative h-2.5 w-full bg-[#111] rounded-full overflow-hidden flex items-center p-0.5 ring-1 ring-white/10">
            {/* Diagonal Split Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#050505] z-10 -skew-x-12 scale-y-150" />
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentA}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full rounded-l-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] relative group-hover:brightness-110 transition-all"
            />
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentB}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full rounded-r-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] relative group-hover:brightness-110 transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link href={`/battlearena/${battle.pda}`} className="w-full group/btn">
            <button className="w-full relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-blue-500/30 p-3 transition-all duration-300 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover/btn:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Bet Side A</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </button>
          </Link>

          <Link href={`/battlearena/${battle.pda}`} className="w-full group/btn">
            <button className="w-full relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-rose-500/30 p-3 transition-all duration-300 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] group-hover/btn:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Bet Side B</span>
                <TrendingUp className="w-4 h-4 text-rose-500" />
              </div>
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
