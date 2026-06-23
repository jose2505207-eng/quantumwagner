import { cn } from "@/lib/utils";

/** Shimmering placeholder block. */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/5",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className
      )}
    />
  );
}

/** Card-shaped loading skeleton matching the game card layout. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("qw-glass space-y-4 rounded-2xl p-5", className)}>
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-20" />
        <Shimmer className="h-5 w-12" />
      </div>
      <Shimmer className="h-6 w-4/5" />
      <Shimmer className="h-2.5 w-full rounded-full" />
      <div className="flex gap-3">
        <Shimmer className="h-10 flex-1 rounded-xl" />
        <Shimmer className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

/** Grid of card skeletons for list loading states. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default CardSkeleton;
