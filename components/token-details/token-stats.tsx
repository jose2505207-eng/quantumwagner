"use client";

import { motion } from "framer-motion";
import { Coins, BarChart3, Users, Activity } from "lucide-react";
import { toDisplay } from "@/lib/format";

interface TokenStatsProps {
  token: any;
}

export function TokenStats({ token }: TokenStatsProps) {
  const stats = [
    {
      label: "Current Price",
      value: `${toDisplay(token.currentPrice)} SOL`,
      icon: <Coins className="w-5 h-5 text-yellow-400" />,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20"
    },
    {
      label: "Total Supply",
      value: `${toDisplay(token.totalSupply)}`,
      subValue: token.symbol,
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    },
    {
      label: "Market Cap",
      value: `${toDisplay(token.currentMarketCap || "0")} SOL`,
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20"
    },
    {
      label: "Holders",
      value: toDisplay(token.totalBuyers || "0"),
      icon: <Users className="w-5 h-5 text-purple-400" />,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
          className="relative group p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.border} border`}>
              {stat.icon}
            </div>
            {index === 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                LIVE
              </span>
            )}
          </div>
          
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {stat.value}
            </h3>
            {stat.subValue && (
              <p className="text-xs text-muted-foreground mt-0.5">{stat.subValue}</p>
            )}
          </div>

          {/* Hover Glow */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/5 to-transparent`} />
        </motion.div>
      ))}
    </div>
  );
}
