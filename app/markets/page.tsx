import React from 'react';
import {
  Bitcoin,
  TrendingUp,
  Diamond,
  Star,
  Gamepad2,
  BarChart3,
  DollarSign,
  Users,
  Activity,
  Target,
  Zap,
  ArrowRight,
  ExternalLink,
  Menu
} from 'lucide-react';

interface PredictionMarketsProps { }


export default function Markets(PredictionMarketsProps: any) {
  return (
    <div className="min-h-screen text-white">


      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Prediction Markets
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Harness the power of collective intelligence. Bet on outcomes,
          predict the future, and earn rewards based on your accuracy
          and insights.
        </p>
        <p className="text-gray-400 mb-8">
          Join thousands of traders making informed predictions on everything
          from politics to technology, sports to economics.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
            Start Trading
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-6 py-3 border border-gray-600 text-white rounded-lg font-medium hover:border-gray-500 transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-2 border border-gray-600 rounded-full text-sm mb-8">
          Market Categories
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: 'Crypto Coins', subtitle: 'Price predictions', count: '89', Icon: Bitcoin },
            { title: 'Crypto Predictions', subtitle: 'Market trends', count: '156', Icon: TrendingUp },
            { title: 'DeFi Events', subtitle: 'Protocol launches', count: '43', Icon: Diamond },
            { title: 'Celebrity Crypto', subtitle: 'Celebrity endorsements', count: '67', Icon: Star },
            { title: 'AI & Gaming', subtitle: 'Technology adoption', count: '34', Icon: Gamepad2 },
            { title: 'Market Events', subtitle: 'Economic indicators', count: '78', Icon: BarChart3 }
          ].map((category, index) => (
            <div key={index} className="border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
              <category.Icon className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-right text-2xl font-bold text-green-400 mb-2">{category.count}</div>
              <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
              <p className="text-gray-400 text-sm">{category.subtitle}</p>
            </div>
          ))}
        </div>
        <button className="mt-8 px-6 py-3 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition-colors flex items-center gap-2 mx-auto">
          View All Categories
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Popular Markets Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-6">
            Browse all active prediction markets that offer the best trading opportunities
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-4 py-2 text-white border-b-2 border-purple-500">All</button>
            <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Active Now</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 m-6">
          {[
            { question: "Will BTC reach $50k by March 2024?", yes: "73%", no: "27%", volume: "$24k", traders: "892", days: "156" },
            { question: "Will ETH hit new ATH this quarter?", yes: "64%", no: "36%", volume: "$18k", traders: "654", days: "89" },
            { question: "Will SOL break top 3 by market cap?", yes: "41%", no: "59%", volume: "$31k", traders: "1.2k", days: "234" },
            { question: "Will governance token surge 100%+?", yes: "58%", no: "42%", volume: "$12k", traders: "445", days: "67" },
            { question: "Will major DeFi hack occur this quarter?", yes: "33%", no: "67%", volume: "$8k", traders: "234", days: "123" },
            { question: "Will meme coins crash 50% next month?", yes: "69%", no: "31%", volume: "$15k", traders: "567", days: "45" },
            { question: "Will new CEX get regulatory approval?", yes: "84%", no: "16%", volume: "$19k", traders: "789", days: "178" },
            { question: "Will AI integration drive new token?", yes: "44%", no: "56%", volume: "$22k", traders: "934", days: "201" },
            { question: "Will staking consensus change soon?", yes: "39%", no: "61%", volume: "$9k", traders: "312", days: "89" }
          ].map((market, index) => (
            <div key={index} className="border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
              <h4 className="text-white font-medium mb-4 text-sm leading-relaxed">{market.question}</h4>
              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <div className="text-green-400 text-2xl font-bold">{market.yes}</div>
                  <div className="text-gray-400 text-xs">YES</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-2xl font-bold">{market.no}</div>
                  <div className="text-gray-400 text-xs">NO</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
                <div>
                  <div className="text-white">{market.volume}</div>
                  <div>Volume</div>
                </div>
                <div>
                  <div className="text-white">{market.traders}</div>
                  <div>Traders</div>
                </div>
                <div>
                  <div className="text-white">{market.days}</div>
                  <div>Days left</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                  Buy Yes
                </button>
                <button className="flex-1 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                  Buy No
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto">
            Explore Markets
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-2 border border-gray-600 rounded-full text-sm mb-8">
          Platform Stats
        </div>
        <p className="text-gray-400 mb-8">Real-time statistics showcasing our market's growth and activity</p>

        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
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
      </div>

      {/* CTA Section */}
      <div className="text-center mb-16 py-12">
        <h2 className="text-4xl font-bold mb-4">Ready to start trading?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of traders making informed predictions and earning rewards based on their market insights.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
            Explore Markets
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 border border-gray-600 text-white rounded-lg font-medium hover:border-gray-500 transition-colors">
            Learn More
          </button>
        </div>
      </div>


    </div>
  );
};