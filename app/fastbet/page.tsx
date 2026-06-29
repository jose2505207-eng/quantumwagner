"use client";

import { Background } from "@/components/background";
import FastBetHero from "@/components/fastbet/FastBetHero";
import FastBetCard from "@/components/fastbet/FastBetCard";
import { DemoBadge } from "@/components/game";
import { useFastBets } from "@/lib/useFastBets";
import { motion } from "framer-motion";

export default function FastBetsPage() {
  const { fastBets, source, loading } = useFastBets();

  const activeCount = fastBets.filter((b) => b.status === "live").length;
  const isDemo = source === "demo";
  const isEmpty = !loading && source === "empty";

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans selection:bg-yellow-500/30">
      <Background />

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 mt-20 max-w-7xl">
        <FastBetHero />

        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-yellow-500" />
              Live &amp; Upcoming
              {isDemo && (
                <DemoBadge note="Demo fallback shown because no live fast-bet rounds are currently available." />
              )}
            </h2>
            {!isEmpty && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-white">{activeCount} Active</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-[2rem] bg-white/[0.02] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-24 rounded-[2rem] bg-white/[0.02] border border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-5">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No live rounds right now</h3>
              <p className="text-white/40 max-w-md">
                There are no fast-bet rounds open at the moment. Check back shortly — new rounds
                open continuously.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {fastBets.map((bet, index) => (
                <FastBetCard key={bet.id} {...bet} index={index} />
              ))}
            </div>
          )}

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
