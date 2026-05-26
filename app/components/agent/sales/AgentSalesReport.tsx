"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, FileText, RefreshCw, X, ChevronDown,
  TrendingUp, TrendingDown, Users, Plane, Receipt, Eye, RotateCcw,
  SlidersHorizontal, BarChart3, Loader2, Sparkles, Banknote, CreditCard, Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

import ToastContainer from "./ToastContainer";
import ExportDropdown from "./ExportDropdown";
import SaleDetailModal from "./SaleDetailModal";
import { SalesEntry, SalesStats, Toast } from "./types";
import { getStatusConfig, formatCurrency, formatDate, formatTime, capitalize } from "./constants";

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((value, i) => (
        <div key={i} className={`flex-1 rounded-t ${color}`}
          style={{ height: `${(value / max) * 100}%`, opacity: 0.3 + (i / data.length) * 0.7 }} />
      ))}
    </div>
  );
}

function SortIcon({ column, sortBy, sortOrder }: {
  column: string; sortBy: string; sortOrder: "asc" | "desc";
}) {
  if (sortBy !== column) return <ArrowUpDown size={13} className="opacity-40" />;
  return sortOrder === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
}

const DAILY_CHART = [2400, 1800, 3200, 2800, 4100, 3600, 5200];

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
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

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

  useEffect(() => { fetchSalesData(); }, [fetchSalesData]);

  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortOrder("desc"); }
    setPage(1);
  };

  const handleReset = () => {
    setSearchQuery(""); setStatusFilter(""); setDateFrom("");
    setDateTo(""); setPage(1); setSortBy("date"); setSortOrder("desc");
    addToast("Filters cleared", "info");
  };

  const handleExport = (format: string) => {
    addToast(`Export coming soon (${format.toUpperCase()})`, "info");
  };

  const activeFilterCount = [statusFilter, dateFrom, dateTo].filter(Boolean).length;

  const grandTotal = useMemo(
    () => data.filter((i) => i.status !== "cancelled" && i.status !== "CANCELLED")
      .reduce((s, i) => s + i.amount, 0),
    [data]
  );

  const totalPaxPage = useMemo(
    () => data.filter((i) => i.status !== "cancelled" && i.status !== "CANCELLED")
      .reduce((s, i) => s + i.pax, 0),
    [data]
  );

  const statCards = [
    {
      label: "Total Bookings", value: stats.bookingCount.toString(),
      icon: <Receipt size={20} className="text-indigo-600" />, iconBg: "bg-indigo-50",
      valueColor: "text-slate-800", trend: "+8.3%", trendUp: true,
    },
    {
      label: "Total Passengers", value: stats.totalPax.toString(),
      icon: <Users size={20} className="text-purple-600" />, iconBg: "bg-purple-50",
      valueColor: "text-slate-800", trend: "+15.2%", trendUp: true,
    },
    {
      label: "Commission", value: formatCurrency(stats.totalCommission),
      icon: <CreditCard size={20} className="text-emerald-600" />, iconBg: "bg-emerald-50",
      valueColor: "text-emerald-600", trend: "+5.7%", trendUp: true,
    },
    {
      label: "Avg. Ticket", value: formatCurrency(Math.round(stats.avgTicketPrice)),
      icon: <Target size={20} className="text-amber-600" />, iconBg: "bg-amber-50",
      valueColor: "text-slate-800", trend: "-2.1%", trendUp: false,
    },
  ];

  const columns = [
    { label: "Date", column: "date", sortable: true },
    { label: "Booking ID", column: "booking", sortable: false },
    { label: "PNR", column: "pnr", sortable: false },
    { label: "Route", column: "route", sortable: false },
    { label: "Pax", column: "pax", sortable: true },
    { label: "Status", column: "status", sortable: false },
    { label: "Amount", column: "amount", sortable: true, right: true },
    { label: "Action", column: "action", sortable: false, center: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              {/* ✅ slate icon */}
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} className="text-white" />
              </div>
              Sales Report
            </h1>
            <p className="text-slate-500 mt-1">
              {stats.bookingCount} bookings • {stats.totalPax} passengers • {formatCurrency(stats.totalSales)} total
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <ExportDropdown onExport={handleExport} />
            {/* ✅ slate button */}
            <button onClick={() => { addToast("Refreshing...", "info"); fetchSalesData(); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition shadow-sm disabled:opacity-70">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">

          {/* ✅ slate hero card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Sales</p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalSales)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Confirmed only</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Banknote size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4">
              <MiniBarChart data={DAILY_CHART} color="bg-white" />
            </div>
          </div>

          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">{card.label}</p>
                  <p className={`text-lg md:text-xl font-bold mt-1 ${card.valueColor}`}>{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trendUp
                      ? <TrendingUp size={12} className="text-emerald-500" />
                      : <TrendingDown size={12} className="text-rose-500" />}
                    <span className={`text-xs font-medium ${card.trendUp ? "text-emerald-600" : "text-rose-600"}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── SEARCH & FILTERS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search booking, PNR, route..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 transition" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              <button onClick={handleReset}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2 shrink-0">
                <RotateCcw size={16} /><span className="hidden sm:inline">Reset</span>
              </button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="relative">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 bg-white cursor-pointer min-w-[130px]">
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {/* ✅ slate filter button */}
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${
                  showFilters ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                <SlidersHorizontal size={16} /><span className="hidden sm:inline">Filters</span>
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date From</label>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date To</label>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RESULTS COUNT ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{data.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalRecords}</span> sales
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows:</span>
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

        {/* ── TABLE ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-slate-400 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading sales data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                    {columns.map((col) => (
                      <th key={col.column}
                        className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                          (col as any).right ? "text-right" : (col as any).center ? "text-center" : "text-left"
                        }`}>
                        {col.sortable ? (
                          <button onClick={() => handleSort(col.column)}
                            className={`flex items-center gap-1 hover:text-slate-800 transition ${(col as any).right ? "ml-auto" : ""}`}>
                            {col.label}
                            <SortIcon column={col.column} sortBy={sortBy} sortOrder={sortOrder} />
                          </button>
                        ) : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.length > 0 ? data.map((item) => {
                    const sc = getStatusConfig(item.status);
                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50/80 transition ${
                          item.status === "cancelled" || item.status === "CANCELLED" ? "opacity-60" : ""
                        }`}>

                        {/* Date */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <Calendar size={13} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{formatDate(item.date)}</p>
                              <p className="text-xs text-slate-400">{formatTime(item.date)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Booking ID — ✅ slate button */}
                        <td className="px-3 py-3">
                          <button onClick={() => setSelectedEntry(item)}
                            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                            <FileText size={11} />{item.booking}
                          </button>
                        </td>

                        {/* PNR */}
                        <td className="px-3 py-3">
                          <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                            {item.pnr || "—"}
                          </span>
                        </td>

                        {/* Route */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 text-sm">{item.origin || "—"}</span>
                            <div className="flex items-center shrink-0">
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <div className="w-4 h-px bg-slate-300 mx-0.5" />
                              <Plane size={10} className="text-slate-400 rotate-90" />
                              <div className="w-4 h-px bg-slate-300 mx-0.5" />
                              <div className="w-1 h-1 rounded-full bg-emerald-400" />
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">{item.destination || "—"}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{item.ticketType}</p>
                        </td>

                        {/* Pax */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                              <Users size={12} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{item.pax}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${sc.bg} ${sc.text}`}>
                            {sc.icon}{capitalize(item.status)}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-3 text-right">
                          <p className={`text-sm font-bold whitespace-nowrap ${
                            item.status === "cancelled" || item.status === "CANCELLED"
                              ? "text-slate-400 line-through" : "text-slate-800"
                          }`}>{formatCurrency(item.amount, item.currency)}</p>
                          {item.commission > 0 && (
                            <p className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                              +{formatCurrency(item.commission, item.currency)} comm.
                            </p>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <button onClick={() => setSelectedEntry(item)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition" title="View details">
                              <Eye size={16} className="text-slate-500" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No sales found</p>
                          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                          {/* ✅ slate button */}
                          <button onClick={handleReset}
                            className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2">
                            <RotateCcw size={16} /> Reset Filters
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* ✅ slate footer */}
                {data.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-800 text-white">
                      <td colSpan={4} className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} />
                          <span className="font-bold">Page Total</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} />
                          <span className="font-bold">{totalPaxPage}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3" />
                      <td className="px-3 py-3 text-right">
                        <span className="text-lg font-bold whitespace-nowrap">{formatCurrency(grandTotal)}</span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </motion.div>

        {/* ── PAGINATION ── */}
        {!loading && totalRecords > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages || 1}</span>
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button disabled={page === 1} onClick={() => setPage(1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
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
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-medium transition ${
                        page === pageNum
                          ? "bg-slate-800 text-white shadow-lg"
                          : "hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>{pageNum}</button>
                  );
                })}
              </div>
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(totalPages)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
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