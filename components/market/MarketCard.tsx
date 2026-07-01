import CountdownTimer from "@/app/utils/hooks/CountdownTimer";
import Link from "next/link";
import BettingButton from "../ui/betting-button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Users,
  DollarSign,
} from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const MarketCard = ({ market }) => {
  const yesPool = Number(market.yes_pool || 0);
  const noPool = Number(market.no_pool || 0);

  let yesOdds = 0;
  let noOdds = 0;

  if (yesPool === 0 && noPool === 0) {
    yesOdds = 0;
    noOdds = 0;
  } else {
    const totalPool = yesPool + noPool;
    yesOdds = Math.round((yesPool / totalPool) * 100);
    noOdds = 100 - yesOdds;
  }

  // Trend is not in the backend data yet; default to stable until wired.
  // (`as` keeps the union type so the up/down branches remain valid code.)
  const trend = "stable" as "up" | "down" | "stable";
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-[#10B981]" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-[#EF4444]" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-400" />;
    }
  };

  const volume = (Number(market.total_volume) / LAMPORTS_PER_SOL).toFixed(2) + " SOL";
  // Real participant count from the backend (positions). Was a Math.random() mock
  // that both fabricated data and caused an SSR/client hydration mismatch.
  const traders = market._count?.positions ?? 0;

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="flex flex-col p-6 border border-border/60 rounded-xl hover:border-primary/60 transition-all duration-300 ease-out group bg-[#0A0A0A]/50 backdrop-blur-sm hover:bg-[#0A0A0A]/80 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden cursor-pointer h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-xs text-primary/80 font-medium mb-2 uppercase tracking-wide">
              {market.category}
            </div>
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary/90 transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
              {market.question}
            </h3>
          </div>
          <div className="flex items-center justify-center p-2 rounded-full bg-foreground/5 group-hover:bg-foreground/10 transition-colors duration-300 ml-2">
            {getTrendIcon()}
          </div>
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
            </div>
            <div className="text-center relative">
              <div className="text-2xl font-bold text-[#EF4444] group-hover:scale-105 transition-transform duration-300">
                {noOdds}%
              </div>
              <div className="text-xs text-muted-foreground mt-1 tracking-wide">
                NO
              </div>
            </div>
          </div>

          <div className="relative h-2 rounded-full overflow-hidden bg-neutral-900/60">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#10B981]/80 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${yesOdds}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg group-hover:bg-foreground/5 transition-colors duration-300">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Volume</div>
            </div>
            <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
              {volume}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg group-hover:bg-foreground/5 transition-colors duration-300">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Traders</div>
            </div>
            <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
              {traders}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg group-hover:bg-foreground/5 transition-colors duration-300">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Left</div>
            </div>
            <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
              <CountdownTimer endTime={market.end_time} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <BettingButton variant="yes" size="sm" className="flex-1">
            Bet YES
          </BettingButton>
          <BettingButton variant="no" size="sm" className="flex-1">
            Bet NO
          </BettingButton>
        </div>
      </div>
    </Link>
  );
};

export default MarketCard;
