"use client";
import { useState, useEffect } from "react";
import {
  Plane, DollarSign, CreditCard, Wallet, Clock, ArrowUpRight, ArrowDownRight,
  RefreshCw, Download, Search, CheckCircle, XCircle, AlertCircle, Eye,
  PlusCircle, FileText, Users, Calendar, ArrowRight, Ticket, Gift, Star,
  Award, Target, Zap, Globe, Shield, Phone, Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AgentTopBar from "@/app/components/agent/AgentTopBar";
import { apiClient } from "@/lib/api";

type FilterType = "today" | "week" | "month" | "year";

interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agentId: string;
    agencyName: string;
    memberSince: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
  };
  stats: {
    totalBookings: number;
    todayBookings: number;
    weekBookings: number;
    monthBookings: number;
    yearBookings: number;
    totalSales: number;
    totalCommission: number;
    availableBalance: number;
    creditLimit: number;
    usedCredit: number;
  };
  statusCounts: {
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  recentBookings: Array<{
    id: string;
    pnr: string;
    bookingId: string;
    passenger: string;
    route: string;
    date: string;
    amount: number;
    status: string;
    airline: string;
  }>;
  recentPayments: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: "up" | "down";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface Transaction {
  id: string;
  type: "deposit" | "booking" | "refund" | "commission";
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending";
}

export default function AgentDashboardPage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);
  const [usedCredit, setUsedCredit] = useState(0);
  const [remainingCredit, setRemainingCredit] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);

  const remainingPercent =
    creditLimit > 0
      ? Math.max(0, Math.min(100, (remainingCredit / creditLimit) * 100))
      : 0;

  // ===== FETCH =====
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const [dashboardResult, balanceResult] = await Promise.allSettled([
          apiClient("/dashboard"),
          apiClient("/balance"),
        ]);

        let unauthorized = false;

        if (dashboardResult.status === "fulfilled") {
          setDashboardData(dashboardResult.value);
        } else {
          console.error("Dashboard failed:", dashboardResult.reason);
          if (String(dashboardResult.reason).includes("401")) {
            unauthorized = true;
          }
        }

        if (balanceResult.status === "fulfilled") {
          const balance = balanceResult.value;
          if (balance?.success) {
            setWalletBalance(Number(balance.balance ?? 0));
            setCreditLimit(Number(balance.creditLimit ?? 0));
            setUsedCredit(Number(balance.usedLimit ?? 0));
            setRemainingCredit(Number(balance.remainingCredit ?? balance.availableCredit ?? 0));
            setTotalAvailable(Number(balance.totalAvailable ?? 0));
          }
        } else {
          console.error("Balance failed:", balanceResult.reason);
          if (String(balanceResult.reason).includes("401")) {
            unauthorized = true;
          }
        }

        if (unauthorized) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  // ===== TIME =====
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // ===== HELPERS =====
  const getUserInitials = () => {
    if (dashboardData?.user) {
      const { firstName, lastName } = dashboardData.user;
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
    }
    return "U";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getTierColor = (tier?: string) => {
    const colors = {
      bronze: "bg-orange-100 text-orange-700 border-orange-300",
      silver: "bg-gray-100 text-gray-700 border-gray-300",
      gold: "bg-yellow-100 text-yellow-700 border-yellow-300",
      platinum: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  const getStatsData = (): StatCard[] => {
    if (!dashboardData) return [];
    const { stats } = dashboardData;
    const bookingCount = {
      today: stats.todayBookings || 0,
      week: stats.weekBookings || 0,
      month: stats.monthBookings || 0,
      year: stats.yearBookings || 0,
    }[activeFilter];

    return [
      {
        title: "Total Bookings",
        value: bookingCount.toLocaleString(),
        change: 12.5,
        changeType: "up",
        icon: <Ticket size={24} />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Total Sales",
        value: `SAR ${(stats.totalSales || 0).toLocaleString()}`,
        change: 8.2,
        changeType: "up",
        icon: <DollarSign size={24} />,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "Commission Earned",
        value: `SAR ${(stats.totalCommission || 0).toLocaleString()}`,
        change: 15.3,
        changeType: "up",
        icon: <Gift size={24} />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "Available to Book",
        value: `SAR ${totalAvailable.toLocaleString()}`,
        change: 5.4,
        changeType: "down",
        icon: <Wallet size={24} />,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ];
  };

  const recentBookings = dashboardData?.recentBookings || [];

  const recentTransactions =
    dashboardData?.recentPayments?.map((payment) => ({
      id: payment.id,
      type: payment.type as Transaction["type"],
      description: payment.description,
      amount: payment.amount,
      date: new Date(payment.date).toLocaleDateString(),
      status: payment.status as Transaction["status"],
    })) || [];

  const quickActions = [
    { icon: <Search size={24} />, label: "Search Flights", description: "Find best deals", color: "bg-blue-500", route: "/user/search" },
    { icon: <FileText size={24} />, label: "PNR Import", description: "Import bookings", color: "bg-purple-500", route: "/user/pnr-import" },
    { icon: <PlusCircle size={24} />, label: "Add Deposit", description: "Top up balance", color: "bg-green-500", route: "/user/deposits" },
    { icon: <Users size={24} />, label: "My Staff", description: "Manage team", color: "bg-orange-500", route: "/user/staff" },
  ];

  const performanceMetrics = [
    {
      icon: <Target size={20} />,
      label: "Monthly Target",
      value: `${Math.min(Math.round((dashboardData?.stats?.monthBookings || 0) / 100 * 100), 100)}%`,
      description: `${dashboardData?.stats?.monthBookings || 0} / 100 bookings`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Star size={20} />,
      label: "Success Rate",
      value: dashboardData?.stats?.totalBookings
        ? `${Math.round((dashboardData.statusCounts.confirmed / dashboardData.stats.totalBookings) * 100)}%`
        : "0%",
      description: "Booking success",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: <Zap size={20} />,
      label: "Total Bookings",
      value: (dashboardData?.stats?.totalBookings || 0).toString(),
      description: "All time",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: <Award size={20} />,
      label: "Tier",
      value: dashboardData?.user?.tier?.toUpperCase() || "BRONZE",
      description: "Membership",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const normalizedStatus = status.toLowerCase().replace("_", "");
    const styles: Record<string, string> = {
      confirmed: "bg-green-100 text-green-700",
      onhold: "bg-yellow-100 text-yellow-700",
      on_hold: "bg-yellow-100 text-yellow-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      voided: "bg-gray-100 text-gray-700",
      refunded: "bg-purple-100 text-purple-700",
    };
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle size={14} />,
      onhold: <AlertCircle size={14} />,
      on_hold: <AlertCircle size={14} />,
      pending: <AlertCircle size={14} />,
      cancelled: <XCircle size={14} />,
      voided: <XCircle size={14} />,
      refunded: <ArrowUpRight size={14} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[normalizedStatus] || "bg-gray-100 text-gray-700"}`}>
        {icons[normalizedStatus] || <AlertCircle size={14} />}
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace("_", " ")}
      </span>
    );
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      deposit: <ArrowDownRight size={16} className="text-green-600" />,
      booking: <Plane size={16} className="text-blue-600" />,
      refund: <ArrowUpRight size={16} className="text-purple-600" />,
      commission: <Gift size={16} className="text-orange-600" />,
      cash: <DollarSign size={16} className="text-green-600" />,
      card: <CreditCard size={16} className="text-blue-600" />,
      bank_transfer: <ArrowDownRight size={16} className="text-purple-600" />,
      mobile_banking: <Phone size={16} className="text-orange-600" />,
    };
    return icons[type.toLowerCase()] || <DollarSign size={16} className="text-gray-600" />;
  };

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AgentTopBar />
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded-xl" />
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR =====
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AgentTopBar />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, stats, statusCounts } = dashboardData;

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ✅ TopBar — prop ছাড়া */}
      <AgentTopBar />

      <div className="p-6 space-y-6">

        {/* WELCOME + BALANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Welcome Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white" />
                <div className="absolute -right-5 -bottom-10 w-60 h-60 rounded-full bg-white" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">{getGreeting()},</p>
                      <h1 className="text-2xl md:text-3xl font-bold mt-1">
                        {user?.firstName} {user?.lastName}! 👋
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="text-blue-200 text-sm flex items-center gap-1">
                          <Shield size={14} />
                          ID: <span className="font-mono">{user?.agentId || "N/A"}</span>
                        </span>
                        {user?.tier && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getTierColor(user.tier)}`}>
                            {user.tier.toUpperCase()} MEMBER
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/user/search")}
                    className="flex items-center gap-2 px-5 py-3 bg-white text-[#021f3b] rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg self-start"
                  >
                    <Search size={20} />
                    Search Flights
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                  {[
                    { icon: <Mail size={18} />, label: "Email", value: user?.email },
                    { icon: <Phone size={18} />, label: "Phone", value: user?.phone },
                    { icon: <Globe size={18} />, label: "Agency", value: user?.agencyName },
                    { icon: <Calendar size={18} />, label: "Member Since", value: user?.memberSince },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">{item.icon}</div>
                      <div>
                        <p className="text-blue-200 text-xs">{item.label}</p>
                        <p className="text-sm font-medium truncate max-w-[120px]">{item.value || "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/15 transition cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white/20 rounded-lg">{metric.icon}</div>
                        <span className="text-xs text-blue-200">{metric.label}</span>
                      </div>
                      <p className="text-xl font-bold">{metric.value}</p>
                      <p className="text-xs text-blue-200 mt-1">{metric.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Wallet size={16} className="text-[#021f3b]" />
                Account Balance
              </h3>
              <button
                onClick={() => router.push("/user/sales/account-ledger")}
                className="text-xs font-semibold text-[#021f3b] bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                History <ArrowRight size={12} />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-xl p-4 mb-4 text-white bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600">
              <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Balance</p>
              <h2 className="text-3xl font-extrabold mt-1">
                SAR {walletBalance.toLocaleString()}
              </h2>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-100">
                <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                <span>Active</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Wallet Balance</span>
                <span className="font-bold text-gray-700">SAR {walletBalance.toLocaleString()}</span>
              </div>

              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-500">Total Credit Limit</span>
                <div className="text-right">
                  <div className="font-bold text-gray-700">SAR {creditLimit.toLocaleString()}</div>
                  <div className="text-xs font-semibold text-green-600 mt-0.5">
                    Remaining: SAR {remainingCredit.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Used Credit</span>
                <span className="font-bold text-red-600">SAR {usedCredit.toLocaleString()}</span>
              </div>

              <div className="pt-1">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor:
                        remainingPercent < 20 ? "#EF4444"
                        : remainingPercent < 50 ? "#F59E0B"
                        : "#10B981",
                      width: `${remainingPercent}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {Math.round(remainingPercent)}% remaining
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/user/deposits")}
              className="w-full mt-4 py-2.5 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              Add Funds
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* RECENT BOOKINGS */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
                <p className="text-sm text-gray-500">Your latest bookings</p>
              </div>
              <button
                onClick={() => router.push("/user/bookings/all-bookings")}
                className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["PNR", "Passenger", "Route", "Amount", "Status", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-[#021f3b]">{booking.pnr}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-800 font-medium">{booking.passenger}</p>
                          <p className="text-gray-500 text-xs">{booking.airline}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Plane size={14} /> {booking.route}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          SAR {booking.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Eye size={18} className="text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
                <p className="text-sm text-gray-500">Recent activity</p>
              </div>
              <button
                onClick={() => router.push("/user/ledger")}
                className="text-sm text-[#021f3b] font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount >= 0 ? "+" : ""}SAR {Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className={`text-xs ${transaction.status === "completed" || transaction.status === "success" ? "text-green-500" : "text-yellow-500"}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No recent transactions</p>
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
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
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeFilter === filter.id
                    ? "bg-[#021f3b] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden md:inline">{currentTime}</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition text-sm">
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-[#021f3b] text-white rounded-lg hover:bg-[#0a3a6b] transition text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsData().map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.changeType === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.changeType === "up" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}%
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Pending Tickets</p>
                <h3 className="text-3xl font-bold mt-2">{statusCounts?.pending || 0}</h3>
                <p className="text-orange-100 text-sm mt-1">Awaiting confirmation</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Clock size={28} /></div>
            </div>
            <button
              onClick={() => router.push("/user/bookings/pending")}
              className="mt-4 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              View Pending <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Today's Bookings</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.todayBookings || 0}</h3>
                <p className="text-blue-100 text-sm mt-1">New today</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Calendar size={28} /></div>
            </div>
            <button
              onClick={() => router.push("/user/bookings/all-bookings")}
              className="mt-4 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              View Bookings <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Confirmed Bookings</p>
                <h3 className="text-3xl font-bold mt-2">{statusCounts?.confirmed || 0}</h3>
                <p className="text-purple-100 text-sm mt-1">Successfully confirmed</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><CheckCircle size={28} /></div>
            </div>
            <button
              onClick={() => router.push("/user/bookings/all-bookings")}
              className="mt-4 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* NOTICE */}
        <div className="bg-gradient-to-r from-[#021f3b] via-[#0a3a6b] to-[#0a4d8c] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl"><Gift size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">Welcome!</h3>
                <p className="text-blue-200">
                  You have {stats?.totalBookings || 0} total bookings. Keep booking to unlock higher tiers!
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white text-[#021f3b] rounded-xl font-semibold hover:bg-blue-50 transition whitespace-nowrap">
              Learn More
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}