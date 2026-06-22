"use client";

import { Background } from "@/components/background";
import FastBetHero from "@/components/fastbet/FastBetHero";
import FastBetCard from "@/components/fastbet/FastBetCard";
import { DemoBadge } from "@/components/game";
import { motion } from "framer-motion";

export default function FastBetsPage() {
  // DEMO DATA: there is no live fast-bet feed yet, so these rounds are
  // illustrative seed data and are clearly badged as demo in the UI below.
  const demoFastBets = [
    {
      id: 1,
      question: "Will PUMP reach $0.005 in 10 minutes?",
      currentPrice: 0.00423,
      yesPercentage: 68,
      noPercentage: 32,
      totalPool: 50700,
      timeRemaining: "8m 34s",
      status: "live" as const,
      riskLevel: "high" as const,
    },
    {
      id: 2,
      question: "Will MEME dump 20% in next 15 minutes?",
      currentPrice: 0.00312,
      yesPercentage: 45,
      noPercentage: 55,
      totalPool: 42000,
      timeRemaining: "12m 18s",
      status: "live" as const,
      riskLevel: "medium" as const,
    },
    {
      id: 3,
      question: "Will ROCKET hit ATH in 5 minutes?",
      currentPrice: 0.00567,
      yesPercentage: 82,
      noPercentage: 18,
      totalPool: 50000,
      timeRemaining: "3m 45s",
      status: "closing-soon" as const,
      riskLevel: "high" as const,
    },
    {
      id: 4,
      question: "Will DEGEN pump 30% in 10 minutes?",
      currentPrice: 0.00189,
      yesPercentage: 0,
      noPercentage: 0,
      totalPool: 0,
      timeRemaining: "Starts in 24m",
      status: "upcoming" as const,
      riskLevel: "medium" as const,
    },
    {
      id: 5,
      question: "Will MOON reach $0.01 in 12 minutes?",
      currentPrice: 0.00834,
      yesPercentage: 76,
      noPercentage: 24,
      totalPool: 60000,
      timeRemaining: "Resolving...",
      status: "resolving" as const,
      riskLevel: "high" as const,
    },
    {
      id: 6,
      question: "Will PEPE dump 25% in 8 minutes?",
      currentPrice: 0.00245,
      yesPercentage: 42,
      noPercentage: 58,
      totalPool: 50000,
      timeRemaining: "Resolved",
      status: "resolved" as const,
      riskLevel: "low" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans selection:bg-yellow-500/30">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 mt-20 max-w-7xl">
        <FastBetHero />

        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-yellow-500" />
              Live & Upcoming
              <DemoBadge note="Fast bets are demo rounds — no live fast-bet feed is connected yet." />
            </h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-white">
                {demoFastBets.filter(b => b.status === 'live').length} Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {demoFastBets.map((bet, index) => (
              <FastBetCard key={bet.id} {...bet} index={index} />
            ))}
          </div>

          {/* How It Works Section */}
          <div className="mt-32 mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-white/40 max-w-2xl mx-auto">
                Three simple steps to start winning in the fastest prediction market on Solana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Choose a Market",
                  desc: "Select a coin and a timeframe. Will it pump or dump in the next 5 minutes?",
                  icon: "🎯"
                },
                {
                  step: "02",
                  title: "Place Your Bet",
                  desc: "Pick your side (YES or NO) and stake your SOL. The pool grows as more players join.",
                  icon: "💸"
                },
                {
                  step: "03",
                  title: "Instant Payout",
                  desc: "If you win, your share of the pool is automatically sent to your wallet immediately after resolution.",
                  icon: "⚡"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden group hover:bg-white/[0.04] transition-colors"
                >
                  <div className="absolute -right-4 -top-4 text-8xl font-black text-white/[0.02] group-hover:text-white/[0.05] transition-colors select-none">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
