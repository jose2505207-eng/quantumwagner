"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Market,
  MarketCategory,
  MarketCategoryLabels,
  MarketStatus,
} from "@/app/types";
import { useMarketStore } from "@/store/marketStore";
import toast from "react-hot-toast";
import { Label } from "../ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function ActiveMarkets() {
  const [filterCategory, setFilterCategory] = useState("ALL");
  const { markets, setMarkets } = useMarketStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Market | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  // Fetch markets
  const fetchMarkets = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/markets", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) setMarkets(res.data.markets);
    } catch (err) {
      toast.error(`Failed to fetch markets ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarket = async (id: string, data: Partial<Market>) => {
    try {
      await axios
        .put(`http://localhost:8000/api/admin/markets/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          toast.success(`${editing?.question} updated successfully`);
        })
        .catch((err) => {
          toast.error(`${editing?.question} failed to update ${err}`);
        });
      fetchMarkets();
    } catch (err) {
      console.error("Failed to update market:", err);
    }
  };

  const handleCancelMarket = async (id: string) => {
    try {
      await axios
        .delete(`http://localhost:8000/api/admin/markets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          toast.success("market deleted successfully");
        })
        .catch((err) => {
          toast.error(`market faild to delete ${err} `);
        });
      fetchMarkets();
    } catch (err) {
      console.error("Failed to cancel market:", err);
    }
  };

  const filteredMarkets =
    filterCategory === "ALL"
      ? markets.filter((m) => m.status !== MarketStatus.CANCELLED)
      : markets.filter(
          (m) =>
            m.category === filterCategory && m.status !== MarketStatus.CANCELLED
        );

  return (
    <Card className="border border-border bg-black/30 backdrop-blur-xl">
      {/* Filter Markets */}
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Active Markets</CardTitle>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {Object.values(MarketCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {MarketCategoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* market lists */}
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading markets...</p>
        ) : filteredMarkets.length === 0 ? (
          <p className="text-muted-foreground">No markets found.</p>
        ) : (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-3">
              {filteredMarkets.map((market) => (
                <div
                  key={market.id}
                  className="p-3 rounded-lg border border-border bg-muted/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                >
                  <div>
                    <p className="text-sm font-medium">{market.question}</p>
                    <p className="text-xs text-muted-foreground">
                      {market.category} | Created{" "}
                      {new Date(market.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ends {new Date(market.end_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Edit */}

                    <Sheet open={open} onOpenChange={setOpen}>
                      <SheetTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(market)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="bg-black/40 backdrop-blur-xl"
                      >
                        <SheetHeader>
                          <SheetTitle>Edit Market</SheetTitle>
                        </SheetHeader>

                        {editing && (
                          <form
                            className="space-y-4 mt-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (editing?.id) {
                                handleUpdateMarket(editing.id, {
                                  question: editing.question,
                                  description: editing.description,
                                  category: editing.category,
                                  end_time: editing.end_time, // always included
                                  oracle_source: editing.oracle_source, // always included
                                  oracle_config: editing.oracle_config || "",
                                  resolution_criteria:
                                    editing.resolution_criteria || "",
                                  status: editing.status,
                                });
                                setEditing(null);
                                setOpen(false);
                              }
                            }}
                          >
                            {/* Editable fields only */}
                            <Label>Question</Label>
                            <Input
                              placeholder="Question"
                              value={editing.question || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  question: e.target.value,
                                })
                              }
                            />

                            <Label>Description</Label>
                            <Textarea
                              placeholder="Description"
                              value={editing.description || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  description: e.target.value,
                                })
                              }
                            />

                            <Label>Category</Label>
                            <Select
                              value={editing.category}
                              onValueChange={(val) =>
                                setEditing({
                                  ...editing,
                                  category: val as MarketCategory,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder=" Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(MarketCategory).map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {MarketCategoryLabels[cat]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Label>Resolution Criteria</Label>
                            <Textarea
                              placeholder="Resolution Criteria"
                              value={editing.resolution_criteria || ""}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  resolution_criteria: e.target.value,
                                })
                              }
                            />

                            <Label>Status</Label>
                            <Select
                              value={editing.status}
                              onValueChange={(val) =>
                                setEditing({
                                  ...editing,
                                  status: val as Market["status"],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={MarketStatus.ACTIVE}>
                                  Active
                                </SelectItem>
                                <SelectItem value={MarketStatus.RESOLVED}>
                                  RESOLVED
                                </SelectItem>
                                <SelectItem value={MarketStatus.CANCELLED}>
                                  CANCELLED
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Button type="submit" className="w-full">
                              Save Changes
                            </Button>
                          </form>
                        )}
                      </SheetContent>
                    </Sheet>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action{" "}
                            <span className="font-bold text-red-700">
                              cannot be undone
                            </span>
                            . This will permanently delete the market{" "}
                            <span className="italic">{market.question}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelMarket(market.id)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
