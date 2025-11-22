"use client";

import { 
  BarChart3, Zap, Swords, Rocket, Coins, 
  Briefcase, Trophy, PlusCircle, ArrowRight 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Wrapper from "./global/wrapper";
import Container from "./global/container";
import { cn } from "@/lib/utils";

export default function MarketCategories() {
  const router = useRouter();

  const categories = [
    {
      title: "Prediction Markets",
      description: "Trade on real-world outcomes across Crypto, Finance, Gaming, and Tech.",
      icon: BarChart3,
      link: "/markets",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    },
    {
      title: "Fast Bets",
      description: "High-frequency, short-term prediction markets. Quick resolution, instant payouts.",
      icon: Zap,
      link: "/fastbet",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20"
    },
    {
      title: "Meme Battles",
      description: "The ultimate PvP arena. Token communities clash in head-to-head prediction battles.",
      icon: Swords,
      link: "/battlearena",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20"
    },
    {
      title: "Token Launchpad",
      description: "Deploy fully-featured SPL tokens on Solana in seconds. Zero coding required.",
      icon: Rocket,
      link: "/token",
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-400/20"
    },
    {
      title: "Token Marketplace",
      description: "Discover, analyze, and swap the hottest new tokens. Advanced filtering and real-time data.",
      icon: Coins,
      link: "/buytoken",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20"
    },
    {
      title: "Create Battle",
      description: "Host your own prediction events. Set the terms and earn fees as the organizer.",
      icon: PlusCircle,
      link: "/battlearena/new",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20"
    },
    {
      title: "Leaderboard",
      description: "Compete against the best predictors. Climb the ranks and earn reputation points.",
      icon: Trophy,
      link: "/leaderboard",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20"
    },
    {
      title: "Portfolio",
      description: "Your command center. Track active positions, monitor PnL, and manage assets.",
      icon: Briefcase,
      link: "/portfolio",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full py-16 lg:py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-[6rem] bg-gradient-radial from-primary/8 via-primary/4 to-transparent -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[8rem] bg-gradient-radial from-primary/6 via-primary/3 to-transparent -z-10" />

      <Wrapper>
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/15 backdrop-blur-sm mb-6 group hover:from-primary/10 hover:to-primary/15 transition-all duration-300">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-primary rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm font-semibold text-primary/90 group-hover:text-primary transition-colors duration-300">
                Platform Features
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
              Explore the Ecosystem
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover all the ways to trade, compete, and earn on Quantum Wager
            </p>
          </div>
        </Container>

        <Container delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Container key={index} delay={0.1 + index * 0.05}>
                <div 
                  onClick={() => router.push(category.link)}
                  className="group relative p-6 rounded-xl cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] border border-white/10 hover:border-primary/50 h-full flex flex-col"
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  <div className="absolute inset-[1px] bg-[#0A0A0A] rounded-xl"></div>
                  
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />

                  {/* Card content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header with icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={cn("relative p-4 rounded-xl border group-hover:scale-110 transition-transform duration-300", category.bg, category.border)}
                      >
                        <category.icon
                          className={cn("w-7 h-7 relative z-10", category.color)}
                        />
                      </div>
                      <div className="p-2 rounded-full bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Title and description */}
                    <div className="space-y-3 flex-grow">
                      <h3 className="font-semibold text-xl group-hover:text-primary transition-colors duration-300">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Action indicator */}
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                        <span>Explore</span>
                        <svg
                          className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Subtle background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <category.icon className="w-full h-full text-foreground" />
                  </div>
                </div>
              </Container>
            ))}
          </div>
        </Container>
      </Wrapper>
    </div>
  );
}
