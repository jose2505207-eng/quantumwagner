import type { Metadata } from "next";
import "./globals.css";
import { Background } from "@/components/background";
import { AppBar } from "@/components/Appbar";
import { SolanaProvider } from "../lib/SolanaProvider";
import Footer from "@/components/Footer";
import { WalletAuth } from "@/app/utils/walletAuth";
import { Toaster } from "react-hot-toast";
import RouteProgress from "./routeProgress";

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
      <body className="relative bg-black text-white min-h-screen flex flex-col">
        <RouteProgress />
        <Background />
        <SolanaProvider>
          <AppBar />
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
