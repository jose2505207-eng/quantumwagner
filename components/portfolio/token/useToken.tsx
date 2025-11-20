"use client";

import { shortenAddress, Spinner } from "@/app/portfolio/page";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { useUserBoughtTokens } from "@/app/utils/useUserBoughtTokens";
import { useUserTokens } from "@/app/utils/useUserTokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const mockUserTokens = [
	{
		account: {
			tokenMint: "mint_created_1",
			name: "Buzz Token",
			symbol: "BUZZ",
			imageUri: "https://cryptologos.cc/logos/solana-sol-logo.png", // Placeholder
			launchId: "launch_1",
			currentPrice: 1500000000, // 1.5 SOL
			totalSupply: "1000000",
		},
	},
	{
		account: {
			tokenMint: "mint_created_2",
			name: "Moon Rocket",
			symbol: "MOON",
			imageUri: null, // Test fallback
			launchId: "launch_2",
			currentPrice: 500000000, // 0.5 SOL
			totalSupply: "1000000000",
		},
	},
];

const mockBoughtTokens = [
	{
		mint: "mint_bought_1",
		balance: "500",
		tokenData: {
			name: "Pepe Coin",
			symbol: "PEPE",
			imageUri: "https://cryptologos.cc/logos/pepe-pepe-logo.png",
			currentPrice: 100000, // 0.0001 SOL
			totalSupply: "420690000000",
		},
	},
	{
		mint: "mint_bought_2",
		balance: "10",
		tokenData: {
			name: "Bonk",
			symbol: "BONK",
			imageUri: "https://cryptologos.cc/logos/bonk1-bonk-logo.png",
			currentPrice: 200000, // 0.0002 SOL
			totalSupply: "99999999999",
		},
	},
];

export default function Tokens() {
	const { tokens: userToken, loading: tokenLoading } = useUserTokens();
	const { tokens: userBoughtToken, loading: boughtTokenLoading } =
		useUserBoughtTokens();
	const router = useRouter();

	// Use mock data if real data is empty
	const displayUserTokens =
		userToken && userToken.length > 0 ? userToken : mockUserTokens;
	const displayBoughtTokens =
		userBoughtToken && userBoughtToken.length > 0 ? userBoughtToken : mockBoughtTokens;

	return (
		<>
			{/*Token Tabs Section*/}
			<div className="mt-12">
				<Tabs defaultValue="created" className="w-full">
					{/* Header + Tabs */}
					<div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
						<h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
							Your Tokens
						</h3>

						<TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg flex justify-center sm:justify-start">
							<TabsTrigger
								value="created"
								className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea]
            data-[state=active]:text-white 
            data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
            transition"
							>
								Created
							</TabsTrigger>

							<TabsTrigger
								value="bought"
								className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
            data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#60a5fa] data-[state=active]:to-[#3b82f6]
            data-[state=active]:text-white 
            data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
            transition"
							>
								Bought
							</TabsTrigger>
						</TabsList>
					</div>

					{/*  Created Tokens  */}
					<TabsContent value="created">
						{tokenLoading ? (
							<Spinner />
						) : displayUserTokens.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-7xl mx-auto">
								{displayUserTokens.map((token, i: number) => {
									const acc = token.account;
									const mint = acc.tokenMint?.toBase58?.() ?? acc.tokenMint;

									return (
										<Card
											key={i}
											onClick={() => router.push(`portfolio/token/${mint}`)}
											className="
                        w-full max-w-[500px] cursor-pointer rounded-xl 
                        bg-[#0A0A0A] border border-white/10
                        hover:border-white/20 transition-all duration-300 p-6 group relative overflow-hidden
                      "
										>
											{/* Decorative gradient */}
											<div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

											{/* HEADER */}
											<CardHeader className="flex flex-row items-center justify-between p-0 relative z-10">
												<div className="flex items-center gap-4">
													{/* Token Image */}
													{acc.imageUri && acc.imageUri.startsWith("http") ? (
														<img
															src={acc.imageUri}
															alt={acc.name}
															width={56}
															height={56}
															className="
                                rounded-xl border border-white/10 bg-white/5
                              "
														/>
													) : (
														<div
															className="
                                w-14 h-14 flex items-center justify-center 
                                rounded-xl bg-primary/10 border border-primary/20
                                text-primary text-xl font-bold 
                            "
														>
															{acc.symbol?.[0] || "?"}
														</div>
													)}

													{/* Token Name + Symbol */}
													<div>
														<h2 className="text-lg font-semibold text-white leading-tight group-hover:text-primary transition-colors">
															{acc.name}
														</h2>
														<p className="text-sm text-muted-foreground">
															{acc.symbol} Token
														</p>
													</div>
												</div>

												{/* ICON BUTTONS */}
												<div className="flex items-center gap-2">
													<Button
														size="icon"
														variant="ghost"
														onClick={(e) => {
															e.stopPropagation();
															navigator.clipboard.writeText(mint);
															toast.success("Copied!");
														}}
														className="h-8 w-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white"
													>
														<Copy size={16} />
													</Button>

													<Button
														size="icon"
														variant="ghost"
														asChild
														className="h-8 w-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white"
													>
														<a
															href={`https://solscan.io/account/${mint}?cluster=devnet`}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => e.stopPropagation()}
														>
															<ExternalLink size={16} />
														</a>
													</Button>
												</div>
											</CardHeader>

											{/* CONTENT */}
											<CardContent className="mt-6 p-0 relative z-10">
												{/* STATS GRID */}
												<div className="grid grid-cols-2 gap-3">
													{/* Balance */}
													<div
														className="
                              bg-white/5 border border-white/5
                              rounded-lg p-3
                            "
													>
														<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Launch ID</p>
														<p className="text-sm font-mono font-medium text-white truncate">
															{toDisplay(acc.launchId)}
														</p>
													</div>

													{/* Current Price */}
													<div
														className="
                              bg-white/5 border border-white/5
                              rounded-lg p-3
                            "
													>
														<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
															Current Price
														</p>
														<p className="text-sm font-mono font-medium text-white">
															{toDisplay(acc.currentPrice / LAMPORTS_PER_SOL)}{" "}
															SOL
														</p>
													</div>

													{/* Total Supply */}
													<div
														className="
                              col-span-2 
                              bg-white/5 border border-white/5
                              rounded-lg p-3
                            "
													>
														<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
															Total Supply
														</p>
														<p className="text-sm font-mono font-medium text-white">
															{toDisplay(acc.totalSupply)}
														</p>
													</div>
												</div>

												{/* FOOTER - MINT */}
												<div
													className="
                            mt-4 
                            bg-white/[0.02] border border-white/5
                            rounded-lg p-3
                          "
												>
													<p className="text-xs text-muted-foreground font-mono flex justify-between items-center">
														<span>{shortenAddress(mint)}</span>

														<a
															href={`https://solscan.io/account/${mint}?cluster=devnet`}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => e.stopPropagation()}
															className="text-primary hover:text-primary/80 underline text-[10px]"
														>
															View ↗
														</a>
													</p>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						) : (
							<p className="text-gray-400 text-center text-sm sm:text-base">
								You haven’t created any tokens yet.
							</p>
						)}
					</TabsContent>

					{/*Bought Tokens  */}
					<TabsContent value="bought">
						{boughtTokenLoading ? (
							<div className="flex justify-center items-center h-40">
								<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
							</div>
						) : displayBoughtTokens && displayBoughtTokens.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-7xl mx-auto">
								{displayBoughtTokens.map((token, i: number) => {
									const acc = token.tokenData;
									const mint = token.mint;
									const balance = token.balance;

									return (
										<Card
											key={i}
											onClick={() =>
												router.push(`portfolio/token/bought/${mint}`)
											}
											className="
                        w-full max-w-[420px] cursor-pointer rounded-xl 
                        bg-[#0A0A0A] border border-white/10 
                        hover:border-white/20 transition-all duration-300 group relative overflow-hidden
                      "
										>
											{/* Decorative gradient */}
											<div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

											{/* Header */}
											<CardHeader className="flex flex-row items-center justify-between p-6 pb-3 relative z-10">
												<div className="flex items-center gap-4">
													{acc.imageUri && acc.imageUri.startsWith("http") ? (
														<img
															src={acc.imageUri}
															alt={acc.name}
															width={56}
															height={56}
															className="rounded-xl bg-white/5 border border-white/10"
														/>
													) : (
														<div
															className="w-14 h-14 flex items-center justify-center 
                        bg-blue-500/10 border border-blue-500/20
                        text-blue-400 rounded-xl text-xl font-bold"
														>
															{acc.symbol?.[0] || "?"}
														</div>
													)}

													<div>
														<h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
															{acc.name}
														</h2>
														<p className="text-sm text-muted-foreground">
															{acc.symbol} Token
														</p>
													</div>
												</div>

												{/* Icons */}
												<div className="flex items-center gap-2">
													<Button
														size="icon"
														variant="ghost"
														onClick={(e) => {
															e.stopPropagation();
															navigator.clipboard.writeText(mint);
															toast.success("Copied!");
														}}
														className="h-8 w-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white"
													>
														<Copy size={16} />
													</Button>

													<Button
														size="icon"
														variant="ghost"
														asChild
														className="h-8 w-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white"
													>
														<a
															href={`https://solscan.io/account/${mint}?cluster=devnet`}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => e.stopPropagation()}
														>
															<ExternalLink size={16} />
														</a>
													</Button>
												</div>
											</CardHeader>

											<CardContent className="px-6 pb-6 relative z-10">
												{/* Stats Grid */}
												<div className="grid grid-cols-2 gap-3 mt-4">
													{/* Balance */}
													<div className="rounded-lg bg-white/5 border border-white/5 p-3">
														<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
														<p className="text-sm font-mono font-medium text-blue-300">
															{balance} {acc.symbol}
														</p>
													</div>

													{/* Current Price */}
													<div className="rounded-lg bg-white/5 border border-white/5 p-3">
														<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
															Current Price
														</p>
														<p className="text-sm font-mono font-medium text-blue-200">
															{toDisplay(acc.currentPrice / LAMPORTS_PER_SOL)}{" "}
															SOL
														</p>
													</div>

													{/* Total Supply */}
													<div className="rounded-lg bg-white/5 border border-white/5 p-3 col-span-2">
														<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
															Total Supply
														</p>
														<p className="text-sm font-mono font-medium text-white">
															{toDisplay(acc.totalSupply)}
														</p>
													</div>
												</div>

												{/* Mint Footer */}
												<div className="mt-4 rounded-lg bg-white/[0.02] border border-white/5 p-3">
													<p className="text-xs text-muted-foreground font-mono flex justify-between items-center">
														<span>{shortenAddress(mint)}</span>

														<a
															href={`https://solscan.io/account/${mint}?cluster=devnet`}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) => e.stopPropagation()}
															className="text-blue-400 hover:text-blue-300 underline text-[10px]"
														>
															View ↗
														</a>
													</p>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						) : (
							<p className="text-gray-400 text-center text-sm sm:text-base">
								You haven&#39;t bought any tokens yet.
							</p>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}
