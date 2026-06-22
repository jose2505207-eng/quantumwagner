"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Honest error state — tells the user what failed and offers a retry. */
export function ErrorState({
  title = "Something glitched in the arena",
  description = "We couldn't reach the network. Check your connection and try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "qw-glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border-red-400/30 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-400/30">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
