"use client"
import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  Target,
  Crown,
  Diamond,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Plus
} from 'lucide-react';

const CoinBuzzLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('Total PnL');
  const [timeframe, setTimeframe] = useState('All Time');

  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      value: "12,847",
      label: "Active Traders"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      value: "$2.4M",
      label: "Total Volume"
    },
    {
      icon: <Trophy className="w-6 h-6 text-purple-400" />,
      value: "1,289",
      label: "Elite Members"
    },
    {
      icon: <Target className="w-6 h-6 text-yellow-400" />,
      value: "89.4%",
      label: "Top Win Rate"
    }
  ];

  const topPredictors = [
    {
      rank: 1,
      name: "CryptoProphet",
      tier: "Premium",
      profit: "$125,420",
      winRate: "89.4%",
      markets: "234",
      accuracy: "87.2%",
      avatar: "C",
      color: "bg-purple-600",
      change: "up"
    },
    {
      rank: 2,
      name: "DiamondHands",
      tier: "Premium",
      profit: "$98,650",
      winRate: "86.1%",
      markets: "189",
      accuracy: "85.8%",
      avatar: "D",
      color: "bg-blue-600",
      change: "up"
    },
    {
      rank: 3,
      name: "MemeKing",
      tier: "Gold",
      profit: "$87,340",
      winRate: "84.7%",
      markets: "156",
      accuracy: "83.4%",
      avatar: "M",
      color: "bg-emerald-600",
      change: "up"
    },
    {
      rank: 4,
      name: "DegenWizard",
      tier: "Gold",
      profit: "$76,890",
      winRate: "82.3%",
      markets: "203",
      accuracy: "81.9%",
      avatar: "D",
      color: "bg-purple-600",
      change: "down"
    },
    {
      rank: 5,
      name: "CoinSeer",
      tier: "Gold",
      profit: "$65,420",
      winRate: "80.8%",
      markets: "145",
      accuracy: "79.6%",
      avatar: "C",
      color: "bg-orange-600",
      change: "down"
    }
  ];

  const achievements = [
    {
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      title: "First Victory",
      description: "Win your first prediction",
      completed: true
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      title: "Hot Streak",
      description: "Win 5 predictions in a row",
      completed: true
    },
    {
      icon: <Diamond className="w-6 h-6 text-cyan-400" />,
      title: "Diamond Hands",
      description: "Hold a position for 30+ days",
      completed: true
    },
    {
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      title: "Profit King",
      description: "Earn $10,000 total profit",
      progress: 42
    },
    {
      icon: <Target className="w-6 h-6 text-green-400" />,
      title: "Accuracy Master",
      description: "Maintain accuracy over 50 trades",
      progress: 68
    },
    {
      icon: <Star className="w-6 h-6 text-purple-400" />,
      title: "Elite Trader",
      description: "Reach top 1000 on leaderboard",
      progress: 30
    }
  ];

  const tabs = ['Total PnL', 'Win Rate', 'Volume', 'Accuracy', 'Category', 'AI', 'Memecoins', 'DeFi', 'NFT', 'Gaming'];
  const timeframes = ['All Time', 'Monthly', 'Weekly', 'Daily'];

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-semibold">Top Traders Leaderboard</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Rise to the Top of<br />CoinBuzz Elite
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compete with the best traders, climb the rankings, and earn exclusive rewards. 
            Track your performance against the community's top predictors.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900/50 rounded-xl p-6 text-center backdrop-blur-sm border border-gray-800">
              <div className="flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Leaderboard */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-gray-400 mr-4">Period:</span>
                {timeframes.map((timeframe, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-400 mr-4">Rank by:</span>
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      activeTab === tab
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Predictors List */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Top Predictors</h3>
                  <span className="text-gray-400 text-sm">Updated every 5 minutes</span>
                </div>
              </div>

              <div className="divide-y divide-gray-800">
                {topPredictors.map((predictor, index) => (
                  <div key={index} className="p-6 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400 font-medium">#{predictor.rank}</span>
                          {predictor.change === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        
                        <div className={`w-12 h-12 rounded-full ${predictor.color} flex items-center justify-center font-bold text-white`}>
                          {predictor.avatar}
                        </div>
                        
                        <div>
                          <div className="font-semibold text-white">{predictor.name}</div>
                          <div className="text-sm text-yellow-400">{predictor.tier}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">{predictor.profit}</div>
                          <div className="text-xs text-gray-400">Profit</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold">{predictor.winRate}</div>
                          <div className="text-xs text-gray-400">Win Rate</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold">{predictor.markets}</div>
                          <div className="text-xs text-gray-400">Markets</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold">{predictor.accuracy}</div>
                          <div className="text-xs text-gray-400">Accuracy</div>
                        </div>
                        
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 text-center">
                <button className="text-purple-400 hover:text-purple-300 font-medium">
                  Load More Rankings
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - User Stats & Achievements */}
          <div className="space-y-6">
            {/* Your Ranking */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">Your Ranking</span>
                </div>
                <span className="text-xs text-gray-400">Current position on leaderboard</span>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">#1,247</div>
                <div className="flex items-center justify-center text-green-400 text-sm mb-4">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+23 positions this week</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Progress to Top 1000</span>
                    <span className="text-white">247 spots to go</span>
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <div>
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Total Profit</span>
                      </div>
                      <div className="text-white font-semibold">$4,250</div>
                      <div className="text-xs text-gray-400">+4 trades $10,000</div>
                    </div>

                    <div>
                      <div className="flex items-center text-blue-400">
                        <Target className="w-4 h-4 mr-1" />
                        <span>Win Rate</span>
                      </div>
                      <div className="text-white font-semibold">72.4%</div>
                      <div className="text-xs text-gray-400">+8 trades 75%</div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div className="text-gray-400">Markets Traded</div>
                    <div className="text-white">23</div>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <div className="text-gray-400 mb-2">Recent Performance</div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-green-400">
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="font-semibold">+$420</span>
                        <span className="text-xs text-gray-400 ml-2">24H</span>
                      </div>
                      <div className="flex items-center text-red-400">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span className="font-semibold">-$180</span>
                        <span className="text-xs text-gray-400 ml-2">7D</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 rounded-lg py-2 text-sm font-medium transition-colors">
                    View Full Portfolio
                  </button>
                </div>
              </div>
            </div>

            {/* Achievement System */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">Achievement System</span>
                </div>
                <button className="text-purple-400 hover:text-purple-300 text-sm">
                  Share Achievements
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Collection Progress</span>
                  <span className="text-white">50%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '50%'}}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">3/6 unlocked • 50% complete</div>
              </div>

              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${achievement.completed ? 'bg-green-900/50' : 'bg-gray-800'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${achievement.completed ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                      {achievement.progress && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-800 rounded-full h-1">
                            <div 
                              className="bg-purple-600 h-1 rounded-full" 
                              style={{width: `${achievement.progress}%`}}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{achievement.progress}%</span>
                        </div>
                      )}
                    </div>
                    {achievement.completed && (
                      <div className="text-green-400">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinBuzzLeaderboard;