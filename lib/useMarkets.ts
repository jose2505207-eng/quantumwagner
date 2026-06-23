"use client";

import { useCallback, useEffect, useState } from "react";
import { Market } from "@/app/types";
import { getMarkets } from "@/lib/api";
import { DEMO_MODE } from "@/lib/game/config";
import { DEMO_MARKETS } from "@/lib/demo/markets";

export type DataSource = "live" | "demo" | "empty";

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
 *   - source === "demo"  -> backend returned none and DEMO_MODE is on; the
 *                            markets are seed data and MUST be badged in the UI
 *   - source === "empty" -> no live markets and demo is off
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
      } else if (DEMO_MODE) {
        setMarkets(DEMO_MARKETS);
        setSource("demo");
      } else {
        setMarkets([]);
        setSource("empty");
      }
    } catch (e) {
      // Network/backend down. In demo mode we still show seed data (badged),
      // but we ALSO record the error so the UI can tell the user it's offline.
      const msg = e instanceof Error ? e.message : "Failed to load markets";
      setError(msg);
      if (DEMO_MODE) {
        setMarkets(DEMO_MARKETS);
        setSource("demo");
      } else {
        setMarkets([]);
        setSource("empty");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { markets, source, loading, error, reload: load };
}
