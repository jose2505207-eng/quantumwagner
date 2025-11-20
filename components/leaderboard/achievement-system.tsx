"use client";

import React from "react";
import {
  Award,
  Star,
  Target,
  Trophy,
  Zap,
  Crown,
  Shield,
  Gem,
} from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

const achievements = [
  {
    id: "first-win",
    name: "First Victory",
    description: "Win your first prediction",
    icon: Target,
    earned: true,
    progress: 100,
    rarity: "common",
    color: "text-green-400",
  },
  {
    id: "win-streak",
    name: "Hot Streak",
    description: "Win 5 predictions in a row",
    icon: Zap,
    earned: true,
    progress: 100,
    rarity: "rare",
    color: "text-yellow-400",
  },
  {
    id: "diamond-hands",
    name: "Diamond Hands",
    description: "Hold a position for 30+ days",
    icon: Gem,
    earned: true,
    progress: 100,
    rarity: "epic",
    color: "text-cyan-400",
  },
  {
    id: "profit-king",
    name: "Profit King",
    description: "Earn $10,000 total profit",
    icon: Crown,
    earned: false,
    progress: 42,
    target: 10000,
    current: 4200,
    rarity: "legendary",
    color: "text-purple-400",
  },
  {
    id: "accuracy-master",
    name: "Accuracy Master",
    description: "Maintain 85% accuracy over 50 trades",
    icon: Shield,
    earned: false,
    progress: 68,
    target: 50,
    current: 34,
    rarity: "epic",
    color: "text-blue-400",
  },
  {
    id: "top-1000",
    name: "Elite Trader",
    description: "Reach top 1000 on leaderboard",
    icon: Trophy,
    earned: false,
    progress: 20,
    target: 1000,
    current: 1247,
    rarity: "legendary",
    color: "text-purple-400",
  },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "border-gray-500/30 bg-gray-500/10";
    case "rare":
      return "border-blue-500/30 bg-blue-500/10";
    case "epic":
      return "border-purple-500/30 bg-purple-500/10";
    case "legendary":
      return "border-yellow-500/30 bg-yellow-500/10";
    default:
      return "border-gray-500/30 bg-gray-500/10";
  }
};

const AchievementSystem = () => {
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="mt-8">
      <div className="bg-[#0A0A0A] border border-border rounded-xl p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 border-2 border-yellow-400/30 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Achievement System</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {earnedCount}/{totalCount} unlocked •{" "}
                {Math.round((earnedCount / totalCount) * 100)}% complete
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            <Star className="w-4 h-4 mr-2" />
            Share Achievements
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-medium">
              {Math.round((earnedCount / totalCount) * 100)}%
            </span>
          </div>
          <Progress value={(earnedCount / totalCount) * 100} className="h-3" />
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;

            return (
              <div
                key={achievement.id}
                className={`p-6 rounded-xl border ${getRarityColor(
                  achievement.rarity
                )} ${
                  achievement.earned ? "opacity-100" : "opacity-70"
                } transition-all duration-200 hover:scale-105`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-[#1A1A1A] border border-border flex items-center justify-center ${
                      achievement.earned
                        ? achievement.color
                        : "text-muted-foreground"
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      {achievement.earned && (
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>

                    {!achievement.earned && achievement.target && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-muted-foreground">
                            {achievement.current?.toLocaleString()} /{" "}
                            {achievement.target.toLocaleString()}
                          </span>
                          <span className="font-medium">
                            {achievement.progress}%
                          </span>
                        </div>
                        <Progress
                          value={achievement.progress}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;
