"use client";

import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/constants/links";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Container from "../global/container";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import MobileMenu from "./mobile-menu";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUserStore } from "@/store/userInfo";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { connected } = useWallet();
  const { userInfo } = useUserStore();

  // Check for admin access
  const hasAccess =
    userInfo?.user?.kyc_level !== undefined &&
    userInfo?.user?.kyc_level >= 3 &&
    userInfo?.user?.is_verified === true;

  const links = [...NAV_LINKS];
  if (hasAccess) {
    links.push({ name: "Admin", link: "/admin" });
  }

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
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/quant.svg" 
              alt="Quantum Wager" 
              width={160} 
              height={40} 
              className="w-auto h-8"
            />
          </Link>
        </motion.div>

        <div className="hidden lg:flex flex-row flex-1 absolute inset-0 items-center justify-center w-max mx-auto gap-x-6 text-sm text-muted-foreground font-medium">
          <AnimatePresence>
            {links.map((link, index) => (
              <Container key={index} animation="fadeDown" delay={0.1 * index}>
                <div className="relative group">
                  <Link
                    href={link.link}
                    className="hover:text-foreground transition-all duration-300 px-1.5 py-1"
                  >
                    {link.name}
                  </Link>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </div>
              </Container>
            ))}
          </AnimatePresence>
        </div>

        <Container animation="fadeLeft" delay={0.1}>
          <div className="flex items-center gap-x-4">
            <div className="hidden lg:flex items-center gap-3">
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !h-9 !px-4 !text-sm !font-medium !rounded-md transition-all duration-300 hover:!scale-105" />
                {connected && <WalletDisconnectButton className="!h-9 !px-3 !text-sm !bg-red-500/10 hover:!bg-red-500/20 !text-red-500 !border !border-red-500/20 !rounded-md" />}
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

export default Navbar;
