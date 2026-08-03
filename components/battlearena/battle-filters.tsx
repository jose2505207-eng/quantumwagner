"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The status tabs are a single-choice group. They previously rendered as four
 * independently-styled buttons with "All Battles" hard-coded to the active
 * style, so "All Battles" and (say) "Live" both looked selected at once and
 * neither actually filtered anything.
 */
export type BattleFilter = "all" | "live" | "ended" | "mine";

const TABS: Array<{ value: BattleFilter; label: string }> = [
  { value: "all", label: "All Battles" },
  { value: "live", label: "Live" },
  { value: "ended", label: "Ended" },
  { value: "mine", label: "My Battles" },
];

interface BattleFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  filter: BattleFilter;
  onFilterChange: (value: BattleFilter) => void;
  /** "My Battles" needs a connected wallet to know whose battles to show. */
  walletConnected?: boolean;
}

export function BattleFilters({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  walletConnected = false,
}: BattleFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
      {/* Search */}
      <div className="relative w-full md:w-96 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search battles..."
          aria-label="Search battles"
          className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-[#0A0A0A] text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-all duration-200"
        />
      </div>

      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter battles by status"
        className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar"
      >
        {TABS.map((tab) => {
          const selected = filter === tab.value;
          // Without a wallet there is no "mine" to resolve against.
          const disabled = tab.value === "mine" && !walletConnected;
          return (
            <Button
              key={tab.value}
              role="tab"
              aria-selected={selected}
              disabled={disabled}
              title={
                disabled ? "Connect your wallet to see your battles" : undefined
              }
              onClick={() => onFilterChange(tab.value)}
              variant="ghost"
              className={cn(
                "rounded-xl shrink-0",
                selected
                  ? "text-white bg-white/10 hover:bg-white/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.label}
            </Button>
          );
        })}

        <div className="h-6 w-px bg-white/10 mx-2" />

        <Button
          onClick={() => router.push("/battlearena/new")}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Battle
        </Button>
      </div>
    </div>
  );
}
