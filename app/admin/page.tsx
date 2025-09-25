"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/SideBar";
import ActiveMarkets from "@/components/admin/ActiveMarkets";
import CreateMarkets from "@/components/admin/CreateMarket";
import Stats from "@/components/admin/Stats";
import { useMarketStore } from "@/store/marketStore";

export default function AdminDashboard() {
  const { markets } = useMarketStore();
  const [active, setActive] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

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

  return (
    <div className="min-h-screen flex bg-transparent text-foreground">
      {/* Main */}

      {/* Admin Sidebar */}
      <AdminSidebar
        active={active}
        onChangeActive={setActive}
        mobileMenu={mobileMenu}
        onChangeMobileMenu={setMobileMenu}
      />

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
                  : `Upcoming ${active}`}
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

            <Stats markets={markets} />

            {/* Create + Active markets */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create */}
              <CreateMarkets />
              {/* Active Markets */}
              <ActiveMarkets />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
