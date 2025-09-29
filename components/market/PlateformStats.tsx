import {
  Activity,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function PlatformStats() {
  const stats = [
    { icon: DollarSign, value: "$2.4M+", label: "Total Volume", desc: "Traded across all markets" },
    { icon: Users, value: "8,924", label: "Active Traders", desc: "Making predictions daily" },
    { icon: Activity, value: "156", label: "Active Markets", desc: "Live prediction markets" },
    { icon: Target, value: "89.2%", label: "Accuracy Rate", desc: "Average prediction accuracy" },
    { icon: TrendingUp, value: "+34%", label: "Growth", desc: "Monthly trading growth" },
    { icon: Zap, value: "~2s", label: "Settlement", desc: "Average settlement time" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 py-12">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="
              relative overflow-hidden
              rounded-2xl p-8 text-center
              bg-gradient-to-b from-[#111] via-[#0c0c0c] to-[#0a0a0a]
              border border-[#1c1c1c]
              shadow-[0_4px_20px_rgba(0,0,0,0.6)]
              hover:shadow-[0_6px_24px_rgba(0,0,0,0.8)]
              transition-all
            "
          >
            {/* Foreground small icon with glow */}
            <div className="relative flex items-center justify-center w-12 h-12 mx-auto mb-6 rounded-lg bg-purple-500/10 z-10">
              <Icon className="w-6 h-6 text-purple-400" />
              <div className="absolute inset-0 rounded-lg bg-purple-500/5 blur-md" />
            </div>

            {/* Text */}
            <div className="text-3xl font-bold text-white mb-2 z-10 relative">
              {stat.value}
            </div>
            <div className="text-gray-300 font-medium z-10 relative">{stat.label}</div>
            <div className="text-gray-500 text-sm mt-1 z-10 relative">{stat.desc}</div>

            {/* Background watermark icon */}
            <Icon
              className="absolute right-4 bottom-4 w-24 h-24 text-gray-500/5"
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
