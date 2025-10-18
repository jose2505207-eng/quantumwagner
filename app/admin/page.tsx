"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Stats from "@/components/admin/Stats";
import CreateMarkets from "@/components/admin/CreateMarket";
import ActiveMarkets from "@/components/admin/ActiveMarkets";
import { useMarketStore } from "@/store/adminMarketStore";
import { useUserStore } from "@/store/userInfo";
import { notFound } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "User Management", icon: Users },
];

export default function AdminDashboard() {
  const { markets } = useMarketStore();
  const { userInfo } = useUserStore();
  const [active, setActive] = useState("Dashboard");

  if (!userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasAccess =
    userInfo.user.is_verified === true && userInfo.user.kyc_level >= 3;
  if (!hasAccess) notFound();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent text-foreground mt-20">
      {/* Sidebar for desktop / Bottom nav for mobile */}
      <aside
  className="
    fixed md:static
    bottom-0 md:top-0 left-0
    w-full md:w-56
    h-16 md:h-screen
    bg-black/30 backdrop-blur-xl
    border-t md:border-t-0 md:border-r border-border
    flex md:flex-col
    justify-around md:justify-start
    items-center md:items-start
    px-2 md:px-4 py-2
    z-20
  "
>
  {navItems.map(({ name, icon: Icon }, index) => (
    <Button
      key={name}
      onClick={() => setActive(name)}
      variant={active === name ? "default" : "ghost"}
      className={`
        flex flex-col md:flex-row items-center justify-center md:justify-start
        w-16 md:w-full h-full md:h-auto
        mt-4
        p-1 md:py-2 md:px-2
        rounded-lg
        ${active === name
          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
          : "hover:bg-accent hover:text-accent-foreground"}
      `}
    >
      <Icon className="w-5 h-5 md:w-5 md:h-5" />
      <span className="hidden md:inline ml-2">{name}</span>
    </Button>
  ))}
</aside>


    <main className="flex-1 p-4 pb-20 md:pb-4">
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
                  <td className="px-4 py-2">cmfvmcuue0000{i}kdwuolrconz</td>
                  <td className="px-4 py-2">DSLmuCuSAWxXXemQttwyUJTE{i}…</td>
                  <td className="px-4 py-2 font-semibold text-yellow-400">1000</td>
                  <td className="px-4 py-2">{(Math.random() * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2">{Math.floor(Math.random() * 50)}</td>
                  <td className="px-4 py-2">{Math.floor(Math.random() * 50)}</td>
                  <td className={`px-4 py-2 font-semibold ${isVerified ? "text-green-400" : "text-red-400"}`}>
                    {isVerified ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">{Math.floor(Math.random() * 5) + 1}</td>
                  <td className="px-4 py-2">{new Date(createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )}
</main>

    </div>
  );
}
