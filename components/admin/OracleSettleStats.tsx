"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKEND_URL } from "@/config";

/**
 * Admin ops view for GET /api/oracle/settle-stats.
 *
 * Surfaces the auto-resolve settlement-method distribution (asof / spot-fallback
 * / spot / unrecorded) and the as-of share so operators can SEE oracle-history
 * reliability instead of guessing. The page is already behind the admin KYC gate
 * (app/admin/page.tsx); this route is additionally gated by ADMIN_RESOLUTION_KEY,
 * which the operator pastes here — we NEVER hardcode that secret in the bundle.
 *
 * Honesty boundary: this renders ONLY the real numbers the server returns. When
 * nothing has resolved, `asofShare` is `null` and we show "no data" — never 0%,
 * never a fabricated distribution.
 */

type SettleStats = {
  totalResolved: number;
  byMethod: { asof: number; "spot-fallback": number; spot: number; unrecorded: number };
  bySource: Record<string, number>;
  asofShare: number | null;
};

const METHOD_LABELS: Record<keyof SettleStats["byMethod"], string> = {
  asof: "As-of endTime (fair)",
  "spot-fallback": "Spot fallback",
  spot: "Spot",
  unrecorded: "Unrecorded",
};

export default function OracleSettleStats() {
  const [adminKey, setAdminKey] = useState("");
  const [stats, setStats] = useState<SettleStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!adminKey.trim()) {
      setError("Enter the admin resolution key to query settle-stats.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<SettleStats>(`${BACKEND_URL}/api/oracle/settle-stats`, {
        headers: { "x-admin-key": adminKey.trim() },
      });
      setStats(res.data);
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      setStats(null);
      setError(
        e.response?.status === 403
          ? "Invalid admin key (403)."
          : e.response?.data?.error || "Failed to load settle-stats."
      );
    } finally {
      setLoading(false);
    }
  };

  const pct = (n: number) =>
    stats && stats.totalResolved > 0
      ? `${Math.round((n / stats.totalResolved) * 1000) / 10}%`
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Activity className="h-5 w-5 text-emerald-400" /> Oracle Settle Stats
        </h2>
        <p className="text-sm text-muted-foreground">
          Auto-resolve settlement-method distribution across resolved fast-bets. A
          higher <span className="font-mono">as-of</span> share means more rounds
          settled fairly on the price as of <span className="font-mono">endTime</span>.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="password"
          placeholder="ADMIN_RESOLUTION_KEY"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchStats()}
          className="w-full sm:w-80"
        />
        <Button onClick={fetchStats} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {stats ? "Refresh" : "Load"}
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total resolved</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalResolved}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">As-of share</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {stats.asofShare === null
                  ? "— (no data)"
                  : `${Math.round(stats.asofShare * 1000) / 10}%`}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">As-of count</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stats.byMethod.asof}</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">By method</h3>
            <div className="space-y-2">
              {(Object.keys(stats.byMethod) as (keyof SettleStats["byMethod"])[]).map((k) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{METHOD_LABELS[k]}</span>
                  <span className="font-mono text-foreground">
                    {stats.byMethod[k]} <span className="text-muted-foreground">({pct(stats.byMethod[k])})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">By source</h3>
            {Object.keys(stats.bySource).length === 0 ? (
              <p className="text-sm text-muted-foreground">No resolved rounds yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.bySource).map(([src, count]) => (
                  <div key={src} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">{src}</span>
                    <span className="font-mono text-foreground">
                      {count} <span className="text-muted-foreground">({pct(count)})</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
