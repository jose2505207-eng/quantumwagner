"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ReputationCardProps {
  score?: number;
  nextTier?: string;
  nextScore?: number;
  percentile?: number;
}

export default function PlatinumReputationCard({
  score = 18750,
  nextTier = "Diamond",
  nextScore = 6250,
  percentile = 5.2,
}: ReputationCardProps) {
  const totalNeeded = score + nextScore;
  const progress = Math.min((score / totalNeeded) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-[186.67px] h-[222.6px]"
    >
      <Card
        className="relative w-full h-full 
        rounded-[14px] border border-white/10
        p-[16.89px] opacity-100
        bg-[linear-gradient(135deg,rgba(144,161,185,0.2)_0%,rgba(209,213,220,0.1)_50%,rgba(98,116,142,0.2)_100%)]
        backdrop-blur-[8px]
        flex items-center justify-center text-white"
      >
        <CardContent className="p-0 flex flex-col items-center justify-center w-full text-center">
          {/* Tier Title */}
          <div className="text-[#C8D3E2] font-medium text-[13px] mb-[6px] flex items-center gap-[6px]">
            <span>◆</span>
            <span>Platinum</span>
            <span>◆</span>
          </div>

          {/* Subtitle */}
          <p className="text-[11.5px] text-gray-400 mb-[3px] tracking-wide">
            Reputation Score
          </p>

          {/* Score */}
          <motion.h1
            key={score}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[41px] font-bold text-white leading-none mb-[12px]"
          >
            {score.toLocaleString()}
          </motion.h1>

          {/* Next Tier */}
          <div className="flex justify-between items-center w-full text-[11.5px] text-gray-400 px-[2px] mb-[8px]">
            <span>
              Next: <span>{nextTier}</span>
            </span>
            <span className="text-gray-300 font-medium">{nextScore}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden mb-[4px]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D1D5DC] via-[#AAB6C8] to-[#7A889B]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white/10 mb-[10px] mt-2" />

          {/* Percentile */}
          <p className="text-[11.5px] text-gray-400">
            Top{" "}
            <span className="text-[#C8D3E2] font-semibold">{percentile}%</span>{" "}
            of all players
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
