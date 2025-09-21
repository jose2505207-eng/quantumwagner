"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export function AppBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Markets", path: "/markets" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Portfolio", path: "/portfolio" },
  ];

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-transparent shadow-[0_0_10px_rgba(0,212,255,0.1),0_0_15px_rgba(255,0,150,0.08)]
    [border-image:linear-gradient(90deg,rgba(255,255,255,0.1),rgba(0,212,255,0.15),rgba(255,0,150,0.1))_1]
    transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-xl font-bold text-white tracking-wide">
          Quantum
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div
                key={item.label}
                onClick={() => router.push(item.path)}
                className="relative cursor-pointer text-gray-300 font-medium transition-colors duration-200 hover:text-gray-100 group"
              >
                <span className={isActive ? "text-gray-100" : ""}>
                  {item.label}
                </span>
                {/* Soft animated underline */}
                <span
                  className={`
                 absolute left-0 -bottom-1 h-[2px] rounded-full
               bg-gray-600
                 transition-all duration-300
                 ${isActive ? "w-full" : "w-0 group-hover:w-full"}
  `}
                />
              </div>
            );
          })}

          <WalletMultiButton className="transition-shadow duration-300 hover:shadow-[0_0_5px_rgba(0,212,255,0.2)]" />
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
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div
                key={item.label}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                className={`block font-medium cursor-pointer transition-colors duration-200 ${isActive
                  ? "text-gray-100 border-l-2 border-cyan-400 pl-2"
                  : "text-gray-300 hover:text-gray-100 hover:border-l-2 hover:border-cyan-400 hover:pl-2"
                  }`}
              >
                {item.label}
              </div>
            );
          })}
          <WalletMultiButton className="w-full" />
          {connected && <WalletDisconnectButton className="w-full" />}
        </div>
      )}
    </header>
  );
}
