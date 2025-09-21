"use client"

import { Button } from '@/componenets/button/primary';
// import { Button } from '@/componenets/button/primary';
import Faq from '@/componenets/landing/FAQ';
import HeroSection from '@/componenets/landing/Hero';
import MarketCard from '@/componenets/market/MarketCard';
import { motion } from 'framer-motion';

export default function Home() {


  const featuredMarkets = [
    {
      id: 1,
      question: "Will DOGE reach $1.00 by end of Q1 2025?",
      yesPercent: 68,
      noPercent: 32,
      yesVolume: "$124K",
      noVolume: "$57K",
      totalBets: 1247,
      endsIn: "43 days"
    }
  ];

  const popularMarkets = [
    {
      id: 2,
      question: "Will SHIB reach $0.001 by March 2025?",
      yesPercent: 23,
      noPercent: 77,
      yesVolume: "$85K",
      noVolume: "$92K",
      totalBets: 834
    },
    {
      id: 3,
      question: "Will PEPE hit new ATH this quarter?",
      yesPercent: 64,
      noPercent: 36,
      yesVolume: "$156K",
      noVolume: "$87K",
      totalBets: 1243
    },
    {
      id: 4,
      question: "Will any meme coin flip ETH market cap?",
      yesPercent: 8,
      noPercent: 92,
      yesVolume: "$267K",
      noVolume: "$2.1M",
      totalBets: 892
    },
    {
      id: 5,
      question: "Will BONK 50x from current price by 2025?",
      yesPercent: 41,
      noPercent: 59,
      yesVolume: "$94K",
      noVolume: "$127K",
      totalBets: 743
    },
    {
      id: 6,
      question: "Will WIF reach $20 this year?",
      yesPercent: 35,
      noPercent: 65,
      yesVolume: "$203K",
      noVolume: "$371K",
      totalBets: 1564
    },
    {
      id: 7,
      question: "Will Elon tweet about DOGE this week?",
      yesPercent: 78,
      noPercent: 22,
      yesVolume: "$54K",
      noVolume: "$15K",
      totalBets: 967
    }
  ];


  return (
    < motion.div initial={{ opacity: 0, y: 30 }}   // 👈 before animation
      animate={{ opacity: 1, y: 0 }}    // 👈 after animation
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-black text-white">
      <div className="min-h-screen text-white relative">
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">

          {/* Hero Section */}
          <HeroSection></HeroSection>

          {/* Featured Market */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Market</h2>
              <span className="text-gray-400">Ends in 43 days</span>
            </div>

            {featuredMarkets.map(market => (
              <MarketCard key={market.id} market={market} isFeatured={true} />
            ))}
          </section>

          {/* Popular Markets */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Popular Markets</h2>
                <p className="text-purple-400">Trade with confidence</p>
              </div>
              <p className="text-gray-400 text-sm max-w-xs text-right">
                Join thousands of traders making predictions on the most exciting crypto markets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularMarkets.map(market => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>

            <div className="text-center mt-8">

              <Button> View All Markets</Button>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <Faq></Faq>
          </section>
        </main>

      </div>

    </motion.div>
  );
}