"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, Zap, Swords, Rocket, Coins, 
  Briefcase, Trophy, PlusCircle, ArrowRight, 
  LayoutGrid, ShieldCheck, Activity
} from "lucide-react";
import Link from "next/link";
import { Background } from "@/components/background";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Prediction Markets",
    description: "Trade on real-world outcomes across Crypto, Finance, Gaming, and Tech. Take a position on 'Yes' or 'No' and profit from your insights.",
    icon: BarChart3,
    link: "/markets",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20"
  },
  {
    title: "Fast Bets",
    description: "High-frequency, short-term prediction markets. Will Bitcoin pump in the next 10 minutes? Quick resolution, instant payouts.",
    icon: Zap,
    link: "/fastbet",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20"
  },
  {
    title: "Meme Battles",
    description: "The ultimate PvP arena. Token communities clash in head-to-head prediction battles. Vote with your wallet and prove your community's strength.",
    icon: Swords,
    link: "/battlearena",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20"
  },
  {
    title: "Token Launchpad",
    description: "Deploy fully-featured SPL tokens on Solana in seconds. Customize supply, economics, and socials with zero coding required.",
    icon: Rocket,
    link: "/token",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20"
  },
  {
    title: "Token Marketplace",
    description: "Discover, analyze, and swap the hottest new tokens. Advanced filtering and real-time data to find the next gem.",
    icon: Coins,
    link: "/buytoken",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20"
  },
  {
    title: "Create Battle",
    description: "Host your own prediction events. Set the terms, choose the contestants, and earn fees as the battle organizer.",
    icon: PlusCircle,
    link: "/battlearena/new",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20"
  },
  {
    title: "Leaderboard",
    description: "Compete against the best predictors. Climb the ranks, earn reputation points, and unlock exclusive achievement badges.",
    icon: Trophy,
    link: "/leaderboard",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20"
  },
  {
    title: "Portfolio",
    description: "Your command center. Track active positions, monitor PnL, manage assets, and view your reputation stats in one place.",
    icon: Briefcase,
    link: "/portfolio",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20"
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 pb-20">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 pt-24 lg:pt-32 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider"
          >
            <Activity className="w-3 h-3" />
            <span>Platform Guide</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black tracking-tight text-white"
          >
            Master the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Quantum Ecosystem
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            Explore a comprehensive suite of decentralized prediction tools, trading markets, and community features built on Solana.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link href={feature.link} className="block h-full">
                <div className="group relative h-full bg-[#0A0A0A] border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden">
                  
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-3 rounded-xl border", feature.bg, feature.border)}>
                        <feature.icon className={cn("w-6 h-6", feature.color)} />
                      </div>
                      <div className="p-2 rounded-full bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm text-white/60 leading-relaxed mb-4 flex-grow">
                      {feature.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider">
                      <span>Learn More</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to start predicting?</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Join thousands of traders on the most advanced prediction market platform. Connect your wallet and place your first bet today.
            </p>
            <Link 
              href="/markets"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
            >
              Explore Markets
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
