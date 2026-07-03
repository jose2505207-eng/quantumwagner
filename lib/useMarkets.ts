"use client";

import { useCallback, useEffect, useState } from "react";
import { Market } from "@/app/types";
import { getMarkets } from "@/lib/api";

// The app only ever renders real live data or an empty state — there is no
// demo/seed source.
export type DataSource = "live" | "empty";

interface UseMarketsResult {
  markets: Market[];
  source: DataSource;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Loads markets from the live backend. The honesty contract:
 *   - source === "live"  -> real backend markets
 *   - source === "empty" -> no live markets (no demo fallback — this is real)
 * On a hard failure we surface `error` (UI shows an ErrorState with retry).
 */
export function useMarkets(): UseMarketsResult {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [source, setSource] = useState<DataSource>("empty");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const live = await getMarkets();
      if (live.length > 0) {
        setMarkets(live);
        setSource("live");
      } else {
        setMarkets([]);
        setSource("empty");
      }
    } catch (e) {
      // Network/backend down — surface the error and show an empty state.
      // No demo fallback: we never fabricate markets.
      const msg = e instanceof Error ? e.message : "Failed to load markets";
      setError(msg);
      setMarkets([]);
      setSource("empty");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { markets, source, loading, error, reload: load };
}
