"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

/**
 * Full single-file dark dashboard page (Token Launch UI)
 * Drop into src/app/page.tsx
 */

export default function Page() {
  // form state (deploy)
  const [tokenName, setTokenName] = useState("BOT Token");
  const [symbol, setSymbol] = useState("BOT");
  const [supply, setSupply] = useState("1000000000");

  // sample datasets
  const lineData = [
    { name: "Jan", value: 120 },
    { name: "Feb", value: 200 },
    { name: "Mar", value: 150 },
    { name: "Apr", value: 300 },
    { name: "May", value: 280 },
    { name: "Jun", value: 400 },
    { name: "Jul", value: 450 },
  ];

  const barData = [
    { name: "Week 1", a: 400, b: 240 },
    { name: "Week 2", a: 300, b: 139 },
    { name: "Week 3", a: 200, b: 980 },
    { name: "Week 4", a: 278, b: 390 },
  ];

  const pieData = [
    { name: "Public", value: 50 },
    { name: "Team", value: 20 },
    { name: "Reserve", value: 15 },
    { name: "Liquidity", value: 15 },
  ];
  const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#f472b6", "#10b981"];

  const transfers = [
    {
      tx: "0x1a2b...f9",
      from: "0x123...9fE",
      to: "0x456...a12",
      amount: "10,000 BOT",
      time: "2m ago",
    },
    {
      tx: "0x2c3d...ab",
      from: "0x789...d33",
      to: "0x222...b11",
      amount: "2,500 BOT",
      time: "10m ago",
    },
    {
      tx: "0x3e4f...01",
      from: "0x555...cc2",
      to: "0x999...ee8",
      amount: "18,000 BOT",
      time: "1h ago",
    },
    {
      tx: "0x4f5a...11",
      from: "0xabc...111",
      to: "0xbbb...222",
      amount: "1,000 BOT",
      time: "3h ago",
    },
  ];

  const topHolders = [
    { rank: 1, addr: "0xAAA...111", percent: 12.5 },
    { rank: 2, addr: "0xBBB...222", percent: 8.3 },
    { rank: 3, addr: "0xCCC...333", percent: 6.1 },
    { rank: 4, addr: "0xDDD...444", percent: 4.2 },
    { rank: 5, addr: "0xEEE...555", percent: 3.9 },
  ];

  const revenueData = [
    { name: "Jan", revenue: 10000 },
    { name: "Feb", revenue: 12000 },
    { name: "Mar", revenue: 15000 },
    { name: "Apr", revenue: 11000 },
    { name: "May", revenue: 19000 },
    { name: "Jun", revenue: 22000 },
  ];

  // derived stats
  const stats = useMemo(
    () => [
      { label: "Market Cap", value: "$102.2M" },
      { label: "Holders", value: "1,234" },
      { label: "Circulating Supply", value: "1,000,000,000" },
      { label: "24h Volume", value: "$7.4M" },
    ],
    []
  );

  // helper small components inside same file
  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
  }) => (
    <div
      className={`bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );

  const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({
    title,
    subtitle,
  }) => (
    <div className="text-center">
      <p className="text-sm text-pink-400 font-medium tracking-wide">
        TOKEN LAUNCH
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold">
        Launch{" "}
        <span className="text-gradient from-purple-400 to-pink-400">
          Your Token
        </span>
      </h1>
      {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
    </div>
  );

  const StatBox: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex flex-col">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-lg font-semibold mt-1 text-white">{value}</span>
    </div>
  );

  // small visual progress bar
  const SmallProgress: React.FC<{ value: number; color?: string }> = ({
    value,
    color = "bg-orange-400",
  }) => (
    <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
      <div className={`${color} h-3`} style={{ width: `${value}%` }} />
    </div>
  );

  // main layout
  return (
    <main className="min-h-screen bg-black text-zinc-100 px-6 py-10 max-w-6xl mx-auto mt-20">
      {/* HERO */}
      <section className="max-w-3xl mx-auto text-center space-y-4">
        <SectionTitle
          title="Launch Your Token"
          subtitle="Deploy, monitor and manage your token. Everything in one place."
        />
        <div className="flex items-center justify-center gap-3">
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-black px-5 py-2 rounded-full font-medium shadow-md hover:opacity-95">
            Launch Token
          </button>
          <input
            placeholder="Search tokens..."
            className="bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 w-60 text-sm focus:outline-none"
          />
        </div>
      </section>

      {/* TOP PANELS */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: token quick card */}
        <Card className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-bold text-black">
                  D
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Token</div>
                  <div className="text-lg font-semibold">BOT Token</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-400">Price</div>
              <div className="text-lg font-semibold text-white">$0.0069</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Market Cap</div>
              <div className="text-sm font-semibold">$102.2M</div>
            </div>
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">24h Volume</div>
              <div className="text-sm font-semibold">$7.4M</div>
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xs text-zinc-400 mb-2">Performance</div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    wrapperStyle={{ background: "#0b1220", borderRadius: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Right: big chart and summary */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-400">Token Growth</div>
              <div className="text-xl font-semibold">+$2.3k (24h)</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">
                1D
              </div>
              <div className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">
                1W
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-600 text-sm">
                1M
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  wrapperStyle={{ background: "#0b1220", borderRadius: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06b6d4"
                  fill="url(#grad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Total Supply</div>
              <div className="text-sm font-semibold">1,000,000,000</div>
            </div>
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Holders</div>
              <div className="text-sm font-semibold">1,234</div>
            </div>
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Locked</div>
              <div className="text-sm font-semibold">65%</div>
            </div>
          </div>
        </Card>
      </section>

      {/* MID SECTIONS: distribution & analytics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-zinc-400">Distribution</div>
              <div className="text-lg font-semibold">Token Allocation</div>
            </div>
            <div className="text-xs bg-zinc-800/40 px-3 py-1 rounded-full">
              Updated
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={70}
                    innerRadius={30}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ background: "#0b1220" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2">
              {pieData.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between mb-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: PIE_COLORS[pieData.indexOf(p)],
                      }}
                      className="rounded-md block"
                    />
                    <div>
                      <div className="text-sm">{p.name}</div>
                      <div className="text-xs text-zinc-400">{p.value}%</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{p.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-zinc-400">Analytics</div>
              <div className="text-lg font-semibold">Activity & Onchain</div>
            </div>
            <div className="text-xs bg-zinc-800/40 px-3 py-1 rounded-full">
              Live
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip wrapperStyle={{ background: "#0b1220" }} />
                <Bar dataKey="a" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="b" stackId="a" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-zinc-800/40 p-3 rounded-lg">
                <div className="text-xs text-zinc-400">{s.label}</div>
                <div className="text-sm font-semibold">{s.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* PROGRESS / LAUNCH STEPS */}
      <section className="mt-8">
        <div className="flex items-center justify-center">
          <div className="bg-zinc-800/30 px-4 py-1 rounded-full text-xs text-zinc-300">
            ROADMAP
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card>
            <div className="mb-3">
              <div className="text-sm text-zinc-400">Launch Progress</div>
              <div className="text-lg font-semibold">Where we are</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div>Marketing</div>
                  <div className="text-sm text-zinc-300">80%</div>
                </div>
                <SmallProgress value={80} color="bg-purple-500" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div>Development</div>
                  <div className="text-sm text-zinc-300">60%</div>
                </div>
                <SmallProgress value={60} color="bg-cyan-400" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div>Liquidity</div>
                  <div className="text-sm text-zinc-300">90%</div>
                </div>
                <SmallProgress value={90} color="bg-green-400" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div>Staking</div>
                  <div className="text-sm text-zinc-300">70%</div>
                </div>
                <SmallProgress value={70} color="bg-orange-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-3">
              <div className="text-sm text-zinc-400">Tasks</div>
              <div className="text-lg font-semibold">Upcoming checklist</div>
            </div>

            <div className="space-y-3">
              {[
                "Audit contract",
                "Create liquidity pool",
                "Marketing campaign",
                "Apply to exchanges",
              ].map((t, i) => (
                <div
                  key={t}
                  className="flex items-center justify-between bg-zinc-800/30 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm">{t}</div>
                      <div className="text-xs text-zinc-400">
                        Due in {5 + i} days
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300">
                    Status: {i % 2 === 0 ? "In progress" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* TRANSACTIONS + HOLDERS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-zinc-400">Recent Transfers</div>
              <div className="text-lg font-semibold">Latest onchain moves</div>
            </div>
            <div className="text-xs text-zinc-400">All networks</div>
          </div>

          <div className="divide-y divide-zinc-800">
            {transfers.map((t, i) => (
              <div
                key={i}
                className="py-3 flex items-center justify-between text-sm text-zinc-200"
              >
                <div className="w-1/2 truncate">
                  <div className="font-mono text-xs text-zinc-400">{t.tx}</div>
                  <div className="text-sm">
                    {t.from} → {t.to}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{t.amount}</div>
                  <div className="text-xs text-zinc-400">{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-zinc-400">Top Holders</div>
              <div className="text-lg font-semibold">Largest wallets</div>
            </div>
            <div className="text-xs text-zinc-400">
              Holder count: {topHolders.length}
            </div>
          </div>

          <div className="space-y-2">
            {topHolders.map((h) => (
              <div
                key={h.rank}
                className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center text-sm font-medium">
                    {h.rank}
                  </div>
                  <div>
                    <div className="text-sm">{h.addr}</div>
                    <div className="text-xs text-zinc-400">Wallet</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{h.percent}%</div>
                  <div className="text-xs text-zinc-400">of supply</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* REVENUE + DEPLOY CARD */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-zinc-400">Revenue</div>
              <div className="text-lg font-semibold">Fees & Income</div>
            </div>
            <div className="text-xs text-zinc-400">This year</div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip wrapperStyle={{ background: "#0b1220" }} />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Total Revenue</div>
              <div className="text-sm font-semibold">$120k</div>
            </div>
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Fees (30d)</div>
              <div className="text-sm font-semibold">$5.2k</div>
            </div>
            <div className="bg-zinc-800/40 p-3 rounded-lg">
              <div className="text-xs text-zinc-400">Avg Tx Fee</div>
              <div className="text-sm font-semibold">$0.004</div>
            </div>
          </div>
        </Card>

        {/* Deploy / Quick Actions */}
        <Card className="space-y-4">
          <div>
            <div className="text-sm text-zinc-400">Deploy Your Token</div>
            <div className="text-lg font-semibold">Quick deploy panel</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400">Token Name</label>
            <input
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            />
            <label className="text-xs text-zinc-400">Symbol</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            />
            <label className="text-xs text-zinc-400">Total Supply</label>
            <input
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-2">
            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-black py-2 rounded-full font-semibold shadow">
              Deploy Token Contract
            </button>
          </div>

          <div className="mt-2 text-xs text-zinc-400">
            Estimated gas:{" "}
            <span className="text-white font-semibold">~0.0001 SOL</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button className="bg-zinc-800/30 px-2 py-2 rounded-lg text-xs">
              Add Liquidity
            </button>
            <button className="bg-zinc-800/30 px-2 py-2 rounded-lg text-xs">
              Verify
            </button>
            <button className="bg-zinc-800/30 px-2 py-2 rounded-lg text-xs">
              Audit
            </button>
          </div>
        </Card>
      </section>

      {/* FOOTER-LIKE STATS */}
      <section className="mt-8">
        <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div>
            <div className="text-sm text-zinc-400">Total Holders</div>
            <div className="text-xl font-semibold">1,234</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Funds Raised</div>
            <div className="text-xl font-semibold">$45M</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Launch Completion</div>
            <div className="text-xl font-semibold">100%</div>
          </div>
        </div>
      </section>
    </main>
  );
}
