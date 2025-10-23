"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ReputationCardProps {
  tier?: string;
  score?: number;
  nextTier?: string;
  nextScore?: number;
  percentile?: number;
}

export default function SilverReputationCard({
  tier = "Silver",
  score = 3200,
  nextTier = "Gold",
  nextScore = 1800,
  percentile = 28.5,
}: ReputationCardProps) {
  const progress = Math.min((score / nextScore) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-[186.67px] h-[222.6px]"
    >
      <Card
        className="relative w-full h-full rounded-[14px] border border-white/10 
        p-[16.89px]
        bg-[linear-gradient(135deg,rgba(106,114,130,0.25)_0%,rgba(153,161,175,0.15)_50%,rgba(74,85,101,0.25)_100%)]
        backdrop-blur-[22px]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.12),_0_4px_16px_rgba(0,0,0,0.35)]
        flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Subtle light overlay for “waterish” depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />

        <CardContent className="p-0 flex flex-col items-center justify-center w-full text-center relative z-10">
          {/* Title */}
          <div className="text-[13px] text-white/90 font-medium mb-[6px] flex items-center gap-[6px]">
            <span className="opacity-60">◆</span>
            <span>{tier}</span>
            <span className="opacity-60">◆</span>
          </div>

          <p className="text-[11px] text-white/60 mb-[4px] tracking-wide">
            Reputation Score
          </p>

          {/* Score */}
          <motion.h1
            key={score}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="text-[40px] font-bold text-white leading-none mb-[10px]"
          >
            {score.toLocaleString()}
          </motion.h1>

          {/* Next Tier */}
          <div className="flex justify-between items-center w-full text-[11px] text-white/60 px-[2px] mb-[8px]">
            <span>
              Next: <span className="text-white/80">{nextTier}</span>
            </span>
            <span className="text-white/80 font-medium">{nextScore}</span>
          </div>

          {/* Progress */}
          <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden mb-[6px]">
            <motion.div
              className="h-full bg-white/70"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white/10 mb-[8px]" />

          <p className="text-[11px] text-white/60">
            Top{" "}
            <span className="text-white/80 font-semibold">{percentile}%</span>{" "}
            of all players
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
