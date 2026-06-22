import { cn } from "@/lib/utils";
import { FlaskConical } from "lucide-react";
import { LOCAL_PROGRESS_NOTE } from "@/lib/game/config";

interface DemoBadgeProps {
  className?: string;
  /** Custom tooltip/title text. */
  note?: string;
  label?: string;
}

/**
 * Honesty label. Render this anywhere demo/seed/local data is shown so the user
 * is never tricked into thinking mock data is real backend/chain state.
 */
export function DemoBadge({ className, note, label = "DEMO" }: DemoBadgeProps) {
  return (
    <span
      title={note ?? LOCAL_PROGRESS_NOTE}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300",
        className
      )}
    >
      <FlaskConical size={11} aria-hidden />
      {label}
    </span>
  );
}

export default DemoBadge;
