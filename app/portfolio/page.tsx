"use client";

import React, { useEffect, useState } from "react";
import { usePositionStore } from "@/store/usePositionStore";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import Methods from "../contract_methods/methods";
import PositionCard from "@/components/positions/PositionCard";
import { PublicKey } from "@solana/web3.js";
import { useUserStore } from "@/store/userInfo";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Users,
  XCircle,
} from "lucide-react";
import ProfileCard from "@/components/custom/UserRepution";
import { useRouter } from "next/navigation";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { BN } from "@coral-xyz/anchor";

// Spinner loader
const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-gray-500 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
);

function useUserTokens() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();

  const { getUserAllTokens } = Methods();

  useEffect(() => {
    if (!wallet?.publicKey) return; // Wait until wallet connects
    let cancelled = false;

    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retry loop for program initialization
        let attempts = 0;
        while (attempts < 10) {
          try {
            const acc = await getUserAllTokens();
            if (!cancelled) setTokens(acc || []);
            break;
          } catch (err: any) {
            if (err.message?.includes("Progrma not found")) {
              attempts++;
              console.log(`⏳ Retrying getUserAllTokens (${attempts}/10)`);
              await new Promise((res) => setTimeout(res, 1000));
              continue;
            }
            throw err;
          }
        }
      } catch (err) {
        console.error("Failed to fetch tokens:", err);
        toast.error("Could not load tokens");
        setError("Failed to load tokens");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTokens();
    return () => {
      cancelled = true;
    };
  }, [wallet?.publicKey]);

  return { tokens, loading, error };
}

export default function Portfolio() {
  const { withdrawWinnings } = Methods();
  const { positions, setPositions } = usePositionStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active");
  const [withdrawingMap, setWithdrawingMap] = useState<Record<string, boolean>>(
    {}
  );
  const [expanded, setExpanded] = useState(false);

  const { tokens: userToken, loading: tokenLoading } = useUserTokens();
  const { userInfo } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Not authorized!");

      const res = await axios.get(`${BACKEND_URL}/api/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPositions(res.data.data.positions || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      toast.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (marketPda: string, positionId: string) => {
    try {
      setWithdrawingMap((prev) => ({ ...prev, [marketPda]: true }));

      await withdrawWinnings(new PublicKey(marketPda));

      const res = await axios.put(
        `${BACKEND_URL}/api/positions`,
        {
          settled: true,
          settled_at: new Date(),
          position_id: positionId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Bet withdrawn");
      await loadPositions();
    } catch (err) {
      const msg = err?.toString() || "";
      if (msg.includes("AlreadyClaimed")) {
        toast.success("Already claimed");
        return;
      }
      toast.error(`Withdraw failed: ${msg}`);
    } finally {
      setWithdrawingMap((prev) => ({ ...prev, [marketPda]: false }));
    }
  };

  const toDisplay = (val: any): string => {
    if (val === null || val === undefined) return "N/A";
    try {
      if (typeof val === "object" && val.words) {
        // Anchor BN internal structure
        return new BN(val).toString();
      }
      if (BN.isBN?.(val)) {
        return val.toString();
      }
      if (typeof val === "string" && /^[0-9a-fA-F]+$/.test(val)) {
        // hex string like "0186a0"
        return parseInt(val, 16).toLocaleString();
      }
      return val.toString();
    } catch {
      return String(val);
    }
  };

  const activePositions = positions.filter(
    (p) => new Date(p.market.end_time).getTime() >= Date.now()
  );
  const expiredPositions = positions.filter(
    (p) => new Date(p.market.end_time).getTime() < Date.now()
  );

  return (
    <div className="min-h-screen p-6 pt-24 text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* User Info Card */}
        <div className="flex flex-wrap items-center gap-6 bg-gray-900/70 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">
              KYC: {userInfo?.user.kyc_level || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">
              Rep: {userInfo?.user.reputation_score ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">
              Predictions: {userInfo?.user.total_predictions ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {userInfo?.user.is_verified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-500">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-500">Not Verified</span>
              </>
            )}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all cursor-pointer"
            onClick={() => router.push("/token")}
          >
            <Coins className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">
              Launch Token
            </span>
          </div>
        </div>

        {/* User Tokens Section */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent mb-4">
            Your Tokens
          </h3>
          {tokenLoading ? (
            <Spinner />
          ) : userToken.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userToken.map((token: any, i: number) => {
                const acc = token.account;
                const mint = acc.tokenMint?.toBase58?.() ?? acc.tokenMint;
                const creator = acc.creator?.toBase58?.() ?? acc.creator;

                return (
                  <div
                    key={i}
                    className="bg-gray-900/50 border border-gray-700 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-lg transition-all duration-200 flex flex-col"
                  >
                    {/* Image & Header */}
                    <div className="flex flex-col items-center text-center">
                      {acc.imageUri && acc.imageUri.startsWith("http") ? (
                        <img
                          src={acc.imageUri}
                          alt={acc.name}
                          className="w-20 h-20 object-cover rounded-full border border-gray-600 mb-3"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg")
                          }
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-700 text-gray-400 rounded-full mb-3">
                          No Image
                        </div>
                      )}

                      <h4 className="text-lg font-semibold text-white">
                        {acc.name}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">{acc.symbol}</p>

                      {acc.tags?.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                          {acc.tags.map((t: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-300"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-purple-400 hover:text-purple-300 transition mt-2"
                      >
                        {expanded ? "Hide Details ▲" : "View Details ▼"}
                      </button>
                    </div>

                    {/* Expandable Details */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        expanded ? "max-h-[800px] mt-4" : "max-h-0"
                      }`}
                    >
                      <div className="text-sm space-y-1 text-gray-300 mt-2">
                        <p>
                          <strong>Mint:</strong> {mint}
                        </p>
                        <p>
                          <strong>Creator:</strong> {creator}
                        </p>
                        <p>
                          <strong>Total Supply:</strong>{" "}
                          {toDisplay(acc.totalSupply)}
                        </p>
                        <p>
                          <strong>Initial Price:</strong>{" "}
                          {toDisplay(acc.initialPrice)}
                        </p>
                        <p>
                          <strong>Current Price:</strong>{" "}
                          {toDisplay(acc.currentPrice)}
                        </p>
                        <p>
                          <strong>Battle Eligible:</strong>{" "}
                          {acc.battleEligible ? "Yes" : "No"}
                        </p>
                      </div>

                      {/* Links */}
                      <div className="flex flex-wrap gap-3 mt-4 text-xs">
                        {acc.socialLinks?.website && (
                          <a
                            href={acc.socialLinks.website}
                            target="_blank"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Website
                          </a>
                        )}
                        {acc.socialLinks?.twitter && (
                          <a
                            href={`https://twitter.com/${acc.socialLinks.twitter.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            className="text-sky-400 hover:text-sky-300"
                          >
                            Twitter
                          </a>
                        )}
                        {acc.socialLinks?.telegram && (
                          <a
                            href={`https://t.me/${acc.socialLinks.telegram.replace(
                              "@",
                              ""
                            )}`}
                            target="_blank"
                            className="text-blue-500 hover:text-blue-300"
                          >
                            Telegram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No tokens found</p>
          )}
        </div>

        {/* Reputation Card */}

        <ProfileCard
          reputation_score={userInfo?.user.reputation_score || 0}
          win_rate={userInfo?.user.win_rate || "error"}
          battels_won={userInfo?.user.win_rate || "error"}
        />
        {/* Positions Section */}
        <Tabs defaultValue="active" onValueChange={setTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-10">
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent">
              Positions
            </h3>

            <TabsList className="bg-gray-900/70 border border-gray-800 rounded-lg flex justify-center sm:justify-start">
              <TabsTrigger
                value="active"
                className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea]
                data-[state=active]:text-white 
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
                transition"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="expired"
                className="px-6 py-2 text-sm sm:text-base rounded-md font-medium
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a855f7] data-[state=active]:to-[#9333ea]
                data-[state=active]:text-white 
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white 
                transition"
              >
                Expired
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Active Tab */}
          <TabsContent value="active">
            {loading ? (
              <Spinner />
            ) : activePositions.length === 0 ? (
              <p className="text-center text-gray-400">No active positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activePositions.map((p) => (
                  <PositionCard
                    key={p.id}
                    position={p}
                    withdrawing={!!withdrawingMap[p.market.pda]}
                    handleWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expired Tab */}
          <TabsContent value="expired">
            {loading ? (
              <Spinner />
            ) : expiredPositions.length === 0 ? (
              <p className="text-center text-gray-400">No expired positions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {expiredPositions.filter((p) => !p.settled).length === 0 ? (
                  <p className="text-gray-400 text-center">
                    No unsettled positions
                  </p>
                ) : (
                  expiredPositions
                    .filter(
                      (p) => !p.settled && p.position_type !== p.market.outcome
                    )
                    .map((p) => (
                      <PositionCard
                        key={p.id}
                        position={p}
                        withdrawing={!!withdrawingMap[p.market.pda]}
                        handleWithdraw={handleWithdraw}
                      />
                    ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
