import { RankDef, RankId } from "./types";

/** XP-driven rank ladder. Thresholds escalate to keep climbing meaningful. */
export const RANKS: RankDef[] = [
  { id: "unranked", name: "Unranked", minXp: 0, color: "#6b7280" },
  { id: "rookie", name: "Rookie", minXp: 250, color: "#22d3ee" },
  { id: "signal-hunter", name: "Signal Hunter", minXp: 750, color: "#3b82f6" },
  { id: "market-mage", name: "Market Mage", minXp: 1500, color: "#8b5cf6" },
  { id: "quantum-shark", name: "Quantum Shark", minXp: 3000, color: "#d946ef" },
  { id: "oracle", name: "Oracle", minXp: 6000, color: "#f59e0b" },
  { id: "arena-legend", name: "Arena Legend", minXp: 12000, color: "#ec4899" },
];

export const RANK_BY_ID: Record<RankId, RankDef> = RANKS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<RankId, RankDef>
);

export function getRank(xp: number): RankDef {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r;
    else break;
  }
  return current;
}

export function getNextRank(xp: number): RankDef | null {
  return RANKS.find((r) => r.minXp > xp) ?? null;
}

/** Fractional progress (0..1) from the current rank floor to the next rank. */
export function rankProgress(xp: number): number {
  const current = getRank(xp);
  const next = getNextRank(xp);
  if (!next) return 1;
  const span = next.minXp - current.minXp;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (xp - current.minXp) / span));
}
