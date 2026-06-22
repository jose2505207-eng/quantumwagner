import { LEVELS } from "./levels";
import { LevelId } from "./types";

/**
 * XP helpers. The player's "arena level number" is derived from how many of the
 * 6 milestone levels they have completed (1-based), not from raw XP — raw XP
 * drives the rank ladder instead. This keeps the two progression axes distinct:
 *   - Levels (1..6): the guided onboarding journey.
 *   - XP -> Rank: the open-ended status climb.
 */

/** The number shown in the HUD ("LVL 3"). */
export function arenaLevelNumber(completed: LevelId[]): number {
  // Level N is reached once the first N-1 milestones are done. Floor at 1.
  let n = 1;
  for (const l of LEVELS) {
    if (completed.includes(l.id)) n = Math.min(LEVELS.length, l.level + 1);
  }
  return Math.min(n, LEVELS.length);
}

/** Total XP available across the guided journey (for "x / total" displays). */
export const TOTAL_JOURNEY_XP = LEVELS.reduce((sum, l) => sum + l.xp, 0);

/** Format XP compactly: 1500 -> "1.5K". */
export function formatXp(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`;
  return `${xp}`;
}

/** Streak bonus XP (small, capped) to reward consecutive days. */
export function streakBonus(streak: number): number {
  return Math.min(streak * 10, 100);
}
