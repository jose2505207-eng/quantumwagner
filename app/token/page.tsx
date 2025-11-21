"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import toast from "react-hot-toast";
import { 
  Rocket, Upload, Globe, Twitter, Send, Tag, 
  Coins, DollarSign, Info, CheckCircle2, AlertCircle, 
  Sparkles, Zap, ShieldCheck, LayoutGrid, ArrowRight,
  Wallet, Terminal
} from "lucide-react";
import Link from "next/link";

import Methods, { createToeknParams } from "@/app/utils/methods";
import { Background } from "@/components/background";
import { cn } from "@/lib/utils";
import { MIN_TOKEN_SUPPLY, MAX_TOKEN_SUPPLY, MIN_INITIAL_PRICE } from "@/config";
import { TokenChart } from "@/components/token-details/TokenChart";

const PRESET_TAGS = ["Meme", "DeFi", "Utility", "Gaming", "AI", "Social", "DAO"];

export default function LaunchPage() {
  const wallet = useWallet();
  const { createTokenLaunch } = Methods();

  // Form State
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [supply, setSupply] = useState<string>("1000000000");
  const [initialPrice, setInitialPrice] = useState<string>("100000000"); // In Lamports
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  // UI State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedMint, setDeployedMint] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"details" | "economics" | "socials">("details");

  // Validation
  const isValidUrl = (url: string) => {
    if (!url) return true; // Optional fields
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= 5) return toast.error("Max 5 tags allowed");
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      if (selectedTags.length >= 5) return toast.error("Max 5 tags allowed");
      if (!selectedTags.includes(customTag.trim())) {
        setSelectedTags([...selectedTags, customTag.trim()]);
      }
      setCustomTag("");
    }
  };

  const validateForm = () => {
    if (!name.trim()) return "Token Name is required";
    if (!symbol.trim()) return "Token Symbol is required";
    if (!description.trim()) return "Description is required";
    if (!imageUrl.trim() || !isValidUrl(imageUrl)) return "Valid Image URL is required";
    
    const supplyNum = Number(supply);
    if (isNaN(supplyNum) || supplyNum < MIN_TOKEN_SUPPLY || supplyNum > MAX_TOKEN_SUPPLY) {
      return `Supply must be between ${formatNumber(MIN_TOKEN_SUPPLY)} and ${formatNumber(MAX_TOKEN_SUPPLY)}`;
    }

    const priceNum = Number(initialPrice);
    if (isNaN(priceNum) || priceNum < MIN_INITIAL_PRICE) {
      return "Initial Price is too low";
    }

    return null;
  };

  const handleDeploy = async () => {
    const error = validateForm();
    if (error) return toast.error(error);
    if (!wallet.publicKey) return toast.error("Connect wallet first");

    try {
      setIsDeploying(true);
      
      const params: createToeknParams = {
        name,
        symbol,
        description,
        imageUrl,
        socialLinks: {
          website: website || undefined,
          twitter: twitter || undefined,
          telegram: telegram || undefined,
        },
        initialPrice: Number(initialPrice),
        totalSupply: Number(supply),
        tags: selectedTags,
      };

      const result = await createTokenLaunch(params);
      
      if (result && result.tokenMint) {
        setDeployedMint(result.tokenMint);
        toast.success("Token Deployed Successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to deploy token");
    } finally {
      setIsDeploying(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  if (deployedMint) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        <Background />
        <div className="relative z-10 max-w-lg w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
            <Rocket className="w-10 h-10 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Launch Successful!</h2>
            <p className="text-white/60">Your token has been deployed to the Solana network.</p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-4 text-left">
              <img src={imageUrl} alt={name} className="w-12 h-12 rounded-xl object-cover bg-white/5" />
              <div>
                <div className="font-bold text-white text-lg">{name}</div>
                <div className="text-white/40 font-mono text-sm">{symbol}</div>
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Mint Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white/80">{deployedMint.slice(0, 4)}...{deployedMint.slice(-4)}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(deployedMint);
                    toast.success("Copied!");
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 text-white/60" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link 
              href={`https://solscan.io/token/${deployedMint}?cluster=devnet`}
              target="_blank"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors font-bold text-sm"
            >
              <Globe className="w-4 h-4" />
              View on Solscan
            </Link>
            <Link 
              href="/portfolio"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-bold text-sm"
            >
              <Wallet className="w-4 h-4" />
              View Portfolio
            </Link>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            Launch another token
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 pb-20">
      <Background />
      
      <div className="relative z-10 container mx-auto px-4 pt-24 lg:pt-32 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3 h-3" />
            <span>Token Launchpad</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black tracking-tight text-white"
          >
            Launch your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              big idea.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60"
          >
            Deploy fully-featured SPL tokens on Solana in seconds. No coding required.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
              {[
                { id: "details", label: "Token Details", icon: LayoutGrid },
                { id: "economics", label: "Economics", icon: Coins },
                { id: "socials", label: "Socials", icon: Globe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    activeSection === tab.id 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl"
            >
              {activeSection === "details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Token Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Bitcoin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Symbol</label>
                      <input 
                        type="text" 
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g. BTC"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your project..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Image URL</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                      />
                      <Upload className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                    </div>
                    <p className="text-[10px] text-white/40">
                      Supported formats: PNG, JPG, GIF. Recommended size: 500x500px.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === "economics" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Supply</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={supply}
                        onChange={(e) => setSupply(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-mono"
                      />
                      <Coins className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                    </div>
                    <p className="text-[10px] text-white/40">
                      Min: {formatNumber(MIN_TOKEN_SUPPLY)} • Max: {formatNumber(MAX_TOKEN_SUPPLY)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Initial Price (Lamports)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={initialPrice}
                        onChange={(e) => setInitialPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-mono"
                      />
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                    </div>
                    <p className="text-[10px] text-white/40">
                      ≈ {(Number(initialPrice) / LAMPORTS_PER_SOL).toFixed(9)} SOL
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-blue-400">Token Standard</h4>
                      <p className="text-xs text-blue-200/60 leading-relaxed">
                        Your token will be deployed using the Token-2022 program standard, enabling advanced features and better compatibility.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "socials" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Website</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://your-project.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                        />
                        <Globe className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Twitter / X</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="@yourproject"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                        />
                        <Twitter className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Telegram</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          placeholder="t.me/yourproject"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                        />
                        <Send className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                            selectedTags.includes(tag)
                              ? "bg-purple-500 text-white border-purple-500"
                              : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                      <input 
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={handleAddCustomTag}
                        placeholder="+ Add custom"
                        className="px-3 py-1.5 rounded-lg text-xs bg-transparent border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 min-w-[80px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="text-xs text-white/40">
                  {activeSection === "details" && "Step 1 of 3"}
                  {activeSection === "economics" && "Step 2 of 3"}
                  {activeSection === "socials" && "Step 3 of 3"}
                </div>
                
                <div className="flex gap-3">
                  {activeSection !== "details" && (
                    <button 
                      onClick={() => setActiveSection(activeSection === "economics" ? "details" : "economics")}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                  )}
                  
                  {activeSection !== "socials" ? (
                    <button 
                      onClick={() => setActiveSection(activeSection === "details" ? "economics" : "socials")}
                      className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleDeploy}
                      disabled={isDeploying || !wallet.publicKey}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      {isDeploying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          Launch Token
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Preview */}
          <div className="lg:col-span-5 space-y-6 sticky top-32">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Live Preview</h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SOLANA MAINNET
              </div>
            </div>

            <div className="rounded-[32px] bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl relative group">
              {/* Card Header / Banner */}
              <div className="h-32 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                {imageUrl && (
                  <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl" alt="" />
                )}
              </div>

              <div className="px-6 pb-6 -mt-12 relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-[#111] border-4 border-[#0A0A0A] overflow-hidden shadow-xl">
                    {imageUrl ? (
                      <img src={imageUrl} className="w-full h-full object-cover" alt={name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <Sparkles className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mb-2">
                    {website && <div className="p-2 rounded-full bg-white/5 border border-white/5"><Globe className="w-4 h-4 text-white/60" /></div>}
                    {twitter && <div className="p-2 rounded-full bg-white/5 border border-white/5"><Twitter className="w-4 h-4 text-white/60" /></div>}
                    {telegram && <div className="p-2 rounded-full bg-white/5 border border-white/5"><Send className="w-4 h-4 text-white/60" /></div>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight">
                      {name || "Token Name"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-purple-400 font-mono">
                        ${symbol || "SYMBOL"}
                      </span>
                      {selectedTags.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                      )}
                      <div className="flex gap-1">
                        {selectedTags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">
                    {description || "Token description will appear here..."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Supply</div>
                      <div className="text-sm font-mono font-bold text-white">
                        {formatNumber(Number(supply))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Price</div>
                      <div className="text-sm font-mono font-bold text-white">
                        {(Number(initialPrice) / LAMPORTS_PER_SOL).toFixed(4)} SOL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Preview */}
            <div className="h-[350px] w-full">
               <TokenChart tokenSymbol={symbol || "TOKEN"} />
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-yellow-500">Disclaimer</h4>
                <p className="text-xs text-yellow-200/60 leading-relaxed">
                  Tokens are deployed to the Solana blockchain and cannot be deleted. Ensure all details are correct before deploying.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
