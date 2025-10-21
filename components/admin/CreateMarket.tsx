"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import axios from "axios";
import { useEffect, useState } from "react";
import { useMarkets } from "../helper/fetchMarkets";
import toast from "react-hot-toast";
import { Switch } from "../ui/switch";
import { BACKEND_URL } from "@/config";
import Methods from "@/app/contract_methods/methods";
import * as anchor from "@coral-xyz/anchor";
import { MarketCategory, MarketCategoryLabels } from "@/app/types";

export default function CreateMarkets() {
  const { fetchMarkets } = useMarkets();
  const { initMarket } = Methods();

  const [days, setDays] = useState("0");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [endTime, setEndTime] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<number>(0); // 0-3
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    question: "",
    description: "",
    category: MarketCategory.CRYPTO,
    end_time: new Date().toISOString(),
    oracle_source: "Binance",
    oracle_config: "",
    resolution_criteria: "",
    featured: false,
    pda: "",
  });

  useEffect(() => {
    fetchMarkets();
  }, []);

  useEffect(() => {
    const d = parseInt(days);
    const h = parseInt(hours);
    const m = parseInt(minutes);
    const totalMinutes = d * 1440 + h * 60 + m;

    if (totalMinutes > 0) {
      if (totalMinutes > 7 * 24 * 60) {
        toast.error("Max market duration is 7 days");
        setDays("7");
        setHours("0");
        setMinutes("0");
        return;
      }
      const newEnd = new Date(Date.now() + totalMinutes * 60 * 1000);
      setEndTime(newEnd.toISOString());
    }
  }, [days, hours, minutes]);

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endTime) {
      toast.error("Please set market duration");
      return;
    }

    let marketId = "";
    let pda = "";

    try {
      setIsCreating(true);
      setProgressStep(1); // Step 1: Backend creation

      // 1️ Create market on backend
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/markets`,
        { ...form, end_time: endTime },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      marketId = res.data.market.id; // store id in case rollback needed
      setProgressStep(2); // Step 2: Contract initialization

      // 2️ Initialize contract
      const tx = await initMarket({
        questionId: `${marketId}`,
        category: { price: {} },
        durationSeconds: new anchor.BN(
          parseInt(days) * 86400 +
            parseInt(hours) * 3600 +
            parseInt(minutes) * 60
        ),
        minBetAmount: new anchor.BN(100_000_000),
        tags: ["ETH", "Price"],
        imageUrl: null,
      });

      console.log("tx", tx);

      pda = tx!.toString();
      setProgressStep(3); // Step 3: Update backend with contract

      // 3️ Update backend with PDA
      await axios.put(
        `${BACKEND_URL}/api/admin/markets/${marketId}`,
        { pda },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setProgressStep(4); // Finished
      toast.success("Market created successfully");

      fetchMarkets();
      setForm({
        question: "",
        description: "",
        category: MarketCategory.CRYPTO,
        end_time: new Date().toISOString(),
        oracle_source: "Binance",
        oracle_config: "",
        resolution_criteria: "",
        featured: false,
        pda: "",
      });
      setDays("0");
      setHours("0");
      setMinutes("0");
    } catch (err) {
      console.error("Market creation failed:", err);
      toast.error("Market creation failed, rolling back...");

      // Rollback if market created on backend
      if (marketId) {
        try {
          await axios.delete(`${BACKEND_URL}/api/admin/markets/${marketId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          toast.error("Market rolled back successfully");
        } catch (rollbackErr) {
          console.error("Rollback failed:", rollbackErr);
          toast.error("Failed to rollback market. Manual deletion needed.");
        }
      }
      setProgressStep(0);
    } finally {
      setIsCreating(false);
    }
  };

  const progressLabel = [
    "Waiting",
    "Creating Backend",
    "Initializing Contract",
    "Updating Backend",
    "Done",
  ];

  return (
    <Card className="border border-border bg-black/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Create New Market</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleCreateMarket}>
          {/* Market Question */}
          <Label>Market Question</Label>
          <Input
            required
            placeholder="Will ETH be above $3k?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />

          {/* Description */}
          <Label>Description (Optional)</Label>
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Category */}
          <Select
            required
            value={form.category}
            onValueChange={(val) =>
              setForm({ ...form, category: val as MarketCategory })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MarketCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {MarketCategoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Market Duration (max 7 days)</Label>
            <div className="flex justify-between space-x-2">
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Days" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}d
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hours" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Minutes" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}m
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {endTime && (
              <p className="text-xs text-gray-400">
                Ends on: {new Date(endTime).toLocaleString()}
              </p>
            )}
          </div>

          {/* Resolution Criteria */}
          <Input
            required
            placeholder="Resolution Criteria"
            value={form.resolution_criteria}
            onChange={(e) =>
              setForm({ ...form, resolution_criteria: e.target.value })
            }
          />

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <Switch
              checked={form.featured}
              onCheckedChange={(val) => setForm({ ...form, featured: val })}
            />
            <Label className="text-white">Mark as Featured</Label>
          </div>

          {/* Progress Bar */}
          {isCreating && (
            <div className="space-y-1">
              <Label>{progressLabel[progressStep]}</Label>
              <Progress value={(progressStep / 4) * 100} />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
            disabled={isCreating}
          >
            + Create Market
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
