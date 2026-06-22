"use client";

import { Background } from "@/components/background";
import ArenaHero from "@/components/landing/ArenaHero";
import Faq from "@/components/marketing/Faq";
import MarketCard from "@/components/marketing/MarketCard";
import {
  PlayerHUD,
  MissionMap,
  DailyQuests,
  LiveArenaStats,
  ArenaStat,
  DemoBadge,
  EmptyState,
  ErrorState,
  CardGridSkeleton,
} from "@/components/game";
import { useMarkets } from "@/lib/useMarkets";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Target, ArrowRight } from "lucide-react";

export default function Home() {
  const { markets, source, loading, error, reload } = useMarkets();
  const { setVisible } = useWalletModal();

  const featured = markets.slice(0, 6);

  const stats: ArenaStat[] = [
    {
      label: "Live Markets",
      value: loading ? "—" : `${markets.length}`,
      icon: "activity",
      live: source === "live",
      demo: source === "demo",
    },
    { label: "Players Online", value: "—", icon: "users", demo: true },
    { label: "Arena Volume", value: "—", icon: "coins", demo: true },
    { label: "Battles Live", value: "—", icon: "swords", demo: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden text-white"
    >
      <Background />
      <div className="qw-grid-bg pointer-events-none absolute inset-0 -z-10" />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24">
        <ArenaHero />

        {/* Live arena pulse */}
        <section className="mb-12">
          <LiveArenaStats stats={stats} loading={loading} />
        </section>

        {/* Your Arena: progression + quests */}
        <section className="mb-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <PlayerHUD />
            <div id="daily-quests" className="scroll-mt-24">
              <DailyQuests />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="qw-glass rounded-2xl p-5">
              <MissionMap onConnectWallet={() => setVisible(true)} />
            </div>
          </div>
        </section>

        {/* Live markets */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                <Flame className="text-fuchsia-400" />
                Hot Markets
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                Back your read. Earn XP on every move.
                {source === "demo" && (
                  <DemoBadge note="No live markets returned — showing seed data." />
                )}
              </p>
            </div>
            <Link
              href="/markets"
              className="hidden items-center gap-1 text-sm font-semibold text-violet-300 hover:text-violet-200 sm:inline-flex"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <CardGridSkeleton count={6} />
          ) : error && source !== "demo" ? (
            <ErrorState
              description={`We couldn't reach the markets service. ${error}`}
              onRetry={reload}
            />
          ) : featured.length === 0 ? (
            <EmptyState
              icon={<Target size={26} />}
              title="No markets yet"
              description="The arena is warming up. Be the first to create a market and set the odds."
              cta={{ label: "Create a market", href: "/admin" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((market, index) => (
                <div key={market.id || index} className="relative">
                  {source === "demo" && (
                    <DemoBadge className="absolute right-3 top-3 z-10" />
                  )}
                  <MarketCard market={market} />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-20">
          <Faq />
        </div>
      </main>
    </motion.div>
  );
}
