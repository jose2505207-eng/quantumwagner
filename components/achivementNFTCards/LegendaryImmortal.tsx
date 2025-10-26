"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface LegendaryImmortalProps {
  locked?: boolean;
}

export default function LegendaryImmortal({
  locked = false,
}: LegendaryImmortalProps) {
  return (
    <Card
      className="
        relative 
        w-[378.67px] 
        h-[504.89px]
        rounded-[16px]
        overflow-hidden
        bg-[#000000]
        text-white
        border border-[#1a1a1a]
        pt-[23.33px] pr-[24px] pb-[24px] pl-[24px]
        flex flex-col justify-between
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "rgba(255, 105, 0, 1)" }}
            />
            <span className="text-[15px] font-medium text-[#FF6900]">Epic</span>
          </div>
        </div>
        <span className="text-[13px] text-gray-400">12mo ago</span>
      </div>

      {/* Center content (Image + Title) */}
      <div className="flex flex-col items-center justify-center flex-1 relative z-10">
        <div className="relative w-[150px] h-[150px] mb-6">
          <Image
            src="/immortal.png"
            alt="Oracle"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="text-[22px] font-bold tracking-wide text-white text-center">
          IMMORTAL
        </h2>
        <p className="text-[15px] text-gray-300 mt-1 text-center">
          100 Win Streak
        </p>
      </div>

      {/* Rewards Box */}
      <CardContent
        className="
          bg-[#0d0d0d]
          rounded-[12px]
          border border-[#1a1a1a]
          p-5
          relative z-10
          shrink-0
        "
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-[15px] text-gray-200 font-medium">Rewards</span>
          <span className="text-[13px] text-gray-500">4 perks</span>
        </div>
        <ul className="space-y-2 text-[14px] text-gray-300">
          <li className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "rgba(255, 105, 0, 1)" }}
            />
            10% Fee Discount
          </li>
          <li className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "rgba(255, 105, 0, 1)" }}
            />
            Legendary Status
          </li>
          <li className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "rgba(255, 105, 0, 1)" }}
            />
            All Features
          </li>
        </ul>
      </CardContent>

      {/* Locked Overlay */}
      {locked && (
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            bg-black/40
            backdrop-blur-[6px]
            z-20
          "
        >
          <div
            className="
              w-[100px] h-[100px]
              flex items-center justify-center
              rounded-full
              bg-white/10
              backdrop-blur-[10px]
              border border-white/20
              shadow-[0_0_12px_rgba(255,255,255,0.15)]
              mb-3
            "
          >
            <Lock
              size={40}
              className="text-white/85 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"
            />
          </div>
          <p className="text-[17px] font-semibold text-white/80 tracking-wide">
            Locked
          </p>
        </div>
      )}
    </Card>
  );
}
