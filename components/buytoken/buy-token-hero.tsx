"use client";

import { Clock, Swords, Trophy, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  color: string;
  icon: ReactNode;
  label: string;
  value: string;
  tag: string;
  delay: number;
}

function StatCard({ color, icon, label, value, tag, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="relative group flex flex-col justify-between p-6 w-full rounded-2xl border bg-[#0A0A0A]/80 backdrop-blur-xl overflow-hidden"
      style={{
        borderColor: `${color}20`,
      }}
    >
      {/* Glow Effects */}
      <div
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: color }}
      />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div
          className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300"
        >
          {icon}
        </div>
        <span 
          className="text-[10px] font-bold px-2 py-1 rounded-full border bg-white/5"
          style={{ color: color, borderColor: `${color}30` }}
        >
          {tag}
        </span>
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h2>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

export function BuyTokenHero() {
  return (
    <div className="relative mb-16 pt-32">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col items-center text-center mb-16 max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="group relative inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-colors duration-500 mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 group-hover:text-white transition-colors">
            Meme Token Marketplace
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Discover the Next <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x">
            Moonshot
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Trade, stake, and compete with the hottest meme tokens on Solana. 
          Join thousands of traders in the ultimate battle arena.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4">
        <StatCard
          delay={0.3}
          color="#f59e0b"
          icon={<Swords className="w-5 h-5 text-amber-500" />}
          label="Active Battles"
          value="24"
          tag="LIVE"
        />
        <StatCard
          delay={0.4}
          color="#ec4899"
          icon={<Trophy className="w-5 h-5 text-pink-500" />}
          label="Total Prize Pool"
          value="$2.4M"
          tag="+24H"
        />
        <StatCard
          delay={0.5}
          color="#8b5cf6"
          icon={<Users className="w-5 h-5 text-violet-500" />}
          label="Total Traders"
          value="12.8K"
          tag="ONLINE"
        />
        <StatCard
          delay={0.6}
          color="#3b82f6"
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          label="Avg Duration"
          value="6h"
          tag="FAST"
        />
      </div>
    </div>
  );
}
