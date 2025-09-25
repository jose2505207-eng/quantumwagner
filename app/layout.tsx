import type { Metadata } from "next";
import "./globals.css";
import { Background } from "@/componenets/background";
import { AppBar } from "@/componenets/Appbar";
import { SolanaProvider } from "../lib/SolanaProvider";
import Footer from "@/componenets/Footer";
import { WalletAuth } from "@/app/utils/walletAuth";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Quantum",
  description: "Meme coin prediction market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="relative bg-black text-white min-h-screen flex flex-col">
        <Background />
        <SolanaProvider>
          <AppBar />
          <WalletAuth></WalletAuth>
          <main className="flex-grow pt-24">{children}</main>

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
