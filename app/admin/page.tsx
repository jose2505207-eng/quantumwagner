"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Settings,
  Download,
  Edit,
  Trash2,
  Menu,
  Info,
  ChevronDownIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar28 } from "@/components/ui/custom/Calender28";

interface Market {
  id: string;
  question: string;
  category: string;
  status: string;
  total_volume: string;
  created_at: string;
  end_time: string;
  _count: {
    positions: number;
    transactions: number;
  };
  market_type: "BINARY";
  fee_percentage: "0.03";
  tags: "";
  featured: false;
  image_url: "";
}

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [endTime, setEndTime] = useState<Date | undefined>();

  const [form, setForm] = useState({
    question: "",
    description: "",
    category: "Crypto",
    end_time: new Date(),
    oracle_source: "Binance API",
    oracle_config: "",
    resolution_criteria: "",
  });

  const [editing, setEditing] = useState<Market | null>(null);

  // Fetch markets
  const fetchMarkets = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/markets", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) setMarkets(res.data.markets);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMarkets();
  }, []);

  // Create market
  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/admin/markets",
        { ...form },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setForm({
        question: "",
        description: "",
        category: "Crypto",
        end_time: new Date(),
        oracle_source: "Binance API",
        oracle_config: "",
        resolution_criteria: "",
      });
      fetchMarkets();
    } catch (err) {
      console.error("Failed to create market:", err);
    }
  };

  // Update market
  const handleUpdateMarket = async (id: string, data: Partial<Market>) => {
    try {
      await axios.put(`http://localhost:8000/api/admin/markets/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchMarkets();
    } catch (err) {
      console.error("Failed to update market:", err);
    }
  };

  // Cancel market
  const handleCancelMarket = async (id: string) => {
    if (!confirm("Cancel this market?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/markets/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchMarkets();
    } catch (err) {
      console.error("Failed to cancel market:", err);
    }
  };

  // Export
  const handleExport = () => {
    const data = markets.map((m) => ({
      Question: m.question,
      Category: m.category,
      Status: m.status,
      "Created At": new Date(m.created_at).toLocaleString(),
      "Ends At": new Date(m.end_time).toLocaleString(),
      Volume: m.total_volume,
      Positions: m._count.positions,
      Transactions: m._count.transactions,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Markets");
    XLSX.writeFile(wb, "markets_export.xlsx");
  };

  const filteredMarkets =
    filterCategory === "ALL"
      ? markets
      : markets.filter((m) => m.category === filterCategory);

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "User Management", icon: Users },
    { name: "Reports", icon: FileText },
    { name: "Moderation", icon: ShieldCheck },
    { name: "Settings", icon: Settings },
  ];

  // Stats counts
  const stats = {
    active: markets.filter((m) => m.status === "active").length,
    resolved: markets.filter((m) => m.status === "resolved").length,
    cancelled: markets.filter((m) => m.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen flex bg-transparent text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col p-4 border-r border-border bg-black/30 backdrop-blur-xl">
        <h1 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
          Admin Command
        </h1>
        <nav className="space-y-2 flex-1">
          {sidebarItems.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              onClick={() => setActive(name)}
              variant={active === name ? "default" : "ghost"}
              className={`w-full justify-start ${
                active === name
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mr-2" /> {name}
            </Button>
          ))}
        </nav>
        {/* Info card bottom */}
        <Card className="mt-4 border border-border bg-black/40 backdrop-blur-xl">
          <CardContent className="p-3 flex items-center gap-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              Quantum Wager v1.2
              <br /> All systems normal
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Sidebar (mobile via sheet) */}
      <Sheet open={mobileMenu} onOpenChange={setMobileMenu}>
        <SheetContent side="left" className="w-64 bg-black/30 backdrop-blur-xl">
          <SheetHeader>
            <SheetTitle className="bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
              Admin Command
            </SheetTitle>
          </SheetHeader>
          <nav className="space-y-2 mt-6">
            {sidebarItems.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                onClick={() => {
                  setActive(name);
                  setMobileMenu(false);
                }}
                variant={active === name ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="w-5 h-5 mr-2" /> {name}
              </Button>
            ))}
          </nav>
          <Card className="mt-6 border border-border bg-black/40 backdrop-blur-xl">
            <CardContent className="p-3 flex items-center gap-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                Quantum Wager v1.2
                <br /> All systems normal
              </div>
            </CardContent>
          </Card>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <main className="flex-1 p-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                {active}
              </h2>
              <p className="text-sm text-muted-foreground">
                {active === "Dashboard"
                  ? "Control the pulse of Quantum Wager markets"
                  : `Viewing ${active}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenu(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <Button
            onClick={handleExport}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-fuchsia-600"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Data</span>
          </Button>
        </div>

        {/* Dashboard */}
        {active === "Dashboard" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-black/30 backdrop-blur-xl border border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Active Markets</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-green-400">
                  {stats.active}
                </CardContent>
              </Card>
              <Card className="bg-black/30 backdrop-blur-xl border border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Resolved Markets</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-blue-400">
                  {stats.resolved}
                </CardContent>
              </Card>
              <Card className="bg-black/30 backdrop-blur-xl border border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Cancelled Markets</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-red-400">
                  {stats.cancelled}
                </CardContent>
              </Card>
            </div>

            {/* Create + Active markets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create */}
              <Card className="border border-border bg-black/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Create New Market</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateMarket}>
                    <Label htmlFor="marketQuestion">
                      Enter Question to create market
                    </Label>
                    <Input
                      placeholder="Market Question"
                      id="marketQuestion"
                      value={form.question}
                      onChange={(e) =>
                        setForm({ ...form, question: e.target.value })
                      }
                    />
                    <Label htmlFor="description">
                      {" "}
                      {"Description ( Optional )"}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />

                    <Select
                      value={form.category}
                      onValueChange={(val) =>
                        setForm({ ...form, category: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Stocks">Stocks</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>

                    <Calendar28
                      onChange={(iso, dateObj) => {
                        console.log("Selected ISO:", iso);
                        console.log("Selected Date object:", dateObj);
                        setEndTime(dateObj);
                      }}
                    />

                    <pre className="mt-4 text-sm">
                      {JSON.stringify({ end_time: endTime }, null, 2)}
                    </pre>

                    <Input
                      placeholder="Resolution Criteria"
                      value={form.resolution_criteria}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          resolution_criteria: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600"
                    >
                      + Create Market
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Markets */}
              <Card className="border border-border bg-black/30 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Active Markets</CardTitle>
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Stocks">Stocks</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
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
                              <p className="text-sm font-medium">
                                {market.question}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {market.category} | Created{" "}
                                {new Date(market.created_at).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ends{" "}
                                {new Date(market.end_time).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {/* Edit */}
                              <Sheet>
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
                                        handleUpdateMarket(editing.id, editing);
                                        setEditing(null);
                                      }}
                                    >
                                      <Input
                                        value={editing.question}
                                        onChange={(e) =>
                                          setEditing({
                                            ...editing,
                                            question: e.target.value,
                                          })
                                        }
                                      />
                                      <Textarea
                                        value={editing.status}
                                        onChange={(e) =>
                                          setEditing({
                                            ...editing,
                                            status: e.target.value,
                                          })
                                        }
                                      />
                                      <Button type="submit" className="w-full">
                                        Save Changes
                                      </Button>
                                    </form>
                                  )}
                                </SheetContent>
                              </Sheet>

                              {/* Delete */}
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleCancelMarket(market.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
