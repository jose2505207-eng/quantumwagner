"use client";

import React, { useEffect, useState } from "react";
import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import CountdownTimer from "../hooks/CountdownTimer";
import { DollarSign, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/userInfo";
import { BACKEND_URL } from "@/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import clsx from "clsx";
import Methods from "../contract_methods/methods";
import toast from "react-hot-toast";

export default function Portfolio() {
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(true);
  const { userInfo } = useUserStore();
  const { connected } = useWallet();
  const [tab, setTab] = useState("active");
  const [withdrawingMap, setWithdrawingMap] = useState<Record<string, boolean>>(
    {}
  );

  const { withdrawWinnings } = Methods();

  useEffect(() => {
    if (!userInfo) {
      setPositions([]);
      setLoading(false);
      return;
    }
    loadPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BACKEND_URL}/api/users/${userInfo?.user.id}/positions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPositions(res.data.data.positions || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (marketPda: string) => {
    try {
      await withdrawWinnings(new PublicKey(marketPda));
      toast.success("Bet withdrawn");
      await loadPositions();
    } catch (err) {
      toast.error(`Withdraw failed ${err}`);
    }
  };

  // Helper to render a position card
  const renderPosition = (position) => {
    const ended = new Date(position.market.end_time).getTime() < Date.now();
    const withdrawing = !!withdrawingMap[position.id];

    return (
      <Card
        key={position.id}
        className="p-3 sm:p-4 bg-gradient-to-b from-gray-900/60 to-gray-900/40 border border-gray-800 rounded-lg"
      >
        <CardHeader className="p-0 mb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-white truncate">
                {position.market?.question ?? "Unknown market"}
              </h3>
              <div className="text-xs text-gray-400 mt-1">
                Category:{" "}
                <span className="uppercase text-purple-400">
                  {position.market?.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={clsx(
                  "text-sm font-semibold",
                  position.settled ? "text-green-400" : "text-yellow-400"
                )}
              >
                {position.settled ? "Settled" : "Active"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(position.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">Amount Staked</div>
              <div className="text-white font-semibold mt-1">
                {(position.amount_staked / LAMPORTS_PER_SOL).toFixed(4)} SOL
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Position</div>
              <div className="mt-1">
                <span
                  className={clsx(
                    "inline-block px-2 py-1 text-xs rounded-full font-medium",
                    position.position_type === "YES"
                      ? "bg-emerald-800 text-emerald-300"
                      : "bg-red-900 text-red-300"
                  )}
                >
                  {position.position_type ?? "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <span>Market ends in</span>
                <span className="font-semibold text-white">
                  <CountdownTimer endTime={position.market.end_time} />
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Traders</div>
                <div className="text-sm font-medium text-white">
                  {position.market._count?.positions ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-4">
              {ended ? (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleWithdraw(position.market.pda)}
                    className="flex-1"
                    disabled={withdrawing}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Withdrawing...
                      </>
                    ) : (
                      "Withdraw Bet"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/60 border border-gray-800 rounded-full text-sm text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span>Waiting for market to settle</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const activePositions = positions.filter(
    (p) => new Date(p.market.end_time).getTime() >= Date.now()
  );
  const expiredPositions = positions.filter(
    (p) => new Date(p.market.end_time).getTime() < Date.now()
  );

  return (
    <div className="min-h-screen p-6 pt-24 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Portfolio</h1>
            <p className="text-sm text-gray-400">
              Track active and expired positions, manage withdrawals.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" onValueChange={setTab}>
          <TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg mb-8">
            <TabsTrigger value="active" className="px-6 py-2">
              Active
            </TabsTrigger>
            <TabsTrigger value="expired" className="px-6 py-2">
              Expired
            </TabsTrigger>
          </TabsList>

          {/* Active tab */}
          <TabsContent value="active">
            {loading ? (
              <p>Loading...</p>
            ) : activePositions.length === 0 ? (
              <p className="text-gray-400">No active positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activePositions.map(renderPosition)}
              </div>
            )}
          </TabsContent>

          {/* Expired tab */}
          <TabsContent value="expired">
            {loading ? (
              <p>Loading...</p>
            ) : expiredPositions.length === 0 ? (
              <p className="text-gray-400">No expired positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {expiredPositions.map(renderPosition)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
