"use client";

import { usePlatformStats, formatSol } from "@/lib/usePlatformStats";
import {
  Activity,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/**
 * Platform stats. Previously six invented constants; now the real counts, with
 * "…" while loading and "—" for anything that genuinely has no value yet.
 */
export default function PlatformStats() {
  const { stats: live, loading } = usePlatformStats();
  const show = (value: string) => (loading ? "…" : value);
  const stats = [
    { icon: DollarSign, value: show(formatSol(live?.totalVolumeSol ?? 0)), label: "Total Volume", desc: "Staked across all markets" },
    { icon: Users, value: show(String(live?.traders ?? 0)), label: "Players", desc: "Wallets that have signed in" },
    { icon: Activity, value: show(String(live?.activeMarkets ?? 0)), label: "Active Markets", desc: "Open prediction markets" },
    {
      icon: Target,
      value: show(
        live?.accuracyPercent === null || live?.accuracyPercent === undefined
          ? "—"
          : `${live.accuracyPercent.toFixed(1)}%`
      ),
      label: "Accuracy Rate",
      desc: "Winning share of settled bets",
    },
    { icon: TrendingUp, value: show(String(live?.totalPredictions ?? 0)), label: "Bets Placed", desc: "Confirmed on-chain stakes" },
    { icon: Zap, value: show(String(live?.tokensLaunched ?? 0)), label: "Tokens Launched", desc: "Deployed from the launchpad" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 py-12">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="
              relative overflow-hidden
              rounded-2xl p-8 text-center
              bg-gradient-to-b from-[#111] via-[#0c0c0c] to-[#0a0a0a]
              border border-[#1c1c1c]
              shadow-[0_4px_20px_rgba(0,0,0,0.6)]
              hover:shadow-[0_6px_24px_rgba(0,0,0,0.8)]
              transition-all
            "
          >
            {/* Foreground small icon with glow */}
            <div className="relative flex items-center justify-center w-12 h-12 mx-auto mb-6 rounded-lg bg-purple-500/10 z-10">
              <Icon className="w-6 h-6 text-purple-400" />
              <div className="absolute inset-0 rounded-lg bg-purple-500/5 blur-md" />
            </div>

            {/* Text */}
            <div className="text-3xl font-bold text-white mb-2 z-10 relative">
              {stat.value}
            </div>
            <div className="text-gray-300 font-medium z-10 relative">{stat.label}</div>
            <div className="text-gray-500 text-sm mt-1 z-10 relative">{stat.desc}</div>

            {/* Background watermark icon */}
            <Icon
              className="absolute right-4 bottom-4 w-24 h-24 text-gray-500/5"
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
