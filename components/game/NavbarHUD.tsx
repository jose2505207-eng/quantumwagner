"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGameStore } from "@/store/useGameStore";
import { useHydrated } from "@/lib/useHydrated";
import { getRank, getNextRank, rankProgress } from "@/lib/game/ranks";
import { arenaLevelNumber, formatXp } from "@/lib/game/xp";
import { Flame } from "lucide-react";

/**
 * Slim progression chip for the navbar. Shows level, rank colour, XP and
 * streak. Only rendered when a wallet is connected (post Level 1). Links to the
 * mission map on the home page.
 */
export function NavbarHUD() {
  const hydrated = useHydrated();
  const { connected } = useWallet();
  const xp = useGameStore((s) => s.xp);
  const completedLevels = useGameStore((s) => s.completedLevels);
  const streak = useGameStore((s) => s.streak);

  if (!hydrated || !connected) return null;

  const level = arenaLevelNumber(completedLevels);
  const rank = getRank(xp);
  const next = getNextRank(xp);
  const progress = rankProgress(xp);

  return (
    <Link
      href="/#daily-quests"
      title={`Level ${level} · ${rank.name} · ${formatXp(xp)} XP`}
      className="qw-glass hidden max-w-[220px] flex-shrink-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:border-violet-400/40 md:flex lg:hidden xl:flex"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-black"
        style={{ background: rank.color }}
      >
        {level}
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="flex items-center gap-1.5">
          <span
            className="max-w-[96px] truncate text-[11px] font-bold uppercase tracking-wide"
            style={{ color: rank.color }}
          >
            {rank.name}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-300">
              <Flame size={10} />
              {streak}
            </span>
          )}
        </span>
        <span className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-white/10">
          <span
            className="qw-bar-fill block h-full rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </span>
      <span className="text-[11px] font-bold text-white">
        {formatXp(xp)}
        <span className="ml-0.5 text-[9px] font-medium text-zinc-500">
          {next ? "XP" : "MAX"}
        </span>
      </span>
    </Link>
  );
}

export default NavbarHUD;
