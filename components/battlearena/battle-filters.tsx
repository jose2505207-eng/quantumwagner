"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BattleFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
      {/* Search */}
      <div className="relative w-full md:w-96 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search battles..."
          className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-[#0A0A0A] text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-all duration-200"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        <Button variant="outline" className="rounded-xl border-white/10 bg-[#0A0A0A] hover:bg-white/5 hover:text-white text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <div className="h-6 w-px bg-white/10 mx-2" />
        <Button variant="ghost" className="rounded-xl text-white bg-white/10 hover:bg-white/20">
          All Battles
        </Button>
        <Button variant="ghost" className="rounded-xl text-muted-foreground hover:text-white hover:bg-white/5">
          Live
        </Button>
        <Button variant="ghost" className="rounded-xl text-muted-foreground hover:text-white hover:bg-white/5">
          Ended
        </Button>
        <Button variant="ghost" className="rounded-xl text-muted-foreground hover:text-white hover:bg-white/5">
          My Battles
        </Button>
      </div>
    </div>
  );
}
