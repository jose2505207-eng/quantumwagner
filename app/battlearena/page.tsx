"use client";

import { useMemo, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useAllBattles } from "@/app/utils/useAllBattles";
import { Spinner } from "@/components/custom/Spinner";
import { BattleHero } from "@/components/battlearena/battle-hero";
import { Background } from "@/components/background";
import { BattleCard } from "@/components/battlearena/battle-card";
import {
  BattleFilters,
  type BattleFilter,
} from "@/components/battlearena/battle-filters";
import { deriveBattleLifecycle } from "@/lib/battleStatus";

export default function TokenBattlesSection() {
  const { battles: allBattles, loading: allBattleLaoding } = useAllBattles();
  const wallet = useAnchorWallet();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BattleFilter>("all");

  const me = wallet?.publicKey?.toBase58();

  const visibleBattles = useMemo(() => {
    const term = query.trim().toLowerCase();

    return (allBattles ?? []).filter((battle) => {
      const d = battle.data;

      if (term) {
        const haystack = [d.title, d.description, d.sideAName, d.sideBName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (filter === "all") return true;

      // "My Battles" mirrors getUserBattles(): battles this wallet created.
      if (filter === "mine") {
        return Boolean(me) && d.creator?.toString() === me;
      }

      const lifecycle = deriveBattleLifecycle(d.status, d.startTime, d.endTime);
      if (filter === "live") return lifecycle === "live";
      // "Ended" covers everything past the point of taking bets.
      return (
        lifecycle === "ended" ||
        lifecycle === "resolved" ||
        lifecycle === "cancelled"
      );
    });
  }, [allBattles, query, filter, me]);

  if (allBattleLaoding)
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center gap-6">
        <Spinner />
        <div className="text-center space-y-2 animate-pulse">
          <h3 className="text-xl font-semibold text-white">Loading Battles...</h3>
          <p className="text-muted-foreground text-sm">
            Fetching battles from the chain
          </p>
        </div>
      </div>
    );

  const hasBattles = (allBattles?.length ?? 0) > 0;
  const hasMatches = visibleBattles.length > 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Background />

      <div className="relative z-10 container mx-auto px-4 pb-20 max-w-7xl">
        <BattleHero />

        <div className="mt-12">
          <BattleFilters
            query={query}
            onQueryChange={setQuery}
            filter={filter}
            onFilterChange={setFilter}
            walletConnected={Boolean(me)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {visibleBattles.map((battle, index: number) => (
              <BattleCard
                key={battle.pda.toString()}
                battle={battle}
                index={index}
              />
            ))}
          </div>

          {!hasBattles && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Battles Found
              </h3>
              <p className="text-muted-foreground">
                There are currently no active battles. Check back later!
              </p>
            </div>
          )}

          {/* Distinguish "nothing exists" from "nothing matches your filter" —
              otherwise a filter that hides everything looks like an outage. */}
          {hasBattles && !hasMatches && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No battles match your filters
              </h3>
              <p className="text-muted-foreground mb-6">
                Try a different search term or status.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
