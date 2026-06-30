/**
 * Devnet-only network guard — the single, dependency-free place that decides
 * whether an RPC endpoint / cluster is allowed.
 *
 * QuantumWagner is DEVNET / DEMO-ONLY. There is no real-money or mainnet path.
 * Any RPC URL that looks like mainnet, or any SOLANA_NETWORK other than "devnet",
 * is rejected LOUDLY so a misconfiguration can never silently point the app at
 * mainnet.
 *
 * Pure TypeScript (no `@solana/web3.js`, no Node APIs) so it is safe to import
 * from the browser bundle, the Next.js server, AND standalone tsx scripts.
 */

/** Substrings/patterns that mark an endpoint or cluster as mainnet. */
const MAINNET_PATTERNS: RegExp[] = [
  /mainnet/i, // covers "mainnet", "mainnet-beta", "solana-mainnet.*", etc.
  /api\.mainnet-beta\.solana\.com/i,
];

/** Known Solana genesis hashes — the authoritative way to identify a cluster. */
export const GENESIS_HASHES = {
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  "mainnet-beta": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  testnet: "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY",
} as const;

/** True when the URL (or cluster moniker) looks like mainnet. */
export function looksLikeMainnet(url: string | undefined | null): boolean {
  if (!url) return false;
  return MAINNET_PATTERNS.some((re) => re.test(url));
}

/**
 * Redact an RPC URL down to its host so logs never leak an API key. Provider
 * keys live in the path (Alchemy `/v2/KEY`), query (`?api-key=`), or subdomain
 * (QuickNode) — printing only the host is the safe, host-level identifier the
 * health/E2E output is allowed to show.
 */
export function redactRpc(url: string | undefined | null): string {
  if (!url) return "(unset)";
  try {
    return new URL(url).host;
  } catch {
    return "(unparseable-url)";
  }
}

/**
 * Throw a clear error if `url` points at mainnet. `label` names the env var so
 * the operator knows exactly what to fix. Never echoes the full URL (key-safe).
 */
export function assertNotMainnet(
  url: string | undefined | null,
  label: string
): void {
  if (looksLikeMainnet(url)) {
    throw new Error(
      `[devnet-guard] ${label} appears to point at MAINNET (host "${redactRpc(
        url
      )}"). QuantumWagner is DEVNET / DEMO-ONLY and refuses to run against ` +
        `mainnet. Set a devnet RPC, e.g. ` +
        `https://solana-devnet.g.alchemy.com/v2/YOUR_KEY`
    );
  }
}

/** Throw unless the configured network is exactly "devnet". */
export function assertDevnetNetwork(
  network: string | undefined | null,
  label = "SOLANA_NETWORK"
): void {
  const n = (network || "devnet").toLowerCase();
  if (n !== "devnet") {
    throw new Error(
      `[devnet-guard] ${label}="${network}" — only "devnet" is allowed. ` +
        `QuantumWagner is devnet/demo-only.`
    );
  }
}

/**
 * Throw if a genesis hash read from the chain is NOT devnet (and name it loudly
 * if it is mainnet). Used by the health check + E2E to prove the live cluster.
 */
export function assertDevnetGenesis(genesisHash: string): void {
  if (genesisHash === GENESIS_HASHES.devnet) return;
  const which =
    genesisHash === GENESIS_HASHES["mainnet-beta"]
      ? "MAINNET-BETA"
      : genesisHash === GENESIS_HASHES.testnet
      ? "testnet"
      : "an UNKNOWN cluster";
  throw new Error(
    `[devnet-guard] connected RPC reports genesis ${genesisHash} (${which}), ` +
      `not devnet (${GENESIS_HASHES.devnet}). Refusing to proceed — devnet only.`
  );
}
