// app/manager/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminTopBar from "@/app/components/admin/AdminTopBar";

// Dashboard Components
import WelcomeCard from "@/app/components/manager/dashboard/WelcomeCard";
import BookingRequestsSection from "@/app/components/manager/dashboard/BookingRequestsSection";
import SystemOverview from "@/app/components/manager/dashboard/SystemOverview";
import RecentBookingsTable from "@/app/components/manager/dashboard/RecentBookingsTable";
import RecentDeposits from "@/app/components/manager/dashboard/RecentDeposits";
import TopAgents from "@/app/components/manager/dashboard/TopAgents";
import QuickActions from "@/app/components/manager/dashboard/QuickActions";
import BottomStatsCards from "@/app/components/manager/dashboard/BottomStatsCards";
import ManagerControlCenter from "@/app/components/manager/dashboard/ManagerControlCenter";
import { apiClient } from "@/lib/api";

export default function ManagerDashboardPage() {
  // ── States ──
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [managerName, setManagerName] = useState("Manager");

  // ── Manager name load ──
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName) setManagerName(userName);
  }, []);

  // ── Dashboard data fetch ──
  useEffect(() => {
  const fetchData = async () => {
    try {
      const json = await apiClient("/admin/dashboard");
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);

  // ── Data extract ──
  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const recentDeposits = data?.recentDeposits || [];
  const topAgents = data?.topAgents || [];
  const requestStats = data?.requestStats || {};

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminTopBar />
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Loader2 size={48} className="animate-spin text-[#021f3b]" />
        </div>
      </div>
    );
  }

  // ── Main Render ──
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminTopBar />

      <div className="p-6 space-y-6">
        {/* Row 1: Welcome + System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WelcomeCard managerName={managerName} stats={stats} />
            <BookingRequestsSection requestStats={requestStats} />
          </div>
          <SystemOverview stats={stats} />
        </div>

        {/* Row 2: Recent Bookings + Recent Deposits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentBookingsTable bookings={recentBookings} />
          <RecentDeposits deposits={recentDeposits} />
        </div>

        {/* Row 3: Top Agents */}
        <TopAgents agents={topAgents} />

        {/* Row 4: Quick Actions */}
        <QuickActions />

        {/* Row 5: Bottom Stats */}
        <BottomStatsCards stats={stats} />

        {/* Row 6: Manager Control Center */}
        <ManagerControlCenter />
      </div>
    </div>
  );
}