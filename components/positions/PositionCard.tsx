"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Position } from "@/store/types/postionType";
import { format, formatDistanceToNow } from "date-fns";

export default function PositionCard({
  position,
  withdrawing,
  handleWithdraw,
}: {
  position: Position;
  withdrawing: boolean;
  handleWithdraw: (marketPda: string) => void;
}) {
  const ended = new Date(position.market.end_time).getTime() < Date.now();

  return (
    <Card
      key={position.id}
      className="w-full bg-gradient-to-r from-gray-900/60 to-gray-900/40 
        border border-gray-800 rounded-lg overflow-hidden"
    >
      <CardContent className="p-2 sm:p-3">
        {/* Question */}
        <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2">
          {position.market?.question ?? "Unknown market"}
        </h3>

        {/* Details Beneath */}
        <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
          {/* Category */}
          <div>
            <div className="text-[0.6rem] text-gray-400">Category</div>
            <span className="uppercase text-purple-400">{position.market?.category}</span>
          </div>

          {/* Staked */}
          <div>
            <div className="text-[0.6rem] text-gray-400">Staked</div>
            <div className="font-semibold">
              {(Number(position.amount_staked) / LAMPORTS_PER_SOL).toFixed(2)}{" "}
              <span className="bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00BBFF] text-transparent bg-clip-text">
                SOL
              </span>
            </div>
          </div>

          {/* Position */}
          <div>
            <div className="text-[0.6rem] text-gray-400">Position</div>
            <span
              className={clsx(
                "inline-block px-1 py-0.5 text-[0.6rem] rounded-full font-medium",
                position.position_type === "YES"
                  ? "bg-emerald-800 text-emerald-300"
                  : "bg-red-900 text-red-300"
              )}
            >
              {position.position_type ?? "—"}
            </span>
          </div>

          {/* Settled */}
          <div>
            <div className="text-[0.6rem] text-gray-400">Settled</div>
            <span className={position.settled ? "text-green-400" : "text-yellow-400"}>
              {position.settled ? "Yes" : "No"}
            </span>
          </div>

          {/* Created Date */}
          <div className="col-span-2 sm:col-span-4 text-[0.77rem] text-gray-400">
            {format(new Date(position.created_at), "dd MMM yyyy h:mma")} ·{" "}
            {formatDistanceToNow(new Date(position.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Market link */}
        <div className="mt-2 border-t border-gray-800 pt-2 text-[0.65rem] sm:text-xs text-gray-400">
          <p>
            View Market:{" "}
            <a
              href={`https://explorer.solana.com/address/${position.market.pda}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00BBFF] text-transparent bg-clip-text hover:underline break-all"
            >
              Solscan
            </a>
          </p>

          {/* Market stats in smaller grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            <div>
              <div className="text-[0.55rem] text-gray-400">Yes Pool</div>
              <span className="bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00BBFF] text-transparent bg-clip-text font-semibold text-[0.65rem]">
                {(Number(position.market.yes_pool) / LAMPORTS_PER_SOL).toFixed(2)} SOL
              </span>
            </div>
            <div>
              <div className="text-[0.55rem] text-gray-400">No Pool</div>
              <span className="bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00BBFF] text-transparent bg-clip-text font-semibold text-[0.65rem]">
                {(Number(position.market.no_pool) / LAMPORTS_PER_SOL).toFixed(2)} SOL
              </span>
            </div>
            <div>
              <div className="text-[0.55rem] text-gray-400">Volume</div>
              <span className="bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00BBFF] text-transparent bg-clip-text font-semibold text-[0.65rem]">
                {(Number(position.market.total_volume) / LAMPORTS_PER_SOL).toFixed(2)} SOL
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-gray-800 pt-3">
          {ended ? (
            <Button
              onClick={() => handleWithdraw(position.market.pda)}
              className="w-full sm:w-auto text-xs sm:text-sm"
              disabled={withdrawing}
            >
              {withdrawing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Withdrawing...
                </>
              ) : (
                "Withdraw Bet"
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-900/60 border border-gray-800 rounded-full text-[0.65rem] text-gray-300">
              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
              <span>Waiting for market to settle</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
