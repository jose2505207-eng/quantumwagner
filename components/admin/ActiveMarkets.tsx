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

import { useMarketStore } from "@/store/adminMarketStore";
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
import { Switch } from "../ui/switch";
import { BACKEND_URL } from "@/config";
import { PublicKey } from "@solana/web3.js";
import Methods from "@/app/contract_methods/methods";
import {
  Market,
  MarketCategory,
  MarketCategoryLabels,
  MarketStatus,
} from "@/app/types";

export default function ActiveMarkets() {
  const [filterCategory, setFilterCategory] = useState("ALL");
  const { markets, setMarkets } = useMarketStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const { cancelMarket, settleMarket } = Methods();

  useEffect(() => {
    fetchMarkets();
  }, []);

  // Fetch markets
  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/markets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) setMarkets(res.data.markets);
    } catch (err) {
      toast.error(`Failed to fetch markets ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarket = async (
    id: string,
    data: Partial<Market>,
    pda?: string,
    outcome?: "YES" | "NO"
  ) => {
    try {
      setLoading(true);
      if (data.status === "RESOLVED" && pda && outcome) {
        const outcomeBool = outcome === "YES";

        // Try settle first
        await settleMarket(new PublicKey(pda), outcomeBool);
        toast.success(`Market settled on-chain (${outcome})`);

        // Only if chain succeeded, update backend
        console.log("from admin active page ", data);

        await axios.put(`${BACKEND_URL}/api/admin/markets/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        toast.success(`${editing?.question} updated successfully`);
      } else {
        // Non-resolve status → just update backend
        await axios.put(`${BACKEND_URL}/api/admin/markets/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        toast.success(`${editing?.question} updated successfully`);
      }

      fetchMarkets();
    } catch (err) {
      console.error("handleUpdateMarket failed:", err);
      toast.error(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMarket = async (id: string, pda: string) => {
    try {
      setLoading(true);
      setConfirmText("");
      await axios
        .delete(`${BACKEND_URL}/api/admin/markets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(async () => {
          await cancelMarket(new PublicKey(`${pda}`));
          toast.success("market deleted successfully");
        })
        .catch((err) => {
          toast.error(`market faild to delete ${err} `);
        });
      fetchMarkets();
    } catch (err) {
      setLoading(false);
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
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-purple-500 rounded-full"></div>
        </div>
      )}

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
                          onClick={() => {
                            setEditing(market);
                            setSelectedOutcome(null);
                          }}
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
                                handleUpdateMarket(
                                  editing.id,
                                  {
                                    question: editing.question,
                                    description: editing.description,
                                    category: editing.category,
                                    end_time: editing.end_time,
                                    oracle_source: editing.oracle_source,
                                    oracle_config: editing.oracle_config || "",
                                    resolution_criteria:
                                      editing.resolution_criteria || "",
                                    status: editing.status,
                                    featured: editing.featured,
                                  },
                                  editing.pda,
                                  selectedOutcome || undefined
                                );
                                setEditing(null);
                                setSelectedOutcome(null);
                                setOpen(false);
                              }
                            }}
                          >
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

                            {/* ✅ Only show outcome select when status is RESOLVED */}
                            {editing.status === MarketStatus.RESOLVED && (
                              <>
                                <Label>Outcome</Label>
                                <Select
                                  value={selectedOutcome || ""}
                                  onValueChange={(val) =>
                                    setSelectedOutcome(val as "YES" | "NO")
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Outcome" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="YES">YES</SelectItem>
                                    <SelectItem value="NO">NO</SelectItem>
                                  </SelectContent>
                                </Select>
                              </>
                            )}

                            {/* Featured toggle */}
                            <div className="flex items-center space-x-3 pt-2">
                              <Switch
                                checked={editing.featured}
                                onCheckedChange={(val) =>
                                  setEditing({
                                    ...editing,
                                    featured: val,
                                  })
                                }
                              />
                              <Label className="text-white">
                                Mark as Featured
                              </Label>
                            </div>

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
                          <AlertDialogTitle>Delete Market</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action
                            <span className="font-bold text-red-700">
                              {" "}
                              cannot be undone
                            </span>
                            . <br />
                            To confirm deletion of
                            <span className="italic"> {market.question}</span>,
                            please type{" "}
                            <code className="px-1 py-0.5 bg-muted rounded">
                              delete market
                            </code>{" "}
                            below.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        {/* Input field for confirmation */}
                        <div className="mt-4">
                          <Input
                            placeholder="Type 'delete market' to confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                          />
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={confirmText !== "delete market"}
                            onClick={() =>
                              handleCancelMarket(market.id, market.pda)
                            }
                          >
                            Delete
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
