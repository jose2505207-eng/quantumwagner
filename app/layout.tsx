import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Toaster } from "react-hot-toast";
import RouteProgress from "./utils/hooks/routeProgress";
import { SolanaProvider } from "./utils/SolanaProvider";
import { WalletAuth } from "./utils/walletAuth";
import { base, heading } from "@/constants/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quantum Wager ",
  description: "Meme coin prediction market.",
  icons: {
    icon: "logo.png ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 
  return (
    <html lang="en" className="dark">
      <body className={cn(
          "relative bg-[#050505] text-white min-h-screen flex flex-col font-base antialiased",
          base.variable,
          heading.variable
        )}>
        <RouteProgress />
        <SolanaProvider>
          <Navbar />
          <WalletAuth></WalletAuth>
          <main className="flex-grow ">{children}</main>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#0d0f16", // solid dark
                color: "#fff",
                borderRadius: "0.5rem",
                padding: "10px 16px",
                fontSize: "0.9rem",
                fontWeight: 500,
              },
            }}
          />
        </SolanaProvider>
        <Footer />
      </body>
    </html>
  );
}
