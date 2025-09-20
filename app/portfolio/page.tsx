"use client"
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  BarChart3,
  DollarSign,
  Clock,
  Filter,
  ChevronDown,
  Activity,
  Target
} from 'lucide-react';

interface PortfolioDashboardProps { }

export default function Portfolio(PortfolioDashboardProps) {

  const [activeTab, setActiveTab] = useState('Winning Up');

  return (
    <div className="min-h-screen text-white p-6">
      {/* Portfolio Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              Your Portfolio
            </h1>
            <p className="text-gray-400">Track all your positions, analyze gains and losses, and view your trading performance</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm hover:border-gray-500 transition-colors">
              Buy for Friends
            </button>
            <button className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm hover:border-gray-500 transition-colors">
              Receive Funds
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
              Deposit Funds
            </button>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="flex gap-4 text-sm mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Profit</span>
            <span className="text-green-400">$9,991</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Invested</span>
            <span className="text-white">$1,798</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">Bets</span>
            <span className="text-white">8,046</span>
          </div>
        </div>

        {/* Portfolio Value Card */}
        <div className="border border-gray-700 rounded-xl p-6 mb-8">
          <div className="text-center">
            <h3 className="text-gray-400 mb-2">Portfolio Value</h3>
            <div className="text-4xl font-bold text-purple-400 mb-4">$15,642.50</div>
            <div className="text-green-400 text-sm">+7.02% since last 24h*</div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="text-green-400 text-sm mb-1">+20 Day</div>
              <div className="text-green-400 text-xl font-bold">+$2,916.75</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 text-sm mb-1">-7 Day</div>
              <div className="text-red-400 text-xl font-bold">$194.20</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-sm mb-1">+1 7 Day</div>
              <div className="text-green-400 text-xl font-bold">+$3,019.75</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Total Bets</div>
            <div className="text-white text-xl font-bold">12k</div>
            <div className="text-gray-400 text-xs">All time bets</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Active Positions</div>
            <div className="text-white text-xl font-bold">56</div>
            <div className="text-gray-400 text-xs">Currently trading</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Watchlist</div>
            <div className="text-white text-xl font-bold">8,790</div>
            <div className="text-gray-400 text-xs">Total value</div>
          </div>
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Volume</div>
            <div className="text-white text-xl font-bold">+$3,076.25</div>
            <div className="text-green-400 text-xs">+7.56% from market</div>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Active Positions</h2>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'Winning Up' ? 'bg-purple-600 text-white' : 'border border-gray-600 text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('Winning Up')}
            >
              Winning Up
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'Losing Up' ? 'bg-purple-600 text-white' : 'border border-gray-600 text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('Losing Up')}
            >
              Losing Up
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-6">Your active positions and predictions with unrealized gains/losses</p>

        <div className="space-y-4">
          {/* Position Item */}
          <div className="border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">+$13.85</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>Active Position</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm">Value</div>
                <div className="text-white">$87</div>
              </div>
            </div>
          </div>

          {[
            {
              question: "Will BTC reach $60,000 by March 2024?",
              position: "YES",
              shares: "100 shares",
              avgPrice: "$0.67",
              currentPrice: "$0.73",
              value: "$213.24",
              pnl: "+$15.68",
              status: "Close Position",
              positive: true
            },
            {
              question: "Will ETH reach $5000 by Q4 2024?",
              position: "NO",
              shares: "150 shares",
              avgPrice: "$0.33",
              currentPrice: "$0.29",
              value: "$205.93",
              pnl: "-$8.42",
              status: "Close Position",
              positive: false
            },
            {
              question: "Will SOL hit new ATH this quarter?",
              position: "YES",
              shares: "75 shares",
              avgPrice: "$0.52",
              currentPrice: "$0.61",
              value: "$198.14",
              pnl: "+$12.88",
              status: "Close Position",
              positive: true
            },
            {
              question: "Will Coinbase list PEPE this year?",
              position: "NO",
              shares: "200 shares",
              avgPrice: "$0.18",
              currentPrice: "$0.22",
              value: "$276.32",
              pnl: "+$18.44",
              status: "Close Position",
              positive: true
            },
            {
              question: "Will US recognize ETH this session?",
              position: "YES",
              shares: "90 shares",
              avgPrice: "$0.41",
              currentPrice: "$0.38",
              value: "$435.54",
              pnl: "-$7.23",
              status: "Close Position",
              positive: false
            }
          ].map((position, index) => (
            <div key={index} className="border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-2 max-w-md">{position.question}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${position.position === 'YES' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {position.position}
                    </span>
                    <span className="text-gray-400">{position.shares}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold mb-2">{position.value}</div>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    {position.status}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Avg Price</div>
                  <div className="text-white">{position.avgPrice}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Current Price</div>
                  <div className="text-white">{position.currentPrice}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">P&L</div>
                  <div className={position.positive ? 'text-green-400' : 'text-red-400'}>
                    {position.pnl}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position History */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Position History</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
              Win Rate
            </button>
            <button className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
              Calendar
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">Complete record of your resolved positions and trading performance</p>

        {/* History Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Total Realized P&L</div>
            <div className="text-green-400 text-2xl font-bold">+$822.10</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Win Rate</div>
            <div className="text-white text-2xl font-bold">68.7%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Profit per Trade</div>
            <div className="text-green-400 text-2xl font-bold">$198.65</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
            Won (24)
          </button>
          <button className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg text-sm hover:text-white transition-colors">
            Lost (12)
          </button>
        </div>

        {/* History Items */}
        <div className="space-y-4">
          {[
            {
              question: "Will Bitcoin reach $100,000 by end of 2024?",
              date: "Oct 15, 2023",
              position: "YES",
              shares: "50 shares",
              result: "Won",
              pnl: "+$154.32",
              positive: true
            },
            {
              question: "Will Ethereum 2.0 merge complete without issues?",
              date: "Sep 20, 2023",
              position: "YES",
              shares: "75 shares",
              result: "Won",
              pnl: "+$89.45",
              positive: true
            },
            {
              question: "Will Doge break above $1.00 in 2024?",
              date: "Aug 15, 2023",
              position: "NO",
              shares: "100 shares",
              result: "Lost",
              pnl: "-$65.20",
              positive: false
            },
            {
              question: "Will SEC approve Bitcoin ETF by August?",
              date: "Jul 28, 2023",
              position: "YES",
              shares: "120 shares",
              result: "Won",
              pnl: "+$234.67",
              positive: true
            },
            {
              question: "Will major cryptocurrency exchange launch?",
              date: "Jun 12, 2023",
              position: "NO",
              shares: "80 shares",
              result: "Lost",
              pnl: "-$45.12",
              positive: false
            },
            {
              question: "Will DXY stocks up 50% by Q4 2024?",
              date: "May 3, 2023",
              position: "YES",
              shares: "60 shares",
              result: "Won",
              pnl: "+$178.90",
              positive: true
            }
          ].map((item, index) => (
            <div key={index} className="border border-gray-700 rounded-xl p-6 flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 ${item.positive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <div>
                  <h4 className="text-white font-medium mb-2">{item.question}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{item.date}</span>
                    <span className={`px-2 py-1 rounded text-xs ${item.position === 'YES' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {item.position}
                    </span>
                    <span>{item.shares}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {item.pnl}
                </div>
                <div className="text-gray-400 text-sm">{item.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics & Analytics */}
      <div>
        <h2 className="text-xl font-bold mb-6">Statistics & Analytics</h2>
        <p className="text-gray-400 text-sm mb-6">Deep dive into your trading performance and market insights</p>

        <div className="flex justify-center mb-8">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Portfolio by Category */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Portfolio by Category</h3>
            <div className="space-y-3">
              {[
                { category: "Crypto Coins", percentage: "45%", color: "bg-purple-500" },
                { category: "DeFi Events", percentage: "25%", color: "bg-blue-500" },
                { category: "Tech Stocks", percentage: "15%", color: "bg-green-500" },
                { category: "Sports", percentage: "10%", color: "bg-yellow-500" },
                { category: "Celebrity Culture", percentage: "3%", color: "bg-red-500" },
                { category: "AI & Gaming", percentage: "2%", color: "bg-pink-500" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-gray-300">{item.category}</span>
                  </div>
                  <span className="text-white font-medium">{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy by Market Type */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Accuracy by Market Type</h3>
            <div className="space-y-3">
              {[
                { market: "Meme Coins", accuracy: "89%", color: "text-green-400" },
                { market: "Crypto Stocks", accuracy: "76%", color: "text-green-400" },
                { market: "Tech Events", accuracy: "71%", color: "text-green-400" },
                { market: "Political", accuracy: "65%", color: "text-yellow-400" },
                { market: "Celebrity Crypto", accuracy: "52%", color: "text-red-400" },
                { market: "AI & Gaming", accuracy: "48%", color: "text-red-400" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.market}</span>
                  <span className={`font-medium ${item.color}`}>{item.accuracy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Best Streak Comparison</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Your Best Streak</span>
                <span className="text-green-400 font-medium">12 wins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Your Worst Streak</span>
                <span className="text-red-400 font-medium">4 losses</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Top Profit Comparison</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Your Top Trade</span>
                <span className="text-green-400 font-medium">+$456.78</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Your Worst Trade</span>
                <span className="text-red-400 font-medium">-$89.32</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

