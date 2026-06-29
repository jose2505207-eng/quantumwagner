"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Methods from "@/app/utils/methods";
import { Spinner } from "@/components/custom/Spinner";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { toDisplay } from "@/lib/format";
import { Background } from "@/components/background";
import { TokenHeader } from "@/components/token-details/token-header";
import { TokenStats } from "@/components/token-details/token-stats";
import { BuyInterface } from "@/components/token-details/buy-interface";
import { TokenChart } from "@/components/token-details/TokenChart";

export default function TokenBuyPage() {
  const params = useParams();
  const mint_address = params.id;
  const { tokens: userToken, loading: tokenLoading } = useAllTokens();
  const { buyToken } = Methods();
  const [buying, setBuying] = useState(false);

  if (tokenLoading)
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <Spinner />
      </div>
    );

  const filtered = userToken.filter(
    (t) =>
      t.account.tokenMint?.toString().trim().toLowerCase() ===
      String(mint_address)?.trim().toLowerCase()
  );

  if (filtered.length === 0)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Token Not Found</h2>
        <p className="text-muted-foreground">
          We couldn&apos;t find a token with this mint address.
        </p>
      </div>
    );

  const acc = filtered[0].account;
  const mint = acc.tokenMint?.toString();
  const launchId = acc.launchId;
  const status = Object.keys(acc.status || {})[0] || "unknown";

  const handleBuy = async (amount: number) => {
    try {
      setBuying(true);
      await buyToken(Number(launchId), amount);
    } catch (err) {
      console.error(err);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 py-24 max-w-6xl">
        <TokenHeader token={acc} status={status} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* Chart Section */}
          <div className="xl:col-span-2 h-[500px]">
             <TokenChart tokenSymbol={acc.symbol} />
          </div>

          {/* Swap Interface */}
          <div className="xl:col-span-1">
            <BuyInterface 
              token={acc} 
              onBuy={handleBuy} 
              loading={buying} 
              compact={true}
            />
          </div>
        </div>

        {/* Stats */}
        <TokenStats token={acc} />
        
        {/* About Section */}
        <div className="mt-10 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
          <h3 className="text-2xl font-bold text-white mb-6">About {acc.name}</h3>
          <div className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              This token was launched on the Buzz platform. It is currently {status} and available for trading.
              Participate in the ecosystem by holding {acc.symbol} or using it in battles.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Launch ID</span>
                <span className="font-mono text-white text-lg">#{toDisplay(launchId)}</span>
              </div>
              <div className="p-5 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Network</span>
                <span className="font-mono text-white text-lg">Solana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
