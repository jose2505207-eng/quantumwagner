"use client";

import { Button } from '@/componenets/button/primary';
import MarketCard from '@/componenets/market/marketCard';
import { ChevronDown, TrendingUp, Users } from 'lucide-react';
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState('featured');
  const [selectedBet, setSelectedBet] = useState(null);

  const featuredMarkets = [
    {
      id: 1,
      question: "Will DOGE reach $1.00 by end of Q1 2025?",
      yesPercent: 68,
      noPercent: 32,
      yesVolume: "$124K",
      noVolume: "$57K",
      totalBets: 1247,
      endsIn: "43 days"
    }
  ];

  const popularMarkets = [
    {
      id: 2,
      question: "Will SHIB reach $0.001 by March 2025?",
      yesPercent: 23,
      noPercent: 77,
      yesVolume: "$85K",
      noVolume: "$92K",
      totalBets: 834
    },
    {
      id: 3,
      question: "Will PEPE hit new ATH this quarter?",
      yesPercent: 64,
      noPercent: 36,
      yesVolume: "$156K",
      noVolume: "$87K",
      totalBets: 1243
    },
    {
      id: 4,
      question: "Will any meme coin flip ETH market cap?",
      yesPercent: 8,
      noPercent: 92,
      yesVolume: "$267K",
      noVolume: "$2.1M",
      totalBets: 892
    },
    {
      id: 5,
      question: "Will BONK 50x from current price by 2025?",
      yesPercent: 41,
      noPercent: 59,
      yesVolume: "$94K",
      noVolume: "$127K",
      totalBets: 743
    },
    {
      id: 6,
      question: "Will WIF reach $20 this year?",
      yesPercent: 35,
      noPercent: 65,
      yesVolume: "$203K",
      noVolume: "$371K",
      totalBets: 1564
    },
    {
      id: 7,
      question: "Will Elon tweet about DOGE this week?",
      yesPercent: 78,
      noPercent: 22,
      yesVolume: "$54K",
      noVolume: "$15K",
      totalBets: 967
    }
  ];


  return (
    <div className="min-h-screen text-white relative">

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="text-gray-400">Meme Coin Prediction Market</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Bet on Meme Coin
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Futures
            </span>
          </h1>

          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Predict the future of meme coins, earn rewards, and climb the leaderboard. Join the most exciting prediction market in crypto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors">
              Start Predicting
            </button>
            <button className="border border-gray-600 px-8 py-3 rounded-lg font-medium hover:border-gray-500 transition-colors">
              View Markets
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">$2.4M+</div>
              <div className="text-gray-400">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">156</div>
              <div className="text-gray-400">Active Markets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">8,924</div>
              <div className="text-gray-400">Top Predictors</div>
            </div>
          </div>
        </div>

        {/* Featured Market */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Market</h2>
            <span className="text-gray-400">Ends in 43 days</span>
          </div>

          {featuredMarkets.map(market => (
            <MarketCard key={market.id} market={market} isFeatured={true} />
          ))}
        </section>

        {/* Popular Markets */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Popular Markets</h2>
              <p className="text-purple-400">Trade with confidence</p>
            </div>
            <p className="text-gray-400 text-sm max-w-xs text-right">
              Join thousands of traders making predictions on the most exciting crypto markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMarkets.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="border border-gray-600 px-8 py-3 rounded-lg font-medium hover:border-gray-500 transition-colors mr-4">
              View All Markets
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors">
              Create Market
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Frequently asked questions</h2>
          <p className="text-gray-400 mb-8">
            Everything you need to know about prediction markets and how CoinBuzz works.
          </p>

          <div className="space-y-4">
            {[
              "How do prediction markets work on CoinBuzz?",
              "What happens to my money when I place a bet?",
              "How are market outcomes determined?",
              "Can I sell my position before the market closes?",
              "What fees does CoinBuzz charge?",
              "Is my wallet safe on CoinBuzz?"
            ].map((question, index) => (
              <div key={index} className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between cursor-pointer">
                  <span className="text-white font-medium">{question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Button onClick={() => {
        console.log("hit here");
      }}>Start Now</Button>

    </div>
  );
}