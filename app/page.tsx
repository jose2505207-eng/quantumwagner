"use client";
import DiamondReputationCard from "@/components/reputationCards/Dimond";
import GoldReputationCard from "@/components/reputationCards/Gold";
import PlatinumReputationCard from "@/components/reputationCards/Platinum";

export default function DashBoard() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <DiamondReputationCard nextScore={10000} score={3000} nextTier="Platinum" />
    </div>
  );
}
