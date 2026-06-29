"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { BN } from "@coral-xyz/anchor";
import { 
  Swords, Calendar, Clock, Upload, Search, 
  Trophy, Users, ArrowRight, Sparkles, AlertCircle,
  CheckCircle2, X, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import Methods from "@/app/utils/methods";
import { useAllTokens } from "@/app/utils/useAllTokens";
import { Background } from "@/components/background";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------
   STYLED TOKEN SELECTOR
------------------------------------------------------- */
// One decoded token account as returned by `useAllTokens()` (Anchor
// `program.account.tokenLaunch.all()`). `account.tokenMint` is a PublicKey, so
// every comparison below normalises it to its base58 string (see below).
type TokenAccount = ReturnType<typeof useAllTokens>["tokens"][number];

type TokenSelectorProps = {
  label: string;
  selected: string;
  setSelected: (mint: string) => void;
  allToken: TokenAccount[] | undefined;
  loading: boolean;
  side: "A" | "B";
};

function TokenSelector({ label, selected, setSelected, allToken, loading, side }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedToken = allToken?.find((t) => t.account.tokenMint.toString() === selected);
  const filteredTokens = allToken?.filter((t) =>
    t.account.name.toLowerCase().includes(search.toLowerCase()) || 
    t.account.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const colorClass = side === "A" ? "text-blue-400" : "text-rose-400";
  const borderClass = side === "A" ? "focus:border-blue-500/50 focus:bg-blue-500/5" : "focus:border-rose-500/50 focus:bg-rose-500/5";

  return (
    <div className="space-y-2 relative">
      <label className={cn("text-xs font-bold uppercase tracking-wider", colorClass)}>{label}</label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left transition-all",
          isOpen ? "border-white/20 bg-white/10" : "hover:bg-white/10"
        )}
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            {selectedToken.account.imageUri ? (
              <img src={selectedToken.account.imageUri} className="w-6 h-6 rounded-full" alt="" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10" />
            )}
            <span className="font-bold text-white">{selectedToken.account.symbol}</span>
            <span className="text-xs text-white/40">{selectedToken.account.name}</span>
          </div>
        ) : (
          <span className="text-white/40">Select a token...</span>
        )}
        <ChevronDown className="w-4 h-4 text-white/40" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 w-full mt-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tokens..."
                    className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
                {loading ? (
                  <div className="p-4 text-center text-xs text-white/40">Loading tokens...</div>
                ) : filteredTokens?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/40">No tokens found</div>
                ) : (
                  filteredTokens?.map((t) => (
                    <button
                      key={t.publicKey.toString()}
                      onClick={() => {
                        setSelected(t.account.tokenMint.toString());
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                      {t.account.imageUri ? (
                        <img src={t.account.imageUri} className="w-8 h-8 rounded-full" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                      )}
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-white transition-colors">
                          {t.account.symbol}
                        </div>
                        <div className="text-xs text-white/40">{t.account.name}</div>
                      </div>
                      {selected === t.account.tokenMint.toString() && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateBattlePage() {
  const wallet = useWallet();
  const { createBattle } = Methods();
  const { tokens: allToken, loading: tokenLoading } = useAllTokens();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [sideAName, setSideAName] = useState("");
  const [sideAToken, setSideAToken] = useState("");
  
  const [sideBName, setSideBName] = useState("");
  const [sideBToken, setSideBToken] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // UI State
  const [isCreating, setIsCreating] = useState(false);
  const [createdBattle, setCreatedBattle] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"basics" | "sides" | "schedule">("basics");

  const minDateTime = new Date().toISOString().slice(0, 16);

  const validateForm = () => {
    if (!title.trim()) return "Battle Title is required";
    if (!description.trim()) return "Description is required";
    if (!imageUrl.trim()) return "Image URL is required";
    
    if (!sideAName.trim()) return "Side A Name is required";
    if (!sideAToken) return "Side A Token is required";
    
    if (!sideBName.trim()) return "Side B Name is required";
    if (!sideBToken) return "Side B Token is required";
    
    if (!startTime) return "Start Time is required";
    if (!endTime) return "End Time is required";

    const now = Math.floor(Date.now() / 1000);
    const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
    const endUnix = Math.floor(new Date(endTime).getTime() / 1000);

    if (startUnix <= now + 30) return "Start time must be at least 30 seconds from now";
    if (endUnix <= startUnix) return "End time must be AFTER start time";

    return null;
  };

  const handleCreate = async () => {
    const error = validateForm();
    if (error) return toast.error(error);
    if (!wallet.publicKey) return toast.error("Connect wallet first");

    try {
      setIsCreating(true);
      
      const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endUnix = Math.floor(new Date(endTime).getTime() / 1000);

      const { battlePDA } = await createBattle({
        title,
        description,
        sideATokens: [new PublicKey(sideAToken)],
        sideBTokens: [new PublicKey(sideBToken)],
        sideAName,
        sideBName,
        startTime: startUnix,
        endTime: endUnix,
        metaMarketEnabled: true,
        imageUrl,
      });

      setCreatedBattle(battlePDA.toBase58());
      toast.success("Battle Created Successfully!");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to create battle";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  // Helper to get token details for preview. `mint` is the base58 string held in
  // state; `t.account.tokenMint` is a PublicKey, so normalise it before comparing.
  const getTokenDetails = (mint: string) => {
    return allToken?.find((t) => t.account.tokenMint.toString() === mint)?.account;
  };

  if (createdBattle) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        <Background />
        <div className="relative z-10 max-w-lg w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20">
            <Swords className="w-10 h-10 text-purple-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Battle Created!</h2>
            <p className="text-white/60">Your battle arena is now live on Solana.</p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-4 text-left">
              <img src={imageUrl} alt={title} className="w-12 h-12 rounded-xl object-cover bg-white/5" />
              <div>
                <div className="font-bold text-white text-lg line-clamp-1">{title}</div>
                <div className="text-white/40 font-mono text-sm">
                  {sideAName} vs {sideBName}
                </div>
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Battle Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white/80">{createdBattle.slice(0, 4)}...{createdBattle.slice(-4)}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(createdBattle);
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
              href={`/battlearena/${createdBattle}`}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition-colors font-bold text-sm"
            >
              <Swords className="w-4 h-4" />
              Go to Battle Arena
            </Link>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            Create another battle
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
            <Swords className="w-3 h-3" />
            <span>Battle Creator</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black tracking-tight text-white"
          >
            Create the next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              legendary clash.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60"
          >
            Set up prediction markets for token battles. Let the community decide the winner.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
              {[
                { id: "basics", label: "Basic Info", icon: Trophy },
                { id: "sides", label: "Contestants", icon: Users },
                { id: "schedule", label: "Schedule", icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveSection(tab.id as "basics" | "sides" | "schedule")
                  }
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
              {activeSection === "basics" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Battle Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Solana vs Ethereum"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the battle conditions..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Cover Image URL</label>
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
                  </div>
                </div>
              )}

              {activeSection === "sides" && (
                <div className="space-y-8">
                  {/* Side A */}
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Side A Configuration</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-blue-400/60 uppercase tracking-wider">Team Name</label>
                      <input 
                        type="text" 
                        value={sideAName}
                        onChange={(e) => setSideAName(e.target.value)}
                        placeholder="e.g. The Bulls"
                        className="w-full bg-black/20 border border-blue-500/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>

                    <TokenSelector 
                      label="Representative Token"
                      selected={sideAToken}
                      setSelected={setSideAToken}
                      allToken={allToken}
                      loading={tokenLoading}
                      side="A"
                    />
                  </div>

                  {/* Side B */}
                  <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Side B Configuration</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-rose-400/60 uppercase tracking-wider">Team Name</label>
                      <input 
                        type="text" 
                        value={sideBName}
                        onChange={(e) => setSideBName(e.target.value)}
                        placeholder="e.g. The Bears"
                        className="w-full bg-black/20 border border-rose-500/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 transition-all"
                      />
                    </div>

                    <TokenSelector 
                      label="Representative Token"
                      selected={sideBToken}
                      setSelected={setSideBToken}
                      allToken={allToken}
                      loading={tokenLoading}
                      side="B"
                    />
                  </div>
                </div>
              )}

              {activeSection === "schedule" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Start Time</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          value={startTime}
                          min={minDateTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all [color-scheme:dark]"
                        />
                        <Clock className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">End Time</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          value={endTime}
                          min={startTime || minDateTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all [color-scheme:dark]"
                        />
                        <Clock className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-yellow-500">Important Note</h4>
                      <p className="text-xs text-yellow-200/60 leading-relaxed">
                        Battles cannot be edited once created. Ensure all times are correct. The battle must last at least 1 hour.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="text-xs text-white/40">
                  {activeSection === "basics" && "Step 1 of 3"}
                  {activeSection === "sides" && "Step 2 of 3"}
                  {activeSection === "schedule" && "Step 3 of 3"}
                </div>
                
                <div className="flex gap-3">
                  {activeSection !== "basics" && (
                    <button 
                      onClick={() => setActiveSection(activeSection === "schedule" ? "sides" : "basics")}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                  )}
                  
                  {activeSection !== "schedule" ? (
                    <button 
                      onClick={() => setActiveSection(activeSection === "basics" ? "sides" : "schedule")}
                      className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleCreate}
                      disabled={isCreating || !wallet.publicKey}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Swords className="w-4 h-4" />
                          Create Battle
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
                LIVE PREVIEW
              </div>
            </div>

            <div className="rounded-[32px] bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl relative group">
              {/* Card Header / Banner */}
              <div className="h-48 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                {imageUrl ? (
                  <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Swords className="w-12 h-12 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-black text-white leading-tight mb-2 line-clamp-2">
                    {title || "Battle Title"}
                  </h2>
                  <p className="text-sm text-white/60 line-clamp-2">
                    {description || "Battle description will appear here..."}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* VS Section */}
                <div className="flex items-center justify-between gap-4">
                  {/* Side A */}
                  <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    {sideAToken ? (
                      <img src={getTokenDetails(sideAToken)?.imageUri} className="w-10 h-10 rounded-full" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500/20" />
                    )}
                    <div className="text-center">
                      <div className="text-xs font-bold text-blue-400">{sideAName || "Side A"}</div>
                      <div className="text-[10px] text-white/40">{getTokenDetails(sideAToken)?.symbol || "TOKEN"}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl font-black text-white/20 italic">VS</span>
                  </div>

                  {/* Side B */}
                  <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                    {sideBToken ? (
                      <img src={getTokenDetails(sideBToken)?.imageUri} className="w-10 h-10 rounded-full" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-rose-500/20" />
                    )}
                    <div className="text-center">
                      <div className="text-xs font-bold text-rose-400">{sideBName || "Side B"}</div>
                      <div className="text-[10px] text-white/40">{getTokenDetails(sideBToken)?.symbol || "TOKEN"}</div>
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Starts</div>
                    <div className="text-sm font-mono font-bold text-white">
                      {startTime ? format(new Date(startTime), "MMM d, HH:mm") : "--:--"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Ends</div>
                    <div className="text-sm font-mono font-bold text-white">
                      {endTime ? format(new Date(endTime), "MMM d, HH:mm") : "--:--"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
