"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wallet, ArrowRight, AlertCircle, Settings2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuyInterfaceProps {
  token: any;
  onBuy: (amount: number) => Promise<void>;
  loading: boolean;
  compact?: boolean;
}

export function BuyInterface({ token, onBuy, loading, compact = false }: BuyInterfaceProps) {
  const [amount, setAmount] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const price = parseFloat(token.currentPrice) || 0;
  const estimatedTokens = price > 0 ? (numericAmount / price).toFixed(2) : "0";

  const handleBuyClick = async () => {
    if (!amount || numericAmount <= 0) return;
    await onBuy(numericAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/10 shadow-2xl shadow-black/50 h-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-xl font-bold text-white">Swap Tokens</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        <div className={cn(
          "flex flex-col items-center gap-4",
          !compact && "lg:flex-row lg:gap-6"
        )}>
          
          {/* Input Section */}
          <div className="w-full lg:flex-1 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>You pay</span>
              <div className="flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                <span>Balance: 0.00 SOL</span>
              </div>
            </div>
            
            <div 
              className={cn(
                "bg-[#141414] rounded-2xl p-4 border transition-all duration-200 h-[88px] flex flex-col justify-center",
                isFocused ? "border-primary/50 bg-[#1a1a1a]" : "border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-2xl lg:text-3xl font-bold text-white placeholder:text-white/20 focus:outline-none font-mono"
                />
                <div className="shrink-0 flex items-center gap-2 bg-black rounded-full pl-2 pr-4 py-1.5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]" />
                  <span className="font-bold text-white text-sm">SOL</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className={cn(
            "flex justify-center w-full",
            !compact ? "lg:pt-6 lg:w-auto" : "py-2"
          )}>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all cursor-pointer shadow-lg">
              <ArrowRight className={cn(
                "w-5 h-5 rotate-90",
                !compact && "lg:rotate-0"
              )} />
            </div>
          </div>

          {/* Output Section */}
          <div className="w-full lg:flex-1 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>You receive</span>
              <span>Balance: 0.00 {token.symbol}</span>
            </div>
            
            <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 h-[88px] flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="w-full text-2xl lg:text-3xl font-bold text-white font-mono truncate">
                  {estimatedTokens}
                </div>
                <div className="shrink-0 flex items-center gap-2 bg-black rounded-full pl-2 pr-4 py-1.5 border border-white/10">
                  {token.imageUri ? (
                    <img src={token.imageUri} className="w-6 h-6 rounded-full" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-800" />
                  )}
                  <span className="font-bold text-white text-sm">{token.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className={cn(
            "w-full",
            !compact && "lg:w-[200px] lg:pt-6"
          )}>
             <Button
              onClick={handleBuyClick}
              disabled={loading || !amount || numericAmount <= 0}
              className="w-full h-[88px] text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all duration-300"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Swapping...</span>
                </div>
              ) : (
                "Swap"
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-4 border-t border-white/5 mt-6">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-primary" />
            <span>1 SOL ≈ {(1 / price).toFixed(2)} {token.symbol}</span>
          </div>
          <div className="flex items-center gap-4">
             <span>Slippage: Auto</span>
             <span>Network Fee: ~0.00005 SOL</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
