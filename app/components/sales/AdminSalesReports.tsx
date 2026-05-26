"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search, Download, Calendar, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown,
  FileText, Printer, RefreshCw, X, ChevronDown, TrendingUp,
  TrendingDown, Users, Plane, Receipt, Eye, Copy,
  CheckCircle2, XCircle, AlertCircle, FileSpreadsheet,
  File, RotateCcw, SlidersHorizontal, BarChart3,
  Building2, Clock, Info, Loader2, Share2, Sparkles, Target,
  Banknote, CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

interface SalesEntry {
  id: string;
  date: string;
  booking: string;
  pnr: string;
  route: string;
  origin: string;
  destination: string;
  pax: number;
  amount: number;
  currency: string;
  agent: string;
  agentName: string;
  status: string;
  commission: number;
  ticketType: string;
}

interface SalesStats {
  totalSales: number;
  totalCommission: number;
  totalPax: number;
  bookingCount: number;
  avgTicketPrice: number;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={12} /> },
    pending: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock size={12} /> },
    cancelled: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle size={12} /> },
    refunded: { bg: "bg-purple-50", text: "text-purple-700", icon: <RotateCcw size={12} /> },
  };
  return configs[status] || configs.pending;
};

const formatCurrency = (amount: number, currency = "SAR") =>
  new Intl.NumberFormat("en-SA", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-64 ${
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
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="hover:opacity-70"><X size={16} /></button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const MiniBarChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, i) => (
        <div key={i} className={`w-2 rounded-t ${color}`}
          style={{ height: `${(value / max) * 100}%`, opacity: 0.3 + (i / data.length) * 0.7 }} />
      ))}
    </div>
  );
};

const SaleDetailModal = ({ entry, onClose }: { entry: SalesEntry | null; onClose: () => void }) => {
  if (!entry) return null;
  const sc = getStatusConfig(entry.status);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Receipt size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{entry.booking}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                {entry.ticketType}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
            <X size={20} className="text-white" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold">{entry.origin || "—"}</p>
                <p className="text-slate-400 text-sm mt-1">Origin</p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex items-center w-full">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="flex-1 h-px bg-gradient-to-r from-white via-slate-500 to-emerald-400 mx-2 relative">
                    <Plane size={20} className="text-white absolute left-1/2 -translate-x-1/2 -top-2.5 rotate-90" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{entry.destination || "—"}</p>
                <p className="text-slate-400 text-sm mt-1">Destination</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-600">Status</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
              {sc.icon} {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Date", value: formatDate(entry.date) },
              { label: "PNR", value: entry.pnr || "—", mono: true },
              { label: "Passengers", value: `${entry.pax} Pax` },
              { label: "Commission", value: formatCurrency(entry.commission, entry.currency), green: true },
            ].map((row) => (
              <div key={row.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{row.label}</p>
                <p className={`font-semibold text-sm ${(row as any).green ? "text-emerald-600" : "text-slate-800"} ${(row as any).mono ? "font-mono" : ""}`}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">{entry.agentName}</p>
              <p className="text-xs text-slate-500">{entry.agent}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-800">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-700">{formatCurrency(entry.amount, entry.currency)}</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition"><Printer size={18} className="text-slate-600" /></button>
            <button className="p-2 hover:bg-white rounded-lg transition"><Share2 size={18} className="text-slate-600" /></button>
            <button onClick={() => navigator.clipboard.writeText(entry.pnr || entry.booking)} className="p-2 hover:bg-white rounded-lg transition">
              <Copy size={18} className="text-slate-600" />
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ExportDropdown = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
            {[
              { format: "pdf", label: "Export as PDF", icon: <File size={16} className="text-rose-500" /> },
              { format: "excel", label: "Export as Excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
              { format: "csv", label: "Export as CSV", icon: <FileText size={16} className="text-blue-500" /> },
            ].map((item) => (
              <button key={item.format} onClick={() => { onExport(item.format); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                {item.icon} {item.label}
              </button>
            ))}
            <hr className="my-1.5 border-slate-100" />
            <button onClick={() => { onExport("print"); setIsOpen(false); }}
              className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3">
              <Printer size={16} className="text-slate-500" /> Print Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== MAIN ====================
export default function AgentSalesReport() {
  const [data, setData] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0, totalCommission: 0,
    totalPax: 0, bookingCount: 0, avgTicketPrice: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEntry, setSelectedEntry] = useState<SalesEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ✅ ONLY ONE fetch function — apiClient use করছে
  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", pageSize.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      // ✅ apiClient — NestJS /api/v1/sales
      const result = await apiClient(`/sales?${params.toString()}`);

      if (result?.success) {
        setData(result.data || []);
        setTotalRecords(result.total || 0);
        setTotalPages(result.totalPages || 0);
        if (result.stats) setStats(result.stats);
      } else {
        addToast("Failed to load sales data", "error");
      }
    } catch (error: any) {
      console.error("Sales fetch error:", error?.message);
      if (String(error?.message).includes("401")) {
        window.location.href = "/login";
        return;
      }
      addToast(error?.message || "Failed to fetch sales data", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter, dateFrom, dateTo, sortBy, sortOrder, addToast]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortOrder("desc"); }
    setPage(1);
  };

  const handleReset = () => {
    setSearchQuery(""); setStatusFilter("");
    setDateFrom(""); setDateTo("");
    setPage(1); setSortBy("date");
    setSortOrder("desc"); setSelectedIds(new Set());
    addToast("Filters cleared", "info");
  };

  const handleExport = (format: string) => {
    addToast(`Export coming soon (${format.toUpperCase()})`, "info");
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map((item) => item.id)));
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelectedIds(s);
  };

  const activeFilterCount = [statusFilter, dateFrom, dateTo].filter(Boolean).length;

  const grandTotal = useMemo(
    () => data.filter((i) => i.status !== "cancelled").reduce((s, i) => s + i.amount, 0),
    [data]
  );
  const totalPaxPage = useMemo(
    () => data.filter((i) => i.status !== "cancelled").reduce((s, i) => s + i.pax, 0),
    [data]
  );

  const dailySalesChart = [2400, 1800, 3200, 2800, 4100, 3600, 5200];

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown size={14} className="opacity-40" />;
    return sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} className="text-white" />
              </div>
              Sales Report
            </h1>
            <p className="text-slate-500 mt-1">Comprehensive sales analytics and transaction details</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={() => { addToast("Refreshing...", "info"); fetchSalesData(); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 md:p-5 shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">Total Sales</p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalSales)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={14} className="text-emerald-300" />
                  <span className="text-xs text-emerald-300 font-medium">Confirmed only</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Banknote size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4"><MiniBarChart data={dailySalesChart} color="bg-white" /></div>
          </div>
          {[
            { label: "Total Bookings", value: stats.bookingCount.toString(), icon: <Receipt size={20} className="text-indigo-600" />, iconBg: "bg-indigo-50", valueColor: "text-slate-800", trend: "+8.3%", trendUp: true },
            { label: "Total Passengers", value: stats.totalPax.toString(), icon: <Users size={20} className="text-purple-600" />, iconBg: "bg-purple-50", valueColor: "text-slate-800", trend: "+15.2%", trendUp: true },
            { label: "Commission", value: formatCurrency(stats.totalCommission), icon: <CreditCard size={20} className="text-emerald-600" />, iconBg: "bg-emerald-50", valueColor: "text-emerald-600", trend: "+5.7%", trendUp: true },
            { label: "Avg. Ticket", value: formatCurrency(Math.round(stats.avgTicketPrice)), icon: <Target size={20} className="text-amber-600" />, iconBg: "bg-amber-50", valueColor: "text-slate-800", trend: "-2.1%", trendUp: false },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">{card.label}</p>
                  <p className={`text-lg md:text-xl font-bold mt-1 ${card.valueColor}`}>{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trendUp ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
                    <span className={`text-xs font-medium ${card.trendUp ? "text-emerald-600" : "text-rose-600"}`}>{card.trend}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search booking, PNR, route..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              <button onClick={handleReset} className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2 shrink-0">
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="relative">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer min-w-[130px]">
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${showFilters ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date From</label>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date To</label>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <button onClick={handleReset} className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 transition">
                      Clear all filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
                <p className="text-white font-semibold">{selectedIds.size} sale{selectedIds.size > 1 ? "s" : ""} selected</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleExport("pdf")} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/30 transition">
                  <Download size={16} /> Export Selected
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{data.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalRecords}</span> sales
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white appearance-none pr-8 cursor-pointer">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading sales data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                    <th className="px-4 py-4 text-left">
                      <input type="checkbox" checked={data.length > 0 && selectedIds.size === data.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    {[
                      { label: "Date", column: "date", sortable: true },
                      { label: "Booking ID", column: "booking", sortable: false },
                      { label: "PNR", column: "pnr", sortable: false },
                      { label: "Route", column: "route", sortable: false },
                      { label: "Pax", column: "pax", sortable: true },
                      { label: "Status", column: "status", sortable: false },
                      { label: "Amount", column: "amount", sortable: true, right: true },
                      { label: "Agent", column: "agent", sortable: false },
                      { label: "Action", column: "action", sortable: false, center: true },
                    ].map((col) => (
                      <th key={col.column} className={`px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${(col as any).right ? "text-right" : (col as any).center ? "text-center" : "text-left"}`}>
                        {col.sortable ? (
                          <button onClick={() => handleSort(col.column)} className={`flex items-center gap-1 hover:text-slate-800 transition ${(col as any).right ? "ml-auto" : ""}`}>
                            {col.label} <SortIcon column={col.column} />
                          </button>
                        ) : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length > 0 ? (
                    data.map((item) => {
                      const sc = getStatusConfig(item.status);
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={`hover:bg-slate-50/80 transition group ${isSelected ? "bg-blue-50/50" : ""} ${item.status === "cancelled" ? "opacity-60" : ""}`}>
                          <td className="px-4 py-4">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Calendar size={14} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{formatDate(item.date)}</p>
                                <p className="text-xs text-slate-400">{formatTime(item.date)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => setSelectedEntry(item)}
                              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm">
                              <FileText size={12} /> {item.booking}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {item.pnr || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 text-sm">{item.origin || "—"}</span>
                              <div className="flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                <Plane size={12} className="text-blue-500 rotate-90" />
                                <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              </div>
                              <span className="font-semibold text-slate-800 text-sm">{item.destination || "—"}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{item.ticketType}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                                <Users size={12} className="text-purple-600" />
                              </div>
                              <span className="text-sm font-semibold text-slate-700">{item.pax}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                              {sc.icon} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className={`text-sm font-bold ${item.status === "cancelled" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                              {formatCurrency(item.amount, item.currency)}
                            </p>
                            {item.commission > 0 && (
                              <p className="text-xs text-emerald-600 font-medium">
                                +{formatCurrency(item.commission, item.currency)} comm.
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <Building2 size={12} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700 max-w-[120px] truncate">{item.agentName}</p>
                                <p className="text-xs text-slate-400 max-w-[120px] truncate">{item.agent}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setSelectedEntry(item)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                                <Eye size={16} className="text-slate-500" />
                              </button>
                              <button onClick={() => navigator.clipboard.writeText(item.pnr || item.booking)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                                <Copy size={16} className="text-slate-500" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-16 text-center">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No sales found</p>
                          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                          <button onClick={handleReset} className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                            <RotateCcw size={16} /> Reset Filters
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </tbody>
                {data.length > 0 && (
                  <tfoot>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Sparkles size={18} />
                          <span className="font-bold text-lg">Grand Total</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span className="font-bold">{totalPaxPage} Pax</span>
                        </div>
                      </td>
                      <td className="px-4 py-4" />
                      <td className="px-4 py-4 text-right">
                        <span className="text-xl font-bold">{formatCurrency(grandTotal)}</span>
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {!loading && totalRecords > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages || 1}</span>
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button disabled={page === 1} onClick={() => setPage(1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <div className="flex items-center gap-1 mx-1 md:mx-2">
                {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                  let pageNum: number;
                  const total = totalPages || 1;
                  if (total <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= total - 2) pageNum = total - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-medium transition ${page === pageNum ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "hover:bg-slate-100 text-slate-600 border border-slate-200"}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(totalPages)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <SaleDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}