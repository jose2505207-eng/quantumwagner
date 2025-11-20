"use client";

import React, { useState } from "react";
import Container from "../global/container";
import { cn } from "@/lib/utils";

const timeframes = [
  { id: "all-time", label: "All Time" },
  { id: "monthly", label: "Monthly" },
  { id: "weekly", label: "Weekly" },
  { id: "daily", label: "Daily" },
];

const metrics = [
  { id: "total-profit", label: "Total Profit" },
  { id: "win-rate", label: "Win Rate" },
  { id: "volume", label: "Volume" },
  { id: "accuracy", label: "Accuracy" },
];

const categories = [
  { id: "all", label: "All" },
  { id: "memecoins", label: "Memecoins" },
  { id: "defi", label: "DeFi" },
  { id: "nft", label: "NFT" },
  { id: "gaming", label: "Gaming" },
];

const LeaderboardTabs = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("all-time");
  const [activeMetric, setActiveMetric] = useState("total-profit");
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="w-full py-6">
      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          {/* Timeframe */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">
              Period:
            </span>
            <div className="flex gap-1 bg-[#0A0A0A] border border-border rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setActiveTimeframe(timeframe.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                    activeTimeframe === timeframe.id
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ranking Metric */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">
              Rank by:
            </span>
            <div className="flex gap-1 bg-[#0A0A0A] border border-border rounded-lg p-1">
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setActiveMetric(metric.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                    activeMetric === metric.id
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">
              Category:
            </span>
            <div className="flex gap-1 bg-[#0A0A0A] border border-border rounded-lg p-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                    activeCategory === category.id
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LeaderboardTabs;
