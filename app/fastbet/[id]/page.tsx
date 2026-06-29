"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Zap, AlertCircle, Wallet, Activity, Target } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import FastBetResolution from "@/components/fastbet/FastBetResolution";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

export default function FastBetDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const initialSide = searchParams.get("side") as "yes" | "no" | null;

  const [selectedSide, setSelectedSide] = useState<"yes" | "no" | null>(initialSide);
  const [amount, setAmount] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [chartData, setChartData] = useState<{ time: number; price: number }[]>(
    []
  );

  // Mock Data
  const betData = {
    question: "Will PUMP reach $0.005 in 10 minutes?",
    currentPrice: 0.00423,
    targetPrice: 0.005,
    yesPool: 34500,
    noPool: 16200,
    yesPercent: 68,
    noPercent: 32,
  };

  // Generate Chart Data
  useEffect(() => {
    const data: { time: number; price: number }[] = [];
    let price = 0.00400;
    for (let i = 0; i < 60; i++) {
      price = price + (Math.random() - 0.4) * 0.0002; // Slight upward trend
      data.push({
        time: i,
        price: price,
      });
    }
    setChartData(data);
  }, []);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans selection:bg-purple-500/30">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 py-8 mt-20 max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/fastbet" className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Fast Bets</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-black text-green-400 uppercase tracking-wider">Live Market</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Chart & Info */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Card */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden p-8 relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight max-w-2xl">
                      {betData.question}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/80">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold uppercase text-xs">High Volatility</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[160px]">
                    <div className="text-xs font-medium text-white/40 mb-1 uppercase tracking-wider">Current Price</div>
                    <div className="text-3xl font-mono font-black text-white tracking-tight">${betData.currentPrice}</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12.4%</span>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="h-80 w-full bg-white/[0.02] rounded-2xl border border-white/5 mb-8 relative overflow-hidden p-2">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          orientation="right" 
                          tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'monospace' }} 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `$${val.toFixed(4)}`}
                          width={60}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}
                          formatter={(value: number) => [`$${value.toFixed(5)}`, 'Price']}
                          labelStyle={{ display: 'none' }}
                          cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <ReferenceLine y={betData.targetPrice} stroke="#a855f7" strokeDasharray="3 3" strokeWidth={1.5}>
                           <g transform={`translate(0, -10)`}>
                              <text x="10" y="0" fill="#a855f7" fontSize="10" fontWeight="bold">TARGET: ${betData.targetPrice}</text>
                           </g>
                        </ReferenceLine>
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10 relative overflow-hidden group/stat">
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-black text-green-400 uppercase tracking-wider">YES POOL</div>
                        <TrendingUp className="w-4 h-4 text-green-500/50" />
                      </div>
                      <div className="text-2xl font-black text-white mb-1">${betData.yesPool.toLocaleString()}</div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[68%] shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                      </div>
                      <div className="text-xs text-white/40 mt-2 font-medium">{betData.yesPercent}% dominance</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 relative overflow-hidden group/stat">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-black text-red-400 uppercase tracking-wider">NO POOL</div>
                        <TrendingDown className="w-4 h-4 text-red-500/50" />
                      </div>
                      <div className="text-2xl font-black text-white mb-1">${betData.noPool.toLocaleString()}</div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[32%] shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                      </div>
                      <div className="text-xs text-white/40 mt-2 font-medium">{betData.noPercent}% dominance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules / Info */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-white/5 text-white/60">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Resolution Criteria</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  If the price of PUMP is strictly greater than <span className="text-white font-mono">$0.005</span> at the end of the 10-minute window, <span className="text-green-400 font-bold">YES</span> wins. 
                  Otherwise, <span className="text-red-400 font-bold">NO</span> wins. Platform fees are 5%.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Betting Interface */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                {isResolved ? (
                  <FastBetResolution 
                    outcome="yes" 
                    question={betData.question} 
                    userSide={selectedSide || undefined}
                    userAmount={parseFloat(amount) || 0}
                    payout={parseFloat(amount) * 1.8} // Mock payout
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
                  >
                    {/* Background Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Place Your Bet
                    </h2>
                    
                    {/* Side Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <button
                        onClick={() => setSelectedSide("yes")}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden group",
                          selectedSide === "yes" 
                            ? "bg-green-500/10 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]" 
                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", selectedSide === "yes" ? "bg-green-500/10" : "bg-white/5")} />
                        <TrendingUp className={cn("w-8 h-8 relative z-10 transition-colors", selectedSide === "yes" ? "text-green-500" : "text-white/20")} />
                        <div className="relative z-10 text-center">
                          <div className={cn("font-black text-lg tracking-wider", selectedSide === "yes" ? "text-green-400" : "text-white/40")}>YES</div>
                          <div className="text-xs font-medium text-white/40 mt-1">Multiplier 1.85x</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedSide("no")}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden group",
                          selectedSide === "no" 
                            ? "bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", selectedSide === "no" ? "bg-red-500/10" : "bg-white/5")} />
                        <TrendingDown className={cn("w-8 h-8 relative z-10 transition-colors", selectedSide === "no" ? "text-red-500" : "text-white/20")} />
                        <div className="relative z-10 text-center">
                          <div className={cn("font-black text-lg tracking-wider", selectedSide === "no" ? "text-red-400" : "text-white/40")}>NO</div>
                          <div className="text-xs font-medium text-white/40 mt-1">Multiplier 2.10x</div>
                        </div>
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-wider">
                        <span>Wager Amount</span>
                        <div className="flex items-center gap-1 text-white/60">
                          <Wallet className="w-3 h-3" />
                          <span>Bal: 12.5 SOL</span>
                        </div>
                      </div>
                      <div className="relative group">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-mono text-xl font-bold focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/10"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/20 pointer-events-none">SOL</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[0.1, 0.5, 1, 5].map((val) => (
                          <button 
                            key={val}
                            onClick={() => setAmount(val.toString())}
                            className="py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold text-white/60 hover:text-white transition-all"
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setIsResolved(true)} // Demo: Go straight to resolution
                      disabled={!selectedSide || !amount}
                      className={cn(
                        "w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 shadow-lg relative overflow-hidden group",
                        selectedSide === "yes" ? "bg-green-500 hover:bg-green-400 text-black shadow-green-500/20" :
                        selectedSide === "no" ? "bg-red-500 hover:bg-red-400 text-black shadow-red-500/20" :
                        "bg-white/10 text-white/20 cursor-not-allowed"
                      )}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Place Bet
                        {selectedSide && <ArrowLeft className="w-5 h-5 rotate-180" />}
                      </span>
                      {selectedSide && (
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      )}
                    </button>
                    
                    <p className="text-center text-[10px] text-white/20 mt-4 font-medium">
                      By placing a bet, you agree to the Terms of Service.
                    </p>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
