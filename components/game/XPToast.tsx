"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { Zap, ArrowUp, Trophy } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { RANK_BY_ID } from "@/lib/game/ranks";

/**
 * Headless listener: watches the progression store for the latest XP event and
 * fires a neon toast, then clears it. Mount once near the app root.
 */
export function XPToast() {
  const lastToast = useGameStore((s) => s.lastToast);
  const consumeToast = useGameStore((s) => s.consumeToast);

  useEffect(() => {
    if (!lastToast) return;
    const rank = lastToast.rankUp ? RANK_BY_ID[lastToast.rankUp] : null;

    toast.custom(
      (t) => (
        <div
          className={`qw-xp-toast qw-glass qw-glow flex items-center gap-3 rounded-2xl px-4 py-3 ${
            t.visible ? "" : "opacity-0"
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            {lastToast.levelUp ? (
              <ArrowUp size={18} />
            ) : rank ? (
              <Trophy size={18} />
            ) : (
              <Zap size={18} />
            )}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-white">
              +{lastToast.amount} XP
            </div>
            <div className="text-xs text-zinc-400">{lastToast.reason}</div>
            {lastToast.levelUp && (
              <div className="mt-0.5 text-xs font-bold text-cyan-300">
                Level up — LVL {lastToast.levelUp}
              </div>
            )}
            {rank && (
              <div
                className="mt-0.5 text-xs font-bold"
                style={{ color: rank.color }}
              >
                New rank: {rank.name}
              </div>
            )}
          </div>
        </div>
      ),
      { duration: 2600, position: "top-right", id: `xp-${lastToast._id}` }
    );

    consumeToast();
  }, [lastToast, consumeToast]);

  return null;
}

export default XPToast;
