import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  /** Teach the user what to do — empty states should onboard, not dead-end. */
  description: string;
  cta?: { label: string; href: string };
  className?: string;
}

/** Teaching empty state — never a blank screen. */
export function EmptyState({
  icon,
  title,
  description,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "qw-glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/30">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          className="qw-shine mt-2 inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white transition hover:from-violet-500 hover:to-fuchsia-500"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
