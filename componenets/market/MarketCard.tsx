import {  Users } from 'lucide-react';
import YesButton from './YesButton';

  interface Market {
    id: number;
    question: string;
    yesPercent: number;
    noPercent: number;
    yesVolume: string;
    noVolume: string;
    totalBets: number;
    endsIn?: string;
  }

  const MarketCard = ({ market, isFeatured = false }: { market: Market, isFeatured?: boolean }) => (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 ${isFeatured ? 'mb-8' : 'mb-4'} hover:border-gray-700 transition-colors`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-white font-medium ${isFeatured ? 'text-xl' : 'text-base'}`}>
          {market.question}
        </h3>
        {isFeatured && (
          <span className="text-gray-400 text-sm">Ends in {market.endsIn}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-semibold text-lg">{market.yesPercent}%</span>
            <span className="text-green-400 text-sm">YES ODDS</span>
          </div>
          <div className="text-gray-300 text-sm mb-2">{market.yesVolume}</div>
          {/* <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition-colors">
            Bet YES
          </button> */}

          {/* <YesButton onClick={()=>{console.log();
          }}></YesButton> */}
        </div>

        <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 font-semibold text-lg">{market.noPercent}%</span>
            <span className="text-red-400 text-sm">NO ODDS</span>
          </div>
          <div className="text-gray-300 text-sm mb-2">{market.noVolume}</div>
          {/* <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition-colors">
            Bet NO
          </button> */}

          
        </div>
      </div>

      <div className="flex items-center text-gray-400 text-sm">
        <Users className="w-4 h-4 mr-1" />
        {market.totalBets} bets
      </div>
    </div>
  );

  export default MarketCard;