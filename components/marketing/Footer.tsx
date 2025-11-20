import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import Wrapper from "../global/wrapper";
import { Twitter, MessageCircle, Mail, Shield, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative pt-16 pb-8 md:pb-0 w-full overflow-hidden">
      <Wrapper>
        <Container animation="scaleUp" delay={0.3}>
          <div className="absolute top-0 w-4/5 mx-auto inset-x-0 h-px bg-gradient-to-r from-[#050505] via-primary/40 to-[#050505]"></div>
        </Container>

        <div className="grid gap-8 xl:grid-cols-3 xl:gap-8">
          <Container animation="fadeRight" delay={0.4}>
            <div className="flex flex-col items-start justify-start md:max-w-[300px]">
              <div className="flex items-center gap-2">
                <Image
                  src="/quantlogo.png"
                  alt="Quantum Wager"
                  width={32}
                  height={32}
                  className="size-6"
                />
                <span className="text-lg lg:text-xl font-medium">
                  Quantum Wager
                </span>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                The prediction market for internet culture. <br />
                Bet on meme coin futures with confidence.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Link
                  href="https://twitter.com/quantumwager"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-border/60 hover:border-primary/60 transition-colors duration-300"
                >
                  <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Link>
                <Link
                  href="https://discord.gg/quantumwager"
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-border/60 hover:border-primary/60 transition-colors duration-300"
                >
                  <MessageCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Link>
              </div>
            </div>
          </Container>

          <Container animation="fadeUp" delay={0.5}>
            <div>
              <h3 className="text-base font-medium">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/markets"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Markets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portfolio"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
          </Container>

          <Container animation="fadeLeft" delay={0.6}>
            <div>
              <h3 className="text-base font-medium">Legal & Support</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <Link
                    href="mailto:support@quantumwager.com"
                    className="hover:text-foreground transition-colors duration-300"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </Container>
        </div>

        <Container animation="fadeUp" delay={0.7}>
          <div className="mt-8 pt-8 border-t border-border/60">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                © 2025 Quantum Wager. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span>Built for the crypto community</span>
                <span>•</span>
                <span>Trade responsibly</span>
              </div>
            </div>
          </div>
        </Container>
      </Wrapper>
    </footer>
  );
};

export default Footer;
