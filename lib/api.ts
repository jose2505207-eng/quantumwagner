/**
 * Typed HTTP client for the LIVE Quantum Wager backend.
 *
 * This is the single entry point for real REST calls. Identity rides in the
 * HttpOnly `qw_session` cookie set by the auth flow — there is no token in
 * localStorage to attach. `withCredentials` makes the browser send that cookie
 * even when NEXT_PUBLIC_API_URL points at a different origin (same-origin sends
 * it automatically). Centralises base URL + error handling so screens never
 * hand-roll axios calls with hardcoded URLs again.
 */
import axios, { AxiosError, AxiosInstance } from "axios";
import { API_URL } from "@/lib/game/config";
import { Market } from "@/app/types";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  withCredentials: true,
});

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function toApiError(err: unknown, fallback: string): ApiError {
  const ax = err as AxiosError<{ message?: string }>;
  const msg = ax?.response?.data?.message || ax?.message || fallback;
  return new ApiError(msg, ax?.response?.status);
}

// ----------------------------------------------------------------------------
// Markets (live REST: GET /api/markets, GET /api/markets/:id)
// ----------------------------------------------------------------------------

export async function getMarkets(): Promise<Market[]> {
  try {
    const res = await api.get(`/api/markets`);
    return (res.data?.data?.markets as Market[]) ?? [];
  } catch (err) {
    throw toApiError(err, "Failed to load markets");
  }
}

export async function getMarket(id: string): Promise<Market | null> {
  try {
    const res = await api.get(`/api/markets/${id}`);
    return (res.data?.data?.market as Market) ?? (res.data?.market as Market) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to load market");
  }
}

// ----------------------------------------------------------------------------
// Fast bets (live REST: GET /api/fast-bets)
// ----------------------------------------------------------------------------

/** Shape of a fast-bet row as returned by GET /api/fast-bets. */
export interface ApiFastBet {
  id: string;
  question: string;
  symbol: string;
  status: string; // upcoming | live | closing-soon | resolving | resolved
  outcome: string | null; // YES | NO
  pool: number;
  yesPool: number; // sum of FastBetEntry.amount on the YES side
  noPool: number; // sum of FastBetEntry.amount on the NO side
  currentPrice: number | null; // live oracle price for live/closing-soon bets; null if unknown
  startPrice?: number | null; // oracle price captured at round start; null if unknown
  resolutionSource?: string | null; // how it settled, e.g. "provider:pyth" | "admin"; null if unknown
  settlePrice?: number | null; // actual price the round settled on (auto-resolve); null if unknown/admin
  settleMethod?: string | null; // how settlePrice was captured: "asof" | "spot-fallback" | "spot"; null if unknown
  startTime: string;
  endTime: string;
  isDemo: boolean;
  _count?: { entries: number };
}

export async function getFastBets(): Promise<ApiFastBet[]> {
  try {
    const res = await api.get(`/api/fast-bets`);
    const rows = res.data?.data?.fastBets;
    return Array.isArray(rows) ? (rows as ApiFastBet[]) : [];
  } catch (err) {
    throw toApiError(err, "Failed to load fast bets");
  }
}

/** A player's own staked position in a round. */
export interface ApiFastBetEntry {
  id: string;
  side: "YES" | "NO";
  amount: number;
  won: boolean | null;
  payout: number;
  txSignature: string | null;
  payoutTxSignature: string | null;
  createdAt: string;
}

/** One round plus the caller's own entries (empty when signed out). */
export async function getFastBet(
  id: string
): Promise<{ fastBet: ApiFastBet; myEntries: ApiFastBetEntry[] } | null> {
  try {
    const res = await api.get(`/api/fast-bets/${id}`);
    const data = res.data?.data;
    if (!data?.fastBet) return null;
    return {
      fastBet: data.fastBet as ApiFastBet,
      myEntries: (data.myEntries ?? []) as ApiFastBetEntry[],
    };
  } catch (err) {
    throw toApiError(err, "Failed to load this round");
  }
}

/**
 * Record a fast-bet entry. The SOL transfer into the platform vault must have
 * confirmed first — the backend verifies recipient, signer and amount before
 * it stores anything.
 */
export async function enterFastBet(
  id: string,
  input: { side: MarketSide; amount: number; txSignature: string }
): Promise<ApiFastBetEntry | null> {
  try {
    const res = await api.post(`/api/fast-bets/${id}/enter`, input);
    return (res.data?.data?.entry as ApiFastBetEntry) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to record your fast bet");
  }
}

// ----------------------------------------------------------------------------
// Public runtime config (GET /api/config/public)
// ----------------------------------------------------------------------------

export interface PublicConfig {
  network: string;
  rpcUrl: string;
  oracleMode: string;
  appMode: string;
  fastBets: {
    vault: string | null;
    stakingEnabled: boolean;
    payoutsEnabled: boolean;
  };
}

export async function getPublicConfig(): Promise<PublicConfig | null> {
  try {
    const res = await api.get(`/api/config/public`);
    return (res.data?.data as PublicConfig) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to load app configuration");
  }
}

// ----------------------------------------------------------------------------
// Auth / profile (live REST)
// ----------------------------------------------------------------------------

export async function getProfile() {
  const res = await api.get(`/api/auth/profile`);
  return res.data;
}

// ----------------------------------------------------------------------------
// Battles — record on-chain events (POST, auth required). These run AFTER the
// Solana tx confirms; the backend re-verifies the signature (REQUIRE_ONCHAIN)
// before persisting/awarding. `ref` may be the battle cuid OR its on-chain pda.
// ----------------------------------------------------------------------------

export type BattleSide = "A" | "B";

/** Record a created battle. Idempotent on `pda`. Returns the backend row id. */
export async function recordBattleCreated(input: {
  title: string;
  description?: string;
  sideA?: string;
  sideB?: string;
  pda: string;
  txSignature?: string;
}): Promise<{ id: string } | null> {
  try {
    const res = await api.post(`/api/battles`, input);
    return (res.data?.data?.battle as { id: string }) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to record battle");
  }
}

/** Record a battle entry (join). */
export async function recordBattleEntry(
  ref: string,
  input: { side: BattleSide; amount: number; txSignature?: string }
): Promise<void> {
  try {
    await api.post(`/api/battles/${ref}/join`, input);
  } catch (err) {
    throw toApiError(err, "Failed to record battle entry");
  }
}

/** Record a battle position increase. */
export async function recordBattleIncrease(
  ref: string,
  input: { amount: number; txSignature?: string }
): Promise<void> {
  try {
    await api.post(`/api/battles/${ref}/increase`, input);
  } catch (err) {
    throw toApiError(err, "Failed to record battle increase");
  }
}

// ----------------------------------------------------------------------------
// Markets — record on-chain events (POST, auth required). `ref` may be the
// market cuid OR its on-chain pda. Bets/withdrawals re-verify on-chain; market
// creation is soft-verified (admin off-chain markets are allowed).
// ----------------------------------------------------------------------------

export type MarketSide = "YES" | "NO";

/** Record a created market. Idempotent on `pda`. Returns the backend row id. */
export async function recordMarketCreated(input: {
  question: string;
  description?: string;
  category?: string;
  endTime: string | Date;
  pda: string;
  txSignature?: string;
}): Promise<{ id: string } | null> {
  try {
    const res = await api.post(`/api/markets`, input);
    return (res.data?.data?.market as { id: string }) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to record market");
  }
}

/** A prediction as persisted by the backend (amounts in SOL). */
export interface RecordedPrediction {
  id: string;
  marketId: string;
  side: MarketSide;
  amount: number;
  txSignature: string | null;
  createdAt: string;
}

/**
 * Record a prediction (bet) on a market. `amount` is SOL, never lamports.
 * Returns the persisted row so callers can render the real record instead of
 * posting a second time to a different endpoint.
 */
export async function recordPrediction(
  ref: string,
  input: { side: MarketSide; amount: number; txSignature?: string }
): Promise<RecordedPrediction | null> {
  try {
    const res = await api.post(`/api/markets/${ref}/predictions`, input);
    return (res.data?.data?.prediction as RecordedPrediction) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to record prediction");
  }
}

/** Record a market cancellation (creator-only). */
export async function recordMarketCancel(
  ref: string,
  input: { txSignature?: string } = {}
): Promise<void> {
  try {
    await api.post(`/api/markets/${ref}/cancel`, input);
  } catch (err) {
    throw toApiError(err, "Failed to record market cancel");
  }
}

/** Record a winnings withdrawal from a market. */
export async function recordMarketWithdraw(
  ref: string,
  input: { txSignature?: string } = {}
): Promise<void> {
  try {
    await api.post(`/api/markets/${ref}/withdraw`, input);
  } catch (err) {
    throw toApiError(err, "Failed to record market withdrawal");
  }
}

// ----------------------------------------------------------------------------
// Token launchpad — record on-chain events (POST, auth required). `ref` may be
// the token cuid OR its SPL mint. Launch is hard-verified on-chain.
// ----------------------------------------------------------------------------

export type TokenAction = "buy" | "sell" | "claim" | "royalties";

/** Record a launched token. Idempotent on `mint`. Returns the backend row id. */
export async function recordTokenLaunch(input: {
  name: string;
  symbol: string;
  description?: string;
  imageUri?: string;
  totalSupply?: string;
  mint: string;
  txSignature?: string;
}): Promise<{ id: string } | null> {
  try {
    const res = await api.post(`/api/launchpad/tokens`, input);
    return (res.data?.data?.token as { id: string }) ?? null;
  } catch (err) {
    throw toApiError(err, "Failed to record token launch");
  }
}

/** Record a token event: buy | sell | claim (creator tokens) | royalties. */
export async function recordTokenEvent(
  ref: string,
  input: { action: TokenAction; amount?: number; txSignature?: string }
): Promise<void> {
  try {
    await api.post(`/api/launchpad/tokens/${ref}/trade`, input);
  } catch (err) {
    throw toApiError(err, "Failed to record token event");
  }
}

export { API_URL };
