"use client";

import { Spinner } from "@/app/portfolio/page";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { useUserBattles } from "@/app/utils/useUserBattles";
import { useParams } from "next/navigation";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Methods from "@/app/utils/methods";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { format, formatDistanceToNowStrict, isPast } from "date-fns";
import { MIN_BATTLE_POOL } from "@/config";
import { BN } from "@coral-xyz/anchor";

const getKey = (obj) => {
  if (!obj) return "—";
  try {
    const keys = Object.keys(obj);
    return keys.length ? keys[0] : "—";
  } catch {
    return "—";
  }
};

export const formatTimeline = (type, unix) => {
  if (!unix) return { text: "—", color: "text-gray-400", full: "" };

  const seconds = Number(unix);
  if (isNaN(seconds)) return { text: unix, color: "text-gray-400", full: "" };

  const date = new Date(seconds * 1000);

  const full = format(date, "PPpp");

  if (type === "created") {
    return {
      text: `Created ${formatDistanceToNowStrict(date)} ago`,
      color: "text-green-400",
      full,
    };
  }

  if (type === "start") {
    if (isPast(date)) {
      return {
        text: `Started ${formatDistanceToNowStrict(date)} ago`,
        color: "text-green-400",
        full,
      };
    }
    return {
      text: `Starts in ${formatDistanceToNowStrict(date)}`,
      color: "text-green-400",
      full,
    };
  }

  if (isPast(date)) {
    return {
      text: `Ended ${formatDistanceToNowStrict(date)} ago`,
      color: "text-red-400",
      full,
    };
  }

  return {
    text: `Ends in ${formatDistanceToNowStrict(date)}`,
    color: "text-red-400",
    full,
  };
};

export default function BattlePage() {
  const params = useParams();
  const battleMint = String(params.pda);

  const { enterBattle } = Methods();
  const [entering, setEntering] = useState(false);

  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>(null);
  const [amount, setAmount] = useState(""); // SOL string

  const { battles: userBattles, loading: battleLoading } = useUserBattles();
  const { tokens: allToken, loading: tokenLoading } = useAllTokens();

  if (battleLoading || tokenLoading)
    return (
      <div className="flex justify-center items-center h-80">
        <Spinner />
      </div>
    );

  const battle = userBattles?.find((b) => b.pda.toString() === battleMint);

  if (!battle)
    return (
      <p className="text-gray-400 text-center mt-40">
        No battle found with this PDA.
      </p>
    );

  const d = battle.data;
  console.log("d :", d);

  const getToken = (mint: string) => {
    const mintStr = String(mint);
    return allToken?.find((t) => t.account.tokenMint.toString() === mintStr)
      ?.account;
  };

  const solAmount = Number(amount || "0");
  const lamports = solAmount * LAMPORTS_PER_SOL;

  const invalidAmount = solAmount <= 0 || lamports < MIN_BATTLE_POOL;

  const handleEnterBattle = async () => {
    if (!selectedSide) return toast.error("Select a side");
    if (invalidAmount) return toast.error("Invalid amount");

    const side = selectedSide === "A" ? { sideA: {} } : { sideB: {} };

    try {
      setEntering(true);

      await enterBattle({
        battlePda: new PublicKey(battleMint),
        side,
        amount: lamports,
      });

      toast.success("Entered battle successfully!");

      if (selectedSide === "A") d.sideAParticipants += 1;
      else d.sideBParticipants += 1;
    } catch (err: any) {
      console.error(err);
      const msg = err.toString();
      if (msg.includes("Battle has ended")) {
        toast.error("Battle has ended");
        return;
      }
      if (msg.includes("Battle has not started yet")) {
        toast.error("Battle has not started yet.");
        return;
      }
      toast.error("Failed to enter battle");
    } finally {
      setEntering(false);
    }
  };
  const formatNumber = (num) => {
    return {
      text: String(num),
      color: "text-gray-200",
      full: "",
    };
  };

  const formatPool = (value) => {
    if (!value) {
      return { text: "0 SOL", color: "text-blue-400", full: "0 lamports" };
    }

    let bn: BN;
    if (BN.isBN(value)) {
      bn = value;
    } else if (typeof value === "string") {
      const clean = value.replace(/^0x/, "").padStart(16, "0");
      bn = new BN(clean, 16, "le");
    } else if (typeof value === "number") {
      bn = new BN(value);
    } else if (typeof value === "object") {
      try {
        bn = new BN(value);
      } catch {
        return { text: "0 SOL", color: "text-blue-400", full: "0 lamports" };
      }
    } else {
      return { text: "0 SOL", color: "text-blue-400", full: "0 lamports" };
    }

    const lamports = bn.toNumber();
    const sol = lamports / LAMPORTS_PER_SOL;

    return {
      text: `${sol} SOL`,
      color: "text-blue-400",
      full: `${lamports.toLocaleString()} lamports`,
    };
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 px-6 py-10 flex justify-center mt-20">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 border-b border-gray-800 pb-6">
          <img
            src={d.imageUrl}
            width={110}
            height={110}
            className="rounded-xl border border-gray-800"
            alt={d.title}
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{d.title}</h1>
            <p className="mt-2 text-gray-400 text-sm max-w-lg">
              {d.description}
            </p>

            <p className="text-gray-300 mt-2">
              Status:{" "}
              <span className="text-green-400 font-semibold">
                {getKey(d.status)}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
            <Select
              value={selectedSide ?? ""}
              onValueChange={(v) => setSelectedSide(v === "A" ? "A" : "B")}
            >
              <SelectTrigger className="w-full bg-[#1a1d23] border border-gray-700 text-gray-300">
                <SelectValue placeholder="Choose Side" />
              </SelectTrigger>

              <SelectContent className="bg-[#111318] text-gray-200 border border-gray-700">
                <SelectItem value="A">{d.sideAName}</SelectItem>
                <SelectItem value="B">{d.sideBName}</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs text-gray-400 flex justify-between px-1">
              <span>Min: {MIN_BATTLE_POOL / LAMPORTS_PER_SOL} SOL</span>
            </div>

            <input
              type="text"
              placeholder="Enter SOL amount"
              value={amount}
              onChange={(e) => {
                const val = e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*)\./, "$1");

                setAmount(val);
              }}
              className="
                bg-[#1a1d23] border border-gray-700 rounded-lg 
                px-4 py-2 text-gray-200 outline-none
                focus:border-purple-500 transition
              "
            />

            {amount && invalidAmount && (
              <p className="text-red-500 text-xs px-1">
                Amount must be between {MIN_BATTLE_POOL / LAMPORTS_PER_SOL} SOL
                and {MIN_BATTLE_POOL / LAMPORTS_PER_SOL} SOL.
              </p>
            )}

            <Button
              onClick={handleEnterBattle}
              disabled={entering || !selectedSide || !amount || invalidAmount}
              className="
                w-full flex items-center gap-2 justify-center
                rounded-full px-6 py-3 font-medium 
                text-blue-300 
                bg-gradient-to-r from-[#0A1A3A] to-[#15172B]
                border border-[#1F2A45]
                shadow-[0_0_15px_rgba(0,122,255,0.2)]
                hover:shadow-[0_0_25px_rgba(0,122,255,0.35)]
                transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {entering ? (
                <svg
                  className="h-4 w-4 animate-spin text-blue-300"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                  />
                </svg>
              ) : (
                "Enter Battle"
              )}
            </Button>
          </div>
        </div>

        <Section title="Side A vs Side B">
          <div className="flex justify-between items-center px-4 py-3">
            <SideTokens
              name={d.sideAName}
              tokens={d.sideATokens}
              getToken={getToken}
            />

            <span className="text-purple-400 font-bold text-xl">VS</span>

            <SideTokens
              name={d.sideBName}
              tokens={d.sideBTokens}
              getToken={getToken}
            />
          </div>
        </Section>

        <Section title="Pool Info">
          <InfoRow label="Side A Pool" value={formatPool(d.sideAPool)} />
          <InfoRow label="Side B Pool" value={formatPool(d.sideBPool)} />
          <InfoRow label="Total Pool" value={formatPool(d.totalPool)} />
        </Section>

        <Section title="Participants">
          <InfoRow
            label="Side A Participants"
            value={formatNumber(d.sideAParticipants)}
          />
          <InfoRow
            label="Side B Participants"
            value={formatNumber(d.sideBParticipants)}
          />
          <InfoRow
            label="Unique Participants"
            value={formatNumber(d.uniqueParticipants)}
          />
        </Section>

        <Section title="Timeline">
          <InfoRow
            label="Created At"
            value={formatTimeline("created", d.createdAt)}
          />
          <InfoRow
            label="Start Time"
            value={formatTimeline("start", d.startTime)}
          />
          <InfoRow
            label="End Time"
            value={formatTimeline("ended", d.endTime)}
          />
          <InfoRow
            label="Resolution Time"
            value={formatTimeline("resolved", d.resolutionTime)}
          />
        </Section>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3 border-l-4 border-purple-500 pl-3">
      {title}
    </h2>
    <div className="bg-[#101217] border border-gray-800 rounded-lg divide-y divide-gray-800">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="px-4 py-2 text-sm hover:bg-gray-800/40 transition-colors flex flex-col">
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`font-mono ${value.color}`}>{value.text}</span>
    </div>
    {value.full && (
      <span className="text-gray-500 text-xs mt-1">{value.full}</span>
    )}
  </div>
);

const SideTokens = ({ name, tokens, getToken }) => (
  <div className="flex flex-col items-center gap-2">
    <h3 className="text-white/80 text-sm font-medium">{name}</h3>

    <div className="flex gap-2">
      {tokens.map((mint: string) => {
        const token = getToken(mint);

        return (
          <div key={mint} className="flex flex-col items-center gap-1">
            <img
              src={token?.imageUri}
              className="w-9 h-9 rounded-lg"
              alt={token?.symbol}
            />
            <p className="text-white/60 text-[10px]">{token?.symbol}</p>
          </div>
        );
      })}
    </div>
  </div>
);
