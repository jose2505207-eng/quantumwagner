"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Loader2, Copy, Edit2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Stats from "@/components/admin/Stats";
import CreateMarkets from "@/components/admin/CreateMarket";
import ActiveMarkets from "@/components/admin/ActiveMarkets";
import OracleSettleStats from "@/components/admin/OracleSettleStats";
import { useMarketStore } from "@/store/adminMarketStore";
import { useUserStore } from "@/store/userInfo";
import { notFound } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import toast from "react-hot-toast";
import { User } from "@/store/types/admin/userInfo";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Methods from "../utils/methods";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "User Management", icon: Users },
  { name: "Oracle Stats", icon: Activity },
];

export default function AdminDashboard() {
  const { markets, allUsersInfo, setAllUserInfo } = useMarketStore();
  const { userInfo } = useUserStore();
  const [active, setActive] = useState("Dashboard");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { initProgram, initializeLaunchpad } = Methods();

  useEffect(() => {
    const fetchAllUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Unauthorized");

      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllUserInfo(Array.isArray(res.data.users) ? res.data.users : []);
      } catch {
        toast.error("Failed to fetch users");
      }
    };

    fetchAllUsers();
  }, [setAllUserInfo]);

  async function handleEditRole(user: User) {
    try {
      setLoadingEdit(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      await axios.put(
        `${BACKEND_URL}/api/admin/users/${user.id}/role`,
        { role: user.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Role updated");
      setAllUserInfo(
        allUsersInfo.map((u) =>
          u.id === user.id ? { ...u, role: user.role } : u
        )
      );
      setEditingUser(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.log(error.response?.data || err);
      toast.error(`${error.response?.data?.message || "Unknown error"}`);
    } finally {
      setLoadingEdit(false);
    }
  }

  if (!userInfo)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  const hasAccess =
    userInfo.user.is_verified === true && userInfo.user.kyc_level >= 3;
  if (!hasAccess) notFound();

  const filteredUsers = (allUsersInfo || []).filter((u: User) => {
    const matchesRole =
      roleFilter === "all"
        ? true
        : u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesSearch =
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.wallet_address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

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

      {/* for  init plateform  */}
{/* 
      <Button
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        onClick={initProgram}
      >
        Init Platform
      </Button>

      <Button
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        onClick={initializeLaunchpad}
      >
        Init launchpad
      </Button> */}

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
              Overview of all registered users.
            </p>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-2">
              <Input
                placeholder="Search by User ID or Wallet"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60"
              />
              <Select
                onValueChange={(v) => setRoleFilter(v)}
                defaultValue="all"
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_USER">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Table */}
            <div className="w-full  mx-auto rounded-lg border border-gray-800 bg-black/20 backdrop-blur-md shadow-xl p-3 overflow-hidden">
              {/* Desktop / Tablet View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-800 text-gray-200">
                    <tr>
                      <th className="px-4 py-2 whitespace-nowrap">ID</th>
                      <th className="px-4 py-2 whitespace-nowrap">Wallet</th>
                      <th className="px-4 py-2">Reputation</th>
                      <th className="px-4 py-2">Win Rate</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Correct</th>
                      <th className="px-4 py-2">Verified</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2 whitespace-nowrap">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u: User) => {
                      const highlight =
                        searchTerm &&
                        (u.id
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                          u.wallet_address
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()));
                      const createdAt = format(new Date(u.created_at), "PPpp");

                      return (
                        <tr
                          key={u.id}
                          className={`border-t border-gray-700 hover:bg-gray-900 transition-all ${
                            u.is_verified ? "bg-white/5" : ""
                          }`}
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
                          <td className="px-4 py-2 text-yellow-400 font-semibold">
                            1000
                          </td>
                          <td className="px-4 py-2">{u.win_rate}%</td>
                          <td className="px-4 py-2">{u.total_predictions}</td>
                          <td className="px-4 py-2">{u.correct_predictions}</td>
                          <td
                            className={`px-4 py-2 font-semibold ${
                              u.is_verified ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {u.is_verified ? "Yes" : "No"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{u.role}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-xs hover:bg-purple-700 hover:text-white transition-all"
                                onClick={() => setEditingUser(u)}
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </Button>
                            </div>
                          </td>
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
                {filteredUsers.map((u: User) => {
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
                        <span>Wallet: {u.wallet_address.slice(0, 8)}...</span>
                        <button
                          onClick={() =>
                            copyToClipboard(u.wallet_address, "Wallet copied")
                          }
                          className="hover:text-yellow-400"
                        >
                          <Copy className="w-4 h-4 inline" />
                        </button>
                      </div>

                      <div className="text-xs space-y-1">
                        <p>
                          Reputation:{" "}
                          <span className="text-yellow-400">1000</span>
                        </p>
                        <p>Win Rate: {u.win_rate}%</p>
                        <p>Total: {u.total_predictions}</p>
                        <p>Correct: {u.correct_predictions}</p>
                        <p>
                          Verified:
                          <span
                            className={
                              u.is_verified
                                ? "text-green-400 ml-1"
                                : "text-red-400 ml-1"
                            }
                          >
                            {u.is_verified ? "Yes" : "No"}
                          </span>
                        </p>
                        <p>Role: {u.role}</p>
                        <p>Created: {createdAt}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs flex items-center justify-center gap-1 hover:bg-purple-700 hover:text-white transition-all"
                        onClick={() => setEditingUser(u)}
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role Edit Dialog */}
            <Dialog
              open={!!editingUser}
              onOpenChange={(open) => {
                if (!open) setEditingUser(null);
              }}
            >
              <DialogContent className="bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                  <DialogTitle>Edit Role</DialogTitle>
                </DialogHeader>
                {editingUser && (
                  <>
                    <p className="text-sm mb-2">
                      Editing role for{" "}
                      <span className="font-mono">
                        {editingUser.wallet_address}
                      </span>
                    </p>

                    <Select
                      defaultValue={editingUser.role}
                      onValueChange={(value) =>
                        setEditingUser({
                          ...editingUser,
                          role: value as User["role"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SUPER_USER">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          editingUser && handleEditRole(editingUser)
                        }
                        disabled={loadingEdit}
                      >
                        {loadingEdit ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </div>
  );
}
