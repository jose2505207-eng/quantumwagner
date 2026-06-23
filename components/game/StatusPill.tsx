import { cn } from "@/lib/utils";
import { StatusKind } from "@/lib/game/types";

const STYLES: Record<
  StatusKind,
  { label: string; cls: string; dot?: boolean }
> = {
  live: {
    label: "LIVE",
    cls: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
    dot: true,
  },
  hot: {
    label: "HOT",
    cls: "text-orange-300 border-orange-400/40 bg-orange-500/10",
  },
  new: {
    label: "NEW",
    cls: "text-cyan-300 border-cyan-400/40 bg-cyan-500/10",
  },
  locked: {
    label: "LOCKED",
    cls: "text-zinc-400 border-zinc-500/40 bg-zinc-500/10",
  },
  resolved: {
    label: "RESOLVED",
    cls: "text-violet-300 border-violet-400/40 bg-violet-500/10",
  },
  pending: {
    label: "PENDING",
    cls: "text-amber-300 border-amber-400/40 bg-amber-500/10",
  },
  won: {
    label: "WON",
    cls: "text-emerald-300 border-emerald-400/50 bg-emerald-500/15",
  },
  lost: {
    label: "LOST",
    cls: "text-red-300 border-red-400/40 bg-red-500/10",
  },
};

interface StatusPillProps {
  status: StatusKind;
  /** Override the default label text. */
  label?: string;
  className?: string;
}

/** Compact status chip: LIVE / HOT / NEW / LOCKED / RESOLVED / ... */
export function StatusPill({ status, label, className }: StatusPillProps) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        s.cls,
        className
      )}
    >
      {s.dot && <span className="qw-pulse-dot" aria-hidden />}
      {label ?? s.label}
    </span>
  );
}

export default StatusPill;
