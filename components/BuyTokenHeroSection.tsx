"use client";

import { Clock, Swords, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { usePlatformStats, formatSol } from "@/lib/usePlatformStats";

function StatCard({ color, icon, label, value, tag }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative group flex flex-col justify-between
                 p-8 w-[250px] sm:w-[280px] md:w-[300px] lg:w-[320px]
                 rounded-2xl border bg-[#0d0d0d]/90 backdrop-blur-xl
                 overflow-visible transition-all duration-500"
      style={{
        borderColor: `${color}25`,
        boxShadow: `0 0 0 1px ${color}15, inset 0 0 6px ${color}08`,
      }}
    >
      {/* === OUTER BORDER GLOW (very soft) === */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                   transition-all duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 12px 2px ${color}30, 0 0 25px 4px ${color}15`,
          border: `1px solid ${color}70`,
          zIndex: -1,
          filter: "blur(0.5px)",
        }}
      />

      {/* === DIRECTIONAL INNER GLOW (subtle top-right light) === */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                   transition-all duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 25%, ${color}12 0%, transparent 70%)`,
          boxShadow: `inset 0 0 20px ${color}10`,
          zIndex: 0,
        }}
      />

      {/* Top Section */}
      <div className="flex justify-between items-center mb-6 relative z-[2]">
        <div
          className="p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
          }}
        >
          {icon}
        </div>
        <span className="text-xs font-medium" style={{ color }}>
          {tag}
        </span>
      </div>

      {/* Content */}
      <h2 className="text-4xl font-bold text-white relative z-[2]">{value}</h2>
      <p className="text-gray-400 text-sm mt-1 relative z-[2]">{label}</p>
    </motion.div>
  );
}

export default function BuyHeroSection() {
  // Real counts — these tiles displayed fixed marketing numbers before.
  const { stats: live, loading } = usePlatformStats();
  const show = (value: string) => (loading ? "…" : value);
  return (
    <div className="mb-16 mt-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full 
                      border border-[#ff7300]/40 
                      bg-gradient-to-br from-[#1a0b00] to-[#2b0e00] 
                      text-[#ff9d2a] font-semibold tracking-wide 
                      shadow-[0_0_10px_rgba(255,115,0,0.15)]"
        >
          <Swords className="w-4 h-4 text-[#ff9d2a]" />
          Buy Token
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold mt-4">
          Buy{" "}
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Tokens
          </span>
        </h1>

        <p className="text-gray-400 mt-3 max-w-2xl text-sm sm:text-base">
          Stake on your favorite tokens, compete for rewards, and rise to the
          top.
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex justify-center">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 
                     max-w-[1500px] w-full justify-items-center"
        >
          <StatCard
            color="#ff7b00"
            icon={<Swords className="w-6 h-6 text-white" />}
            label="Tokens Launched"
            value={show(String(live?.tokensLaunched ?? 0))}
            tag="Live"
          />
          <StatCard
            color="#ffd000"
            icon={<Trophy className="w-6 h-6 text-white" />}
            label="Platform Volume"
            value={show(formatSol(live?.totalVolumeSol ?? 0))}
            tag="+24h"
          />
          <StatCard
            color="#b14fff"
            icon={<Users className="w-6 h-6 text-white" />}
            label="Players"
            value={show(String(live?.traders ?? 0))}
            tag="Online"
          />
          <StatCard
            color="#00b4ff"
            icon={<Clock className="w-6 h-6 text-white" />}
            label="Open Markets"
            value={show(String(live?.activeMarkets ?? 0))}
            tag="Avg"
          />
        </div>
      </div>
    </div>
  );
}
