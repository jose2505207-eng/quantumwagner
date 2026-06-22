"use client";

import { cn } from "@/lib/utils";

interface XPProgressProps {
  /** 0..1 fraction. */
  value: number;
  label?: string;
  /** Right-aligned caption, e.g. "1.2K / 1.5K XP". */
  caption?: string;
  className?: string;
  height?: "sm" | "md";
}

/** Animated neon progress bar used for XP / rank / mission progress. */
export function XPProgress({
  value,
  label,
  caption,
  className,
  height = "md",
}: XPProgressProps) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className={cn("w-full", className)}>
      {(label || caption) && (
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
          {label && <span className="text-zinc-300">{label}</span>}
          {caption && <span className="text-zinc-500">{caption}</span>}
        </div>
      )}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10",
          height === "sm" ? "h-1.5" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "progress"}
      >
        <div
          className="qw-bar-fill h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default XPProgress;
