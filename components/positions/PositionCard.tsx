"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Position } from "@/store/types/user/postionType";
import { format, formatDistanceToNow } from "date-fns";

export default function PositionCard({
  position,
  withdrawing,
  handleWithdraw,
}: {
  position: Position;
  withdrawing: boolean;
  handleWithdraw: (marketPda: string, positionId: string) => void;
}) {
  const ended = new Date(position.market.end_time).getTime() < Date.now();

  return (
    <Card
      key={position.id}
      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 group relative"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <CardContent className="p-5 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug">
            {position.market?.question ?? "Unknown market"}
          </h3>
          <span
            className={clsx(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0",
              position.position_type === "YES"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {position.position_type}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Staked
            </div>
            <div className="font-mono text-sm font-medium text-white">
              {(Number(position.amount_staked) / LAMPORTS_PER_SOL).toFixed(2)}{" "}
              SOL
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Category
            </div>
            <div className="text-sm font-medium text-white capitalize truncate">
              {position.market?.category}
            </div>
          </div>
        </div>

        {/* Market Info */}
        <div className="space-y-2 mb-4 bg-white/[0.02] rounded-lg p-3 border border-white/5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Volume</span>
            <span className="text-white font-mono">
              {(Number(position.market.total_volume) / LAMPORTS_PER_SOL).toFixed(
                2
              )}{" "}
              SOL
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Created</span>
            <span className="text-white">
              {formatDistanceToNow(new Date(position.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <span
              className={
                position.settled ? "text-emerald-400" : "text-yellow-400"
              }
            >
              {position.settled ? "Settled" : "Active"}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2">
          {position.market.status !== "RESOLVED" ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-white/5 py-2.5 rounded-lg border border-white/5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Market in progress</span>
            </div>
          ) : position.market.outcome !== null &&
            ((position.market.outcome && position.position_type === "NO") ||
              (!position.market.outcome &&
                position.position_type === "YES")) ? (
            <div className="flex items-center justify-center gap-2 text-xs text-red-400 bg-red-500/10 py-2.5 rounded-lg border border-red-500/20">
              <span>
                Outcome: {position.market.outcome ? "YES" : "NO"} (You Lost)
              </span>
            </div>
          ) : (
            <Button
              onClick={() => handleWithdraw(position.market.pda, position.id)}
              className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 h-9"
              disabled={withdrawing}
              size="sm"
            >
              {withdrawing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw Winnings"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
