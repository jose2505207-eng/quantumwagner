"use client";

import { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface WalletGateProps {
  children: ReactNode;
  /** Custom locked-state title/description. */
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Gates content behind a connected wallet. When locked it teaches the user the
 * very first quest (Level 1) instead of just hiding the feature.
 */
export function WalletGate({
  children,
  title = "Connect your wallet to unlock the arena",
  description = "Level 1 of your journey. Connect to start earning XP, completing quests, and climbing the leaderboard.",
  className,
}: WalletGateProps) {
  const hydrated = useHydrated();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (!hydrated) return null;
  if (connected) return <>{children}</>;

  return (
    <div
      className={cn(
        "qw-glass qw-glow mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/30">
        <Lock size={24} />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      <button
        onClick={() => setVisible(true)}
        className="qw-shine mt-2 inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-fuchsia-500"
      >
        Connect Wallet
      </button>
    </div>
  );
}

export default WalletGate;
