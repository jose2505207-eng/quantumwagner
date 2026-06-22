/** Shared gamification types — used by both UI and the progression store. */

export type LevelId =
  | "connect-wallet"
  | "first-prediction"
  | "win-fast-bet"
  | "join-meme-battle"
  | "launch-token"
  | "enter-leaderboard";

export type RankId =
  | "unranked"
  | "rookie"
  | "signal-hunter"
  | "market-mage"
  | "quantum-shark"
  | "oracle"
  | "arena-legend";

export type StatusKind =
  | "live"
  | "hot"
  | "new"
  | "locked"
  | "resolved"
  | "pending"
  | "won"
  | "lost";

export type QuestId =
  | "daily-checkin"
  | "place-prediction"
  | "join-battle"
  | "visit-leaderboard"
  | "share-arena";

export interface LevelDef {
  /** 1-based level number shown to the player. */
  level: number;
  id: LevelId;
  title: string;
  /** Mission copy — what to do and why. */
  mission: string;
  /** XP granted the first time this milestone is reached. */
  xp: number;
  /** Route the CTA should send the player to. */
  href: string;
  /** CTA label. */
  cta: string;
}

export interface RankDef {
  id: RankId;
  name: string;
  /** Minimum XP to hold this rank. */
  minXp: number;
  /** Accent colour token (hex) for badges/glows. */
  color: string;
}

export interface QuestDef {
  id: QuestId;
  title: string;
  description: string;
  xp: number;
  /** How the quest is completed: claimed manually, or derived from a real signal. */
  kind: "claim" | "derived";
  href?: string;
}

/** Persisted player progression (localStorage). */
export interface PlayerProgress {
  xp: number;
  /** Level ids the player has completed (milestones). */
  completedLevels: LevelId[];
  /** Quest ids claimed today, keyed implicitly by lastQuestDay. */
  claimedQuests: QuestId[];
  /** ISO date (yyyy-mm-dd) of the last daily reset. */
  lastQuestDay: string | null;
  /** Consecutive-day streak. */
  streak: number;
  /** ISO date of last check-in for streak math. */
  lastCheckIn: string | null;
}

export interface XpToastPayload {
  amount: number;
  reason: string;
  /** Optional level/rank-up signal for richer feedback. */
  levelUp?: number;
  rankUp?: RankId;
}
