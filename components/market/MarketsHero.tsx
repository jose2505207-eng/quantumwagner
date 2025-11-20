import React from "react";
import Wrapper from "../global/wrapper";
import Icons from "../global/icons";
import Container from "../global/container";
import { Button } from "../ui/button";
import { TrendingUp, Target, BarChart3, Bitcoin, ArrowUpRight, Activity } from "lucide-react";

const MarketsHero = () => {
  return (
    <div className="relative z-0 w-full h-full">
      <div className="absolute -top-16 inset-x-0 -z-10 mx-auto w-3/4 h-32 lg:h-60 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_-40%,rgba(139,92,246,0.8)_0%,rgba(5,5,5,0)_80%)]"></div>

      <Wrapper className="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="flex flex-col w-full z-10">
            <Container>
              <div className="flex items-center justify-center gap-x-1 px-2 py-1.5 relative w-max mx-auto md:mx-0 rounded-full before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700 before:to-neutral-900 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/60">
                <Icons.stars className="size-5" />
                <span className="text-sm text-white">Quantum Wager Markets</span>
              </div>
            </Container>

            <Container delay={0.1}>
              <h2 className="text-balance !leading-[1.25] text-4xl md:text-6xl font-semibold tracking-tight text-center lg:text-left mt-6 w-full">
                Discover All <br className="hidden lg:inline-block" />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Prediction Markets
                </span>
              </h2>
            </Container>

            <Container delay={0.2}>
              <p className="text-base lg:text-lg text-muted-foreground text-center lg:text-left mt-4 max-w-2xl mx-auto lg:mx-0">
                Explore hundreds of active prediction markets, from meme coin
                futures to crypto trends. Find your edge and start trading with
                confidence.
              </p>
            </Container>

            <Container delay={0.3}>
              <div className="hidden lg:flex flex-col gap-2 mt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Real-time market data and trends
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Precise predictions with transparent odds
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Advanced analytics and market insights
                  </span>
                </div>
              </div>
            </Container>

            <Container delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                >
                  Start Trading
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 hover:border-primary/60 rounded-xl"
                >
                  View Analytics
                </Button>
              </div>
            </Container>
          </div>

          <Container delay={0.5}>
            <div className="relative w-full max-w-md mx-auto lg:mr-0">
              {/* Decorative background elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

              {/* Main Card */}
              <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Bitcoin className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Bitcoin to hit $100k?</h3>
                      <p className="text-sm text-muted-foreground">Ends in 2 days</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                    <ArrowUpRight className="w-3 h-3" />
                    +12.5% Vol
                  </span>
                </div>

                {/* Chart Area (Mock) */}
                <div className="h-32 w-full bg-gradient-to-b from-primary/5 to-transparent rounded-lg border border-primary/10 mb-6 relative overflow-hidden group">
                  {/* SVG Line Chart */}
                  <svg className="absolute bottom-0 left-0 right-0 h-full w-full" preserveAspectRatio="none">
                    <path d="M0 100 C 20 80 40 90 60 60 S 100 40 140 50 S 200 20 240 10 V 130 H 0 Z" fill="url(#gradient)" opacity="0.2" />
                    <path d="M0 100 C 20 80 40 90 60 60 S 100 40 140 50 S 200 20 240 10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" className="text-primary" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Interactive cursor line (visual only) */}
                  <div className="absolute top-0 bottom-0 w-[1px] bg-primary/50 left-[60%] hidden group-hover:block">
                    <div className="absolute top-[25%] -left-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,1)]"></div>
                    <div className="absolute top-4 left-2 bg-card border border-border text-xs px-2 py-1 rounded shadow-lg">
                      $98,420
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-background/40 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Yes Pool</p>
                    <p className="text-lg font-semibold text-green-500">65%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background/40 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Volume</p>
                    <p className="text-lg font-semibold text-foreground">$2.4M</p>
                  </div>
                </div>

                {/* Action */}
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-11 rounded-xl shadow-lg shadow-primary/20">
                  Trade Now
                </Button>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-6 top-1/4 p-3 bg-card/80 backdrop-blur-md border border-border shadow-xl rounded-xl z-20 hidden sm:block hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-foreground">Live Trading</span>
                </div>
              </div>
              
              <div className="absolute -left-4 bottom-1/3 p-3 bg-card/80 backdrop-blur-md border border-border shadow-xl rounded-xl z-20 hidden sm:block hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">High Activity</span>
                </div>
              </div>
            </div>
          </Container>
        </div>

        <Container delay={0.6}>
          <div className="flex flex-col lg:hidden gap-2 mt-8">
            <div className="flex items-center gap-2 justify-center">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                Real-time market data and trends
              </span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Target className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                Precise predictions with transparent odds
              </span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <BarChart3 className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                Advanced analytics and market insights
              </span>
            </div>
          </div>
        </Container>
      </Wrapper>
    </div>
  );
};

export default MarketsHero;
