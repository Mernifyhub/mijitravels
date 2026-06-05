// app/components/admin/dashboard/SystemOverview.tsx
"use client";

import { ArrowUpRight, Clock, UserPlus, UserCheck, Ticket, CircleDollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface SystemOverviewProps {
  stats: {
    todayRevenue?: number;
    pendingDeposits?: number;
    pendingAgents?: number;
    totalAgents?: number;
    todayConfirm?: number;
    todayBookings?: number;
    todayDeposits?: number;
  };
  role: "admin" | "manager";
}

export default function SystemOverview({ stats, role }: SystemOverviewProps) {
  const router = useRouter();
  const depositRoute = role === "admin" ? "/admin/agent/agent-deposit-list" : "/manager/agent/agent-deposit-list";

  const overviewItems = [
    { label: "Pending Deposits", value: stats.pendingDeposits || 0, icon: <Clock size={14} className="text-orange-500" />, bg: "bg-orange-50", color: "text-orange-600" },
    { label: "Pending Agents", value: stats.pendingAgents || 0, icon: <UserPlus size={14} className="text-yellow-600" />, bg: "bg-yellow-50", color: "text-yellow-600" },
    { label: "Active Users", value: stats.totalAgents || 0, icon: <UserCheck size={14} className="text-green-600" />, bg: "bg-green-50", color: "text-green-600" },
    { label: "Today's Tickets", value: stats.todayConfirm || 0, icon: <Ticket size={14} className="text-blue-600" />, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Today's Bookings", value: stats.todayBookings || 0, icon: <Ticket size={14} className="text-blue-600" />, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Today's Deposit", value: stats.todayDeposits || 0, icon: <Ticket size={14} className="text-blue-600" />, bg: "bg-blue-50", color: "text-blue-600" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">System Overview</h3>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white mb-4">
        <p className="text-emerald-100 text-sm">Today&apos;s Revenue</p>
        <h2 className="text-3xl font-bold mt-1">${stats.todayRevenue?.toLocaleString() || "0"}</h2>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <ArrowUpRight size={16} />
          <span>+22% from yesterday</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {overviewItems.map((item, index) => (
          <div key={index} className={`flex items-center justify-between py-2 px-3 ${item.bg} rounded-lg`}>
            <span className="text-gray-600 text-sm flex items-center gap-2">{item.icon}{item.label}</span>
            <span className={`font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(depositRoute)}
        className="w-full mt-4 py-3 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] transition flex items-center justify-center gap-2"
      >
        <CircleDollarSign size={18} />
        Manage Deposits
      </button>
    </div>
  );
}