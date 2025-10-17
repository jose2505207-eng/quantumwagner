import { Market, MarketStatus } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatsProps {
  markets: Market[];
}

export default function Stats({ markets }: StatsProps) {
  const stats = {
    active: markets.filter((m) => m.status === MarketStatus.ACTIVE).length,
    resolved: markets.filter((m) => m.status === MarketStatus.RESOLVED).length,
    cancelled: markets.filter((m) => m.status === MarketStatus.CANCELLED)
      .length,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-black/30 backdrop-blur-xl border border-border">
        <CardHeader>
          <CardTitle className="text-sm">Active Markets</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-green-400">
          {stats.active}
        </CardContent>
      </Card>
      <Card className="bg-black/30 backdrop-blur-xl border border-border">
        <CardHeader>
          <CardTitle className="text-sm">Resolved Markets</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-blue-400">
          {stats.resolved}
        </CardContent>
      </Card>
      <Card className="bg-black/30 backdrop-blur-xl border border-border">
        <CardHeader>
          <CardTitle className="text-sm">Cancelled Markets</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-red-400">
          {stats.cancelled}
        </CardContent>
      </Card>
    </div>
  );
}
