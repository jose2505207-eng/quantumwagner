"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LuxuryCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover lift to a gold border + deeper shadow. */
  interactive?: boolean;
  /** Static restrained gold glow + gold border (premium card). */
  glow?: boolean;
  /** Frosted glass terminal panel variant. */
  glass?: boolean;
  padding?: number;
}

/** Graphite surface, hairline border, top-light sheen — the base luxury panel. */
export function LuxuryCard({
  interactive,
  glow,
  glass,
  padding = 22,
  className,
  style,
  children,
  ...rest
}: LuxuryCardProps) {
  return (
    <div
      className={cn(
        glass ? "lux-glass" : "lux-card",
        interactive && "lux-lift",
        glow && "lux-gold-border lux-glow-gold",
        className
      )}
      style={{ padding, ...style }}
      {...rest}
    >
      {/* content sits above the ::before sheen */}
      <div className="relative">{children}</div>
    </div>
  );
}

export default LuxuryCard;
