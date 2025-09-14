import type { Metadata } from "next";
import "./globals.css";
import { Background } from "@/componenets/background";
import { AppBar } from "@/componenets/Appbar";
import { SolanaProvider } from "../lib/SolanaProvider";
import Footer from "@/componenets/Footer";

export const metadata: Metadata = {
  title: "Quantum",
  description: "Your next crypto choice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative bg-black text-white min-h-screen flex flex-col">
        <Background />
        <SolanaProvider>
          <AppBar />
          <main className="flex-grow pt-24">{children}</main>
        </SolanaProvider>
        <Footer />
      </body>
    </html>
  );
}
