"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Target, BarChart3, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "@/lib/api";

/**
 * Your real standing.
 *
 * This panel used to be entirely invented: rank #1,247, "+23 positions this
 * week", $4,250 profit, 72.4% win rate, 23 markets traded, and a "Recent
 * Performance" row of made-up daily P&L. Every value now comes from the
 * player's own persisted record, and a signed-out visitor is told to connect
 * rather than shown someone's imaginary stats.
 */
interface Standing {
  rank: number;
  xp: number;
  wins: number;
}

interface Profile {
  total_predictions: number;
  correct_predictions: number;
  win_rate: string;
  total_volume: string;
  rank_id: string;
  level: number;
}

const YourRanking = () => {
  const [standing, setStanding] = useState<Standing | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [board, me] = await Promise.all([
          api.get("/api/leaderboard").catch(() => null),
          api.get("/api/auth/profile").catch(() => null),
        ]);
        if (cancelled) return;
        const you = board?.data?.data?.you ?? null;
        setStanding(you ? { rank: you.rank, xp: you.xp, wins: you.wins } : null);
        setProfile((me?.data?.user as Profile) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = Boolean(profile);

  return (
    <div className="bg-[#0A0A0A] border border-border rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400/30 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Your Ranking</h3>
          <p className="text-muted-foreground text-sm">
            Your position in the live season
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-lg bg-white/[0.03]" />
      ) : !signedIn ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet and place a bet to enter the season standings.
          </p>
          <Button asChild className="mt-4 w-full bg-purple-600 hover:bg-purple-500">
            <Link href="/markets">Browse markets</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {standing ? `#${standing.rank}` : "Unranked"}
            </div>
            <div className="text-sm text-muted-foreground">
              {standing
                ? `${standing.xp} XP · ${standing.wins} win${standing.wins === 1 ? "" : "s"}`
                : "Win a bet to enter the standings"}
            </div>
          </div>

          <div className="space-y-3">
            <Stat
              icon={<Coins className="w-4 h-4 text-yellow-400" />}
              label="Staked"
              value={`${Number(profile?.total_volume ?? 0).toFixed(3)} SOL`}
            />
            <Stat
              icon={<BarChart3 className="w-4 h-4 text-blue-400" />}
              label="Bets placed"
              value={String(profile?.total_predictions ?? 0)}
            />
            <Stat
              icon={<Target className="w-4 h-4 text-green-400" />}
              label="Win rate"
              value={
                (profile?.total_predictions ?? 0) > 0 ? `${profile?.win_rate}%` : "—"
              }
            />
          </div>

          <Button asChild className="mt-6 w-full bg-purple-600 hover:bg-purple-500">
            <Link href="/portfolio">View full portfolio</Link>
          </Button>
        </>
      )}
    </div>
  );
};

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default YourRanking;
