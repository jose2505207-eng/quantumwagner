import { cn } from "@/lib/utils";
import { getRank } from "@/lib/game/ranks";
import { RankId } from "@/lib/game/types";
import { RANK_BY_ID } from "@/lib/game/ranks";
import { Shield } from "lucide-react";

interface RankBadgeProps {
  /** Provide either an explicit rank id or an XP value to derive it. */
  rankId?: RankId;
  xp?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const ICON = { sm: 11, md: 13, lg: 16 };

/** Rank chip with the rank's accent colour as a neon glow. */
export function RankBadge({
  rankId,
  xp = 0,
  size = "md",
  className,
}: RankBadgeProps) {
  const rank = rankId ? RANK_BY_ID[rankId] : getRank(xp);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold uppercase tracking-wide",
        SIZE[size],
        className
      )}
      style={{
        color: rank.color,
        borderColor: `${rank.color}66`,
        background: `${rank.color}1a`,
        boxShadow: `0 0 16px -6px ${rank.color}`,
      }}
    >
      <Shield size={ICON[size]} aria-hidden />
      {rank.name}
    </span>
  );
}

export default RankBadge;
