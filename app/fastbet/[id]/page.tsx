"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, Clock, Loader2, Wallet, Zap, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Background } from "@/components/background";
import FastBetResolution from "@/components/fastbet/FastBetResolution";
import { ErrorState } from "@/components/game";
import { cn } from "@/lib/utils";
import { explorerTx } from "@/lib/solana";
import {
  enterFastBet,
  getFastBet,
  getPublicConfig,
  type ApiFastBet,
  type ApiFastBetEntry,
  type PublicConfig,
} from "@/lib/api";

/**
 * Fast-bet round detail — every number on this screen is real.
 *
 * This page used to be a mock: a hardcoded question, a `Math.random()` price
 * chart, and a "Place Bet" button that only flipped local state. It now loads
 * the actual round, stakes REAL devnet SOL by transferring it to the platform
 * vault, and records the entry only after that transfer confirms on-chain.
 */
export default function FastBetDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const initialSide = searchParams.get("side") === "no" ? "NO" : "YES";

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [round, setRound] = useState<ApiFastBet | null>(null);
  const [myEntries, setMyEntries] = useState<ApiFastBetEntry[]>([]);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<"YES" | "NO">(initialSide);
  const [amount, setAmount] = useState("");
  const [staking, setStaking] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getFastBet(id);
      if (!data) {
        setError("This round no longer exists.");
        return;
      }
      setRound(data.fastBet);
      setMyEntries(data.myEntries);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load this round");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 10_000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    getPublicConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  // Clock starts on the client only — rendering a server-computed "now" would
  // produce a hydration mismatch.
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const msLeft = useMemo(() => {
    if (!round || now === null) return null;
    return Math.max(0, new Date(round.endTime).getTime() - now);
  }, [round, now]);

  const countdown = useMemo(() => {
    if (msLeft === null) return "—";
    const total = Math.floor(msLeft / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [msLeft]);

  const resolved = round?.status === "resolved";
  const closed = resolved || (msLeft !== null && msLeft <= 0);
  const stakingEnabled = config?.fastBets.stakingEnabled ?? false;
  const vault = config?.fastBets.vault ?? null;

  const myStake = myEntries.reduce((sum, e) => sum + e.amount, 0);
  const myPayout = myEntries.reduce((sum, e) => sum + e.payout, 0);
  const mySide = myEntries[0]?.side;

  const placeStake = async () => {
    if (staking) return;
    const sol = Number(amount);
    if (!Number.isFinite(sol) || sol <= 0) {
      toast.error("Enter an amount in SOL");
      return;
    }
    if (!publicKey || !connected) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!vault) {
      toast.error("Fast-bet staking is not configured on this deployment.");
      return;
    }

    setStaking(true);
    try {
      // Real stake: transfer SOL to the platform vault, then record the entry.
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(vault),
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        })
      );
      const signature = await sendTransaction(tx, connection);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");

      await enterFastBet(id, { side, amount: sol, txSignature: signature });
      setAmount("");
      await load();

      toast.custom(
        (t) => (
          <div
            className={`flex items-center gap-2 rounded-lg border border-green-500/30 bg-[#0d0f16] px-4 py-3 text-sm text-white ${
              t.visible ? "" : "opacity-0"
            }`}
          >
            <span>
              {sol} SOL staked on {side}
            </span>
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to place the bet");
    } finally {
      setStaking(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background />
        <div className="container mx-auto mt-24 max-w-3xl px-4">
          <div className="h-72 animate-pulse rounded-[2rem] border border-white/5 bg-white/[0.02]" />
        </div>
      </div>
    );
  }

  if (error || !round) {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Background />
        <div className="container mx-auto mt-24 max-w-3xl px-4">
          <ErrorState
            description={error ?? "This round could not be loaded."}
            onRetry={() => void load()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
      <Background />

      <div className="container relative z-10 mx-auto mt-20 max-w-5xl px-4 py-8 lg:py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/fastbet"
            className="group flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All rounds
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <span className="font-mono text-sm font-bold">
              {resolved ? "Resolved" : closed ? "Settling…" : countdown}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Round facts */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-400">
                <Zap className="h-3.5 w-3.5" /> Fast bet · {round.symbol || "—"}
              </div>
              <h1 className="text-2xl font-black leading-tight">{round.question}</h1>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Start price" value={fmtPrice(round.startPrice)} />
                <Stat
                  label={resolved ? "Settle price" : "Current price"}
                  value={fmtPrice(resolved ? round.settlePrice : round.currentPrice)}
                />
                <Stat label="Pool" value={`${round.pool.toFixed(3)} SOL`} />
                <Stat label="Players" value={String(round._count?.entries ?? 0)} />
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-semibold text-white/50">
                  <span>YES {round.yesPool.toFixed(3)} SOL</span>
                  <span>NO {round.noPool.toFixed(3)} SOL</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="bg-green-500"
                    style={{ width: `${sidePercent(round.yesPool, round.noPool)}%` }}
                  />
                  <div className="flex-1 bg-red-500" />
                </div>
              </div>

              {round.currentPrice === null && !resolved && (
                <p className="mt-4 flex items-center gap-2 text-xs text-white/40">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Live price unavailable from the oracle right now.
                </p>
              )}
            </div>

            {/* Win/lose framing only belongs to someone who actually staked.
                Showing "YOU LOST" to a visitor who never bet (or is signed out)
                is simply false — they get the neutral result instead. */}
            {resolved && mySide && (
              <FastBetResolution
                outcome={round.outcome === "YES" ? "yes" : "no"}
                question={round.question}
                userSide={mySide === "YES" ? "yes" : "no"}
                userAmount={myStake}
                payout={myPayout}
              />
            )}
            {resolved && !mySide && (
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-white/40">
                  Round resolved
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {round.outcome ?? "—"} won
                </p>
                <p className="mt-2 text-sm text-white/50">
                  You had no position in this round.
                  {round.resolutionSource ? ` Settled by ${round.resolutionSource}.` : ""}
                </p>
                <Link
                  href="/fastbet"
                  className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-black uppercase tracking-wider text-black transition-colors hover:bg-yellow-400"
                >
                  Find a live round
                </Link>
              </div>
            )}
          </div>

          {/* Stake panel */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
                <Wallet className="h-5 w-5 text-yellow-400" /> Place your bet
              </h2>

              {!stakingEnabled ? (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                  Fast-bet staking is not configured on this deployment, so no bet can be
                  placed here. Markets and battles still take real on-chain bets.
                </p>
              ) : closed ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  This round is closed. {resolved ? "See the result on the left." : "Settlement is in progress."}
                </p>
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {(["YES", "NO"] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSide(option)}
                        className={cn(
                          "rounded-2xl border-2 p-4 font-black transition-all",
                          side === option
                            ? option === "YES"
                              ? "border-green-500 bg-green-500/15 text-green-400"
                              : "border-red-500 bg-red-500/15 text-red-400"
                            : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                    Stake (SOL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-[#050505] p-4 font-mono text-xl font-bold text-white placeholder:text-white/10 focus:border-yellow-500/50 focus:outline-none"
                  />
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[0.1, 0.5, 1, 5].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(String(preset))}
                        className="rounded-lg border border-white/5 bg-white/5 py-2 text-xs font-bold text-white/60 transition-all hover:bg-white/10 hover:text-white"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={placeStake}
                    disabled={staking || !amount || !connected}
                    className={cn(
                      "mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-black uppercase tracking-wider transition-all",
                      side === "YES"
                        ? "bg-green-500 text-black hover:bg-green-400"
                        : "bg-red-500 text-black hover:bg-red-400",
                      (staking || !amount || !connected) && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {staking && <Loader2 className="h-5 w-5 animate-spin" />}
                    {staking
                      ? "Confirming on Devnet…"
                      : connected
                        ? `Stake on ${side}`
                        : "Connect wallet"}
                  </button>

                  <p className="mt-3 text-center text-[10px] font-medium text-white/25">
                    Your SOL is transferred to the platform vault on Devnet and paid back
                    pro-rata if you win. Nobody on the winning side means every stake is
                    refunded.
                  </p>
                </>
              )}
            </div>

            {myEntries.length > 0 && (
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6">
                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white/60">
                  Your positions
                </h3>
                <ul className="space-y-3">
                  {myEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm"
                    >
                      <span
                        className={cn(
                          "font-black",
                          entry.side === "YES" ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {entry.side}
                      </span>
                      <span className="font-mono">{entry.amount.toFixed(3)} SOL</span>
                      <span className="text-right text-xs">
                        {entry.won === null ? (
                          <span className="text-white/40">open</span>
                        ) : entry.payout > 0 ? (
                          entry.payoutTxSignature ? (
                            <a
                              href={explorerTx(entry.payoutTxSignature)}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-green-400 underline"
                            >
                              paid {entry.payout.toFixed(3)} ↗
                            </a>
                          ) : (
                            <span className="text-amber-400">
                              {entry.payout.toFixed(3)} SOL pending
                            </span>
                          )
                        ) : (
                          <span className="text-white/40">no payout</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="font-mono text-sm font-bold text-white">{value}</div>
    </motion.div>
  );
}

/** Prices are only ever rendered when the oracle actually gave us one. */
function fmtPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || !Number.isFinite(price)) return "—";
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
}

function sidePercent(yes: number, no: number): number {
  const total = yes + no;
  if (total <= 0) return 50;
  return (yes / total) * 100;
}
