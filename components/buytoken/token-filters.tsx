"use client";

import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TokenFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export function TokenFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: TokenFiltersProps) {
  const filters = [
    { id: "all", label: "All Tokens" },
    { id: "active", label: "Active" },
    { id: "migrated", label: "Migrated" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 p-1">
      {/* Search Bar */}
      <div className="relative w-full md:w-[400px] group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          placeholder="Search tokens by name, symbol..."
          className="pl-10 bg-[#0A0A0A] border-white/10 focus:border-primary/50 h-12 rounded-xl transition-all hover:border-white/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center p-1 bg-[#0A0A0A] border border-white/10 rounded-xl w-full md:w-auto overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none",
              statusFilter === filter.id
                ? "bg-white/10 text-white shadow-sm"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
