"use client";

import React from "react";
import { usePlatformStats, formatSol } from "@/lib/usePlatformStats";
import Wrapper from "../global/wrapper";
import Icons from "../global/icons";
import Image from "next/image";
import Container from "../global/container";
import { Button } from "../ui/button";
import BettingButton from "../ui/betting-button";
import Link from "next/link";

const Hero = () => {
  const { stats: live, loading } = usePlatformStats();
  return (
    <div className="relative z-0 w-full h-full">
      <div className="absolute -top-16 inset-x-0 -z-10 mx-auto w-3/4 h-32 lg:h-40 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_-40%,rgba(139,92,246,0.8)_0%,rgba(5,5,5,0)_80%)]"></div>

      {/* Ensure this image exists in public/images/ or remove it */}
      {/* <Image
        src="/images/hero.svg"
        alt=""
        width={1024}
        height={1024}
        className="absolute inset-x-0 -top-16 w-full z-10 min-w-full"
      /> */}

      <Wrapper className="py-20">
        <div className="flex flex-col items-center justify-center w-full z-10">
          <Container>
            <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max mx-auto rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
              <Icons.stars className="size-5" />
              <span className="text-sm text-white">
                Meme Coin Prediction Market
              </span>
            </div>
          </Container>

          <Container delay={0.1}>
            <h2 className="text-balance !leading-[1.25] text-center text-5xl md:text-6xl font-semibold tracking-tight mt-6 w-full">
              Bet on Meme Coin <br className="hidden lg:inline-block" />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Futures
              </span>
            </h2>
          </Container>

          <Container delay={0.2}>
            <p className="text-base md:text-lg font-normal text-center text-balance text-muted-foreground max-w-3xl mx-auto mt-4">
              Predict the future of meme coins, earn rewards, and climb the
              leaderboard. Join the most exciting prediction market in crypto.
            </p>
          </Container>

          <Container delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <Link href="/markets">
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                >
                    Start Predicting
                </Button>
              </Link>
              <Link href="/markets">
                <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-neutral-600 hover:border-purple-500 bg-transparent hover:bg-purple-500/10 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                >
                    View Markets
                </Button>
              </Link>
            </div>
          </Container>

          {/* Stats Section */}
          <Container delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-4xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{loading ? "…" : formatSol(live?.totalVolumeSol ?? 0)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total Volume
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{loading ? "…" : live?.activeMarkets ?? 0}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Active Markets
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{loading ? "…" : live?.traders ?? 0}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Top Predictors
                </div>
              </div>
            </div>
          </Container>

          {/* Featured Market - Hardcoded for now as per reference design */}
          <Container delay={0.5} className="w-full z-30">
            <div className="relative mx-auto max-w-5xl mt-12">
              <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg lg:rounded-xl hover:border-primary/40 transition-all duration-300 ease-out bg-[#0A0A0A]/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center px-4 py-2 rounded-full relative before:absolute before:inset-0 before:-z-10 before:p-[1.5px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950 before:content-[''] after:absolute after:inset-[1.5px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/80">
                    <span className="text-sm font-medium">Featured Market</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Ends in 45 days
                  </span>
                </div>

                <h3 className="text-xl lg:text-2xl font-semibold mb-6 text-center">
                  Will DOGE reach $1.00 by end of Q1 2025?
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg hover:border-[#10B981]/60 transition-all duration-300 ease-out">
                    <div className="text-2xl lg:text-3xl font-bold text-[#10B981] text-center">
                      68%
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-1">
                      YES Odds
                    </div>
                  </div>
                  <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg hover:border-[#EF4444]/60 transition-all duration-300 ease-out">
                    <div className="text-2xl lg:text-3xl font-bold text-[#EF4444] text-center">
                      32%
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-1">
                      NO Odds
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold">$124K</div>
                    <div className="text-xs text-muted-foreground">Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">1,247</div>
                    <div className="text-xs text-muted-foreground">Traders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">68%</div>
                    <div className="text-xs text-muted-foreground">
                      Confidence
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <BettingButton variant="yes" size="lg" className="flex-1">
                    Bet YES
                  </BettingButton>
                  <BettingButton variant="no" size="lg" className="flex-1">
                    Bet NO
                  </BettingButton>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </Wrapper>
    </div>
  );
};

export default Hero;
