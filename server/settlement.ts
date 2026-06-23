/**
 * Pari-mutuel settlement math — pure functions, no I/O.
 *
 * Winners split the entire pool pro-rata to their winning stake. Isolated and
 * exhaustively unit-tested because it determines real payouts.
 */

/** Payout for a single winning stake. Losers (or zero winner pool) get 0. */
export function computePayout(
  stake: number,
  winnersStake: number,
  totalPool: number
): number {
  if (stake <= 0 || winnersStake <= 0 || totalPool <= 0) return 0;
  if (stake > winnersStake) return 0; // a single stake can't exceed the winners' pool
  return (stake / winnersStake) * totalPool;
}

export interface Stake {
  id: string;
  side: string;
  amount: number;
}

export interface Settlement {
  id: string;
  won: boolean;
  payout: number;
}

/**
 * Settle a set of stakes against a winning side. Returns per-stake results.
 * Conserves value: the sum of winners' payouts equals the total pool (modulo
 * float precision) whenever at least one winner exists.
 */
export function settle(stakes: Stake[], winningSide: string): Settlement[] {
  const totalPool = stakes.reduce((s, x) => s + Math.max(0, x.amount), 0);
  const winners = stakes.filter((s) => s.side === winningSide);
  const winnersStake = winners.reduce((s, x) => s + Math.max(0, x.amount), 0);
  return stakes.map((s) => {
    const won = s.side === winningSide;
    return {
      id: s.id,
      won,
      payout: won ? computePayout(s.amount, winnersStake, totalPool) : 0,
    };
  });
}
