import React from "react";
import LeaderboardHero from "@/components/leaderboard/leaderboard-hero";
import YourRanking from "@/components/leaderboard/your-ranking";
import { PlayerHUD, MissionMap, CompleteLevelOnMount } from "@/components/game";
import LiveLeaderboard from "@/components/leaderboard/LiveLeaderboard";

const LeaderboardPage = () => {
  return (
    <div className="w-full relative flex flex-col pt-16">
      {/* Entering the leaderboard is itself Level 6's milestone action. */}
      <CompleteLevelOnMount level="enter-leaderboard" />
      {/* Gradient background */}
      <div className="absolute -top-16 inset-x-0 -z-10 mx-auto w-3/4 h-32 lg:h-60 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_-40%,rgba(139,92,246,0.3)_0%,rgba(5,5,5,0)_80%)]"></div>

      <LeaderboardHero />
      <div className="px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <LiveLeaderboard />
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-8 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex-1">
        </div>
        <div className="lg:w-80 space-y-6">
          <PlayerHUD />
          <YourRanking />
          <div className="qw-glass rounded-2xl p-5">
            <MissionMap />
          </div>
        </div>
      </div>
      <div className="px-4 lg:px-8 max-w-7xl mx-auto w-full">
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 inset-x-0 -z-10 mx-auto w-3/4 h-32 lg:h-60 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_140%,rgba(139,92,246,0.2)_0%,rgba(5,5,5,0)_80%)]"></div>
    </div>
  );
};

export default LeaderboardPage;
