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
import { useUserStore } from "@/store/userInfo";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Users,
  XCircle,
} from "lucide-react";

// Spinner loader
const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-gray-500 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
);

export default function Portfolio() {
  const { withdrawWinnings } = Methods();
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active");
  const [withdrawingMap, setWithdrawingMap] = useState<Record<string, boolean>>(
    {}
  );
  const { userInfo } = useUserStore();

  // Load positions
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

  const handleWithdraw = async (marketPda: string, positionId: string) => {
    try {
      setWithdrawingMap((prev) => ({ ...prev, [marketPda]: true }));

      await withdrawWinnings(new PublicKey(marketPda));

      const res = await axios.put(
        `${BACKEND_URL}/api/positions`,
        {
          settled: true,
          settled_at: new Date(),
          position_id: positionId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log(res);

      toast.success("Bet withdrawn");
      await loadPositions();
    } catch (err) {
      const msg = err?.toString() || "";
      if (msg.includes("AlreadyClaimed")) {
        toast.success("Already claimed");
        return;
      }
      toast.error(`Withdraw failed: ${msg}`);
    } finally {
      setWithdrawingMap((prev) => ({ ...prev, [marketPda]: false }));
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
      <div className="max-w-6xl mx-auto space-y-10">
        {/* User Info Card */}
        <div className="flex flex-wrap items-center gap-6 bg-gray-900/70 border border-gray-800 rounded-lg p-5">
          {/* KYC */}
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">
              KYC: {userInfo?.user.kyc_level || "N/A"}
            </span>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">
              Rep: {userInfo?.user.reputation_score ?? 0}
            </span>
          </div>

          {/* Predictions */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">
              Predictions: {userInfo?.user.total_predictions ?? 0}
            </span>
          </div>

          {/* Verification */}
          <div className="flex items-center gap-2">
            {userInfo?.user.is_verified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-500">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-500">Not Verified</span>
              </>
            )}
          </div>
        </div>

        {/* Positions Section */}
        <Tabs defaultValue="active" onValueChange={setTab} className="w-full">
          {/* Header + Tabs */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
            <h3 className="text-xl sm:text-2xl font-semibold w-full sm:w-auto text-left bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
              Positions
            </h3>

            <TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg flex justify-center sm:justify-start w-full sm:w-auto">
              <TabsTrigger
                value="active"
                className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea] 
                data-[state=active]:text-white 
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
                transition"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="expired"
                className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea] 
                data-[state=active]:text-white 
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
                transition"
              >
                Expired
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Active Tab */}
          <TabsContent value="active">
            {loading ? (
              <Spinner />
            ) : activePositions.length === 0 ? (
              <p className="text-center text-gray-400">No active positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activePositions.map((p) => (
                  <PositionCard
                    key={p.id}
                    position={p}
                    withdrawing={!!withdrawingMap[p.market.pda]}
                    handleWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expired Tab */}
          <TabsContent value="expired">
            {loading ? (
              <Spinner />
            ) : expiredPositions.length === 0 ? (
              <p className="text-center text-gray-400">No expired positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {expiredPositions.filter((p) => !p.settled).length === 0 ? (
                  <p className="text-gray-400 text-center">
                    No unsettled positions
                  </p>
                ) : (
                  expiredPositions
                    .filter(
                      (p) => !p.settled && p.position_type !== p.market.outcome
                    )
                    .map((p) => (
                      <PositionCard
                        key={p.id}
                        position={p}
                        withdrawing={!!withdrawingMap[p.market.pda]}
                        handleWithdraw={handleWithdraw}
                      />
                    ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
