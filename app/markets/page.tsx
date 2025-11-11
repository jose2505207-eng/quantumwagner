"use client";
import React, { useEffect, useState } from "react";
import PlateformStats from "@/components/market/PlateformStats";
import { useMarketStore } from "@/store/adminMarketStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import MarketCategories from "@/components/MarketCategories";
import Faq from "@/components/landing/FAQ";
import Link from "next/link";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import CountdownTimer from "../utils/hooks/CountdownTimer";

export default function Markets() {
  const { markets, setMarkets } = useMarketStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BACKEND_URL}/api/markets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMarkets(res.data.data.markets);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white pt-24">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
            Prediction Markets
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Harness the power of collective intelligence. Bet on outcomes, predict
          the future, and earn rewards based on your accuracy and insights.
        </p>
        <p className="text-gray-400 mb-8">
          Join thousands of traders making informed predictions on everything
          from politics to technology, sports to economics.
        </p>
      </div>

      {/* Categories Section */}
      <MarketCategories />

      {/* Popular Markets Section */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-6">
            Browse all active prediction markets that offer the best trading
            opportunities
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-2 py-2 text-white border-b-2 border-purple-500">
              Active Now
            </button>

           
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p>No markets available</p>
            <button
              onClick={() => {
                loadMarkets();
              }}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-20 py-10">
            {markets.map((market, index) => {
              const yesPool = Number(market.yes_pool || 0);
              const noPool = Number(market.no_pool || 0);

              let yesOdds = 0;
              let noOdds = 0;
              let noBets = false;

              if (yesPool === 0 && noPool === 0) {
                noBets = true;
              } else {
                const totalPool = yesPool + noPool;
                yesOdds = Math.round((yesPool / totalPool) * 100);
                noOdds = 100 - yesOdds;
              }

              return (
                <Link
                  key={market.id}
                  href={`/markets/${market.id}`}
                  className="block"
                >
                  <div
                    key={index}
                    className="rounded-2xl p-6 
             shadow-[0_0_15px_rgba(0,0,0,0.7)]
             border border-[#1f1f1f]
             hover:shadow-[0_0_25px_rgba(0,0,0,0.9)]
             transition-all"
                  >
                    {/* Category */}
                    <div className="text-xs font-semibold text-purple-400 uppercase mb-3">
                      {market.category}
                    </div>

                    {/* Question */}
                    <h4 className="text-white font-medium mb-4 text-sm leading-relaxed">
                      {market.question}
                    </h4>

                    {/* YES / NO Stats */}
                    <div className="flex justify-between mb-3">
                      <div className="text-center">
                        <div className="text-emerald-400 text-2xl font-bold">
                          {yesOdds}%
                        </div>
                        <div className="text-gray-400 text-xs">YES</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 text-2xl font-bold">
                          {noOdds}%
                        </div>
                        <div className="text-gray-400 text-xs">NO</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4">
                      <div
                        className="h-1.5 rounded-full bg-emerald-400"
                        style={{ width: `${yesOdds}%` }}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 text-xs text-gray-400 mb-4">
                      <div className="text-center">
                        <div className="text-white font-medium">
                          {Number(market.total_volume) / LAMPORTS_PER_SOL} Sol
                        </div>
                        <div>Volume</div>
                      </div>
                   
                      <div className="text-center">
                        <CountdownTimer endTime={market.end_time} />
                        <div>Left</div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition">
                        Bet YES
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition">
                        Bet NO
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-2 border border-gray-600 rounded-full text-sm mb-8">
          Platform Stats
        </div>
        <p className="text-gray-400 mb-8">
          Real-time statistics showcasing our market&#39;s growth and activity
        </p>

        {/* plate form stats */}
        <PlateformStats />
      </div>

      {/* CTA Section */}
      <div className="text-center mb-16 py-12">
        <h2 className="text-4xl font-bold mb-4">Ready to start trading?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of traders making informed predictions and earning
          rewards based on their market insights.
        </p>

      </div>

      <Faq />
    </div>
  );
}
