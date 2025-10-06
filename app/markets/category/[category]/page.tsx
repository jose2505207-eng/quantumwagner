"use client";

import { useParams } from "next/navigation";
import { useMarketStore } from "@/store/adminMarketStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import CountdownTimer from "@/app/hooks/CountdownTimer";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const category = (params?.category as string | undefined) ?? undefined;
  const { markets } = useMarketStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (replace with API call if async)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = category
    ? markets.filter(
        (m) => m.category?.toUpperCase() === category.toUpperCase()
      )
    : markets;

  return (
    <div className="min-h-screen  px-6 py-12 text-white  pt-24">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">
          {category ? `${category} Markets` : "All Markets"}
        </h1>
        <p className="text-gray-400 mt-2">
          Browse all active prediction markets and find your next opportunity.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center">No markets found.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => {
            const yesPool = parseFloat(m.yes_pool.toString() || "0");
            const noPool = parseFloat(m.no_pool.toString() || "0");
            const total = yesPool + noPool || 1;
            const yesPercent = Math.round((yesPool / total) * 100);
            const noPercent = 100 - yesPercent;

            return (
              <Link
                key={m.id}
                href={`/markets/${m.id}`}
                className="block"
              >
                <div
                  key={m.id}
                  className="bg-[#0e0e0e] border border-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer"
                >
                  {/* Category Label */}
                  <span className="text-xs uppercase tracking-wide text-purple-400 font-semibold">
                    {m.category.replaceAll("_", " ")}
                  </span>

                  {/* Question */}
                  <h2 className="mt-2 font-semibold text-lg text-white">
                    {m.question}
                  </h2>

                  {/* Yes / No Percentages */}
                  <div className="flex justify-between mt-4 text-sm font-bold">
                    <span className="text-green-400">{yesPercent}% YES</span>
                    <span className="text-red-400">{noPercent}% NO</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${yesPercent}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-4">
                    <span>
                      ${Number(m.total_volume || 0).toLocaleString()} Volume
                    </span>
                    <CountdownTimer endTime={m.end_time} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <button className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg text-sm font-semibold">
                      Bet YES
                    </button>
                    <button className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg text-sm font-semibold">
                      Bet NO
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
