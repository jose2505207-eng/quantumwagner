import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import BettingButton from "../ui/betting-button";
import { useCountdown } from "@/app/utils/hooks/useCountDown";
import Link from "next/link";

interface MarketCardProps {
  market: any;
}

const MarketCard = ({ market }: MarketCardProps) => {
  const yesPool = Number(market.yes_pool || 0);
  const noPool = Number(market.no_pool || 0);
  const totalPool = yesPool + noPool;

  let yesOdds = 0;
  let noOdds = 0;

  if (totalPool > 0) {
    yesOdds = Math.round((yesPool / totalPool) * 100);
    noOdds = 100 - yesOdds;
  }

  // Dynamic trend logic
  let trend: "up" | "down" | "stable" = "stable";
  if (yesOdds > 55) {
    trend = "up";
  } else if (yesOdds < 45) {
    trend = "down";
  }

  const { days, hours, minutes, isExpired } = useCountdown(market.end_time);

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <div className="flex items-center justify-center px-3 py-1.5 rounded-full relative before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/80">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
        );
      case "down":
        return (
          <div className="flex items-center justify-center px-3 py-1.5 rounded-full relative before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/80">
            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center px-3 py-1.5 rounded-full relative before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-neutral-700/80 before:to-neutral-950 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-[22px] after:bg-[#181818]/80">
            <Minus className="w-4 h-4 text-neutral-400" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg lg:rounded-xl hover:border-primary/60 transition-all duration-300 ease-out group bg-[#0A0A0A]/50 backdrop-blur-sm hover:bg-[#0A0A0A]/80 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden h-full">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-20 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            {market.id.toString().startsWith("mock") && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">
                Mock
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-tight group-hover:text-primary/90 transition-colors duration-300 line-clamp-2">
            {market.question}
          </h3>
        </div>
        {getTrendIcon()}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center relative">
            <div className="text-2xl font-bold text-[#10B981] group-hover:scale-105 transition-transform duration-300">
              {yesOdds}%
            </div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide">
              YES
            </div>
            <div className="absolute -inset-2 bg-[#10B981]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </div>
          <div className="text-center relative">
            <div className="text-2xl font-bold text-[#EF4444] group-hover:scale-105 transition-transform duration-300">
              {noOdds}%
            </div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide">
              NO
            </div>
            <div className="absolute -inset-2 bg-[#EF4444]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </div>
        </div>

        <div className="relative h-2 rounded-full overflow-hidden before:absolute before:inset-0 before:-z-10 before:p-[1px] before:rounded-full before:bg-gradient-to-r before:from-neutral-700/60 before:to-neutral-900/60 before:content-[''] after:absolute after:inset-[1px] after:-z-10 after:rounded-full after:bg-[#181818]/60">
          <div
            className="h-full bg-gradient-to-r from-[#10B981] to-[#10B981]/80 rounded-full transition-all duration-700 ease-out shadow-sm group-hover:shadow-[#10B981]/20 group-hover:shadow-lg"
            style={{ width: `${yesOdds}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-2 rounded-lg group-hover:bg-foreground/5 transition-colors duration-300">
          <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
            {market.total_volume}
          </div>
          <div className="text-xs text-muted-foreground">Volume</div>
        </div>
        <div className="text-center p-2 rounded-lg group-hover:bg-foreground/5 transition-colors duration-300">
          <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300 flex items-center justify-center">
             {isExpired ? "Ended" : `${days}d ${hours}h ${minutes}m`}
          </div>
          <div className="text-xs text-muted-foreground">Time Left</div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <Link href={`/markets/${market.id}`} className="flex-1">
            <BettingButton variant="yes" size="sm" className="w-full">
            Bet YES
            </BettingButton>
        </Link>
        <Link href={`/markets/${market.id}`} className="flex-1">
            <BettingButton variant="no" size="sm" className="w-full">
            Bet NO
            </BettingButton>
        </Link>
      </div>
    </div>
  );
};

export default MarketCard;
