"use client";
import { Spinner } from "@/app/portfolio/page";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { useUserBattles } from "@/app/utils/useUserBattles";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";

const mockBattles = [
	{
		id: "battle_1",
		pda: "battle_pda_1",
		data: {
			imageUrl:
				"https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2532&auto=format&fit=crop",
			title: "Meme Coin Wars",
			description: "Doge vs Shiba Inu - Who will reign supreme?",
			status: { Open: {} },
			sideATokens: ["token_mint_1"],
			sideBTokens: ["token_mint_2"],
		},
	},
	{
		id: "battle_2",
		pda: "battle_pda_2",
		data: {
			imageUrl:
				"https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2555&auto=format&fit=crop",
			title: "L1 Showdown",
			description: "Solana vs Ethereum - The battle for speed.",
			status: { Active: {} },
			sideATokens: ["token_mint_3"],
			sideBTokens: ["token_mint_4"],
		},
	},
];

const mockAllTokens = [
	{
		account: {
			tokenMint: "token_mint_1",
			symbol: "DOGE",
			imageUri: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
		},
	},
	{
		account: {
			tokenMint: "token_mint_2",
			symbol: "SHIB",
			imageUri: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
		},
	},
	{
		account: {
			tokenMint: "token_mint_3",
			symbol: "SOL",
			imageUri: "https://cryptologos.cc/logos/solana-sol-logo.png",
		},
	},
	{
		account: {
			tokenMint: "token_mint_4",
			symbol: "ETH",
			imageUri: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
		},
	},
];

export default function UserBattlesList() {
	const { battles: userBattles, loading: battleLoading } = useUserBattles();
	const { tokens: allToken, loading: tokenLoading } = useAllTokens();
	const router = useRouter();

	// Use mock data if real data is empty
	const displayBattles =
		userBattles && userBattles.length > 0 ? userBattles : mockBattles;
	const displayTokens =
		allToken && allToken.length > 0 ? allToken : mockAllTokens;

	if (battleLoading || tokenLoading) return <Spinner />;

	const getToken = (mint: string | PublicKey) => {
		const mintStr = typeof mint === "string" ? mint : mint.toString();

		return displayTokens
			?.find((t) => {
				const tokenMint = t.account.tokenMint;
				const tokenMintStr =
				typeof tokenMint === "string" ? tokenMint : tokenMint.toString();
				return tokenMintStr === mintStr;
			})
			?.account;
	};

	return (
		<div className="w-full flex flex-col gap-4 ">
			<div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
				<h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
					Your Created Battels
				</h3>
			</div>
			{displayBattles?.map((b) => {
        const d = b.data;

        return (
          <div
            key={b.id}
            className="
              p-5 rounded-xl border border-white/10 
              bg-[#0A0A0A] hover:border-white/20
              transition-all duration-300
              flex flex-col gap-4 group relative overflow-hidden cursor-pointer
            "
            onClick={() => {
              router.push(`/portfolio/battle/${b.pda}`);
            }}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10">
              <div className="flex items-start gap-4 flex-shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-white/5 shadow-inner">
                  <img
                    src={d.imageUrl}
                    width={64}
                    height={64}
                    alt={d.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-white text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                    {d.title}
                  </h2>
                  {/* Truncate description on small screens to prevent text overflow */}
                  <p className="text-muted-foreground text-sm truncate max-w-xs">
                    {d.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Status</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider">
                      {Object.keys(d.status)[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="
                flex items-center justify-between 
                w-full md:w-auto md:ml-auto md:mr-0 
                p-3 md:p-0 border-t border-white/10 md:border-t-0 mt-2 md:mt-0 pt-3 md:pt-0
                bg-white/[0.02] md:bg-transparent rounded-lg md:rounded-none
              "
              >
                {/* Side A */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Side A</h3>

                  <div className="flex gap-1.5">
                    {d.sideATokens.map((mint: string) => {
                      const token = getToken(mint);

                      return (
                        <div
                          key={mint}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-white/5 p-0.5">
                            <img
                                src={token?.imageUri}
                                alt={token?.symbol}
                                className="w-full h-full rounded-md object-cover"
                            />
                          </div>
                          <p className="text-muted-foreground text-[10px] font-medium">
                            {token?.symbol || "?"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center px-6">
                    <span className="text-primary font-black text-lg italic opacity-50">VS</span>
                </div>

                {/* Side B */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Side B</h3>

                  <div className="flex gap-1.5">
                    {d.sideBTokens.map((mint: string) => {
                      const token = getToken(mint);

                      return (
                        <div
                          key={mint}
                          className="flex flex-col items-center gap-1"
                        >
                           <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-white/5 p-0.5">
                            <img
                                src={token?.imageUri}
                                alt={token?.symbol}
                                className="w-full h-full rounded-md object-cover"
                            />
                          </div>
                          <p className="text-muted-foreground text-[10px] font-medium">
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
