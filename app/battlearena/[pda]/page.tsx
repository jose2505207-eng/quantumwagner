"use client";
import BN from "bn.js";

import { useParams } from "next/navigation";
import { useState } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Share2, Info, Trophy, Users, Clock, 
  Swords, Wallet, Zap, CheckCircle2, Activity, AlertCircle, ChevronDown 
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";

import Methods from "@/app/utils/methods";
import { useAllBattles } from "@/app/utils/useAllBattles";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { Spinner } from "@/components/custom/Spinner";
import { Background } from "@/components/background";
import { cn } from "@/lib/utils";
import { MIN_BATTLE_POOL } from "@/config";

export default function BattlePage() {
  const params = useParams();
  const battleMint = params.pda as string;

  const { enterBattle } = Methods();
  const [entering, setEntering] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>(null);
  const [amount, setAmount] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { battles: allBattles, loading: battleLoading } = useAllBattles();
  const { tokens: allToken, loading: tokenLoading } = useAllTokens();

  if (battleLoading || tokenLoading)
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <Spinner />
      </div>
    );

  const battle = allBattles?.find((b) => b.pda.toString() === battleMint);

  if (!battle)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl">⚔️</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Battle Not Found</h2>
        <p className="text-muted-foreground">
          We couldn&apos;t find a battle with this address.
        </p>
        <Link href="/battlearena" className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-bold">
          Return to Arena
        </Link>
      </div>
    );

  const d = battle.data;

  const getToken = (mint: string) => {
    const mintStr = String(mint);
    return allToken?.find((t) => t.account.tokenMint.toString() === mintStr)?.account;
  };

  const numericAmount = parseFloat(amount) || 0;
  const lamports = Math.floor(numericAmount * LAMPORTS_PER_SOL);
  const lamportsBN = new BN(lamports);
  const minBattlePoolSol = MIN_BATTLE_POOL.toNumber() / LAMPORTS_PER_SOL;
  const invalidAmount = numericAmount <= 0 || lamportsBN.lt(MIN_BATTLE_POOL);

  const handleEnterBattle = async () => {
    if (!selectedSide || invalidAmount) return;
    
    try {
      setEntering(true);
      const sideObj = selectedSide === "A" ? { sideA: {} } : { sideB: {} };

      await enterBattle({
        battlePda: new PublicKey(battleMint),
        side: sideObj,
        amount: lamports,
      });

      toast.success(`Successfully bet on Side ${selectedSide}!`);
      
      // Optimistic update
      if (selectedSide === "A") d.sideAParticipants += 1;
      else d.sideBParticipants += 1;
      
      setAmount("");
      setSelectedSide(null);
      
    } catch (err) {
      console.error(err);
      const msg = String(err);
      if (msg.includes("Battle has ended")) toast.error("Battle has ended");
      else if (msg.includes("Battle has not started yet")) toast.error("Battle has not started yet");
      else toast.error("Failed to enter battle");
    } finally {
      setEntering(false);
    }
  };

  const safe = (v: unknown) => {
    if (v === null || v === undefined) return "0";
    return String(v);
  };

  const formatTime = (unix: unknown) => {
    if (!unix) return "—";
    const date = new Date(Number(unix) * 1000);
    return formatDistanceToNowStrict(date) + (date > new Date() ? " left" : " ago");
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
      <Background />
      
      {/* Ambient Background Image */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <img src={d.imageUrl} className="w-full h-full object-cover blur-3xl scale-110" alt="" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 mt-20 max-w-7xl">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <Link 
            href="/battlearena" 
            className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Back to Arena</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Battle</span>
            </div>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/5">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Visuals & Info */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Main Visual Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl"
            >
              <div className="aspect-video relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
                <img 
                  src={d.imageUrl} 
                  alt={d.title} 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h1 className="text-3xl lg:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg tracking-tight">
                    {d.title}
                  </h1>
                  <p className="text-white/70 text-lg line-clamp-2 max-w-2xl drop-shadow-md font-medium">
                    {d.description}
                  </p>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5 bg-white/[0.02]">
                <div className="p-4 lg:p-6 flex flex-col items-center text-center gap-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Total Pool</span>
                  <span className="text-xl lg:text-2xl font-black text-white font-mono">
                    {(Number(safe(d.totalPool)) / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </span>
                </div>
                <div className="p-4 lg:p-6 flex flex-col items-center text-center gap-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Participants</span>
                  <span className="text-xl lg:text-2xl font-black text-white font-mono">
                    {safe(d.uniqueParticipants)}
                  </span>
                </div>
                <div className="p-4 lg:p-6 flex flex-col items-center text-center gap-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Ends In</span>
                  <span className="text-xl lg:text-2xl font-black text-white font-mono">
                    {formatTime(d.endTime).replace(" left", "")}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Token Matchup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SideCard 
                side="A" 
                name={d.sideAName} 
                participants={d.sideAParticipants} 
                tokens={d.sideATokens} 
                getToken={getToken} 
                isOpen={detailsOpen}
                onToggle={() => setDetailsOpen(!detailsOpen)}
                pool={d.sideAPool}
              />
              <SideCard 
                side="B" 
                name={d.sideBName} 
                participants={d.sideBParticipants} 
                tokens={d.sideBTokens} 
                getToken={getToken} 
                isOpen={detailsOpen}
                onToggle={() => setDetailsOpen(!detailsOpen)}
                pool={d.sideBPool}
              />
            </div>

          </div>

          {/* RIGHT COLUMN: Betting Interface */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              
              {/* Betting Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-[32px] bg-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden relative"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <Swords className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Place Your Bet</h2>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">
                    Min: {minBattlePoolSol} SOL
                  </div>
                </div>

                <div className="p-6 lg:p-8 space-y-8">
                  
                  {/* Side Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedSide("A")}
                      className={cn(
                        "relative group p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                        selectedSide === "A" 
                          ? "bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]" 
                          : "bg-[#111] border-white/5 hover:border-white/10 hover:bg-[#161616]"
                      )}
                    >
                      <div className="absolute top-3 right-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                          selectedSide === "A" ? "bg-blue-500 border-blue-500" : "border-white/10"
                        )}>
                          {selectedSide === "A" && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-blue-400 mb-1">SIDE A</div>
                      <div className="text-lg font-bold text-white leading-tight mb-2">{d.sideAName}</div>
                      <div className="text-[10px] font-mono text-white/40">
                        Pool: {(Number(d.sideAPool) / LAMPORTS_PER_SOL).toFixed(2)} SOL
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedSide("B")}
                      className={cn(
                        "relative group p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                        selectedSide === "B" 
                          ? "bg-rose-500/10 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)]" 
                          : "bg-[#111] border-white/5 hover:border-white/10 hover:bg-[#161616]"
                      )}
                    >
                      <div className="absolute top-3 right-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                          selectedSide === "B" ? "bg-rose-500 border-rose-500" : "border-white/10"
                        )}>
                          {selectedSide === "B" && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-rose-400 mb-1">SIDE B</div>
                      <div className="text-lg font-bold text-white leading-tight mb-2">{d.sideBName}</div>
                      <div className="text-[10px] font-mono text-white/40">
                        Pool: {(Number(d.sideBPool) / LAMPORTS_PER_SOL).toFixed(2)} SOL
                      </div>
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-white/40 font-medium px-1">
                      <span>Amount to Bet</span>
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        <span>Balance: -- SOL</span>
                      </div>
                    </div>
                    
                    <div 
                      className={cn(
                        "bg-[#141414] rounded-2xl p-4 border transition-all duration-200 flex items-center gap-4",
                        isFocused ? "border-white/20 bg-[#1a1a1a]" : "border-white/5 hover:border-white/10"
                      )}
                    >
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-white/10 focus:outline-none font-mono"
                      />
                      <div className="shrink-0 flex items-center gap-2 bg-black rounded-full pl-2 pr-4 py-1.5 border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]" />
                        <span className="font-bold text-white text-sm">SOL</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleEnterBattle}
                    disabled={entering || !selectedSide || invalidAmount}
                    className={cn(
                      "w-full h-[64px] text-lg font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                      selectedSide === "A" ? "bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.4)]" :
                      selectedSide === "B" ? "bg-rose-600 hover:bg-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.4)]" :
                      "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                  >
                    {entering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className={cn("w-5 h-5", selectedSide ? "fill-white" : "fill-current")} />
                        <span>{selectedSide ? `CONFIRM BET ON ${selectedSide}` : "SELECT A SIDE"}</span>
                      </>
                    )}
                  </button>

                </div>
              </motion.div>

              {/* Info Box */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                <AlertCircle className="w-5 h-5 text-white/40 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">How it works</h4>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Winners share the total pool proportional to their contribution. 
                    Funds are held in a secure escrow until the battle is resolved.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

interface SideCardProps {
  side: "A" | "B";
  name: string;
  participants: number;
  tokens: string[];
  getToken: (mint: string) => { imageUri?: string; symbol?: string } | undefined;
  isOpen: boolean;
  onToggle: () => void;
  pool: number | string;
}

function SideCard({ side, name, participants, tokens, getToken, isOpen, onToggle, pool }: SideCardProps) {
  const color = side === "A" ? "blue" : "rose";
  const borderColor = side === "A" ? "border-blue-500/20" : "border-rose-500/20";
  const textColor = side === "A" ? "text-blue-400" : "text-rose-400";
  const bgColor = side === "A" ? "bg-blue-500" : "bg-rose-500";

  return (
    <div className={cn(
      "rounded-3xl bg-[#0A0A0A]/50 border backdrop-blur-sm overflow-hidden transition-all duration-300",
      borderColor,
      isOpen ? "shadow-lg" : ""
    )}>
      <div 
        onClick={onToggle}
        className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-1 h-8 rounded-full", bgColor)} />
          <div>
            <h3 className={cn("text-lg font-bold", textColor)}>{name}</h3>
            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
              <Users className="w-3 h-3" />
              <span>{participants || 0} Participants</span>
            </div>
          </div>
        </div>
        <div className={cn(
          "p-2 rounded-full bg-white/5 transition-transform duration-300",
          isOpen ? "rotate-180" : ""
        )}>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        {tokens.length > 0 ? tokens.map((mint) => {
          const token = getToken(mint);
          const mintStr = String(mint);
          return (
            <div key={mintStr} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              {token?.imageUri ? (
                <img src={token.imageUri} className="w-10 h-10 rounded-full" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10" />
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-white text-sm">{token?.symbol || "Unknown"}</div>
                <div className="text-[10px] text-white/40 font-mono truncate w-full">{mintStr.slice(0, 4)}...{mintStr.slice(-4)}</div>
              </div>
            </div>
          );
        }) : (
          <div className="text-sm text-white/30 italic p-2">No specific tokens linked</div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-white/5">
               <div className="mt-4 flex justify-between items-center p-3 rounded-xl bg-white/5">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Current Pool</span>
                  <span className="font-mono font-bold text-white">
                    {(Number(pool || 0) / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
