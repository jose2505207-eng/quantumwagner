"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DevnetWalletBar } from "@/components/wallet/DevnetWalletBar";
import { isAdminWallet } from "@/lib/admin";
import Image from "next/image";
import { NAV_LINKS } from "@/constants/links";

export function AppBar() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = NAV_LINKS.map((item) => ({
    label: item.name,
    path: item.link,
  }));

  // Admin link visibility — see lib/admin.ts. (The old `kyc_level >= 3` gate
  // could never pass: the profile endpoint always returns kyc_level 0.)
  const hasAccess = isAdminWallet(publicKey?.toBase58());

  if (hasAccess) {
    navItems.push({ label: "Admin", path: "/admin" });
  }

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f]/70 backdrop-blur-xl
  shadow-[0_0_10px_rgba(0,212,255,0.08),0_0_15px_rgba(255,0,150,0.06)]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <Image
            src="/quantlogo.svg"
            alt="Quantum Logo"
            width={52}
            height={52}
            priority
            className="h-[52px] w-[52px] drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.9)]"
          />
          <span className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
            Quantum Wager
          </span>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-8">
              {navItems.map((item) => {
                if (item.label === "Meme Battle") {
                  return (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger className="bg-transparent text-gray-300 hover:text-white hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-white font-medium text-base p-0 h-auto hover:bg-gradient-to-r hover:from-[#a855f7] hover:to-[#9333ea] hover:bg-clip-text hover:text-transparent data-[state=open]:from-[#a855f7] data-[state=open]:to-[#9333ea] data-[state=open]:bg-clip-text data-[state=open]:text-transparent">
                        Battle
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[220px] p-2 bg-[#0a0a0f] border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl">
                          <NavigationMenuLink
                            onClick={() => router.push("/battlearena")}
                            className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
                          >
                            <div className="font-bold mb-0.5 group-hover:text-purple-400 transition-colors">Battle Arena</div>
                            <div className="text-xs text-gray-500">PvP Meme Battles</div>
                          </NavigationMenuLink>
                          <NavigationMenuLink
                            onClick={() => router.push("/fastbet")}
                            className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
                          >
                            <div className="font-bold mb-0.5 group-hover:text-green-400 transition-colors">Fast Bets</div>
                            <div className="text-xs text-gray-500">High Speed Markets</div>
                          </NavigationMenuLink>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }

                const isActive = pathname === item.path;
                return (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      onClick={() => router.push(item.path)}
                      className={`relative cursor-pointer font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-[#a855f7] to-[#9333ea] bg-clip-text text-transparent"
                          : "text-gray-300 hover:bg-gradient-to-r hover:from-[#a855f7] hover:to-[#9333ea] hover:bg-clip-text hover:text-transparent"
                      }`}
                    >
                      {item.label}
                      {/* underline effect (isolated per item) */}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Wallet: devnet balance + faucet, then connect/disconnect */}
          <div className="flex items-center gap-3">
            <DevnetWalletBar />
            <WalletMultiButton className="transition duration-300 hover:shadow-[0_0_6px_rgba(0,212,255,0.25)]" />
            {connected && <WalletDisconnectButton />}
          </div>
        </div>
        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-border"
          >
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <div
                    key={item.label}
                    onClick={() => {
                      router.push(item.path);
                      setOpen(false);
                    }}
                    className={`block cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white bg-cyan-600/20"
                        : "text-gray-300 hover:text-white hover:bg-cyan-500/10"
                    }`}
                  >
                    {item.label}
                  </div>
                );
              })}

              <div className="flex justify-center">
                <DevnetWalletBar />
              </div>
              <WalletMultiButton className="w-full" />
              {connected && <WalletDisconnectButton className="w-full" />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
