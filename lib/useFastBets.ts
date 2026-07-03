"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFastBets, type ApiFastBet } from "@/lib/api";
import type { FastBetCardProps } from "@/components/fastbet/FastBetCard";

// Only real live rounds or an empty state are rendered — no demo/seed source.
export type DataSource = "live" | "empty";

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
  // Derive the YES/NO split from real pool sizes only. If both fields are absent
  // or sum to 0 (no entries yet) we leave the split undefined so the card falls
  // back to its honest "open for bets" layout instead of inventing a 50/50.
  const yesPool = typeof bet.yesPool === "number" ? bet.yesPool : 0;
  const noPool = typeof bet.noPool === "number" ? bet.noPool : 0;
  const poolSum = yesPool + noPool;
  let yesPercentage: number | undefined;
  let noPercentage: number | undefined;
  if (poolSum > 0) {
    yesPercentage = Math.round((yesPool / poolSum) * 100);
    noPercentage = 100 - yesPercentage;
  }

  return {
    id: bet.id,
    question: bet.question,
    symbol: bet.symbol || undefined,
    totalPool: bet.pool,
    timeRemaining: timeRemaining(bet),
    status: normalizeStatus(bet.status),
    entries: bet._count?.entries,
    // Real per-side split only (undefined when no entries / fields absent).
    yesPercentage,
    noPercentage,
    // Only a real, finite price from the feed — null/undefined is omitted so the
    // card never shows a fabricated price.
    currentPrice: bet.currentPrice ?? undefined,
    // Real recorded settlement signals only — null is collapsed to undefined so
    // the card renders nothing rather than guessing a delta, source, or outcome.
    startPrice: bet.startPrice ?? undefined,
    resolutionSource: bet.resolutionSource ?? undefined,
    outcome: bet.outcome ?? undefined,
    // Real recorded settle price/method only — null collapses to undefined so the
    // card shows nothing rather than a fabricated settlement price.
    settlePrice: bet.settlePrice ?? undefined,
    settleMethod: bet.settleMethod ?? undefined,
  };
}

/** Background refresh cadence for live countdowns / pool updates. */
const POLL_INTERVAL_MS = 15000;

/**
 * Loads fast-bet rounds from the live backend. The honesty contract:
 *   - source === "live"  -> real backend rounds
 *   - source === "empty" -> no live rounds (nothing is ever fabricated)
 * On a hard failure we surface `error` (UI shows an ErrorState with retry).
 */
export function useFastBets(): UseFastBetsResult {
  const [fastBets, setFastBets] = useState<FastBetRow[]>([]);
  const [source, setSource] = useState<DataSource>("empty");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Guards against overlapping requests so the 15s poll never stacks on top of
  // an in-flight load (or a manual retry).
  const inFlight = useRef(false);

  const load = useCallback(async ({ background = false }: { background?: boolean } = {}) => {
    if (inFlight.current) return;
    inFlight.current = true;
    // Background refreshes stay quiet — no spinner flash every 15s. Only the
    // initial load (and explicit retries) flip `loading`.
    if (!background) setLoading(true);
    setError(null);
    try {
      const live = await getFastBets();
      if (live.length > 0) {
        setFastBets(live.map(toRow));
        setSource("live");
      } else {
        setFastBets([]);
        setSource("empty");
      }
    } catch (e) {
      // Backend down / network error — surface it and show an empty state.
      // No demo fallback: we never fabricate fast-bet rounds.
      const msg = e instanceof Error ? e.message : "Failed to load fast bets";
      setError(msg);
      setFastBets([]);
      setSource("empty");
    } finally {
      if (!background) setLoading(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    // Quietly refresh countdowns / pool splits on an interval without flashing
    // the spinner. The in-flight guard inside `load` skips ticks that would
    // overlap a pending request.
    const id = setInterval(() => {
      load({ background: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  // `reload` is the manual retry path — show the spinner, like the initial load.
  const reload = useCallback(() => {
    load();
  }, [load]);

  return { fastBets, source, loading, error, reload };
}
