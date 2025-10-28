"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
// import { useProgram } from "@/lib/useProgram";
import { BACKEND_URL } from "@/config";
import Methods from "@/app/contract_methods/methods";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";

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
  const [market, setMarket] = useState<Market | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBet, setHasBet] = useState(false);
  // const program = useProgram();
  const [betting, setBetting] = useState(false);
  const [solBal, setSolBal] = useState<number>(0);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);
  const [amount, setAmount] = useState("");
  const [betResult, setBetResult] = useState<any | null>(null);
  const {
    // initProgram,
    placeBet,
    // initMarket,
    // cancelMarket,
    // settleMarket,
    // withdrawWinnings,
  } = Methods();

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
        toast.error("Sol balnce is low");
        return;
      }

      if (!market.pda) {
        window.location.reload();
      }

      const tx = await placeBet(
        new PublicKey(`${market.pda}`),
        userLamports,
        selected === "yes"
      );

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unaouthorized");
        return;
      }

      const res = await axios.post(
        `${BACKEND_URL}/api/positions/add`,
        {
          market_id: market.id,
          position_type: selected.toUpperCase(),
          amount_staked: Number(amount) * LAMPORTS_PER_SOL,
          stake_tx_hash: tx,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Position added:", res.data);
      setBetResult(res.data.data);
      setHasBet(true);
      setSelected(null);
      setAmount("");
    } catch (err) {
      toast.error(`${err}`);
    } finally {
      setBetting(false);
    }

    // settleMarket(
    //   new PublicKey("5KZeFdhGbVzHCYrmcgo4fwTBxfzknyQsMdupoK3QJJPX"),
    //   false
    // );

    // initProgram();

    // withdrawWinnings(
    //   new PublicKey("HZAkVKFzwbkQuzvEA65xL9e2HostX7VwH2upoFcdkLdN")
    // );
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
      <div className="min-h-screen flex items-center justify-center  text-white">
        <p>Loading market...</p>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center  text-white">
        <p>Market not found</p>
      </div>
    );
  }

  function lamportsToSol(val) {
    return val ? Number(val) / LAMPORTS_PER_SOL : 0;
  }
  // calculate odds
  const yesPool = lamportsToSol(market?.yes_pool);
  const noPool = lamportsToSol(market?.no_pool);

  let yesPct = 0;
  let noPct = 0;
  let noBets = false;

  if (yesPool === 0 && noPool === 0) {
    noBets = true;
  } else {
    const totalPool = yesPool + noPool;
    yesPct = (yesPool / totalPool) * 100;
    noPct = 100 - yesPct;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white px-6 py-10 pt-24">
      {/* background gradient blobs */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-purple-700/30 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-fuchsia-600/20 blur-[140px]" />

      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="px-2 py-1 rounded-full bg-purple-900/40 text-purple-300">
              {market.category}
            </span>
            <span>
              {new Date(market.end_time).toLocaleDateString()} deadline
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            {market.question}
          </h1>
          {/* todo get current price of solan show that on ui  */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <span className="text-green-400 text-lg font-semibold">
              Sol {Number(market.total_volume) / LAMPORTS_PER_SOL} Volume
            </span>
            <span className="text-blue-400 text-lg font-semibold">
              {summary?.total_positions ?? 0} Traders
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard
                  .writeText(url)
                  .then(() => toast.success(`Market copied to clipboard!`))
                  .catch(() => toast.error(`Failed to copy URL`));
              }}
              variant="outline"
              className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 "
            >
              Share Market
            </Button>

            <Button
              asChild
              variant="outline"
              className="bg-gray-900/50 border-gray-700 hover:bg-gray-800"
            >
              <a
                href={`https://explorer.solana.com/address/${market.pda}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </Button>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Odds */}
          <Card className="bg-gray-900/50 border-gray-800 col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Current Odds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelected("yes")}
                  className={cn(
                    "cursor-pointer rounded-lg p-6 text-center transition",
                    selected === "yes"
                      ? "bg-green-700/30 border border-green-500"
                      : "bg-gray-800/60 hover:bg-gray-800"
                  )}
                >
                  <p className="text-3xl font-bold text-green-400">
                    {yesPct.toFixed(2)}%
                  </p>
                  <p className="text-green-200">YES</p>
                </div>
                <div
                  onClick={() => setSelected("no")}
                  className={cn(
                    "cursor-pointer rounded-lg p-6 text-center transition",
                    selected === "no"
                      ? "bg-red-700/30 border border-red-500"
                      : "bg-gray-800/60 hover:bg-gray-800"
                  )}
                >
                  <p className="text-3xl font-bold text-red-400">
                    {noPct.toFixed(2)}%
                  </p>
                  <p className="text-red-200">NO</p>
                </div>
              </div>

              {/* Progress bar */}

              <div className="mt-6">
                <div className="w-full bg-gray-800 rounded-full h-3 flex overflow-hidden">
                  {/* YES bar */}
                  <div
                    className="bg-green-500 h-3 transition-all duration-700 ease-in-out"
                    style={{ width: `${yesPct.toFixed(2)}%` }}
                  />
                  {/* NO bar */}
                  <div
                    className="bg-red-500 h-3 transition-all duration-700 ease-in-out"
                    style={{ width: `${noPct.toFixed(2)}%` }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-400 font-medium">
                    YES {yesPct.toFixed(2)}%
                  </span>
                  <span className="text-red-400 font-medium">
                    NO {noPct.toFixed(2)}%
                  </span>
                </div>

                <p className="mt-2 text-gray-400 text-xs">
                  Trending toward{" "}
                  <span className="font-semibold text-white">
                    {yesPct >= 50 ? "YES" : "NO"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Place Bet */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Place Bet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className={cn(
                    "flex-1",
                    selected === "yes"
                      ? "bg-green-600 hover:bg-green-700 text-green-200"
                      : "bg-gray-800 hover:bg-gray-700"
                  )}
                  onClick={() => setSelected("yes")}
                >
                  YES {yesPct.toFixed(2)}%
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    selected === "no"
                      ? "bg-red-600 hover:bg-red-700 text-red-300"
                      : "bg-gray-800 hover:bg-gray-700"
                  )}
                  onClick={() => setSelected("no")}
                >
                  NO {noPct.toFixed(2)}%
                </Button>
              </div>

              {/* Input */}
              <Input
                type="number"
                placeholder="0.00 SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white w-full 
                 [appearance:textfield] 
                 [&::-webkit-outer-spin-button]:appearance-none 
                 [&::-webkit-inner-spin-button]:appearance-none"
              />

              <div>
                {publicKey ? (
                  <p className="text-green-400">
                    Balance: {solBal !== null ? `${solBal} SOL` : "Loading..."}
                  </p>
                ) : (
                  <p className="text-yellow-300">
                    Connect your wallet to see balance
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-3">
                {[0.1, 0.25, , 0.5, 0.75, 1].map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
                    onClick={() => setAmount(String(val))}
                  >
                    {val} SOL
                  </Button>
                ))}
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleBet}
                disabled={
                  !selected || !amount || Number(amount) <= 0 || betting
                }
              >
                {betting
                  ? "Placing Bet..."
                  : hasBet
                  ? "Bet Placed"
                  : "Place Bet"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Positions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-blue-400">
                {Number(market.total_volume) / LAMPORTS_PER_SOL} Sol
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">Total Traders</p>
              <p className="text-2xl font-bold text-purple-400">
                {summary?.total_positions ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
