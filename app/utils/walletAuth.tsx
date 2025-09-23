"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { getUtf8Encoder } from "@solana/kit";
import bs58 from "bs58";

export const WalletAuth = () => {
  const { connected, publicKey, signMessage } = useWallet();
  const [userVerified, setUserVerified] = useState<boolean>(false);

  useEffect(() => {
    const authenticate = async () => {
      if (!connected || !publicKey || !signMessage) return;

      //  Check token first
      const token = localStorage.getItem("token");
      let tokenValid = false;

      if (token) {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          tokenValid = res.data.success;
          setUserVerified(tokenValid);
        } catch {
          tokenValid = false;
          setUserVerified(false);
        }
      }

      // Only sign nonce if token invalid
      if (!tokenValid) {
        try {
          const { nonce } = await axios
            .post(`${BACKEND_URL}/api/auth/nonce`, {
              wallet_address: publicKey.toString(),
            })
            .then((res) => res.data);

          const message = `Sign this message to login to Quantum: ${nonce}`;
          const encodedMessage = new Uint8Array(
            getUtf8Encoder().encode(message)
          );
          const signedBytes = await signMessage(encodedMessage);
          const signature = bs58.encode(signedBytes);

          const authUser = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
            wallet_address: publicKey.toString(),
            signature,
            message,
          });

          if (authUser.data.success && authUser.data.token) {
            localStorage.setItem("token", authUser.data.token);
            setUserVerified(true);
          }
        } catch (err) {
          console.error("Wallet login failed", err);
        }
      }
    };

    authenticate();
  }, [connected, publicKey, signMessage]);

  return null;
};
