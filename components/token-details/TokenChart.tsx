"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

// Generate some realistic-looking random price data
const generateData = (timeFrame: string) => {
  const data: { time: string; value: number }[] = [];
  let price = 1.20;
  const now = new Date();
  let points = 24;
  let interval = 60 * 60 * 1000; // 1 hour default

  switch (timeFrame) {
    case '1H':
      points = 60;
      interval = 60 * 1000; // 1 minute
      break;
    case '24H':
      points = 24;
      interval = 60 * 60 * 1000; // 1 hour
      break;
    case '7D':
      points = 28; // 4 points per day
      interval = 6 * 60 * 60 * 1000; // 6 hours
      break;
    case '1M':
      points = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
  }
  
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - 1 - i) * interval);
    const change = (Math.random() - 0.45) * 0.2; // Random walk
    price = Math.max(0.1, price + change);
    
    data.push({
      time: time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        month: timeFrame === '1M' || timeFrame === '7D' ? 'short' : undefined,
        day: timeFrame === '1M' || timeFrame === '7D' ? 'numeric' : undefined
      }),
      value: price,
    });
  }
  return data;
};

export function TokenChart({ tokenSymbol }: { tokenSymbol: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeFrame, setTimeFrame] = useState('24H');
  const [data, setData] = useState<{ time: string; value: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    setMounted(true);
    const initialData = generateData(timeFrame);
    setData(initialData);
    
    const lastPrice = initialData[initialData.length - 1].value;
    const firstPrice = initialData[0].value;
    setCurrentPrice(lastPrice);
    setPriceChange(((lastPrice - firstPrice) / firstPrice) * 100);

    // Simulate live updates
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const newPrice = Math.max(0.1, last.value + (Math.random() - 0.5) * 0.05);
        const newPoint = {
          time: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            month: timeFrame === '1M' || timeFrame === '7D' ? 'short' : undefined,
            day: timeFrame === '1M' || timeFrame === '7D' ? 'numeric' : undefined
          }),
          value: newPrice
        };
        const newData = [...prev.slice(1), newPoint];
        
        setCurrentPrice(newPrice);
        setPriceChange(((newPrice - prev[0].value) / prev[0].value) * 100);
        
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [timeFrame]);

  if (!mounted) return <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-3xl" />;

  const isPositive = priceChange >= 0;

  return (
    <Card className="bg-[#0A0A0A] border-white/10 h-full overflow-hidden relative group flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <CardHeader className="border-b border-white/5 pb-4 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Price Action
            </CardTitle>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white font-mono">
                ${currentPrice.toFixed(4)}
              </span>
              <div className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${
                isPositive 
                  ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" 
                  : "text-rose-400 bg-rose-400/10 border border-rose-400/20"
              }`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {['1H', '24H', '7D', '1M'].map((tf) => (
              <button 
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  timeFrame === tf 
                    ? "bg-white/10 text-white" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <div className="h-full w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 10 }} 
                minTickGap={30}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 10 }} 
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0A0A0A', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ color: '#888', marginBottom: '4px' }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, "Price"]}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#10b981" : "#f43f5e"} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
