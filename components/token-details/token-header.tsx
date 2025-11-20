"use client";

import { motion } from "framer-motion";
import { Globe, Send, Twitter, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toDisplay } from "@/app/portfolio/token/[mid]/page";
import { useState } from "react";

interface TokenHeaderProps {
  token: any;
  status: string;
}

export function TokenHeader({ token, status }: TokenHeaderProps) {
  const [copied, setCopied] = useState(false);
  const mint = token.tokenMint?.toString();

  const handleCopy = () => {
    navigator.clipboard.writeText(mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full mb-8">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#0b0d11]" />
        {token.imageUri && (
          <img
            src={token.imageUri}
            alt=""
            className="w-full h-full object-cover blur-[100px] opacity-30 scale-150"
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start gap-8 p-6 md:p-10">
        {/* Token Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative shrink-0"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-primary/20">
            {token.imageUri ? (
              <img
                src={token.imageUri}
                alt={token.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="absolute -bottom-3 -right-3">
            <Badge 
              variant="outline" 
              className={`
                px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md
                ${status === "active" 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-neutral-800/80 text-neutral-400 border-white/10"}
              `}
            >
              {status}
            </Badge>
          </div>
        </motion.div>

        {/* Token Info */}
        <div className="flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              {token.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-lg text-muted-foreground">
              <span className="font-mono text-primary font-bold">${token.symbol}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-sm">Launch ID: #{toDisplay(token.launchId)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              
              {/* Mint Address Pill */}
              <button 
                onClick={handleCopy}
                className="group flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs"
              >
                <span className="font-mono text-gray-400 group-hover:text-white transition-colors">
                  {mint?.slice(0, 4)}...{mint?.slice(-4)}
                </span>
                {copied ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground group-hover:text-white" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 max-w-2xl leading-relaxed"
          >
            {token.description || "No description available for this token."}
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            {token.socialLinks?.website && (
              <SocialLink href={token.socialLinks.website} icon={<Globe className="w-4 h-4" />} label="Website" />
            )}
            {token.socialLinks?.twitter && (
              <SocialLink href={token.socialLinks.twitter} icon={<Twitter className="w-4 h-4" />} label="Twitter" />
            )}
            {token.socialLinks?.telegram && (
              <SocialLink href={token.socialLinks.telegram} icon={<Send className="w-4 h-4" />} label="Telegram" />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 hover:text-primary transition-all duration-300 text-sm font-medium text-gray-400"
    >
      {icon}
      {label}
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  );
}
