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
