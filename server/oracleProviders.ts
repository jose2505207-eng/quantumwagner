/**
 * Price-feed provider layer for oracle "provider" mode.
 *
 * A PriceFeedProvider fetches a real, attestable price for a symbol from an
 * external oracle network. The oracle layer (server/oracle.ts) derives a
 * market outcome by comparing that price to a threshold — the outcome is NEVER
 * hardcoded, and an unconfigured provider must FAIL LOUDLY rather than invent a
 * price.
 *
 * Real adapters that slot in here (Loop 2), each replacing StubPriceFeedProvider:
 *
 *  - Pyth Hermes adapter:
 *      config needed: PYTH_HERMES_URL (e.g. https://hermes.pyth.network) and a
 *      per-symbol price feed id (32-byte hex, from the Pyth price feed catalog,
 *      e.g. SOL/USD). getPrice() GETs /v2/updates/price/latest?ids[]=<feedId>,
 *      reads price.price * 10^price.expo, confidence from price.conf, and
 *      publishTime from the returned price object.
 *
 *  - Switchboard On-Demand adapter:
 *      config needed: a Switchboard feed pubkey + a Solana RPC URL
 *      (SOLANA_RPC_URL already in env). getPrice() loads the feed account /
 *      simulates the feed update and reads the latest value + std-dev/range as
 *      confidence and the slot/timestamp as publishTime.
 *
 * Neither real endpoint nor key is fabricated here; the stub fails until one is
 * wired with the credentials above.
 */

import { env } from "./env";

export interface PriceFeedProvider {
  name: string;
  getPrice(symbol: string): Promise<{
    price: number;
    confidence: number;
    publishTime: number;
  }>;
}

/** A fetcher injected into the stub so tests drive prices deterministically. */
export type PriceFetcher = (
  symbol: string
) => Promise<{ price: number; confidence: number; publishTime: number }>;

/**
 * A concrete, honest provider that NEVER invents a price.
 *
 * In production it is unconfigured (no fetcher) and getPrice() throws — that is
 * the correct, loud failure until a real Pyth/Switchboard adapter is wired. In
 * tests, an injected fetcher supplies deterministic feed values.
 */
export class StubPriceFeedProvider implements PriceFeedProvider {
  name: string;
  private fetcher?: PriceFetcher;

  constructor(fetcher?: PriceFetcher, name = "stub") {
    this.fetcher = fetcher;
    this.name = name;
  }

  async getPrice(symbol: string) {
    if (!this.fetcher) {
      throw new Error(
        `price-feed provider not configured: set PYTH_HERMES_URL + feed id for ${symbol}`
      );
    }
    return this.fetcher(symbol);
  }
}

/**
 * Shape of a single entry in Hermes' `parsed` array (v2 price/latest). Only the
 * fields we read are typed; Pyth may include more (e.g. `ema_price`, `metadata`).
 */
interface HermesParsedPrice {
  id: string;
  price: {
    price: string; // integer mantissa as a string (can exceed JS safe-int range)
    conf: string; // confidence interval, same mantissa/expo scale as `price`
    expo: number; // base-10 exponent; real value = mantissa * 10^expo
    publish_time: number; // UNIX seconds
  };
}

/**
 * Real Pyth Hermes price-feed adapter.
 *
 * Hermes (https://hermes.pyth.network) is a PUBLIC, keyless HTTP service that
 * serves the latest signed price updates for Pyth feeds. There is no credential
 * to fabricate here — the only required config is the per-symbol 32-byte feed id
 * (operators supply it via PYTH_FEED_IDS; see getPriceFeedProvider below).
 *
 * Honesty doctrine: this adapter NEVER invents a price. An unmapped symbol, a
 * non-200 response, or an empty `parsed` array all THROW so the caller surfaces
 * a loud failure (a 400 in the resolve route) instead of a fabricated outcome.
 */
export class PythHermesProvider implements PriceFeedProvider {
  name = "pyth";
  private baseUrl: string;
  // Map of UPPER-CASED symbol -> 32-byte hex feed id, for case-insensitive lookup.
  private feedIds: Record<string, string>;
  private fetchImpl: typeof fetch;

  constructor(opts: {
    baseUrl: string;
    feedIds: Record<string, string>;
    fetchImpl?: typeof fetch;
  }) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, ""); // tolerate a trailing slash
    // Normalise keys to upper-case so "sol/usd" and "SOL/USD" resolve the same id.
    this.feedIds = Object.fromEntries(
      Object.entries(opts.feedIds).map(([k, v]) => [k.toUpperCase(), v])
    );
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async getPrice(symbol: string) {
    const feedId = this.feedIds[symbol.toUpperCase()];
    if (!feedId) {
      // Never fall back to a fake price — name the symbol and fail loudly.
      throw new Error(
        `pyth: no feed id configured for symbol "${symbol}". ` +
          `Set PYTH_FEED_IDS (e.g. "${symbol}=0x<64-hex feed id>"); ` +
          `find ids at https://pyth.network/developers/price-feed-ids`
      );
    }

    const url = `${this.baseUrl}/v2/updates/price/latest?ids[]=${feedId}`;
    const res = await this.fetchImpl(url);
    if (!res.ok) {
      throw new Error(
        `pyth: Hermes returned HTTP ${res.status} for ${symbol} (${url})`
      );
    }

    const body = (await res.json()) as { parsed?: HermesParsedPrice[] };
    const entry = body.parsed?.[0];
    if (!entry) {
      // Empty parsed array means Hermes had no update for the id — do not invent.
      throw new Error(`pyth: empty/parsed-less response for ${symbol} (${url})`);
    }

    const { price, conf, expo, publish_time } = entry.price;
    // Real value = mantissa * 10^expo (expo is negative for crypto, e.g. -8).
    const scale = Math.pow(10, expo);
    const priceValue = Number(price) * scale;
    const confInPrice = Number(conf) * scale; // confidence interval in price units

    // Map Pyth's absolute confidence interval into a 0..1 confidence band:
    //   relativeError = confInPrice / |priceValue|
    //   confidence    = clamp(1 - relativeError, 0, 1)
    // A tight band (conf << price) -> confidence ~1; a wide/uncertain band -> ~0.
    // Guard divide-by-zero: a zero price carries no information -> confidence 0.
    const confidence =
      priceValue === 0
        ? 0
        : clamp01(1 - confInPrice / Math.abs(priceValue));

    return {
      price: priceValue,
      confidence,
      // publish_time is UNIX SECONDS; we return it as-is (seconds) to match the
      // provider contract used by oracle.ts (no ms conversion anywhere downstream).
      publishTime: publish_time,
    };
  }
}

/** Clamp a number into the inclusive [0, 1] range. */
function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/**
 * Parse PYTH_FEED_IDS — a comma-separated list of `SYMBOL=hexid` pairs, e.g.
 *   "SOL/USD=0xef0d...,BTC/USD=0xe62d..."
 * Whitespace around entries/pairs is tolerated; malformed pairs are skipped.
 */
function parseFeedIds(raw?: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!raw) return map;
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const symbol = pair.slice(0, idx).trim();
    const id = pair.slice(idx + 1).trim();
    if (symbol && id) map[symbol] = id;
  }
  return map;
}

/**
 * Default feed-id map.
 *
 * Contains ONLY ids verified byte-for-byte against the live Pyth catalog +
 * price endpoint — never a guessed constant (a wrong id silently prices the
 * WRONG market). SOL/USD below was confirmed via
 *   GET https://hermes.pyth.network/v2/price_feeds?query=SOL/USD&asset_type=crypto
 *   -> attributes.symbol "Crypto.SOL/USD", id ef0d8b6f...c280b56d
 * and a successful GET /v2/updates/price/latest?ids[]=<that id> (returns a
 * parsed price). Hermes accepts the id with or without a 0x prefix; we store
 * the bare hex exactly as the catalog returns it.
 *
 * Operators add more symbols via PYTH_FEED_IDS (merged over these). Any symbol
 * NOT present here and NOT in env still THROWS loudly in getPrice() — we never
 * resolve a market off an unverified feed. Catalog:
 * https://pyth.network/developers/price-feed-ids
 */
const DEFAULT_FEED_IDS: Record<string, string> = {
  "SOL/USD": "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
};

/**
 * Factory the markets resolve route (and fast-bets feed) call to obtain a price
 * provider, honouring env-driven configuration:
 *
 *  - If ORACLE_PROVIDER === "pyth" OR PYTH_FEED_IDS is set, return a real
 *    PythHermesProvider pointed at PYTH_HERMES_URL with the parsed feed map.
 *  - Otherwise return the existing loud StubPriceFeedProvider, preserving the
 *    dev/admin modes (unconfigured -> throws, surfaced as a 400).
 */
export function getPriceFeedProvider(): PriceFeedProvider {
  const usePyth =
    env.ORACLE_PROVIDER === "pyth" || Boolean(env.PYTH_FEED_IDS);

  if (usePyth) {
    const feedIds = { ...DEFAULT_FEED_IDS, ...parseFeedIds(env.PYTH_FEED_IDS) };
    return new PythHermesProvider({
      baseUrl: env.PYTH_HERMES_URL,
      feedIds,
    });
  }

  return new StubPriceFeedProvider();
}
