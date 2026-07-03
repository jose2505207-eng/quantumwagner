"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  ArrowRight, Eye, ShieldCheck, Activity, Zap, Droplet, GitBranch,
  Wallet, Target, TrendingUp, Trophy, Swords, Rocket, Crown, Lock,
} from "lucide-react";
import { LuxuryCard } from "@/components/luxury/LuxuryCard";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { useMarkets } from "@/lib/useMarkets";
import { LEVELS } from "@/lib/game/levels";
import { useHydrated } from "@/lib/useHydrated";

const reveal = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const },
};

function Label({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <div
      className="lux-label"
      style={gold ? { color: "var(--brand-gold)" } : undefined}
    >
      {children}
    </div>
  );
}

const LEVEL_ICONS = [Wallet, Target, Zap, Swords, Rocket, Crown];

export function LuxuryLanding() {
  const hydrated = useHydrated();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { markets, loading } = useMarkets();
  const isConnected = hydrated && connected;
  const preview = markets.slice(0, 3);

  const connect = () => setVisible(true);

  return (
    <div className="lux-page-bg relative min-h-screen w-full overflow-hidden">
      <div className="lux-grid-bg pointer-events-none absolute inset-0 opacity-60" />

      {/* ---------------- HERO ---------------- */}
      <section className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-24">
        <motion.div {...reveal}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-line)] bg-[rgba(244,241,233,0.03)] px-3.5 py-1.5">
            <span className="lux-pulse" />
            <span className="text-[12.5px] text-[var(--text-secondary)]">
              A prediction market on Solana
            </span>
          </div>
          <h1 className="lux-display text-[clamp(44px,7vw,62px)]">
            Trade conviction.
            <br />
            <em>Compound edge.</em>
          </h1>
          <p className="mt-6 max-w-[460px] text-[18px] leading-[1.6] text-[var(--text-muted)]">
            Predict meme-coin futures, place fast bets, battle the market and
            climb the Arena — on a terminal built for serious traders, settled
            on-chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            {isConnected ? (
              <Link href="/markets">
                <LuxuryButton variant="gold" size="lg" iconRight={<ArrowRight size={18} />}>
                  Enter the markets
                </LuxuryButton>
              </Link>
            ) : (
              <LuxuryButton variant="gold" size="lg" onClick={connect} iconRight={<ArrowRight size={18} />}>
                Connect wallet
              </LuxuryButton>
            )}
            <Link href="/markets">
              <LuxuryButton variant="outline" size="lg" iconLeft={<Eye size={17} />}>
                Explore markets
              </LuxuryButton>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-10">
            {[
              [loading ? "—" : String(markets.length), "Live markets"],
              ["On-chain", "Settlement"],
              ["Devnet", "Network"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="lux-figure text-[26px] text-[var(--text-primary)]">{v}</div>
                <div className="mt-1 text-[12.5px] text-[var(--text-subtle)]">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* product preview (decorative illustration, not user data) */}
        <motion.div
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.1 }}
          className="relative"
        >
          <div
            className="pointer-events-none absolute -inset-10"
            style={{ background: "radial-gradient(60% 50% at 60% 40%, rgba(201,168,92,0.12), transparent 70%)" }}
          />
          <LuxuryCard glow padding={22} className="relative">
            <div className="flex items-start justify-between">
              <div>
                <Label>Net worth · preview</Label>
                <div className="lux-figure mt-2 text-[34px] text-[var(--text-primary)]">
                  $128,540.62
                </div>
              </div>
              <span className="lux-figure rounded-full border border-[color:rgba(52,211,153,0.4)] bg-[var(--qw-green-wash)] px-2.5 py-1 text-[12px] text-[var(--market-up)]">
                +18.5%
              </span>
            </div>
            <div className="mt-5 h-[120px] w-full rounded-[10px] bg-[var(--surface-inset)]"
              style={{ background: "var(--grad-chart-gold)", border: "1px solid var(--border-hairline)" }}
            />
          </LuxuryCard>
          <LuxuryCard padding={18} className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-[var(--border-line)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">Crypto</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:rgba(52,211,153,0.4)] bg-[var(--qw-green-wash)] px-2 py-0.5 text-[11px] text-[var(--market-up)]">
                <span className="lux-pulse" /> Live
              </span>
            </div>
            <div className="mb-3.5 text-[15px] font-semibold text-[var(--text-primary)]">
              Will BTC close above $120K Friday?
            </div>
            <ProbBar yes={68} />
          </LuxuryCard>
        </motion.div>
      </section>

      {/* ---------------- TRUST STRIP (honest claims only) ---------------- */}
      <div className="border-y border-[var(--border-hairline)] bg-[rgba(244,241,233,0.012)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-6 px-6 py-6 lg:px-8">
          {[
            { i: ShieldCheck, t: "Non-custodial — you hold your keys" },
            { i: Eye, t: "Transparent on-chain records" },
            { i: Zap, t: "Fast markets" },
            { i: Droplet, t: "Settled on Solana devnet" },
            { i: GitBranch, t: "Open source" },
          ].map(({ i: Icon, t }) => (
            <div key={t} className="flex items-center gap-2.5 text-[var(--text-secondary)]">
              <Icon size={18} className="text-[var(--brand-gold)]" />
              <span className="text-[14px] font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <motion.section {...reveal} className="mx-auto max-w-[1180px] px-6 py-24 lg:px-8">
        <Label gold>How it works</Label>
        <h2 className="lux-display mt-3 text-[clamp(30px,4vw,40px)]">
          From wallet to win in four moves.
        </h2>
        <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Wallet, t: "Connect wallet", d: "Link any Solana wallet. Non-custodial — you always hold your keys." },
            { i: Target, t: "Pick a market", d: "Browse live prediction markets, fast bets and meme battles." },
            { i: TrendingUp, t: "Place prediction", d: "Back your read. Funds settle on-chain until resolution." },
            { i: Trophy, t: "Track & compete", d: "Watch your edge compound and climb the Arena." },
          ].map((s, i) => (
            <LuxuryCard key={s.t} interactive padding={22}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--border-line)] bg-[var(--surface-inset)]">
                  <s.i size={20} className="text-[var(--brand-gold)]" />
                </div>
                <span className="lux-figure text-[13px] text-[var(--text-disabled)]">0{i + 1}</span>
              </div>
              <div className="text-[16px] font-semibold text-[var(--text-primary)]">{s.t}</div>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--text-muted)]">{s.d}</p>
            </LuxuryCard>
          ))}
        </div>
      </motion.section>

      {/* ---------------- PROGRESSION (Trader Levels) ---------------- */}
      <motion.section {...reveal} className="mx-auto max-w-[1180px] px-6 py-12 lg:px-8">
        <Label gold>Your ascent</Label>
        <h2 className="lux-display mt-3 text-[clamp(30px,4vw,40px)]">
          Six levels. One Arena.
        </h2>
        <p className="mt-3 max-w-[520px] text-[15px] text-[var(--text-muted)]">
          Every move earns Signal Score and lifts your Trader Level — from your
          first connection to the top of the leaderboard.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((lvl, i) => {
            const Icon = LEVEL_ICONS[i] ?? Wallet;
            return (
              <LuxuryCard key={lvl.id} interactive padding={20} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-gold)] bg-[rgba(201,168,92,0.08)]">
                  <Icon size={19} className="text-[var(--brand-gold)]" />
                </div>
                <div className="min-w-0">
                  <div className="lux-label">Level {lvl.level}</div>
                  <div className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">{lvl.title}</div>
                  <p className="mt-1 text-[13px] leading-[1.5] text-[var(--text-muted)]">{lvl.mission}</p>
                </div>
              </LuxuryCard>
            );
          })}
        </div>
      </motion.section>

      {/* ---------------- LIVE MARKETS ---------------- */}
      <motion.section {...reveal} className="mx-auto max-w-[1180px] px-6 py-24 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <Label gold>Open now</Label>
            <h2 className="lux-display mt-3 text-[clamp(30px,4vw,40px)]">The market is open.</h2>
          </div>
          <Link href="/markets" className="hidden items-center gap-1 text-[14px] font-medium text-[var(--brand-gold)] hover:opacity-80 sm:inline-flex">
            All markets <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [0, 1, 2].map((i) => <div key={i} className="lux-skeleton h-44 rounded-[16px]" />)
          ) : preview.length === 0 ? (
            <LuxuryCard padding={28} className="sm:col-span-2 lg:col-span-3 text-center">
              <Lock className="mx-auto mb-3 text-[var(--text-muted)]" size={24} />
              <div className="text-[16px] font-semibold text-[var(--text-primary)]">No live markets yet</div>
              <p className="mt-1 text-[14px] text-[var(--text-muted)]">The desk is warming up. Be the first to take a position.</p>
            </LuxuryCard>
          ) : (
            preview.map((m) => {
              const yes = Number(m.yes_pool || 0);
              const no = Number(m.no_pool || 0);
              const pct = yes + no > 0 ? Math.round((yes / (yes + no)) * 100) : 50;
              const isDemo = (m as { isDemo?: boolean }).isDemo;
              return (
                <Link key={m.id} href={`/markets/${m.id}`}>
                  <LuxuryCard interactive padding={20} className="h-full">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full border border-[var(--border-line)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                        {m.category}
                      </span>
                      {isDemo && (
                        <span className="rounded-full border border-[color:rgba(201,168,92,0.4)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-gold)]">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="mb-4 line-clamp-2 min-h-[42px] text-[15px] font-semibold text-[var(--text-primary)]">
                      {m.question}
                    </div>
                    <ProbBar yes={pct} />
                  </LuxuryCard>
                </Link>
              );
            })
          )}
        </div>
      </motion.section>

      {/* ---------------- FINAL CTA ---------------- */}
      <motion.section {...reveal} className="mx-auto max-w-[1180px] px-6 pb-28 lg:px-8">
        <LuxuryCard glow padding={0} className="overflow-hidden">
          <div className="lux-grid-bg relative px-8 py-16 text-center sm:py-20">
            <Label gold>Take your position</Label>
            <h2 className="lux-display mx-auto mt-4 max-w-[640px] text-[clamp(30px,4.5vw,46px)]">
              Serious money deserves <em>serious rails.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[15px] text-[var(--text-muted)]">
              Connect your wallet and place your first prediction. Your max loss
              is your stake — never more.
            </p>
            <div className="mt-8 flex justify-center">
              {isConnected ? (
                <Link href="/markets">
                  <LuxuryButton variant="gold" size="lg" iconRight={<ArrowRight size={18} />}>
                    Enter the markets
                  </LuxuryButton>
                </Link>
              ) : (
                <LuxuryButton variant="gold" size="lg" onClick={connect} iconRight={<ArrowRight size={18} />}>
                  Connect wallet
                </LuxuryButton>
              )}
            </div>
          </div>
        </LuxuryCard>
      </motion.section>
    </div>
  );
}

/** Slim YES/NO probability bar. */
function ProbBar({ yes }: { yes: number }) {
  const no = 100 - yes;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px] font-medium">
        <span className="lux-figure text-[var(--market-up)]">Yes {yes}%</span>
        <span className="lux-figure text-[var(--market-down)]">No {no}%</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--surface-inset)]">
        <div className="h-full" style={{ width: `${yes}%`, background: "var(--market-up)" }} />
        <div className="h-full" style={{ width: `${no}%`, background: "var(--market-down)" }} />
      </div>
    </div>
  );
}

export default LuxuryLanding;
