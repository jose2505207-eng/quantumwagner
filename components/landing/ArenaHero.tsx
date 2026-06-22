"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useHydrated } from "@/lib/useHydrated";
import { StatusPill } from "@/components/game";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

/**
 * Arena hero — the 5-second hook. Answers "what is this / what do I do next".
 * Primary CTA adapts: connect wallet (Level 1) when disconnected, Enter Arena
 * once connected.
 */
export function ArenaHero() {
  const hydrated = useHydrated();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const isConnected = hydrated && connected;

  return (
    <section className="relative w-full px-4 pt-16 pb-10 sm:pt-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2">
          <StatusPill status="live" label="DEVNET LIVE" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            <Sparkles size={13} /> Solana prediction arena
          </span>
        </div>

        <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          <span className="qw-gradient-text">Predict the future.</span>
          <br />
          Battle the crowd. Climb the chain.
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-base text-zinc-400 sm:text-lg">
          Quantum Wager turns markets, memes, and micro-events into competitive
          arenas powered by Solana.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          {isConnected ? (
            <Link
              href="/markets"
              className="qw-shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-base font-bold text-white transition hover:from-violet-500 hover:to-fuchsia-500 sm:w-auto"
            >
              Enter Arena <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="qw-shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-base font-bold text-white transition hover:from-violet-500 hover:to-fuchsia-500 sm:w-auto"
            >
              <Zap size={18} /> Enter Arena
            </button>
          )}
          <a
            href="#daily-quests"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Start Daily Quest
          </a>
        </div>
      </div>
    </section>
  );
}

export default ArenaHero;
