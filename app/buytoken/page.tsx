"use client";

import { useState } from "react";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { Spinner } from "@/app/portfolio/page";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import BuyHeroSection from "@/components/BuyTokenHeroSection";

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
      <div className="flex justify-center items-center h-80">
        <Spinner />
      </div>
    );

  return (
    <section className="relative z-[1] min-h-screen text-white px-6 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <BuyHeroSection />

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-12" />

        <div
          className="w-full p-6 rounded-2xl border border-[#2e1065]/40 
          backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-gray-400 text-sm">Status:</span>

            <div className="flex items-center gap-3 w-full justify-between">
              {[
                { id: "all", label: "All Tokens" },
                { id: "active", label: "Active" },
                { id: "migrated", label: "Migrated" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={`
    w-full px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 
    border 
    ${
      statusFilter === t.id
        ? `
          text-white 
          border-transparent
          bg-[rgba(101,47,18,0.85)]   // ← little transparent
        `
        : `
          text-gray-400 
          bg-[#0f0a1a]/60 
          border-[#2e1065]/40 
          hover:border-[#a855f7]/40
        `
    }
  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH */}
          <div className="mt-6">
            <Input
              placeholder="Search by name, symbol, or mint..."
              className="w-full bg-[#101217] text-gray-200 border border-gray-700 
                focus:border-purple-500 focus:ring-0 rounded-xl px-4 py-2
                placeholder:text-gray-500 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* TOKEN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full relative z-[2]">
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
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative group p-6 rounded-2xl border border-[#4c00ff]/10 
                      bg-gradient-to-br from-[#0f1015]/90 via-[#0d0e13]/90 to-[#0a0b10]/90 
                      backdrop-blur-md hover:border-[#a855f7]/50 
                      hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] cursor-pointer 
                      transition-all duration-300 overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-tr 
                      from-[#a855f7]/10 via-transparent to-transparent blur-xl opacity-40 
                      group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                    />

                    <div className="relative flex flex-col items-center text-center z-[2] space-y-3">
                      {acc.imageUri && acc.imageUri.startsWith("http") ? (
                        <Image
                          src={acc.imageUri}
                          alt={acc.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-full border border-gray-700 shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-800 text-gray-400 rounded-full border border-gray-700">
                          No Image
                        </div>
                      )}

                      <div>
                        <h2 className="text-lg font-semibold text-white tracking-wide">
                          {acc.name || "Unnamed Token"}
                        </h2>
                        <p className="text-sm text-gray-400 uppercase">
                          {acc.symbol || "--"}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                          status === "active"
                            ? "border-green-400/40 bg-green-500/10 text-green-300"
                            : "border-gray-500/30 bg-gray-600/10 text-gray-400"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>

                      <div className="flex flex-col gap-1 text-gray-400 text-xs mt-3 w-full px-2">
                        <div className="flex justify-between text-gray-300/80">
                          <span className="text-left text-gray-500">
                            Market Cap
                          </span>
                          <span className="font-medium">$2.4M</span>
                        </div>
                        <div className="flex justify-between text-gray-300/80">
                          <span className="text-left text-gray-500">
                            24h Volume
                          </span>
                          <span className="font-medium">$120k</span>
                        </div>
                      </div>

                      <p className="text-[12px] text-gray-500 mt-3 break-all font-mono opacity-80">
                        {mint}
                      </p>
                    </div>

                    <div
                      className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 
                        group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                        transition-all duration-200 ease-in-out z-[5]"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                        className="px-5 py-2.5 flex items-center gap-2
                          bg-[#a855f7]/15 hover:bg-[#a855f7]/25 
                          text-[#c084fc] font-medium text-sm rounded-xl 
                          border border-[#a855f7]/30 backdrop-blur-md
                          shadow-[0_0_12px_rgba(168,85,247,0.15)]
                          transition-all duration-200"
                      >
                        <span>View Details</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-[#c084fc]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </motion.button>
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
