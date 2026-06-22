"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserStore } from "@/store/userInfo";
import { useGameStore } from "@/store/useGameStore";
import { api } from "@/lib/api";
import { LevelId } from "@/lib/game/types";

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
  const hydrateServer = useGameStore((s) => s.hydrateServer);

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

  // Pull server-authoritative progress (XP/levels/streak) into the HUD when
  // authenticated. Best-effort: silently ignored if the backend is offline.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("token")) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/api/player/progress`);
        const d = res.data?.data;
        if (!cancelled && d) {
          hydrateServer({
            xp: d.xp,
            completedLevels: (d.completedLevels ?? []) as LevelId[],
            streak: d.streak,
          });
        }
      } catch {
        /* offline / unauthenticated — local progression remains the display */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected, userInfo, hydrateServer]);

  return null;
}

export default GameSync;
