"use client";

import React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search, Users, Download, RefreshCw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown,
  Edit, Trash2, MoreHorizontal, CheckCircle2, XCircle, Clock,
  AlertCircle, X, ChevronDown, Mail, Phone, MapPin, Building2,
  Wallet, TrendingUp, UserCheck, UserX, UserPlus,
  Copy, Check, Ban, Unlock, Send, History, Star, Globe, Info, Loader2,
  SlidersHorizontal, RotateCcw, Sparkles, Award, Target, Printer,
  FileSpreadsheet, File, AlertTriangle,
  Power, PowerOff, WifiOff, ServerCrash, DatabaseZap, Eye, Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Agent {
  id:                 string;
  internalId:         string;
  agentId?:           string;
  name:               string;
  firstName?:         string;
  lastName?:          string;
  agentName?:         string;
  email:              string;
  phone:              string;
  company:            string;
  address:            string;
  city:               string;
  country:            string;
  status:             "active" | "pending" | "inactive" | "suspended";
  balance:            number;
  creditLimit:        number;
  usedLimit:          number;
  totalBookings:      number;
  totalRevenue:       number;
  joinedDate:         string;
  lastActive:         string;
  verified:           boolean;
  tier:               "bronze" | "silver" | "gold" | "platinum";
  commission:         number;
  staffCount:         number;
  preBookingEnabled:  boolean;
  avatar?:            string;
}

interface AgentApiResponse {
  data:       Agent[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
  stats: {
    total:        number;
    active:       number;
    pending:      number;
    suspended:    number;
    inactive:     number;
    totalBalance: number;
    totalRevenue: number;
  };
}

interface Toast {
  id:      string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}

interface ApiError {
  message:     string;
  statusCode?: number;
}

// ─── Config helpers (no JSX.Element) ─────────────────────────────────────────
function getStatusConfig(status: string): {
  bg: string; text: string; icon: React.ReactElement; label: string;
} {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactElement; label: string }> = {
    active:    { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={12} />, label: "Active"    },
    pending:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: <Clock        size={12} />, label: "Pending"   },
    inactive:  { bg: "bg-slate-100",  text: "text-slate-600",   icon: <UserX        size={12} />, label: "Inactive"  },
    suspended: { bg: "bg-rose-50",    text: "text-rose-700",    icon: <Ban          size={12} />, label: "Suspended" },
  };
  return configs[status] || configs.inactive;
}

function getTierConfig(tier: string): {
  bg: string; text: string; icon: React.ReactElement; gradient: string;
} {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactElement; gradient: string }> = {
    bronze:   { bg: "bg-amber-100",  text: "text-amber-700",  icon: <Award    size={12} />, gradient: "from-amber-600 to-amber-700"    },
    silver:   { bg: "bg-slate-200",  text: "text-slate-700",  icon: <Award    size={12} />, gradient: "from-slate-500 to-slate-600"    },
    gold:     { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Star     size={12} />, gradient: "from-yellow-500 to-amber-500"   },
    platinum: { bg: "bg-purple-100", text: "text-purple-700", icon: <Sparkles size={12} />, gradient: "from-purple-500 to-indigo-500"  },
  };
  return configs[tier] || configs.bronze;
}

// ─── Normalize ────────────────────────────────────────────────────────────────
const normalizeAgent = (raw: any): Agent => ({
  id:               raw.agentId || raw.id || "",
  internalId:       raw.id || "",
  agentId:          raw.agentId,
  name:             raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Unknown",
  firstName:        raw.firstName,
  lastName:         raw.lastName,
  agentName:        raw.agentName,
  email:            raw.email    || "",
  phone:            raw.phone    || "",
  company:          raw.company  || raw.agentName || "",
  address:          raw.address  || raw.agentAddress || "",
  city:             raw.city     || "",
  country:          raw.country  || "",
  status:           ((raw.status as string) || "inactive").toLowerCase() as Agent["status"],
  balance:          Number(raw.balance      || 0),
  creditLimit:      Number(raw.creditLimit  || 0),
  usedLimit:        Number(raw.usedLimit    || 0),
  totalBookings:    raw.totalBookings || 0,
  totalRevenue:     Number(raw.totalRevenue || 0),
  joinedDate:       raw.joinedDate || raw.createdAt || "",
  lastActive:       raw.lastActive || raw.updatedAt || "",
  verified:         raw.verified  || false,
  tier:             ((raw.tier as string) || "bronze").toLowerCase() as Agent["tier"],
  commission:       Number(raw.commission   || 0),
  staffCount:       raw.staffCount || 0,
  preBookingEnabled: raw.preBookingEnabled || false,
  avatar:           raw.avatar || undefined,
});

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
      : "";
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method:      options.method || "GET",
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...options,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw { message: "Unauthorized", statusCode: 401 } as ApiError;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { message: err.message || err.error || `HTTP Error: ${res.status}`, statusCode: res.status } as ApiError;
  }
  if (res.status === 204) return {};
  return res.json();
};

class AgentApiService {
  async getAgents(params: {
    page?: number; pageSize?: number; search?: string; status?: string;
    tier?: string; country?: string; sortBy?: string; sortOrder?: "asc" | "desc";
  }): Promise<AgentApiResponse> {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        sp.append(k === "pageSize" ? "limit" : k, String(v));
      }
    });
    const raw = await apiFetch(`/admin/agents?${sp.toString()}`);
    let agents: any[] = [];
    let total = 0;
    let totalPages = 0;
    let stats: any = null;
    if (raw?.agents && Array.isArray(raw.agents)) {
      agents = raw.agents;
      total = raw.total || agents.length;
      totalPages = raw.totalPages || Math.ceil(total / (params.pageSize || 10));
      stats = raw.stats;
    } else if (Array.isArray(raw)) {
      agents = raw; total = raw.length; totalPages = 1;
    }
    const normalized = agents.map(normalizeAgent);
    const defaultStats = stats || {
      total, active: normalized.filter((a) => a.status === "active").length,
      pending: normalized.filter((a) => a.status === "pending").length,
      suspended: normalized.filter((a) => a.status === "suspended").length,
      inactive: normalized.filter((a) => a.status === "inactive").length,
      totalBalance: normalized.reduce((s, a) => s + a.balance, 0),
      totalRevenue: normalized.reduce((s, a) => s + a.totalRevenue, 0),
    };
    return { data: normalized, total, page: params.page || 1, pageSize: params.pageSize || 10, totalPages, stats: defaultStats };
  }

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const raw = await apiFetch("/admin/agents", { method: "POST", body: JSON.stringify(data) });
    return normalizeAgent(raw.agent || raw);
  }

  async updateAgent(internalId: string, data: Partial<Agent>): Promise<Agent> {
    const raw = await apiFetch(`/admin/agents/${internalId}`, { method: "PUT", body: JSON.stringify(data) });
    return normalizeAgent(raw.agent || raw);
  }

  async deleteAgent(internalId: string): Promise<void> {
    await apiFetch(`/admin/agents/${internalId}`, { method: "DELETE" });
  }

  async updateAgentStatus(internalId: string, status: string): Promise<Agent> {
    const raw = await apiFetch(`/admin/agents/${internalId}/status`, {
      method: "PATCH", body: JSON.stringify({ status: status.toUpperCase() }),
    });
    return normalizeAgent(raw.agent || raw);
  }

  async togglePreBooking(internalId: string, enabled: boolean): Promise<Agent> {
    const raw = await apiFetch(`/admin/agents/${internalId}/pre-booking`, {
      method: "PATCH", body: JSON.stringify({ preBookingEnabled: enabled }),
    });
    return normalizeAgent(raw.agent || raw);
  }

  async bulkAction(internalIds: string[], action: string): Promise<{ success: boolean; count: number }> {
    return apiFetch("/admin/agents/bulk", {
      method: "POST", body: JSON.stringify({ ids: internalIds, action }),
    });
  }
}

const agentApi = new AgentApiService();

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useAgents(initialStatus = "") {
  const [agents,        setAgents]        = useState<Agent[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<ApiError | null>(null);
  const [total,         setTotal]         = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [stats,         setStats]         = useState({
    total: 0, active: 0, pending: 0, suspended: 0, inactive: 0,
    totalBalance: 0, totalRevenue: 0,
  });
  const [page,          setPage]          = useState(1);
  const [pageSize,      setPageSize]      = useState(10);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState(initialStatus);
  const [tierFilter,    setTierFilter]    = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortBy,        setSortBy]        = useState("");
  const [sortOrder,     setSortOrder]     = useState<"asc" | "desc">("desc");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchTimeoutRef                  = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const fetchAgents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await agentApi.getAgents({
        page, pageSize, search: debouncedSearch,
        status: statusFilter, tier: tierFilter, country: countryFilter, sortBy, sortOrder,
      });
      setAgents(response.data); setTotal(response.total);
      setTotalPages(response.totalPages); setStats(response.stats);
    } catch (err: any) {
      setError(err as ApiError); setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, tierFilter, countryFilter, sortBy, sortOrder]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const getInternalId = useCallback(
    (displayId: string): string => agents.find((a) => a.id === displayId)?.internalId || displayId,
    [agents],
  );

  const createAgent = async (data: Partial<Agent>) => {
    setActionLoading("create");
    try { const r = await agentApi.createAgent(data); await fetchAgents(); return r; }
    finally { setActionLoading(null); }
  };

  const updateAgent = async (displayId: string, data: Partial<Agent>) => {
    setActionLoading(`update-${displayId}`);
    const internalId = getInternalId(displayId);
    try {
      const updated = await agentApi.updateAgent(internalId, data);
      setAgents((prev) =>
        prev.map((a) => a.id === displayId ? { ...a, ...updated, id: a.id, internalId: a.internalId } : a)
      );
      return updated;
    } finally { setActionLoading(null); }
  };

  const deleteAgent = async (displayId: string) => {
    setActionLoading(`delete-${displayId}`);
    const internalId = getInternalId(displayId);
    try {
      await agentApi.deleteAgent(internalId);
      setAgents((prev) => prev.filter((a) => a.id !== displayId));
      setTotal((prev) => prev - 1);
    } finally { setActionLoading(null); }
  };

  const updateStatus = async (displayId: string, status: string) => {
    setActionLoading(`status-${displayId}`);
    const internalId = getInternalId(displayId);
    setAgents((prev) =>
      prev.map((a) => a.id === displayId ? { ...a, status: status.toLowerCase() as Agent["status"] } : a)
    );
    try { await agentApi.updateAgentStatus(internalId, status); await fetchAgents(); }
    catch (err) { await fetchAgents(); throw err; }
    finally { setActionLoading(null); }
  };

  const togglePreBooking = async (displayId: string, enabled: boolean) => {
    setActionLoading(`prebooking-${displayId}`);
    const internalId = getInternalId(displayId);
    setAgents((p) => p.map((a) => a.id === displayId ? { ...a, preBookingEnabled: enabled } : a));
    try { await agentApi.togglePreBooking(internalId, enabled); await fetchAgents(); }
    catch (err) {
      setAgents((p) => p.map((a) => a.id === displayId ? { ...a, preBookingEnabled: !enabled } : a));
      throw err;
    } finally { setActionLoading(null); }
  };

  const bulkAction = async (displayIds: string[], action: string) => {
    setActionLoading("bulk");
    const internalIds = displayIds.map((did) => getInternalId(did));
    try { await agentApi.bulkAction(internalIds, action); await fetchAgents(); }
    finally { setActionLoading(null); }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortOrder("asc"); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery(""); setStatusFilter(initialStatus); setTierFilter("");
    setCountryFilter(""); setSortBy(""); setSortOrder("desc"); setPage(1);
  };

  return {
    agents, loading, error, total, totalPages, stats,
    page, pageSize, searchQuery, statusFilter, tierFilter, countryFilter,
    sortBy, sortOrder, actionLoading,
    setPage, setPageSize, setSearchQuery, setStatusFilter,
    setTierFilter, setCountryFilter, handleSort, resetFilters,
    fetchAgents, createAgent, updateAgent, deleteAgent,
    updateStatus, togglePreBooking, bulkAction,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number, currency = "SAR") =>
  new Intl.NumberFormat("en-SA", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount || 0);

// ─── Toast Container ──────────────────────────────────────────────────────────
const ToastContainer = ({
  toasts, removeToast,
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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({
  isOpen, title, message, confirmLabel, confirmClass,
  onConfirm, onCancel, loading,
}: {
  isOpen:        boolean;
  title:         string;
  message:       string;
  confirmLabel:  string;
  confirmClass:  string;
  onConfirm:     () => void;
  onCancel:      () => void;
  loading?:      boolean;
}) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]
        flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold
              hover:bg-slate-200 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 text-white rounded-xl font-semibold transition
              disabled:opacity-50 flex items-center justify-center gap-2 ${confirmClass}`}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = ({ error, onRetry }: { error: ApiError; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-rose-200 shadow-sm p-12 text-center"
  >
    <div className="flex flex-col items-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4
        ${error.statusCode === 0 ? "bg-amber-100" : "bg-rose-100"}`}>
        {error.statusCode === 0
          ? <WifiOff      size={36} className="text-amber-500" />
          : error.statusCode === 500
          ? <ServerCrash  size={36} className="text-rose-500"  />
          : <DatabaseZap  size={36} className="text-rose-500"  />}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {error.statusCode === 0 ? "Connection Lost" : "Something Went Wrong"}
      </h3>
      <p className="text-slate-500 mb-6 max-w-md">{error.message}</p>
      <button onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white
          rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700
          transition flex items-center gap-2">
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  </motion.div>
);

// ─── Table Skeleton ───────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            {Array.from({ length: 12 }).map((_, i) => (
              <th key={i} className="px-3 py-3.5">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, row) => (
            <tr key={row} className="animate-pulse">
              {Array.from({ length: 12 }).map((_, col) => (
                <td key={col} className="px-3 py-3.5">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Stats Skeleton ───────────────────────────────────────────────────────────
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-6 w-12 bg-slate-200 rounded" />
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const ToggleSwitch = ({
  enabled, onChange, loading,
}: {
  enabled:  boolean;
  onChange: () => void;
  loading?: boolean;
}) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!loading) onChange(); }}
    disabled={loading}
    type="button"
    className={`relative inline-flex items-center w-9 h-5 rounded-full
      transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed
      ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
  >
    {loading ? (
      <Loader2 size={12} className="absolute left-1/2 -translate-x-1/2 text-white animate-spin" />
    ) : (
      <span className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow
        transition-all duration-200 ${enabled ? "left-[18px]" : "left-0.5"}`} />
    )}
  </button>
);

// ─── Action Dropdown ──────────────────────────────────────────────────────────
const ActionDropdown = ({
  agent, onView, onEdit, onEnable, onDisable, onDelete, loading,
}: {
  agent:     Agent;
  onView:    () => void;
  onEdit:    () => void;
  onEnable:  () => void;
  onDisable: () => void;
  onDelete:  () => void;
  loading?:  boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        disabled={loading} type="button"
        className="p-1.5 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
      >
        <MoreHorizontal size={16} className="text-slate-500" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl
              shadow-xl border border-slate-100 py-1.5 z-30"
          >
            {[
              { icon: <Eye     size={14} className="text-blue-500"   />, label: "View Details",  onClick: onView },
              { icon: <Edit    size={14} className="text-indigo-500" />, label: "Edit Agent",     onClick: onEdit },
              { icon: <History size={14} className="text-slate-500"  />, label: "View History",  onClick: () => {} },
              { icon: <Send    size={14} className="text-slate-500"  />, label: "Send Message",  onClick: () => {} },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { item.onClick(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-sm text-left text-slate-700
                  hover:bg-slate-50 flex items-center gap-2"
              >
                {item.icon} {item.label}
              </button>
            ))}
            <hr className="my-1.5 border-slate-100" />
            {agent.status !== "active" ? (
              <button onClick={() => { onEnable(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-sm text-left text-emerald-600
                  hover:bg-emerald-50 flex items-center gap-2">
                <Power size={14} /> Enable Agent
              </button>
            ) : (
              <button onClick={() => { onDisable(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-sm text-left text-amber-600
                  hover:bg-amber-50 flex items-center gap-2">
                <PowerOff size={14} /> Disable Agent
              </button>
            )}
            <button onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full px-4 py-2 text-sm text-left text-rose-600
                hover:bg-rose-50 flex items-center gap-2">
              <Trash2 size={14} /> Delete Agent
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Agent Detail Modal ───────────────────────────────────────────────────────
const AgentDetailModal = ({
  agent, onClose, onEdit, onStatusChange, statusLoading,
}: {
  agent:          Agent | null;
  onClose:        () => void;
  onEdit:         (agent: Agent) => void;
  onStatusChange: (agentId: string, status: string) => void;
  statusLoading?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  if (!agent) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sc           = getStatusConfig(agent.status);
  const tc           = getTierConfig(agent.tier);
  const availableLimit = agent.creditLimit - agent.usedLimit;
  const usagePct     = agent.creditLimit > 0 ? (agent.usedLimit / agent.creditLimit) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
        flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
          max-h-[90vh] overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${tc.gradient} p-6 text-white relative`}>
          <button onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition">
            <X size={20} />
          </button>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center
              justify-center text-3xl font-bold backdrop-blur-sm">
              {agent.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{agent.name}</h2>
                {agent.verified && <CheckCircle2 size={20} className="text-white" />}
              </div>
              <p className="text-white/80">{agent.company}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  text-xs font-semibold bg-white/20">
                  {sc.icon} {sc.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  text-xs font-semibold bg-white/20">
                  {tc.icon} {agent.tier.charAt(0).toUpperCase() + agent.tier.slice(1)} Tier
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  text-xs font-semibold bg-white/20">
                  <Users size={12} /> {agent.staffCount} Staffs
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <Wallet    size={20} className="text-emerald-600 mx-auto mb-1" />, val: formatCurrency(agent.balance),      label: "Balance",    bg: "bg-emerald-50", text: "text-emerald-700" },
              { icon: <Receipt   size={20} className="text-blue-600    mx-auto mb-1" />, val: String(agent.totalBookings),         label: "Bookings",   bg: "bg-blue-50",    text: "text-blue-700"    },
              { icon: <Target    size={20} className="text-amber-600   mx-auto mb-1" />, val: `${agent.commission}%`,              label: "Commission", bg: "bg-amber-50",   text: "text-amber-700"   },
              { icon: <TrendingUp size={20} className="text-purple-600 mx-auto mb-1" />, val: formatCurrency(agent.totalRevenue), label: "Revenue",    bg: "bg-purple-50",  text: "text-purple-700"  },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-xl p-3 text-center`}>
                {item.icon}
                <p className={`text-lg font-bold ${item.text}`}>{item.val}</p>
                <p className={`text-xs ${item.text}`}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Credit Limit Usage</span>
              <span className="text-sm font-bold text-slate-800">{usagePct.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePct, 100)}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full
                  ${usagePct > 80 ? "bg-rose-500" : usagePct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Used: {formatCurrency(agent.usedLimit)}</span>
              <span>Available: {formatCurrency(availableLimit)}</span>
              <span>Limit: {formatCurrency(agent.creditLimit)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: <Mail   size={16} className="text-slate-400" />, label: "Email",    val: agent.email,                                               copyable: true  },
                { icon: <Phone  size={16} className="text-slate-400" />, label: "Phone",    val: agent.phone || "—"                                                         },
                { icon: <MapPin size={16} className="text-slate-400" />, label: "Address",  val: agent.address || "—"                                                       },
                { icon: <Globe  size={16} className="text-slate-400" />, label: "Location", val: [agent.city, agent.country].filter(Boolean).join(", ") || "—"              },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  {item.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{item.val}</p>
                  </div>
                  {item.copyable && (
                    <button onClick={() => handleCopy(item.val)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition">
                      {copied
                        ? <Check size={14} className="text-emerald-500" />
                        : <Copy  size={14} className="text-slate-400"   />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center
          justify-between bg-slate-50">
          <code className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">{agent.id}</code>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(agent)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm
                font-medium hover:bg-slate-300 transition flex items-center gap-2">
              <Edit size={16} /> Edit
            </button>
            {agent.status === "active" ? (
              <button onClick={() => onStatusChange(agent.id, "suspended")} disabled={statusLoading}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm
                  font-medium hover:bg-rose-600 transition flex items-center gap-2 disabled:opacity-50">
                {statusLoading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />} Suspend
              </button>
            ) : (
              <button onClick={() => onStatusChange(agent.id, "active")} disabled={statusLoading}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm
                  font-medium hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50">
                {statusLoading ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />} Activate
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Agent Form Modal ─────────────────────────────────────────────────────────
const AgentFormModal = ({
  agent, isOpen, onClose, onSubmit, loading,
}: {
  agent:    Agent | null;
  isOpen:   boolean;
  onClose:  () => void;
  onSubmit: (data: Partial<Agent>) => void;
  loading:  boolean;
}) => {
  const defaultForm: Partial<Agent> = {
    name: "", email: "", phone: "", company: "", address: "",
    city: "", country: "", creditLimit: 50000, commission: 5,
    tier: "bronze", staffCount: 1, preBookingEnabled: false,
  };

  const [formData, setFormData] = useState<Partial<Agent>>(defaultForm);

  useEffect(() => {
    setFormData(agent ? { ...agent } : defaultForm);
  }, [agent, isOpen]); // eslint-disable-line

  if (!isOpen) return null;
  const isEdit = !!agent;
  const inp = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
        flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
          max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center
                justify-center backdrop-blur-sm">
                {isEdit ? <Edit size={24} /> : <UserPlus size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEdit ? "Edit Agent" : "Add New Agent"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEdit ? "Update agent information" : "Create a new agent account"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
          className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name *",       key: "name",    type: "text",  placeholder: "Enter full name",    required: true },
              { label: "Email Address *",   key: "email",   type: "email", placeholder: "email@example.com", required: true },
              { label: "Phone Number *",    key: "phone",   type: "tel",   placeholder: "+966 50 123 4567",  required: true },
              { label: "Company Name *",    key: "company", type: "text",  placeholder: "Company name",      required: true },
            ].map(({ label, key, type, placeholder, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(formData as any)[key] || ""}
                  placeholder={placeholder}
                  required={required}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className={inp}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input type="text" value={formData.address || ""}
                placeholder="Street address"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={inp} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
              <input type="text" value={formData.city || ""} placeholder="City" required
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={inp} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country *</label>
              <div className="relative">
                <select value={formData.country || ""} required
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={`${inp} appearance-none pr-10`}>
                  <option value="">Select country</option>
                  {["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {[
              { label: "Credit Limit (SAR)", key: "creditLimit"            },
              { label: "Commission (%)",     key: "commission", step: "0.5" },
            ].map(({ label, key, step }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input type="number" step={step} value={(formData as any)[key] ?? 0}
                  onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                  className={inp} />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Tier</label>
              <div className="relative">
                <select value={formData.tier || "bronze"}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as Agent["tier"] })}
                  className={`${inp} appearance-none pr-10`}>
                  {["bronze", "silver", "gold", "platinum"].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Staff Count</label>
              <input type="number" min="1" value={formData.staffCount || 1}
                onChange={(e) => setFormData({ ...formData, staffCount: Number(e.target.value) })}
                className={inp} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pre-Booking</label>
              <div
                onClick={() => setFormData({ ...formData, preBookingEnabled: !formData.preBookingEnabled })}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition
                  ${formData.preBookingEnabled
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"}`}>
                <div className={`w-12 h-6 rounded-full transition-colors relative
                  ${formData.preBookingEnabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all
                    ${formData.preBookingEnabled ? "left-7" : "left-1"}`} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    Pre-Booking {formData.preBookingEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="text-xs text-slate-500">Allow agent to make pre-bookings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold
                hover:bg-slate-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition
                disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
                : <>{isEdit ? <Check size={18} /> : <UserPlus size={18} />} {isEdit ? "Update Agent" : "Create Agent"}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Export Dropdown ──────────────────────────────────────────────────────────
const ExportDropdown = ({
  onExport, loading,
}: {
  onExport: (format: string) => void;
  loading?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200
          rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition
          shadow-sm disabled:opacity-50">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
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
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl
                shadow-xl border border-slate-100 py-1.5 z-20"
            >
              {[
                { label: "Export as PDF",   format: "pdf",   icon: <File            size={16} className="text-rose-500"    /> },
                { label: "Export as Excel", format: "excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
              ].map(({ label, format, icon }) => (
                <button key={format}
                  onClick={() => { onExport(format); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm text-left text-slate-700
                    hover:bg-slate-50 flex items-center gap-3">
                  {icon} {label}
                </button>
              ))}
              <hr className="my-1.5 border-slate-100" />
              <button onClick={() => { onExport("print"); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700
                  hover:bg-slate-50 flex items-center gap-3">
                <Printer size={16} className="text-slate-500" /> Print List
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentManagement({ defaultStatus = "" }: { defaultStatus?: string }) {
  const {
    agents, loading, error, total, totalPages, stats,
    page, pageSize, searchQuery, statusFilter, tierFilter, countryFilter,
    sortBy, sortOrder, actionLoading,
    setPage, setPageSize, setSearchQuery, setStatusFilter,
    setTierFilter, setCountryFilter, handleSort, resetFilters,
    fetchAgents, createAgent, updateAgent, deleteAgent,
    updateStatus, togglePreBooking, bulkAction,
  } = useAgents(defaultStatus);

  const [selectedAgent,   setSelectedAgent]   = useState<Agent | null>(null);
  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal,   setShowFormModal]   = useState(false);
  const [editingAgent,    setEditingAgent]    = useState<Agent | null>(null);
  const [showFilters,     setShowFilters]     = useState(false);
  const [toasts,          setToasts]          = useState<Toast[]>([]);
  const [confirmDialog,   setConfirmDialog]   = useState<{
    isOpen: boolean; title: string; message: string;
    confirmLabel: string; confirmClass: string; onConfirm: () => void;
  }>({
    isOpen: false, title: "", message: "",
    confirmLabel: "", confirmClass: "", onConfirm: () => {},
  });

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const openConfirm  = (config: Omit<typeof confirmDialog, "isOpen">) =>
    setConfirmDialog({ ...config, isOpen: true });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  const countries = useMemo(
    () => [...new Set(agents.map((a) => a.country).filter(Boolean))],
    [agents],
  );

  // ── Sort Icon (inline) ──
  const SortIconInline = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown size={13} className="opacity-30" />;
    return sortOrder === "asc"
      ? <ArrowUp   size={13} className="text-blue-500" />
      : <ArrowDown size={13} className="text-blue-500" />;
  };

  const handleViewAgent = (agent: Agent) => { setSelectedAgent(agent); setShowDetailModal(true); };
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent); setShowDetailModal(false); setShowFormModal(true);
  };
  const handleAddAgent = () => { setEditingAgent(null); setShowFormModal(true); };

  const handleStatusChange = async (agentDisplayId: string, newStatus: string) => {
    try {
      await updateStatus(agentDisplayId, newStatus);
      setSelectedAgent((prev) =>
        prev && prev.id === agentDisplayId
          ? { ...prev, status: newStatus.toLowerCase() as Agent["status"] }
          : prev
      );
      setShowDetailModal(false);
      addToast(`Agent status updated to ${newStatus}`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update status", "error");
    }
  };

  const handleTogglePreBooking = async (agentDisplayId: string, currentState: boolean) => {
    try {
      await togglePreBooking(agentDisplayId, !currentState);
      addToast(`Pre-booking ${!currentState ? "enabled" : "disabled"} successfully`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to toggle pre-booking", "error");
    }
  };

  const handleEnableAgent = async (agentDisplayId: string) => {
    try {
      await updateStatus(agentDisplayId, "active");
      addToast("Agent enabled successfully", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to enable agent", "error");
    }
  };

  const handleDisableAgent = (agentDisplayId: string) => {
    const agent = agents.find((a) => a.id === agentDisplayId);
    openConfirm({
      title:        "Disable Agent",
      message:      `Are you sure you want to disable ${agent?.name || "this agent"}?`,
      confirmLabel: "Disable",
      confirmClass: "bg-amber-500 hover:bg-amber-600",
      onConfirm:    async () => {
        try {
          await updateStatus(agentDisplayId, "suspended");
          closeConfirm();
          addToast("Agent disabled successfully", "warning");
        } catch (err: any) {
          addToast(err.message || "Failed to disable agent", "error");
          closeConfirm();
        }
      },
    });
  };

  const handleDeleteAgent = (agentDisplayId: string) => {
    const agent = agents.find((a) => a.id === agentDisplayId);
    openConfirm({
      title:        "Delete Agent",
      message:      `Are you sure you want to permanently delete ${agent?.name || "this agent"}?`,
      confirmLabel: "Delete",
      confirmClass: "bg-rose-500 hover:bg-rose-600",
      onConfirm:    async () => {
        try {
          await deleteAgent(agentDisplayId);
          closeConfirm();
          addToast("Agent deleted successfully", "success");
        } catch (err: any) {
          addToast(err.message || "Failed to delete agent", "error");
          closeConfirm();
        }
      },
    });
  };

  const handleFormSubmit = async (data: Partial<Agent>) => {
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, data);
        addToast("Agent updated successfully!", "success");
      } else {
        await createAgent(data);
        addToast("New agent created successfully!", "success");
      }
      setShowFormModal(false);
      setEditingAgent(null);
    } catch (err: any) {
      addToast(err.message || "Failed to save agent", "error");
    }
  };

  const handleExport  = async (format: string) => { addToast(`Export coming soon (${format.toUpperCase()})`, "info"); };
  const handleReset   = () => { resetFilters(); setSelectedIds(new Set()); addToast("Filters cleared", "info"); };
  const toggleSelectAll = () => {
    if (selectedIds.size === agents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(agents.map((a) => a.id)));
  };
  const toggleSelect = (id: string) => {
    const n = new Set(selectedIds);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelectedIds(n);
  };

  const handleBulkAction = async (action: string) => {
    const count = selectedIds.size;
    if (action === "delete") {
      openConfirm({
        title:        "Delete Agents",
        message:      `Are you sure you want to permanently delete ${count} agent(s)?`,
        confirmLabel: "Delete All",
        confirmClass: "bg-rose-500 hover:bg-rose-600",
        onConfirm:    async () => {
          try {
            await bulkAction(Array.from(selectedIds), action);
            closeConfirm(); setSelectedIds(new Set());
            addToast(`${count} agent(s) deleted`, "success");
          } catch (err: any) {
            addToast(err.message || "Bulk delete failed", "error");
            closeConfirm();
          }
        },
      });
      return;
    }
    try {
      await bulkAction(Array.from(selectedIds), action);
      setSelectedIds(new Set());
      addToast(`${count} agent(s) ${action === "activate" ? "enabled" : "disabled"}`, "success");
    } catch (err: any) {
      addToast(err.message || "Bulk action failed", "error");
    }
  };

  const activeFilterCount = [statusFilter, tierFilter, countryFilter]
    .filter((f) => f && f !== defaultStatus).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30
      to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
                rounded-xl flex items-center justify-center">
                <Users size={22} className="text-white" />
              </div>
              Agent Management
              {defaultStatus && (
                <span className={`text-sm px-3 py-1 rounded-full font-medium
                  ${getStatusConfig(defaultStatus).bg} ${getStatusConfig(defaultStatus).text}`}>
                  {getStatusConfig(defaultStatus).label}
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1">
              {defaultStatus
                ? `Showing ${defaultStatus} agents only`
                : "Manage all travel agents and their accounts"}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <ExportDropdown onExport={handleExport} loading={false} />
            <button onClick={() => fetchAgents()} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200
                rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition
                shadow-sm disabled:opacity-70">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleAddAgent}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r
                from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium
                hover:from-blue-700 hover:to-indigo-700 transition shadow-sm">
              <UserPlus size={16} /> Add Agent
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        {loading && !agents.length ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {[
              { label: "Total Agents",   value: stats.total,                        icon: <Users      size={18} />, bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100"    },
              { label: "Active",         value: stats.active,                       icon: <UserCheck  size={18} />, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
              { label: "Pending",        value: stats.pending,                      icon: <Clock      size={18} />, bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100"   },
              { label: "Suspended",      value: stats.suspended,                    icon: <Ban        size={18} />, bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100"    },
              { label: "Total Balance",  value: formatCurrency(stats.totalBalance), icon: <Wallet     size={18} />, bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-100", isLarge: true },
              { label: "Total Revenue",  value: formatCurrency(stats.totalRevenue), icon: <TrendingUp size={18} />, isDark: true, isLarge: true },
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-2xl p-4 border shadow-sm
                ${stat.isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                  : `bg-white ${"border" in stat ? stat.border : ""}`}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${stat.isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {stat.label}
                    </p>
                    <p className={`font-bold ${stat.isDark ? "text-white" : "text" in stat ? stat.text : "text-slate-800"} ${stat.isLarge ? "text-base mt-0.5" : "text-2xl"}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${stat.isDark
                      ? "bg-white/10 text-emerald-400"
                      : `${"bg" in stat ? stat.bg : "bg-slate-50"} ${"text" in stat ? stat.text : "text-slate-600"}`}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, email, company..."
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                    hover:bg-slate-100 rounded-full">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!defaultStatus && (
                <div className="relative">
                  <select value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200
                      rounded-xl text-sm focus:outline-none bg-white cursor-pointer min-w-[120px]">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <ChevronDown size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center
                  gap-2 transition relative
                  ${showFilters ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white
                    text-xs rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm
                  font-medium hover:bg-slate-200 transition flex items-center gap-2">
                <RotateCcw size={15} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-slate-100
                  grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Tier",    value: tierFilter,    onChange: setTierFilter,    opts: [["bronze","Bronze"],["silver","Silver"],["gold","Gold"],["platinum","Platinum"]], placeholder: "All Tiers"     },
                    { label: "Country", value: countryFilter, onChange: setCountryFilter, opts: countries.map((c) => [c, c]),                                                    placeholder: "All Countries"  },
                  ].map(({ label, value, onChange, opts, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                      <div className="relative">
                        <select value={value}
                          onChange={(e) => { onChange(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                            text-sm bg-white appearance-none pr-10 focus:outline-none">
                          <option value="">{placeholder}</option>
                          {opts.map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                          ))}
                        </select>
                        <ChevronDown size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                  <div className="col-span-2 flex items-end">
                    <button onClick={handleReset}
                      className="px-4 py-2 text-sm text-rose-500 hover:text-rose-700 font-medium transition">
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
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4
                flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <p className="text-white font-semibold">
                  {selectedIds.size} agent{selectedIds.size > 1 ? "s" : ""} selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: "Enable",  action: "activate", icon: <Power    size={13} />, cls: "bg-emerald-500 hover:bg-emerald-600" },
                  { label: "Disable", action: "suspend",  icon: <PowerOff size={13} />, cls: "bg-amber-500   hover:bg-amber-600"   },
                  { label: "Delete",  action: "delete",   icon: <Trash2   size={13} />, cls: "bg-rose-500    hover:bg-rose-600"    },
                ].map(({ label, action, icon, cls }) => (
                  <button key={action} onClick={() => handleBulkAction(action)}
                    disabled={!!actionLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg
                      text-xs font-medium transition disabled:opacity-50 ${cls}`}>
                    {icon} {label}
                  </button>
                ))}
                <button onClick={() => setSelectedIds(new Set())}
                  className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center
          justify-between gap-2">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{agents.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{total}</span> agents
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm
                  bg-white appearance-none pr-8 cursor-pointer focus:outline-none">
                {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDown size={13}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && !loading && <ErrorState error={error} onRetry={fetchAgents} />}

        {/* Table */}
        {!error && (
          <>
            {loading && !agents.length ? (
              <TableSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative"
              >
                {loading && agents.length > 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10
                    flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl
                      shadow-lg border border-slate-100">
                      <Loader2 size={20} className="text-blue-500 animate-spin" />
                      <span className="text-sm font-medium text-slate-600">Updating...</span>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-slate-100
                        border-b border-slate-200">
                        <th className="px-3 py-3.5 text-left w-10">
                          <input
                            type="checkbox"
                            checked={agents.length > 0 && selectedIds.size === agents.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600
                              focus:ring-blue-500"
                          />
                        </th>
                        {[
                          { label: "ID",   col: "id"   },
                          { label: "Name", col: "name" },
                        ].map(({ label, col }) => (
                          <th key={col} className="px-3 py-3.5 text-left">
                            <button onClick={() => handleSort(col)}
                              className="flex items-center gap-1 text-xs font-semibold
                                text-slate-500 uppercase tracking-wider
                                hover:text-slate-800 transition">
                              {label} <SortIconInline column={col} />
                            </button>
                          </th>
                        ))}
                        {["Email", "Phone", "Country"].map((h) => (
                          <th key={h} className="px-3 py-3.5 text-left">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {h}
                            </span>
                          </th>
                        ))}
                        <th className="px-3 py-3.5 text-right">
                          <button onClick={() => handleSort("balance")}
                            className="flex items-center gap-1 text-xs font-semibold
                              text-slate-500 uppercase tracking-wider hover:text-slate-800
                              transition ml-auto">
                            Balance <SortIconInline column="balance" />
                          </button>
                        </th>
                        <th className="px-3 py-3.5 text-right">
                          <button onClick={() => handleSort("creditLimit")}
                            className="flex items-center gap-1 text-xs font-semibold
                              text-slate-500 uppercase tracking-wider hover:text-slate-800
                              transition ml-auto">
                            Credit Limit <SortIconInline column="creditLimit" />
                          </button>
                        </th>
                        {["Staffs", "Pre Booking", "Actions"].map((h) => (
                          <th key={h} className="px-3 py-3.5 text-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {h}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {agents.length > 0 ? (
                        agents.map((agent) => {
                          const sc                = getStatusConfig(agent.status);
                          const tc                = getTierConfig(agent.tier);
                          const isSelected        = selectedIds.has(agent.id);
                          const isThisLoading     =
                            actionLoading === `status-${agent.id}`    ||
                            actionLoading === `delete-${agent.id}`    ||
                            actionLoading === `update-${agent.id}`    ||
                            actionLoading === `prebooking-${agent.id}`;
                          const isPreBookingLoading = actionLoading === `prebooking-${agent.id}`;
                          const isStatusLoading     = actionLoading === `status-${agent.id}`;

                          return (
                            <motion.tr
                              key={agent.id}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className={`hover:bg-slate-50/80 transition group
                                ${isSelected    ? "bg-blue-50/60" : ""}
                                ${isThisLoading ? "opacity-60"    : ""}`}
                            >
                              <td className="px-3 py-3">
                                <input type="checkbox" checked={isSelected}
                                  onChange={() => toggleSelect(agent.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600
                                    focus:ring-blue-500" />
                              </td>

                              {/* ID */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1">
                                  <Link href={`/admin/agent/${agent.internalId}/ledger`}
                                    className="px-2 py-0.5 bg-slate-100 text-blue-600
                                      hover:text-blue-800 hover:bg-blue-50 rounded text-xs
                                      font-mono font-medium transition">
                                    {agent.id}
                                  </Link>
                                  {agent.verified && (
                                    <CheckCircle2 size={13} className="text-blue-500 shrink-0" />
                                  )}
                                </div>
                              </td>

                              {/* Name */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-9 h-9 bg-gradient-to-br ${tc.gradient}
                                    rounded-xl flex items-center justify-center text-white
                                    font-bold text-sm shrink-0`}>
                                    {(agent.agentName || agent.name)?.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-800 text-sm
                                      leading-tight truncate max-w-[130px]">
                                      {agent.agentName || agent.name}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 px-1.5
                                      py-0.5 rounded-full text-[10px] font-semibold mt-0.5
                                      ${sc.bg} ${sc.text}`}>
                                      {sc.icon} {sc.label}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Mail size={12} className="text-slate-400 shrink-0" />
                                  <span className="text-xs text-slate-600 truncate max-w-[160px]">
                                    {agent.email}
                                  </span>
                                </div>
                              </td>

                              {/* Phone */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Phone size={12} className="text-slate-400 shrink-0" />
                                  <span className="text-xs text-slate-600 whitespace-nowrap">
                                    {agent.phone || "—"}
                                  </span>
                                </div>
                              </td>

                              {/* Country */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Globe size={12} className="text-slate-400 shrink-0" />
                                  <span className="text-xs text-slate-600 whitespace-nowrap">
                                    {agent.country || "—"}
                                  </span>
                                </div>
                              </td>

                              {/* Balance */}
                              <td className="px-3 py-3 text-right">
                                <p className="font-bold text-slate-800 text-sm">
                                  {formatCurrency(agent.balance)}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {agent.totalBookings} bookings
                                </p>
                              </td>

                              {/* Credit Limit */}
                              <td className="px-3 py-3 text-right">
                                <p className="font-bold text-slate-800 text-sm">
                                  {formatCurrency(agent.creditLimit)}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Used: {formatCurrency(agent.usedLimit)}
                                </p>
                              </td>

                              {/* Staffs */}
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center gap-1
                                  bg-blue-50 text-blue-700 px-2 py-1 rounded-lg w-fit mx-auto">
                                  <Users size={11} />
                                  <span className="text-xs font-semibold">{agent.staffCount}</span>
                                </div>
                              </td>

                              {/* Pre Booking */}
                              <td className="px-3 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <ToggleSwitch
                                    enabled={agent.preBookingEnabled}
                                    onChange={() => handleTogglePreBooking(agent.id, agent.preBookingEnabled)}
                                    loading={isPreBookingLoading}
                                  />
                                  <span className={`text-[10px] font-medium
                                    ${agent.preBookingEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                                    {agent.preBookingEnabled ? "ON" : "OFF"}
                                  </span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  {agent.status === "active" ? (
                                    <button onClick={() => handleDisableAgent(agent.id)}
                                      disabled={isThisLoading}
                                      className="p-1.5 hover:bg-amber-50 rounded-lg transition
                                        group/btn disabled:opacity-50" title="Disable">
                                      {isStatusLoading
                                        ? <Loader2  size={15} className="text-amber-500 animate-spin" />
                                        : <PowerOff size={15} className="text-slate-400 group-hover/btn:text-amber-500 transition" />}
                                    </button>
                                  ) : (
                                    <button onClick={() => handleEnableAgent(agent.id)}
                                      disabled={isThisLoading}
                                      className="p-1.5 hover:bg-emerald-50 rounded-lg transition
                                        group/btn disabled:opacity-50" title="Enable">
                                      {isStatusLoading
                                        ? <Loader2 size={15} className="text-emerald-500 animate-spin" />
                                        : <Power   size={15} className="text-slate-400 group-hover/btn:text-emerald-500 transition" />}
                                    </button>
                                  )}
                                  <button onClick={() => handleEditAgent(agent)}
                                    disabled={isThisLoading}
                                    className="p-1.5 hover:bg-blue-50 rounded-lg transition
                                      group/btn disabled:opacity-50" title="Edit">
                                    <Edit size={15} className="text-slate-400 group-hover/btn:text-blue-500 transition" />
                                  </button>
                                  <button onClick={() => handleDeleteAgent(agent.id)}
                                    disabled={isThisLoading}
                                    className="p-1.5 hover:bg-rose-50 rounded-lg transition
                                      group/btn disabled:opacity-50" title="Delete">
                                    {actionLoading === `delete-${agent.id}`
                                      ? <Loader2 size={15} className="text-rose-500 animate-spin" />
                                      : <Trash2  size={15} className="text-slate-400 group-hover/btn:text-rose-500 transition" />}
                                  </button>
                                  <ActionDropdown
                                    agent={agent}
                                    onView={()    => handleViewAgent(agent)}
                                    onEdit={()    => handleEditAgent(agent)}
                                    onEnable={()  => handleEnableAgent(agent.id)}
                                    onDisable={() => handleDisableAgent(agent.id)}
                                    onDelete={()  => handleDeleteAgent(agent.id)}
                                    loading={isThisLoading}
                                  />
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
                              <div className="w-16 h-16 bg-slate-100 rounded-full
                                flex items-center justify-center mb-4">
                                <Users size={28} className="text-slate-400" />
                              </div>
                              <p className="text-slate-600 font-semibold">No agents found</p>
                              <p className="text-slate-400 text-sm mt-1">
                                Try adjusting your search or filters
                              </p>
                              <button onClick={handleReset}
                                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl
                                  text-sm font-medium hover:bg-blue-700 transition
                                  flex items-center gap-2">
                                <RotateCcw size={15} /> Reset Filters
                              </button>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && total > 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-sm text-slate-500 order-2 sm:order-1">
                  Page{" "}
                  <span className="font-semibold text-slate-700">{page}</span> of{" "}
                  <span className="font-semibold text-slate-700">{totalPages || 1}</span>
                </p>
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <button disabled={page === 1} onClick={() => setPage(1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                      disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronsLeft size={17} className="text-slate-600" />
                  </button>
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                      disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={17} className="text-slate-600" />
                  </button>
                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                      const t = totalPages || 1;
                      let pn: number;
                      if (t <= 5)          pn = i + 1;
                      else if (page <= 3)   pn = i + 1;
                      else if (page >= t - 2) pn = t - 4 + i;
                      else                 pn = page - 2 + i;
                      return (
                        <button key={pn} onClick={() => setPage(pn)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition
                            ${page === pn
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                              : "hover:bg-slate-100 text-slate-600 border border-slate-200"}`}>
                          {pn}
                        </button>
                      );
                    })}
                  </div>
                  <button disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                      disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight size={17} className="text-slate-600" />
                  </button>
                  <button disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(totalPages)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                      disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronsRight size={17} className="text-slate-600" />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedAgent && (
          <AgentDetailModal
            agent={selectedAgent}
            onClose={() => { setShowDetailModal(false); setSelectedAgent(null); }}
            onEdit={handleEditAgent}
            onStatusChange={handleStatusChange}
            statusLoading={!!actionLoading?.startsWith("status-")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFormModal && (
          <AgentFormModal
            agent={editingAgent} isOpen={showFormModal}
            onClose={() => { setShowFormModal(false); setEditingAgent(null); }}
            onSubmit={handleFormSubmit}
            loading={
              actionLoading === "create" ||
              !!(editingAgent && actionLoading === `update-${editingAgent.id}`)
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog.isOpen && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            confirmClass={confirmDialog.confirmClass}
            onConfirm={confirmDialog.onConfirm}
            onCancel={closeConfirm}
            loading={!!actionLoading}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}