"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/app/utils/utils";

interface PriceHistoryGraphProps {
  currentProbability: number;
  color?: string;
}

const TIME_RANGES = ["1H", "1D", "1W", "1M", "ALL"];

export function PriceHistoryGraph({ currentProbability, color = "#10B981" }: PriceHistoryGraphProps) {
  const [timeRange, setTimeRange] = useState("1D");
  const [data, setData] = useState<{ date: number; value: number }[]>([]);

  useEffect(() => {
    const points: { date: number; value: number }[] = [];
    const pointsCount = 50;
    let value = currentProbability;
    
    // Generate points backwards from current probability
    for (let i = 0; i < pointsCount; i++) {
      points.unshift({
        date: i,
        value: Math.max(1, Math.min(99, value))
      });
      // Random walk with mean reversion to keep it somewhat realistic
      const change = (Math.random() - 0.5) * 5;
      value = value - change;
    }
    setData(points);
  }, [currentProbability, timeRange]);

  return (
    <Card className="bg-[#0A0A0A] border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Probability History (YES)</h3>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", color === "#EF4444" ? "text-red-500" : "text-green-500")}>
              {currentProbability.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
               Current Price
            </span>
          </div>
        </div>
        <div className="flex bg-secondary/20 rounded-lg p-1 gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                timeRange === range 
                  ? "bg-secondary text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              hide
            />
            <YAxis 
              domain={[0, 100]} 
              orientation="right"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(val) => `${val}%`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black/90 border border-white/10 p-2 rounded shadow-xl">
                      <p className="text-white font-bold">
                        {Number(payload[0].value).toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fill="url(#colorGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
