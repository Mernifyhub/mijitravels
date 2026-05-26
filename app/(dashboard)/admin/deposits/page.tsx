"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, Filter, Download, RefreshCw, Plus, Eye,
  CheckCircle, XCircle, X, ChevronLeft, ChevronRight,
  DollarSign, Clock, Building2, CreditCard, Smartphone,
  Banknote, FileText, User, MessageSquare, Shield,
  Info, Copy, ChevronDown, ChevronUp, Wallet,
  BadgeCheck, Ban, Loader2, History, Image,
  ZoomIn, ZoomOut, RotateCw, ExternalLink, Upload,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ==================== TYPES ====================

interface DepositRequest {
  id: string;
  requestId: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  attachment?: string | null;
  createdAt: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectionNote?: string;
  notes?: string;
}

interface AgentOption {
  id: string;
  internalId?: string;
  agentId?: string;
  agentName?: string;
  name?: string;
  email?: string;
}

interface DepositStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  todayRequests: number;
}

interface SortConfig {
  key: keyof DepositRequest | null;
  direction: "asc" | "desc";
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

// ==================== HELPERS ====================

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
    : "http://localhost:3001";

const getAttachmentUrl = (attachment?: string | null): string => {
  if (!attachment) return "";
  if (attachment.startsWith("http")) return attachment;
  const n = attachment.replace(/\\/g, "/");
  if (/^[A-Z]:\//.test(n)) return "";
  if (n.startsWith("/")) return `${BACKEND_URL}${n}`;
  return `${BACKEND_URL}/${n}`;
};

const formatCurrency = (amount: number, currency = "SAR") =>
  new Intl.NumberFormat("en-SA", {
    style: "currency", currency, minimumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "-";

const formatTime = (d: string) =>
  d ? new Date(d).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  }) : "";

const formatDateTime = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "-";

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState<T>(value);
  useEffect(() => {
    const h = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return dv;
}

// ==================== BADGES ====================

const MethodBadge = ({ method }: { method: string }) => {
  const map: Record<string, { style: string; label: string; icon: React.ReactNode }> = {
    MOBILE_BANKING: { style: "bg-pink-100 text-pink-700 border-pink-200",     label: "Mobile Banking", icon: <Smartphone size={13} /> },
    BANK_TRANSFER:  { style: "bg-blue-100 text-blue-700 border-blue-200",     label: "Bank Transfer",  icon: <Building2 size={13} /> },
    CASH:           { style: "bg-green-100 text-green-700 border-green-200",  label: "Cash",           icon: <Banknote size={13} /> },
    CARD:           { style: "bg-purple-100 text-purple-700 border-purple-200", label: "Card",         icon: <CreditCard size={13} /> },
    MANUAL:         { style: "bg-slate-100 text-slate-700 border-slate-200",  label: "Manual",         icon: <FileText size={13} /> },
  };
  const cfg = map[method?.toUpperCase()] || {
    style: "bg-gray-100 text-gray-700 border-gray-200", label: method, icon: <CreditCard size={13} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.style}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { style: string; label: string; icon: React.ReactNode }> = {
    PENDING:  { style: "bg-amber-100 text-amber-700 border-amber-200",       label: "Pending",  icon: <Clock size={13} /> },
    SUCCESS:  { style: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved", icon: <CheckCircle size={13} /> },
    FAILED:   { style: "bg-red-100 text-red-700 border-red-200",             label: "Rejected", icon: <XCircle size={13} /> },
    REFUNDED: { style: "bg-blue-100 text-blue-700 border-blue-200",          label: "Refunded", icon: <History size={13} /> },
  };
  const cfg = map[status] || map["PENDING"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.style}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const SortIcon = ({ column, sortConfig }: { column: string; sortConfig: SortConfig }) => {
  if (sortConfig.key !== column)
    return <div className="flex flex-col opacity-40"><ChevronUp className="w-3 h-3 -mb-1" /><ChevronDown className="w-3 h-3" /></div>;
  return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
};

// ==================== RECEIPT MODAL ====================

const ReceiptModal = ({ url, reference, amount, date, onClose }: {
  url: string; reference: string; amount: number; date: string; onClose: () => void;
}) => {
  const [zoom, setZoom]         = useState(1);
  const [rotation, setRotation] = useState(0);
  const isPdf = url.toLowerCase().includes(".pdf");
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Image size={18} className="text-purple-600" /></div>
            <div>
              <p className="font-bold text-gray-800">Payment Receipt</p>
              <p className="text-xs text-gray-500 font-mono">{reference}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isPdf && (
              <>
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-2 hover:bg-gray-200 rounded-lg transition"><ZoomOut size={16} className="text-gray-600" /></button>
                <span className="text-xs font-medium text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-2 hover:bg-gray-200 rounded-lg transition"><ZoomIn size={16} className="text-gray-600" /></button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-2 hover:bg-gray-200 rounded-lg transition"><RotateCw size={16} className="text-gray-600" /></button>
              </>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 rounded-lg transition"><ExternalLink size={16} className="text-gray-600" /></a>
            <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-lg transition ml-1"><X size={18} className="text-red-500" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-4 min-h-0 flex items-center justify-center">
          {isPdf
            ? <iframe src={url} className="w-full h-full min-h-96 rounded-xl" title="Receipt PDF" />
            : <img src={url} alt="Payment Receipt" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: "transform 0.2s ease", maxWidth: "100%", objectFit: "contain" }} className="rounded-xl shadow-lg" onError={(e) => { e.currentTarget.src = "/placeholder-receipt.png"; }} />
          }
        </div>
        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-bold text-[#021f3b]">{formatCurrency(amount)}</span>
            <span className="text-gray-300">|</span>
            <span>{formatDateTime(date)}</span>
          </div>
          <a href={url} download className="flex items-center gap-2 px-4 py-2 bg-[#021f3b] text-white rounded-xl text-sm font-medium hover:bg-[#0a3a6b] transition">
            <Download size={14} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

// ==================== PAYMENT METHODS ====================

const PAYMENT_METHODS = [
  { id: "BANK_TRANSFER",  label: "Bank Transfer",  icon: <Building2 size={18} />,  color: "bg-blue-500",   desc: "Direct bank transfer" },
  { id: "CARD",           label: "Card",           icon: <CreditCard size={18} />, color: "bg-purple-500", desc: "Visa / Mastercard"    },
  { id: "MOBILE_BANKING", label: "Mobile Banking", icon: <Smartphone size={18} />, color: "bg-pink-500",   desc: "bKash, Nagad"         },
  { id: "CASH",           label: "Cash",           icon: <Banknote size={18} />,   color: "bg-green-500",  desc: "Visit our office"     },
  { id: "MANUAL",         label: "Manual",         icon: <FileText size={18} />,   color: "bg-slate-500",  desc: "Admin entry"          },
];

// ==================== MANUAL DEPOSIT MODAL ====================

const ManualDepositModal = ({
  onClose, onSuccess, showToast,
}: {
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}) => {
  const [agents, setAgents]             = useState<AgentOption[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [amount, setAmount]             = useState("");
  const [method, setMethod]             = useState("BANK_TRANSFER");
  const [transactionId, setTransactionId] = useState("");
  const [reference, setReference]       = useState("");
  const [notes, setNotes]               = useState("");
  const [receiptFile, setReceiptFile]   = useState<File | null>(null);
  const [autoApprove, setAutoApprove]   = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      setAgentLoading(true);
      try {
        const data = await apiClient("/admin/agents?limit=500");
        let list: AgentOption[] = [];
        if (Array.isArray(data))              list = data;
        else if (Array.isArray(data?.data))   list = data.data;
        else if (Array.isArray(data?.agents)) list = data.agents;
        else if (Array.isArray(data?.users))  list = data.users;
        setAgents(list);
      } catch { setAgents([]); } finally { setAgentLoading(false); }
    };
    load();
  }, []);

  const getAgentLabel = (a: AgentOption) => {
    const code = a.agentId || "";
    const name = a.agentName || a.name || a.email || a.id;
    return code ? `${code} — ${name}` : name;
  };

  const getAgentValue = (a: AgentOption) => a.internalId || a.id;

  const handleSubmit = async () => {
    if (!selectedAgent) { showToast("Please select an agent", "error"); return; }
    if (!amount || Number(amount) <= 0) { showToast("Enter a valid amount", "error"); return; }

    setSaving(true);
    try {
      const result = await apiClient("/admin/deposits/manual", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedAgent,
          amount: Number(amount),
          currency: "SAR",
          method,
          transactionId: transactionId || null,
          reference: reference || null,
          notes: notes || null,
          status: autoApprove ? "SUCCESS" : "PENDING",
          isManual: true,
        }),
      });

      if (receiptFile && result?.deposit?.id) {
        const formData = new FormData();
        formData.append("attachment", receiptFile);
        formData.append("depositId", result.deposit.id);
        await apiClient(`/admin/deposits/${result.deposit.id}/attachment`, {
          method: "POST",
          body: formData,
        });
      }

      showToast(
        autoApprove
          ? `${formatCurrency(Number(amount))} created & approved!`
          : `${formatCurrency(Number(amount))} created as Pending`,
        "success"
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err?.message || "Failed to create deposit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
    >
      {/* Header — agent page এর মতো */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 rounded-xl">
            <Plus size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base">Manual Deposit</h2>
            <p className="text-blue-200 text-xs mt-0.5">Add funds directly to agent account</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition">
          <X size={20} />
        </button>
      </div>

      {/* Form — agent page style */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Agent Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Agent <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={agentLoading}
            className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#021f3b] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 disabled:bg-gray-50 transition"
          >
            <option value="">{agentLoading ? "Loading agents..." : "Select Agent"}</option>
            {agents.map((a) => (
              <option key={getAgentValue(a)} value={getAgentValue(a)}>
                {getAgentLabel(a)}
              </option>
            ))}
          </select>
          {!agentLoading && agents.length === 0 && (
            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
              <Info size={11} /> No agents loaded
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (SAR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">SAR</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-14 pr-4 py-3.5 border-2 border-gray-100 focus:border-[#021f3b] rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 transition"
            />
          </div>
        </div>

        {/* Payment Method — agent page card style */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  method === m.id
                    ? "border-[#021f3b] bg-[#021f3b]/5 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-gray-50"
                }`}
              >
                <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white mb-2.5 shadow-sm`}>
                  {m.icon}
                </div>
                <p className={`font-bold text-sm ${method === m.id ? "text-[#021f3b]" : "text-gray-800"}`}>
                  {m.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction ID + Reference */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN-12345"
              className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#021f3b] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 transition font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. REF-001"
              className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#021f3b] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 transition"
            />
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Receipt / Attachment
            <span className="ml-1 text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          {receiptFile ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-100 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Image size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{receiptFile.name}</p>
                <p className="text-xs text-gray-400">{(receiptFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={() => setReceiptFile(null)} className="p-1.5 hover:bg-gray-200 rounded-lg transition">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition">
                  <Upload size={20} className="text-gray-400 group-hover:text-blue-500 transition" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP, PDF — max 5MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setReceiptFile(f); }}
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
            <span className="ml-1 text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes..."
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-100 focus:border-[#021f3b] rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 transition"
          />
        </div>

        {/* Auto Approve Toggle */}
        <div className="flex items-center justify-between bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Auto Approve</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {autoApprove ? "Balance updated immediately" : "Created as Pending"}
            </p>
          </div>
          <button type="button" onClick={() => setAutoApprove(!autoApprove)} className="transition hover:scale-105">
            {autoApprove ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                <CheckCircle size={13} /> Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold">
                <Clock size={13} /> Pending
              </span>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Manual deposits are recorded by admin directly. If auto-approved, agent balance will update immediately.
          </p>
        </div>
      </div>

      {/* Footer — agent page এর মতো */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition font-semibold text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !selectedAgent || !amount}
          className="flex-1 py-3 bg-[#021f3b] text-white rounded-xl font-bold hover:bg-[#0a3a6b] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md active:scale-[0.98]"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : (
            <><Plus size={16} /> {autoApprove ? "Create & Approve" : "Create Pending"}</>
          )}
        </button>
      </div>
    </motion.div>
  </div>
);
};

// ==================== MAIN ====================

export default function AccountManagementPage() {
  const [data, setData]               = useState<DepositRequest[]>([]);
  const [stats, setStats]             = useState<DepositStats>({
    total: 0, pending: 0, approved: 0, rejected: 0,
    totalAmount: 0, pendingAmount: 0, approvedAmount: 0, todayRequests: 0,
  });
  const [isLoading, setIsLoading]     = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm]   = useState("");
  const debouncedSearch               = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab]     = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig]   = useState<SortConfig>({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [showManualModal, setShowManualModal]   = useState(false);
  const [showDetailModal, setShowDetailModal]   = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRequest, setSelectedRequest]   = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason]         = useState("");
  const [toast, setToast]                       = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastState["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied!", "info");
  };

  const fetchDeposits = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const result = await apiClient("/admin/deposits");
      setData(result.deposits || []);
      setStats(result.stats || {
        total: 0, pending: 0, approved: 0, rejected: 0,
        totalAmount: 0, pendingAmount: 0, approvedAmount: 0, todayRequests: 0,
      });
      if (isRefresh) showToast("Data refreshed successfully", "success");
    } catch (err: any) {
      if (String(err?.message).includes("401")) { window.location.href = "/login"; return; }
      showToast("Failed to load deposits", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const result = await apiClient(`/admin/deposits/${selectedRequest.id}/approve`, { method: "POST" });
      setData((prev) => prev.map((d) => d.id === selectedRequest.id ? { ...d, status: "SUCCESS", approvedAt: result.deposit?.approvedAt } : d));
      setStats((prev) => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1, pendingAmount: prev.pendingAmount - selectedRequest.amount, approvedAmount: prev.approvedAmount + selectedRequest.amount }));
      showToast(`${formatCurrency(selectedRequest.amount)} approved!`, "success");
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (err: any) {
      showToast(err?.message || "Approval failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await apiClient(`/admin/deposits/${selectedRequest.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionNote: rejectReason }),
      });
      setData((prev) => prev.map((d) => d.id === selectedRequest.id ? { ...d, status: "FAILED", rejectedAt: new Date().toISOString(), rejectionNote: rejectReason } : d));
      setStats((prev) => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1, pendingAmount: prev.pendingAmount - selectedRequest.amount }));
      showToast("Request rejected", "info");
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
    } catch (err: any) {
      showToast(err?.message || "Rejection failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ["Request ID", "Agent", "Amount", "Currency", "Method", "Transaction ID", "Status", "Date"];
    const rows = filteredData.map((d) => [d.requestId, d.agentName, d.amount, d.currency, d.method, d.transactionId || "", d.status, d.createdAt]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deposits-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as CSV", "success");
  };

  const handleSort = (key: keyof DepositRequest) => {
    setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (activeTab === "pending")  result = result.filter((d) => d.status === "PENDING");
    if (activeTab === "approved") result = result.filter((d) => d.status === "SUCCESS");
    if (activeTab === "rejected") result = result.filter((d) => d.status === "FAILED");
    if (filterMethod !== "all")   result = result.filter((d) => d.method === filterMethod);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((d) =>
        d.agentName?.toLowerCase().includes(q) ||
        d.agentId?.toLowerCase().includes(q) ||
        d.transactionId?.toLowerCase().includes(q) ||
        d.requestId?.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const av = a[sortConfig.key!], bv = b[sortConfig.key!];
        if (av == null) return 1; if (bv == null) return -1;
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, activeTab, filterMethod, debouncedSearch, sortConfig]);

  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-blue-500 animate-spin" />
          <p className="text-slate-600 font-medium">Loading deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl ${
          toast.type === "success" ? "bg-emerald-500 text-white" : toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
        }`}>
          {toast.type === "success" && <CheckCircle size={20} />}
          {toast.type === "error" && <XCircle size={20} />}
          {toast.type === "info" && <Info size={20} />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80"><X size={18} /></button>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-6 py-6 mb-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
              <Wallet size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Account Management</h1>
              <p className="text-blue-200 mt-1">
                Agent Deposit Requests •{" "}
                <span className="text-emerald-300">{stats.pending} pending</span> •{" "}
                <span className="text-white/80">{stats.todayRequests} today</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition text-sm font-medium border border-white/20">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={() => fetchDeposits(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition text-sm font-medium border border-white/20 disabled:opacity-50">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#021f3b] rounded-xl hover:bg-blue-50 transition text-sm font-bold shadow-lg"
            >
              <Plus size={16} /> Manual Deposit
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Requests", value: stats.total,                    sub: `+${stats.todayRequests} today`,     icon: <FileText size={22} className="text-white" />,   gradient: "from-blue-500 to-blue-600",      color: "text-gray-800"    },
          { label: "Pending",        value: stats.pending,                  sub: formatCurrency(stats.pendingAmount),  icon: <Clock size={22} className="text-white" />,      gradient: "from-amber-400 to-amber-500",    color: "text-amber-600"   },
          { label: "Approved",       value: stats.approved,                 sub: formatCurrency(stats.approvedAmount), icon: <BadgeCheck size={22} className="text-white" />, gradient: "from-emerald-500 to-emerald-600", color: "text-emerald-600" },
          { label: "Rejected",       value: stats.rejected,                 sub: "Requires review",                    icon: <Ban size={22} className="text-white" />,        gradient: "from-red-500 to-red-600",        color: "text-red-600"     },
          { label: "Total Volume",   value: formatCurrency(stats.totalAmount), sub: `${stats.total} requests`,        icon: <DollarSign size={22} className="text-white" />, gradient: "from-indigo-500 to-purple-600",  color: "text-blue-600"    },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-500 mt-2">{card.sub}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg group-hover:scale-110 transition`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 flex-wrap">
          {[
            { key: "all",      label: `All (${stats.total})`,         active: "bg-[#021f3b] text-white" },
            { key: "pending",  label: `Pending (${stats.pending})`,   active: "bg-amber-500 text-white",   icon: <Clock size={16} /> },
            { key: "approved", label: `Approved (${stats.approved})`, active: "bg-emerald-500 text-white", icon: <CheckCircle size={16} /> },
            { key: "rejected", label: `Rejected (${stats.rejected})`, active: "bg-red-500 text-white",     icon: <XCircle size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${activeTab === tab.key ? tab.active : "text-gray-600 hover:bg-gray-100"}`}
            >
              {(tab as any).icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-lg">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Agent, Request ID, Transaction ID..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition text-sm font-medium ${showFilters || filterMethod !== "all" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                <Filter size={16} /> Filters
                {filterMethod !== "all" && <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">1</span>}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                  <span className="text-sm text-blue-700 font-medium">{selectedItems.length} selected</span>
                  <button onClick={() => setSelectedItems([])}><X size={16} className="text-gray-500" /></button>
                </div>
              )}
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n} rows</option>)}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Payment Method</label>
                <select value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 text-left w-12">
                  <input type="checkbox" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={() => { if (selectedItems.length === paginatedData.length) setSelectedItems([]); else setSelectedItems(paginatedData.map((d) => d.id)); }}
                    className="w-4 h-4 rounded border-white/30 bg-white/10" />
                </th>
                {[{ label: "Request ID", key: "requestId" }, { label: "Agent", key: "agentName" }, { label: "Amount", key: "amount" }].map((col) => (
                  <th key={col.key} className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition" onClick={() => handleSort(col.key as keyof DepositRequest)}>
                    <div className="flex items-center gap-2">{col.label}<SortIcon column={col.key} sortConfig={sortConfig} /></div>
                  </th>
                ))}
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Method</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Transaction ID</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Receipt</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center justify-center gap-2">Date<SortIcon column="createdAt" sortConfig={sortConfig} /></div>
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-gray-100 rounded-full"><FileText size={48} className="text-gray-300" /></div>
                      <p className="text-gray-500 font-semibold text-lg">No requests found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.map((item) => {
                const attachUrl = getAttachmentUrl(item.attachment);
                return (
                  <tr key={item.id} className={`hover:bg-blue-50/50 transition group ${selectedItems.includes(item.id) ? "bg-blue-50" : ""} ${item.status === "PENDING" ? "bg-amber-50/30" : ""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedItems.includes(item.id)}
                        onChange={(e) => { if (e.target.checked) setSelectedItems([...selectedItems, item.id]); else setSelectedItems(selectedItems.filter((id) => id !== item.id)); }}
                        className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-semibold text-[#021f3b] bg-blue-50 px-2 py-1 rounded">{item.requestId || item.id?.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {item.agentName?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.agentName}</p>
                          <p className="text-xs text-gray-500">{item.agentId}{item.agentPhone ? ` • ${item.agentPhone}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(item.amount, item.currency)}</p>
                    </td>
                    <td className="px-4 py-4 text-center"><MethodBadge method={item.method} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-700 truncate max-w-[120px]">{item.transactionId || "-"}</span>
                        {item.transactionId && (
                          <button onClick={() => copyToClipboard(item.transactionId)} className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition"><Copy size={14} /></button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {attachUrl ? (
                        <button onClick={() => { setSelectedRequest(item); setShowReceiptModal(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-xs font-semibold transition border border-purple-200">
                          <Image size={13} /> View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="text-sm font-medium text-gray-800">{formatDate(item.createdAt)}</p>
                      <p className="text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedRequest(item); setShowDetailModal(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="View"><Eye size={18} /></button>
                        {item.status === "PENDING" && (
                          <>
                            <button onClick={() => { setSelectedRequest(item); setShowApproveModal(true); }} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition" title="Approve"><CheckCircle size={18} /></button>
                            <button onClick={() => { setSelectedRequest(item); setShowRejectModal(true); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Reject"><XCircle size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{" "}
              <span className="font-semibold text-gray-700">{filteredData.length}</span> requests
            </p>
            <div className="flex items-center gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) p = i + 1;
                else if (currentPage <= 3) p = i + 1;
                else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                else p = currentPage - 2 + i;
                return (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`w-10 h-10 rounded-lg font-medium text-sm transition ${currentPage === p ? "bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white shadow-lg" : "hover:bg-white border border-gray-200 text-gray-600"}`}>{p}</button>
                );
              })}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── MANUAL DEPOSIT MODAL ── */}
      <AnimatePresence>
        {showManualModal && (
          <ManualDepositModal
            onClose={() => setShowManualModal(false)}
            onSuccess={() => fetchDeposits()}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* ── RECEIPT MODAL ── */}
      {showReceiptModal && selectedRequest && getAttachmentUrl(selectedRequest.attachment) && (
        <ReceiptModal
          url={getAttachmentUrl(selectedRequest.attachment)}
          reference={selectedRequest.requestId || selectedRequest.reference || selectedRequest.id}
          amount={selectedRequest.amount}
          date={selectedRequest.createdAt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] p-6 text-white sticky top-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Deposit Request Details</h2>
                    <p className="text-blue-200 text-sm">{selectedRequest.requestId || selectedRequest.id}</p>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={24} /></button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className={`p-4 rounded-xl flex items-center justify-between ${selectedRequest.status === "PENDING" ? "bg-amber-50 border border-amber-200" : selectedRequest.status === "SUCCESS" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-center gap-3">
                    {selectedRequest.status === "PENDING" && <Clock className="text-amber-600" size={24} />}
                    {selectedRequest.status === "SUCCESS" && <CheckCircle className="text-emerald-600" size={24} />}
                    {selectedRequest.status === "FAILED" && <XCircle className="text-red-600" size={24} />}
                    <div>
                      <p className="font-semibold">{selectedRequest.status}</p>
                      {selectedRequest.approvedAt && <p className="text-xs text-gray-500">Approved {formatDateTime(selectedRequest.approvedAt)}</p>}
                      {selectedRequest.rejectedAt && <p className="text-xs text-gray-500">Rejected {formatDateTime(selectedRequest.rejectedAt)}</p>}
                    </div>
                  </div>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User size={18} className="text-blue-600" /> Agent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Agent ID", value: selectedRequest.agentId },
                      { label: "Agent Name", value: selectedRequest.agentName },
                      ...(selectedRequest.agentPhone ? [{ label: "Phone", value: selectedRequest.agentPhone }] : []),
                      ...(selectedRequest.agentEmail ? [{ label: "Email", value: selectedRequest.agentEmail }] : []),
                    ].map((row) => (
                      <div key={row.label}>
                        <p className="text-xs text-gray-500 mb-0.5">{row.label}</p>
                        <p className="font-semibold text-gray-800 text-sm">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-purple-600" /> Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Amount</span>
                      <span className="text-2xl font-bold text-[#021f3b]">{formatCurrency(selectedRequest.amount, selectedRequest.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Method</span>
                      <MethodBadge method={selectedRequest.method} />
                    </div>
                    {selectedRequest.transactionId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transaction ID</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-blue-600">{selectedRequest.transactionId}</span>
                          <button onClick={() => copyToClipboard(selectedRequest.transactionId)} className="p-1 text-gray-400 hover:text-gray-600"><Copy size={14} /></button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Request Date</span>
                      <span className="font-semibold">{formatDateTime(selectedRequest.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {selectedRequest.attachment && getAttachmentUrl(selectedRequest.attachment) && (
                  <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Image size={18} className="text-purple-600" /> Payment Receipt</h3>
                    <div onClick={() => { setShowDetailModal(false); setShowReceiptModal(true); }} className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-purple-200 hover:border-purple-400 transition-all">
                      <img src={getAttachmentUrl(selectedRequest.attachment)} alt="Receipt" className="w-full h-36 object-cover" onError={(e) => { e.currentTarget.src = "/placeholder-receipt.png"; }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-white text-gray-800 px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg"><ZoomIn size={14} /> View Full Receipt</span>
                      </div>
                    </div>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><MessageSquare size={18} className="text-blue-600" /> Notes</h3>
                    <p className="text-gray-700">{selectedRequest.notes}</p>
                  </div>
                )}
                {selectedRequest.rejectionNote && (
                  <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><MessageSquare size={18} className="text-red-600" /> Rejection Reason</h3>
                    <p className="text-gray-700">{selectedRequest.rejectionNote}</p>
                  </div>
                )}
                {selectedRequest.approvedBy && (
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Shield size={18} className="text-gray-600" /> Review Information</h3>
                    <p className="text-xs text-gray-500 mb-0.5">Reviewed By</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.approvedBy}</p>
                  </div>
                )}
              </div>
              {selectedRequest.status === "PENDING" && (
                <div className="bg-gray-50 p-6 flex gap-3 justify-end border-t sticky bottom-0">
                  <button onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition flex items-center gap-2">
                    <XCircle size={18} /> Reject
                  </button>
                  <button onClick={() => { setShowDetailModal(false); setShowApproveModal(true); }} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition flex items-center gap-2">
                    <CheckCircle size={18} /> Approve
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPROVE MODAL ── */}
      <AnimatePresence>
        {showApproveModal && selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-emerald-600" /></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Approve Deposit Request?</h2>
                <p className="text-gray-600 mb-4">
                  Approving <span className="font-bold text-emerald-600">{formatCurrency(selectedRequest.amount, selectedRequest.currency)}</span> for{" "}
                  <span className="font-semibold">{selectedRequest.agentName}</span>
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Method:</span><MethodBadge method={selectedRequest.method} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Transaction ID:</span><span className="font-mono font-semibold">{selectedRequest.transactionId || "—"}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowApproveModal(false)} disabled={actionLoading} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                  <button onClick={confirmApprove} disabled={actionLoading} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {actionLoading ? "Processing..." : "Confirm Approve"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REJECT MODAL ── */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle size={32} className="text-red-600" /></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Reject Deposit Request?</h2>
                <p className="text-gray-600 mb-4 text-center">
                  Rejecting <span className="font-bold text-red-600">{formatCurrency(selectedRequest.amount, selectedRequest.currency)}</span> from{" "}
                  <span className="font-semibold">{selectedRequest.agentName}</span>
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter the reason for rejection..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} disabled={actionLoading} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                  <button onClick={confirmReject} disabled={!rejectReason.trim() || actionLoading} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                    {actionLoading ? "Processing..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}