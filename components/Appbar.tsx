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
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userInfo";
import Image from "next/image";

export function AppBar() {
  const { connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { userInfo } = useUserStore();

  const navItems = [
    { label: "Markets", path: "/markets" },
    // { label: "Fastbet", path: "/fastbet" },
    { label: "BuyToken", path: "/buytoken" },
    { label: "Arena", path: "/battlearena" },
    { label: "leaderboard", path: "/leaderboard" },
    { label: "Portfolio", path: "/portfolio" },
  ];

  // Permission check

  const hasAccess =
    userInfo?.user?.kyc_level !== undefined &&
    userInfo?.user?.kyc_level >= 3 &&
    userInfo?.user?.is_verified === true;

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
          className="cursor-pointer flex items-center"
        >
          <Image
            src="/logo.png" // put your PNG inside the /public folder
            alt="Quantum Logo"
            width={88}
            height={89}
            priority
            className="h-auto w-auto"
          />
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-8">
              {navItems.map((item) => {
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

          {/* Wallet Buttons */}
          <div className="flex items-center gap-3">
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

              <WalletMultiButton className="w-full" />
              {connected && <WalletDisconnectButton className="w-full" />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
