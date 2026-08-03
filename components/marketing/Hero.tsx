"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePlatformStats, formatSol } from "@/lib/usePlatformStats";
import Wrapper from "../global/wrapper";
import Icons from "../global/icons";
import Image from "next/image";
import Container from "../global/container";
import { Button } from "../ui/button";
import BettingButton from "../ui/betting-button";
import Link from "next/link";
import { useCountdown } from "@/app/utils/hooks/useCountDown";
import type { Market } from "@/app/types";

interface HeroProps {
  /** The market to headline. Undefined while loading or when none exist. */
  featured?: Market;
}

const Hero = ({ featured }: HeroProps) => {
  const { stats: live, loading } = usePlatformStats();
  const router = useRouter();
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

          {/* Featured Market — real backend data, or an honest empty state.
              This card used to be a hardcoded DOGE market with invented
              volume/trader counts and two buttons wired to nothing. */}
          <Container delay={0.5} className="w-full z-30">
            <div className="relative mx-auto max-w-5xl mt-12">
              <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg lg:rounded-xl hover:border-primary/40 transition-all duration-300 ease-out bg-[#0A0A0A]/50 backdrop-blur-sm">
                {featured ? (
                  <FeaturedMarket
                    market={featured}
                    onBet={(side) =>
                      router.push(`/markets/${featured.id}?side=${side}`)
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center text-center py-8 gap-4">
                    <div className="flex items-center justify-center px-4 py-2 rounded-full relative before:absolute before:inset-0 before:-z-10 before:p-[1.5px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950 before:content-[''] after:absolute after:inset-[1.5px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/80">
                      <span className="text-sm font-medium">Featured Market</span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-semibold">
                      No markets open yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Be the first — create a market and it will show up here.
                    </p>
                    <Link href="/markets/new">
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        Create a market
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      </Wrapper>
    </div>
  );
};

/**
 * Split out so the countdown hook can run against a market that may not exist
 * on the first render (hooks cannot be called conditionally).
 */
const FeaturedMarket = ({
  market,
  onBet,
}: {
  market: Market;
  onBet: (side: "yes" | "no") => void;
}) => {
  const yesPool = Number(market.yes_pool || 0);
  const noPool = Number(market.no_pool || 0);
  const totalPool = yesPool + noPool;
  // With no stake on either side there is no implied probability — show "—"
  // rather than inventing a 50/50 or the old hardcoded 68/32.
  const hasOdds = totalPool > 0;
  const yesOdds = hasOdds ? Math.round((yesPool / totalPool) * 100) : null;
  const noOdds = yesOdds === null ? null : 100 - yesOdds;

  const { days, hours, minutes, isExpired } = useCountdown(market.end_time);
  const traders = market._count?.positions ?? 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-center px-4 py-2 rounded-full relative before:absolute before:inset-0 before:-z-10 before:p-[1.5px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950 before:content-[''] after:absolute after:inset-[1.5px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/80">
          <span className="text-sm font-medium">Featured Market</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {isExpired ? "Ended" : `Ends in ${days}d ${hours}h ${minutes}m`}
        </span>
      </div>

      <Link href={`/markets/${market.id}`}>
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 text-center hover:text-primary transition-colors">
          {market.question}
        </h3>
      </Link>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg hover:border-[#10B981]/60 transition-all duration-300 ease-out">
          <div className="text-2xl lg:text-3xl font-bold text-[#10B981] text-center">
            {yesOdds === null ? "—" : `${yesOdds}%`}
          </div>
          <div className="text-sm text-muted-foreground text-center mt-1">
            YES Odds
          </div>
        </div>
        <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg hover:border-[#EF4444]/60 transition-all duration-300 ease-out">
          <div className="text-2xl lg:text-3xl font-bold text-[#EF4444] text-center">
            {noOdds === null ? "—" : `${noOdds}%`}
          </div>
          <div className="text-sm text-muted-foreground text-center mt-1">
            NO Odds
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold">{market.total_volume ?? "0"}</div>
          <div className="text-xs text-muted-foreground">Volume</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{traders}</div>
          <div className="text-xs text-muted-foreground">Traders</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">
            {market.category || "—"}
          </div>
          <div className="text-xs text-muted-foreground">Category</div>
        </div>
      </div>

      <div className="flex gap-4">
        <BettingButton
          variant="yes"
          size="lg"
          className="flex-1"
          onClick={() => onBet("yes")}
        >
          Bet YES
        </BettingButton>
        <BettingButton
          variant="no"
          size="lg"
          className="flex-1"
          onClick={() => onBet("no")}
        >
          Bet NO
        </BettingButton>
      </div>
    </>
  );
};

export default Hero;
