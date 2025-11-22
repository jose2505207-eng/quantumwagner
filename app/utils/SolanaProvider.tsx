"use client";

import React, { FC, ReactNode, useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { Adapter, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
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
  
  const [wallets, setWallets] = useState<Adapter[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mwa = new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: {
        name: "Quantum Wager",
        uri: window.location.origin,
        icon: `${window.location.origin}/quantlogo.svg`,
      },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      cluster: network,
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    });

    const phantom = new PhantomWalletAdapter();
    const solflare = new SolflareWalletAdapter();

    setWallets([mwa, phantom, solflare]);
  }, [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={(err) => console.error("Wallet Error:", err)}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
