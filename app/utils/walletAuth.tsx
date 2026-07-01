"use client";

/**
 * Wallet auth driver (mounted once in app/layout.tsx).
 *
 * On connect (and whenever the connected wallet CHANGES) it establishes a
 * session: it first reuses the existing HttpOnly `qw_session` cookie if it
 * already belongs to this wallet, otherwise it runs the ed25519 challenge —
 * fetching the nonce + the EXACT message to sign from the server and signing
 * that (never reconstructing the message client-side). On disconnect it clears
 * the session. There is no token in localStorage: identity lives entirely in
 * the HttpOnly cookie, which the browser attaches automatically.
 */
import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { getUtf8Encoder } from "@solana/kit";
import bs58 from "bs58";
import { useUserStore } from "@/store/userInfo";

// `withCredentials` so the session cookie is sent even against an external API
// origin (same-origin sends it regardless).
const http = axios.create({ baseURL: BACKEND_URL, withCredentials: true });

export const WalletAuth = () => {
  const { connected, publicKey, signMessage } = useWallet();
  const { setUserInfo, clearUserInfo } = useUserStore();
  // Guards against duplicate concurrent auth for the same wallet (effect re-runs).
  const authingFor = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const wallet = publicKey?.toString() ?? null;

    // Load the current profile from the cookie session. Returns true only if a
    // session exists AND it belongs to `wallet`.
    async function loadProfile(): Promise<boolean> {
      try {
        const me = await http.get("/api/auth/me");
        if (
          !cancelled &&
          me.data?.success &&
          me.data.user?.wallet_address === wallet
        ) {
          setUserInfo(me.data);
          return true;
        }
      } catch {
        /* not authenticated yet */
      }
      return false;
    }

    async function authenticate() {
      if (!connected || !publicKey || !signMessage || !wallet) return;
      if (authingFor.current === wallet) return;
      authingFor.current = wallet;
      try {
        // Reuse an existing cookie session if it's for THIS wallet.
        if (await loadProfile()) return;

        // Otherwise run the sign-in challenge. Sign EXACTLY what the server
        // returns — never rebuild the message locally.
        const { data: challenge } = await http.post("/api/auth/nonce", {
          wallet_address: wallet,
        });
        const message: string = challenge.message;
        const encoded = new Uint8Array(getUtf8Encoder().encode(message));
        const signature = bs58.encode(await signMessage(encoded));
        if (cancelled) return;

        await http.post("/api/auth/verify", {
          wallet_address: wallet,
          message,
          signature,
        });
        await loadProfile();
      } catch (err) {
        console.error("Wallet login failed", err);
      } finally {
        if (authingFor.current === wallet) authingFor.current = null;
      }
    }

    async function signOut() {
      authingFor.current = null;
      clearUserInfo();
      try {
        await http.post("/api/auth/logout");
      } catch {
        /* best-effort */
      }
    }

    if (connected && publicKey) {
      void authenticate();
    } else {
      void signOut();
    }

    return () => {
      cancelled = true;
    };
    // Re-run when the wallet itself changes (not just connect/disconnect), so
    // switching wallets without disconnecting re-authenticates the new one.
  }, [connected, publicKey, signMessage, setUserInfo, clearUserInfo]);

  return null;
};
