// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import AdminTopBar from "@/app/components/admin/AdminTopBar";

// Shared Dashboard Components
import WelcomeCard from "@/app/components/admin/dashboard/WelcomeCard";
import BookingRequestsSection from "@/app/components/admin/dashboard/BookingRequestsSection";
import SystemOverview from "@/app/components/admin/dashboard/SystemOverview";
import RecentBookingsTable from "@/app/components/admin/dashboard/RecentBookingsTable";
import RecentDeposits from "@/app/components/admin/dashboard/RecentDeposits";
import TopAgents from "@/app/components/admin/dashboard/TopAgents";
import QuickActions from "@/app/components/admin/dashboard/QuickActions";
import BottomStatsCards from "@/app/components/admin/dashboard/BottomStatsCards";
import AdminControlCenter from "@/app/components/admin/dashboard/AdminControlCenter";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");

  // User name load
  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  // Dashboard data fetch
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

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const recentDeposits = data?.recentDeposits || [];
  const topAgents = data?.topAgents || [];
  const requestStats = data?.requestStats || {};

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

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminTopBar />
      <div className="p-6 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WelcomeCard userName={userName} role="admin" stats={stats} />
            <BookingRequestsSection requestStats={requestStats} role="admin" />
          </div>
          <SystemOverview stats={stats} role="admin" />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentBookingsTable bookings={recentBookings} role="admin" />
          <RecentDeposits deposits={recentDeposits} role="admin" />
        </div>

        {/* Row 3 */}
        <TopAgents agents={topAgents} role="admin" />

        {/* Row 4 */}
        <QuickActions role="admin" />

        {/* Row 5 */}
        <BottomStatsCards stats={stats} role="admin" />

        {/* Row 6 */}
        <AdminControlCenter role="admin" />
      </div>
    </div>
  );
}