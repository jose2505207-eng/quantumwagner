"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { explorerTx } from "@/lib/solana";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import Methods from "@/app/utils/methods";
import { cn } from "@/app/utils/utils";
import { Background } from "@/components/background";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Info, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Share2,
  ExternalLink,
  Activity
} from "lucide-react";
import Link from "next/link";
import { PriceHistoryGraph } from "@/components/market/PriceHistoryGraph";


export interface MarketResponse {
  success: boolean;
  data: {
    market: Market;
    summary: Summary;
  };
}
export interface Market {
  id: string;
  question: string;
  description: string;
  category: string;
  market_type: "BINARY" | string;
  creator_id: string;
  oracle_source: string;
  oracle_config: string;
  resolution_criteria: string;
  created_at: string;
  end_time: string;
  resolution_time: string | null;
  status: "ACTIVE" | "RESOLVED" | "CANCELLED" | string;
  outcome: string | null;
  total_volume: string;
  yes_pool: string;
  no_pool: string;
  fee_percentage: string;
  tags: string[];
  image_url: string | null;
  featured: boolean;
  contract_address: string | null;
  program_id: string | null;
  pda: string | null;

  creator: {
    id: string;
    username: string | null;
    wallet_address: string;
    is_verified: boolean;
    reputation_score: number;
  };
  positions: [];
  _count: {
    positions: number;
    transactions: number;
  };
}

export interface Summary {
  total_positions: number;
  total_transactions: number;
  total_volume: number;
  yes_percentage: number;
  no_percentage: number;
  days_remaining: number;
}

export default function MarketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [market, setMarket] = useState<Market | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBet, setHasBet] = useState(false);
  const [betting, setBetting] = useState(false);
  const [solBal, setSolBal] = useState<number>(0);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [selected, setSelected] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const { placeBet, withdrawWinnings } = Methods();
  const [claiming, setClaiming] = useState(false);

  /** Claim a settled market's winnings. The program decides the amount. */
  const handleClaim = async () => {
    if (claiming || !market?.pda) return;
    setClaiming(true);
    try {
      await withdrawWinnings(new PublicKey(market.pda));
    } catch (err) {
      const message = err instanceof Error ? err.message : `${err}`;
      // "AlreadyClaimed"/"nothing to claim" are normal outcomes, not crashes.
      toast.error(
        /alreadyclaimed/i.test(message)
          ? "Already claimed."
          : `Claim failed: ${message}`
      );
    } finally {
      setClaiming(false);
    }
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBet = async () => {
    if (betting) return;
    setBetting(true);

    try {
      if (!market || !selected) {
        toast.error("Please select YES or NO");
        return;
      }

      const userLamports = Math.floor(Number(amount) * LAMPORTS_PER_SOL);

      if (userLamports > solBal * LAMPORTS_PER_SOL) {
        toast.error("Sol balance is low");
        return;
      }

      // Demo/seed markets have no real on-chain account — be honest: no fake bet.
      if (
        market.id.startsWith("mock") ||
        market.id.startsWith("demo") ||
        !market.pda ||
        market.pda.startsWith("mock") ||
        market.pda.startsWith("demo")
      ) {
        toast.error(
          "This is a demo market — live Devnet betting is disabled here. Open a real market to place an on-chain bet."
        );
        return;
      }

      // Real Devnet transaction via the Anchor program (wallet signs). placeBet
      // records the bet with the backend itself (de-duplicated on the tx
      // signature) — posting it a second time from here used to create two
      // predictions, double XP, and pools mixing lamports with SOL.
      const { signature: tx, recordError } = await placeBet(
        new PublicKey(`${market.pda}`),
        userLamports,
        selected === "yes"
      );

      setHasBet(true);
      setAmount("");

      if (recordError) {
        // The stake is on-chain regardless — say exactly that, don't pretend.
        toast.error(
          `Bet is on-chain but wasn't recorded (${recordError}). Your portfolio may lag until it syncs.`,
          { duration: 8000 }
        );
      }
      // Surface the real Devnet signature with a Solana Explorer link.
      toast.custom(
        (t) => (
          <div
            className={`flex items-center gap-2 rounded-lg border border-green-500/30 bg-[#0d0f16] px-4 py-3 text-sm text-white ${
              t.visible ? "" : "opacity-0"
            }`}
          >
            <span>Bet confirmed on Devnet</span>
            <a
              href={explorerTx(tx)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-green-400 underline"
            >
              View on Explorer ↗
            </a>
          </div>
        ),
        { duration: 7000 }
      );
    } catch (err) {
      toast.error(`${err}`);
    } finally {
      setBetting(false);
    }
  };

  useEffect(() => {
    async function fetchSolBal() {
      if (publicKey) {
        const lamports = await connection.getBalance(publicKey);
        setSolBal(lamports / 1e9);
      }
    }
    fetchSolBal();
  }, [publicKey, connection, hasBet]);

  useEffect(() => {
    async function getMarket() {
      try {
        const res = await axios.get<MarketResponse>(
          `${BACKEND_URL}/api/markets/${id}`
        );
        setMarket(res.data.data.market);
        setSummary(res.data.data.summary);
      } catch (err) {
        console.error("Failed to fetch market", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) getMarket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Market not found</h2>
          <Button onClick={() => router.push('/markets')} variant="outline">
            Return to Markets
          </Button>
        </div>
      </div>
    );
  }

  // The backend stores and returns pools in SOL (see server/markets.ts). These
  // used to be divided by LAMPORTS_PER_SOL again, which rendered every real
  // amount as 0.000 SOL.
  const toSol = (val: unknown) => (val ? Number(val) : 0);

  // calculate odds
  const yesPool = toSol(market?.yes_pool);
  const noPool = toSol(market?.no_pool);

  let yesPct = 0;
  let noPct = 0;

  if (yesPool === 0 && noPool === 0) {
    // Default to 50/50 if empty
    yesPct = 50;
    noPct = 50;
  } else {
    const totalPool = yesPool + noPool;
    yesPct = (yesPool / totalPool) * 100;
    noPct = 100 - yesPct;
  }

  const isMock = market.id.startsWith("mock");

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Breadcrumb / Back */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground transition-colors group"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Markets
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Market Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-8 space-y-8"
          >
            
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {isMock && (
                  <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10 backdrop-blur-sm">
                    Demo Market
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 backdrop-blur-sm">
                  {market.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground bg-secondary/30 border border-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Clock className="w-3 h-3 mr-2" />
                  Ends {new Date(market.end_time).toLocaleDateString()}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                {market.question}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-3 bg-white/5 rounded-full pr-4 pl-1 py-1 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${market.creator?.username || market.creator?.wallet_address || market.id}`}
                      alt="Creator"
                      className="w-5 h-5 opacity-80"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Created by</span>
                    <span className="text-xs font-bold text-white">
                      {market.creator?.username || "Anonymous"}
                    </span>
                  </div>
                </div>
                
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Volume</span>
                  <span className="text-lg font-bold text-green-400 flex items-center gap-1">
                    {toSol(market.total_volume).toFixed(3)} <span className="text-xs font-normal text-green-400/70">SOL</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Probability Bar / Price History */}
            <PriceHistoryGraph
              currentProbability={yesPct}
              marketId={market.id}
              color={yesPct >= 50 ? "#10B981" : "#EF4444"}
            />

            {/* Market Details Tabs */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="bg-black/40 border border-white/10 p-1 w-full sm:w-auto backdrop-blur-md rounded-lg">
                <TabsTrigger value="info" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground flex-1 sm:flex-none">
                  Market Info
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground flex-1 sm:flex-none">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground flex-1 sm:flex-none">
                  Comments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-6 space-y-6">
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-white/90">
                        <Info className="w-4 h-4 text-primary" />
                        Description
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {market.description || "No description provided."}
                      </p>
                    </div>

                    <Separator className="bg-white/5" />

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-white/90">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Resolution Criteria
                      </h3>
                      <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                        <p className="text-gray-300 text-sm">
                          {market.resolution_criteria}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="w-3 h-3" />
                          <span>Resolves via <span className="text-white font-medium">{market.oracle_source}</span> oracle</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm min-h-[200px] flex items-center justify-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Activity className="w-10 h-10 mb-3 opacity-20" />
                    <p>No recent activity to show</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm min-h-[200px] flex items-center justify-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <p>Comments are disabled for this market.</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Right Column: Betting Interface */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-24 space-y-6">
              <Card className="bg-[#0A0A0A]/80 border-white/10 shadow-2xl shadow-primary/5 overflow-hidden backdrop-blur-xl ring-1 ring-white/5 p-0 gap-0">
                <CardHeader className="bg-white/5 border-b border-white/5 pb-4 pt-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">Place Order</span>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                      <Wallet className="w-3 h-3" />
                      {mounted && publicKey ? <span className="text-white">{solBal.toFixed(4)} SOL</span> : "Not Connected"}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Resolved / cancelled: the money is claimed ON-CHAIN by the
                      winner. Without this, a settled market had no way to get
                      paid from this screen at all. */}
                  {market.status !== "ACTIVE" && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-3">
                      <p className="text-sm font-semibold text-white">
                        {market.status === "CANCELLED"
                          ? "This market was cancelled — stakes are refundable on-chain."
                          : `Resolved: ${market.outcome ?? "—"} won.`}
                      </p>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-500"
                        disabled={claiming || !market.pda}
                        onClick={handleClaim}
                      >
                        {claiming ? "Claiming on Devnet…" : "Claim winnings"}
                      </Button>
                      <p className="text-[10px] text-white/50">
                        Eligibility and the payout amount are enforced by the on-chain
                        program — this sends the withdrawal from your wallet. Claiming
                        with nothing to claim simply fails, it costs no stake.
                      </p>
                    </div>
                  )}

                  {/* Buy Yes/No Toggle */}
                  <div className="grid grid-cols-2 gap-3 p-1 bg-black/40 rounded-xl border border-white/5">
                    <button
                      onClick={() => setSelected("yes")}
                      className={cn(
                        "py-4 rounded-lg font-bold text-sm transition-all duration-300 flex flex-col items-center gap-1 relative overflow-hidden group",
                        selected === "yes"
                          ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/50"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                    >
                      {selected === "yes" && (
                        <motion.span 
                          layoutId="active-tab"
                          className="absolute inset-0 bg-green-500/10" 
                        />
                      )}
                      <span className="relative z-10">Buy YES</span>
                      <span className="relative z-10 text-xs opacity-80 font-normal">Price: {yesPct.toFixed(0)}¢</span>
                    </button>
                    <button
                      onClick={() => setSelected("no")}
                      className={cn(
                        "py-4 rounded-lg font-bold text-sm transition-all duration-300 flex flex-col items-center gap-1 relative overflow-hidden group",
                        selected === "no"
                          ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/50"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                    >
                      {selected === "no" && (
                        <motion.span 
                          layoutId="active-tab"
                          className="absolute inset-0 bg-red-500/10" 
                        />
                      )}
                      <span className="relative z-10">Buy NO</span>
                      <span className="relative z-10 text-xs opacity-80 font-normal">Price: {noPct.toFixed(0)}¢</span>
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs uppercase tracking-wider font-medium">
                      <span className="text-muted-foreground">Amount (SOL)</span>
                      <span className="text-muted-foreground">
                        Est. Return: <span className="text-white font-bold">
                          {amount ? (Number(amount) * (100 / (selected === 'yes' ? yesPct : noPct))).toFixed(3) : "0.00"} SOL
                        </span>
                      </span>
                    </div>
                    <div className="relative group">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-black/40 border-white/10 text-lg h-14 pl-4 pr-16 focus:ring-primary/50 focus:border-primary/50 transition-all group-hover:border-white/20"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-white/5 px-2 py-1 rounded">
                        SOL
                      </div>
                    </div>
                    
                    {/* Quick Select */}
                    <div className="grid grid-cols-4 gap-2">
                      {[0.1, 0.5, 1, 2].map((val) => (
                        <button
                          key={val}
                          onClick={() => setAmount(val.toString())}
                          className="px-2 py-2 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/5"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={cn(
                      "w-full h-14 text-lg font-bold shadow-lg transition-all duration-300 relative overflow-hidden",
                      selected === "yes" 
                        ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-500/20" 
                        : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20"
                    )}
                    onClick={handleBet}
                    disabled={
                      !selected ||
                      !amount ||
                      Number(amount) <= 0 ||
                      betting ||
                      market.status !== "ACTIVE"
                    }
                  >
                    {betting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : hasBet ? (
                      "Order Placed!"
                    ) : (
                      `Place ${selected.toUpperCase()} Order`
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground/60">
                    By trading, you agree to the Terms of Service.
                  </p>
                </CardContent>
              </Card>

              {/* Share / External Links */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:border-white/20 transition-all h-12" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:border-white/20 transition-all h-12" asChild>
                  <a href={`https://explorer.solana.com/address/${market.pda}?cluster=devnet`} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Explorer
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
