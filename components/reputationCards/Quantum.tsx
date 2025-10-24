"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface ReputationCardProps {
  score?: number;
  nextTier?: string;
  nextScore?: number;
  percentile?: number;
}

export default function QuantumReputationCard({
  score = 87300,
  nextTier = "MAX",
  nextScore = 12700,
  percentile = 0.3,
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
          bg-[radial-gradient(circle_at_30%_30%,rgba(30,0,50,0.6),rgba(10,0,20,0.9)),linear-gradient(135deg,rgba(152,16,250,0.25)_0%,rgba(246,51,154,0.15)_50%,rgba(130,0,219,0.25)_100%)]
          backdrop-blur-[10px] flex items-center justify-center text-white overflow-hidden"
      >
        {/* Animated light overlay */}
        <motion.div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <CardContent className="p-0 flex flex-col items-center justify-center w-full text-center relative z-10">
          {/* Tier Title */}
          <div className="text-[#C280FF] font-medium text-[13px] mb-[6px] flex items-center gap-[6px]">
            <span>◆</span>
            <span>Quantum</span>
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
              className="h-full bg-gradient-to-r from-[#9810FA] via-[#F6339A] to-[#8200DB]"
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
            <span className="text-[#D28BFF] font-semibold">{percentile}%</span>{" "}
            of all players
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
