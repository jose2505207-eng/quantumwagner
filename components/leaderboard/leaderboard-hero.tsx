"use client";

import React from "react";
import Container from "../global/container";
import Wrapper from "../global/wrapper";
import Icons from "../global/icons";
import { Trophy, TrendingUp, Users, Award } from "lucide-react";

const LeaderboardHero = () => {
  return (
    <Wrapper className="py-20">
      <div className="flex flex-col items-center justify-center w-full z-10">
        <Container>
          <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max mx-auto rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
            <Trophy className="size-5 text-yellow-400" />
            <span className="text-sm text-white">Top Traders Leaderboard</span>
          </div>
        </Container>

        <Container delay={0.1}>
          <h1 className="text-balance !leading-[1.25] text-center text-4xl md:text-6xl font-semibold tracking-tight mt-6 w-full">
            Rise to the Top of <br className="hidden lg:inline-block" />{" "}
            Quantum Elite
          </h1>
        </Container>

        <Container delay={0.2}>
          <p className="text-base md:text-lg font-normal text-center text-balance text-muted-foreground max-w-3xl mx-auto mt-4">
            Compete with the best traders, climb the rankings, and earn
            exclusive rewards. Track your performance against the community's
            top predictors.
          </p>
        </Container>

        <Container delay={0.3} className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-12">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-[#0A0A0A] border border-border">
              <Users className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-2xl font-bold text-white">12,847</div>
              <div className="text-sm text-muted-foreground">
                Active Traders
              </div>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-[#0A0A0A] border border-border">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
              <div className="text-2xl font-bold text-white">$2.4M</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-[#0A0A0A] border border-border">
              <Award className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-2xl font-bold text-white">1,289</div>
              <div className="text-sm text-muted-foreground">Elite Members</div>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-[#0A0A0A] border border-border">
              <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
              <div className="text-2xl font-bold text-white">89.4%</div>
              <div className="text-sm text-muted-foreground">Top Win Rate</div>
            </div>
          </div>
        </Container>
      </div>
    </Wrapper>
  );
};

export default LeaderboardHero;
