"use client";
import React, { useEffect, useState } from "react";
import { useMarketStore } from "@/store/adminMarketStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import MarketCategories from "@/components/MarketCategories";
import Faq from "@/components/marketing/Faq";
import MarketsHero from "@/components/market/MarketsHero";
import MarketsGrid from "@/components/market/MarketsGrid";
import TradingStats from "@/components/market/TradingStats";

export default function Markets() {
  const { markets, setMarkets } = useMarketStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    // REMOVE THIS FOR PROD: Mock data
    const mockMarkets: any[] = [
      {
        id: "mock-1",
        question: "Will Bitcoin hit $100k by end of 2024?",
        yes_pool: 65000,
        no_pool: 35000,
        total_volume: "$1.2M",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days
        category: "CRYPTO",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 120, transactions: 450 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: true,
        image_url: "",
        pda: "mock-pda-1",
        resolution_criteria: "Price > 100k",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "Bitcoin price prediction"
      },
      {
        id: "mock-2",
        question: "Will Ethereum flip Bitcoin in market cap in 2025?",
        yes_pool: 25000,
        no_pool: 75000,
        total_volume: "$850k",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(), // 120 days
        category: "CRYPTO",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 80, transactions: 200 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: false,
        image_url: "",
        pda: "mock-pda-2",
        resolution_criteria: "ETH cap > BTC cap",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "The flippening"
      },
      {
        id: "mock-3",
        question: "Will Solana reach $500 before June?",
        yes_pool: 42000,
        no_pool: 58000,
        total_volume: "$2.1M",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days
        category: "CRYPTO",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 300, transactions: 800 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: true,
        image_url: "",
        pda: "mock-pda-3",
        resolution_criteria: "SOL > 500",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "Solana price action"
      },
      {
        id: "mock-4",
        question: "Will the US Fed cut rates in the next meeting?",
        yes_pool: 80000,
        no_pool: 20000,
        total_volume: "$5.4M",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days
        category: "FINANCE",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 500, transactions: 1200 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: true,
        image_url: "",
        pda: "mock-pda-4",
        resolution_criteria: "Rate cut announced",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "Fed interest rates"
      },
      {
        id: "mock-5",
        question: "Will GTA 6 be released in 2025?",
        yes_pool: 90000,
        no_pool: 10000,
        total_volume: "$3.2M",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 200).toISOString(), // 200 days
        category: "GAMING",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 450, transactions: 900 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: true,
        image_url: "",
        pda: "mock-pda-5",
        resolution_criteria: "Official release",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "GTA 6 release date"
      },
      {
        id: "mock-6",
        question: "Will SpaceX land on Mars before 2030?",
        yes_pool: 30000,
        no_pool: 70000,
        total_volume: "$900k",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 4).toISOString(), // 4 years
        category: "TECH",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 150, transactions: 300 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: false,
        image_url: "",
        pda: "mock-pda-6",
        resolution_criteria: "Human landing",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "Mars mission"
      },
      {
        id: "mock-7",
        question: "Will Apple launch a foldable iPhone this year?",
        yes_pool: 15000,
        no_pool: 85000,
        total_volume: "$1.5M",
        end_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(), // 180 days
        category: "TECH",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        outcome: "PENDING",
        _count: { positions: 200, transactions: 400 },
        market_type: "BINARY",
        fee_percentage: "0.03",
        tags: "",
        featured: false,
        image_url: "",
        pda: "mock-pda-7",
        resolution_criteria: "Product launch",
        oracle_config: "mock-oracle",
        oracle_source: "mock-source",
        description: "Apple foldable"
      }
    ];

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BACKEND_URL}/api/markets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Combine real API markets with mock markets (safely handle potential undefined response)
      const realMarkets = res.data?.data?.markets || [];
      setMarkets([...realMarkets, ...mockMarkets]);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
      // Fallback to just mock markets if API fails
      setMarkets(mockMarkets);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative flex flex-col pt-16 overflow-hidden">
      <MarketsHero />
      <div className="-mt-20 lg:-mt-32 relative z-10">
        <MarketCategories />
      </div>
      <MarketsGrid markets={markets} loading={loading} />
      <TradingStats />
      <Faq />
    </div>
  );
}

