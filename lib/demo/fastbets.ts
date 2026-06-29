/**
 * DEMO seed fast-bet rounds — clearly isolated.
 *
 * These are NOT real fast bets. They are only ever shown when:
 *   1. DEMO_MODE is on, AND
 *   2. the live backend returned zero fast-bet rounds.
 * Whenever these are rendered the page MUST show a <DemoBadge/> so the user is
 * never tricked into thinking illustrative seed data is a live round. Never
 * merge these silently into live data.
 */
import type { FastBetCardProps } from "@/components/fastbet/FastBetCard";

export type DemoFastBet = Omit<FastBetCardProps, "index"> & { isDemo: true };

export const DEMO_FAST_BETS: DemoFastBet[] = [
  {
    id: 1,
    question: "Will PUMP reach $0.005 in 10 minutes?",
    currentPrice: 0.00423,
    yesPercentage: 68,
    noPercentage: 32,
    totalPool: 50700,
    timeRemaining: "8m 34s",
    status: "live",
    riskLevel: "high",
    isDemo: true,
  },
  {
    id: 2,
    question: "Will MEME dump 20% in next 15 minutes?",
    currentPrice: 0.00312,
    yesPercentage: 45,
    noPercentage: 55,
    totalPool: 42000,
    timeRemaining: "12m 18s",
    status: "live",
    riskLevel: "medium",
    isDemo: true,
  },
  {
    id: 3,
    question: "Will ROCKET hit ATH in 5 minutes?",
    currentPrice: 0.00567,
    yesPercentage: 82,
    noPercentage: 18,
    totalPool: 50000,
    timeRemaining: "3m 45s",
    status: "closing-soon",
    riskLevel: "high",
    isDemo: true,
  },
  {
    id: 4,
    question: "Will DEGEN pump 30% in 10 minutes?",
    currentPrice: 0.00189,
    yesPercentage: 0,
    noPercentage: 0,
    totalPool: 0,
    timeRemaining: "Starts in 24m",
    status: "upcoming",
    riskLevel: "medium",
    isDemo: true,
  },
  {
    id: 5,
    question: "Will MOON reach $0.01 in 12 minutes?",
    currentPrice: 0.00834,
    yesPercentage: 76,
    noPercentage: 24,
    totalPool: 60000,
    timeRemaining: "Resolving...",
    status: "resolving",
    riskLevel: "high",
    isDemo: true,
  },
  {
    id: 6,
    question: "Will PEPE dump 25% in 8 minutes?",
    currentPrice: 0.00245,
    yesPercentage: 42,
    noPercentage: 58,
    totalPool: 50000,
    timeRemaining: "Resolved",
    status: "resolved",
    riskLevel: "low",
    isDemo: true,
  },
];
