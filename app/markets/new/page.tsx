"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarketCategory, MarketCategoryLabels } from "@/app/types";
import Methods from "@/app/utils/methods";

/**
 * Create a prediction market — open to any connected wallet.
 *
 * Market creation used to live only in the admin screen, so the app depended on
 * an operator to have anything to bet on. This is the same on-chain
 * `initialize_market` call, made by the player, who pays the creation fee.
 */

/** The deployed program charges this to the treasury on creation. */
const CREATION_FEE_SOL = 0.1;
/** The program rejects a smaller per-bet minimum (InvalidMinBetAmount). */
const MIN_BET_LAMPORTS = 100_000_000;

const DURATIONS = [
  { label: "1 hour", seconds: 3_600 },
  { label: "6 hours", seconds: 21_600 },
  { label: "24 hours", seconds: 86_400 },
  { label: "3 days", seconds: 259_200 },
  { label: "7 days", seconds: 604_800 },
];

/** App categories → the on-chain enum (price | events | social | other). */
function onChainCategory(category: MarketCategory) {
  switch (category) {
    case MarketCategory.CRYPTO:
    case MarketCategory.STOCKS:
      return { price: {} };
    case MarketCategory.DEFI_EVENTS:
    case MarketCategory.MARKET_EVENTS:
      return { events: {} };
    case MarketCategory.CELEBRITY_CRYPTO:
      return { social: {} };
    default:
      return { other: {} };
  }
}

export default function CreateMarketPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { initMarket } = Methods();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MarketCategory>(MarketCategory.CRYPTO);
  const [duration, setDuration] = useState(String(DURATIONS[2].seconds));
  const [creating, setCreating] = useState(false);

  const endsAt = useMemo(
    () => new Date(Date.now() + Number(duration) * 1000),
    [duration]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    if (!connected || !publicKey) {
      toast.error("Connect your wallet to create a market");
      return;
    }
    if (question.trim().length < 8) {
      toast.error("Ask a clearer question (at least 8 characters)");
      return;
    }

    setCreating(true);
    try {
      // Fail early with a useful message rather than a raw simulation error.
      const balance = await connection.getBalance(publicKey, "confirmed");
      if (balance < CREATION_FEE_SOL * LAMPORTS_PER_SOL) {
        toast.error(
          `Creating a market costs ${CREATION_FEE_SOL} SOL plus fees — use "Get devnet SOL" first.`
        );
        return;
      }

      const pda = await initMarket({
        questionId: question.trim(),
        category: onChainCategory(category),
        durationSeconds: new anchor.BN(Number(duration)),
        minBetAmount: new anchor.BN(MIN_BET_LAMPORTS),
        tags: [category],
        imageUrl: null,
        record: {
          question: question.trim(),
          description: description.trim(),
          category,
        },
      });
      if (!pda) throw new Error("market creation returned no PDA");

      toast.success("Market created on Devnet");
      router.push("/markets");
    } catch (err) {
      // initMarket already surfaces the on-chain error; add nothing invented.
      const message = err instanceof Error ? err.message : "unknown error";
      toast.error(`Market not created: ${message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black font-sans text-white">
      <Background />

      <div className="container relative z-10 mx-auto mt-20 max-w-2xl px-4 py-8 lg:py-12">
        <Link
          href="/markets"
          className="mb-8 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All markets
        </Link>

        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 lg:p-8">
          <h1 className="text-2xl font-black">Create a market</h1>
          <p className="mt-2 text-sm text-white/50">
            Your market is created on Solana Devnet by your own wallet. It costs{" "}
            {CREATION_FEE_SOL} SOL in platform fees, and anyone can bet on it
            immediately (minimum bet {MIN_BET_LAMPORTS / LAMPORTS_PER_SOL} SOL).
          </p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                required
                placeholder="Will SOL close above $250 this week?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={180}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="How should this resolve? Name the source of truth."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as MarketCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MarketCategory).map((option) => (
                      <SelectItem key={option} value={option}>
                        {MarketCategoryLabels[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Runs for</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((option) => (
                      <SelectItem key={option.seconds} value={String(option.seconds)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-white/40">
              Closes on {endsAt.toLocaleString()}
            </p>

            <Button
              type="submit"
              disabled={creating || !connected}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 py-6 text-base font-black text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating on Devnet…
                </>
              ) : connected ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create market ({CREATION_FEE_SOL} SOL)
                </>
              ) : (
                "Connect your wallet"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
