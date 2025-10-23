"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ReputationCardProps {
  score?: number;
  nextTier?: string;
  nextScore?: number;
  percentile?: number;
}

export default function GoldReputationCard({
  score = 7800,
  nextTier = "Platinum",
  nextScore = 2200,
  percentile = 12.3,
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
        className="relative w-full h-full rounded-[14px] border border-white/10 p-[16.89px]
        shadow-[0_0_25px_rgba(0,0,0,0.4)] flex items-center justify-center text-white overflow-hidden"
      >
        {/* Frosted Blur Layer */}
        <div className="absolute inset-0 backdrop-blur-[8px]" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(208,135,0,0.2)_0%,rgba(255,105,0,0.1)_50%,rgba(166,95,0,0.2)_100%)] opacity-100" />

        {/* Content */}
        <CardContent className="relative z-10 p-0 flex flex-col items-center justify-center w-full text-center">
          {/* Tier Title */}
          <div className="text-[#D6A842] font-medium text-[13px] mb-[6px] flex items-center gap-[6px]">
            <span>◆</span>
            <span>Gold</span>
            <span>◆</span>
          </div>

          {/* Subtitle */}
          <p className="text-[11.5px] text-gray-300 mb-[3px] tracking-wide">
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
          <div className="flex justify-between items-center w-full text-[11.5px] text-gray-300 px-[2px] mb-[8px]">
            <span>
              Next: <span>{nextTier}</span>
            </span>
            <span className="font-medium">{nextScore}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden mb-[4px]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D6A842] via-[#B6761B] to-[#8B5300]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white/10 mb-[10px] mt-2" />

          {/* Percentile */}
          <p className="text-[11.5px] text-gray-300">
            Top{" "}
            <span className="text-[#D6A842] font-semibold">{percentile}%</span>{" "}
            of all players
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
