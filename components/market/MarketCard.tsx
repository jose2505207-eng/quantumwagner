import { Market } from "@/app/types";
import CountdownTimer from "@/app/hooks/CountdownTimer";

const MarketCard = ({ market }: { market: Market }) => {
  const isFeatured = market.featured;

  // --- NORMALIZE numeric pools (strings => numbers) ---
  const parsePool = (v) => {
    if (v === null || v === undefined) return 0;
    // handle strings and numbers
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const yes = parsePool(market.yes_pool);
  const no = parsePool(market.no_pool);
  const total = yes + no;

// --- PERCENTAGES (safe) ---
const yesPct = total > 0 ? (yes / total) * 100 : 0;
const roundedYes = Math.round(yesPct);
const roundedNo = total > 0 ? 100 - roundedYes : 0;


  // inline styles for dynamic widths
  const yesStyle = { width: `${yesPct}%` };
  const noStyle = { left: `${yesPct}%`, width: `${100 - yesPct}%` };

  // small helper strings for accessibility
  const ariaLabel = `Yes ${roundedYes} percent, No ${roundedNo} percent`;

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
          <div className="text-green-400 text-lg font-bold">{roundedYes}%</div>
          <div className="text-red-400 text-lg font-bold">{roundedNo}%</div>
        </div>

        {/* two-segment bar */}
        <div className="relative h-2 rounded-full overflow-hidden mb-4">
          {/* YES segment */}
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500"
            style={{ width: `${yesPct}%` }}
          />
          {/* NO background (fills rest) */}
          <div
            className="absolute inset-y-0 right-0 bg-[#1e293b]"
            style={{ width: `${100 - yesPct}%` }}
          />
        </div>

        {/* Stats */}
        <div
          className="flex justify-between text-xs text-gray-300 mb-3 
            border-t border-gray-700/40 pt-2"
        >
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 
              bg-green-600 text-white text-sm font-semibold rounded-md 
              hover:bg-green-500 transition-colors"
          >
            Bet YES
          </button>
          <button
            className="flex-1 py-2 
              bg-red-600 text-white text-sm font-semibold rounded-md 
              hover:bg-red-500 transition-colors"
          >
            Bet NO
          </button>
        </div>
      </div>
    );
  }

  // --- Normal card UI (same percentage logic) ---
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
          <div className="text-green-400 text-lg font-bold">{roundedYes}%</div>
          <div className="text-red-400 text-lg font-bold">{roundedNo}%</div>
        </div>

        <div
          className="relative h-2 rounded-full bg-gray-900/60 overflow-hidden"
          role="img"
          aria-label={ariaLabel}
          title={ariaLabel}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-l-full"
            style={{
              ...yesStyle,
              background: "linear-gradient(90deg,#16a34a,#4ade80)",
            }}
          />
          <div
            className="absolute inset-y-0 rounded-r-full"
            style={{
              ...noStyle,
              background: "linear-gradient(90deg,#fb7185,#ef4444)",
            }}
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
        <button className="flex-1 py-1.5 bg-green-600 text-white text-[11px] rounded hover:bg-green-700 transition">
          Bet YES
        </button>
        <button className="flex-1 py-1.5 bg-red-600 text-white text-[11px] rounded hover:bg-red-700 transition">
          Bet NO
        </button>
      </div>
    </div>
  );
};

export default MarketCard;
