// app/(dashboard)/admin/agent/[id]/ledger/page.tsx
"use client";

import React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Download, Calendar, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, FileText,
  Printer, RefreshCw, X, ChevronDown, Wallet, Receipt, Eye,
  Copy, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet,
  File, RotateCcw, SlidersHorizontal, Plane, Building2,
  ArrowDownLeft, ArrowUpRight, Info, Loader2, Clock, ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LedgerEntry {
  id:       string;
  date:     string;
  invoice:  string;
  booking:  string;
  spnr:     string;
  apnr:     string;
  flight:   string;
  desc:     string;
  type:     string;
  debit:    number;
  credit:   number;
  balance:  number;
  currency: string;
  created:  string;
  status:   string;
  source:   string;
}

interface AgentInfo {
  id:              string;
  agentId:         string;
  name:            string;
  firstName?:      string;
  lastName?:       string;
  email:           string;
  phone?:          string;
  balance:         number;
  creditLimit:     number;
  usedLimit?:      number;
  availableCredit?: number;
  status?:         string;
  tier?:           string;
}

interface Toast {
  id:      string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}

interface StatsState {
  currentBalance:   number;
  totalCredit:      number;
  totalDebit:       number;
  transactionCount: number;
  creditLimit:      number;
  usedLimit:        number;
  availableCredit:  number;
  totalAvailable:   number;
}

interface ApiResponse {
  success:    boolean;
  data:       LedgerEntry[];
  total:      number;
  page:       number;
  totalPages: number;
  types:      string[];
  agent:      AgentInfo;
  stats: {
    currentBalance:    number;
    totalCredit:       number;
    totalDebit:        number;
    transactionCount:  number;
    creditLimit?:      number;
    usedLimit?:        number;
    availableCredit?:  number;
    totalAvailable?:   number;
  };
}

// ─── Type config ──────────────────────────────────────────────────────────────
function getTypeConfig(type: string): {
  bg:        string;
  text:      string;
  icon:      React.ReactElement;
  iconColor: string;
} {
  const configs: Record<string, {
    bg: string; text: string; icon: React.ReactElement; iconColor: string;
  }> = {
    TICKET: {
      bg: "bg-emerald-50", text: "text-emerald-700",
      icon: <Plane size={12} />, iconColor: "text-emerald-600",
    },
    REFUNDED: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <RotateCcw size={12} />, iconColor: "text-amber-600",
    },
    REISSUE: {
      bg: "bg-blue-50", text: "text-blue-700",
      icon: <RefreshCw size={12} />, iconColor: "text-blue-600",
    },
    VOID: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={12} />, iconColor: "text-rose-600",
    },
    VOIDED: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={12} />, iconColor: "text-rose-600",
    },
    CANCELLED: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={12} />, iconColor: "text-rose-600",
    },
    SERVICE: {
      bg: "bg-purple-50", text: "text-purple-700",
      icon: <Receipt size={12} />, iconColor: "text-purple-600",
    },
    DEPOSIT: {
      bg: "bg-sky-50", text: "text-sky-700",
      icon: <Wallet size={12} />, iconColor: "text-sky-600",
    },
    PENDING: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <Clock size={12} />, iconColor: "text-amber-600",
    },
  };
  return configs[type] || {
    bg: "bg-gray-50", text: "text-gray-700",
    icon: <FileText size={12} />, iconColor: "text-gray-600",
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency", currency: "SAR", minimumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Toast Component ──────────────────────────────────────────────────────────
const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts:      Toast[];
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
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            ${toast.type === "success" ? "bg-emerald-500 text-white" :
              toast.type === "error"   ? "bg-rose-500    text-white" :
              toast.type === "warning" ? "bg-amber-500   text-white" :
              "bg-slate-800 text-white"}`}
        >
          {toast.type === "success" && <CheckCircle2 size={18} />}
          {toast.type === "error"   && <XCircle      size={18} />}
          {toast.type === "warning" && <AlertCircle  size={18} />}
          {toast.type === "info"    && <Info          size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
            <X size={16} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Transaction Detail Modal ─────────────────────────────────────────────────
const TransactionDetailModal = ({
  entry,
  onClose,
}: {
  entry:   LedgerEntry | null;
  onClose: () => void;
}) => {
  if (!entry) return null;
  const typeConfig = getTypeConfig(entry.type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
        flex items-center justify-center p-4"
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
        <div className="px-6 py-5 border-b border-slate-100 flex items-center
          justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.bg}`}>
              <Receipt size={24} className={typeConfig.iconColor} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{entry.invoice}</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5
                rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                {typeConfig.icon}
                {entry.type}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`rounded-xl p-4 ${entry.credit > 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
            <p className="text-sm text-slate-500 mb-1">
              {entry.credit > 0 ? "Credit Amount" : "Debit Amount"}
            </p>
            <p className={`text-2xl font-bold
              ${entry.credit > 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(entry.credit || entry.debit)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Date & Time</p>
              <p className="font-medium text-slate-800 text-sm">
                {formatDate(entry.date)} {formatTime(entry.date)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Balance After</p>
              <p className="font-semibold text-slate-800 text-sm">
                {formatCurrency(entry.balance)}
              </p>
            </div>
            {entry.booking && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Booking ID</p>
                <p className="font-medium text-blue-600 text-sm">{entry.booking}</p>
              </div>
            )}
            {entry.apnr && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Airline PNR</p>
                <p className="font-mono font-semibold text-slate-800 text-sm">{entry.apnr}</p>
              </div>
            )}
            {entry.spnr && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">System PNR</p>
                <p className="font-mono font-semibold text-slate-800 text-sm">{entry.spnr}</p>
              </div>
            )}
            {entry.flight && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Flight Date</p>
                <p className="font-medium text-slate-800 text-sm">
                  {formatDate(entry.flight)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="font-medium text-slate-800">{entry.desc}</p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-full flex items-center
              justify-center shadow-sm">
              <Building2 size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Created By</p>
              <p className="font-medium text-slate-800">{entry.created}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center
          justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
              <Printer size={18} className="text-slate-600" />
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition" title="Copy">
              <Copy size={18} className="text-slate-600" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm
              font-medium hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Export Dropdown ──────────────────────────────────────────────────────────
const ExportDropdown = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen]    = useState(false);
  const dropdownRef            = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200
          rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50
          transition shadow-sm"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl
              shadow-xl border border-slate-100 py-1.5 z-20"
          >
            {[
              { format: "pdf",   label: "Export as PDF",   icon: <File            size={16} className="text-rose-500"    /> },
              { format: "excel", label: "Export as Excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
              { format: "csv",   label: "Export as CSV",   icon: <FileText        size={16} className="text-blue-500"    /> },
            ].map(({ format, label, icon }) => (
              <button
                key={format}
                onClick={() => { onExport(format); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700
                  hover:bg-slate-50 flex items-center gap-3"
              >
                {icon}
                {label}
              </button>
            ))}
            <hr className="my-1.5 border-slate-100" />
            <button
              onClick={() => { onExport("print"); setIsOpen(false); }}
              className="w-full px-4 py-2.5 text-sm text-left text-slate-700
                hover:bg-slate-50 flex items-center gap-3"
            >
              <Printer size={16} className="text-slate-500" />
              Print Statement
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminAgentLedgerPage() {
  const params  = useParams();
  const agentId = params.id as string;
  const router  = useRouter();

  // ── State ──
  const [agent,            setAgent]            = useState<AgentInfo | null>(null);
  const [data,             setData]             = useState<LedgerEntry[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [typeFilter,       setTypeFilter]       = useState("");
  const [dateFrom,         setDateFrom]         = useState("");
  const [dateTo,           setDateTo]           = useState("");
  const [showFilters,      setShowFilters]      = useState(false);
  const [page,             setPage]             = useState(1);
  const [pageSize,         setPageSize]         = useState(10);
  const [totalPages,       setTotalPages]       = useState(0);
  const [totalRecords,     setTotalRecords]     = useState(0);
  const [sortOrder,        setSortOrder]        = useState<"asc" | "desc">("desc");
  const [selectedEntry,    setSelectedEntry]    = useState<LedgerEntry | null>(null);
  const [selectedIds,      setSelectedIds]      = useState<Set<string>>(new Set());
  const [toasts,           setToasts]           = useState<Toast[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);

  const [stats, setStats] = useState<StatsState>({
    currentBalance:   0,
    totalCredit:      0,
    totalDebit:       0,
    transactionCount: 0,
    creditLimit:      0,
    usedLimit:        0,
    availableCredit:  0,
    totalAvailable:   0,
  });

  // ── Debounced search ──
  const searchTimeoutRef              = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  // ── Toast ──
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch ──
  const fetchLedgerData = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page:      page.toString(),
        limit:     pageSize.toString(),
        sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(typeFilter       && { type: typeFilter }),
        ...(dateFrom         && { dateFrom }),
        ...(dateTo           && { dateTo }),
      });

      const response = await fetch(`/api/admin/agents/${agentId}/ledger?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result: ApiResponse = await response.json();

      if (result.success) {
        setData(result.data || []);
        setTotalRecords(result.total || 0);
        setTotalPages(result.totalPages || 0);
        setTransactionTypes(result.types || []);

        if (result.agent) setAgent(result.agent);

        if (result.stats) {
          setStats((prev) => ({
            currentBalance:   Number(result.stats.currentBalance   ?? prev.currentBalance),
            totalCredit:      Number(result.stats.totalCredit      ?? prev.totalCredit),
            totalDebit:       Number(result.stats.totalDebit       ?? prev.totalDebit),
            transactionCount: Number(result.stats.transactionCount ?? prev.transactionCount),
            creditLimit: Number(
              result.stats.creditLimit ?? result.agent?.creditLimit ?? prev.creditLimit
            ),
            usedLimit: Number(
              result.stats.usedLimit ?? result.agent?.usedLimit ?? prev.usedLimit
            ),
            availableCredit: Number(
              result.stats.availableCredit ?? result.agent?.availableCredit ?? prev.availableCredit
            ),
            totalAvailable: Number(
              result.stats.totalAvailable != null
                ? result.stats.totalAvailable
                : result.agent?.availableCredit != null
                  ? (result.stats.currentBalance ?? 0) + (result.agent.availableCredit ?? 0)
                  : prev.totalAvailable
            ),
          }));
        }
      } else {
        addToast("Failed to load ledger data", "error");
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      addToast(error.message || "Error loading ledger data", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, page, pageSize, debouncedSearch, typeFilter, dateFrom, dateTo, sortOrder, addToast]);

  useEffect(() => { fetchLedgerData(); }, [fetchLedgerData]);

  // ── Handlers ──
  const handleSort    = () => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); };
  const handleRefresh = () => { addToast("Refreshing...", "info"); fetchLedgerData(); };

  const handleReset = () => {
    setSearchQuery(""); setTypeFilter(""); setDateFrom(""); setDateTo("");
    setPage(1); setSortOrder("desc"); setSelectedIds(new Set());
    addToast("Filters cleared", "info");
  };

  const handleExport = async (format: string) => {
    addToast(`Exporting as ${format.toUpperCase()}...`, "info");
    try {
      const queryParams = new URLSearchParams({
        format,
        ...(dateFrom && { dateFrom }),
        ...(dateTo   && { dateTo }),
      });
      const response = await fetch(
        `/api/admin/agents/${agentId}/ledger/export?${queryParams}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url  = window.URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `ledger-${agent?.agentId || agentId}-${Date.now()}.${
          format === "excel" ? "xlsx" : format
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast("Export completed!", "success");
      } else {
        addToast("Export failed", "error");
      }
    } catch {
      addToast("Export error", "error");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const activeFilterCount = [typeFilter, dateFrom, dateTo].filter(Boolean).length;

  const pageTotals = useMemo(() => ({
    totalDebit:  data.reduce((sum, item) => sum + (item.debit  || 0), 0),
    totalCredit: data.reduce((sum, item) => sum + (item.credit || 0), 0),
  }), [data]);

  // Suppress unused router warning
  void router;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30
      to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <Link
              href="/admin/agent/all-agent"
              className="inline-flex items-center gap-2 text-sm text-slate-500
                hover:text-slate-800 transition mb-2"
            >
              <ArrowLeft size={16} />
              Back to Agents
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800
              flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600
                rounded-xl flex items-center justify-center">
                <Wallet size={22} className="text-white" />
              </div>
              Agent Ledger
            </h1>

            {agent && (
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
                  rounded-xl flex items-center justify-center text-white font-bold
                  text-sm shrink-0">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                    {agent.status && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${agent.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : agent.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"}`}>
                        {agent.status}
                      </span>
                    )}
                    {agent.tier && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${agent.tier === "PLATINUM" ? "bg-purple-50 text-purple-700" :
                          agent.tier === "GOLD"     ? "bg-yellow-50 text-yellow-700" :
                          agent.tier === "SILVER"   ? "bg-slate-100  text-slate-700"  :
                          "bg-amber-50 text-amber-700"}`}>
                        {agent.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {agent.agentId || agent.id} • {agent.email}
                    {agent.phone && ` • ${agent.phone}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Toolbar ── */}
          <div className="w-full lg:w-auto lg:min-w-[820px] space-y-3">
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 md:gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice, booking, PNR..."
                  className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl
                    text-sm bg-white focus:outline-none focus:ring-2
                    focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                      hover:bg-slate-100 rounded-full"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="relative shrink-0">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200
                    rounded-xl text-sm bg-white focus:outline-none focus:ring-2
                    focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer min-w-[150px]"
                >
                  <option value="">All Types</option>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-slate-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center
                  gap-2 transition relative shrink-0
                  ${showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500
                    text-white text-[10px] rounded-full flex items-center
                    justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700
                  rounded-xl text-sm font-medium hover:bg-slate-50 transition
                  flex items-center gap-2 shrink-0"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Export */}
              <ExportDropdown onExport={handleExport} />

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white
                  rounded-xl text-sm font-medium hover:bg-slate-700 transition
                  shadow-sm disabled:opacity-70 shrink-0"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Extended Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl p-4
                    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        Date From
                      </label>
                      <input type="date" value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                          text-sm bg-white focus:outline-none focus:ring-2
                          focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        Date To
                      </label>
                      <input type="date" value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                          text-sm bg-white focus:outline-none focus:ring-2
                          focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 transition"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto pb-1"
        >
          <div className="flex gap-3 min-w-max">
            {/* Current Balance */}
            <div className="min-w-[190px] bg-gradient-to-br from-slate-800 to-slate-900
              rounded-2xl p-4 shadow-sm border border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    Current Balance
                  </p>
                  <p className="text-lg font-bold text-white mt-1">
                    {formatCurrency(stats.currentBalance)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center
                  justify-center shrink-0">
                  <Wallet size={18} className="text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Total Credit */}
            <div className="min-w-[180px] bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Total Credit
                  </p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    {formatCurrency(stats.totalCredit)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center
                  justify-center shrink-0">
                  <ArrowDownLeft size={18} className="text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Total Debit */}
            <div className="min-w-[180px] bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Total Debit
                  </p>
                  <p className="text-lg font-bold text-rose-600 mt-1">
                    {formatCurrency(stats.totalDebit)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center
                  justify-center shrink-0">
                  <ArrowUpRight size={18} className="text-rose-600" />
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="min-w-[160px] bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Transactions
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {stats.transactionCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center
                  justify-center shrink-0">
                  <Receipt size={18} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* Credit Limit */}
            <div className="min-w-[190px] bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Credit Limit
                  </p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {formatCurrency(stats.creditLimit)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used: {formatCurrency(stats.usedLimit)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center
                  justify-center shrink-0">
                  <Wallet size={18} className="text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Available */}
            <div className="min-w-[190px] bg-white rounded-2xl p-4 shadow-sm border border-teal-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Total Available
                  </p>
                  <p className="text-lg font-bold text-teal-600 mt-1">
                    {formatCurrency(stats.totalAvailable)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Balance + Credit</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center
                  justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-teal-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Bulk Actions ── */}
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
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white
                    rounded-xl text-sm font-medium hover:bg-white/30 transition"
                >
                  <Download size={16} />
                  Export Selected
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

        {/* ── Results Info ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center
          justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{data.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">{totalRecords}</span>{" "}
            transactions
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm
                  bg-white appearance-none pr-8 cursor-pointer"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2
                  text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
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
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100
                    border-b border-slate-100">
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={data.length > 0 && selectedIds.size === data.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                      />
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={handleSort}
                        className="flex items-center gap-1 text-xs font-semibold
                          text-slate-500 uppercase tracking-wider
                          hover:text-slate-800 transition"
                      >
                        Date
                        {sortOrder === "asc"
                          ? <ArrowUp   size={14} />
                          : <ArrowDown size={14} />}
                      </button>
                    </th>
                    {["Invoice", "Booking", "PNR", "Description", "Type"].map((h) => (
                      <th key={h}
                        className="px-4 py-4 text-left text-xs font-semibold
                          text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                    {["Debit", "Credit", "Balance"].map((h) => (
                      <th key={h}
                        className="px-4 py-4 text-right text-xs font-semibold
                          text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-4 text-center text-xs font-semibold
                      text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
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
                          className={`hover:bg-slate-50/80 transition group
                            ${isSelected ? "bg-blue-50/50" : ""}`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg
                                flex items-center justify-center">
                                <Calendar size={14} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {formatDate(item.date)}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatTime(item.date)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setSelectedEntry(item)}
                              className="inline-flex items-center gap-1.5 bg-slate-800
                                hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg
                                text-xs font-semibold transition"
                            >
                              <FileText size={12} />
                              {item.invoice}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            {item.booking
                              ? <span className="text-sm font-medium text-blue-600">{item.booking}</span>
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-4">
                            {item.apnr
                              ? <span className="font-mono text-xs font-semibold text-slate-700
                                  bg-slate-100 px-2 py-0.5 rounded">{item.apnr}</span>
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-slate-700 max-w-[200px] truncate"
                              title={item.desc}>
                              {item.desc}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5
                              rounded-full text-xs font-semibold
                              ${typeConfig.bg} ${typeConfig.text}`}>
                              {typeConfig.icon}
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {item.debit > 0
                              ? <span className="text-sm font-semibold text-rose-600
                                  flex items-center justify-end gap-1">
                                  <ArrowUpRight size={14} />
                                  {formatCurrency(item.debit)}
                                </span>
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {item.credit > 0
                              ? <span className="text-sm font-semibold text-emerald-600
                                  flex items-center justify-end gap-1">
                                  <ArrowDownLeft size={14} />
                                  {formatCurrency(item.credit)}
                                </span>
                              : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-bold text-slate-800">
                              {formatCurrency(item.balance)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedEntry(item)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                title="View details"
                              >
                                <Eye size={16} className="text-slate-500" />
                              </button>
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
                          <div className="w-20 h-20 bg-slate-100 rounded-full
                            flex items-center justify-center mb-4">
                            <Receipt size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">
                            No transactions found
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            Try adjusting your search or filters
                          </p>
                          <button
                            onClick={handleReset}
                            className="mt-4 px-5 py-2.5 bg-slate-800 text-white
                              rounded-xl text-sm font-medium hover:bg-slate-700
                              transition flex items-center gap-2"
                          >
                            <RotateCcw size={16} />
                            Reset Filters
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {data.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={7} className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-600">
                          Page Total:
                        </span>
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
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </motion.div>

        {/* ── Pagination ── */}
        {!loading && totalRecords > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Page{" "}
              <span className="font-semibold text-slate-700">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalPages || 1}</span>
            </p>

            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button disabled={page === 1} onClick={() => setPage(1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>

              <div className="flex items-center gap-1 mx-1 md:mx-2">
                {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                  let pageNum: number;
                  const t = totalPages || 1;
                  if (t <= 5)           pageNum = i + 1;
                  else if (page <= 3)   pageNum = i + 1;
                  else if (page >= t - 2) pageNum = t - 4 + i;
                  else                  pageNum = page - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm
                        font-medium transition
                        ${page === pageNum
                          ? "bg-blue-600 text-white shadow-lg"
                          : "hover:bg-slate-100 text-slate-600 border border-slate-200"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(totalPages)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {selectedEntry && (
          <TransactionDetailModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}