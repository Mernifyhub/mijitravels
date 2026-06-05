// app/components/admin/dashboard/WelcomeCard.tsx
"use client";

import { Shield, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface WelcomeCardProps {
  userName: string;
  role: "admin" | "manager";
  stats: {
    totalBookings?: number;
    totalRevenue?: number;
    totalAgents?: number;
    pendingDeposits?: number;
  };
}

export default function WelcomeCard({ userName, role, stats }: WelcomeCardProps) {
  const router = useRouter();

  const isAdmin = role === "admin";
  const reportRoute = isAdmin ? "/admin/sales/sales-report" : "/manager/sales/sales-report";
  const roleLabel = isAdmin ? "Admin" : "Manager";
  const roleId = isAdmin ? "AD-001" : "MG-001";

  return (
    <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] rounded-2xl p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm">Welcome back,</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{userName}! 👋</h1>
          <p className="text-blue-200 mt-2 text-sm flex items-center gap-2">
            <Shield size={14} />
            {roleLabel} ID: <span className="font-mono">{roleId}</span>
          </p>
        </div>
        <button
          onClick={() => router.push(reportRoute)}
          className="flex items-center gap-2 px-5 py-3 bg-white text-[#021f3b] rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg"
        >
          <BarChart3 size={20} />
          View Reports
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
        <div className="text-center">
          <p className="text-3xl font-bold">{stats.totalBookings?.toLocaleString() || "0"}</p>
          <p className="text-blue-200 text-sm">Total Bookings</p>
        </div>
        <div className="text-center border-x border-white/20">
          <p className="text-3xl font-bold">${stats.totalRevenue?.toLocaleString() || "0"}</p>
          <p className="text-blue-200 text-sm">Total Revenue</p>
        </div>
        <div className="text-center border-r border-white/20">
          <p className="text-3xl font-bold">{stats.totalAgents || "0"}</p>
          <p className="text-blue-200 text-sm">Total Agents</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">{stats.pendingDeposits || "0"}</p>
          <p className="text-blue-200 text-sm">Pending Tasks</p>
        </div>
      </div>
    </div>
  );
}