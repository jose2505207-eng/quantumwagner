import { Market, MarketStatus } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, Users, TrendingUp } from "lucide-react";

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

  const cards = [
    {
      title: "Active Markets",
      value: stats.active,
      icon: <TrendingUp className="w-6 h-6 text-pink-400" />,
      glowTopRight: "rgba(236,72,153,0.6)", // pink
      glowBottomLeft: "rgba(168,85,247,0.4)", // purple
    },
    {
      title: "Resolved Markets",
      value: stats.resolved,
      icon: <Users className="w-6 h-6 text-blue-400" />,
      glowTopRight: "rgba(59,130,246,0.6)", // blue
      glowBottomLeft: "rgba(34,211,238,0.4)", // cyan
    },
    {
      title: "Cancelled Markets",
      value: stats.cancelled,
      icon: <DollarSign className="w-6 h-6 text-red-400" />,
      glowTopRight: "rgba(239,68,68,0.6)", // red
      glowBottomLeft: "rgba(249,115,22,0.4)", // orange
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <Card
          key={i}
          className="relative overflow-hidden bg-black/40 border border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
        >
          {/* top-right glow */}
          <div
            className="absolute w-32 h-32 blur-3xl rounded-full"
            style={{
              background: card.glowTopRight,
              top: "-40px",
              right: "-40px",
              opacity: 0.8,
            }}
          />
          {/* bottom-left glow */}
          <div
            className="absolute w-32 h-32 blur-3xl rounded-full"
            style={{
              background: card.glowBottomLeft,
              bottom: "-40px",
              left: "-40px",
              opacity: 0.7,
            }}
          />

          <CardHeader className="relative z-10 flex items-center gap-2">
            {card.icon}
            <CardTitle className="text-sm text-gray-300">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 text-3xl font-bold text-white">
            {card.value}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
