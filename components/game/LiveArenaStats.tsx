"use client";

import { cn } from "@/lib/utils";
import { DemoBadge } from "./DemoBadge";
import { Shimmer } from "./LoadingSkeleton";
import { Activity, Users, Coins, Swords } from "lucide-react";
import { ReactNode } from "react";

export interface ArenaStat {
  label: string;
  value: ReactNode;
  /** Mark when the value is demo/seed rather than live. */
  demo?: boolean;
  icon?: "activity" | "users" | "coins" | "swords";
  /** Show the live pulse dot. */
  live?: boolean;
}

const ICONS = {
  activity: Activity,
  users: Users,
  coins: Coins,
  swords: Swords,
};

interface LiveArenaStatsProps {
  stats: ArenaStat[];
  loading?: boolean;
  className?: string;
}

/** Row of live arena metric tiles. Demo values are clearly labelled. */
export function LiveArenaStats({ stats, loading, className }: LiveArenaStatsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4",
        className
      )}
    >
      {(loading ? Array.from({ length: 4 }) : stats).map((raw, i) => {
        const stat = raw as ArenaStat | undefined;
        const Icon = stat?.icon ? ICONS[stat.icon] : Activity;
        return (
          <div
            key={stat?.label ?? i}
            className="qw-glass qw-lift rounded-2xl p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <Icon size={16} className="text-violet-300" />
              <div className="flex items-center gap-1.5">
                {stat?.live && <span className="qw-pulse-dot" aria-hidden />}
                {stat?.demo && <DemoBadge note="Demo metric — not live data." />}
              </div>
            </div>
            {loading || !stat ? (
              <Shimmer className="h-7 w-20" />
            ) : (
              <div className="text-xl font-extrabold text-white">
                {stat.value}
              </div>
            )}
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">
              {stat?.label ?? <Shimmer className="mt-1 h-3 w-14" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LiveArenaStats;
