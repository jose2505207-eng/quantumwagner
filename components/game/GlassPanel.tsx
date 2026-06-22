import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Add hover-lift interaction. */
  interactive?: boolean;
  /** Add a static neon glow. */
  glow?: boolean | "cyan";
}

/** Base glass surface for game cards and HUD panels. */
export function GlassPanel({
  interactive,
  glow,
  className,
  children,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "qw-glass",
        interactive && "qw-lift cursor-default",
        glow === "cyan" && "qw-glow-cyan",
        glow === true && "qw-glow",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlassPanel;
