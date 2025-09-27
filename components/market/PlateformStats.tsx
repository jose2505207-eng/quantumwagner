import {
  Activity,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function PlatformStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 py-12">
      <div className="border border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
        <DollarSign className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <div className="text-3xl font-bold mb-2">$2.4M+</div>
        <div className="text-gray-400">Total Volume</div>
        <div className="text-green-400 text-sm mt-1">+23% this month</div>
      </div>
      <div className="border border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
        <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <div className="text-3xl font-bold mb-2">8,924</div>
        <div className="text-gray-400">Active Traders</div>
        <div className="text-green-400 text-sm mt-1">+15% this week</div>
      </div>
      <div className="border border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
        <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <div className="text-3xl font-bold mb-2">156</div>
        <div className="text-gray-400">Active Markets</div>
        <div className="text-green-400 text-sm mt-1">+8 new today</div>
      </div>
      <div className="border border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
        <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <div className="text-3xl font-bold mb-2">89.2%</div>
        <div className="text-gray-400">Accuracy Rate</div>
        <div className="text-green-400 text-sm mt-1">Top 10% traders</div>
      </div>
      <div className="border border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
        <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <div className="text-3xl font-bold mb-2">+34%</div>
        <div className="text-gray-400">Returns</div>
        <div className="text-green-400 text-sm mt-1">Average monthly</div>
      </div>
      <div className="border border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
        <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <div className="text-3xl font-bold mb-2">~2s</div>
        <div className="text-gray-400">Settlement</div>
        <div className="text-green-400 text-sm mt-1">Average time</div>
      </div>
    </div>
  );
}
