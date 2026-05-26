"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, Users, Ticket, XCircle, CheckCircle2, DollarSign,
  TrendingUp, TrendingDown, Calendar, Download, RefreshCw, BarChart3,
  PieChart, ArrowUpRight, ArrowDownRight, Banknote, CreditCard, Receipt,
  RotateCcw, Ban, Wallet, UserCheck, FileText, Clock, Target, Layers,
  ChevronDown, Printer, FileSpreadsheet, File, X, Info, AlertCircle,
  Sparkles, Activity, BadgePercent, Loader2, Eye, Share2, ArrowLeftRight,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import ToastContainer from "./ToastContainer";
import ExportDropdown from "./ExportDropdown";
import {
  StatsResponse, SummaryData, TopRoute,
  ApiResponse, StatItem, DateRange, ReportToast,
} from "./report-types";

// ── Helpers ──
const formatCurrency = (amount: number, currency = "SAR") =>
  new Intl.NumberFormat("en-SA", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
};

const DATE_RANGES: DateRange[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "All Time", value: "all" },
];

// ── Stat Card ──
function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const formatValue = (value: number, format: string) => {
    if (format === "currency") return formatCurrency(value);
    if (format === "percentage") return `${value}%`;
    return formatNumber(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden bg-white rounded-2xl p-5 border ${stat.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 group`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bgColor} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            stat.changeType === "increase" ? "bg-emerald-50 text-emerald-600"
            : stat.changeType === "decrease" ? "bg-rose-50 text-rose-600"
            : "bg-slate-50 text-slate-600"
          }`}>
            {stat.changeType === "increase" && <ArrowUpRight size={12} />}
            {stat.changeType === "decrease" && <ArrowDownRight size={12} />}
            {Math.abs(stat.change)}%
          </div>
        </div>
        <p className={`text-2xl font-bold ${stat.color}`}>
          {formatValue(stat.value, stat.format)}
        </p>
        <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(stat.change) * 2 + 40, 100)}%` }}
            transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
            className={`h-full rounded-full ${
              stat.changeType === "increase" ? "bg-emerald-400"
              : stat.changeType === "decrease" ? "bg-rose-400"
              : "bg-slate-400"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Summary Card ──
function SummaryCard({
  title, value, icon, gradient, subValue, subLabel,
}: {
  title: string; value: string; icon: React.ReactNode;
  gradient: string; subValue?: string; subLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl p-6 ${gradient} text-white shadow-lg`}
    >
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {icon}
          </div>
          <Sparkles size={24} className="text-white/40" />
        </div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subValue && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-white/60" />
              <span className="text-sm text-white/80">
                {subLabel}: <span className="font-semibold">{subValue}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Category Section ──
function CategorySection({
  title, icon, stats, iconBg,
}: {
  title: string; icon: React.ReactNode; stats: StatItem[]; iconBg: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-400">{stats.length} metrics</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN ====================
export default function UserSalesReport() {
  const [selectedRange, setSelectedRange] = useState("today");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "category">("category");
  const [toasts, setToasts] = useState<ReportToast[]>([]);
  const [apiStats, setApiStats] = useState<StatsResponse | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [topRoutes, setTopRoutes] = useState<TopRoute[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // ── Toast ──
  const addToast = useCallback((message: string, type: ReportToast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch ──
  // ✅ useCallback dependency: selectedRange, customDateFrom, customDateTo
  // যখনই এগুলো change হবে, fetchData নতুন হবে
  // useEffect তখন auto-call করবে
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range: selectedRange });
      if (customDateFrom) params.set("dateFrom", customDateFrom);
      if (customDateTo) params.set("dateTo", customDateTo);

      const data: ApiResponse = await apiClient(`/agent/all-report?${params}`);

      if (data.success) {
        setApiStats(data.stats);
        setSummary(data.summary);
        setTopRoutes(data.topRoutes || []);
        setDateRange(data.dateRange);
      } else {
        addToast("Failed to load report data", "error");
      }
    } catch (error: any) {
      if (!String(error?.message || "").includes("401")) {
        addToast("Error loading report data", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedRange, customDateFrom, customDateTo, addToast]);

  // ✅ Single useEffect — fetchData change হলেই call হবে
  // এতে double fetch হবে না
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stat items ──
  const statItems: StatItem[] = useMemo(() => {
    if (!apiStats) return [];
    return [
      // Overview
      { id: "searchCount", label: "Search Count", value: apiStats.searchCount.value, change: apiStats.searchCount.change, changeType: apiStats.searchCount.changeType, icon: <Search size={22} />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-100", format: "number", category: "overview" },
      { id: "totalFlyer", label: "Total Passengers", value: apiStats.totalFlyer.value, change: apiStats.totalFlyer.change, changeType: apiStats.totalFlyer.changeType, icon: <UserCheck size={22} />, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-100", format: "number", category: "overview" },
      { id: "totalSegments", label: "Total Segments", value: apiStats.totalSegments.value, change: apiStats.totalSegments.change, changeType: apiStats.totalSegments.changeType, icon: <Layers size={22} />, color: "text-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-100", format: "number", category: "overview" },
      // Booking
      { id: "bookingCount", label: "Total Bookings", value: apiStats.bookingCount.value, change: apiStats.bookingCount.change, changeType: apiStats.bookingCount.changeType, icon: <Ticket size={22} />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-100", format: "number", category: "booking" },
      { id: "issueCount", label: "Tickets Issued", value: apiStats.issueCount.value, change: apiStats.issueCount.change, changeType: apiStats.issueCount.changeType, icon: <CheckCircle2 size={22} />, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-100", format: "number", category: "booking" },
      { id: "bookingCancelled", label: "Cancelled", value: apiStats.bookingCancelled.value, change: apiStats.bookingCancelled.change, changeType: apiStats.bookingCancelled.changeType, icon: <XCircle size={22} />, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-100", format: "number", category: "booking" },
      { id: "pendingBookings", label: "Pending", value: apiStats.pendingBookings.value, change: apiStats.pendingBookings.change, changeType: apiStats.pendingBookings.changeType, icon: <Clock size={22} />, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-100", format: "number", category: "booking" },
      // Financial
      { id: "ticketedAmount", label: "Ticketed Amount", value: apiStats.ticketedAmount.value, change: apiStats.ticketedAmount.change, changeType: apiStats.ticketedAmount.changeType, icon: <Banknote size={22} />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-100", format: "currency", category: "financial" },
      { id: "depositAmount", label: "Deposit Amount", value: apiStats.depositAmount.value, change: apiStats.depositAmount.change, changeType: apiStats.depositAmount.changeType, icon: <Wallet size={22} />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-100", format: "currency", category: "financial" },
      { id: "depositCount", label: "Deposit Count", value: apiStats.depositCount.value, change: apiStats.depositCount.change, changeType: apiStats.depositCount.changeType, icon: <CreditCard size={22} />, color: "text-sky-600", bgColor: "bg-sky-50", borderColor: "border-sky-100", format: "number", category: "financial" },
      { id: "lossProfit", label: "Profit/Loss", value: apiStats.lossProfit.value, change: apiStats.lossProfit.change, changeType: apiStats.lossProfit.changeType, icon: <TrendingUp size={22} />, color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-100", format: "currency", category: "financial" },
      // Operations
      { id: "refundCount", label: "Refund Count", value: apiStats.refundCount.value, change: apiStats.refundCount.change, changeType: apiStats.refundCount.changeType, icon: <RotateCcw size={22} />, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-100", format: "number", category: "operations" },
      { id: "refundAmount", label: "Refund Amount", value: apiStats.refundAmount.value, change: apiStats.refundAmount.change, changeType: apiStats.refundAmount.changeType, icon: <ArrowLeftRight size={22} />, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-100", format: "currency", category: "operations" },
      { id: "voidCount", label: "Void Count", value: apiStats.voidCount.value, change: apiStats.voidCount.change, changeType: apiStats.voidCount.changeType, icon: <Ban size={22} />, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-100", format: "number", category: "operations" },
      { id: "voidAmount", label: "Void Amount", value: apiStats.voidAmount.value, change: apiStats.voidAmount.change, changeType: apiStats.voidAmount.changeType, icon: <XCircle size={22} />, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-100", format: "currency", category: "operations" },
    ] as StatItem[];
  }, [apiStats]);

  const groupedStats = useMemo(() => ({
    overview: statItems.filter((s) => s.category === "overview"),
    booking: statItems.filter((s) => s.category === "booking"),
    financial: statItems.filter((s) => s.category === "financial"),
    operations: statItems.filter((s) => s.category === "operations"),
  }), [statItems]);

  // ── Handlers ──
  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    if (value !== "custom") setShowCustomDate(false);
    else setShowCustomDate(true);
  };

  const handleExport = async (format: string) => {
    addToast(`Exporting report as ${format.toUpperCase()}...`, "info");
    try {
      const params = new URLSearchParams({
        format,
        ...(dateRange.startDate && { dateFrom: dateRange.startDate }),
        ...(dateRange.endDate && { dateTo: dateRange.endDate }),
      });
      await apiClient(`/agent/all-report/export?${params}`);
      addToast("Report exported successfully!", "success");
    } catch {
      addToast("Export error", "error");
    }
  };

  const handleApplyCustomDate = () => {
    if (customDateFrom && customDateTo) fetchData();
    else addToast("Please select both start and end dates", "warning");
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} className="text-white" />
              </div>
              My Sales Report
            </h1>
            <p className="text-slate-500 mt-1">Your sales analytics and performance metrics</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button onClick={() => setViewMode("category")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "category" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <Layers size={16} />
              </button>
              <button onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <PieChart size={16} />
              </button>
            </div>
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => { addToast("Refreshing...", "info"); fetchData(); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition shadow-sm disabled:opacity-70">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* ── DATE RANGE TABS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {DATE_RANGES.map((range) => (
                <button key={range.value} onClick={() => handleRangeChange(range.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedRange === range.value && !showCustomDate
                      ? "bg-slate-800 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {range.label}
                </button>
              ))}
              {/* ✅ Custom button separate */}
              <button onClick={() => setShowCustomDate(!showCustomDate)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  showCustomDate
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                <Calendar size={14} /> Custom
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-400">From:</span>
                <span className="font-semibold text-slate-700">{dateRange.startDate || "-"}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-400">To:</span>
                <span className="font-semibold text-slate-700">{dateRange.endDate || "-"}</span>
              </div>
            </div>
          </div>

          {/* Custom date inputs */}
          <AnimatePresence>
            {showCustomDate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
                    <input type="date" value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
                    <input type="date" value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400" />
                  </div>
                  <button onClick={handleApplyCustomDate}
                    className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition">
                    Apply Range
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── SUMMARY CARDS ── */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Revenue"
              value={formatCurrency(summary.ticketedAmount)}
              icon={<Banknote size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-slate-700 to-slate-900"
              subValue={`${apiStats?.ticketedAmount.change || 0}%`}
              subLabel="vs last period"
            />
            <SummaryCard
              title="Total Bookings"
              value={formatNumber(summary.bookingCount)}
              icon={<Ticket size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
              subValue={`${apiStats?.bookingCount.change || 0}%`}
              subLabel="vs last period"
            />
            <SummaryCard
              title="Net Profit"
              value={formatCurrency(summary.profitLoss)}
              icon={<TrendingUp size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              subValue={`${apiStats?.lossProfit.change || 0}%`}
              subLabel="vs last period"
            />
            <SummaryCard
              title="Total Passengers"
              value={formatNumber(summary.totalFlyer)}
              icon={<Users size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              subValue={`${apiStats?.totalFlyer.change || 0}%`}
              subLabel="vs last period"
            />
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-slate-400 animate-spin" />
              <p className="text-slate-500 font-medium">Loading report data...</p>
            </div>
          </motion.div>
        )}

        {/* ── STATS DISPLAY ── */}
        {!loading && apiStats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {viewMode === "category" ? (
              <div className="space-y-8">
                <CategorySection
                  title="Overview Metrics"
                  icon={<Activity size={20} className="text-white" />}
                  stats={groupedStats.overview}
                  iconBg="bg-slate-700"
                />
                <CategorySection
                  title="Booking Statistics"
                  icon={<Ticket size={20} className="text-white" />}
                  stats={groupedStats.booking}
                  iconBg="bg-emerald-500"
                />
                <CategorySection
                  title="Financial Metrics"
                  icon={<DollarSign size={20} className="text-white" />}
                  stats={groupedStats.financial}
                  iconBg="bg-purple-500"
                />
                <CategorySection
                  title="Operations"
                  icon={<RefreshCw size={20} className="text-white" />}
                  stats={groupedStats.operations}
                  iconBg="bg-orange-500"
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">All Metrics</h3>
                  <span className="text-sm text-slate-400">{statItems.length} total metrics</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {statItems.map((stat, index) => (
                    <StatCard key={stat.id} stat={stat} index={index} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── QUICK INSIGHTS ── */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="text-amber-400" />
              <h3 className="text-lg font-bold">Quick Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-emerald-400" />
                  <span className="text-sm text-slate-300">Conversion Rate</span>
                </div>
                <p className="text-2xl font-bold">{summary.conversionRate}%</p>
                <p className="text-xs text-emerald-400 mt-1">Bookings to tickets ratio</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={16} className="text-blue-400" />
                  <span className="text-sm text-slate-300">Avg. Ticket Value</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(summary.avgTicketValue)}</p>
                <p className="text-xs text-blue-400 mt-1">Per confirmed booking</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BadgePercent size={16} className="text-purple-400" />
                  <span className="text-sm text-slate-300">Profit Margin</span>
                </div>
                <p className="text-2xl font-bold">{summary.profitMargin}%</p>
                <p className="text-xs text-purple-400 mt-1">Net profit percentage</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-amber-400" />
                  <span className="text-sm text-slate-300">Top Route</span>
                </div>
                <p className="text-2xl font-bold">{topRoutes[0]?.route || "N/A"}</p>
                <p className="text-xs text-amber-400 mt-1">
                  {topRoutes[0]?.percentage || 0}% of bookings
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:text-slate-700 transition">
              <Share2 size={16} /> Share Report
            </button>
            <button className="flex items-center gap-2 hover:text-slate-700 transition">
              <Eye size={16} /> View Full Analytics
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── TOAST ── */}
      {/* ✅ toasts directly pass করছি — spread করার দরকার নেই */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}