"use client";

import React from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  UserPlus,
} from "lucide-react";
import { Button } from "../ui/button";

// Sample leaderboard data
const topPredictors = [
  {
    rank: 1,
    username: "CryptoProphet",
    avatar: "robot",
    totalProfit: 125420,
    winRate: 89.4,
    marketsTraded: 234,
    accuracy: 87.2,
    tier: "Diamond",
    change: "up",
  },
  {
    rank: 2,
    username: "DiamondHands",
    avatar: "diamond",
    totalProfit: 98650,
    winRate: 86.1,
    marketsTraded: 189,
    accuracy: 85.8,
    tier: "Diamond",
    change: "same",
  },
  {
    rank: 3,
    username: "MemeKing",
    avatar: "alien",
    totalProfit: 87340,
    winRate: 84.7,
    marketsTraded: 156,
    accuracy: 83.4,
    tier: "Gold",
    change: "up",
  },
  {
    rank: 4,
    username: "DegenWizard",
    avatar: "wizard",
    totalProfit: 76890,
    winRate: 82.3,
    marketsTraded: 203,
    accuracy: 81.9,
    tier: "Gold",
    change: "down",
  },
  {
    rank: 5,
    username: "CoinSeer",
    avatar: "crypto",
    totalProfit: 65420,
    winRate: 80.8,
    marketsTraded: 145,
    accuracy: 79.6,
    tier: "Gold",
    change: "up",
  },
];

const getAvatarSvg = (type: string) => {
  const avatars = {
    robot: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" rx="20" fill="url(#robotGrad)" />
        <defs>
          <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect x="20" y="25" width="60" height="50" rx="8" fill="#1e293b" />
        <circle cx="35" cy="40" r="4" fill="#60a5fa" />
        <circle cx="65" cy="40" r="4" fill="#60a5fa" />
        <rect x="40" y="55" width="20" height="4" rx="2" fill="#60a5fa" />
      </svg>
    ),
    diamond: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" rx="20" fill="url(#diamondGrad)" />
        <defs>
          <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <polygon points="50,20 70,40 50,80 30,40" fill="#0369a1" />
        <polygon points="50,20 60,30 50,50 40,30" fill="#0ea5e9" />
      </svg>
    ),
    alien: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" rx="20" fill="url(#alienGrad)" />
        <defs>
          <linearGradient id="alienGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="45" rx="25" ry="30" fill="#065f46" />
        <circle cx="40" cy="35" r="6" fill="#34d399" />
        <circle cx="60" cy="35" r="6" fill="#34d399" />
        <ellipse cx="50" cy="60" rx="8" ry="4" fill="#065f46" />
      </svg>
    ),
    wizard: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" rx="20" fill="url(#wizardGrad)" />
        <defs>
          <linearGradient id="wizardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <polygon points="50,15 45,35 55,35" fill="#581c87" />
        <circle cx="50" cy="50" r="20" fill="#6d28d9" />
        <circle cx="45" cy="45" r="2" fill="#c4b5fd" />
        <circle cx="55" cy="45" r="2" fill="#c4b5fd" />
        <path
          d="M 45 55 Q 50 60 55 55"
          stroke="#c4b5fd"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    crypto: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" rx="20" fill="url(#cryptoGrad)" />
        <defs>
          <linearGradient id="cryptoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="25" fill="#92400e" />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#fed7aa"
          fontSize="24"
          fontWeight="bold"
        >
          ₿
        </text>
      </svg>
    ),
  };
  return avatars[type as keyof typeof avatars] || avatars.robot;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-lg font-bold text-white">#{rank}</span>;
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Diamond":
      return "text-cyan-400 border-cyan-400/30 bg-cyan-400/10";
    case "Gold":
      return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
    case "Silver":
      return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    default:
      return "text-green-400 border-green-400/30 bg-green-400/10";
  }
};

const TopPredictors = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Top Predictors</h2>
        <div className="text-sm text-muted-foreground">
          Updated every 5 minutes
        </div>
      </div>

      <div className="space-y-3">
        {topPredictors.map((trader, index) => (
          <div
            key={trader.rank}
            className="bg-[#0A0A0A] border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              {/* Left side - Rank and Trader Info */}
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex items-center gap-2 min-w-[80px]">
                  {getRankIcon(trader.rank)}
                  {trader.change === "up" && (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  )}
                  {trader.change === "down" && (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1A1A1A] border border-border">
                    {getAvatarSvg(trader.avatar)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {trader.username}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-medium border w-fit ${getTierColor(
                        trader.tier
                      )}`}
                    >
                      {trader.tier}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Stats and Action */}
              <div className="flex items-center gap-8">
                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      ${trader.totalProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Profit</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {trader.winRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Win Rate
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {trader.marketsTraded}
                    </div>
                    <div className="text-xs text-muted-foreground">Markets</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {trader.accuracy}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="px-8">
          Load More Rankings
        </Button>
      </div>
    </div>
  );
};

export default TopPredictors;
