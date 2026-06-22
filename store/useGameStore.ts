import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PlayerProgress,
  LevelId,
  QuestId,
  XpToastPayload,
} from "@/lib/game/types";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { QUEST_BY_ID, todayKey } from "@/lib/game/quests";
import { getRank } from "@/lib/game/ranks";
import { arenaLevelNumber, streakBonus } from "@/lib/game/xp";

/**
 * Client-side progression store (persisted to localStorage).
 *
 * Honesty note: this is a LOCAL progression layer. It does not grant on-chain
 * value. It is seeded from real signals where possible (see syncFromBackend)
 * and is always labelled as local/demo in the UI.
 */

const EMPTY: PlayerProgress = {
  xp: 0,
  completedLevels: [],
  claimedQuests: [],
  lastQuestDay: null,
  streak: 0,
  lastCheckIn: null,
};

interface GameState extends PlayerProgress {
  /** Last XP gain, for one-shot toast rendering by the UI layer. */
  lastToast: (XpToastPayload & { _id: number }) | null;

  /** Mark a milestone level complete (idempotent). Returns XP gained. */
  completeLevel: (id: LevelId, reason?: string) => number;
  /** Claim a daily quest (idempotent within the day). Returns XP gained. */
  claimQuest: (id: QuestId) => number;
  /** Daily check-in: advances/resets streak, resets daily quests. */
  checkIn: () => void;
  /** Add raw XP with a toast reason. */
  addXp: (amount: number, reason: string) => void;
  /** Clear the pending toast after it has been shown. */
  consumeToast: () => void;
  /**
   * Reconcile local progression with real backend signals (best-effort).
   * e.g. if the backend says the user has predictions, mark Level 2 complete.
   */
  syncFromBackend: (signals: {
    hasWallet?: boolean;
    predictionCount?: number;
  }) => void;
  /**
   * Merge server-authoritative progress into the local store (HUD display).
   * Server XP wins (it is the source of truth); completed levels are unioned.
   */
  hydrateServer: (data: {
    xp?: number;
    completedLevels?: LevelId[];
    streak?: number;
  }) => void;

  /** Wipe progression (debug / sign-out). */
  reset: () => void;

  // ----- derived selectors (computed, kept as methods for convenience) -----
  rankId: () => ReturnType<typeof getRank>["id"];
  levelNumber: () => number;
}

let toastSeq = 0;

function rolloverDaily(state: PlayerProgress): Partial<PlayerProgress> {
  const today = todayKey();
  if (state.lastQuestDay !== today) {
    return { claimedQuests: [], lastQuestDay: today };
  }
  return {};
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      lastToast: null,

      addXp: (amount, reason) => {
        const before = get().xp;
        const after = before + amount;
        const rankBefore = getRank(before).id;
        const rankAfter = getRank(after).id;
        set({
          xp: after,
          lastToast: {
            _id: ++toastSeq,
            amount,
            reason,
            rankUp: rankAfter !== rankBefore ? rankAfter : undefined,
          },
        });
      },

      completeLevel: (id, reason) => {
        const state = get();
        if (state.completedLevels.includes(id)) return 0;
        const def = LEVEL_BY_ID[id];
        if (!def) return 0;
        const completedLevels = [...state.completedLevels, id];
        const after = state.xp + def.xp;
        const rankBefore = getRank(state.xp).id;
        const rankAfter = getRank(after).id;
        const levelBefore = arenaLevelNumber(state.completedLevels);
        const levelAfter = arenaLevelNumber(completedLevels);
        set({
          completedLevels,
          xp: after,
          lastToast: {
            _id: ++toastSeq,
            amount: def.xp,
            reason: reason ?? `Level cleared: ${def.title}`,
            levelUp: levelAfter !== levelBefore ? levelAfter : undefined,
            rankUp: rankAfter !== rankBefore ? rankAfter : undefined,
          },
        });
        return def.xp;
      },

      claimQuest: (id) => {
        const roll = rolloverDaily(get());
        const state = { ...get(), ...roll };
        if (state.claimedQuests.includes(id)) {
          if (Object.keys(roll).length) set(roll);
          return 0;
        }
        const def = QUEST_BY_ID[id];
        if (!def) return 0;
        const after = state.xp + def.xp;
        const rankBefore = getRank(state.xp).id;
        const rankAfter = getRank(after).id;
        set({
          ...roll,
          claimedQuests: [...state.claimedQuests, id],
          xp: after,
          lastToast: {
            _id: ++toastSeq,
            amount: def.xp,
            reason: `Quest complete: ${def.title}`,
            rankUp: rankAfter !== rankBefore ? rankAfter : undefined,
          },
        });
        return def.xp;
      },

      checkIn: () => {
        const state = get();
        const today = todayKey();
        if (state.lastCheckIn === today) {
          // already checked in today; just ensure daily quests are fresh
          set(rolloverDaily(state));
          return;
        }
        const yesterday = todayKey(new Date(Date.now() - 86_400_000));
        const streak = state.lastCheckIn === yesterday ? state.streak + 1 : 1;
        const bonus = streakBonus(streak);
        const after = state.xp + bonus;
        set({
          ...rolloverDaily(state),
          lastCheckIn: today,
          streak,
          xp: after,
          lastToast: bonus
            ? {
                _id: ++toastSeq,
                amount: bonus,
                reason: `Day ${streak} streak bonus`,
              }
            : state.lastToast,
        });
      },

      syncFromBackend: ({ hasWallet, predictionCount }) => {
        const state = get();
        const toComplete: LevelId[] = [];
        if (hasWallet && !state.completedLevels.includes("connect-wallet"))
          toComplete.push("connect-wallet");
        if (
          (predictionCount ?? 0) > 0 &&
          !state.completedLevels.includes("first-prediction")
        )
          toComplete.push("first-prediction");
        if (!toComplete.length) return;
        // Apply sequentially so XP/toasts stay consistent.
        toComplete.forEach((id) => get().completeLevel(id, "Synced from chain"));
      },

      consumeToast: () => set({ lastToast: null }),

      hydrateServer: ({ xp, completedLevels, streak }) => {
        const state = get();
        const mergedLevels = Array.from(
          new Set([...state.completedLevels, ...(completedLevels ?? [])])
        );
        set({
          // server is authoritative for XP — take it when provided
          xp: typeof xp === "number" ? Math.max(xp, state.xp) : state.xp,
          completedLevels: mergedLevels,
          streak: typeof streak === "number" ? Math.max(streak, state.streak) : state.streak,
        });
      },

      reset: () => set({ ...EMPTY, lastToast: null }),

      rankId: () => getRank(get().xp).id,
      levelNumber: () => arenaLevelNumber(get().completedLevels),
    }),
    {
      name: "qw-progress-v1",
      // only persist the data, not the action closures
      partialize: (s): PlayerProgress => ({
        xp: s.xp,
        completedLevels: s.completedLevels,
        claimedQuests: s.claimedQuests,
        lastQuestDay: s.lastQuestDay,
        streak: s.streak,
        lastCheckIn: s.lastCheckIn,
      }),
    }
  )
);
