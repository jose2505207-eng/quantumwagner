"use client";

import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { getNextRank, rankProgress } from "@/lib/game/ranks";
import { arenaLevelNumber, formatXp } from "@/lib/game/xp";
import { RankBadge } from "./RankBadge";
import { XPProgress } from "./XPProgress";
import { DemoBadge } from "./DemoBadge";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shimmer } from "./LoadingSkeleton";

interface PlayerHUDProps {
  className?: string;
  /** Compact mode for headers/sidebars. */
  compact?: boolean;
}

/** The player's status panel: level, rank, XP-to-next, streak. */
export function PlayerHUD({ className, compact }: PlayerHUDProps) {
  const hydrated = useHydrated();
  const xp = useGameStore((s) => s.xp);
  const completedLevels = useGameStore((s) => s.completedLevels);
  const streak = useGameStore((s) => s.streak);

  if (!hydrated) {
    return (
      <div className={cn("qw-glass rounded-2xl p-4", className)}>
        <Shimmer className="h-16 w-full" />
      </div>
    );
  }

  const level = arenaLevelNumber(completedLevels);
  const next = getNextRank(xp);
  const progress = rankProgress(xp);

  return (
    <div className={cn("qw-glass qw-glow rounded-2xl p-4", className)}>
      <div className="flex items-center gap-3">
        {/* Level orb */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
          <span className="text-[10px] font-bold uppercase opacity-80">lvl</span>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b0b12] bg-cyan-500 text-xs font-extrabold text-black">
            {level}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <RankBadge xp={xp} size="sm" />
            <DemoBadge label="LOCAL" note="Progress tracked locally on this device." />
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
            <span className="font-bold text-white">{formatXp(xp)} XP</span>
            <span className="inline-flex items-center gap-1">
              <Flame
                size={13}
                className={streak > 0 ? "text-orange-400" : "text-zinc-600"}
              />
              {streak}d streak
            </span>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3">
          <XPProgress
            value={progress}
            height="sm"
            caption={
              next
                ? `${formatXp(next.minXp - xp)} XP to ${next.name}`
                : "Max rank reached"
            }
          />
        </div>
      )}
    </div>
  );
}

export default PlayerHUD;
