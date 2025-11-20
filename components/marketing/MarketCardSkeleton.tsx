import React from "react";

const MarketCardSkeleton = () => {
  return (
    <div className="flex flex-col p-4 lg:p-6 border border-border/60 rounded-lg lg:rounded-xl bg-[#0A0A0A]/50 backdrop-blur-sm relative overflow-hidden h-full">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <div className="h-6 bg-neutral-800 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-6 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
      </div>

      {/* Odds Skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-12 bg-neutral-800 rounded animate-pulse"></div>
            <div className="h-3 w-8 bg-neutral-800 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-12 bg-neutral-800 rounded animate-pulse"></div>
            <div className="h-3 w-8 bg-neutral-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Progress Bar Skeleton */}
        <div className="h-2 bg-neutral-800 rounded-full w-full animate-pulse"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center gap-2 p-2">
          <div className="h-4 w-12 bg-neutral-800 rounded animate-pulse"></div>
          <div className="h-3 w-10 bg-neutral-800 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center gap-2 p-2">
          <div className="h-4 w-12 bg-neutral-800 rounded animate-pulse"></div>
          <div className="h-3 w-10 bg-neutral-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-3 mt-auto">
        <div className="flex-1 h-9 bg-neutral-800 rounded-lg animate-pulse"></div>
        <div className="flex-1 h-9 bg-neutral-800 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

export default MarketCardSkeleton;
