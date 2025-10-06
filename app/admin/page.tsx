"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Settings,
  Download,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Stats from "@/components/admin/Stats";
import CreateMarkets from "@/components/admin/CreateMarket";
import ActiveMarkets from "@/components/admin/ActiveMarkets";
import { useMarketStore } from "@/store/adminMarketStore";
import { useUserStore } from "@/store/userInfo";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "User Management", icon: Users },
  // { name: "Reports", icon: FileText },
  // { name: "Moderation", icon: ShieldCheck },
  // { name: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  const { markets } = useMarketStore();
  const { userInfo } = useUserStore();
  const [active, setActive] = useState("Dashboard");

  // Export markets
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

  // Loading state
  if (!userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Permission check
  const hasAccess =
    userInfo.user.is_verified === true && userInfo.user.kyc_level >= 3;

  if (!hasAccess) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-foreground pt-24">
      {/* Top Nav */}
      <header className="border-b border-border bg-black/30 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        {/* <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
          Admin Command
        </h1> */}

        <nav className="flex space-x-2">
          {navItems.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              onClick={() => setActive(name)}
              variant={active === name ? "default" : "ghost"}
              className={`flex items-center gap-2 px-3 ${
                active === name
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{name}</span>
            </Button>
          ))}
        </nav>

        <Button
          onClick={handleExport}
          className="bg-gradient-to-r from-purple-600 to-fuchsia-600"
        >
          <Download className="w-4 h-4 mr-2 text-white" />
          <span className="hidden sm:inline text-white">Export Data</span>
        </Button>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6 overflow-x-hidden">
        {active === "Dashboard" && (
          <div className="space-y-6">
            <Stats markets={markets} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateMarkets />
              <ActiveMarkets />
            </div>
          </div>
        )}

        {active === "User Management" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              User Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Overview of all registered users.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-700 rounded-lg overflow-hidden text-left text-sm">
                <thead className="bg-gray-800 text-gray-200">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Wallet Address</th>
                    <th className="px-4 py-2">Reputation</th>
                    <th className="px-4 py-2">Win Rate</th>
                    <th className="px-4 py-2">Total Predictions</th>
                    <th className="px-4 py-2">Correct Predictions</th>
                    <th className="px-4 py-2">Verified</th>
                    <th className="px-4 py-2">KYC Level</th>
                    <th className="px-4 py-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => {
                    // Simulate random user data
                    const isVerified = Math.random() > 0.2;
                    const createdAt = new Date(
                      Date.now() - Math.floor(Math.random() * 1000000000)
                    ).toISOString();

                    return (
                      <tr
                        key={i}
                        className={`border-t border-gray-700 hover:bg-gray-900 ${
                          isVerified ? "bg-black/20" : ""
                        }`}
                      >
                        <td className="px-4 py-2">
                          cmfvmcuue0000{i}kdwuolrconz
                        </td>
                        <td className="px-4 py-2">
                          DSLmuCuSAWxXXemQttwyUJTE{i}…
                        </td>
                        <td className="px-4 py-2 font-semibold text-yellow-400">
                          {1000}
                        </td>
                        <td className="px-4 py-2">
                          {(Math.random() * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-2">
                          {Math.floor(Math.random() * 50)}
                        </td>
                        <td className="px-4 py-2">
                          {Math.floor(Math.random() * 50)}
                        </td>
                        <td
                          className={`px-4 py-2 font-semibold ${
                            isVerified ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isVerified ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2">
                          {Math.floor(Math.random() * 5) + 1}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "Reports" && (
          <div className="text-muted-foreground">Reports section…</div>
        )}
        {active === "Moderation" && (
          <div className="text-muted-foreground">Moderation tools…</div>
        )}
        {active === "Settings" && (
          <div className="text-muted-foreground">Settings page…</div>
        )}
      </main>
    </div>
  );
}
