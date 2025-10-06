"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useProgram } from "@/lib/useProgram";
// import * as anchor from "@coral-xyz/anchor";


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
  // const program = useProgram();
  const { id } = useParams();
  const [market, setMarket] = useState<Market | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<"yes" | "no" | null>(null);
  const [amount, setAmount] = useState("");

  const handleBet = async () => {

    // const programId = new anchor.web3.PublicKey("9yKS9pupjKxLU8Ao5Y1BTN8i8x97XybNPEbsFhSn9QZw");

    // const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    //   [Buffer.from("config")],
    //   programId
    // );

    // await program?.methods.

  };

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

  // calculate odds
  const yesPool = Number(market.yes_pool || 0);
  const noPool = Number(market.no_pool || 0);
  const totalPool = yesPool + noPool || 1;
  const yesOdds = Math.round((yesPool / totalPool) * 100);
  const noOdds = 100 - yesOdds;

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
        <span>{new Date(market.end_time).toLocaleDateString()} deadline</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
        {market.question}
      </h1>

      <div className="flex flex-wrap items-center gap-6 text-gray-300">
        <span className="text-green-400 text-lg font-semibold">
          ${market.total_volume} Volume
        </span>
        <span className="text-blue-400 text-lg font-semibold">
          {summary?.total_positions ?? 0} Traders
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="bg-gray-900/50 border-gray-700 hover:bg-gray-800"
        >
          Resolution Criteria
        </Button>
        <Button
          variant="outline"
          className="bg-gray-900/50 border-gray-700 hover:bg-gray-800"
        >
          Share Market
        </Button>
        <Button
          variant="outline"
          className="bg-gray-900/50 border-gray-700 hover:bg-gray-800"
        >
          View on Explorer
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
              <p className="text-3xl font-bold text-green-400">{yesOdds}%</p>
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
              <p className="text-3xl font-bold text-red-400">{noOdds}%</p>
              <p className="text-red-200">NO</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-3"
              style={{ width: `${yesOdds}%` }}
            />
          </div>
          <p className="mt-2 text-green-400 text-sm">
            Trending toward {yesOdds >= 50 ? "YES" : "NO"}
          </p>
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
              YES {yesOdds}%
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
              NO {noOdds}%
            </Button>
          </div>

          {/* Input */}
          <Input
            type="number"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white w-full 
             [appearance:textfield] 
             [&::-webkit-outer-spin-button]:appearance-none 
             [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-3">
            {[10, 50, 100, 250].map((val) => (
              <Button
                key={val}
                variant="outline"
                className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
                onClick={() => setAmount(String(val))}
              >
                ${val}
              </Button>
            ))}
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleBet}
          >
            Place Bet
          </Button>
        </CardContent>
      </Card>
    </div>

    {/* Stats and Positions */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Total Volume</p>
          <p className="text-2xl font-bold text-blue-400">${market.total_volume}</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Unique Traders</p>
          <p className="text-2xl font-bold text-purple-400">
            {summary?.total_positions ?? 0}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Oracle Source</p>
          <p className="text-md font-semibold text-green-400">{market.oracle_source}</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Your Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-green-400">YES</span>
            <span>$0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-400">NO</span>
            <span>$0</span>
          </div>
          <Button
            variant="outline"
            className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            Manage Positions
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
}
