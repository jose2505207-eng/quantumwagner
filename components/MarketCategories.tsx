"use client";

import { useMarketStore } from "@/store/adminMarketStore";
import { Coins, Zap, Crown, Gamepad2, BarChart3, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";

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
      badge: "from-yellow-500/30 to-yellow-900/20",
      iconColor: "text-yellow-400",
      href: "CRYPTO",
    },
    {
      key: "STOCKS",
      title: "Price Predictions (Stocks)",
      subtitle: "Market trends & targets",
      Icon: BarChart3,
      badge: "from-green-500/30 to-green-900/20",
      iconColor: "text-green-400",
      href: "STOCKS",
    },
    {
      key: "DEFI",
      title: "DeFi Events",
      subtitle: "Protocol launches, airdrops",
      Icon: Zap,
      badge: "from-blue-500/30 to-blue-900/20",
      iconColor: "text-blue-400",
      href: "DEFI_EVENTS",
    },
    {
      key: "CELEBRITY_CRYPTO",
      title: "Celebrity Crypto",
      subtitle: "Influencer mentions",
      Icon: Crown,
      badge: "from-purple-500/30 to-purple-900/20",
      iconColor: "text-purple-400",
      href: "CELEBRITY_CRYPTO",
    },
    {
      key: "AI_GAMING",
      title: "AI & Gaming",
      subtitle: "Tech adoption & games",
      Icon: Gamepad2,
      badge: "from-pink-500/30 to-pink-900/20",
      iconColor: "text-pink-400",
      href: "AI_GAMING",
    },
    {
      key: "TECHNOLOGY",
      title: "Technology",
      subtitle: "Innovation & adoption",
      Icon: Cpu,
      badge: "from-orange-500/30 to-orange-900/20",
      iconColor: "text-orange-400",
      href: "TECHNOLOGY",
    },
  ];

  return (
    <div className="text-center mb-16">
      {/* Section Title */}
      <div className="inline-block px-4 py-2 border border-gray-800 rounded-full text-sm mb-8 text-gray-300">
        Market Categories
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-8 lg:px-20">
        {categories.map((cat, index) => {
          const count = categoryCounts[cat.key] || 0;
          return (
            <div
              key={index}
              onClick={() => router.push(`markets/category/${cat.href}`)}
              className="relative bg-[#0b0b0b] rounded-xl p-6 overflow-hidden shadow-inner 
                transition-all duration-300 ease-in-out 
                cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] group"
            >
              {/* Watermark Icon */}
              <cat.Icon className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 text-white/5 transition-all duration-300 group-hover:text-white/10" />

              {/* Top Row */}
              <div className="flex items-center justify-between mb-6">
                {/* Gradient Icon Badge */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat.badge} transition-all duration-300 group-hover:scale-110`}
                >
                  <cat.Icon className={`w-6 h-6 ${cat.iconColor}`} />
                </div>

                {/* Count */}
                <div className="text-right">
                  <div className="text-2xl font-semibold text-white">
                    {count}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Markets
                  </div>
                </div>
              </div>

              {/* Title + Subtitle */}
              <h3 className="text-lg font-semibold mb-1 text-white">
                {cat.title}
              </h3>
              <p className="text-gray-400 text-sm">{cat.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
