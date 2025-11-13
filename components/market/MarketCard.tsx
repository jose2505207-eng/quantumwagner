import CountdownTimer from "@/app/utils/hooks/CountdownTimer";

const MarketCard = ({ market }) => {
  const isFeatured = market.featured;
  console.log("market ", market);

  // --- USE EXACT SAME LOGIC AS YOUR GRID EXAMPLE ---
  const yesPool = Number(market.yes_pool || 0);
  const noPool = Number(market.no_pool || 0);

  let yesOdds = 0;
  let noOdds = 0;

  if (yesPool === 0 && noPool === 0) {
    yesOdds = 0;
    noOdds = 0;
  } else {
    const totalPool = yesPool + noPool;
    yesOdds = Math.round((yesPool / totalPool) * 100);
    noOdds = 100 - yesOdds;
  }

  // for percentage bar
  const yesPct = yesOdds;

  // --- CARD MARKUP ---
  if (isFeatured) {
    return (
      <div
        className="relative rounded-xl p-5 
          bg-gradient-to-br from-purple-900/30 via-black/40 to-purple-800/20 
          border border-purple-400/30 hover:border-purple-400/60
          shadow-lg hover:shadow-purple-500/20
          transform hover:-translate-y-1 hover:scale-[1.02]
          transition-all duration-300 ease-out"
      >
        <span
          className="absolute top-2 right-2 
            bg-gradient-to-r from-purple-600 to-purple-500 
            text-white text-[10px] px-2 py-0.5 rounded-full 
            uppercase font-medium tracking-wide shadow-sm"
        >
          Featured
        </span>

        <h3 className="text-base font-semibold text-white mb-4 leading-snug">
          {market.question}
        </h3>

        {/* percentage numbers */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-green-400 text-lg font-bold">{yesOdds}%</div>
          <div className="text-red-400 text-lg font-bold">{noOdds}%</div>
        </div>

        {/* EXACT SAME STYLE PROGRESS BAR */}
        <div className="w-full h-2 bg-gray-900/50 rounded-full overflow-hidden mb-4">
          <div className="h-2 bg-emerald-500" style={{ width: `${yesPct}%` }} />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-300 mb-3 border-t border-gray-700/40 pt-2">
          <div>
            <span className="text-white font-medium">
              {market.total_volume}
            </span>{" "}
            Vol
          </div>
          <div>
            Ends in{" "}
            <span className="text-white font-medium">
              <CountdownTimer endTime={market.end_time} />
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-500">
            Bet YES
          </button>
          <button className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-500">
            Bet NO
          </button>
        </div>
      </div>
    );
  }

  // --- NORMAL CARD UI ---
  return (
    <div
      className="border border-gray-700/50 rounded-lg p-4 
        bg-black/30 backdrop-blur-sm 
        hover:border-gray-500/70 hover:bg-black/40 
        transform hover:-translate-y-0.5 hover:scale-[1.01]
        transition-all duration-200"
    >
      <h4 className="text-white font-medium mb-3 text-sm leading-snug">
        {market.question}
      </h4>

      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="text-green-400 text-lg font-bold">{yesOdds}%</div>
          <div className="text-red-400 text-lg font-bold">{noOdds}%</div>
        </div>

        {/* SAME EXACT GRID LOGIC BAR */}
        <div className="w-full h-2 rounded-full bg-gray-900/60 overflow-hidden mb-2">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${yesPct}%` }}
          />
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
        <button className="flex-1 py-1.5 bg-green-600 text-white text-[11px] rounded hover:bg-green-700">
          Bet YES
        </button>
        <button className="flex-1 py-1.5 bg-red-600 text-white text-[11px] rounded hover:bg-red-700">
          Bet NO
        </button>
      </div>
    </div>
  );
};

export default MarketCard;
