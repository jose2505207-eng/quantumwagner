"use client";

import { Background } from "@/components/background";
import Hero from "@/components/marketing/Hero";
import PopularMarkets from "@/components/marketing/PopularMarkets";
import Faq from "@/components/marketing/Faq";
import MarketCardSkeleton from "@/components/marketing/MarketCardSkeleton";
import { useMarkets } from "@/lib/useMarkets";
import { motion } from "framer-motion";

// Original marketing home ("the very first UI"). Data comes from the honest
// useMarkets hook (live backend, badged demo fallback) — no silent mock merge.
export default function Home() {
  const { markets, loading } = useMarkets();

  // Headline an explicitly-featured market when one exists, else the newest.
  const featured = markets.find((m) => m.featured) ?? markets[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen text-white relative overflow-hidden"
    >
      <Background />
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-10 bg-top bg-no-repeat bg-contain"
        style={{ backgroundImage: "url('/variant.png')" }}
      />

      <main className="relative z-10 w-full">
        <Hero featured={featured} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <p className="text-muted-foreground text-lg animate-pulse">
              Loading markets...
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-4 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <MarketCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <PopularMarkets markets={markets} />
            <Faq />
          </>
        )}
      </main>
    </motion.div>
  );
}
