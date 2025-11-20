"use client";

import { useState } from "react";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { Spinner } from "@/app/portfolio/page";
import { BuyTokenHero } from "@/components/buytoken/buy-token-hero";
import { TokenFilters } from "@/components/buytoken/token-filters";
import { TokenGrid } from "@/components/buytoken/token-grid";
import { TokenCard } from "@/components/buytoken/token-card";
import { Background } from "@/components/background";

export default function BuyToken() {
  const { tokens: allTokens, loading: tokenLoading } = useAllTokens();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter Logic
  const filteredTokens = allTokens.filter((token) => {
    const acc = token.account;
    const name = acc.name?.toLowerCase() || "";
    const symbol = acc.symbol?.toLowerCase() || "";
    const mint = toDisplay(acc.tokenMint)?.toLowerCase() || "";
    const status = Object.keys(acc.status || {})[0]?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      symbol.includes(searchQuery.toLowerCase()) ||
      mint.includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (tokenLoading)
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center gap-6">
        <Spinner />
        <div className="text-center space-y-2 animate-pulse">
          <h3 className="text-xl font-semibold text-white">Loading Tokens...</h3>
          <p className="text-muted-foreground text-sm">
            Please connect your wallet if you haven't yet
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        <BuyTokenHero />

        <div className="flex flex-col space-y-6">
          <TokenFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {filteredTokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No tokens found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <TokenGrid>
              {filteredTokens.map((token, i) => (
                <TokenCard key={i} token={token} index={i} />
              ))}
            </TokenGrid>
          )}
        </div>
      </div>
    </div>
  );
}
