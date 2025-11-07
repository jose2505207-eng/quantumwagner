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
    <Card
      className="
    relative flex flex-col md:flex-row justify-between items-center
    bg-gradient-to-b from-[#0d0d10]/90 to-[#0a0a14]/80
    border border-gray-800 rounded-2xl shadow-md
    p-8 w-full h-[320px] md:h-[250px] 
    max-w-6xl mx-auto
    backdrop-blur-xl
  "
    >
      {/* Border Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-transparent to-blue-500/20 border border-white/10 pointer-events-none"></div>

      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full blur-3xl opacity-40"></div>

      {/*  Stats Grid */}
      <div
        className="
          grid grid-cols-2 gap-3 sm:gap-4 
          w-full max-w-[340px] md:max-w-[600px] 
          relative z-10
        "
      >
        <div className="p-4 rounded-xl border border-green-700/30 bg-green-900/10 backdrop-blur-sm text-center md:text-left">
          <p className="text-xs text-gray-400">TOTAL WAGERED</p>
          <p className="text-lg font-semibold">
            ${p.total_wagged?.toLocaleString() ?? 0}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-blue-700/30 bg-blue-900/10 backdrop-blur-sm text-center md:text-left">
          <p className="text-xs text-gray-400">WIN RATE</p>
          <p className="text-lg font-semibold">{p.win_rate ?? 0}%</p>
        </div>

        <div className="p-4 rounded-xl border border-orange-700/30 bg-orange-900/10 backdrop-blur-sm text-center md:text-left">
          <p className="text-xs text-gray-400">CURRENT STREAK</p>
          <p className="text-lg font-semibold">{p.current_strak ?? 0}</p>
        </div>

        <div className="p-4 rounded-xl border border-yellow-700/30 bg-yellow-900/10 backdrop-blur-sm text-center md:text-left">
          <p className="text-xs text-gray-400">BATTLES WON</p>
          <p className="text-lg font-semibold">{p.battels_won ?? 0}</p>
        </div>
      </div>

      {/* RIGHT: Reputation Badge */}
      <div className="relative z-10 md:ml-auto">{renderBadge()}</div>
    </Card>
  );
}
