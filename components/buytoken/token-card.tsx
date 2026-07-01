"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Activity, BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicKey } from "@solana/web3.js";
import type { IdlAccounts } from "@coral-xyz/anchor";
import type { PredictionMarket } from "@/idl/types";

type TokenLaunch = IdlAccounts<PredictionMarket>["tokenLaunch"];

interface TokenCardProps {
  token: { publicKey: PublicKey; account: TokenLaunch };
  index: number;
}

export function TokenCard({ token, index }: TokenCardProps) {
  const acc = token.account;
  const name = acc.name || "Unnamed Token";
  const symbol = acc.symbol || "UNKNOWN";
  const mint = acc.tokenMint;
  const imageUri = acc.imageUri;
  const status = Object.keys(acc.status || {})[0] || "unknown";
  
  // No live price feed exists for launch tokens yet. Show neutral placeholders
  // instead of fabricated figures — this also removes a Math.random()-in-render
  // hydration mismatch. `status` above is real (from the on-chain account).
  const price = "—";
  const marketCap = "—";
  const volume = "—";

  return (
    <Link href={`/token/${mint}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative h-full bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_-10px_rgba(var(--primary-rgb),0.3)]"
      >
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
        
        <div className="p-5 flex flex-col h-full relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                {imageUri ? (
                  <img 
                    src={imageUri} 
                    alt={name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors truncate max-w-[120px]">
                  {name}
                </h3>
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  {symbol}
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className={cn(
                    "uppercase text-[10px]",
                    status === "active" ? "text-emerald-400" : "text-yellow-400"
                  )}>
                    {status}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border bg-white/5 text-muted-foreground border-white/10">
              <Activity className="w-3 h-3" />
              —
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
              <span className="text-lg text-muted-foreground">$</span>
              {price}
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                <Activity className="w-3 h-3" />
                Vol 24h
              </div>
              <div className="text-sm font-semibold text-white">${volume}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
                <BarChart3 className="w-3 h-3" />
                Mkt Cap
              </div>
              <div className="text-sm font-semibold text-white">${marketCap}</div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-[#0A0A0A] bg-neutral-800 flex items-center justify-center text-[8px] text-white/50">
                  U{i+1}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full border border-[#0A0A0A] bg-neutral-900 flex items-center justify-center text-[8px] text-white/50">
                +
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
              Trade Now
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
