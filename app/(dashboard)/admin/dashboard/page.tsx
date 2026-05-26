"use client";

import { useState, useEffect } from "react";
import {
  Plane, DollarSign, Clock, ArrowUpRight, RefreshCw, Download,
  Bell, CheckCircle, XCircle, AlertCircle, Eye, Users, ArrowRight,
  Ticket, UserPlus, BarChart3, Settings, Percent, Shield,
  CircleDollarSign, UserCheck, Medal, Trophy, Loader2, Wallet, Ban
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdminTopBar from "@/app/components/admin/AdminTopBar";
import { apiClient } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
 const [adminName, setAdminName] = useState("Admin");

useEffect(() => {
  const fetchData = async () => {
    try {
      const json = await apiClient("/admin/dashboard");
      setData(json);

      // admin name from profile
      const profile = await apiClient("/auth/profile");
      const userData = profile?.user || profile;
      if (userData?.firstName) {
        setAdminName(
          userData.agentName ||
          `${userData.firstName} ${userData.lastName || ""}`.trim()
        );
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err?.message);
      if (String(err?.message).includes("401")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [router]);

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const recentDeposits = data?.recentDeposits || [];
  const topAgents = data?.topAgents || [];
    const requestStats = data?.requestStats || {};

  const requestCards = [
    {
      key: "ISSUE",
      label: "Issue Requests",
      count: requestStats.ISSUE || 0,
      icon: <Ticket size={22} />,
      color: "from-emerald-500 to-emerald-600",
      bg: "from-emerald-50 to-white",
      border: "border-emerald-200",
      text: "text-emerald-700",
      route: "/admin/requests/issue",
    },
    {
      key: "REISSUE",
      label: "Reissue Requests",
      count: requestStats.REISSUE || 0,
      icon: <RefreshCw size={22} />,
      color: "from-indigo-500 to-indigo-600",
      bg: "from-indigo-50 to-white",
      border: "border-indigo-200",
      text: "text-indigo-700",
      route: "/admin/requests/reissue",
    },
    {
      key: "CANCEL",
      label: "Cancel Requests",
      count: requestStats.CANCEL || 0,
      icon: <XCircle size={22} />,
      color: "from-rose-500 to-rose-600",
      bg: "from-rose-50 to-white",
      border: "border-rose-200",
      text: "text-rose-700",
      route: "/admin/requests/cancel",
    },
    {
      key: "VOID",
      label: "Void Requests",
      count: requestStats.VOID || 0,
      icon: <Ban size={22} />,
      color: "from-amber-500 to-amber-600",
      bg: "from-amber-50 to-white",
      border: "border-amber-200",
      text: "text-amber-700",
      route: "/admin/requests/void",
    },
    {
      key: "REFUND",
      label: "Refund Requests",
      count: requestStats.REFUND || 0,
      icon: <Wallet size={22} />,
      color: "from-purple-500 to-purple-600",
      bg: "from-purple-50 to-white",
      border: "border-purple-200",
      text: "text-purple-700",
      route: "/admin/requests/refund",
    },
  ];

  const quickActions = [
    { icon: <Bell size={24} />, label: "CMS / Notice", color: "bg-blue-500", route: "/admin/notice" },
    { icon: <Percent size={24} />, label: "Markup Settings", color: "bg-purple-500", route: "/admin/markup" },
    { icon: <CircleDollarSign size={24} />, label: "Agent Deposits", color: "bg-green-500", route: "/admin/agent/agent-deposit-list" },
    { icon: <BarChart3 size={24} />, label: "Sales Report", color: "bg-orange-500", route: "/admin/sales/sales-report" },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const map: any = {
      ticketed: { color: "bg-green-100 text-green-700", icon: <CheckCircle size={14} /> },
      confirmed: { color: "bg-blue-100 text-blue-700", icon: <CheckCircle size={14} /> },
      pending: { color: "bg-yellow-100 text-yellow-700", icon: <AlertCircle size={14} /> },
      cancelled: { color: "bg-red-100 text-red-700", icon: <XCircle size={14} /> },
      approved: { color: "bg-green-100 text-green-700", icon: <CheckCircle size={14} /> },
      rejected: { color: "bg-red-100 text-red-700", icon: <XCircle size={14} /> },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        {s.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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

        {/* WELCOME SECTION & TOP AGENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-blue-200 text-sm">Welcome back,</p>
                  <h1 className="text-2xl md:text-3xl font-bold mt-1">{adminName}! 👋</h1>
                  <p className="text-blue-200 mt-2 text-sm flex items-center gap-2">
                    <Shield size={14} />
                    Admin ID: <span className="font-mono">AD-001</span>
                  </p>
                </div>
                <button 
                  onClick={() => router.push("/admin/sales/sales-report")}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-[#021f3b] rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg"
                >
                  <BarChart3 size={20} />
                  View Reports
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.totalBookings?.toLocaleString() || "12.5K"}</p>
                  <p className="text-blue-200 text-sm">Total Bookings</p>
                </div>
                <div className="text-center border-x border-white/20">
                  <p className="text-3xl font-bold">${stats.totalRevenue?.toLocaleString() || "2.5M"}</p>
                  <p className="text-blue-200 text-sm">Total Revenue</p>
                </div>
                <div className="text-center border-r border-white/20">
                  <p className="text-3xl font-bold">{stats.totalAgents || "256"}</p>
                  <p className="text-blue-200 text-sm">Total Agents</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.pendingDeposits || "12"}</p>
                  <p className="text-blue-200 text-sm">Managers</p>
                </div>
              </div>
            </div>
                        {/* Request Management Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Bell size={22} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Booking Requests</h2>
                    <p className="text-sm text-gray-500">Issue, reissue, cancel, void & refund requests</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/admin/requests/issue")}
                  className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {requestCards.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(item.route)}
                    className={`relative text-left p-4 rounded-xl border-2 bg-gradient-to-br ${item.bg} ${item.border} hover:shadow-md hover:-translate-y-1 transition-all group`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition`}>
                      {item.icon}
                    </div>

                    <p className={`text-sm font-bold ${item.text}`}>{item.label}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending admin action</p>

                    <div className="mt-4 flex items-end justify-between">
                      <h3 className={`text-3xl font-black ${item.text}`}>{item.count}</h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 group-hover:text-[#021f3b] transition">
                        Open <ArrowRight size={12} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

           
          </div>

          {/* System Overview Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">System Overview</h3>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white mb-4">
              <p className="text-emerald-100 text-sm">Today's Revenue</p>
              <h2 className="text-3xl font-bold mt-1">${stats.todayRevenue?.toLocaleString() || "45,250"}</h2>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <ArrowUpRight size={16} />
                <span>+22% from yesterday</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  Pending Deposits
                </span>
                <span className="font-bold text-orange-600">{stats.pendingDeposits || 18}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <UserPlus size={14} className="text-yellow-600" />
                  Pending Agents
                </span>
                <span className="font-bold text-yellow-600">{stats.pendingAgents || 23}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <UserCheck size={14} className="text-green-600" />
                  Active Users
                </span>
                <span className="font-bold text-green-600">{stats.totalAgents || "1,245"}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <Ticket size={14} className="text-blue-600" />
                  Today's Tickets
                </span>
                <span className="font-bold text-blue-600">{stats.todayConfirm || 130}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <Ticket size={14} className="text-blue-600" />
                  Today's Bookings
                </span>
                <span className="font-bold text-blue-600">{stats.todayBookings || 156}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <Ticket size={14} className="text-blue-600" />
                  Today's Deposit
                </span>
                <span className="font-bold text-blue-600">{stats.todayDeposits || 20700}</span>
              </div>
            </div>

            <button 
              onClick={() => router.push("/admin/agent/agent-deposit-list")}
              className="w-full mt-4 py-3 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] transition flex items-center justify-center gap-2"
            >
              <CircleDollarSign size={18} />
              Manage Deposits
            </button>
          </div>
        </div>
        {/* Recent Bookings + Deposits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
                <p className="text-sm text-gray-500">Latest booking transactions</p>
              </div>
              <button 
                onClick={() => router.push("/admin/bookings/all-bookings")}
                className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PNR</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Passenger</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.length > 0 ? recentBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-[#021f3b]">{booking.pnr || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{booking.passenger}</td>
                      <td className="px-6 py-4 flex items-center gap-1 text-gray-600">
                        <Plane size={14} />
                        {booking.route}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{booking.amount}</td>
                      <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-6 py-4 text-gray-600">{booking.agent}</td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Eye size={18} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">No bookings</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Deposits */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Deposits</h2>
                <p className="text-sm text-gray-500">Agent deposits</p>
              </div>
              <button 
                onClick={() => router.push("/admin/agent/agent-deposit-list")}
                className="text-sm text-[#021f3b] font-medium hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentDeposits.length > 0 ? recentDeposits.map((deposit: any) => (
                <div key={deposit.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${deposit.status === "approved" ? "bg-green-100" : 
                      deposit.status === "pending" ? "bg-yellow-100" : "bg-red-100"}`}>
                    {deposit.status === "approved" ? <CheckCircle size={18} className="text-green-600" /> :
                     deposit.status === "pending" ? <Clock size={18} className="text-yellow-600" /> :
                     <XCircle size={18} className="text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{deposit.agent}</p>
                    <p className="text-xs text-gray-500">{deposit.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{deposit.amount}</p>
                    <StatusBadge status={deposit.status} />
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">No deposits</p>
              )}
            </div>
          </div>
        </div>
         {/* Top Performing Agents */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Trophy size={22} className="text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Top Performing Agents</h2>
                    <p className="text-sm text-gray-500">Based on bookings & revenue this month</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push("/admin/agent/all-agent")}
                  className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topAgents.length > 0 ? topAgents.map((agent: any, index: number) => (
                  <div 
                    key={index}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                      ${index === 0 ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-400" : 
                        index === 1 ? "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 hover:border-gray-400" :
                        index === 2 ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400" :
                        "bg-gray-50 border-gray-100 hover:border-gray-300"
                      }`}
                  >
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md
                      ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                        index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                        "bg-[#021f3b]"
                      }`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>

                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm mb-3
                      ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                        index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-600" :
                        index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                        "bg-[#021f3b]"
                      }`}>
                      {agent.avatar || agent.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-sm truncate">{agent.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{agent.bookings} bookings</p>
                      <p className="font-bold text-[#021f3b] mt-2">{agent.revenue}</p>
                      <div className="flex items-center justify-center gap-1 mt-1 text-green-600 text-xs">
                        <ArrowUpRight size={12} />
                        <span>+{agent.growth}%</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="col-span-5 text-center text-gray-500 py-8">No data available</p>
                )}
              </div>
            </div>


        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.route)}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{action.label}</h3>
            </button>
          ))}
        </div>

        
        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Pending Deposits</p>
                <h3 className="text-3xl font-bold mt-2">{stats.pendingDeposits || 18}</h3>
              </div>
              <CircleDollarSign size={28} />
            </div>
            <button 
              onClick={() => router.push("/admin/agent/agent-deposit-list")}
              className="mt-4 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              Review Now <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Today's Sales</p>
                <h3 className="text-3xl font-bold mt-2">${stats.todayRevenue?.toLocaleString() || "45K"}</h3>
              </div>
              <DollarSign size={28} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Pending Agents</p>
                <h3 className="text-3xl font-bold mt-2">{stats.pendingAgents || 23}</h3>
              </div>
              <UserPlus size={28} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">System Alerts</p>
                <h3 className="text-3xl font-bold mt-2">5</h3>
              </div>
              <Bell size={28} />
            </div>
          </div>
        </div>

        {/* System Notice */}
        <div className="bg-gradient-to-r from-[#021f3b] via-[#0a3a6b] to-[#0a4d8c] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Settings size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Admin Control Center</h3>
                <p className="text-blue-200">
                  Manage CMS, Markup Settings, Agent Approvals, Deposits & System Configuration
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push("/admin/notice")}
              className="px-6 py-3 bg-white text-[#021f3b] rounded-xl font-semibold hover:bg-blue-50 transition whitespace-nowrap"
            >
              Go to CMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}