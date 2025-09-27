"use client";
import React, { useEffect, useState } from "react";
import {
  Bitcoin,
  TrendingUp,
  Diamond,
  Star,
  Gamepad2,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import PlateformStats from "@/components/market/PlateformStats";
import { useMarketStore } from "@/store/adminMarketStore";
import axios from "axios";
import CountdownTimer from "../hooks/CountdownTimer";

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

      const res = await axios.get("http://localhost:8000/api/markets", {
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
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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

        {/* Todo */}
        {/* <div className="flex gap-4 justify-center"> */}

        {/* <PinkButton>Start Trading</PinkButton> */}
        {/* <Button>  Learn More</Button> */}
        {/* </div> */}
      </div>

      {/* Categories Section */}
      <div className="text-center mb-16">
        {/*  todo */}
        {/* <div className="inline-block px-4 py-2 border border-gray-600 rounded-full text-sm mb-8">
          Market Categories
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-20 py-10">
          {[
            {
              title: "Crypto Coins",
              subtitle: "Price predictions",
              count: "89",
              Icon: Bitcoin,
            },
            {
              title: "Crypto Predictions",
              subtitle: "Market trends",
              count: "156",
              Icon: TrendingUp,
            },
            {
              title: "DeFi Events",
              subtitle: "Protocol launches",
              count: "43",
              Icon: Diamond,
            },
            {
              title: "Celebrity Crypto",
              subtitle: "Celebrity endorsements",
              count: "67",
              Icon: Star,
            },
            {
              title: "AI & Gaming",
              subtitle: "Technology adoption",
              count: "34",
              Icon: Gamepad2,
            },
            {
              title: "Market Events",
              subtitle: "Economic indicators",
              count: "78",
              Icon: BarChart3,
            },
          ].map((category, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <category.Icon className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-right text-2xl font-bold text-green-400 mb-2">
                {category.count}
              </div>
              <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
              <p className="text-gray-400 text-sm">{category.subtitle}</p>
            </div>
          ))}
        </div> */}

        {/* todo */}
        {/* <button className="mt-8 px-6 py-3 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition-colors flex items-center gap-2 mx-auto">
          View All Categories
          <ExternalLink className="w-4 h-4" />
        </button> */}
      </div>

      {/* Popular Markets Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-6">
            Browse all active prediction markets that offer the best trading
            opportunities
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-4 py-2 text-white border-b-2 border-purple-500">
              Active Now
            </button>

            {/* todo */}
            {/* <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
              All
            </button> */}

            {/* refresh button */}
            <button
              onClick={loadMarkets}
              className="p-2 rounded-full hover:bg-gray-800 transition"
              title="Refresh Markets"
            >
              <RefreshCw
                className={`w-6 h-6 ${
                  loading ? "animate-spin text-purple-400" : "text-gray-400"
                }`}
              />
            </button>
          </div>
        </div>

        {loading ? (
          //  Loading State
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : markets.length === 0 ? (
          //  Empty State
          <div className="text-center text-gray-400 py-20">
            <p>No markets available</p>
            <button
              onClick={() => {
                // window.location.reload();
                loadMarkets();
              }}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          //  Data Render
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-20 py-10">
            {markets.map((market, index) => (
              <div
                key={index}
                className="border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
              >
                <h4 className="text-white font-medium mb-4 text-sm leading-relaxed">
                  {market.question}
                </h4>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="text-green-400 text-2xl font-bold">
                      {market.yes_pool}
                    </div>
                    <div className="text-gray-400 text-xs">YES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 text-2xl font-bold">
                      {market.no_pool}
                    </div>
                    <div className="text-gray-400 text-xs">NO</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
                  <div>
                    <div className="text-white">{market.total_volume}</div>
                    <div>Volume</div>
                  </div>
                  <div>
                    <CountdownTimer endTime={market.end_time} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                    Buy Yes
                  </button>
                  <button className="flex-1 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                    Buy No
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* todo */}
      {/* <div className="text-center mt-8">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto">
            Explore Markets
            <ArrowRight className="w-4 h-4" />
          </button>
        </div> */}

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

        {/* todo */}
        {/* <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
            Explore Markets
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 border border-gray-600 text-white rounded-lg font-medium hover:border-gray-500 transition-colors">
            Learn More
          </button>
        </div> */}
      </div>
    </div>
  );
}
