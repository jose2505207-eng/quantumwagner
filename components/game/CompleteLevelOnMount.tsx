"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGameStore } from "@/store/useGameStore";
import { LevelId } from "@/lib/game/types";
import { api } from "@/lib/api";

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

    // Local store stays the labelled HUD display (honesty boundary: local
    // progression is the display, the server is the truth).
    completeLevel(level);

    // Best-effort: when authenticated, ALSO complete the milestone server-side
    // so the server (not the client) is the authority for XP/levels. The visit
    // endpoint allowlists genuinely visit-based levels only. Failures are
    // silently ignored — the HUD already reflected the local display.
    // Session is an HttpOnly cookie sent automatically; a wallet connection is
    // the client-side signal that a session should exist. Best-effort — a 401
    // (not authenticated) is silently ignored, the local HUD already updated.
    if (connected) {
      api.post(`/api/player/levels/${level}/complete`).catch(() => {});
    }
  }, [connected, requireWallet, level, completeLevel]);

  return null;
}

export default CompleteLevelOnMount;
