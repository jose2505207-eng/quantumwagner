"use client";

import { useAllBattles } from "@/app/utils/useAllBattles";
import { Spinner } from "@/app/portfolio/page";
import BattleArenaHeroSection from "@/components/BattleArenaHeroSection";
import { useRouter } from "next/navigation";

const safe = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object" && v.toString) return v.toString();
  return String(v);
};

export default function TokenBattlesSection() {
  const router = useRouter();
  const { battles: allBattles, loading: allBattleLaoding } = useAllBattles();

  if (allBattleLaoding)
    return (
      <div className="flex justify-center items-center h-80 mt-30">
        <Spinner />
      </div>
    );

  return (
    <section className="relative z-[1] min-h-screen text-white px-6 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <BattleArenaHeroSection />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBattles?.map((battle, index: number) => {
            const d = battle.data;

            return (
              <div
                key={index}
                className="
                  bg-[#0f1115] border border-gray-800
                  rounded-xl p-5 shadow-md 
                  hover:shadow-[0_0_20px_rgba(0,0,0,0.35)]
                  transition hover:cursor-pointer
                "
                onClick={() => {
                  router.push(`/battlearena/${battle.pda}`);
                }}
              >
                <img
                  src={d.imageUrl}
                  alt={d.title}
                  className="rounded-lg w-full h-40 object-cover border border-gray-700"
                />

                {/* Title */}
                <h2 className="mt-4 text-xl font-semibold">{d.title}</h2>

                {/* Description */}
                <p className="text-gray-400 text-sm mt-1">{d.description}</p>

                {/* Status */}
                <p className="mt-2 text-sm">
                  <span className="text-gray-400">Status: </span>
                  <span className="text-green-400 font-medium">
                    {Object.keys(d.status)[0]}
                  </span>
                </p>

                {/* Winner */}
                <p className="text-sm mt-1">
                  <span className="text-gray-400">Winner: </span>
                  <span className="text-purple-400">
                    {d.winner ? Object.keys(d.winner)[0] : "—"}
                  </span>
                </p>

                {/* POOLS */}
                <div className="text-sm mt-3 space-y-1">
                  <p>
                    <span className="text-gray-400">Side A Pool:</span>{" "}
                    {safe(d.sideAPool)}
                  </p>
                  <p>
                    <span className="text-gray-400">Side B Pool:</span>{" "}
                    {safe(d.sideBPool)}
                  </p>
                  <p>
                    <span className="text-gray-400">Total Pool:</span>{" "}
                    {safe(d.totalPool)}
                  </p>
                </div>

                {/* TIMES */}
                <div className="text-sm mt-3 space-y-1">
                  <p>
                    <span className="text-gray-400">Created:</span>{" "}
                    {safe(d.createdAt)}
                  </p>
                  <p>
                    <span className="text-gray-400">Start:</span>{" "}
                    {safe(d.startTime)}
                  </p>
                  <p>
                    <span className="text-gray-400">End:</span>{" "}
                    {safe(d.endTime)}
                  </p>
                  <p>
                    <span className="text-gray-400">Resolution:</span>{" "}
                    {safe(d.resolutionTime)}
                  </p>
                </div>

                {/* PARTICIPANTS */}
                <div className="text-sm mt-3 space-y-1">
                  <p>
                    <span className="text-gray-400">Side A Participants:</span>{" "}
                    {safe(d.sideAParticipants)}
                  </p>
                  <p>
                    <span className="text-gray-400">Side B Participants:</span>{" "}
                    {safe(d.sideBParticipants)}
                  </p>
                  <p>
                    <span className="text-gray-400">Unique Participants:</span>{" "}
                    {safe(d.uniqueParticipants)}
                  </p>
                </div>

                {/* META */}
                <div className="text-sm mt-3 space-y-1">
                  <p>
                    <span className="text-gray-400">Meta Market:</span>{" "}
                    {d.metaMarketEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p>
                    <span className="text-gray-400">Featured:</span>{" "}
                    {d.featured ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
