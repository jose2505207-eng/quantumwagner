"use client";

import { useMarketStore } from "@/store/adminMarketStore";
import { Coins, Zap, Crown, Gamepad2, BarChart3, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import Wrapper from "./global/wrapper";
import Container from "./global/container";

export default function MarketCategories() {
  const router = useRouter();
  const { markets } = useMarketStore();

  // Count markets per category
  const categoryCounts = markets.reduce<Record<string, number>>((acc, m) => {
    const cat = m.category?.toUpperCase() || "OTHER";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categories = [
    {
      key: "CRYPTO",
      title: "Crypto",
      subtitle: "Coins & predictions",
      Icon: Coins,
      bgGradient: "from-yellow-400/10 to-yellow-600/5",
      iconColor: "text-yellow-400",
      href: "CRYPTO",
    },
    {
      key: "STOCKS",
      title: "Price Predictions",
      subtitle: "Market trends & targets",
      Icon: BarChart3,
      bgGradient: "from-green-400/10 to-green-600/5",
      iconColor: "text-green-400",
      href: "STOCKS",
    },
    {
      key: "DEFI",
      title: "DeFi Events",
      subtitle: "Protocol launches, airdrops",
      Icon: Zap,
      bgGradient: "from-blue-400/10 to-blue-600/5",
      iconColor: "text-blue-400",
      href: "DEFI_EVENTS",
    },
    {
      key: "CELEBRITY_CRYPTO",
      title: "Celebrity Crypto",
      subtitle: "Influencer mentions",
      Icon: Crown,
      bgGradient: "from-purple-400/10 to-purple-600/5",
      iconColor: "text-purple-400",
      href: "CELEBRITY_CRYPTO",
    },
    {
      key: "AI_GAMING",
      title: "AI & Gaming",
      subtitle: "Tech adoption & games",
      Icon: Gamepad2,
      bgGradient: "from-pink-400/10 to-pink-600/5",
      iconColor: "text-pink-400",
      href: "AI_GAMING",
    },
    {
      key: "TECHNOLOGY",
      title: "Technology",
      subtitle: "Innovation & adoption",
      Icon: Cpu,
      bgGradient: "from-orange-400/10 to-orange-600/5",
      iconColor: "text-orange-400",
      href: "TECHNOLOGY",
    },
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
                Market Categories
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
              Market Categories
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from diverse prediction markets across the crypto ecosystem
            </p>
          </div>
        </Container>

        <Container delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const count = categoryCounts[category.key] || 0;
              return (
                <Container key={index} delay={0.1 + index * 0.05}>
                  <div 
                    onClick={() => router.push(`markets/category/${category.href}`)}
                    className="group relative p-6 rounded-xl cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.05)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                  >
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    <div className="absolute inset-[1px] bg-[#0A0A0A] rounded-xl"></div>
                    
                    {/* Subtle background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />

                    {/* Card content */}
                    <div className="relative z-10">
                      {/* Header with icon and count */}
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className={`relative p-4 rounded-xl bg-gradient-to-br ${category.bgGradient} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <category.Icon
                            className={`w-7 h-7 ${category.iconColor} relative z-10`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent rounded-xl group-hover:from-foreground/10"></div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold group-hover:text-primary transition-colors duration-300">
                            {count}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider">
                            Markets
                          </div>
                        </div>
                      </div>

                      {/* Title and description */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-xl group-hover:text-primary transition-colors duration-300">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {category.subtitle}
                        </p>
                      </div>

                      {/* Action indicator */}
                      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                          <span>View {count} Markets</span>
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
                      <category.Icon className="w-full h-full text-foreground" />
                    </div>
                  </div>
                </Container>
              );
            })}
          </div>
        </Container>

        <Container delay={0.3}>
          <div className="text-center mt-12">
            <button className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="absolute inset-[1px] bg-[#0A0A0A] rounded-xl"></div>

              {/* Button content */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  View All Categories
                </span>
                <div className="w-6 h-6 rounded-full border border-border/60 group-hover:border-primary/60 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10">
                  <svg
                    className="w-3 h-3 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-0.5 transition-all duration-300"
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

              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            </button>
          </div>
        </Container>
      </Wrapper>
    </div>
  );
}
