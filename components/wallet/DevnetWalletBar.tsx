"use client";

import { useCallback, useEffect, useState } from "react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Coins, Loader2, Droplet } from "lucide-react";
import toast from "react-hot-toast";
import { explorerTx, SOLANA_NETWORK } from "@/lib/solana";

/**
 * Devnet wallet strip: live SOL balance + a faucet button.
 *
 * "Deposit" on devnet means an airdrop, so this is the app's deposit path. The
 * public devnet faucet is heavily rate-limited and some authenticated RPC
 * providers don't implement `requestAirdrop` at all, so we try the app's RPC
 * first, fall back to the public devnet endpoint, and — only if both refuse —
 * point the player at the web faucet. We never claim SOL arrived without
 * re-reading the balance from the chain.
 */

/** The deployed program rejects bets below this. Surfaced so an empty wallet is obvious. */
const MIN_BET_SOL = 0.1;
const AIRDROP_SOL = 1;
const PUBLIC_DEVNET_RPC = "https://api.devnet.solana.com";

export function DevnetWalletBar() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey, "confirmed");
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch {
      // Leave the previous value rather than rendering a wrong balance.
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    void refresh();
    if (!publicKey) return;
    const id = setInterval(() => void refresh(), 20_000);
    return () => clearInterval(id);
  }, [refresh, publicKey]);

  const requestAirdrop = async () => {
    if (!publicKey || airdropping) return;
    setAirdropping(true);
    const lamports = AIRDROP_SOL * LAMPORTS_PER_SOL;

    const attempt = async (conn: Connection) => {
      const signature = await conn.requestAirdrop(publicKey, lamports);
      const latest = await conn.getLatestBlockhash();
      await conn.confirmTransaction({ signature, ...latest }, "confirmed");
      return signature;
    };

    try {
      let signature: string;
      try {
        signature = await attempt(connection);
      } catch {
        // The configured RPC may not support airdrops — retry on public devnet.
        signature = await attempt(new Connection(PUBLIC_DEVNET_RPC, "confirmed"));
      }
      await refresh();
      toast.custom(
        (t) => (
          <div
            className={`flex items-center gap-2 rounded-lg border border-green-500/30 bg-[#0d0f16] px-4 py-3 text-sm text-white ${
              t.visible ? "" : "opacity-0"
            }`}
          >
            <span>{AIRDROP_SOL} devnet SOL received</span>
            <a
              href={explorerTx(signature)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-green-400 underline"
            >
              View on Explorer ↗
            </a>
          </div>
        ),
        { duration: 7000 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      const rateLimited = /429|rate|limit|faucet/i.test(message);
      toast.error(
        rateLimited
          ? "The devnet faucet is rate-limited right now. Use faucet.solana.com and paste your address."
          : `Airdrop failed: ${message}. Try faucet.solana.com instead.`,
        { duration: 9000 }
      );
    } finally {
      setAirdropping(false);
    }
  };

  if (!connected || !publicKey) return null;

  const low = balance !== null && balance < MIN_BET_SOL;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5"
        title={`Balance on Solana ${SOLANA_NETWORK}`}
      >
        <Coins className={`h-4 w-4 ${low ? "text-amber-400" : "text-cyan-400"}`} />
        <span className="font-mono text-sm font-semibold text-white">
          {loading && balance === null ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            `${(balance ?? 0).toFixed(3)} SOL`
          )}
        </span>
        <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          {SOLANA_NETWORK}
        </span>
      </div>

      <button
        onClick={requestAirdrop}
        disabled={airdropping}
        title={`Airdrop ${AIRDROP_SOL} devnet SOL to your wallet`}
        className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:opacity-50"
      >
        {airdropping ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Droplet className="h-4 w-4" />
        )}
        {airdropping ? "Requesting…" : "Get devnet SOL"}
      </button>

      {low && (
        <span className="hidden text-xs text-amber-400/80 lg:inline">
          Below the {MIN_BET_SOL} SOL minimum bet
        </span>
      )}
    </div>
  );
}
