"use client";

import { useLeaderboard } from "@/lib/useLeaderboard";
import { RankBadge } from "@/components/game/RankBadge";
import { CardSkeleton } from "@/components/game/LoadingSkeleton";
import { EmptyState } from "@/components/game/EmptyState";
import { ErrorState } from "@/components/game/ErrorState";
import { formatXp } from "@/lib/game/xp";
import { cn } from "@/lib/utils";
import { Trophy, Crown } from "lucide-react";

function shorten(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

/**
 * Real leaderboard fed by the backend (active season, XP/wins computed from
 * persisted actions). This is live data, not mock.
 */
export function LiveLeaderboard({ className }: { className?: string }) {
  const { rows, season, loading, error, reload } = useLeaderboard();

  if (loading) return <CardSkeleton className={className} />;
  if (error)
    return (
      <ErrorState
        className={className}
        title="Leaderboard offline"
        description={`Couldn't load standings. ${error}`}
        onRetry={reload}
      />
    );
  if (!rows.length)
    return (
      <EmptyState
        className={className}
        icon={<Trophy size={26} />}
        title="No challengers yet"
        description="Place predictions and win to claim the top of the arena. Seed the database to preview standings."
        cta={{ label: "Open Markets", href: "/markets" }}
      />
    );

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
          <Trophy size={15} className="text-amber-400" />
          {season?.name ?? "Season"} · Live Standings
        </h3>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3">
        {podium.map((r) => (
          <div
            key={r.userId}
            className={cn(
              "qw-glass flex flex-col items-center gap-1 rounded-2xl p-4 text-center",
              r.rank === 1 && "qw-glow"
            )}
          >
            {r.rank === 1 ? (
              <Crown className="text-amber-400" size={20} />
            ) : (
              <span className="text-lg font-black text-zinc-500">#{r.rank}</span>
            )}
            <span className="truncate text-sm font-bold text-white">
              {r.username ?? shorten(r.wallet)}
            </span>
            <RankBadge xp={r.xp} size="sm" />
            <span className="text-xs font-bold text-amber-300">
              {formatXp(r.xp)} XP
            </span>
          </div>
        ))}
      </div>

      {/* Rest */}
      {rest.length > 0 && (
        <ul className="qw-glass divide-y divide-white/5 rounded-2xl">
          {rest.map((r) => (
            <li
              key={r.userId}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                r.isYou && "bg-violet-500/10"
              )}
            >
              <span className="w-6 text-sm font-bold text-zinc-500">{r.rank}</span>
              <span className="flex-1 truncate text-sm font-medium text-white">
                {r.username ?? shorten(r.wallet)}
                {r.isYou && (
                  <span className="ml-2 text-[10px] font-bold uppercase text-violet-300">
                    you
                  </span>
                )}
              </span>
              <RankBadge xp={r.xp} size="sm" />
              <span className="text-xs font-bold text-zinc-300">
                {formatXp(r.xp)} XP
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LiveLeaderboard;
