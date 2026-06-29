/**
 * Typed HTTP client for the LIVE Quantum Wager backend.
 *
 * This is the single entry point for real REST calls. It injects the wallet JWT
 * (stored by walletAuth) and centralises base URL + error handling so screens
 * never hand-roll axios calls with hardcoded URLs again.
 */
import axios, { AxiosError, AxiosInstance } from "axios";
import { API_URL } from "@/lib/game/config";
import { Market } from "@/app/types";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
});

// Attach the wallet auth token (if present) to every request.
api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
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

// ----------------------------------------------------------------------------
// Auth / profile (live REST)
// ----------------------------------------------------------------------------

export async function getProfile() {
  const res = await api.get(`/api/auth/profile`);
  return res.data;
}

export { API_URL };
