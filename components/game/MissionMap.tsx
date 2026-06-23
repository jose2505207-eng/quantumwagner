"use client";

import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { LEVELS, isLevelUnlocked, getActiveLevel } from "@/lib/game/levels";
import { MissionCard } from "./MissionCard";
import { XPProgress } from "./XPProgress";
import { CardSkeleton } from "./LoadingSkeleton";
import { cn } from "@/lib/utils";
import { Map } from "lucide-react";

interface MissionMapProps {
  className?: string;
  /** Action override for the wallet-connect mission (level 1). */
  onConnectWallet?: () => void;
}

/** The 6-step journey map with locked/active/done states. */
export function MissionMap({ className, onConnectWallet }: MissionMapProps) {
  const hydrated = useHydrated();
  const completed = useGameStore((s) => s.completedLevels);

  if (!hydrated) {
    return (
      <div className={cn("space-y-3", className)}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const active = getActiveLevel(completed);
  const doneCount = completed.length;
  const progress = doneCount / LEVELS.length;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
          <Map size={15} className="text-violet-400" />
          Mission Map
        </h3>
        <span className="text-xs font-semibold text-zinc-500">
          {doneCount} / {LEVELS.length} cleared
        </span>
      </div>

      <XPProgress value={progress} height="sm" />

      <div className="space-y-2.5">
        {LEVELS.map((level) => {
          const isDone = completed.includes(level.id);
          const unlocked = isLevelUnlocked(level, completed);
          const isActive = !isDone && level.id === active.id;
          const state = isDone ? "completed" : isActive ? "active" : unlocked ? "active" : "locked";
          return (
            <MissionCard
              key={level.id}
              level={level}
              state={isDone ? "completed" : state === "locked" ? "locked" : "active"}
              onAction={
                level.id === "connect-wallet" && !isDone
                  ? onConnectWallet
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default MissionMap;
