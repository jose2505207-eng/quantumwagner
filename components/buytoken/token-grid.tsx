"use client";

import { ReactNode } from "react";

interface TokenGridProps {
  children: ReactNode;
}

export function TokenGrid({ children }: TokenGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full relative z-10 pb-20">
      {children}
    </div>
  );
}
