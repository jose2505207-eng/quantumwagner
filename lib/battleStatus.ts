/**
 * Single source of truth for how a battle's state is presented.
 *
 * The on-chain `BattleStatus` enum (Upcoming | Active | Resolving | Resolved |
 * Cancelled) is only advanced when someone sends a transaction, so it drifts:
 * a battle can sit at `Upcoming` long after its `endTime` has passed because
 * nobody ever poked it. Reading the raw enum is what let the arena list render
 * "UPCOMING" while the detail page claimed "LIVE BATTLE" for the same battle.
 *
 * So the displayed lifecycle is derived from the enum AND the clock, and both
 * the card and the detail page go through here.
 */

export type BattleLifecycle =
  | "upcoming"
  | "live"
  | "ended"
  | "resolved"
  | "cancelled";

/** Coerce a BN | number | string | undefined unix-seconds value to millis. */
function toMillis(unix: unknown): number | null {
  if (unix === null || unix === undefined) return null;
  const n = Number(String(unix));
  return Number.isFinite(n) && n > 0 ? n * 1000 : null;
}

/** The raw anchor enum arrives as `{ upcoming: {} }` — take the variant key. */
export function rawStatusKey(status: unknown): string {
  const key = Object.keys((status as Record<string, unknown>) || {})[0];
  return (key || "unknown").toLowerCase();
}

export function deriveBattleLifecycle(
  status: unknown,
  startTime: unknown,
  endTime: unknown,
  now: number = Date.now()
): BattleLifecycle {
  const raw = rawStatusKey(status);

  // Terminal on-chain states are authoritative — the clock cannot override them.
  if (raw === "cancelled") return "cancelled";
  if (raw === "resolved") return "resolved";
  // Payout is being settled; it is definitively no longer taking bets.
  if (raw === "resolving") return "ended";

  const end = toMillis(endTime);
  const start = toMillis(startTime);

  if (end !== null && now >= end) return "ended";
  if (start !== null && now < start) return "upcoming";
  // No usable start time: fall back to trusting the enum rather than guessing.
  if (start === null && raw === "upcoming") return "upcoming";
  return "live";
}

/** Short uppercase label for a status pill. */
export function battleStatusLabel(lifecycle: BattleLifecycle): string {
  switch (lifecycle) {
    case "live":
      return "LIVE";
    case "upcoming":
      return "UPCOMING";
    case "ended":
      return "ENDED";
    case "resolved":
      return "RESOLVED";
    case "cancelled":
      return "CANCELLED";
  }
}

/** Only a genuinely live battle may accept new entries. */
export function canAcceptBets(lifecycle: BattleLifecycle): boolean {
  return lifecycle === "live";
}

/**
 * Caption + value for the countdown slot, so the label always agrees with the
 * value: a past date reads "Ended / 9 months ago", never "Ends In / 9 months ago".
 */
export function battleTimeLabel(
  endTime: unknown,
  now: number = Date.now()
): { caption: string; isPast: boolean } {
  const end = toMillis(endTime);
  if (end === null) return { caption: "Ends", isPast: false };
  return end <= now
    ? { caption: "Ended", isPast: true }
    : { caption: "Ends In", isPast: false };
}
