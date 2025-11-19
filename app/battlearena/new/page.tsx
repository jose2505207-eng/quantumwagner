"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Swords } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Methods from "@/app/utils/methods";
import { useAllTokens } from "@/app/utils/useAllTokens";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

/* -------------------------------------------------------
   TOKEN SELECTOR (INLINE)
------------------------------------------------------- */
function TokenSelector({ label, selected, setSelected, allToken, loading }) {
  return (
    <div>
      <label className="text-sm text-neutral-300">{label}</label>

      <Popover>
        <PopoverTrigger
          className={`mt-1 w-full flex items-center justify-between rounded-md 
            bg-black/30 border px-3 py-2 
            ${selected ? "border-green-500" : "border-white/10"}`}
        >
          {selected
            ? allToken?.find((t) => t.account.tokenMint === selected)?.account
                ?.name
            : "Select Token"}
        </PopoverTrigger>

        <PopoverContent className="w-[270px] p-0 bg-black/70 border border-white/10 rounded-lg">
          <Command>
            <CommandInput placeholder="Search token..." />
            <CommandEmpty>No tokens found.</CommandEmpty>

            <CommandList>
              <CommandGroup>
                {!loading &&
                  allToken?.map((t) => (
                    <CommandItem
                      key={t.publicKey}
                      onSelect={() => setSelected(t.account.tokenMint)}
                      className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/10"
                    >
                      <img
                        src={t.account.imageUri}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>
                        {t.account.name} ({t.account.symbol})
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

export default function CreateBattlePage() {
  const { createBattle } = Methods();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sideAName, setSideAName] = useState("");
  const [sideBName, setSideBName] = useState("");
  const [sideAToken, setSideAToken] = useState("");
  const [sideBToken, setSideBToken] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);

  const { tokens: allToken, loading: tokenLoading } = useAllTokens();

  const minDateTime = new Date().toISOString().slice(0, 16); // disable past

  const inputClass = (val) =>
    `mt-1 bg-[#0d0d0d] border-white/10 rounded-lg 
     px-4 py-2 text-gray-200 outline-none
     focus:border-green-500 transition
     [color-scheme:dark]
     ${val ? "border-green-500" : "border-gray-700"}`;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const now = Math.floor(Date.now() / 1000);

      const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endUnix = Math.floor(new Date(endTime).getTime() / 1000);

      // VALIDATIONS
      if (!startTime || !endTime) {
        alert("Please choose start and end time");
        return;
      }

      if (startUnix <= now + 30) {
        alert("Start time must be at least 30 seconds from now.");
        return;
      }

      if (endUnix <= startUnix) {
        alert("End time must be AFTER start time.");
        return;
      }

      // Convert to BN
      const finalStart = new BN(startUnix);
      const finalEnd = new BN(endUnix);

      const { battlePDA } = await createBattle({
        title,
        description,
        sideATokens: [new PublicKey(sideAToken)],
        sideBTokens: [new PublicKey(sideBToken)],
        sideAName,
        sideBName,
        startTime: finalStart,
        endTime: finalEnd,
        metaMarketEnabled: true,
        imageUrl,
      });

      alert("Battle Created: " + battlePDA.toBase58());
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black/40 items-center justify-center p-5 text-white mt-20">
      <Card className="w-full max-w-3xl bg-black/20 p-8 border border-white/10 rounded-xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center gap-3">
            <Swords className="h-8 w-8 text-green-500" />
            <h2 className="text-3xl font-semibold">Create Battle</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Configure your prediction battle
          </p>
        </CardHeader>

        <CardContent className="space-y-7">
          {/* Title */}
          <div>
            <label className="text-sm text-neutral-300">Battle Title</label>
            <Input
              className={inputClass(title)}
              placeholder="Solana Ecosystem Clash"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-neutral-300">Description</label>
            <Input
              className={inputClass(description)}
              placeholder="Describe the battle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-neutral-300">Side A Name</label>
              <Input
                className={inputClass(sideAName)}
                placeholder="Bulls"
                value={sideAName}
                onChange={(e) => setSideAName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-300">Side B Name</label>
              <Input
                className={inputClass(sideBName)}
                placeholder="Bears"
                value={sideBName}
                onChange={(e) => setSideBName(e.target.value)}
              />
            </div>
          </div>

          {/* Tokens */}
          <div className="grid grid-cols-2 gap-6">
            <TokenSelector
              label="Side A Token"
              selected={sideAToken}
              setSelected={setSideAToken}
              allToken={allToken}
              loading={tokenLoading}
            />

            <TokenSelector
              label="Side B Token"
              selected={sideBToken}
              setSelected={setSideBToken}
              allToken={allToken}
              loading={tokenLoading}
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="text-sm text-neutral-300">Start Time</label>
            <input
              type="datetime-local"
              min={minDateTime}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass(startTime)}
            />
          </div>

          {/* End Time */}
          <div>
            <label className="text-sm text-neutral-300">End Time</label>
            <input
              type="datetime-local"
              min={startTime || minDateTime}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass(endTime)}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm text-neutral-300">Battle Image URL</label>
            <Input
              className={inputClass(imageUrl)}
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full py-3 text-md font-medium rounded-xl
              bg-[linear-gradient(90deg,#7F00FF_0%,#E100FF_50%,#FF007A_100%)]
              text-white shadow-[0_0_25px_rgba(225,0,255,0.35)]
              hover:opacity-90 transition-all
            "
          >
            {loading ? "Creating..." : "Create Battle"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
