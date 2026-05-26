"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUp, ArrowDown, FileText, RefreshCw, X, ChevronDown, Wallet, Receipt,
  Eye, Copy, ArrowDownLeft, ArrowUpRight, RotateCcw, SlidersHorizontal,
  Loader2, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

import ToastContainer from "@/app/components/agent/ledger/ToastContainer";
import ExportDropdown from "@/app/components/agent/ledger/ExportDropdown";
import TransactionDetailModal from "@/app/components/agent/ledger/TransactionDetailModal";
import { LedgerEntry, Toast, LedgerSummary } from "@/app/components/agent/ledger/types";
import { getTypeConfig, formatCurrency, formatDate, formatTime } from "@/app/components/agent/ledger/constants";

export default function UserLedgerPage() {
  // ── States ──
  const [data, setData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({
    currentBalance: 0, totalCredit: 0, totalDebit: 0,
    totalTransactions: 0, creditLimit: 0, usedLimit: 0,
    depositTotal: 0, bookingTotal: 0, pendingDepositTotal: 0,
  });

  // ── Toast ──
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch ──
  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", pageSize.toString());
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter) params.set("type", typeFilter.toLowerCase());
      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);

      const result = await apiClient(`/ledger?${params.toString()}`);
      const entries: LedgerEntry[] = result.entries || [];

      // Running balance
      let runningBalance = result.summary?.currentBalance || 0;
      const reversed = [...entries].reverse();
      const withBalance = reversed.map((entry) => {
        const bal = runningBalance;
        if (entry.isCredit) runningBalance -= entry.credit;
        else runningBalance += entry.debit;
        return { ...entry, balance: bal };
      });
      withBalance.reverse();

      setData(withBalance);
      setTotalRecords(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 0);
      setSummary({
        currentBalance: result.summary?.currentBalance || 0,
        totalCredit: result.summary?.totalCredit || 0,
        totalDebit: result.summary?.totalDebit || 0,
        totalTransactions: result.summary?.totalTransactions || 0,
        creditLimit: result.summary?.creditLimit || 0,
        usedLimit: result.summary?.usedLimit || 0,
        depositTotal: result.summary?.depositTotal || 0,
        bookingTotal: result.summary?.bookingTotal || 0,
        pendingDepositTotal: result.summary?.pendingDepositTotal || 0,
      });
    } catch (error: any) {
      if (String(error?.message).includes("401")) {
        window.location.href = "/login";
        return;
      }
      addToast("Failed to fetch ledger data", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, typeFilter, dateFrom, dateTo, addToast]);

  useEffect(() => { fetchLedgerData(); }, [fetchLedgerData]);

  // ── Handlers ──
  const handleReset = () => {
    setSearchQuery(""); setTypeFilter(""); setDateFrom("");
    setDateTo(""); setPage(1); setSortOrder("desc");
    addToast("Filters cleared", "info");
  };

  const handleExport = (format: string) => {
    addToast(`Exporting as ${format.toUpperCase()}...`, "info");
  };

  const handleRefresh = () => {
    addToast("Refreshing...", "info");
    fetchLedgerData();
  };

  const activeFilterCount = [typeFilter, dateFrom, dateTo].filter(Boolean).length;

  const pageTotals = useMemo(() => ({
    totalDebit: data.reduce((sum, item) => sum + (item.debit || 0), 0),
    totalCredit: data.reduce((sum, item) => sum + (item.credit || 0), 0),
  }), [data]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Wallet size={22} className="text-white" />
              </div>
              Account Ledger
            </h1>
            <p className="text-slate-500 mt-1 ml-13">
              {summary.totalTransactions} transactions • Balance {formatCurrency(summary.currentBalance)}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <ExportDropdown onExport={handleExport} />
            <button onClick={handleRefresh} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition shadow-sm disabled:opacity-70">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Balance</p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{formatCurrency(summary.currentBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Total Credit</p>
                <p className="text-lg md:text-xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.totalCredit)}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ArrowDownLeft size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Total Debit</p>
                <p className="text-lg md:text-xl font-bold text-rose-600 mt-1">{formatCurrency(summary.totalDebit)}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <ArrowUpRight size={20} className="text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Transactions</p>
                <p className="text-lg md:text-xl font-bold text-blue-600 mt-1">{summary.totalTransactions}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Receipt size={20} className="text-blue-600" />
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
                <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search reference, description..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
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
                <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer min-w-[140px]">
                  <option value="">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="booking">Booking</option>
                  <option value="manual">Manual</option>
                  <option value="refund">Refund</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${
                  showFilters ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
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
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date To</label>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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
            <span className="font-semibold text-slate-700">{totalRecords}</span> transactions
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
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="flex items-center gap-1 hover:text-slate-800 transition">
                        Date {sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </button>
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Debit</th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit</th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.length > 0 ? data.map((item) => {
                    const tc = getTypeConfig(item.type);
                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/80 transition">

                        {/* Date */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              <Calendar size={14} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{formatDate(item.date)}</p>
                              <p className="text-xs text-slate-400">{formatTime(item.date)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Reference */}
                        <td className="px-3 py-3">
                          <button onClick={() => setSelectedEntry(item)}
                            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                            <FileText size={11} />{item.reference}
                          </button>
                        </td>

                        {/* Description */}
                        <td className="px-3 py-3">
                          <p className="text-sm text-slate-700 max-w-[220px] truncate" title={item.description}>
                            {item.description}
                          </p>
                        </td>

                        {/* Type */}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${tc.bg} ${tc.text}`}>
                            {tc.icon} {item.category}
                          </span>
                        </td>

                        {/* Debit */}
                        <td className="px-3 py-3 text-right">
                          {item.debit > 0 ? (
                            <span className="text-sm font-semibold text-rose-600 flex items-center justify-end gap-1 whitespace-nowrap">
                              <ArrowUpRight size={14} />{formatCurrency(item.debit)}
                            </span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>

                        {/* Credit */}
                        <td className="px-3 py-3 text-right">
                          {item.credit > 0 ? (
                            <span className="text-sm font-semibold text-emerald-600 flex items-center justify-end gap-1 whitespace-nowrap">
                              <ArrowDownLeft size={14} />{formatCurrency(item.credit)}
                            </span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>

                        {/* Balance */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                            {formatCurrency(item.balance || 0)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <button onClick={() => setSelectedEntry(item)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition" title="View">
                              <Eye size={16} className="text-slate-500" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Receipt size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No transactions found</p>
                          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                          <button onClick={handleReset}
                            className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2">
                            <RotateCcw size={16} /> Reset Filters
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {data.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={4} className="px-3 py-3 text-right">
                        <span className="text-sm font-semibold text-slate-600">Page Total:</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-bold text-rose-600">{formatCurrency(pageTotals.totalDebit)}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(pageTotals.totalCredit)}</span>
                      </td>
                      <td colSpan={2} />
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
                        page === pageNum ? "bg-blue-600 text-white shadow-lg" : "hover:bg-slate-100 text-slate-600 border border-slate-200"
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

      {/* ── MODALS ── */}
      <AnimatePresence>
        {selectedEntry && (
          <TransactionDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
} 