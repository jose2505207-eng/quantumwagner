"use client";
import React, { useEffect } from "react";
import { useMarketStore } from "@/store/adminMarketStore";
import MarketCategories from "@/components/MarketCategories";
import Faq from "@/components/marketing/Faq";
import MarketsHero from "@/components/market/MarketsHero";
import MarketsGrid from "@/components/market/MarketsGrid";
import TradingStats from "@/components/market/TradingStats";
import { useMarkets } from "@/lib/useMarkets";
import { DemoBadge, ErrorState, PlayerHUD } from "@/components/game";

export default function Markets() {
  const { markets, source, loading, error, reload } = useMarkets();
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

      {source === "demo" && (
        <div className="mx-auto mt-6 flex w-full max-w-6xl items-center gap-2 px-4">
          <DemoBadge note="No live markets returned — showing seed data." />
          <span className="text-xs text-zinc-400">
            Showing demo markets — the live backend returned none.
          </span>
        </div>
      )}

      {error && source !== "demo" ? (
        <div className="px-4 py-10">
          <ErrorState
            description={`We couldn't reach the markets service. ${error}`}
            onRetry={reload}
          />
        </div>
      ) : (
        <MarketsGrid markets={markets} loading={loading} />
      )}

      <TradingStats />
      <Faq />
    </div>
  );
}
