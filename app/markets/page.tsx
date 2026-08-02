"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useMarketStore } from "@/store/adminMarketStore";
import MarketCategories from "@/components/MarketCategories";
import Faq from "@/components/marketing/Faq";
import MarketsHero from "@/components/market/MarketsHero";
import MarketsGrid from "@/components/market/MarketsGrid";
import TradingStats from "@/components/market/TradingStats";
import { useMarkets } from "@/lib/useMarkets";
import { ErrorState, PlayerHUD } from "@/components/game";

export default function Markets() {
  const { markets, loading, error, reload } = useMarkets();
  const setMarkets = useMarketStore((s) => s.setMarkets);

  // Keep the shared store in sync for components that read from it.
  useEffect(() => {
    setMarkets(markets);
  }, [markets, setMarkets]);

  return (
    <div className="w-full relative flex flex-col pt-16 overflow-hidden">
      <MarketsHero />
      <div className="-mt-20 lg:-mt-32 relative z-10">
        <MarketCategories />
      </div>

      <div className="mx-auto mt-6 w-full max-w-6xl px-4">
        <PlayerHUD />
      </div>

      {/* Anyone can open a market — it is their own on-chain transaction. */}
      <div className="mx-auto mt-6 flex w-full max-w-6xl justify-end px-4">
        <Link
          href="/markets/new"
          className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-200 transition-colors hover:bg-purple-500/20"
        >
          <Plus className="h-4 w-4" />
          Create a market
        </Link>
      </div>

      {error ? (
        <div className="px-4 py-10">
          <ErrorState
            description={`We couldn't reach the markets service. ${error}`}
            onRetry={reload}
          />
        </div>
      ) : (
        <div id="markets-grid" className="scroll-mt-24">
          <MarketsGrid markets={markets} loading={loading} />
        </div>
      )}

      <TradingStats />
      <Faq />
    </div>
  );
}
