"use client";

import { Spinner } from "@/app/portfolio/page";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { useUserBattles } from "@/app/utils/useUserBattles";
import { useParams } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { toDisplay } from "../../token/[mid]/page";
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
import { Hammer } from "lucide-react";
import toast from "react-hot-toast";

const getKey = (obj) => {
  if (!obj) return "—";
  try {
    const keys = Object.keys(obj);
    return keys.length ? keys[0] : "—";
  } catch {
    return "—";
  }
};

const toDisplayDate = (val) => {
  if (!val) return "—";

  try {
    const seconds = Number(val); //unix seconds
    if (isNaN(seconds)) return val;

    return new Date(seconds * 1000).toLocaleString();
  } catch {
    return "—";
  }
};

export default function BattlePage() {
  const params = useParams();
  const battleMint = String(params.pda);
  const { resolveBattle } = Methods();
  const [resolving, setResolving] = useState(false);

  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>(null);

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

  const getToken = (mint: string | PublicKey) => {
    const mintStr = typeof mint === "string" ? mint : mint.toString();

    return allToken?.find((t) => t.account.tokenMint.toString() === mintStr)
      ?.account;
  };

  const handleResolveBattle = async () => {
    if (!selectedSide) return alert("Select a side first");

    const winner = selectedSide === "A" ? { sideA: {} } : { sideB: {} };

    try {
      setResolving(true);

      const tx = await resolveBattle({
        battlePda: new PublicKey(battleMint),
        winner,
      });

      toast.success("Resolved Battle successfully!");
    } catch (e) {
      const msg = String(e);

      if (msg.includes("Battle is already resolved")) {
        toast.success("Battle already resolved!");
        return;
      }

      if (msg.includes("No participants in battle")) {
        toast.error("No participants in battle!");
        return;
      }

      toast.error("Failed to Resolve Battle!");
      console.error(e);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 px-6 py-10 flex justify-center mt-20">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-gray-800 pb-6">
          <div className="flex-shrink-0">
            <img
              src={d.imageUrl}
              width={110}
              height={110}
              className="rounded-xl border border-gray-800"
              alt={d.title}
            />
          </div>

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

            <p className="text-purple-400 mt-1">
              Winner: {d.winner ? getKey(d.winner) : "—"}
            </p>
          </div>

          {/* Resolve Market */}
          <div className="flex flex-col gap-4 mt-4">
            {/* Winner Select */}
            <Select
              value={selectedSide ?? ""}
              onValueChange={(v) => setSelectedSide(v === "A" ? "A" : "B")}
            >
              <SelectTrigger className="w-full bg-[#1a1d23] border border-gray-700 text-gray-300">
                <SelectValue placeholder="Select Winner Side" />
              </SelectTrigger>

              <SelectContent className="bg-[#111318] text-gray-200 border border-gray-700">
                <SelectItem value="A">{d.sideAName || "Side A"}</SelectItem>
                <SelectItem value="B">{d.sideBName || "Side B"}</SelectItem>
              </SelectContent>
            </Select>

            {/* Resolve Button */}
            <Button
              onClick={handleResolveBattle}
              disabled={resolving}
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
              {resolving ? (
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
                <Hammer className="w-4 h-4 text-blue-300" />
              )}

              {resolving ? "Resolving..." : "Resolve Battle"}
            </Button>
          </div>
        </div>

        {/* SIDE TOKENS */}
        <Section title="Side A vs Side B">
          <div className="flex justify-between items-center px-4 py-3">
            {/* SIDE A */}
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-white/80 text-sm font-medium">
                {d.sideAName}
              </h3>

              <div className="flex gap-2">
                {d.sideATokens.map((mint: string) => {
                  const token = getToken(mint);
                  return (
                    <div
                      key={mint}
                      className="flex flex-col items-center gap-1"
                    >
                      <img
                        src={token?.imageUri}
                        className="w-9 h-9 rounded-lg"
                        alt={token?.symbol}
                      />
                      <p className="text-white/60 text-[10px]">
                        {token?.symbol}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <span className="text-purple-400 font-bold text-xl">VS</span>

            {/* SIDE B */}
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-white/80 text-sm font-medium">
                {d.sideBName}
              </h3>

              <div className="flex gap-2">
                {d.sideBTokens.map((mint: string) => {
                  const token = getToken(mint);
                  return (
                    <div
                      key={mint}
                      className="flex flex-col items-center gap-1"
                    >
                      <img
                        src={token?.imageUri}
                        className="w-9 h-9 rounded-lg"
                        alt={token?.symbol}
                      />
                      <p className="text-white/60 text-[10px]">
                        {token?.symbol}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pool Info">
          <InfoRow label="Side A Pool" value={toDisplay(d.sideAPool)} />
          <InfoRow label="Side B Pool" value={toDisplay(d.sideBPool)} />
          <InfoRow label="Total Pool" value={toDisplay(d.totalPool)} />
        </Section>

        <Section title="Participants">
          <InfoRow
            label="Side A Participants"
            value={toDisplay(d.sideAParticipants)}
          />
          <InfoRow
            label="Side B Participants"
            value={toDisplay(d.sideBParticipants)}
          />
          <InfoRow
            label="Unique Participants"
            value={toDisplay(d.uniqueParticipants)}
          />
        </Section>

        <Section title="Timeline">
          <InfoRow label="Created At" value={toDisplayDate(d.createdAt)} />
          <InfoRow label="Start" value={toDisplayDate(d.startTime)} />
          <InfoRow label="End" value={toDisplayDate(d.endTime)} />
          <InfoRow label="Resolved" value={toDisplayDate(d.resolutionTime)} />
        </Section>

        <Section title="Battle Metrics">
          <InfoRow label="Winning Metric" value={getKey(d.winningMetric)} />
          <InfoRow
            label="Meta Market Enabled"
            value={d.metaMarketEnabled ? "Yes" : "No"}
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

const InfoRow = ({ label, value }) => {
  const safe = toDisplay(value);
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-800/40 transition-colors">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-gray-200 break-all max-w-[60%] text-right">
        {safe}
      </span>
    </div>
  );
};
