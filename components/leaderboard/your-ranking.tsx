"use client";

import React from "react";
import { TrendingUp, Trophy, Target, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";

const YourRanking = () => {
  return (
    <div className="bg-[#0A0A0A] border border-border rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400/30 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Your Ranking</h3>
          <p className="text-muted-foreground text-sm">
            Current position in leaderboard
          </p>
        </div>
      </div>

      {/* Current Rank */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-purple-400 mb-2">#1,247</div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400">+23 positions</span>
          <span className="text-muted-foreground">this week</span>
        </div>
      </div>

      {/* Progress to Next Rank */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress to Top 1000</span>
          <span className="font-medium">247 spots to go</span>
        </div>
        <div className="w-full bg-[#1A1A1A] rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full"
            style={{ width: "20%" }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Need $12,500 more profit
        </div>
      </div>

      {/* Key Stats Comparison */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-sm">Total Profit</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-400">$4,250</div>
            <div className="text-xs text-muted-foreground">
              vs #1000: $16,750
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Win Rate</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-blue-400">72.4%</div>
            <div className="text-xs text-muted-foreground">vs #1000: 78.2%</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Markets Traded</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-yellow-400">23</div>
            <div className="text-xs text-muted-foreground">vs #1000: 89</div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium mb-3">Recent Performance</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">+$420</div>
            <div className="text-xs text-muted-foreground">24H</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">+$1,250</div>
            <div className="text-xs text-muted-foreground">7D</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">-$180</div>
            <div className="text-xs text-muted-foreground">30D</div>
          </div>
        </div>
      </div>

      {/* View Full Stats Button */}
      <Button className="w-full mt-6" variant="outline">
        View Full Portfolio
      </Button>
    </div>
  );
};

export default YourRanking;
