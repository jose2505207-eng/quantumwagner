"use client";

import { Button } from "@/components/custom/primary";
import Faq from "@/components/landing/FAQ";
import HeroSection from "@/components/landing/Hero";
import MarketCard from "@/components/market/MarketCard";
import { useMarketStore } from "@/store/adminMarketStore";
import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const route = useRouter();
  const { markets, setMarkets } = useMarketStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8000/api/markets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMarkets(res.data.data.markets);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-black text-white"
    >
      <div className="min-h-screen text-white relative">
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <HeroSection />

          {loading ? (
            // Pleasant Loading State
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-400 text-lg animate-pulse">
                Loading markets...
              </p>

              {/* Skeleton Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl border border-gray-700 bg-gray-800/30 animate-pulse"
                  >
                    <div className="h-5 w-2/3 bg-gray-700 rounded mb-4"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-6 w-10 bg-gray-700 rounded"></div>
                      <div className="h-6 w-10 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-1/2 bg-gray-700 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gray-700 rounded"></div>
                      <div className="flex-1 h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Featured Markets */}
              {markets.some((m) => m.featured) && (
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Featured Markets</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {markets
                      .filter((m) => m.featured)
                      .map((market) => (
                        <MarketCard key={market.id} market={market} />
                      ))}
                  </div>
                </section>
              )}

              {/* Popular Markets */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Popular Markets</h2>
                    <p className="text-purple-400">Trade with confidence</p>
                  </div>
                  <p className="text-gray-400 text-sm max-w-xs text-right">
                    Join thousands of traders making predictions on the most
                    exciting crypto markets.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets
                    .filter((m) => !m.featured) // show only non-featured
                    .map((market) => (
                      <MarketCard key={market.id} market={market} />
                    ))}
                </div>

                <div className="text-center mt-8">
                  <Button onClick={() => route.push("/markets")}>
                    View All Markets
                  </Button>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="mb-12">
                <Faq />
              </section>
            </>
          )}
        </main>
      </div>
    </motion.div>
  );
}
