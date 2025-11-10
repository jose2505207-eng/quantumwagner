"use client";
import { useParams } from "next/navigation";
import { Spinner } from "../../page";
import { useUserTokens } from "@/lib/useUserTokens";
import { BN } from "@coral-xyz/anchor";
import { useState } from "react";
import Image from "next/image";

export const toDisplay = (val): string => {
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

export default function Token() {
  const params = useParams();
  const mind_address = params.mid;
  const { tokens: userToken, loading: tokenLoading } = useUserTokens();
  return (
    <div className="mt-20">
      <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent mb-4">
        Your Tokens
      </h3>
      {tokenLoading ? (
        <Spinner />
      ) : userToken.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userToken.map((token, i: number) => {
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
                    <Image
                      src={
                        acc.imageUri ||
                        "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                      }
                      alt={acc.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-full border border-gray-600 mb-3"
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
                </div>

                {/* Expandable Details */}
                <div className={`overflow-hidden transition-all duration-500`}>
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
  );
}
