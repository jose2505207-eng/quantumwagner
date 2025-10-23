"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ReputationCardProps {
  score?: number;
  nextTier?: string;
  nextScore?: number;
  percentile?: number;
}

export default function DiamondReputationCard({
  score = 42500,
  nextTier = "Quantum",
  nextScore = 7500,
  percentile = 1.8,
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
        {/* Background Frosted Layer */}
        <div className="absolute inset-0 backdrop-blur-[8px]" />

        {/* Gradient Base (Diamond blue tones) */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,184,219,0.25)_0%,rgba(81,162,255,0.1)_50%,rgba(0,146,184,0.25)_100%)]" />

        {/* Liquid Shine Layer */}
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25)_0%,transparent_60%)] mix-blend-overlay"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle reflection sweep */}
        <motion.div
          className="absolute -top-1/2 left-0 w-[150%] h-[200%] bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,transparent_60%)] opacity-20"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <CardContent className="relative z-10 p-0 flex flex-col items-center justify-center w-full text-center">
          {/* Tier Title */}
          <div className="text-[#00B8DB] font-medium text-[13px] mb-[6px] flex items-center gap-[6px]">
            <span>◆</span>
            <span>Diamond</span>
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
            <span className="font-medium">{nextScore.toLocaleString()}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden mb-[4px]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00B8DB] via-[#4EC3FF] to-[#0092B8]"
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
            <span className="text-[#00B8DB] font-semibold">{percentile}%</span>{" "}
            of all players
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
