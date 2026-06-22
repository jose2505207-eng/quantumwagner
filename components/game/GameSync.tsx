"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserStore } from "@/store/userInfo";
import { useGameStore } from "@/store/useGameStore";

/**
 * Headless bridge: reconciles REAL signals (wallet connection, backend profile)
 * into the local progression store. This is how milestones complete from real
 * actions rather than fake passes:
 *   - wallet connected           -> Level 1 (connect-wallet)
 *   - backend reports predictions -> Level 2 (first-prediction)
 *
 * Mount once near the app root (after the wallet + user providers).
 */
export function GameSync() {
  const { connected, publicKey } = useWallet();
  const userInfo = useUserStore((s) => s.userInfo);
  const syncFromBackend = useGameStore((s) => s.syncFromBackend);

  useEffect(() => {
    const predictionCount =
      userInfo?.user?.total_predictions ??
      userInfo?.user?.positions?.length ??
      0;

    syncFromBackend({
      hasWallet: connected && !!publicKey,
      predictionCount,
    });
  }, [connected, publicKey, userInfo, syncFromBackend]);

  return null;
}

export default GameSync;
