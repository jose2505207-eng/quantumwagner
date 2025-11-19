"use client";
import { Spinner } from "@/app/portfolio/page";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { useUserBattles } from "@/app/utils/useUserBattles";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";

export default function UserBattlesList() {
  const { battles: userBattles, loading: battleLoading } = useUserBattles();
  const { tokens: allToken, loading: tokenLoading } = useAllTokens();
  const router = useRouter();
  if (battleLoading || tokenLoading) return <Spinner />;

  const getToken = (mint: string | PublicKey) => {
    const mintStr = typeof mint === "string" ? mint : mint.toString();

    return allToken?.find((t) => t.account.tokenMint.toString() === mintStr)
      ?.account;
  };

  return (
    <div className="w-full flex flex-col gap-4 ">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
        <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
          Your Created Battels
        </h3>
      </div>
      {userBattles?.map((b) => {
        const d = b.data;

        return (
          <div
            key={b.id}
            className="
              p-5 rounded-2xl border border-[#2e1065]/40 
              bg-[#0f0a1a]/60 backdrop-blur-sm
              hover:bg-[#1a1128]/70 transition-all duration-300
              flex flex-col gap-4
            "
            onClick={() => {
              router.push(`/portfolio/battle/${b.pda}`);
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#2e1065]/50 flex-shrink-0">
                  <img
                    src={d.imageUrl}
                    width={60}
                    height={60}
                    alt={d.title}
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <h2 className="text-white text-lg font-semibold">
                    {d.title}
                  </h2>
                  {/* Truncate description on small screens to prevent text overflow */}
                  <p className="text-white/60 text-sm truncate max-w-xs">
                    {d.description}
                  </p>

                  <div className="text-white/70 text-xs mt-1">
                    Status:{" "}
                    <span className="text-green-400">
                      {Object.keys(d.status)[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="
                flex items-center justify-between 
                w-full md:w-auto md:ml-auto md:mr-0 
                p-2 md:p-0 border-t border-t-[#2e1065]/40 md:border-t-0 mt-2 md:mt-0 pt-2 md:pt-0
              "
              >
                {/* Side A */}
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-white/80 text-xs font-medium">Side A</h3>

                  <div className="flex gap-1">
                    {d.sideATokens.map((mint: string) => {
                      const token = getToken(mint);

                      return (
                        <div
                          key={mint}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <img
                            src={token?.imageUri}
                            alt={token?.symbol}
                            className="w-7 h-7 rounded-md object-cover"
                          />
                          <p className="text-white/60 text-[10px]">
                            {token?.symbol || "?"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* VS */}
                <span className="text-purple-400 font-bold text-sm mx-4">
                  VS
                </span>

                {/* Side B */}
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-white/80 text-xs font-medium">Side B</h3>

                  <div className="flex gap-1">
                    {d.sideBTokens.map((mint: string) => {
                      const token = getToken(mint);

                      return (
                        <div
                          key={mint}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <img
                            src={token?.imageUri}
                            alt={token?.symbol}
                            className="w-7 h-7 rounded-md object-cover"
                          />
                          <p className="text-white/60 text-[10px]">
                            {token?.symbol || "?"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
