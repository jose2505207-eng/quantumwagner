import { describe, it, expect } from "vitest";
import { PythHermesProvider } from "@/server/oracleProviders";

/**
 * PythHermesProvider turns a raw Hermes payload into the (price, confidence,
 * publishTime) the oracle resolver compares against a threshold. The mantissa→
 * value scaling and the conf→confidence-band math are load-bearing: a wrong
 * scale resolves a market off a price that's 10^8x off, and the honesty doctrine
 * requires throwing — never inventing — when a symbol is unmapped or Hermes
 * returns nothing. These tests pin all of that WITHOUT touching the network.
 */

// Build a fake fetch returning a Hermes-shaped v2 price/latest payload.
function fakeFetch(parsed: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? (ok ? 200 : 500);
  return (async () =>
    ({
      ok,
      status,
      json: async () => ({ parsed }),
    }) as unknown as Response) as unknown as typeof fetch;
}

const SOL_FEED = "0x" + "ef".repeat(32); // arbitrary 32-byte id; tests never hit the net

function makeProvider(fetchImpl: typeof fetch) {
  return new PythHermesProvider({
    baseUrl: "https://hermes.example",
    feedIds: { "SOL/USD": SOL_FEED },
    fetchImpl,
  });
}

describe("PythHermesProvider", () => {
  it("normalizes mantissa*10^expo into a real price", async () => {
    // price 14523456789 with expo -8 => 145.23456789
    const provider = makeProvider(
      fakeFetch([
        {
          id: SOL_FEED,
          price: {
            price: "14523456789",
            conf: "7261728",
            expo: -8,
            publish_time: 1700000000,
          },
        },
      ])
    );

    const feed = await provider.getPrice("SOL/USD");
    expect(feed.price).toBeCloseTo(145.23456789, 6);
    expect(feed.publishTime).toBe(1700000000); // seconds, returned as-is
  });

  it("maps Pyth conf into a 0..1 confidence band", async () => {
    const provider = makeProvider(
      fakeFetch([
        {
          id: SOL_FEED,
          price: {
            price: "14523456789",
            conf: "7261728",
            expo: -8,
            publish_time: 1700000000,
          },
        },
      ])
    );

    const feed = await provider.getPrice("SOL/USD");
    // confidence = clamp(1 - conf/price, 0, 1). conf/price ≈ 0.0005, so ~0.9995.
    expect(feed.confidence).toBeGreaterThan(0);
    expect(feed.confidence).toBeLessThanOrEqual(1);
    expect(feed.confidence).toBeCloseTo(1 - 7261728 / 14523456789, 6);
  });

  it("is case-insensitive on the symbol lookup", async () => {
    const provider = makeProvider(
      fakeFetch([
        {
          id: SOL_FEED,
          price: { price: "100", conf: "1", expo: 0, publish_time: 1 },
        },
      ])
    );
    const feed = await provider.getPrice("sol/usd");
    expect(feed.price).toBe(100);
  });

  it("yields confidence 0 (not NaN) when price is 0 (divide-by-zero guard)", async () => {
    const provider = makeProvider(
      fakeFetch([
        {
          id: SOL_FEED,
          price: { price: "0", conf: "5", expo: -8, publish_time: 1 },
        },
      ])
    );
    const feed = await provider.getPrice("SOL/USD");
    expect(feed.price).toBe(0);
    expect(feed.confidence).toBe(0);
  });

  it("THROWS for an unmapped symbol — never invents a price", async () => {
    const provider = makeProvider(fakeFetch([]));
    await expect(provider.getPrice("DOGE/USD")).rejects.toThrow(/DOGE\/USD/);
  });

  it("THROWS on a non-200 Hermes response", async () => {
    const provider = makeProvider(fakeFetch([], { ok: false, status: 503 }));
    await expect(provider.getPrice("SOL/USD")).rejects.toThrow(/503/);
  });

  it("THROWS on an empty parsed array — never fabricates an outcome", async () => {
    const provider = makeProvider(fakeFetch([]));
    await expect(provider.getPrice("SOL/USD")).rejects.toThrow(/empty/);
  });
});

/**
 * getPriceAt (Pyth Benchmarks) — price AS OF a timestamp, used by fast-bet
 * auto-resolve to settle on the price at endTime rather than the cron-tick spot.
 * It hits GET /v2/updates/price/{ts} (note: the timestamp is in the PATH, not a
 * query param) and parses the SAME shape as the latest endpoint.
 */
describe("PythHermesProvider.getPriceAt", () => {
  // A fetch that records the URL it was called with and returns a fixed payload.
  function recordingFetch(parsed: unknown) {
    const calls: string[] = [];
    const impl = (async (url: string) => {
      calls.push(url);
      return { ok: true, status: 200, json: async () => ({ parsed }) } as unknown as Response;
    }) as unknown as typeof fetch;
    return { impl, calls };
  }

  it("requests the benchmark timestamp in the URL path and parses the price", async () => {
    const { impl, calls } = recordingFetch([
      {
        id: SOL_FEED,
        price: { price: "12000000000", conf: "1000000", expo: -8, publish_time: 1699999990 },
      },
    ]);
    const provider = makeProvider(impl);

    const feed = await provider.getPriceAt("SOL/USD", 1700000000);
    expect(feed.price).toBeCloseTo(120, 6);
    expect(feed.publishTime).toBe(1699999990); // served price's own publish time
    // The requested second is in the path: /v2/updates/price/1700000000
    expect(calls[0]).toContain("/v2/updates/price/1700000000?ids[]=");
    expect(calls[0]).not.toContain("/latest");
  });

  it("floors a fractional timestamp to whole seconds", async () => {
    const { impl, calls } = recordingFetch([
      { id: SOL_FEED, price: { price: "1", conf: "0", expo: 0, publish_time: 1 } },
    ]);
    const provider = makeProvider(impl);
    await provider.getPriceAt("SOL/USD", 1700000000.987);
    expect(calls[0]).toContain("/v2/updates/price/1700000000?");
  });

  it("THROWS for an unmapped symbol — never invents a historical price", async () => {
    const provider = makeProvider(fakeFetch([]));
    await expect(provider.getPriceAt("DOGE/USD", 1700000000)).rejects.toThrow(/DOGE\/USD/);
  });
});
