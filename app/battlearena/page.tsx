"use client";

import { useAllBattles } from "@/app/utils/useAllBattles";
import { Spinner } from "@/components/custom/Spinner";
import { BattleHero } from "@/components/battlearena/battle-hero";
import { Background } from "@/components/background";
import { BattleCard } from "@/components/battlearena/battle-card";
import { BattleFilters } from "@/components/battlearena/battle-filters";

export default function TokenBattlesSection() {
  const { battles: allBattles, loading: allBattleLaoding } = useAllBattles();

  if (allBattleLaoding)
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center gap-6">
        <Spinner />
        <div className="text-center space-y-2 animate-pulse">
          <h3 className="text-xl font-semibold text-white">Loading Battles...</h3>
          <p className="text-muted-foreground text-sm">
            Please connect your wallet to view available battles
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 pb-20 max-w-7xl">
        <BattleHero />

        <div className="mt-12">
          <BattleFilters />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {allBattles?.map((battle, index: number) => (
              <BattleCard 
                key={index} 
                battle={battle} 
                index={index} 
              />
            ))}
          </div>

          {allBattles?.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Battles Found</h3>
              <p className="text-muted-foreground">
                There are currently no active battles. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
