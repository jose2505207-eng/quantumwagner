import { LevelDef, LevelId } from "./types";

/**
 * The 6-level arena progression. This is the spine of the product:
 * every screen should answer "what level am I / what's next".
 */
export const LEVELS: LevelDef[] = [
  {
    level: 1,
    id: "connect-wallet",
    title: "Connect Wallet",
    mission: "Connect your wallet to unlock the arena.",
    xp: 100,
    href: "/markets",
    cta: "Connect Wallet",
  },
  {
    level: 2,
    id: "first-prediction",
    title: "Place First Prediction",
    mission: "Place your first prediction and earn your first XP.",
    xp: 150,
    href: "/markets",
    cta: "Open Markets",
  },
  {
    level: 3,
    id: "win-fast-bet",
    title: "Win a Fast Bet",
    mission: "Win a speed round before the clock burns out.",
    xp: 250,
    href: "/fastbet",
    cta: "Enter Fast Bets",
  },
  {
    level: 4,
    id: "join-meme-battle",
    title: "Join Meme Battle",
    mission: "Enter a meme battle and back your side.",
    xp: 300,
    href: "/battlearena",
    cta: "Enter Battle Arena",
  },
  {
    level: 5,
    id: "launch-token",
    title: "Launch Token",
    mission: "Launch a token and rally your community.",
    xp: 400,
    href: "/token",
    cta: "Launch a Token",
  },
  {
    level: 6,
    id: "enter-leaderboard",
    title: "Enter Leaderboard Arena",
    mission: "Enter the leaderboard arena and prove your edge.",
    xp: 500,
    href: "/leaderboard",
    cta: "View Leaderboard",
  },
];

export const LEVEL_BY_ID: Record<LevelId, LevelDef> = LEVELS.reduce(
  (acc, l) => ({ ...acc, [l.id]: l }),
  {} as Record<LevelId, LevelDef>
);

export const FIRST_LEVEL = LEVELS[0];
export const LAST_LEVEL = LEVELS[LEVELS.length - 1];

/**
 * The current "active" level = the first not-yet-completed milestone.
 * A level is locked until every level before it is complete.
 */
export function getActiveLevel(completed: LevelId[]): LevelDef {
  const next = LEVELS.find((l) => !completed.includes(l.id));
  return next ?? LAST_LEVEL;
}

export function isLevelUnlocked(level: LevelDef, completed: LevelId[]): boolean {
  if (level.level === 1) return true;
  const prev = LEVELS[level.level - 2];
  return completed.includes(prev.id);
}
