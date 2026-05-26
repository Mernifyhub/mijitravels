"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, Users, Plane, Ticket, XCircle, CheckCircle2,
  DollarSign, TrendingUp, TrendingDown, Calendar, Download,
  RefreshCw, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Banknote, CreditCard, Receipt, RotateCcw, Ban, Wallet,
  UserCheck, FileText, Clock, Target, Layers, ChevronDown,
  Printer, FileSpreadsheet, File, X, Info, AlertCircle,
  Sparkles, Activity, Percent, Globe, Send, ArrowLeftRight,
  BadgePercent, Loader2, Eye, Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

// ==================== TYPES ====================
interface DashboardStats {
  // Overview
  searchCount: number;
  agentCount: number;
  totalFlyer: number;
  totalSegments: number;

  // Booking
  bookingCount: number;
  issueCount: number;
  bookingCancelled: number;
  pendingBookings: number;

  // Financial
  ticketedAmount: number;
  depositAmount: number;
  depositCount: number;
  lossProfit: number;
  currency: string;

  // Operations
  refundCount: number;
  refundAmount: number;
  reissueCount: number;
  reissueAmount: number;
  voidCount: number;
  voidAmount: number;

  // Extra
  conversionRate: number;
  avgTicketValue: number;
  profitMargin: number;
  topRoute: string;
}

interface DateRange {
  label: string;
  value: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ==================== DATE RANGES ====================
const dateRanges: DateRange[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "All Time", value: "all" },
];

// ==================== HELPERS ====================
const formatCurrency = (amount: number, currency = "SAR") =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return (num || 0).toLocaleString();
};

// ==================== TOAST ====================
const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === "success" ? "bg-emerald-500 text-white"
            : toast.type === "error" ? "bg-rose-500 text-white"
            : toast.type === "warning" ? "bg-amber-500 text-white"
            : "bg-slate-800 text-white"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={18} />}
          {toast.type === "error" && <XCircle size={18} />}
          {toast.type === "warning" && <AlertCircle size={18} />}
          {toast.type === "info" && <Info size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
            <X size={16} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ==================== STAT CARD ====================
interface StatCardProps {
  label: string;
  value: number;
  format: "number" | "currency";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  index: number;
  currency?: string;
}

const StatCard = ({
  label, value, format, icon, color, bgColor, borderColor,
  change = 0, changeType = "neutral", index, currency = "SAR",
}: StatCardProps) => {
  const displayValue =
    format === "currency"
      ? formatCurrency(value, currency)
      : formatNumber(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden bg-white rounded-2xl p-5 border ${borderColor} shadow-sm hover:shadow-lg transition-all duration-300 group`}
    >
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${bgColor} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              changeType === "increase" ? "bg-emerald-50 text-emerald-600"
              : changeType === "decrease" ? "bg-rose-50 text-rose-600"
              : "bg-slate-50 text-slate-600"
            }`}>
              {changeType === "increase" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <p className={`text-2xl font-bold ${color}`}>{displayValue}</p>
        <p className="text-sm text-slate-500 font-medium mt-1">{label}</p>

        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(change) * 2 + 40, 100)}%` }}
            transition={{ delay: index * 0.04 + 0.3, duration: 0.8 }}
            className={`h-full rounded-full ${
              changeType === "increase" ? "bg-emerald-400"
              : changeType === "decrease" ? "bg-rose-400"
              : "bg-slate-400"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ==================== SUMMARY CARD ====================
const SummaryCard = ({
  title, value, icon, gradient, subValue, subLabel,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  subValue?: string;
  subLabel?: string;
}) => (
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
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
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

// ==================== CATEGORY SECTION ====================
const CategorySection = ({
  title, icon, color, children,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {children}
    </div>
  </div>
);

// ==================== EXPORT DROPDOWN ====================
const ExportDropdown = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20"
            >
              {[
                { format: "pdf", label: "Export as PDF", icon: <File size={16} className="text-rose-500" /> },
                { format: "excel", label: "Export as Excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
              ].map((item) => (
                <button
                  key={item.format}
                  onClick={() => { onExport(item.format); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <hr className="my-1.5 border-slate-100" />
              <button
                onClick={() => { onExport("print"); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              >
                <Printer size={16} className="text-slate-500" /> Print Report
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== SKELETON ====================
const StatSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4].map((section) => (
      <div key={section} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="w-40 h-6 bg-slate-200 rounded" />
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="w-16 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="w-24 h-7 bg-slate-200 rounded mb-2" />
              <div className="w-32 h-4 bg-slate-200 rounded" />
              <div className="mt-3 h-1.5 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ==================== DEFAULT STATS ====================
const defaultStats: DashboardStats = {
  searchCount: 0, agentCount: 0, totalFlyer: 0, totalSegments: 0,
  bookingCount: 0, issueCount: 0, bookingCancelled: 0, pendingBookings: 0,
  ticketedAmount: 0, depositAmount: 0, depositCount: 0, lossProfit: 0,
  currency: "SAR",
  refundCount: 0, refundAmount: 0, reissueCount: 0, reissueAmount: 0,
  voidCount: 0, voidAmount: 0,
  conversionRate: 0, avgTicketValue: 0, profitMargin: 0, topRoute: "-",
};

// ==================== MAIN COMPONENT ====================
export default function SalesReport() {
  const [selectedRange, setSelectedRange] = useState("today");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"category" | "grid">("category");
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // ── Toast ──
  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    },
    []
  );
  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch Dashboard Stats ──
  const fetchStats = useCallback(
    async (range: string, isRefresh = false, fromDate?: string, toDate?: string) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        // ✅ Build query params
        const params = new URLSearchParams();
        params.set("range", range);
        if (range === "custom" && fromDate && toDate) {
          params.set("startDate", fromDate);
          params.set("endDate", toDate);
        }

        // ✅ API call — NestJS /api/v1/dashboard
        const result = await apiClient(`/dashboard?${params.toString()}`);

        // ✅ Map API response to our state
        setStats({
          // Overview
          searchCount: result.searchCount || 0,
          agentCount: result.agentCount || 0,
          totalFlyer: result.totalFlyer || 0,
          totalSegments: result.totalSegments || 0,

          // Booking
          bookingCount: result.bookingCount || 0,
          issueCount: result.issueCount || 0,
          bookingCancelled: result.bookingCancelled || 0,
          pendingBookings: result.pendingBookings || 0,

          // Financial
          ticketedAmount: result.ticketedAmount || 0,
          depositAmount: result.depositAmount || 0,
          depositCount: result.depositCount || 0,
          lossProfit: result.lossProfit || 0,
          currency: result.currency || "SAR",

          // Operations
          refundCount: result.refundCount || 0,
          refundAmount: result.refundAmount || 0,
          reissueCount: result.reissueCount || 0,
          reissueAmount: result.reissueAmount || 0,
          voidCount: result.voidCount || 0,
          voidAmount: result.voidAmount || 0,

          // Extra insights
          conversionRate: result.conversionRate || 0,
          avgTicketValue: result.avgTicketValue || 0,
          profitMargin: result.profitMargin || 0,
          topRoute: result.topRoute || "-",
        });

        setLastUpdated(new Date());
        if (isRefresh) addToast("Report refreshed successfully!", "success");
      } catch (error: any) {
        console.error("Dashboard fetch error:", error?.message);
        if (String(error?.message).includes("401")) {
          window.location.href = "/login";
          return;
        }
        addToast("Failed to load report data", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addToast]
  );

  // ✅ Initial fetch
  useEffect(() => {
    fetchStats(selectedRange);
  }, []);

  // ── Handlers ──
  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    setShowCustomDate(value === "custom");
    if (value !== "custom") {
      fetchStats(value);
      addToast(
        `Showing: ${dateRanges.find((r) => r.value === value)?.label}`,
        "info"
      );
    }
  };

  const handleRefresh = () => fetchStats(selectedRange, true);

  const handleApplyCustomDate = () => {
    if (customDateFrom && customDateTo) {
      fetchStats("custom", false, customDateFrom, customDateTo);
      addToast(`Custom range: ${customDateFrom} → ${customDateTo}`, "success");
    } else {
      addToast("Please select both start and end dates", "warning");
    }
  };

  const handleExport = (format: string) => {
    addToast(`Exporting as ${format.toUpperCase()}...`, "info");
    setTimeout(() => addToast("Export completed!", "success"), 1500);
  };

  const cur = stats.currency || "SAR";

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} className="text-white" />
              </div>
              Sales Report
            </h1>
            <p className="text-slate-500 mt-1">Comprehensive analytics and performance metrics</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* View mode toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("category")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "category" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <PieChart size={16} />
              </button>
            </div>

            <ExportDropdown onExport={handleExport} />

            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* ── DATE RANGE TABS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5"
        >
          <div className="flex flex-wrap gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleRangeChange(range.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedRange === range.value && !showCustomDate
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {range.label}
              </button>
            ))}
            <button
              onClick={() => {
                setShowCustomDate(!showCustomDate);
                if (!showCustomDate) setSelectedRange("custom");
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                showCustomDate
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Calendar size={14} />
              Custom
            </button>
          </div>

          {/* Custom Date Picker */}
          <AnimatePresence>
            {showCustomDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button
                    onClick={handleApplyCustomDate}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Apply Range
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── SUMMARY CARDS ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <SummaryCard
              title="Total Revenue"
              value={formatCurrency(stats.ticketedAmount, cur)}
              icon={<Banknote size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              subLabel="Bookings"
              subValue={formatNumber(stats.bookingCount)}
            />
            <SummaryCard
              title="Total Bookings"
              value={formatNumber(stats.bookingCount)}
              icon={<Ticket size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
              subLabel="Issued"
              subValue={formatNumber(stats.issueCount)}
            />
            <SummaryCard
              title="Net Profit"
              value={formatCurrency(stats.lossProfit, cur)}
              icon={<TrendingUp size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              subLabel="Margin"
              subValue={`${stats.profitMargin?.toFixed(1) || 0}%`}
            />
            <SummaryCard
              title="Total Passengers"
              value={formatNumber(stats.totalFlyer)}
              icon={<Users size={28} className="text-white" />}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              subLabel="Segments"
              subValue={formatNumber(stats.totalSegments)}
            />
          </motion.div>
        )}

        {/* ── STATS DISPLAY ── */}
        {loading ? (
          <StatSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {viewMode === "category" ? (
              <div className="space-y-8">
                {/* Overview */}
                <CategorySection
                  title="Overview Metrics"
                  icon={<Activity size={20} className="text-white" />}
                  color="bg-blue-500"
                >
                  <StatCard index={0} label="Search Count" value={stats.searchCount} format="number"
                    icon={<Search size={22} />} color="text-blue-600" bgColor="bg-blue-50" borderColor="border-blue-100" />
                  <StatCard index={1} label="Active Agents" value={stats.agentCount} format="number"
                    icon={<Users size={22} />} color="text-purple-600" bgColor="bg-purple-50" borderColor="border-purple-100" />
                  <StatCard index={2} label="Total Passengers" value={stats.totalFlyer} format="number"
                    icon={<UserCheck size={22} />} color="text-indigo-600" bgColor="bg-indigo-50" borderColor="border-indigo-100" />
                  <StatCard index={3} label="Total Segments" value={stats.totalSegments} format="number"
                    icon={<Layers size={22} />} color="text-cyan-600" bgColor="bg-cyan-50" borderColor="border-cyan-100" />
                </CategorySection>

                {/* Booking */}
                <CategorySection
                  title="Booking Statistics"
                  icon={<Ticket size={20} className="text-white" />}
                  color="bg-emerald-500"
                >
                  <StatCard index={0} label="Total Bookings" value={stats.bookingCount} format="number"
                    icon={<Ticket size={22} />} color="text-emerald-600" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
                  <StatCard index={1} label="Tickets Issued" value={stats.issueCount} format="number"
                    icon={<CheckCircle2 size={22} />} color="text-green-600" bgColor="bg-green-50" borderColor="border-green-100" />
                  <StatCard index={2} label="Cancelled" value={stats.bookingCancelled} format="number"
                    changeType="decrease"
                    icon={<XCircle size={22} />} color="text-rose-600" bgColor="bg-rose-50" borderColor="border-rose-100" />
                  <StatCard index={3} label="Pending" value={stats.pendingBookings} format="number"
                    icon={<Clock size={22} />} color="text-amber-600" bgColor="bg-amber-50" borderColor="border-amber-100" />
                </CategorySection>

                {/* Financial */}
                <CategorySection
                  title="Financial Metrics"
                  icon={<DollarSign size={20} className="text-white" />}
                  color="bg-purple-500"
                >
                  <StatCard index={0} label="Ticketed Amount" value={stats.ticketedAmount} format="currency" currency={cur}
                    icon={<Banknote size={22} />} color="text-emerald-600" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
                  <StatCard index={1} label="Deposit Amount" value={stats.depositAmount} format="currency" currency={cur}
                    icon={<Wallet size={22} />} color="text-blue-600" bgColor="bg-blue-50" borderColor="border-blue-100" />
                  <StatCard index={2} label="Deposit Count" value={stats.depositCount} format="number"
                    icon={<CreditCard size={22} />} color="text-sky-600" bgColor="bg-sky-50" borderColor="border-sky-100" />
                  <StatCard index={3} label="Profit / Loss" value={stats.lossProfit} format="currency" currency={cur}
                    icon={<TrendingUp size={22} />} color="text-teal-600" bgColor="bg-teal-50" borderColor="border-teal-100" />
                </CategorySection>

                {/* Operations */}
                <CategorySection
                  title="Operations"
                  icon={<RefreshCw size={20} className="text-white" />}
                  color="bg-orange-500"
                >
                  <StatCard index={0} label="Refund Count" value={stats.refundCount} format="number"
                    changeType="decrease"
                    icon={<RotateCcw size={22} />} color="text-orange-600" bgColor="bg-orange-50" borderColor="border-orange-100" />
                  <StatCard index={1} label="Refund Amount" value={stats.refundAmount} format="currency" currency={cur}
                    changeType="decrease"
                    icon={<ArrowLeftRight size={22} />} color="text-orange-600" bgColor="bg-orange-50" borderColor="border-orange-100" />
                  <StatCard index={2} label="Reissue Count" value={stats.reissueCount} format="number"
                    icon={<RefreshCw size={22} />} color="text-violet-600" bgColor="bg-violet-50" borderColor="border-violet-100" />
                  <StatCard index={3} label="Reissue Amount" value={stats.reissueAmount} format="currency" currency={cur}
                    icon={<Send size={22} />} color="text-violet-600" bgColor="bg-violet-50" borderColor="border-violet-100" />
                  <StatCard index={4} label="Void Count" value={stats.voidCount} format="number"
                    changeType="decrease"
                    icon={<Ban size={22} />} color="text-slate-600" bgColor="bg-slate-50" borderColor="border-slate-100" />
                  <StatCard index={5} label="Void Amount" value={stats.voidAmount} format="currency" currency={cur}
                    changeType="decrease"
                    icon={<XCircle size={22} />} color="text-slate-600" bgColor="bg-slate-50" borderColor="border-slate-100" />
                </CategorySection>
              </div>
            ) : (
              /* Grid View — all metrics together */
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">All Metrics</h3>
                  <span className="text-sm text-slate-400">18 metrics</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {/* Overview */}
                  <StatCard index={0} label="Search Count" value={stats.searchCount} format="number"
                    icon={<Search size={22} />} color="text-blue-600" bgColor="bg-blue-50" borderColor="border-blue-100" />
                  <StatCard index={1} label="Active Agents" value={stats.agentCount} format="number"
                    icon={<Users size={22} />} color="text-purple-600" bgColor="bg-purple-50" borderColor="border-purple-100" />
                  <StatCard index={2} label="Total Passengers" value={stats.totalFlyer} format="number"
                    icon={<UserCheck size={22} />} color="text-indigo-600" bgColor="bg-indigo-50" borderColor="border-indigo-100" />
                  <StatCard index={3} label="Total Segments" value={stats.totalSegments} format="number"
                    icon={<Layers size={22} />} color="text-cyan-600" bgColor="bg-cyan-50" borderColor="border-cyan-100" />
                  {/* Booking */}
                  <StatCard index={4} label="Total Bookings" value={stats.bookingCount} format="number"
                    icon={<Ticket size={22} />} color="text-emerald-600" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
                  <StatCard index={5} label="Tickets Issued" value={stats.issueCount} format="number"
                    icon={<CheckCircle2 size={22} />} color="text-green-600" bgColor="bg-green-50" borderColor="border-green-100" />
                  <StatCard index={6} label="Cancelled" value={stats.bookingCancelled} format="number"
                    changeType="decrease" icon={<XCircle size={22} />} color="text-rose-600" bgColor="bg-rose-50" borderColor="border-rose-100" />
                  <StatCard index={7} label="Pending" value={stats.pendingBookings} format="number"
                    icon={<Clock size={22} />} color="text-amber-600" bgColor="bg-amber-50" borderColor="border-amber-100" />
                  {/* Financial */}
                  <StatCard index={8} label="Ticketed Amount" value={stats.ticketedAmount} format="currency" currency={cur}
                    icon={<Banknote size={22} />} color="text-emerald-600" bgColor="bg-emerald-50" borderColor="border-emerald-100" />
                  <StatCard index={9} label="Deposit Amount" value={stats.depositAmount} format="currency" currency={cur}
                    icon={<Wallet size={22} />} color="text-blue-600" bgColor="bg-blue-50" borderColor="border-blue-100" />
                  <StatCard index={10} label="Deposit Count" value={stats.depositCount} format="number"
                    icon={<CreditCard size={22} />} color="text-sky-600" bgColor="bg-sky-50" borderColor="border-sky-100" />
                  <StatCard index={11} label="Profit / Loss" value={stats.lossProfit} format="currency" currency={cur}
                    icon={<TrendingUp size={22} />} color="text-teal-600" bgColor="bg-teal-50" borderColor="border-teal-100" />
                  {/* Operations */}
                  <StatCard index={12} label="Refund Count" value={stats.refundCount} format="number"
                    changeType="decrease" icon={<RotateCcw size={22} />} color="text-orange-600" bgColor="bg-orange-50" borderColor="border-orange-100" />
                  <StatCard index={13} label="Refund Amount" value={stats.refundAmount} format="currency" currency={cur}
                    changeType="decrease" icon={<ArrowLeftRight size={22} />} color="text-orange-600" bgColor="bg-orange-50" borderColor="border-orange-100" />
                  <StatCard index={14} label="Reissue Count" value={stats.reissueCount} format="number"
                    icon={<RefreshCw size={22} />} color="text-violet-600" bgColor="bg-violet-50" borderColor="border-violet-100" />
                  <StatCard index={15} label="Reissue Amount" value={stats.reissueAmount} format="currency" currency={cur}
                    icon={<Send size={22} />} color="text-violet-600" bgColor="bg-violet-50" borderColor="border-violet-100" />
                  <StatCard index={16} label="Void Count" value={stats.voidCount} format="number"
                    changeType="decrease" icon={<Ban size={22} />} color="text-slate-600" bgColor="bg-slate-50" borderColor="border-slate-100" />
                  <StatCard index={17} label="Void Amount" value={stats.voidAmount} format="currency" currency={cur}
                    changeType="decrease" icon={<XCircle size={22} />} color="text-slate-600" bgColor="bg-slate-50" borderColor="border-slate-100" />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── QUICK INSIGHTS ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white"
          >
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
                <p className="text-2xl font-bold">
                  {stats.conversionRate?.toFixed(1) || "0"}%
                </p>
                <p className="text-xs text-emerald-400 mt-1">
                  {stats.bookingCount} bookings from {stats.searchCount} searches
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={16} className="text-blue-400" />
                  <span className="text-sm text-slate-300">Avg. Ticket Value</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.avgTicketValue, cur)}
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Per booking average
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BadgePercent size={16} className="text-purple-400" />
                  <span className="text-sm text-slate-300">Profit Margin</span>
                </div>
                <p className="text-2xl font-bold">
                  {stats.profitMargin?.toFixed(1) || "0"}%
                </p>
                <p className="text-xs text-purple-400 mt-1">
                  {formatCurrency(stats.lossProfit, cur)} net profit
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-amber-400" />
                  <span className="text-sm text-slate-300">Top Route</span>
                </div>
                <p className="text-2xl font-bold">{stats.topRoute || "-"}</p>
                <p className="text-xs text-amber-400 mt-1">Most popular route</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}