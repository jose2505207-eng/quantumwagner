"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export function AppBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { connected } = useWallet();
  const router = useRouter();

  return (
    <header
      className="
        fixed top-0 left-0 w-full z-50
        bg-[#0a0a0f]/60 backdrop-blur-xl
        border-b border-transparent
        [border-image:linear-gradient(90deg,rgba(255,255,255,0.1),rgba(0,212,255,0.15),rgba(255,0,150,0.1))_1]
        shadow-[0_0_10px_rgba(0,212,255,0.1),0_0_15px_rgba(255,0,150,0.08)]
        transition-all duration-300
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-xl font-bold text-white tracking-wide">
          Quantum
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <div
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => router.push("/markets")}
          >
            Markets
          </div>
          <div
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => router.push("/leaderboard")}
          >
            Leaderboard
          </div>
          <div
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => router.push("/portfolio")}
          >
            Portfolio
          </div>
          <WalletMultiButton className="hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-shadow" />
          {connected && <WalletDisconnectButton />}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-4">
          <div className="block text-gray-300 hover:text-white" onClick={() => router.push("/")}>
            Markets
          </div>
          <div className="block text-gray-300 hover:text-white" onClick={() => router.push("/")}>
            Leaderboard
          </div>
          <div className="block text-gray-300 hover:text-white" onClick={() => router.push("/")}>
            Portfolio
          </div>
          <WalletMultiButton />
          {connected && <WalletDisconnectButton />}
        </div>
      )}
    </header>
  );
}
