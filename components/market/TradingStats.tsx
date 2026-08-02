import React from "react";
import Wrapper from "../global/wrapper";
import Container from "../global/container";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePlatformStats, formatSol } from "@/lib/usePlatformStats";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

const TradingStats = () => {
  const { connected } = useWallet();
  // Every figure below used to be invented ("$2.4M+", "8,924 traders",
  // "89.2% accuracy"). They now come from real persisted activity.
  const { stats: live, loading } = usePlatformStats();
  const show = (value: string) => (loading ? "…" : value);
  const stats = [
    {
      icon: DollarSign,
      value: show(formatSol(live?.totalVolumeSol ?? 0)),
      label: "Total Volume",
      description: "Staked across all markets",
    },
    {
      icon: Users,
      value: show(String(live?.traders ?? 0)),
      label: "Players",
      description: "Wallets that have signed in",
    },
    {
      icon: Target,
      value: show(String(live?.activeMarkets ?? 0)),
      label: "Active Markets",
      description: "Open prediction markets",
    },
    {
      icon: BarChart3,
      value: show(
        live?.accuracyPercent === null || live?.accuracyPercent === undefined
          ? "—"
          : `${live.accuracyPercent.toFixed(1)}%`
      ),
      label: "Accuracy Rate",
      description: "Winning share of settled bets",
    },
    {
      icon: TrendingUp,
      value: show(String(live?.totalPredictions ?? 0)),
      label: "Bets Placed",
      description: "Confirmed on-chain stakes",
    },
    {
      icon: Zap,
      value: show(String(live?.resolvedMarkets ?? 0)),
      label: "Markets Settled",
      description: "Resolved through the oracle",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full py-16 lg:py-24 relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full blur-[6rem] bg-gradient-radial from-primary/12 via-primary/6 to-transparent -z-10" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full blur-[8rem] bg-gradient-radial from-primary/10 via-primary/4 to-transparent -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent -z-10" />

      <Wrapper>
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/15 backdrop-blur-sm mb-6 group hover:from-primary/10 hover:to-primary/15 transition-all duration-300">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-primary rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm font-semibold text-primary/90 group-hover:text-primary transition-colors duration-300">
                Platform Analytics
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
              Trading Statistics
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time insights into the Quantum Wager prediction market ecosystem
            </p>
          </div>
        </Container>

        <Container delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Container key={index} delay={0.1 + index * 0.05}>
                <div className="group relative p-8 rounded-3xl cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-[#0A0A0A]/80 to-[#111111]/60 backdrop-blur-sm border border-border/30 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
                  {/* Subtle background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Card content */}
                  <div className="relative z-10 text-center">
                    {/* Refined icon */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 group-hover:from-primary/15 group-hover:to-primary/8 transition-all duration-300 group-hover:scale-105">
                        <stat.icon className="w-9 h-9 text-primary transition-colors duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl"></div>
                      </div>
                    </div>

                    {/* Clean value display */}
                    <div className="mb-6">
                      <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-500">
                        {stat.value}
                      </div>
                    </div>

                    {/* Label and description */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-xl group-hover:text-primary/90 transition-colors duration-300">
                        {stat.label}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {stat.description}
                      </p>
                    </div>

                    {/* Clean underline effect */}
                    <div className="mt-8">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent group-hover:via-primary/50 transition-colors duration-500"></div>
                    </div>
                  </div>

                  {/* Subtle background pattern */}
                  <div className="absolute top-6 right-6 w-16 h-16 opacity-3 group-hover:opacity-8 transition-opacity duration-500">
                    <stat.icon className="w-full h-full text-foreground" />
                  </div>
                </div>
              </Container>
            ))}
          </div>
        </Container>

        {!connected && (
          <Container delay={0.3}>
            <div className="relative mt-24 mx-auto max-w-5xl">
              <div className="relative p-12 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
                
                {/* Glowing effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-primary/20 blur-[100px] -z-10 rounded-full opacity-50"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Live on Solana
                  </div>

                  <h3 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                    Ready to start <span className="text-primary">trading?</span>
                  </h3>
                  
                  <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                    Join thousands of traders making informed predictions. 
                    Experience instant settlements and transparent markets.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                    <div className="w-full sm:w-auto [&>button]:w-full [&>button]:sm:w-auto [&>button]:h-[56px] [&>button]:px-8 [&>button]:rounded-xl [&>button]:font-bold [&>button]:bg-primary [&>button]:hover:bg-primary/90 [&>button]:transition-all [&>button]:duration-300 [&>button]:hover:scale-105 [&>button]:hover:shadow-lg [&>button]:hover:shadow-primary/25">
                      <WalletMultiButton />
                    </div>

                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                      View Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        )}
      </Wrapper>
    </div>
  );
};

export default TradingStats;
