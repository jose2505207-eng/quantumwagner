"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LevelDef } from "@/lib/game/types";
import { StatusPill } from "./StatusPill";
import { Check, Lock, ChevronRight, Zap } from "lucide-react";

type MissionState = "completed" | "active" | "locked";

interface MissionCardProps {
  level: LevelDef;
  state: MissionState;
  /** Override the CTA action (e.g. open wallet modal for level 1). */
  onAction?: () => void;
  className?: string;
}

/** A single mission tile in the map: shows level, copy, reward, and CTA. */
export function MissionCard({
  level,
  state,
  onAction,
  className,
}: MissionCardProps) {
  const isActive = state === "active";
  const isLocked = state === "locked";
  const isDone = state === "completed";

  const inner = (
    <div
      className={cn(
        "qw-glass relative flex items-center gap-4 rounded-2xl p-4 transition",
        isActive && "qw-glow border-violet-400/50",
        isLocked && "opacity-60",
        !isLocked && "qw-lift",
        className
      )}
    >
      {/* Level number medallion */}
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold",
          isDone && "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40",
          isActive && "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white",
          isLocked && "bg-white/5 text-zinc-500 ring-1 ring-white/10"
        )}
      >
        {isDone ? <Check size={18} /> : isLocked ? <Lock size={16} /> : level.level}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-bold text-white">
            {level.title}
          </h4>
          {isDone && <StatusPill status="resolved" label="DONE" />}
          {isActive && <StatusPill status="new" label="NOW" />}
          {isLocked && <StatusPill status="locked" />}
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-400">{level.mission}</p>
        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
          <Zap size={11} /> +{level.xp} XP
        </div>
      </div>

      {!isLocked && !isDone && (
        <ChevronRight size={18} className="shrink-0 text-violet-300" />
      )}
    </div>
  );

  if (isLocked) return inner;

  if (onAction) {
    return (
      <button onClick={onAction} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return (
    <Link href={level.href} className="block">
      {inner}
    </Link>
  );
}

export default MissionCard;
