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
import axios from "axios";
import { useEffect, useState } from "react";
import { useMarkets } from "../helper/fetchMarkets";
import toast from "react-hot-toast";
import { MarketCategory, MarketCategoryLabels } from "@/app/types";
import { Switch } from "../ui/switch";
import { BACKEND_URL } from "@/config";
import Methods from "@/app/contract_methods/methods";
import * as anchor from "@coral-xyz/anchor";

export default function CreateMarkets() {
  const { fetchMarkets } = useMarkets();
  const { initMarket } = Methods();

  const [days, setDays] = useState("0");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [endTime, setEndTime] = useState<string | null>(null);

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

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/markets`,
        { ...form, end_time: endTime },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const tx = await initMarket({
        questionId: `${res.data.market.id}`,
        category: { price: {} },
        durationSeconds: new anchor.BN(
          parseInt(days) * 86400 +
            parseInt(hours) * 3600 +
            parseInt(minutes) * 60
        ),
        minBetAmount: new anchor.BN(100_000_000), // 0.1 sol
        tags: ["ETH", "Price"],
        imageUrl: null,
      });

      await axios.put(
        `${BACKEND_URL}/api/admin/markets/${res.data.market.id}`,
        { pda: tx },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
      console.error(err);
      toast.error("Market creation failed");
    }
  };

  return (
    <Card className="border border-border bg-black/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Create New Market</CardTitle>
      </CardHeader>
      <CardContent>
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

          <div className="space-y-2">
            <Label>Market Duration (max 7 days)</Label>
            <div className="flex justify-between space-x-2">
              {/* Days Picker */}
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

              {/* Hours Picker */}
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

              {/* Minutes Picker */}
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
          >
            + Create Market
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
