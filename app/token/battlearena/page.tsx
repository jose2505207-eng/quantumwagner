"use client";

import { useState } from "react";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { Spinner } from "@/app/portfolio/page";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import BattleArenaHeroSection from "@/components/BattleArenaHeroSection";

export default function TokenBattlesSection() {
  const { tokens: allTokens, loading: tokenLoading } = useAllTokens();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

    const matchesFilter =
      statusFilter === "all" || status === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  if (tokenLoading)
    return (
      <div className="flex justify-center items-center h-80">
        <Spinner />
      </div>
    );

  return (
    <section className="relative z-[1] min-h-screen text-white px-6 py-20  overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <BattleArenaHeroSection />

        {/* Subtle Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-12" />

        {/* Search + Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full mb-10">
          <Input
            placeholder="Search by name, symbol, or mint..."
            className="bg-[#101217] text-gray-200 border border-gray-700 focus:border-purple-500 focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
          >
            <SelectTrigger className="w-[180px] bg-[#101217] border-gray-700 text-gray-200 focus:border-purple-500 focus:ring-0">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#101217] border-gray-700 text-gray-200">
              <SelectItem value="all">All Tokens</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="migrated">Migrated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full relative z-[2]">
          {filteredTokens.length === 0 ? (
            <p className="text-gray-500 text-center mt-10 w-full">
              No matching tokens found.
            </p>
          ) : (
            filteredTokens.map((token, i) => {
              const acc = token.account;
              const mint = toDisplay(acc.tokenMint);
              const status = Object.keys(acc.status || {})[0] || "unknown";

              return (
                <Link key={i} href={`/token/${mint}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="relative group p-6 rounded-2xl border border-[#4c00ff]/20 bg-[#0f1015]/80 
                               backdrop-blur-md hover:border-[#a855f7]/50 
                               transition-all duration-300 
                               hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] cursor-pointer overflow-hidden"
                  >
                    {/* Glow Layer */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#a855f7]/15 via-transparent to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative flex flex-col items-center text-center z-[2]">
                      {acc.imageUri && acc.imageUri.startsWith("http") ? (
                        <Image
                          src={acc.imageUri}
                          alt={acc.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-full border border-gray-700 mb-4"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-800 text-gray-400 rounded-full mb-4">
                          No Image
                        </div>
                      )}

                      <h2 className="text-lg font-semibold">
                        {acc.name || "Unnamed Token"}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {acc.symbol || "--"}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 mt-2 rounded-full border ${
                          status === "active"
                            ? "border-green-400/40 bg-green-500/10 text-green-300"
                            : "border-gray-500/30 bg-gray-600/10 text-gray-400"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>

                      <p className="text-[12px] text-gray-500 mt-3 break-all">
                        {mint}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
