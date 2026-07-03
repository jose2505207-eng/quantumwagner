"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import type { Position } from "@/store/types/user/postionType";

interface Props {
  /** The user's REAL positions — the chart is derived from them, never faked. */
  positions: Position[];
}

/**
 * Cumulative SOL wagered over time, built from the positions' real
 * `created_at` / `amount_staked`. No positions -> honest empty state.
 */
export function PortfolioChart({ positions }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, totalWagered } = useMemo(() => {
    const sorted = [...positions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let running = 0;
    const points = sorted.map((p) => {
      running += Number(p.amount_staked) || 0;
      return {
        name: new Date(p.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        value: Number(running.toFixed(4)),
      };
    });
    return { data: points, totalWagered: running };
  }, [positions]);

  if (!mounted) return <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-xl" />;

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">Total Wagered</CardTitle>
        <div className="text-3xl font-bold text-white">
          {totalWagered.toFixed(2)} SOL
        </div>
        <div className="text-sm text-muted-foreground">
          across {positions.length} position{positions.length === 1 ? "" : "s"} (devnet)
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {data.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
              <BarChart3 className="w-8 h-8 mb-3 opacity-50" />
              <p className="text-sm">No activity yet — place a prediction to see your chart.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value} SOL`, "Wagered"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
