"use client";

import React from "react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search, Users, RefreshCw, Calendar, Wallet, CheckCircle2, XCircle,
  AlertCircle, Clock, Download, X, ChevronDown, Info, Loader2,
  Mail, Phone, Send, History, Settings, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Sparkles, ArrowLeftRight, FilePlus, RotateCcw,
  CalendarClock, PlusCircle, MinusCircle, Gauge, Copy, Check,
  ChevronsUpDown, HelpCircle, Zap, Ticket, ShieldPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Agent {
  id:            string;
  internalId:    string;
  name:          string;
  email:         string;
  phone:         string;
  company:       string;
  balance:       number;
  creditLimit:   number;
  usedLimit:     number;
  status:        string;
  totalBookings: number;
  joinedDate:    string;
  verified:      boolean;
}

interface Operation {
  id:            string;
  type:          string;
  agentId:       string;
  agentName:     string;
  amount:        number;
  description:   string;
  reference?:    string;
  pnr?:          string;
  passengerName?: string;
  route?:        string;
  travelDate?:   string;
  newLimit?:     number;
  status:        string;
  createdAt:     string;
  createdBy:     string;
}

interface OperationType {
  id:          string;
  name:        string;
  description: string;
  icon:        React.ReactElement;  // ✅ fixed
  color:       string;
  bgColor:     string;
  borderColor: string;
  gradient:    string;
  type:        "credit" | "debit" | "neutral";
}

interface Toast {
  id:      string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}

// ─── Operation Types Config ───────────────────────────────────────────────────
const operationTypes: OperationType[] = [
  {
    id: "manual_booking", name: "Manual Booking",
    description: "Add a manual booking entry for the agent",
    icon: <FilePlus     size={28} />,
    color: "text-blue-600",    bgColor: "bg-blue-50",    borderColor: "border-blue-200",    gradient: "from-blue-500 to-blue-600",    type: "debit",
  },
  {
    id: "refund", name: "Process Refund",
    description: "Process ticket refund to agent account",
    icon: <RotateCcw    size={28} />,
    color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", gradient: "from-emerald-500 to-emerald-600", type: "credit",
  },
  {
    id: "date_change", name: "Date Change",
    description: "Process date change charges or refund",
    icon: <CalendarClock size={28} />,
    color: "text-purple-600",  bgColor: "bg-purple-50",  borderColor: "border-purple-200",  gradient: "from-purple-500 to-purple-600",  type: "neutral",
  },
  {
    id: "add_credit", name: "Add Credit",
    description: "Quick add credit limit for emergency cases",
    icon: <ShieldPlus   size={28} />,
    color: "text-teal-600",    bgColor: "bg-teal-50",    borderColor: "border-teal-200",    gradient: "from-teal-500 to-teal-600",    type: "credit",
  },
  {
    id: "adm", name: "ADM (Debit Memo)",
    description: "Add Agency Debit Memo adjustment",
    icon: <MinusCircle  size={28} />,
    color: "text-rose-600",    bgColor: "bg-rose-50",    borderColor: "border-rose-200",    gradient: "from-rose-500 to-rose-600",    type: "debit",
  },
  {
    id: "acm", name: "ACM (Credit Memo)",
    description: "Add Agency Credit Memo adjustment",
    icon: <PlusCircle   size={28} />,
    color: "text-amber-600",   bgColor: "bg-amber-50",   borderColor: "border-amber-200",   gradient: "from-amber-500 to-amber-600",   type: "credit",
  },
  {
    id: "limit_add", name: "Credit Limit",
    description: "Adjust agent credit limit",
    icon: <Gauge        size={28} />,
    color: "text-indigo-600",  bgColor: "bg-indigo-50",  borderColor: "border-indigo-200",  gradient: "from-indigo-500 to-indigo-600",  type: "neutral",
  },
  {
    id: "amount_deduct", name: "Amount Deduct",
    description: "Deduct amount from agent balance",
    icon: <MinusCircle  size={28} />,
    color: "text-slate-600",   bgColor: "bg-slate-50",   borderColor: "border-slate-200",   gradient: "from-slate-500 to-slate-600",   type: "debit",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
type OpId = (typeof operationTypes)[number]["id"];
const CREDIT_OPS: OpId[] = ["refund", "acm", "add_credit"];
const DEBIT_OPS:  OpId[] = ["adm", "manual_booking", "amount_deduct"];

function isCredit(type: string): boolean {
  return CREDIT_OPS.includes(type as OpId);
}
void isCredit; // suppress unused warning

// ─── Validation ───────────────────────────────────────────────────────────────
function validateOperationForm(
  operationId: string,
  formData: Record<string, string>,
  agent: Agent
): string | null {
  switch (operationId) {
    case "manual_booking":
      if (!formData.passengerName?.trim()) return "Passenger name is required";
      if (!formData.pnr?.trim())           return "PNR is required";
      if (formData.pnr.trim().length !== 6) return "PNR must be 6 characters";
      if (!formData.route?.trim())         return "Route is required";
      if (!formData.travelDate)            return "Travel date is required";
      if (!formData.amount || Number(formData.amount) <= 0) return "Amount must be greater than 0";
      return null;
    case "refund":
      if (!formData.pnr?.trim())           return "PNR is required";
      if (formData.pnr.trim().length !== 6) return "PNR must be 6 characters";
      if (!formData.amount || Number(formData.amount) <= 0) return "Refund amount must be greater than 0";
      if (!formData.description?.trim())   return "Refund reason is required";
      return null;
    case "date_change":
      if (!formData.pnr?.trim())           return "PNR is required";
      if (formData.pnr.trim().length !== 6) return "PNR must be 6 characters";
      if (!formData.travelDate)            return "New travel date is required";
      if (!formData.amount || Number(formData.amount) === 0) return "Amount is required (negative for refund)";
      return null;
    case "add_credit":
      if (!formData.amount || Number(formData.amount) <= 0) return "Credit amount must be greater than 0";
      if (!formData.description?.trim())   return "Reason is required for credit addition";
      return null;
    case "adm":
    case "acm":
      if (!formData.pnr?.trim())           return "PNR is required";
      if (formData.pnr.trim().length !== 6) return "PNR must be 6 characters";
      if (!formData.amount || Number(formData.amount) <= 0) return "Amount must be greater than 0";
      if (!formData.description?.trim())   return "Reason/Description is required";
      return null;
    case "limit_add":
      if (!formData.newLimit || Number(formData.newLimit) < 0) return "New credit limit is required";
      if (Number(formData.newLimit) < agent.usedLimit)
        return `New limit cannot be less than used limit (SAR ${agent.usedLimit.toLocaleString()})`;
      if (!formData.description?.trim())   return "Reason for change is required";
      return null;
    case "amount_deduct":
      if (!formData.amount || Number(formData.amount) <= 0) return "Amount must be greater than 0";
      if (!formData.description?.trim())   return "Description is required";
      return null;
    default:
      return "Unknown operation type";
  }
}

function buildPayload(
  operationId: string,
  formData: Record<string, string>,
  agent: Agent
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    agentId:       agent.id,
    operationType: operationId,
  };
  switch (operationId) {
    case "manual_booking":
      return { ...base, amount: Number(formData.amount), passengerName: formData.passengerName.trim().toUpperCase(), pnr: formData.pnr.trim().toUpperCase(), route: formData.route.trim().toUpperCase(), travelDate: formData.travelDate, description: formData.description?.trim() || `Manual booking - ${formData.pnr.trim().toUpperCase()}` };
    case "refund":
      return { ...base, amount: Number(formData.amount), pnr: formData.pnr.trim().toUpperCase(), description: formData.description.trim(), reference: formData.reference?.trim() || undefined };
    case "date_change":
      return { ...base, amount: Number(formData.amount), pnr: formData.pnr.trim().toUpperCase(), travelDate: formData.travelDate, description: formData.description?.trim() || `Date change - ${formData.pnr.trim().toUpperCase()}` };
    case "add_credit":
      return { ...base, amount: Number(formData.amount), newLimit: agent.creditLimit + Number(formData.amount), previousLimit: agent.creditLimit, description: formData.description.trim(), reference: formData.reference?.trim() || undefined };
    case "adm":
    case "acm":
      return { ...base, amount: Number(formData.amount), pnr: formData.pnr.trim().toUpperCase(), reference: formData.reference?.trim() || undefined, description: formData.description.trim() };
    case "limit_add":
      return { ...base, newLimit: Number(formData.newLimit), previousLimit: agent.creditLimit, amount: Math.abs(Number(formData.newLimit) - agent.creditLimit), description: formData.description.trim(), reference: formData.reference?.trim() || undefined };
    case "amount_deduct":
      return { ...base, amount: Number(formData.amount), reference: formData.reference?.trim() || undefined, description: formData.description.trim() };
    default:
      return base;
  }
}

// ─── Status Config (no JSX.Element) ──────────────────────────────────────────
function getStatusConfig(status: string): {
  bg: string; text: string; icon: React.ReactElement;
} {
  const map: Record<string, { bg: string; text: string; icon: React.ReactElement }> = {
    completed: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 size={12} /> },
    pending:   { bg: "bg-amber-100",   text: "text-amber-700",   icon: <Clock        size={12} /> },
    failed:    { bg: "bg-rose-100",    text: "text-rose-700",    icon: <XCircle      size={12} /> },
  };
  return map[status.toLowerCase()] || {
    bg: "bg-slate-100", text: "text-slate-700", icon: <Info size={12} />,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useAgentList() {
  const [agents,  setAgents]  = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient("/admin/agents?limit=100");
      const list =
        result?.agents ||
        result?.data ||
        (Array.isArray(result) ? result : []);

      const normalized: Agent[] = list.map((a: any) => ({
        id:            a.id,
        internalId:    a.agentId || "N/A",
        name:          a.agentName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "Unknown",
        company:       a.agentName || "",
        email:         a.email    || "",
        phone:         a.phone    || "",
        balance:       Number(a.balance      || 0),
        creditLimit:   Number(a.creditLimit  || 0),
        usedLimit:     Number(a.usedLimit    || 0),
        status:        String(a.status       || "active").toLowerCase(),
        totalBookings: Number(a._count?.bookings || a.totalBookings || 0),
        joinedDate:    a.createdAt || "",
        verified:      !!a.verified,
      }));
      setAgents(normalized);
    } catch (err: any) {
      console.error("Agent fetch error:", err?.message || err);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  return { agents, loading, refetch: fetchAgents };
}

function useOperations() {
  const [operations,    setOperations]    = useState<Operation[]>([]);
  const [stats,         setStats]         = useState({ todayOperations: 0, totalCredit: 0, totalDebit: 0, pendingCount: 0 });
  const [loading,       setLoading]       = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient("/admin/operations?limit=20");
      setOperations(result?.data || []);
      if (result?.stats) {
        setStats({
          todayOperations: result.stats.todayOperations || 0,
          totalCredit:     result.stats.totalCredit     || 0,
          totalDebit:      result.stats.totalDebit      || 0,
          pendingCount:    result.stats.pendingCount     || 0,
        });
      }
    } catch (err: any) {
      console.error("Operations fetch error:", err?.message || err);
      setOperations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOperations(); }, [fetchOperations]);

  const submitOperation = async (payload: unknown): Promise<unknown> => {
    setSubmitLoading(true);
    try {
      const result = await apiClient("/admin/operations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await fetchOperations();
      return result;
    } catch (err: any) {
      throw new Error(err?.message || "Operation failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  return { operations, stats, loading, submitLoading, fetchOperations, submitOperation };
}

// ─── Toast Container ──────────────────────────────────────────────────────────
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

// ─── Agent Search Dropdown ────────────────────────────────────────────────────
const AgentSearchDropdown = ({
  agents, selectedAgent, onSelect, isOpen, setIsOpen, loading,
}: {
  agents:        Agent[];
  selectedAgent: Agent | null;
  onSelect:      (agent: Agent) => void;
  isOpen:        boolean;
  setIsOpen:     (v: boolean) => void;
  loading:       boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  const filtered = useMemo(() => {
    if (!searchQuery) return agents;
    const q = searchQuery.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.internalId.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }, [agents, searchQuery]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white
          border border-slate-200 rounded-xl hover:border-slate-300 transition"
      >
        {selectedAgent ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
              rounded-xl flex items-center justify-center text-white font-bold">
              {selectedAgent.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">{selectedAgent.name}</p>
              <p className="text-xs text-slate-500">
                {selectedAgent.internalId} • {selectedAgent.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">
            {loading ? "Loading agents..." : "Select an agent..."}
          </span>
        )}
        {loading
          ? <Loader2 size={20} className="text-slate-400 animate-spin" />
          : <ChevronsUpDown size={20} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white
              rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200
                    rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filtered.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => { onSelect(agent); setIsOpen(false); setSearchQuery(""); }}
                  className={`w-full flex items-center justify-between p-3
                    hover:bg-slate-50 transition
                    ${selectedAgent?.id === agent.id ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
                      rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-500">
                        {agent.internalId} • Balance: SAR {agent.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${agent.status === "active"    ? "bg-emerald-100 text-emerald-700" :
                      agent.status === "suspended" ? "bg-rose-100    text-rose-700"    :
                      "bg-slate-100 text-slate-700"}`}>
                    {agent.status}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Operation Type Card ──────────────────────────────────────────────────────
const OperationTypeCard = ({
  operation, isSelected, onClick,
}: {
  operation:  OperationType;
  isSelected: boolean;
  onClick:    () => void;
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300
      ${isSelected
        ? `${operation.borderColor} ${operation.bgColor} shadow-lg`
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}
  >
    <div className="absolute top-3 right-3">
      {operation.type === "credit" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100
          text-emerald-700 text-xs font-semibold rounded-full">
          <ArrowUpRight size={10} /> Credit
        </span>
      )}
      {operation.type === "debit" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100
          text-rose-700 text-xs font-semibold rounded-full">
          <ArrowDownRight size={10} /> Debit
        </span>
      )}
      {operation.type === "neutral" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100
          text-slate-700 text-xs font-semibold rounded-full">
          <ArrowLeftRight size={10} /> Adjust
        </span>
      )}
    </div>
    <div className={`w-14 h-14 ${operation.bgColor} rounded-xl flex items-center
      justify-center ${operation.color} mb-4`}>
      {operation.icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">{operation.name}</h3>
    <p className="text-sm text-slate-500">{operation.description}</p>
    {isSelected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute bottom-3 right-3 w-6 h-6 bg-gradient-to-r
          ${operation.gradient} rounded-full flex items-center justify-center`}
      >
        <Check size={14} className="text-white" />
      </motion.div>
    )}
  </motion.div>
);

// ─── Agent Info Card ──────────────────────────────────────────────────────────
const AgentInfoCard = ({ agent }: { agent: Agent }) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 0 }).format(n);
  const available = agent.creditLimit - agent.usedLimit;
  const pct       = agent.creditLimit > 0 ? (agent.usedLimit / agent.creditLimit) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center
              text-2xl font-bold backdrop-blur-sm">
              {agent.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{agent.name}</h3>
              <p className="text-blue-100 text-sm">{agent.company}</p>
              <p className="text-blue-200 text-xs mt-1">{agent.internalId}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold
            ${agent.status === "active"    ? "bg-emerald-400 text-emerald-900" :
              agent.status === "suspended" ? "bg-rose-400    text-rose-900"    :
              "bg-slate-400 text-slate-900"}`}>
            {agent.status.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Wallet size={18} />
              <span className="text-sm font-medium">Balance</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{fmt(agent.balance)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Ticket size={18} />
              <span className="text-sm font-medium">Bookings</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{agent.totalBookings}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Credit Limit Usage</span>
            <span className="text-sm font-bold text-slate-800">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full
                ${pct > 80 ? "bg-rose-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Used: {fmt(agent.usedLimit)}</span>
            <span className="text-slate-500">Limit: {fmt(agent.creditLimit)}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between">
            <span className="text-sm text-slate-600">Available</span>
            <span className="text-lg font-bold text-emerald-600">{fmt(available)}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail size={14} className="text-slate-400" />{agent.email}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Phone size={14} className="text-slate-400" />{agent.phone}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            Joined:{" "}
            {agent.joinedDate
              ? new Date(agent.joinedDate).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                })
              : "—"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Operation Form ───────────────────────────────────────────────────────────
const OperationForm = ({
  selectedAgent, selectedOperation, onSubmit, loading,
}: {
  selectedAgent:     Agent | null;
  selectedOperation: OperationType | null;
  onSubmit:          (formData: Record<string, string>) => void;
  loading:           boolean;
}) => {
  const emptyForm = {
    amount: "", pnr: "", reference: "", description: "",
    passengerName: "", route: "", travelDate: "", newLimit: "",
  };

  const [formData, setFormData] = useState<Record<string, string>>(emptyForm);
  const [copied,   setCopied]   = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: string, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => { setFormData(emptyForm); setFormError(null); };

  useEffect(() => { resetForm(); }, [selectedOperation?.id]); // eslint-disable-line

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !selectedOperation) return;
    const error = validateOperationForm(selectedOperation.id, formData, selectedAgent);
    if (error) { setFormError(error); return; }
    setFormError(null);
    onSubmit(formData);
  };

  if (!selectedOperation || !selectedAgent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center
          justify-center mx-auto mb-4">
          <Settings size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Select Agent & Operation
        </h3>
        <p className="text-slate-500 text-sm">
          Choose an agent and operation type to continue
        </p>
      </div>
    );
  }

  const inp = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white";

  const renderFields = () => {
    switch (selectedOperation.id) {
      case "manual_booking":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Passenger Name *
                </label>
                <input type="text" value={formData.passengerName}
                  onChange={(e) => set("passengerName", e.target.value)}
                  placeholder="MR JOHN DOE" className={`${inp} uppercase`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">PNR *</label>
                <input type="text" value={formData.pnr}
                  onChange={(e) => set("pnr", e.target.value.toUpperCase())}
                  placeholder="ABC123" className={`${inp} font-mono uppercase`} maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Route *</label>
                <input type="text" value={formData.route}
                  onChange={(e) => set("route", e.target.value.toUpperCase())}
                  placeholder="RUH - DAC" className={`${inp} uppercase`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Travel Date *</label>
                <input type="date" value={formData.travelDate}
                  onChange={(e) => set("travelDate", e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (SAR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">SAR</span>
                <input type="number" value={formData.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="0.00" className={`${inp} pl-14 text-lg font-semibold`} min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Additional notes..." rows={2} className={`${inp} resize-none`} />
            </div>
          </>
        );

      case "refund":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">PNR *</label>
                <input type="text" value={formData.pnr}
                  onChange={(e) => set("pnr", e.target.value.toUpperCase())}
                  placeholder="ABC123" className={`${inp} font-mono uppercase`} maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Refund Amount (SAR) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-medium">SAR</span>
                  <input type="number" value={formData.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    placeholder="0.00" className={`${inp} pl-14 text-lg font-semibold`} min="0" step="0.01" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference</label>
              <input type="text" value={formData.reference}
                onChange={(e) => set("reference", e.target.value)}
                placeholder="REF-123456" className={`${inp} font-mono`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Refund Reason *</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Enter refund reason..." rows={3} className={`${inp} resize-none`} />
            </div>
          </>
        );

      case "date_change":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">PNR *</label>
                <input type="text" value={formData.pnr}
                  onChange={(e) => set("pnr", e.target.value.toUpperCase())}
                  placeholder="ABC123" className={`${inp} font-mono uppercase`} maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Travel Date *</label>
                <input type="date" value={formData.travelDate}
                  onChange={(e) => set("travelDate", e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Charge/Refund Amount (SAR) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">SAR</span>
                <input type="number" value={formData.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="0.00" className={`${inp} pl-14 text-lg font-semibold`} step="0.01" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Negative value for refund (e.g., -500)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Additional notes..." rows={2} className={`${inp} resize-none`} />
            </div>
          </>
        );

      case "add_credit":
        return (
          <>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldPlus size={20} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-800">Emergency Credit Addition</p>
                  <p className="text-xs text-teal-600 mt-1">
                    Current limit: <strong>SAR {selectedAgent.creditLimit.toLocaleString()}</strong>
                    {" "}• Amount will be added to current limit.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Credit Amount to Add (SAR) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600 font-bold">+SAR</span>
                <input type="number" value={formData.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="0" className={`${inp} pl-16 text-2xl font-bold`} min="0" step="1" />
              </div>
              {formData.amount && Number(formData.amount) > 0 && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    New credit limit:{" "}
                    <strong>SAR {(selectedAgent.creditLimit + Number(formData.amount)).toLocaleString()}</strong>
                    {" "}(+{Number(formData.amount).toLocaleString()})
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quick Add</label>
              <div className="grid grid-cols-4 gap-2">
                {[5000, 10000, 15000, 20000, 25000, 50000, 75000, 100000].map((v) => (
                  <button key={v} type="button" onClick={() => set("amount", v.toString())}
                    className={`py-2 px-2 text-sm font-medium rounded-lg border transition
                      ${formData.amount === v.toString()
                        ? "bg-teal-100 border-teal-300 text-teal-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference Number</label>
              <input type="text" value={formData.reference}
                onChange={(e) => set("reference", e.target.value)}
                placeholder="Approval reference..." className={`${inp} font-mono`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason *</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Emergency credit reason..." rows={3} className={`${inp} resize-none`} />
            </div>
          </>
        );

      case "adm":
      case "acm":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">PNR *</label>
                <input type="text" value={formData.pnr}
                  onChange={(e) => set("pnr", e.target.value.toUpperCase())}
                  placeholder="ABC123" className={`${inp} font-mono uppercase`} maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (SAR) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">SAR</span>
                  <input type="number" value={formData.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    placeholder="0.00" className={`${inp} pl-14 text-lg font-semibold`} min="0" step="0.01" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference Number</label>
              <input type="text" value={formData.reference}
                onChange={(e) => set("reference", e.target.value)}
                placeholder={selectedOperation.id === "adm" ? "ADM-123" : "ACM-123"}
                className={`${inp} font-mono`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason/Description *</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Reason..." rows={3} className={`${inp} resize-none`} />
            </div>
          </>
        );

      case "limit_add":
        return (
          <>
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-indigo-600 font-medium">Current Credit Limit</span>
                <span className="text-xl font-bold text-indigo-700">
                  SAR {selectedAgent.creditLimit.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-600 font-medium">Used Limit</span>
                <span className="text-lg font-semibold text-indigo-600">
                  SAR {selectedAgent.usedLimit.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Credit Limit (SAR) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">SAR</span>
                <input type="number" value={formData.newLimit}
                  onChange={(e) => set("newLimit", e.target.value)}
                  placeholder={selectedAgent.creditLimit.toString()}
                  className={`${inp} pl-14 text-2xl font-bold`} min="0" step="1000" />
              </div>
              {formData.newLimit && (
                <p className={`text-sm mt-2 font-medium
                  ${Number(formData.newLimit) > selectedAgent.creditLimit ? "text-emerald-600" :
                    Number(formData.newLimit) < selectedAgent.creditLimit ? "text-rose-600" :
                    "text-slate-500"}`}>
                  {Number(formData.newLimit) > selectedAgent.creditLimit
                    ? `↑ Increase by SAR ${(Number(formData.newLimit) - selectedAgent.creditLimit).toLocaleString()}`
                    : Number(formData.newLimit) < selectedAgent.creditLimit
                    ? `↓ Decrease by SAR ${(selectedAgent.creditLimit - Number(formData.newLimit)).toLocaleString()}`
                    : "No change"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Change *</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Reason for limit adjustment..." rows={3} className={`${inp} resize-none`} />
            </div>
          </>
        );

      case "amount_deduct":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (SAR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-medium">-SAR</span>
                <input type="number" value={formData.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="0.00" className={`${inp} pl-16 text-2xl font-bold`} min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference Number</label>
              <input type="text" value={formData.reference}
                onChange={(e) => set("reference", e.target.value)}
                placeholder="TXN-123456" className={`${inp} font-mono`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
              <textarea value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Reason for deduction..." rows={3} className={`${inp} resize-none`} />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={selectedOperation.id}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${selectedOperation.gradient} p-5 text-white`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center
            justify-center backdrop-blur-sm">
            {selectedOperation.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold">{selectedOperation.name}</h3>
            <p className="text-white/80 text-sm">{selectedOperation.description}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Agent Summary */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
            rounded-lg flex items-center justify-center text-white font-bold">
            {selectedAgent.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">{selectedAgent.name}</p>
            <p className="text-xs text-slate-500">
              {selectedAgent.internalId} • Balance: SAR {selectedAgent.balance.toLocaleString()}
              {" "}• Limit: SAR {selectedAgent.creditLimit.toLocaleString()}
            </p>
          </div>
          <button type="button" onClick={() => handleCopy(selectedAgent.id)}
            className="p-2 hover:bg-slate-200 rounded-lg transition" title="Copy Agent ID">
            {copied
              ? <Check size={16} className="text-emerald-500" />
              : <Copy  size={16} className="text-slate-400"   />}
          </button>
        </div>

        {/* Validation Error */}
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-50 border border-rose-200 rounded-xl p-4
                flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800 flex-1">{formError}</p>
              <button type="button" onClick={() => setFormError(null)}
                className="text-rose-400 hover:text-rose-600">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {renderFields()}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={resetForm}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold
              hover:bg-slate-200 transition flex items-center justify-center gap-2">
            <RotateCcw size={18} /> Reset
          </button>
          <button type="submit" disabled={loading}
            className={`flex-1 py-3 bg-gradient-to-r ${selectedOperation.gradient}
              text-white rounded-xl font-semibold hover:opacity-90 transition
              disabled:opacity-50 flex items-center justify-center gap-2`}>
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
              : <><Send    size={18} /> Submit</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ConfirmationModal = ({
  isOpen, onClose, onConfirm, formData, operation, agent, loading,
}: {
  isOpen:     boolean;
  onClose:    () => void;
  onConfirm:  () => void;
  formData:   Record<string, string> | null;
  operation:  OperationType | null;
  agent:      Agent | null;
  loading:    boolean;
}) => {
  if (!isOpen || !operation || !agent || !formData) return null;

  const rows: { label: string; value: string; highlight?: string }[] = [
    { label: "Operation", value: operation.name },
    { label: "Agent",     value: `${agent.name} (${agent.internalId})` },
  ];

  if (operation.id === "add_credit" && formData.amount) {
    rows.push({ label: "Credit to Add",   value: `+SAR ${Number(formData.amount).toLocaleString()}`,  highlight: "text-emerald-600" });
    rows.push({ label: "New Credit Limit", value: `SAR ${(agent.creditLimit + Number(formData.amount)).toLocaleString()}`, highlight: "text-teal-600" });
  } else if (operation.id === "limit_add" && formData.newLimit) {
    rows.push({ label: "New Limit", value: `SAR ${Number(formData.newLimit).toLocaleString()}`, highlight: "text-indigo-600" });
  } else if (formData.amount) {
    rows.push({
      label: "Amount",
      value: `${operation.type === "credit" ? "+" : operation.type === "debit" ? "-" : ""}SAR ${Number(formData.amount).toLocaleString()}`,
      highlight:
        operation.type === "credit" ? "text-emerald-600" :
        operation.type === "debit"  ? "text-rose-600"    : undefined,
    });
  }

  if (formData.pnr)           rows.push({ label: "PNR",          value: formData.pnr           });
  if (formData.passengerName) rows.push({ label: "Passenger",    value: formData.passengerName });
  if (formData.route)         rows.push({ label: "Route",        value: formData.route         });
  if (formData.travelDate)    rows.push({ label: "Travel Date",  value: formData.travelDate    });
  if (formData.reference)     rows.push({ label: "Reference",    value: formData.reference     });

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${operation.gradient} p-6 text-white text-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center
            justify-center mx-auto mb-3 backdrop-blur-sm">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold">Confirm Operation</h2>
          <p className="text-white/80 text-sm mt-1">Please review the details below</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">{row.label}</span>
                <span className={`font-semibold ${row.highlight || "text-slate-800"}`}>
                  {row.value}
                </span>
              </div>
            ))}
            {formData.description && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 text-sm">Description:</span>
                <p className="text-slate-700 mt-1 text-sm">{formData.description}</p>
              </div>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4
            flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This action cannot be undone. Please verify all details.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center
          gap-3 bg-slate-50">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-medium
              hover:bg-slate-300 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 bg-gradient-to-r ${operation.gradient}
              text-white rounded-xl font-medium hover:opacity-90 transition
              disabled:opacity-50 flex items-center justify-center gap-2`}>
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
              : <><CheckCircle2 size={16} /> Confirm</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Recent Operations ────────────────────────────────────────────────────────
const RecentOperations = ({
  operations, loading,
}: {
  operations: Operation[];
  loading:    boolean;
}) => {
  const getOpType = (type: string) => operationTypes.find((op) => op.id === type);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <History size={18} className="text-slate-400" /> Recent Operations
        </h3>
        <span className="text-xs text-slate-400">{operations.length} records</span>
      </div>
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading operations...</p>
          </div>
        ) : operations.length > 0 ? (
          operations.map((op) => {
            const opType = getOpType(op.type);
            const sc     = getStatusConfig(op.status);
            return (
              <div key={op.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 shrink-0 ${opType?.bgColor || "bg-slate-50"}
                      rounded-lg flex items-center justify-center ${opType?.color || "text-slate-500"}`}>
                      {opType?.icon || <Settings size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">
                          {opType?.name || op.type}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5
                          rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          {sc.icon} {op.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{op.agentName}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{op.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm
                      ${opType?.type === "credit" ? "text-emerald-600" :
                        opType?.type === "debit"  ? "text-rose-600"    :
                        "text-slate-800"}`}>
                      {opType?.type === "credit" ? "+" :
                       opType?.type === "debit"  ? "-" : ""}
                      SAR {op.amount?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {op.createdAt
                        ? new Date(op.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <History size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No operations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManualOperationsPage() {
  const { agents, loading: agentsLoading, refetch: refetchAgents } = useAgentList();
  const { operations, stats, loading: opsLoading, submitLoading, fetchOperations, submitOperation } = useOperations();

  const [selectedAgent,        setSelectedAgent]        = useState<Agent | null>(null);
  const [selectedOperation,    setSelectedOperation]    = useState<OperationType | null>(null);
  const [isAgentDropdownOpen,  setIsAgentDropdownOpen]  = useState(false);
  const [toasts,               setToasts]               = useState<Toast[]>([]);
  const [confirmationFormData, setConfirmationFormData] = useState<Record<string, string> | null>(null);
  const [showConfirmation,     setShowConfirmation]     = useState(false);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleFormSubmit = (formData: Record<string, string>) => {
    setConfirmationFormData(formData);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!selectedAgent || !selectedOperation || !confirmationFormData) return;
    try {
      const payload = buildPayload(selectedOperation.id, confirmationFormData, selectedAgent);
      await submitOperation(payload);
      setShowConfirmation(false);
      setConfirmationFormData(null);
      addToast(`${selectedOperation.name} completed successfully!`, "success");
      refetchAgents();
    } catch (err: any) {
      addToast(err.message || "Operation failed. Please try again.", "error");
      setShowConfirmation(false);
    }
  };

  useEffect(() => {
    if (selectedAgent && agents.length > 0) {
      const updated = agents.find((a) => a.id === selectedAgent.id);
      if (updated) setSelectedAgent(updated);
    }
  }, [agents]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30
      to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800
              flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600
                rounded-xl flex items-center justify-center">
                <Settings size={22} className="text-white" />
              </div>
              Manual Operations
            </h1>
            <p className="text-slate-500 mt-1">
              Manage agent accounts, bookings, refunds, and adjustments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchOperations(); refetchAgents(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border
                border-slate-200 rounded-xl text-sm font-medium text-slate-700
                hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCw size={16} className={opsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border
              border-slate-200 rounded-xl text-sm font-medium text-slate-700
              hover:bg-slate-50 transition shadow-sm">
              <Download  size={16} /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border
              border-slate-200 rounded-xl text-sm font-medium text-slate-700
              hover:bg-slate-50 transition shadow-sm">
              <HelpCircle size={16} /> Help
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Today's Operations", value: stats.todayOperations,                     icon: <Zap          size={24} className="text-blue-600"    />, border: "border-blue-100",    bg: "bg-blue-50"    },
            { label: "Total Credits",       value: `SAR ${stats.totalCredit.toLocaleString()}`, icon: <ArrowUpRight  size={24} className="text-emerald-600" />, border: "border-emerald-100", bg: "bg-emerald-50", text: "text-emerald-600" },
            { label: "Total Debits",        value: `SAR ${stats.totalDebit.toLocaleString()}`,  icon: <ArrowDownRight size={24} className="text-rose-600"  />, border: "border-rose-100",    bg: "bg-rose-50",    text: "text-rose-600"   },
            { label: "Pending",             value: stats.pendingCount,                           icon: <Clock         size={24} className="text-amber-600"  />, border: "border-amber-100",  bg: "bg-amber-50",   text: "text-amber-600"  },
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.text || "text-slate-800"}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Agent Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Select Agent</h2>
              <p className="text-sm text-slate-500">Choose the agent for this operation</p>
            </div>
            {selectedAgent && (
              <button
                onClick={() => setSelectedAgent(null)}
                className="ml-auto text-slate-400 hover:text-slate-600 p-1
                  rounded-lg hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <AgentSearchDropdown
            agents={agents}
            selectedAgent={selectedAgent}
            onSelect={setSelectedAgent}
            isOpen={isAgentDropdownOpen}
            setIsOpen={setIsAgentDropdownOpen}
            loading={agentsLoading}
          />
        </motion.div>

        {/* Operation Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Select Operation Type</h2>
            <span className="text-sm text-slate-400">{operationTypes.length} available</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operationTypes.map((op) => (
              <OperationTypeCard
                key={op.id}
                operation={op}
                isSelected={selectedOperation?.id === op.id}
                onClick={() =>
                  setSelectedOperation((prev) => prev?.id === op.id ? null : op)
                }
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <OperationForm
              selectedAgent={selectedAgent}
              selectedOperation={selectedOperation}
              onSubmit={handleFormSubmit}
              loading={submitLoading}
            />

            {selectedOperation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl
                  p-5 border border-blue-100"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center
                    justify-center shrink-0">
                    <Sparkles size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">
                      Tips for {selectedOperation.name}
                    </h3>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      {selectedOperation.id === "add_credit" && (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            Use for emergency credit limit increases
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            Amount will be added to current credit limit
                          </li>
                        </>
                      )}
                      {selectedOperation.id === "adm" && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          ADM deducts from agent balance — include airline reference
                        </li>
                      )}
                      {selectedOperation.id === "acm" && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          ACM credits to agent balance — include airline reference
                        </li>
                      )}
                      {selectedOperation.id === "limit_add" && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          Set exact new limit — cannot be less than used amount
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        Double-check all information before submission
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        Include clear description for audit trail
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {selectedAgent && <AgentInfoCard agent={selectedAgent} />}
            <RecentOperations operations={operations} loading={opsLoading} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationModal
            isOpen={showConfirmation}
            onClose={() => { setShowConfirmation(false); setConfirmationFormData(null); }}
            onConfirm={handleConfirm}
            formData={confirmationFormData}
            operation={selectedOperation}
            agent={selectedAgent}
            loading={submitLoading}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}