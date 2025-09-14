"use client";

import { cn } from "@/lib/utils/utils";

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
      {/* Radial gradient glow */}
      <div
        className={cn(
          "absolute h-[600px] w-[600px] rounded-full",
          "bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.3),_transparent_70%)]",
          "blur-3xl"
        )}
      />
      {/* Extra subtle purple edge gradient */}
      <div
        className={cn(
          "absolute h-[1000px] w-[1000px] rounded-full",
          "bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15),_transparent_80%)]",
          "blur-2xl"
        )}
      />
    </div>
  );
}
