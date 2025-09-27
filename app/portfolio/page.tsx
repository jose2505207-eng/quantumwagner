"use client";
import React, { useEffect, useState } from "react";

import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import CountdownTimer from "../hooks/CountdownTimer";
import { DollarSign, RefreshCw, Wallet } from "lucide-react";
import { useUserStore } from "@/store/userInfo";
import { BACKEND_URL } from "@/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Portfolio() {
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(true);
  const { userInfo } = useUserStore();
  const { connected, publicKey, signMessage } = useWallet();

  useEffect(() => {
    if (!userInfo) {
      setPositions([]);
      return;
    }
    loadPositions();
  }, [userInfo]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log(userInfo?.user);

      const res = await axios.get(
        `${BACKEND_URL}/api/users/${userInfo?.user.id}/positions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data.data.positions[0]);

      setPositions(res.data.data.positions || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen  text-white px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-md">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-purple-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Connect Your Wallet
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-base">
            To view your portfolio and track your active positions, please
            connect your wallet securely.
          </p>

          {/* Wallet Connect Button */}
          <WalletMultiButton className="px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-purple-500/30 transition" />
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>

          {/* Loading text */}
          <p className="text-gray-400 animate-pulse">
            Loading your portfolio...
          </p>

          {/* Subtle skeleton shimmer */}
          <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden relative">
            <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      {/* Portfolio Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          {/* Left: Title + description */}
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              Your Portfolio
            </h1>
            <p className="text-gray-400">
              Track all your positions, analyze gains and losses, and view your
              trading performance
            </p>
          </div>

          {/* Right: Refresh Button */}
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Refresh portfolio"
          >
            <RefreshCw
              className={`w-6 h-6 ${
                loading ? "animate-spin text-purple-400" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active Positions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Active Positions</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Your active positions and predictions with unrealized gains/losses
        </p>

        {/* Positions Grid */}

        {loading ? (
          // Loading spinner
          <div className="flex flex-col justify-center items-center py-20 space-y-8 w-full">
            {/* Spinner */}
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-purple-500"></div>

            {/* Text */}
            <p className="text-gray-300 text-lg font-medium tracking-wide">
              Loading your positions...
            </p>

            {/* Skeleton cards with shimmer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-800 rounded-xl p-6 bg-gray-900/60 relative overflow-hidden"
                >
                  {/* Shimmer Overlay */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  <div className="h-5 w-3/4 bg-gray-800 rounded mb-4"></div>
                  <div className="h-4 w-1/2 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 w-1/3 bg-gray-800 rounded mb-6"></div>
                  <div className="h-10 w-28 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : positions.filter((pos) => !pos.settled).length === 0 ? (
          // Empty state
          <div className="text-center text-gray-400 py-10">
            No active positions found.
          </div>
        ) : (
          // Active Positions Grid

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {positions.map((position, index) => (
              <div
                key={position.id || index}
                className="border border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col justify-between"
              >
                {/* Market Question */}
                <h4 className="text-white font-medium mb-3 text-sm sm:text-base leading-snug">
                  {position.market?.question ?? "Unknown market"}
                </h4>

                {/* Market Category */}
                <div className="mb-2 text-xs text-gray-400">
                  Category:{" "}
                  <span className="uppercase text-purple-400">
                    {position.market?.category}
                  </span>
                </div>

                {/* Amount Staked */}
                <div className="mb-2 text-sm">
                  <span className="text-gray-400">Amount Staked: </span>
                  <span className="text-white font-semibold">
                    ${position.amount_staked}
                  </span>
                </div>

                {/* Settled or Not */}
                <div className="mb-2 text-sm">
                  <span className="text-gray-400">Settled: </span>
                  <span
                    className={`font-semibold ${
                      position.settled ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {position.settled ? "Yes" : "No"}
                  </span>
                </div>

                {/* Created At */}
                <div className="mb-2 text-sm">
                  <span className="text-gray-400">Created: </span>
                  <span className="text-white">
                    {new Date(position.created_at).toLocaleString()}
                  </span>
                </div>

                {/* End Time */}

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>Market ends in:</span>
                  <span className="font-semibold text-white">
                    <CountdownTimer endTime={position.market.end_time} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
