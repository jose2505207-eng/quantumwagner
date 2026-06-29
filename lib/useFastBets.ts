"use client";

import { useCallback, useEffect, useState } from "react";
import { getFastBets, type ApiFastBet } from "@/lib/api";
import { DEMO_MODE } from "@/lib/game/config";
import { DEMO_FAST_BETS } from "@/lib/demo/fastbets";
import type { FastBetCardProps } from "@/components/fastbet/FastBetCard";

export type DataSource = "live" | "demo" | "empty";

/** Card-ready fast-bet row (the props FastBetCard consumes, minus `index`). */
export type FastBetRow = Omit<FastBetCardProps, "index">;

interface UseFastBetsResult {
  fastBets: FastBetRow[];
  source: DataSource;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const CARD_STATUSES: ReadonlyArray<FastBetCardProps["status"]> = [
  "live",
  "closing-soon",
  "upcoming",
  "resolving",
  "resolved",
];

function normalizeStatus(status: string): FastBetCardProps["status"] {
  return (CARD_STATUSES as readonly string[]).includes(status)
    ? (status as FastBetCardProps["status"])
    : "live";
}

/** Format a positive millisecond duration as a compact human string. */
function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

/** Derive a human countdown label from the round's timestamps + status. */
function timeRemaining(bet: ApiFastBet, now = Date.now()): string {
  const status = normalizeStatus(bet.status);
  if (status === "resolved") return "Resolved";
  if (status === "resolving") return "Resolving...";

  if (status === "upcoming") {
    const start = new Date(bet.startTime).getTime();
    if (Number.isFinite(start) && start > now) return `Starts in ${formatDuration(start - now)}`;
  }

  const end = new Date(bet.endTime).getTime();
  if (!Number.isFinite(end)) return "—";
  if (end <= now) return "Resolving...";
  return formatDuration(end - now);
}

/** Map a live API fast-bet row onto the card's props (honest: no faked split/price). */
function toRow(bet: ApiFastBet): FastBetRow {
  return {
    id: bet.id,
    question: bet.question,
    symbol: bet.symbol || undefined,
    totalPool: bet.pool,
    timeRemaining: timeRemaining(bet),
    status: normalizeStatus(bet.status),
    entries: bet._count?.entries,
    // currentPrice + yes/no split are intentionally omitted: the list endpoint
    // does not expose live price or a per-side breakdown, so we do not invent one.
  };
}

/**
 * Loads fast-bet rounds from the live backend. The honesty contract:
 *   - source === "live"  -> real backend rounds (rendered with NO demo badge)
 *   - source === "demo"  -> backend returned none and DEMO_MODE is on; the rounds
 *                            are seed data and MUST be badged in the UI
 *   - source === "empty" -> no live rounds and demo is off
 * On a hard failure we surface `error` (and still fall back to demo-or-empty so
 * the screen degrades gracefully — but demo data stays clearly badged).
 */
export function useFastBets(): UseFastBetsResult {
  const [fastBets, setFastBets] = useState<FastBetRow[]>([]);
  const [source, setSource] = useState<DataSource>("empty");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const live = await getFastBets();
      if (live.length > 0) {
        setFastBets(live.map(toRow));
        setSource("live");
      } else if (DEMO_MODE) {
        setFastBets(DEMO_FAST_BETS);
        setSource("demo");
      } else {
        setFastBets([]);
        setSource("empty");
      }
    } catch (e) {
      // Backend down / network error. In demo mode we still show seed data
      // (badged), but we ALSO record the error so the UI can flag it.
      const msg = e instanceof Error ? e.message : "Failed to load fast bets";
      setError(msg);
      if (DEMO_MODE) {
        setFastBets(DEMO_FAST_BETS);
        setSource("demo");
      } else {
        setFastBets([]);
        setSource("empty");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { fastBets, source, loading, error, reload: load };
}
