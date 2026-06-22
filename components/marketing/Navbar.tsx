"use client";

import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/constants/links";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Container from "../global/container";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import MobileMenu from "./mobile-menu";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUserStore } from "@/store/userInfo";
import { NavbarHUD } from "@/components/game";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { connected } = useWallet();
  const { userInfo } = useUserStore();

  // Check for admin access
  const hasAccess =
    userInfo?.user?.kyc_level !== undefined &&
    userInfo?.user?.kyc_level >= 3 &&
    userInfo?.user?.is_verified === true;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 w-full h-16 transition-all duration-300",
        isScrolled ? "bg-[#050505]/50 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      )}
    >
      <Wrapper className="flex items-center justify-between h-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="flex items-center gap-1.5 group">
            <Image 
              src="/quantlogo.svg" 
              alt="Quantum Wager" 
              width={40} 
              height={40} 
              className="w-10 h-10 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
            />
            <span className="text-lg font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              Quantum Wager
            </span>
          </Link>
        </motion.div>

        <div className="hidden lg:flex flex-row flex-1 absolute inset-0 items-center justify-center w-max mx-auto">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/markets" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5")}>
                    Markets
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/how-it-works" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5")}>
                    How It Works
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5">Token</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-[#0A0A0A] border border-white/10">
                    <ListItem href="/buytoken" title="Buy Token">
                      Purchase tokens directly from the platform.
                    </ListItem>
                    <ListItem href="/token" title="Launchpad">
                      Launch your own prediction market tokens.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5">Battle</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-[#0A0A0A] border border-white/10">
                    <ListItem href="/battlearena" title="Meme Battle">
                      Join high-stakes meme coin battles.
                    </ListItem>
                    <ListItem href="/fastbet" title="Fast Bets">
                      High-speed prediction markets.
                    </ListItem>
                    <ListItem href="/battlearena/new" title="Create Battle">
                      Start a new battle between any two tokens.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/leaderboard" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5")}>
                    Leaderboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/portfolio" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5")}>
                    Portfolio
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {hasAccess && (
                <NavigationMenuItem>
                  <Link href="/admin" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground hover:bg-white/5")}>
                      Admin
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <Container animation="fadeLeft" delay={0.1}>
          <div className="flex items-center gap-x-4">
            <NavbarHUD />
            <div className="hidden lg:flex items-center gap-3">
                <WalletMultiButton style={{}} />
            </div>
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>
        </Container>
      </Wrapper>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-white">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Navbar;
