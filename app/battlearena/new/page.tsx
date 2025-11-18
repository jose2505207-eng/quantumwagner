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
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

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

  const inputClass = (value) =>
    `mt-1 bg-black border-neutral-700 focus:border-green-500 ${
      value ? "border-green-500" : ""
    }`;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // const finalStart = new BN(
      //   Math.floor(new Date(startTime).getTime() / 1000)
      // );
      // const finalEnd = new BN(Math.floor(new Date(endTime).getTime() / 1000));

      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = new BN(currentTime + 60); // Start in 5 seconds
      const endTime = new BN(currentTime + 60 * 6); // End in 5 min

      const { battlePDA } = await createBattle({
        title,
        description,
        sideATokens: [new PublicKey(sideAToken)],
        sideBTokens: [new PublicKey(sideBToken)],
        sideAName,
        sideBName,
        // startTime: finalStart,
        // endTime: finalEnd,
        startTime,
        endTime,
        metaMarketEnabled: true,
        imageUrl,
      });

      alert("Battle Created: " + battlePDA.toBase58());
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black/40  items-center justify-center p-5 text-white mt-20">
      <Card className="w-full max-w-3xl  bg-black/ p-8">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center gap-3">
            <Swords className="h-8 w-8 text-green-500 drop-shadow-[0_0_10px_rgba(0,255,128,0.7)]" />
            <h2 className="text-3xl font-semibold tracking-wide">
              Create Battle
            </h2>
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
              className={
                inputClass(title) +
                " bg-black/30 border-white/10 focus:border-green-500"
              }
              placeholder="e.g. Solana Ecosystem Clash"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-neutral-300">Description</label>
            <Input
              className={
                inputClass(description) +
                " bg-black/30 border-white/10 focus:border-green-500"
              }
              placeholder="Describe battle purpose…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-neutral-300">Side A Name</label>
              <Input
                className={
                  inputClass(sideAName) + " bg-black/30 border-white/10"
                }
                placeholder="e.g. Bulls"
                value={sideAName}
                onChange={(e) => setSideAName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-300">Side B Name</label>
              <Input
                className={
                  inputClass(sideBName) + " bg-black/30 border-white/10"
                }
                placeholder="e.g. Bears"
                value={sideBName}
                onChange={(e) => setSideBName(e.target.value)}
              />
            </div>
          </div>

          {/* Token Selectors */}
          <div className="grid grid-cols-2 gap-6">
            {/* Side A Token */}
            <div>
              <label className="text-sm text-neutral-300">Side A Token</label>
              <Popover>
                <PopoverTrigger
                  className={`mt-1 w-full flex items-center justify-between rounded-md 
                            bg-black/30 border border-white/10 px-3 py-2 text-white
                            ${sideAToken ? "border-green-500" : ""}`}
                >
                  {sideAToken
                    ? allToken?.find((t) => t.account.tokenMint === sideAToken)
                        ?.account?.name
                    : "Select Token"}
                </PopoverTrigger>

                <PopoverContent
                  className="w-[270px] p-0 bg-black/70 backdrop-blur-xl 
                                         border border-white/10 text-white rounded-lg shadow-xl"
                >
                  <Command>
                    <CommandInput placeholder="Search token…" />
                    <CommandEmpty>No tokens found.</CommandEmpty>

                    <CommandList>
                      <CommandGroup>
                        {!tokenLoading &&
                          allToken?.map((t) => (
                            <CommandItem
                              key={t.publicKey}
                              onSelect={() =>
                                setSideAToken(t.account.tokenMint)
                              }
                              className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/10"
                            >
                              <img
                                src={t.account.imageUri}
                                className="w-6 h-6 rounded-full"
                                alt={t.account.symbol}
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

            {/* Side B Token */}
            <div>
              <label className="text-sm text-neutral-300">Side B Token</label>
              <Popover>
                <PopoverTrigger
                  className={`mt-1 w-full flex items-center justify-between rounded-md 
                            bg-black/30 border border-white/10 px-3 py-2 text-white
                            ${sideBToken ? "border-green-500" : ""}`}
                >
                  {sideBToken
                    ? allToken?.find((t) => t.account.tokenMint === sideBToken)
                        ?.account?.name
                    : "Select Token"}
                </PopoverTrigger>

                <PopoverContent
                  className="w-[270px] p-0 bg-black/70 backdrop-blur-xl 
                                         border border-white/10 text-white rounded-lg shadow-xl"
                >
                  <Command>
                    <CommandInput placeholder="Search token…" />
                    <CommandEmpty>No tokens found.</CommandEmpty>

                    <CommandList>
                      <CommandGroup>
                        {!tokenLoading &&
                          allToken?.map((t) => (
                            <CommandItem
                              key={t.publicKey}
                              onSelect={() =>
                                setSideBToken(t.account.tokenMint)
                              }
                              className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/10"
                            >
                              <img
                                src={t.account.imageUri}
                                className="w-6 h-6 rounded-full"
                                alt={t.account.symbol}
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
          </div>

          {/* Start Time */}
          <div>
            <label className="text-sm text-neutral-300">Start Time</label>
            <Input
              type="datetime-local"
              className={inputClass(startTime) + " bg-black/30 border-white/10"}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* End Time */}
          <div>
            <label className="text-sm text-neutral-300">End Time</label>
            <Input
              type="datetime-local"
              className={inputClass(endTime) + " bg-black/30 border-white/10"}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm text-neutral-300">Battle Image URL</label>
            <Input
              className={inputClass(imageUrl) + " bg-black/30 border-white/10"}
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
    text-white
    shadow-[0_0_25px_rgba(225,0,255,0.35)]
    hover:opacity-90
    transition-all duration-300
    flex items-center justify-center gap-2
  "
          >
            {loading ? "Creating..." : "Create Battle"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
