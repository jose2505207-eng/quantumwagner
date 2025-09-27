import { Market } from "@/app/types";
import CountdownTimer from "@/app/hooks/CountdownTimer";

const MarketCard = ({ market }: { market: Market }) => {
  const isFeatured = market.featured;

  if (isFeatured) {
    // 🌟 Featured Market UI
    return (
      <div
        className="relative rounded-xl p-5 
          bg-gradient-to-br from-purple-900/30 via-black/40 to-purple-800/20 
          border border-purple-400/30 hover:border-purple-400/60
          shadow-lg hover:shadow-purple-500/20
          transform hover:-translate-y-1 hover:scale-[1.02]
          transition-all duration-300 ease-out"
      >
        {/* Featured Badge */}
        <span
          className="absolute top-2 right-2 
            bg-gradient-to-r from-purple-600 to-purple-500 
            text-white text-[10px] px-2 py-0.5 rounded-full 
            uppercase font-medium tracking-wide shadow-sm"
        >
          Featured
        </span>

        {/* Market Question */}
        <h3 className="text-base font-semibold text-white mb-3 leading-snug">
          {market.question}
        </h3>

        {/* YES / NO Pools */}
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <div className="text-green-400 text-xl font-bold drop-shadow-sm">
              {market.yes_pool}
            </div>
            <div className="text-gray-400 text-xs">YES</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 text-xl font-bold drop-shadow-sm">
              {market.no_pool}
            </div>
            <div className="text-gray-400 text-xs">NO</div>
          </div>
        </div>

        {/* Market Stats */}
        <div
          className="flex justify-between text-xs text-gray-300 mb-3 
            border-t border-gray-700/40 pt-2"
        >
          <div>
            <span className="text-white font-medium">{market.total_volume}</span>{" "}
            Vol
          </div>
          <div>
            Ends in{" "}
            <span className="text-white font-medium">
              <CountdownTimer endTime={market.end_time} />
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-1.5 
              bg-gradient-to-r from-green-600 to-green-500 
              text-white text-xs rounded-md 
              hover:from-green-500 hover:to-green-400 
              transition-colors duration-200"
          >
            Yes
          </button>
          <button
            className="flex-1 py-1.5 
              bg-gradient-to-r from-red-600 to-red-500 
              text-white text-xs rounded-md 
              hover:from-red-500 hover:to-red-400 
              transition-colors duration-200"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  // 🟢 Normal Market UI
  return (
    <div
      className="border border-gray-700/50 rounded-lg p-4 
        bg-black/30 backdrop-blur-sm 
        hover:border-gray-500/70 hover:bg-black/40 
        transform hover:-translate-y-0.5 hover:scale-[1.01]
        transition-all duration-200"
    >
      <h4 className="text-white font-medium mb-2 text-sm leading-snug">
        {market.question}
      </h4>

      <div className="flex justify-between mb-3">
        <div className="text-center">
          <div className="text-green-400 text-base font-semibold">
            {market.yes_pool}
          </div>
          <div className="text-gray-400 text-[11px]">YES</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 text-base font-semibold">
            {market.no_pool}
          </div>
          <div className="text-gray-400 text-[11px]">NO</div>
        </div>
      </div>

      <div className="flex justify-between text-[11px] text-gray-400 mb-3">
        <div>
          <span className="text-white">{market.total_volume}</span> Vol
        </div>
        <div>
          <CountdownTimer endTime={market.end_time} />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-1.5 bg-green-600 text-white text-[11px] rounded hover:bg-green-700 transition">
          Yes
        </button>
        <button className="flex-1 py-1.5 bg-red-600 text-white text-[11px] rounded hover:bg-red-700 transition">
          No
        </button>
      </div>
    </div>
  );
};

export default MarketCard;
