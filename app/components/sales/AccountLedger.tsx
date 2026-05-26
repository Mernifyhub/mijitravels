"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search, Download, Calendar, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown,
  FileText, Printer, RefreshCw, X, ChevronDown, Wallet, Receipt,
  Eye, MoreHorizontal, Copy, CheckCircle2, XCircle, AlertCircle,
  FileSpreadsheet, File, RotateCcw, SlidersHorizontal, Plane,
  Building2, ArrowDownLeft, ArrowUpRight, Info, Loader2, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

// ==================== TYPES ====================
interface LedgerEntry {
  id: string;
  date: string;
  type: string;
  category: string;
  sourceType: string;
  isCredit: boolean;
  debit: number;
  credit: number;
  balanceAfter: number;
  description: string;
  reference: string;
  invoiceNo: string;
  pnr: string;
  systemPnr: string;
  status: string;
  meta: {
    pnr?: string;
    systemPnr?: string;
    bookingId?: string;
    depositId?: string;
    operationId?: string;
    flightDate?: string;
    note?: string;
    createdBy?: string;
    sourceId?: string;
    currency?: string;
  };
}

interface LedgerSummary {
  currentBalance: number;
  rawBalance: number;
  creditLimit: number;
  usedLimit: number;
  availableCredit: number;
  totalAvailableToBook: number;
  totalCredit: number;
  totalDebit: number;
  totalTransactions: number;
  depositTotal: number;
  bookingTotal: number;
  pendingDepositTotal: number;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ==================== TYPE CONFIG ====================
function getTypeConfig(type: string) {
  const t = type?.toUpperCase() || "";
  const configs: Record<string, {
    bg: string;
    text: string;
    icon: React.ReactNode;
    iconColor: string;
    label: string;
  }> = {
    TICKET: {
      bg: "bg-emerald-50", text: "text-emerald-700",
      icon: <Plane size={12} />, iconColor: "text-emerald-600",
      label: "Ticket Issued",
    },
    ON_HOLD: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <Clock size={12} />, iconColor: "text-amber-600",
      label: "On Hold",
    },
    DEPOSIT: {
      bg: "bg-sky-50", text: "text-sky-700",
      icon: <Wallet size={12} />, iconColor: "text-sky-600",
      label: "Deposit",
    },
    DEPOSIT_PENDING: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <Clock size={12} />, iconColor: "text-amber-600",
      label: "Deposit Pending",
    },
    REFUNDED: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <RotateCcw size={12} />, iconColor: "text-amber-600",
      label: "Refunded",
    },
    REFUND: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <RotateCcw size={12} />, iconColor: "text-amber-600",
      label: "Refund",
    },
    REISSUE: {
      bg: "bg-blue-50", text: "text-blue-700",
      icon: <RefreshCw size={12} />, iconColor: "text-blue-600",
      label: "Reissue",
    },
    VOID: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={12} />, iconColor: "text-rose-600",
      label: "Void",
    },
    VOIDED: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={12} />, iconColor: "text-rose-600",
      label: "Voided",
    },
    CANCELLED: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={12} />, iconColor: "text-rose-600",
      label: "Cancelled",
    },
    SERVICE: {
      bg: "bg-purple-50", text: "text-purple-700",
      icon: <Receipt size={12} />, iconColor: "text-purple-600",
      label: "Service",
    },
    ACM: {
      bg: "bg-teal-50", text: "text-teal-700",
      icon: <ArrowDownLeft size={12} />, iconColor: "text-teal-600",
      label: "ACM",
    },
    ADM: {
      bg: "bg-orange-50", text: "text-orange-700",
      icon: <ArrowUpRight size={12} />, iconColor: "text-orange-600",
      label: "ADM",
    },
    AMOUNT_ADD: {
      bg: "bg-emerald-50", text: "text-emerald-700",
      icon: <ArrowDownLeft size={12} />, iconColor: "text-emerald-600",
      label: "Amount Added",
    },
    DEDUCTION: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <ArrowUpRight size={12} />, iconColor: "text-rose-600",
      label: "Deduction",
    },
    MANUAL_BOOKING: {
      bg: "bg-indigo-50", text: "text-indigo-700",
      icon: <FileText size={12} />, iconColor: "text-indigo-600",
      label: "Manual Booking",
    },
    DATE_CHANGE: {
      bg: "bg-cyan-50", text: "text-cyan-700",
      icon: <Calendar size={12} />, iconColor: "text-cyan-600",
      label: "Date Change",
    },
    CREDIT_LIMIT_ADD: {
      bg: "bg-violet-50", text: "text-violet-700",
      icon: <ArrowDownLeft size={12} />, iconColor: "text-violet-600",
      label: "Credit Limit Added",
    },
    OPENING_BALANCE: {
      bg: "bg-slate-100", text: "text-slate-700",
      icon: <Wallet size={12} />, iconColor: "text-slate-600",
      label: "Opening Balance",
    },
  };

  return configs[t] || {
    bg: "bg-gray-50", text: "text-gray-700",
    icon: <FileText size={12} />, iconColor: "text-gray-600",
    label: type || "Unknown",
  };
}

// ==================== TOAST COMPONENT ====================
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

// ==================== TRANSACTION DETAIL MODAL ====================
const TransactionDetailModal = ({
  entry,
  onClose,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
}) => {
  if (!entry) return null;
  const typeConfig = getTypeConfig(entry.type);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(value);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const amount = entry.isCredit ? entry.credit : entry.debit;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.bg}`}>
              <Receipt size={24} className={typeConfig.iconColor} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {entry.invoiceNo || entry.reference}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                {typeConfig.icon} {typeConfig.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className={`rounded-xl p-4 ${entry.isCredit ? "bg-emerald-50" : "bg-rose-50"}`}>
            <p className="text-sm text-slate-500 mb-1">
              {entry.isCredit ? "Credit Amount" : "Debit Amount"}
            </p>
            <p className={`text-2xl font-bold ${entry.isCredit ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Date & Time</p>
              <p className="font-medium text-slate-800 text-sm">{formatDateTime(entry.date)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Balance After</p>
              <p className="font-semibold text-slate-800 text-sm">{formatCurrency(entry.balanceAfter)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <p className="font-semibold text-slate-800 text-sm">{entry.status}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Source</p>
              <p className="font-semibold text-slate-800 text-sm">{entry.sourceType}</p>
            </div>

            {entry.meta?.bookingId && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Booking ID</p>
                <p className="font-medium text-blue-600 text-sm">{entry.meta.bookingId}</p>
              </div>
            )}
            {entry.pnr && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">PNR</p>
                <p className="font-mono font-semibold text-slate-800 text-sm">{entry.pnr}</p>
              </div>
            )}
            {entry.systemPnr && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">System PNR</p>
                <p className="font-mono font-semibold text-slate-800 text-sm">{entry.systemPnr}</p>
              </div>
            )}
            {entry.meta?.flightDate && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Flight Date</p>
                <p className="font-medium text-slate-800 text-sm">
                  {formatDateTime(entry.meta.flightDate)}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="font-medium text-slate-800">{entry.description}</p>
          </div>

          {/* Note */}
          {entry.meta?.note && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Note</p>
              <p className="font-medium text-slate-800">{entry.meta.note}</p>
            </div>
          )}

          {/* Created By */}
          {entry.meta?.createdBy && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Building2 size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Created By</p>
                <p className="font-medium text-slate-800">{entry.meta.createdBy}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
              <Printer size={18} className="text-slate-600" />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(entry.reference || entry.invoiceNo)}
              className="p-2 hover:bg-white rounded-lg transition"
              title="Copy Reference"
            >
              <Copy size={18} className="text-slate-600" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== EXPORT DROPDOWN ====================
const ExportDropdown = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
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
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20"
          >
            {[
              { format: "pdf", label: "Export as PDF", icon: <File size={16} className="text-rose-500" /> },
              { format: "excel", label: "Export as Excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
              { format: "csv", label: "Export as CSV", icon: <FileText size={16} className="text-blue-500" /> },
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
              <Printer size={16} className="text-slate-500" /> Print Statement
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function AccountLedger() {
  // ── State ──
  const [data, setData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [summary, setSummary] = useState<LedgerSummary>({
    currentBalance: 0,
    rawBalance: 0,
    creditLimit: 0,
    usedLimit: 0,
    availableCredit: 0,
    totalAvailableToBook: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalTransactions: 0,
    depositTotal: 0,
    bookingTotal: 0,
    pendingDepositTotal: 0,
  });

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

  // ── Fetch Ledger Data from API ──
  const fetchLedgerData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", pageSize.toString());
        params.set("sortOrder", sortOrder);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (typeFilter) params.set("type", typeFilter);
        if (dateFrom) params.set("startDate", dateFrom);
        if (dateTo) params.set("endDate", dateTo);

        const result = await apiClient(`/ledger?${params.toString()}`);

        // ✅ Set entries from API response
        setData(result.entries || []);

        // ✅ Set pagination
        setTotalRecords(result.pagination?.total || 0);
        setTotalPages(result.pagination?.totalPages || 0);

        // ✅ Set summary
        setSummary({
          currentBalance: result.summary?.currentBalance || 0,
          rawBalance: result.summary?.rawBalance || 0,
          creditLimit: result.summary?.creditLimit || 0,
          usedLimit: result.summary?.usedLimit || 0,
          availableCredit: result.summary?.availableCredit || 0,
          totalAvailableToBook: result.summary?.totalAvailableToBook || 0,
          totalCredit: result.summary?.totalCredit || 0,
          totalDebit: result.summary?.totalDebit || 0,
          totalTransactions: result.summary?.totalTransactions || 0,
          depositTotal: result.summary?.depositTotal || 0,
          bookingTotal: result.summary?.bookingTotal || 0,
          pendingDepositTotal: result.summary?.pendingDepositTotal || 0,
        });

        if (isRefresh) addToast("Data refreshed successfully!", "success");
      } catch (error: any) {
        console.error("Ledger fetch error:", error?.message);
        if (String(error?.message).includes("401")) {
          window.location.href = "/login";
          return;
        }
        addToast("Failed to fetch ledger data", "error");
        setData([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize, searchQuery, typeFilter, dateFrom, dateTo, sortOrder, addToast]
  );

  // ✅ Fetch on mount and when filters change
  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  // ── Page totals (current page only) ──
  const pageTotals = useMemo(
    () => ({
      totalDebit: data.reduce((sum, item) => sum + (item.debit || 0), 0),
      totalCredit: data.reduce((sum, item) => sum + (item.credit || 0), 0),
    }),
    [data]
  );

  // ── Handlers ──
  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setSortOrder("desc");
    setSelectedIds(new Set());
    addToast("Filters cleared", "info");
  };

  const handleExport = (format: string) => {
    addToast(`Exporting as ${format.toUpperCase()}...`, "info");
    setTimeout(() => addToast("Export completed!", "success"), 1500);
  };

  const handleRefresh = () => fetchLedgerData(true);

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedIds(s);
  };

  // ── Formatters ──
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeFilterCount = [typeFilter, dateFrom, dateTo].filter(Boolean).length;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Wallet size={22} className="text-white" />
              </div>
              Account Ledger
            </h1>
            <p className="text-slate-500 mt-1 ml-13">
              Track all financial transactions and account balance
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* ── STATS CARDS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
        >
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Wallet Balance</p>
                <p className="text-xl font-bold text-white mt-1">
                  {formatCurrency(summary.currentBalance)}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Available Credit */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-violet-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Available Credit</p>
                <p className="text-lg font-bold text-violet-600 mt-1">
                  {formatCurrency(summary.availableCredit)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Limit: {formatCurrency(summary.creditLimit)}
                </p>
              </div>
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <Wallet size={18} className="text-violet-600" />
              </div>
            </div>
          </div>

          {/* Total Available */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Available</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {formatCurrency(summary.totalAvailableToBook)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Wallet size={18} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Credit */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Credit</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  {formatCurrency(summary.totalCredit)}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ArrowDownLeft size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Total Debit */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Debit</p>
                <p className="text-lg font-bold text-rose-600 mt-1">
                  {formatCurrency(summary.totalDebit)}
                </p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <ArrowUpRight size={18} className="text-rose-600" />
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Transactions</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{summary.totalTransactions}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Receipt size={18} className="text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── SEARCH & FILTERS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search invoice, PNR, description..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2 shrink-0"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer min-w-[140px]"
                >
                  <option value="">All Types</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="TICKET">Ticket</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="REFUND">Refund</option>
                  <option value="REISSUE">Reissue</option>
                  <option value="VOID">Void</option>
                  <option value="VOIDED">Voided</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="SERVICE">Service</option>
                  <option value="ACM">ACM</option>
                  <option value="ADM">ADM</option>
                  <option value="AMOUNT_ADD">Amount Add</option>
                  <option value="DEDUCTION">Deduction</option>
                  <option value="MANUAL_BOOKING">Manual Booking</option>
                  <option value="DATE_CHANGE">Date Change</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${
                  showFilters ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
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

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date From</label>
                    <input
                      type="date" value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date To</label>
                    <input
                      type="date" value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
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

        {/* ── BULK ACTIONS ── */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
                <p className="text-white font-semibold">
                  {selectedIds.size} transaction{selectedIds.size > 1 ? "s" : ""} selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/30 transition"
                >
                  <Download size={16} /> Export Selected
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULTS INFO ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{data.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalRecords}</span> transactions
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white appearance-none pr-8 cursor-pointer"
              >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
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
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={data.length > 0 && selectedIds.size === data.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={handleSort}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition"
                      >
                        Date
                        {sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PNR</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Debit</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.length > 0 ? (
                    data.map((item) => {
                      const typeConfig = getTypeConfig(item.type);
                      const isSelected = selectedIds.has(item.id);

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-slate-50/80 transition group ${isSelected ? "bg-blue-50/50" : ""}`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600"
                            />
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Calendar size={14} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{formatDate(item.date)}</p>
                                <p className="text-xs text-slate-400">{formatTime(item.date)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Reference / Invoice */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setSelectedEntry(item)}
                              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            >
                              <FileText size={12} />
                              {item.invoiceNo || item.reference}
                            </button>
                          </td>

                          {/* PNR */}
                          <td className="px-4 py-4">
                            <div className="space-y-0.5">
                              {item.pnr ? (
                                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block">
                                  {item.pnr}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                              {item.systemPnr && (
                                <span className="font-mono text-xs text-slate-400 block">
                                  S: {item.systemPnr}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-4 py-4">
                            <p className="text-sm text-slate-700 max-w-[220px] truncate" title={item.description}>
                              {item.description}
                            </p>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                              {typeConfig.icon} {typeConfig.label}
                            </span>
                          </td>

                          {/* Debit */}
                          <td className="px-4 py-4 text-right">
                            {item.debit > 0 ? (
                              <span className="text-sm font-semibold text-rose-600 flex items-center justify-end gap-1">
                                <ArrowUpRight size={14} />
                                {formatCurrency(item.debit)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* Credit */}
                          <td className="px-4 py-4 text-right">
                            {item.credit > 0 ? (
                              <span className="text-sm font-semibold text-emerald-600 flex items-center justify-end gap-1">
                                <ArrowDownLeft size={14} />
                                {formatCurrency(item.credit)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* Balance After */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-bold text-slate-800">
                              {formatCurrency(item.balanceAfter)}
                            </span>
                          </td>

                          {/* Created By */}
                          <td className="px-4 py-4">
                            {item.meta?.createdBy ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                  <Building2 size={12} className="text-blue-600" />
                                </div>
                                <span className="text-sm text-slate-700 max-w-[120px] truncate" title={item.meta.createdBy}>
                                  {item.meta.createdBy}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedEntry(item)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                title="View details"
                              >
                                <Eye size={16} className="text-slate-500" />
                              </button>
                              <div className="relative group/menu">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                                  <MoreHorizontal size={16} className="text-slate-500" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover/menu:block z-10">
                                  <button
                                    onClick={() => setSelectedEntry(item)}
                                    className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Eye size={14} /> View Details
                                  </button>
                                  <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <Printer size={14} /> Print
                                  </button>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(item.reference || item.invoiceNo)}
                                    className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Copy size={14} /> Copy Ref
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-4 py-16 text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Receipt size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No transactions found</p>
                          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                          <button
                            onClick={handleReset}
                            className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2"
                          >
                            <RotateCcw size={16} /> Reset Filters
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Table Footer */}
                {data.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={6} className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-600">Page Total:</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-rose-600">
                          {formatCurrency(pageTotals.totalDebit)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(pageTotals.totalCredit)}
                        </span>
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </motion.div>

        {/* ── PAGINATION ── */}
        {!loading && totalRecords > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages || 1}</span>
            </p>

            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
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
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-medium transition ${
                        page === pageNum
                          ? "bg-blue-600 text-white shadow-lg"
                          : "hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(totalPages)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedEntry && (
          <TransactionDetailModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>

      {/* ── TOASTS ── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}