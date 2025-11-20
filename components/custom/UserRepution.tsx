import { Card } from "@/components/ui/card";
import BronzeReputationCard from "../reputationCards/Bronze";
import SilverReputationCard from "../reputationCards/Silver";
import GoldReputationCard from "../reputationCards/Gold";
import PlatinumReputationCard from "../reputationCards/Platinum";
import DiamondReputationCard from "../reputationCards/Dimond";
import QuantumReputationCard from "../reputationCards/Quantum";

interface Props {
  name?: string;
  total_wagged?: number;
  win_rate: string;
  current_strak?: number;
  battels_won: string;
  reputation_score: number;
}

export default function ProfileCard(p: Props) {
  const rank =
    p.reputation_score && p.reputation_score >= 50000
      ? "Quantum"
      : p.reputation_score && p.reputation_score >= 40000
      ? "Diamond"
      : p.reputation_score && p.reputation_score >= 30000
      ? "Platinum"
      : p.reputation_score && p.reputation_score >= 20000
      ? "Gold"
      : p.reputation_score && p.reputation_score >= 10000
      ? "Silver"
      : "Bronze";

  const renderBadge = () => {
    switch (rank) {
      case "Bronze":
        return (
          <BronzeReputationCard
            score={p.reputation_score ?? 0}
            nextTier="Silver"
            nextScore={10000}
            percentile={70}
          />
        );
      case "Silver":
        return (
          <SilverReputationCard
            score={p.reputation_score ?? 0}
            nextTier="Gold"
            nextScore={20000}
            percentile={50}
          />
        );
      case "Gold":
        return (
          <GoldReputationCard
            score={p.reputation_score ?? 0}
            nextTier="Platinum"
            nextScore={30000}
            percentile={30}
          />
        );
      case "Platinum":
        return (
          <PlatinumReputationCard
            score={p.reputation_score ?? 0}
            nextTier="Diamond"
            nextScore={40000}
            percentile={10}
          />
        );
      case "Diamond":
        return (
          <DiamondReputationCard
            score={p.reputation_score ?? 0}
            nextTier="Quantum"
            nextScore={50000}
            percentile={5}
          />
        );
      case "Quantum":
        return (
          <QuantumReputationCard
            score={p.reputation_score ?? 0}
            nextTier="Max"
            nextScore={99999}
            percentile={1}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between gap-6">
      {/* BADGE - Centered and prominent */}
      <div className="relative z-10 w-full flex justify-center">
        {renderBadge()}
      </div>

      {/* STATS GRID - Compact below badge */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center hover:bg-white/5 transition-colors group">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 group-hover:text-gray-400">Wagered</p>
          <p className="text-sm font-bold text-white truncate">
            ${p.total_wagged?.toLocaleString() ?? 0}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center hover:bg-white/5 transition-colors group">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 group-hover:text-gray-400">Win Rate</p>
          <p className="text-sm font-bold text-green-400">
            {p.win_rate ?? 0}%
          </p>
        </div>

        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center hover:bg-white/5 transition-colors group">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 group-hover:text-gray-400">Streak</p>
          <p className="text-sm font-bold text-orange-400">
            {p.current_strak ?? 0}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center hover:bg-white/5 transition-colors group">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 group-hover:text-gray-400">Wins</p>
          <p className="text-sm font-bold text-yellow-400">
            {p.battels_won ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
