"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost" | "success" | "danger";
type Size = "sm" | "md" | "lg";

interface LuxuryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  full?: boolean;
}

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-[16px]",
};

/** Premium button. Gold = the single primary CTA per view (near-black ink). */
export function LuxuryButton({
  variant = "gold",
  size = "md",
  iconLeft,
  iconRight,
  full,
  className,
  children,
  ...rest
}: LuxuryButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold tracking-[0.01em] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants: Record<Variant, string> = {
    gold: "lux-btn-gold",
    ghost: "lux-btn-ghost",
    outline:
      "bg-transparent text-[var(--text-primary)] border border-[var(--border-gold)] hover:bg-[var(--surface-hover)]",
    success:
      "bg-[var(--qw-green-wash)] text-[var(--market-up)] border border-[color:rgba(52,211,153,0.4)] hover:shadow-[var(--glow-green)]",
    danger:
      "bg-[var(--qw-red-wash)] text-[var(--market-down)] border border-[color:rgba(229,72,77,0.4)] hover:shadow-[var(--glow-red)]",
  };

  return (
    <button
      className={cn(base, SIZE[size], variants[variant], full && "w-full", className)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

export default LuxuryButton;
