"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/app/utils/utils";
import { api } from "@/lib/api";

interface PriceHistoryGraphProps {
  /** Current YES share of the pool, in percent. */
  currentProbability: number;
  /** Market cuid or on-chain PDA. */
  marketId: string;
  color?: string;
}

interface HistoryPoint {
  t: string;
  yesPercent: number;
  volume: number;
}

/**
 * YES-probability history built from the market's REAL bets.
 *
 * This chart previously generated a random walk on every render and presented
 * it as history. It now replays actual predictions (GET
 * /api/markets/[id]/history); a market with fewer than two bets renders an
 * honest empty state rather than a fabricated line.
 */
export function PriceHistoryGraph({
  currentProbability,
  marketId,
  color = "#10B981",
}: PriceHistoryGraphProps) {
  const [points, setPoints] = useState<HistoryPoint[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/markets/${marketId}/history`)
      .then((res) => {
        if (cancelled) return;
        setPoints((res.data?.data?.points as HistoryPoint[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [marketId]);

  const hasSeries = points !== null && points.length >= 2;

  return (
    <Card className="border-white/5 bg-[#0A0A0A] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            Probability history (YES)
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-3xl font-bold",
                color === "#EF4444" ? "text-red-500" : "text-green-500"
              )}
            >
              {currentProbability.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              from {points?.length ?? 0} bet{points?.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {hasSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#333"
                opacity={0.5}
              />
              <XAxis dataKey="t" hide />
              <YAxis
                domain={[0, 100]}
                orientation="right"
                tick={{ fill: "#666", fontSize: 12 }}
                tickFormatter={(val) => `${val}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as HistoryPoint;
                    return (
                      <div className="rounded border border-white/10 bg-black/90 p-2 shadow-xl">
                        <p className="font-bold text-white">
                          {point.yesPercent.toFixed(1)}% YES
                        </p>
                        <p className="text-xs text-white/50">
                          {point.volume.toFixed(3)} SOL staked ·{" "}
                          {new Date(point.t).toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="yesPercent"
                stroke={color}
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-white/60">
              {failed
                ? "Couldn't load this market's history."
                : "Not enough bets yet to draw a history."}
            </p>
            <p className="mt-1 max-w-sm text-xs text-white/35">
              The line appears once at least two bets have been placed — it is built
              from real on-chain stakes, not simulated.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
