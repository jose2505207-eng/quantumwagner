"use client";

import React, { useEffect, useState } from "react";
import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import Methods from "../contract_methods/methods";
import PositionCard from "@/components/positions/PositionCard";
import { PublicKey } from "@solana/web3.js";

export default function Portfolio() {
  const { withdrawWinnings } = Methods();
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active");
  const [withdrawingMap] = useState<Record<string, boolean>>({});

  // Load positions on mount
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Not authorized!");

      const res = await axios.get(`${BACKEND_URL}/api/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPositions(res.data.data.positions || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      toast.error("Failed to load positions");
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
      toast.error(`Withdraw failed: ${err}`);
    }
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
        <h3 className="text-bold mb-4">Positions</h3>

        <Tabs defaultValue="active" onValueChange={setTab}>
          <TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg mb-8">
            <TabsTrigger value="active" className="px-6 py-2">
              Active
            </TabsTrigger>
            <TabsTrigger value="expired" className="px-6 py-2">
              Expired
            </TabsTrigger>
          </TabsList>

          {/* Active Positions */}
          <TabsContent value="active">
            {loading ? (
              <p>Loading...</p>
            ) : activePositions.length === 0 ? (
              <p className="text-gray-400">No active positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {activePositions.map((p) => (
                  <PositionCard
                    key={p.id}
                    position={p}
                    withdrawing={!!withdrawingMap[p.id]}
                    handleWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expired Positions */}
          <TabsContent value="expired">
            {loading ? (
              <p>Loading...</p>
            ) : expiredPositions.length === 0 ? (
              <p className="text-gray-400">No expired positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {expiredPositions.map((p) => (
                  <PositionCard
                    key={p.id}
                    position={p}
                    withdrawing={!!withdrawingMap[p.id]}
                    handleWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
