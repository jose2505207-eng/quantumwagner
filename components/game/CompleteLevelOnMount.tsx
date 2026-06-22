"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGameStore } from "@/store/useGameStore";
import { LevelId } from "@/lib/game/types";

interface CompleteLevelOnMountProps {
  level: LevelId;
  /** Only complete when a wallet is connected (default true). */
  requireWallet?: boolean;
}

/**
 * Completes a visit-based milestone (e.g. "enter the leaderboard arena") once,
 * on mount. Use ONLY for levels whose real action is genuinely a visit. Action
 * milestones (place bet, launch token, join battle) are completed from their
 * real on-chain success handlers instead — never faked here.
 */
export function CompleteLevelOnMount({
  level,
  requireWallet = true,
}: CompleteLevelOnMountProps) {
  const { connected } = useWallet();
  const completeLevel = useGameStore((s) => s.completeLevel);

  useEffect(() => {
    if (requireWallet && !connected) return;
    completeLevel(level);
  }, [connected, requireWallet, level, completeLevel]);

  return null;
}

export default CompleteLevelOnMount;
