"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {Search, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,Plane, Calendar, Users,Clock, CheckCircle2,XCircle, AlertCircle, ArrowUpDown, ArrowUp, 
ArrowDown, SlidersHorizontal,FileText, RefreshCw, ChevronDown, X, Grid3X3, LayoutList, Settings2,UserCheck, Hash, CreditCard,} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "@/lib/api";

import ColumnSettingsModal from "./ColumnSettingsModal";
import ToastContainer from "./ToastContainer";
import TableSkeleton from "./TableSkeleton";
import { Booking, Toast, Props } from "./types";
import {getStatusConfig, getPageTitle, formatCurrency, formatDate, ALL_COLUMNS,} from "./constants";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AgentAllBooking({ defaultStatus = "" }: Props) {
const router = useRouter();

  // ── SWR/FETCHING─
  const { data, error, isLoading: loading, isValidating: refreshing, mutate } =
    useSWR<Booking[]>("/bookings/all", apiClient, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    });

  // ── Bookings ──
  const bookings = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // ── States ──
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tripType, setTripType] = useState("");
  const [carrier, setCarrier] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map((c) => c.key));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchInput, 300);

  // ── Toast ──
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
 const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Refresh ──
  const handleRefresh = useCallback(async () => {
    const result = await mutate();
    if (result) addToast("Data refreshed!", "success");
  }, [mutate, addToast]);

  // ── Error watch ──
  useEffect(() => {
    if (!error) return;
    if (String((error as Error)?.message || "").includes("401")) {
      window.location.href = "/login";
      return;
    }
    addToast("Failed to load bookings", "error");
  }, [error, addToast]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.ctrlKey && e.key === "r") { e.preventDefault(); handleRefresh(); }
      if (e.key === "Escape") setShowColumnSettings(false);
      if (e.key === "ArrowLeft" && page > 1) setPage((p) => p - 1);
      if (e.key === "ArrowRight") setPage((p) => p + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, handleRefresh]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const onHold = bookings.filter((b) => b.status === "ON_HOLD").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.gross || 0), 0);
    const avgBookingValue = total > 0 ? Math.round(totalRevenue / total) : 0;
    const totalPassengers = bookings.reduce((sum, b) => sum + (b.passengers?.length || 0), 0);
    return { total, confirmed, onHold, cancelled, totalRevenue, avgBookingValue, totalPassengers };
  }, [bookings]);

  // ── Filter + Sort ──
  const filteredData = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    let result = bookings.filter((item) => {
      const matchSearch = query === "" ? true
        : item.id?.toLowerCase().includes(query)
        || item.bookingId?.toLowerCase().includes(query)
        || item.pnr?.toLowerCase().includes(query)
        || item.carrier?.toLowerCase().includes(query)
        || item.route?.toLowerCase().includes(query)
        || item.issuedBy?.toLowerCase().includes(query)
        || item.passengers?.some((p) =>
            p.firstName?.toLowerCase().includes(query) || p.lastName?.toLowerCase().includes(query));
      const matchStatus = status ? item.status === status : true;
      const matchTripType = tripType ? item.tripType === tripType : true;
      const matchCarrier = carrier ? item.carrier?.toLowerCase().includes(carrier.toLowerCase()) : true;
      let matchDateFrom = true, matchDateTo = true;
      if (dateFrom) matchDateFrom = new Date(item.departureDate) >= new Date(dateFrom);
      if (dateTo) matchDateTo = new Date(item.departureDate) <= new Date(dateTo);
      return matchSearch && matchStatus && matchTripType && matchCarrier && matchDateFrom && matchDateTo;
    });
    if (sortBy) {
      result = [...result].sort((a: any, b: any) => {
        let valA = a[sortBy], valB = b[sortBy];
        if (sortBy === "departureDate" || sortBy === "bookingDate") {
          valA = new Date(valA).getTime(); valB = new Date(valB).getTime();
        } else if (typeof valA === "string") {
          valA = valA.toLowerCase(); valB = valB?.toLowerCase() || "";
        }
        return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }
    return result;
  }, [debouncedSearch, status, bookings, sortBy, sortOrder, tripType, carrier, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // ── Helpers ──
  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortOrder("asc"); }
  };

  const handleReset = () => {
    setSearchInput(""); setStatus(defaultStatus); setPage(1);
    setSortBy(""); setSortOrder("desc"); setDateFrom("");
    setDateTo(""); setTripType(""); setCarrier("");
    addToast("Filters cleared", "info");
  };

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const activeFilterCount = [
    status !== defaultStatus ? status : "", tripType, carrier, dateFrom, dateTo,
  ].filter(Boolean).length;

  // Sortable header component
  const SortHeader = ({ column, label }: { column: string; label: string }) => (
    <button onClick={() => handleSort(column)} className="flex items-center gap-1 hover:text-slate-800 transition">
      {label}
      {sortBy === column
        ? (sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)
        : <ArrowUpDown size={14} className="opacity-40" />}
    </button>
  );

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-slate-800">
              {getPageTitle(defaultStatus)}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-500 mt-1">
              {stats.total} bookings • {stats.totalPassengers} passengers • Avg {formatCurrency(stats.avgBookingValue)}/booking
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button onClick={() => setShowColumnSettings(true)} title="Column settings"
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <Settings2 size={18} />
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <LayoutList size={18} />
              </button>
              <button onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <Grid3X3 size={18} />
              </button>
            </div>
            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition shadow-sm disabled:opacity-70">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </motion.div>
        </div>

        {/* ── STATS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <FileText size={18} className="text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Confirmed</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{stats.confirmed}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">On Hold</p>
                <p className="text-xl font-bold text-amber-600 mt-1">{stats.onHold}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Clock size={18} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Cancelled</p>
                <p className="text-xl font-bold text-rose-600 mt-1">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <XCircle size={18} className="text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Passengers</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{stats.totalPassengers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Users size={18} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-lg transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Revenue</p>
                <p className="text-lg font-bold text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <CreditCard size={18} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SEARCH & FILTERS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input ref={searchInputRef} value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search ID, PNR, Passenger, Route, Issued By..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 transition" />
                {searchInput && (
                  <button onClick={() => setSearchInput("")}
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
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 bg-white cursor-pointer min-w-[140px]">
                  {defaultStatus ? (
                    <option value={defaultStatus}>{getStatusConfig(defaultStatus).label}</option>
                  ) : (
                    <>
                      <option value="">All Status</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="VOIDED">Voided</option>
                      <option value="REFUNDED">Refunded</option>
                    </>
                  )}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
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
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Trip Type</label>
                    <div className="relative">
                      <select value={tripType} onChange={(e) => { setTripType(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 bg-white appearance-none pr-10">
                        <option value="">All Types</option>
                        <option value="ONE_WAY">One Way</option>
                        <option value="ROUND_TRIP">Round Trip</option>
                        <option value="MULTI_CITY">Multi City</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Carrier</label>
                    <input type="text" value={carrier} onChange={(e) => { setCarrier(e.target.value); setPage(1); }}
                      placeholder="Airline code..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RESULTS + PAGE SIZE ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{paginatedData.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{filteredData.length}</span> results
            {debouncedSearch && <span className="ml-2 text-slate-400">for &quot;<span className="text-slate-600">{debouncedSearch}</span>&quot;</span>}
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

        {/* ── ERROR ── */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-rose-500" />
            </div>
            <p className="text-rose-700 font-medium mb-2">Failed to load bookings</p>
            <p className="text-rose-600 text-sm mb-4">{(error as Error)?.message || "Something went wrong"}</p>
            <button onClick={() => mutate()}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition">
              Try Again
            </button>
          </motion.div>
        )}

        {/* ── TABLE / GRID ── */}
        {!error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {loading ? <TableSkeleton /> : viewMode === "table" ? (

              /* ── TABLE VIEW ── */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                      {visibleColumns.includes("bookingId") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <SortHeader column="bookingId" label="Booking ID" />
                        </th>
                      )}
                      {visibleColumns.includes("status") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      )}
                      {visibleColumns.includes("pnr") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PNR</th>
                      )}
                      {visibleColumns.includes("carrier") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Carrier</th>
                      )}
                      {visibleColumns.includes("route") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                      )}
                      {visibleColumns.includes("departure") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <SortHeader column="departureDate" label="Departure" />
                        </th>
                      )}
                      {visibleColumns.includes("passenger") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Passenger</th>
                      )}
                      {visibleColumns.includes("bookingDate") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <SortHeader column="bookingDate" label="Booking Date" />
                        </th>
                      )}
                      {visibleColumns.includes("issuedBy") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issued By</th>
                      )}
                      {visibleColumns.includes("amount") && (
                        <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <div className="flex justify-end"><SortHeader column="gross" label="Amount" /></div>
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.length > 0 ? paginatedData.map((b) => {
                      const sc = getStatusConfig(b.status);
                      return (
                        <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="hover:bg-slate-50/80 transition cursor-pointer"
                          onClick={() => router.push(`/user/bookings/${b.id}`)}>

                          {visibleColumns.includes("bookingId") && (
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                                <FileText size={12} />{b.bookingId || b.id}
                              </span>
                            </td>
                          )}

                          {visibleColumns.includes("status") && (
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${sc.bg} ${sc.text} ${sc.glow}`}>
                                {sc.icon}{sc.label}
                              </span>
                            </td>
                          )}

                          {visibleColumns.includes("pnr") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Hash size={14} className="text-slate-400" />
                                <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                  {b.pnr || "-"}
                                </span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.includes("carrier") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
                                  <Plane size={14} className="text-sky-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{b.carrier || "-"}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.includes("route") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 text-sm">{b.route?.split("-")[0] || "-"}</span>
                                <div className="flex items-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                  <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                  <Plane size={12} className="text-slate-400 rotate-90" />
                                  <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">{b.route?.split("-")[1] || "-"}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{b.tripType}</p>
                            </td>
                          )}

                          {visibleColumns.includes("departure") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-orange-400" />
                                <span className="text-sm text-slate-700">{formatDate(b.departureDate)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.includes("passenger") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shrink-0">
                                  <Users size={16} className="text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 text-sm">
                                    {b.passengers?.[0] ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : "-"}
                                  </p>
                                  {b.passengers?.length > 1 && (
                                    <p className="text-xs text-slate-400">+{b.passengers.length - 1} more</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          )}

                          {visibleColumns.includes("bookingDate") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-blue-400" />
                                <span className="text-sm text-slate-700">{formatDate(b.bookingDate)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.includes("issuedBy") && (
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                                  <UserCheck size={14} className="text-violet-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{b.issuedBy || "-"}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.includes("amount") && (
                            <td className="px-5 py-4 text-right">
                              <p className="text-sm font-bold text-slate-800">{formatCurrency(b.gross)}</p>
                              <p className="text-xs text-slate-400">Net: {formatCurrency(b.net)}</p>
                            </td>
                          )}
                        </motion.tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={ALL_COLUMNS.length} className="px-5 py-16 text-center">
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <FileText size={36} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No bookings found</p>
                            <p className="text-slate-400 text-sm mt-1 max-w-sm">Try adjusting your search or filters</p>
                            <button onClick={handleReset}
                              className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2">
                              <RotateCcw size={16} />Reset Filters
                            </button>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (

              /* ── GRID VIEW ── */
              <div className="p-4 md:p-6">
                {paginatedData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedData.map((b) => {
                      const sc = getStatusConfig(b.status);
                      return (
                        <motion.div key={b.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -2 }}
                          className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
                          onClick={() => router.push(`/user/bookings/${b.id}`)}>

                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-slate-400 font-medium">Booking ID</p>
                              <p className="font-semibold text-slate-800">{b.bookingId || b.id}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                              {sc.icon}{sc.label}
                            </span>
                          </div>

                          {/* Route */}
                          <div className="bg-slate-50 rounded-xl p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-slate-800">{b.route?.split("-")[0]}</p>
                              <div className="flex items-center">
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <div className="w-8 h-px bg-slate-300" />
                                <Plane size={14} className="text-slate-400 mx-1 rotate-90" />
                                <div className="w-8 h-px bg-slate-300" />
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                              </div>
                              <p className="text-lg font-bold text-slate-800">{b.route?.split("-")[1]}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Passenger</span>
                              <span className="font-medium text-slate-700">
                                {b.passengers?.[0] ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">PNR</span>
                              <span className="font-mono font-semibold text-slate-700">{b.pnr}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Departure</span>
                              <span className="font-medium text-slate-700">{formatDate(b.departureDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Booked On</span>
                              <span className="font-medium text-slate-700">{formatDate(b.bookingDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Issued By</span>
                              <span className="font-medium text-slate-700">{b.issuedBy || "-"}</span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <p className="text-lg font-bold text-slate-800">{formatCurrency(b.gross)}</p>
                            <p className="text-xs text-slate-400">Net: {formatCurrency(b.net)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText size={36} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-semibold text-lg">No bookings found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && !error && filteredData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-medium transition ${
                        page === pageNum ? "bg-slate-800 text-white shadow-lg" : "hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>{pageNum}</button>
                  );
                })}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {showColumnSettings && (
          <ColumnSettingsModal columns={ALL_COLUMNS} visibleColumns={visibleColumns}
            onToggle={toggleColumnVisibility} onClose={() => setShowColumnSettings(false)} />
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}