"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { DAILY_QUESTS } from "@/lib/game/quests";
import { cn } from "@/lib/utils";
import { CalendarCheck, Check, Flame, Zap, ChevronRight } from "lucide-react";
import { CardSkeleton } from "./LoadingSkeleton";

interface DailyQuestsProps {
  className?: string;
  /** Auto check-in on mount (advances streak once per day). */
  autoCheckIn?: boolean;
}

/** Daily quest board with claim feedback + streak check-in. */
export function DailyQuests({ className, autoCheckIn = true }: DailyQuestsProps) {
  const hydrated = useHydrated();
  const claimedQuests = useGameStore((s) => s.claimedQuests);
  const lastQuestDay = useGameStore((s) => s.lastQuestDay);
  const streak = useGameStore((s) => s.streak);
  const lastCheckIn = useGameStore((s) => s.lastCheckIn);
  const claimQuest = useGameStore((s) => s.claimQuest);
  const checkIn = useGameStore((s) => s.checkIn);

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = lastCheckIn === today;

  useEffect(() => {
    if (hydrated && autoCheckIn && lastCheckIn !== today) checkIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return <CardSkeleton className={className} />;

  // claimed list is only valid for the current day
  const claimed = lastQuestDay === today ? claimedQuests : [];
  const doneCount = claimed.length;

  return (
    <div className={cn("qw-glass rounded-2xl p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
          <CalendarCheck size={15} className="text-cyan-400" />
          Daily Quests
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-300">
          <Flame size={13} />
          {streak} day{streak === 1 ? "" : "s"}
        </span>
      </div>

      {!checkedInToday && (
        <button
          onClick={checkIn}
          className="qw-shine mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:from-cyan-500 hover:to-blue-500"
        >
          <Flame size={15} /> Check in & keep your streak
        </button>
      )}

      <ul className="space-y-2">
        {DAILY_QUESTS.map((q) => {
          const isClaimed = claimed.includes(q.id);
          return (
            <li
              key={q.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3",
                isClaimed && "opacity-70"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isClaimed
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-violet-500/10 text-violet-300"
                )}
              >
                {isClaimed ? <Check size={16} /> : <Zap size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {q.title}
                </p>
                <p className="truncate text-xs text-zinc-500">{q.description}</p>
              </div>
              <div className="shrink-0">
                {isClaimed ? (
                  <span className="text-xs font-bold text-emerald-300">
                    +{q.xp} XP
                  </span>
                ) : q.kind === "derived" && q.href ? (
                  <Link
                    href={q.href}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-white/5"
                  >
                    Go <ChevronRight size={13} />
                  </Link>
                ) : (
                  <button
                    onClick={() => claimQuest(q.id)}
                    className="qw-shine rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white transition hover:from-violet-500 hover:to-fuchsia-500"
                  >
                    Claim +{q.xp}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-[11px] text-zinc-600">
        {doneCount}/{DAILY_QUESTS.length} done today · resets at midnight
      </p>
    </div>
  );
}

export default DailyQuests;
