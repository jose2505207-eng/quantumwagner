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
import { Calendar28 } from "../custom/Calender28";
import { Button } from "../ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useMarkets } from "../helper/fetchMarkets";
import toast from "react-hot-toast";
import { MarketCategory, MarketCategoryLabels } from "@/app/types";
import { Switch } from "../ui/switch"; 
import { BACKEND_URL } from "@/config";

export default function CreateMarkets() {
  const { fetchMarkets } = useMarkets();
  const [endTime, setEndTime] = useState<string | undefined>();

  const [form, setForm] = useState({
    question: "",
    description: "",
    category: MarketCategory.CRYPTO,
    end_time: new Date().toISOString(),
    oracle_source: "Binance", // todo
    oracle_config: "", // todo
    resolution_criteria: "",
    featured: false, // ✅ initially false
  });

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!endTime) {
        toast.error("enter date for market");
        return;
      }

      await axios
        .post(
          `${BACKEND_URL}/api/admin/markets`,
          { ...form, end_time: endTime },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => {
          toast.success(`${form.question} Market created successfully`);
        })
        .catch((err) => {
          toast.error(`${form.question} Market creation failed ${err}`);
        });

      setForm({
        question: "",
        description: "",
        category: MarketCategory.CRYPTO,
        end_time: new Date().toISOString(),
        oracle_source: "Binance API",
        oracle_config: "",
        resolution_criteria: "",
        featured: false,
      });
      fetchMarkets();
    } catch (err) {
      console.error("Failed to create market:", err);
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
          <Label htmlFor="marketQuestion">
            What question should this market ask?
          </Label>
          <Input
            required
            placeholder="Market Question"
            id="marketQuestion"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />

          {/* Description */}
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
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

          {/* End Time */}
          <Calendar28
            onChange={(iso) => {
              setEndTime(iso);
            }}
          />

          {/* Resolution Criteria */}
          <Input
            required
            placeholder="Resolution Criteria"
            value={form.resolution_criteria}
            onChange={(e) =>
              setForm({
                ...form,
                resolution_criteria: e.target.value,
              })
            }
          />

          {/* Featured Toggle  */}
          <div className="flex items-center space-x-3 pt-2">
            <Switch
              checked={form.featured}
              onCheckedChange={(val) => setForm({ ...form, featured: val })}
            />
            <Label className="text-white">Mark as Featured</Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white cursor-pointer"
          >
            + Create Market
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
