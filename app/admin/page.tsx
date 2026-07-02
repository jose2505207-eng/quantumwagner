"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Loader2,
  Copy,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Stats from "@/components/admin/Stats";
import CreateMarkets from "@/components/admin/CreateMarket";
import ActiveMarkets from "@/components/admin/ActiveMarkets";
import OracleSettleStats from "@/components/admin/OracleSettleStats";
import { useMarketStore } from "@/store/adminMarketStore";
import { useUserStore } from "@/store/userInfo";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "User Management", icon: Users },
  { name: "Oracle Stats", icon: Activity },
];

interface AdminUserRow {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
  xp: number;
  level: number;
  predictions: number;
}

export default function AdminDashboard() {
  const { markets } = useMarketStore();
  const { userInfo } = useUserStore();
  const [active, setActive] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // The page shell needs a signed-in session; every sensitive action on it
  // (user list, market resolve, oracle settle) is additionally gated by the
  // server-side ADMIN_RESOLUTION_KEY, which is the real authority.
  if (!userInfo)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  const fetchUsers = async () => {
    if (!adminKey.trim()) {
      toast.error("Enter the admin key");
      return;
    }
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        withCredentials: true,
        headers: { "x-admin-key": adminKey.trim() },
      });
      setUsers(res.data?.data?.users ?? []);
    } catch (err) {
      const error = err as { response?: { status?: number } };
      toast.error(
        error.response?.status === 403
          ? "Invalid admin key"
          : "Failed to fetch users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent text-foreground mt-20">
      {/* Sidebar */}
      <aside
        className="
        fixed md:static bottom-0 md:top-0 left-0
        w-full md:w-56
        h-16 md:h-screen
        bg-black/30 backdrop-blur-xl
        border-t md:border-t-0 md:border-r border-border
        flex md:flex-col
        justify-around md:justify-start
        items-center md:items-start
        px-2 md:px-4 py-2
        z-20"
      >
        {navItems.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            onClick={() => setActive(name)}
            variant={active === name ? "default" : "ghost"}
            className={`flex flex-col md:flex-row items-center justify-center md:justify-start
              w-16 md:w-full h-full md:h-auto mt-4
              p-1 md:py-2 md:px-2 rounded-lg transition-all duration-200
              ${
                active === name
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden md:inline ml-2">{name}</span>
          </Button>
        ))}
      </aside>

      {/* Main */}
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

        {active === "Oracle Stats" && <OracleSettleStats />}

        {active === "User Management" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              User Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Overview of all registered users. Requires the admin key.
            </p>

            {/* Admin key + search */}
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-2">
              <Input
                type="password"
                placeholder="Admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full sm:w-60"
              />
              <Button onClick={fetchUsers} disabled={loadingUsers}>
                {loadingUsers ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Load users"
                )}
              </Button>
              <Input
                placeholder="Search by User ID or Wallet"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60"
              />
            </div>

            {/* User Table */}
            <div className="w-full mx-auto rounded-lg border border-gray-800 bg-black/20 backdrop-blur-md shadow-xl p-3 overflow-hidden">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">
                  No users loaded. Enter the admin key and press “Load users”.
                </p>
              ) : (
                <>
                  {/* Desktop / Tablet View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse">
                      <thead className="bg-gray-800 text-gray-200">
                        <tr>
                          <th className="px-4 py-2 whitespace-nowrap">ID</th>
                          <th className="px-4 py-2 whitespace-nowrap">Wallet</th>
                          <th className="px-4 py-2">Username</th>
                          <th className="px-4 py-2">XP</th>
                          <th className="px-4 py-2">Level</th>
                          <th className="px-4 py-2">Predictions</th>
                          <th className="px-4 py-2 whitespace-nowrap">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const highlight =
                            searchTerm &&
                            (u.id
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                              u.wallet_address
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()));
                          const createdAt = format(
                            new Date(u.created_at),
                            "PPpp"
                          );

                          return (
                            <tr
                              key={u.id}
                              className="border-t border-gray-700 hover:bg-gray-900 transition-all"
                            >
                              <td className="px-4 py-2 min-w-[80px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`truncate ${
                                      highlight
                                        ? "bg-yellow-200 text-black px-1 rounded"
                                        : ""
                                    }`}
                                  >
                                    {u.id.slice(0, 6)}...{u.id.slice(-4)}
                                  </span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(u.id, "ID copied")
                                    }
                                    className="p-1 rounded hover:bg-gray-700"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-2 min-w-[100px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`truncate ${
                                      highlight
                                        ? "bg-yellow-200 text-black px-1 rounded"
                                        : ""
                                    }`}
                                  >
                                    {u.wallet_address.slice(0, 6)}...
                                    {u.wallet_address.slice(-4)}
                                  </span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        u.wallet_address,
                                        "Wallet copied"
                                      )
                                    }
                                    className="p-1 rounded hover:bg-gray-700"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                {u.username ?? "—"}
                              </td>
                              <td className="px-4 py-2 text-yellow-400 font-semibold">
                                {u.xp}
                              </td>
                              <td className="px-4 py-2">{u.level}</td>
                              <td className="px-4 py-2">{u.predictions}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {createdAt}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="block md:hidden space-y-3">
                    {filteredUsers.map((u) => {
                      const createdAt = format(new Date(u.created_at), "PPpp");
                      return (
                        <div
                          key={u.id}
                          className="border border-gray-700 rounded-lg bg-gray-900 p-3 space-y-2 overflow-hidden"
                        >
                          <div className="flex justify-between text-xs">
                            <span>ID: {u.id.slice(0, 8)}...</span>
                            <button
                              onClick={() => copyToClipboard(u.id, "ID copied")}
                              className="hover:text-yellow-400"
                            >
                              <Copy className="w-4 h-4 inline" />
                            </button>
                          </div>

                          <div className="flex justify-between text-xs">
                            <span>
                              Wallet: {u.wallet_address.slice(0, 8)}...
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  u.wallet_address,
                                  "Wallet copied"
                                )
                              }
                              className="hover:text-yellow-400"
                            >
                              <Copy className="w-4 h-4 inline" />
                            </button>
                          </div>

                          <div className="text-xs space-y-1">
                            <p>Username: {u.username ?? "—"}</p>
                            <p>
                              XP: <span className="text-yellow-400">{u.xp}</span>
                            </p>
                            <p>Level: {u.level}</p>
                            <p>Predictions: {u.predictions}</p>
                            <p>Created: {createdAt}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
