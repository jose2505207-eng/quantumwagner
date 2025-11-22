"use client";

import React, { FC, ReactNode, useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { 
  SolanaMobileWalletAdapter, 
  createDefaultAuthorizationResultCache,
  createDefaultAddressSelector,
  createDefaultWalletNotFoundHandler
} from "@solana-mobile/wallet-adapter-mobile";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent;
      const mobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  const wallets = useMemo(
    () => {
      const mwa = new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: "Quantum Wager",
          uri: typeof window !== 'undefined' ? window.location.origin : "https://quantumwager.com",
          icon: typeof window !== 'undefined' ? `${window.location.origin}/quantlogo.svg` : "/quantlogo.svg",
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: network,
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      });

      if (isMobile) {
        return [mwa];
      }

      return [
        mwa,
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ];
    },
    [network, isMobile]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
