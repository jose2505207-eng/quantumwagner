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


  const handleLeaderBoardClick = () => {
    console.log("leader board");
  };
  return (
    <header
      className="fixed top-0 left-0 w-full z-50
                 bg-[#0a0a0f]/60 backdrop-blur-xl
                 border-b border-transparent
                 [border-image:linear-gradient(90deg,rgba(255,255,255,0.1),rgba(168,85,247,0.05),rgba(59,130,246,0.05))_1]
                 shadow-[0_0_20px_rgba(255,255,255,0.05),0_0_30px_rgba(168,85,247,0.08),0_0_40px_rgba(59,130,246,0.08)]
                 transition-all duration-300"
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
            onClick={() => { router.push("/markets") }}
          >
            <p>Markets</p>
          </div>{" "}
          <div
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => { router.push("/leaderboard") }}
          >
            <p>Leaderboard</p>
          </div>
          <div
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => { router.push("/portfolio") }}
          >
            <p>Portfolio</p>
          </div>
          <WalletMultiButton />
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
          <div className="block text-gray-300 hover:text-white" onClick={() => { router.push("/") }}>
            Markets
          </div>
          <div className="block text-gray-300 hover:text-white" onClick={() => { router.push("/") }}>
            Leaderboard
          </div>
          <div className="block text-gray-300 hover:text-white" onClick={() => { router.push("/") }}>
            Portfolio
          </div>
          <WalletMultiButton />
          {connected && <WalletDisconnectButton />}
        </div>
      )}
    </header>
  );
}
