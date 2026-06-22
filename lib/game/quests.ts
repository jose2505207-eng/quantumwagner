import { QuestDef } from "./types";

/**
 * Daily quests reset each calendar day (local time). `derived` quests are
 * auto-completed from a real signal (e.g. a placed prediction); `claim` quests
 * are completed by the player tapping the reward.
 */
export const DAILY_QUESTS: QuestDef[] = [
  {
    id: "daily-checkin",
    title: "Daily Check-in",
    description: "Return to the arena to keep your streak alive.",
    xp: 50,
    kind: "claim",
  },
  {
    id: "place-prediction",
    title: "Make a Move",
    description: "Place at least one prediction today.",
    xp: 75,
    kind: "derived",
    href: "/markets",
  },
  {
    id: "visit-leaderboard",
    title: "Scout the Competition",
    description: "Check the leaderboard arena.",
    xp: 30,
    kind: "claim",
    href: "/leaderboard",
  },
  {
    id: "join-battle",
    title: "Pick a Side",
    description: "Open the meme battle arena.",
    xp: 40,
    kind: "claim",
    href: "/battlearena",
  },
];

export const QUEST_BY_ID = DAILY_QUESTS.reduce(
  (acc, q) => ({ ...acc, [q.id]: q }),
  {} as Record<string, QuestDef>
);

/** Local calendar day key for daily resets. */
export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
