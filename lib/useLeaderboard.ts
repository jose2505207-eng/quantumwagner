"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface LeaderboardRow {
  rank: number;
  userId: string;
  wallet: string;
  username: string | null;
  xp: number;
  wins: number;
  rankTier: string;
  isYou: boolean;
}

interface UseLeaderboardResult {
  rows: LeaderboardRow[];
  season: { id: string; name: string } | null;
  you: LeaderboardRow | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Loads the real leaderboard from the backend (active season, real XP/wins). */
export function useLeaderboard(): UseLeaderboardResult {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [season, setSeason] = useState<{ id: string; name: string } | null>(null);
  const [you, setYou] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/leaderboard`);
      const data = res.data?.data;
      setRows(data?.entries ?? []);
      setSeason(data?.season ?? null);
      setYou(data?.you ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, season, you, loading, error, reload: load };
}
