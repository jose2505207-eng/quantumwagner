import { TrendingUp } from "lucide-react";
import { Button } from "../button/primary";

export default function HeroSection() {
    return (

        <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="text-gray-400">Meme Coin Prediction Market</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Bet on Meme Coin
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Futures
                </span>

            </h1>

            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Predict the future of meme coins, earn rewards, and climb the leaderboard. Join the most exciting prediction market in crypto.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">

                <Button>  Start Predicting</Button>
                <Button> View Markets</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">$2.4M+</div>
                    <div className="text-gray-400">Total Volume</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">156</div>
                    <div className="text-gray-400">Active Markets</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-pink-400 mb-2">8,924</div>
                    <div className="text-gray-400">Top Predictors</div>
                </div>
            </div>
        </div>

    )
}