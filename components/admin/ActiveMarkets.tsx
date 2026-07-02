"use client";

import { Gavel, Trash2 } from "lucide-react";
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
import { BACKEND_URL } from "@/config";
import { PublicKey } from "@solana/web3.js";
import {
  Market,
  MarketCategory,
  MarketCategoryLabels,
  MarketStatus,
} from "@/app/types";
import Methods from "@/app/utils/methods";
import { useMarkets } from "../helper/fetchMarkets";

export default function ActiveMarkets() {
  const [filterCategory, setFilterCategory] = useState("ALL");
  const { markets } = useMarketStore();
  const { fetchMarkets } = useMarkets();
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(
    null
  );
  const [adminKey, setAdminKey] = useState("");
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const { cancelMarket, settleMarket } = Methods();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMarkets();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    setLoading(true);
    await fetchMarkets();
    setLoading(false);
  };

  /**
   * Resolve a market: settle on-chain first (only when it has a PDA), then let
   * the server-side oracle record the resolution + pay out predictions. The
   * server is the authority — it requires the ADMIN_RESOLUTION_KEY.
   */
  const handleResolveMarket = async (market: Market, outcome: "YES" | "NO") => {
    if (!adminKey.trim()) {
      toast.error("Enter the admin key");
      return;
    }
    try {
      setLoading(true);

      if (market.pda) {
        await settleMarket(new PublicKey(market.pda), outcome === "YES");
        toast.success(`Market settled on-chain (${outcome})`);
      }

      await axios.post(
        `${BACKEND_URL}/api/markets/${market.id}/resolve`,
        { outcome, source: "admin", adminKey: adminKey.trim() },
        { withCredentials: true }
      );
      toast.success(`${market.question} resolved (${outcome})`);

      await refresh();
    } catch (err) {
      console.error("handleResolveMarket failed:", err);
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || `${err}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel a market on-chain; `cancelMarket` records the confirmed
   * cancellation to the backend itself (POST /api/markets/[pda]/cancel).
   */
  const handleCancelMarket = async (market: Market) => {
    try {
      setLoading(true);
      setConfirmText("");
      if (!market.pda) {
        toast.error("Market has no on-chain PDA to cancel");
        return;
      }
      await cancelMarket(new PublicKey(market.pda));
      toast.success("Market cancelled");
      await refresh();
    } catch (err) {
      console.error("Failed to cancel market:", err);
      toast.error(`Failed to cancel market: ${err}`);
    } finally {
      setLoading(false);
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
                    {/* Resolve */}
                    {market.status === MarketStatus.ACTIVE && (
                      <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setResolving(market);
                              setSelectedOutcome(null);
                            }}
                          >
                            <Gavel className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side="right"
                          className="bg-black/40 backdrop-blur-xl"
                        >
                          <SheetHeader>
                            <SheetTitle>Resolve Market</SheetTitle>
                          </SheetHeader>

                          {resolving && (
                            <form
                              className="space-y-4 mt-4"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!selectedOutcome) {
                                  toast.error("Select an outcome");
                                  return;
                                }
                                handleResolveMarket(resolving, selectedOutcome);
                                setResolving(null);
                                setSelectedOutcome(null);
                                setOpen(false);
                              }}
                            >
                              <p className="text-sm">{resolving.question}</p>

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

                              <Label>Admin key</Label>
                              <Input
                                type="password"
                                placeholder="Admin resolution key"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                              />

                              <Button type="submit" className="w-full">
                                Resolve Market
                              </Button>
                            </form>
                          )}
                        </SheetContent>
                      </Sheet>
                    )}

                    {/* Cancel */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Market</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action
                            <span className="font-bold text-red-700">
                              {" "}
                              cannot be undone
                            </span>
                            . <br />
                            To confirm cancelling
                            <span className="italic"> {market.question}</span>,
                            please type{" "}
                            <code className="px-1 py-0.5 bg-muted rounded">
                              cancel market
                            </code>{" "}
                            below.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        {/* Input field for confirmation */}
                        <div className="mt-4">
                          <Input
                            placeholder="Type 'cancel market' to confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                          />
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Back</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={confirmText !== "cancel market"}
                            onClick={() => handleCancelMarket(market)}
                          >
                            Cancel Market
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
