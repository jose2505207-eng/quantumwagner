"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Real platform statistics (GET /api/stats/platform).
 *
 * Screens used to hardcode impressive-looking totals. This hook is the only
 * source now: while it loads, callers render "…", and a value the backend
 * cannot compute (accuracy with nothing settled) stays null so the UI can show
 * "—" instead of inventing a number.
 */
export interface PlatformStats {
  totalVolumeSol: number;
  marketVolumeSol: number;
  fastBetVolumeSol: number;
  battleVolumeSol: number;
  traders: number;
  activeMarkets: number;
  resolvedMarkets: number;
  openFastBetRounds: number;
  battles: number;
  tokensLaunched: number;
  totalPredictions: number;
  accuracyPercent: number | null;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/stats/platform")
      .then((res) => {
        if (!cancelled) setStats((res.data?.data as PlatformStats) ?? null);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}

/** Format a SOL amount for a stat tile. */
export function formatSol(value: number | undefined | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(3)} SOL`;
}
