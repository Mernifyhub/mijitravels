"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wallet, Plus, Clock, CheckCircle, XCircle, Building2,
  Smartphone, Banknote, Search, Download, RefreshCw,
  Calendar, Copy, X, ChevronDown, TrendingUp, Eye,
  DollarSign, Hash, Info, CreditCard, Upload, FileText,
  Image, AlertCircle, CheckCircle2, ZoomIn, ZoomOut,
  RotateCw, ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AgentTopBar from "@/app/components/agent/AgentTopBar";
import { apiClient } from "@/lib/api";

// ==================== TYPES ====================
interface Deposit {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string | null;
  reference?: string | null;
  notes?: string | null;
  attachment?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionNote?: string | null;
  createdAt: string;
}

interface Stats {
  totalDeposits: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ==================== CONSTANTS ====================
const PAYMENT_METHODS = [
  {
    id: "BANK_TRANSFER",
    name: "Bank Transfer",
    icon: Building2,
    color: "bg-blue-500",
    desc: "Direct bank transfer",
  },
  {
    id: "CARD",
    name: "Card Payment",
    icon: CreditCard,
    color: "bg-purple-500",
    desc: "Visa / Mastercard",
  },
  {
    id: "MOBILE_BANKING",
    name: "Mobile Banking",
    icon: Smartphone,
    color: "bg-green-500",
    desc: "STC, bKash, Nagad, Rocket",
  },
  {
    id: "CASH",
    name: "Cash Deposit",
    icon: Banknote,
    color: "bg-orange-500",
    desc: "Visit our office",
  },
];

const BANK_DETAILS = {
  "Bank Name": "Standard Chartered Bank",
  "Account Name": "Air Ticket Agency Ltd",
  "Account Number": "1234567890123",
  "IBAN / Routing": "SA0380000000608010167519",
  "SWIFT Code": "SCBLSARI",
  Branch: "Riyadh Main Branch",
};

// ==================== HELPERS ====================
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
    : "http://localhost:3001";

const getAttachmentUrl = (attachment: string | null | undefined): string => {
  if (!attachment) return "";
  if (attachment.startsWith("http")) return attachment;
  const normalized = attachment.replace(/\\/g, "/");
  if (/^[A-Z]:\//.test(normalized)) return "";
  if (normalized.startsWith("/")) return `${BACKEND_URL}${normalized}`;
  return `${BACKEND_URL}/${normalized}`;
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ==================== SMALL COMPONENTS ====================

// Toast
const ToastContainer = ({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((t) => {
        const cfg = {
          success: { cls: "bg-emerald-500", icon: <CheckCircle2 size={17} /> },
          error: { cls: "bg-red-500", icon: <XCircle size={17} /> },
          info: { cls: "bg-blue-500", icon: <Info size={17} /> },
          warning: { cls: "bg-amber-500", icon: <AlertCircle size={17} /> },
        }[t.type];
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white min-w-64 ${cfg.cls}`}
          >
            {cfg.icon}
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="hover:opacity-75">
              <X size={15} />
            </button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// Status badge
const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<
    string,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    PENDING: {
      cls: "bg-amber-100 text-amber-700",
      icon: <Clock size={13} />,
      label: "Pending",
    },
    SUCCESS: {
      cls: "bg-emerald-100 text-emerald-700",
      icon: <CheckCircle size={13} />,
      label: "Approved",
    },
    FAILED: {
      cls: "bg-red-100 text-red-700",
      icon: <XCircle size={13} />,
      label: "Rejected",
    },
    REFUNDED: {
      cls: "bg-purple-100 text-purple-700",
      icon: <AlertCircle size={13} />,
      label: "Refunded",
    },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.cls}`}
    >
      {c.icon} {c.label}
    </span>
  );
};

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Bank Transfer",
    CARD: "Card Payment",
    MOBILE_BANKING: "Mobile Banking",
    CASH: "Cash",
  };
  return labels[method] || method;
};

const getMethodIcon = (method: string) => {
  const icons: Record<string, React.ReactNode> = {
    BANK_TRANSFER: <Building2 size={16} className="text-blue-600" />,
    CARD: <CreditCard size={16} className="text-purple-600" />,
    MOBILE_BANKING: <Smartphone size={16} className="text-green-600" />,
    CASH: <Banknote size={16} className="text-orange-600" />,
  };
  return icons[method] || <DollarSign size={16} className="text-gray-500" />;
};

// ==================== RECEIPT UPLOADER ====================
const ReceiptUploader = ({
  file,
  onChange,
  onClear,
}: {
  file: File | null;
  onChange: (f: File) => void;
  onClear: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Receipt / Screenshot{" "}
        <span className="text-gray-400 font-normal">(optional)</span>
      </label>

      {file ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            {file.type.startsWith("image/") ? (
              <Image size={18} className="text-blue-600" />
            ) : (
              <FileText size={18} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition">
              <Upload
                size={20}
                className="text-gray-400 group-hover:text-blue-500 transition"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPG, PNG, WEBP, PDF — max 5MB
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange(f);
            }}
          />
        </div>
      )}
    </div>
  );
};

// ==================== RECEIPT MODAL ====================
const ReceiptModal = ({
  url,
  reference,
  amount,
  date,
  onClose,
}: {
  url: string;
  reference: string;
  amount: number;
  date: string;
  onClose: () => void;
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Image size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Payment Receipt</p>
              <p className="text-xs text-gray-500 font-mono">{reference}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ZoomOut size={16} className="text-gray-600" />
            </button>
            <span className="text-xs font-medium text-gray-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ZoomIn size={16} className="text-gray-600" />
            </button>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <RotateCw size={16} className="text-gray-600" />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ExternalLink size={16} className="text-gray-600" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-lg transition ml-1"
            >
              <X size={18} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 min-h-0 flex items-center justify-center">
          <img
            src={url}
            alt="Payment Receipt"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              objectFit: "contain",
            }}
            className="rounded-xl shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-receipt.png";
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-bold text-[#021f3b]">{fmtCurrency(amount)}</span>
            <span className="text-gray-300">|</span>
            <span>{fmtDate(date)}</span>
          </div>
          <a
            href={url}
            download
            className="flex items-center gap-2 px-4 py-2 bg-[#021f3b] text-white rounded-xl text-sm font-medium hover:bg-[#0a3a6b] transition"
          >
            <Download size={14} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
export default function DepositsPage() {
  const router = useRouter();

  // Data
  const [isLoading, setIsLoading] = useState(true);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form
  const [showNewDeposit, setShowNewDeposit] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [receiptDeposit, setReceiptDeposit] = useState<Deposit | null>(null);

  // Toast
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id: string) =>
    setToasts((p) => p.filter((t) => t.id !== id));

  // ── Fetch deposits ──
  const fetchDeposits = async () => {
    try {
      const data = await apiClient("/deposits");
      setDeposits(data.deposits || []);
      setStats(data.stats || null);
    } catch (error: any) {
      if (String(error?.message).includes("401")) {
        router.push("/login");
        return;
      }
      addToast("Failed to load deposits", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // ── Submit deposit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedMethod) {
      addToast("Amount and payment method are required", "error");
      return;
    }

    if (parseFloat(amount) < 100) {
      addToast("Minimum deposit amount is SAR 100", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("method", selectedMethod);
      if (transactionId.trim())
        formData.append("transactionId", transactionId.trim());
      if (notes.trim()) formData.append("notes", notes.trim());
      if (receiptFile) formData.append("attachment", receiptFile);

      await apiClient("/deposits", {
        method: "POST",
        body: formData,
      });

      addToast("Deposit request submitted!", "success");
      setShowNewDeposit(false);
      setAmount("");
      setSelectedMethod("");
      setTransactionId("");
      setNotes("");
      setReceiptFile(null);
      fetchDeposits();
    } catch (error: any) {
      console.error("Submit error:", error);
      if (String(error?.message).includes("401")) {
        router.push("/login");
        return;
      }
      addToast(
        String(error?.message || "Failed to submit")
          .replace(/API Error \d+ on \/deposits: /, "")
          .replace(/^{.*}$/, "Failed to submit"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("Copied!", "info");
  };

  // Filter
  const filteredDeposits = deposits.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      d.reference?.toLowerCase().includes(q) ||
      d.transactionId?.toLowerCase().includes(q) ||
      d.amount.toString().includes(q);
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ==================== LOADING ====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AgentTopBar />
        <div className="p-6 space-y-5 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-lg w-40" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <AgentTopBar />

      <div className="p-4 md:p-6 space-y-5">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Deposits</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage your account balance and deposit requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setRefreshing(true);
                await fetchDeposits();
                addToast("Refreshed", "success");
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              onClick={() => setShowNewDeposit(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] transition shadow-md text-sm"
            >
              <Plus size={17} /> New Deposit
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-2xl p-5 text-white col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-blue-200 text-sm">Total Approved</p>
              <div className="p-2 bg-white/15 rounded-xl">
                <Wallet size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {fmtCurrency(stats?.totalDeposits || 0)}
            </p>
            <p className="text-blue-300 text-xs mt-2 flex items-center gap-1">
              <TrendingUp size={12} /> {stats?.approvedCount || 0} successful
              deposits
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">Pending</p>
              <div className="p-2 bg-amber-100 rounded-xl">
                <Clock size={18} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {fmtCurrency(stats?.pendingAmount || 0)}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              {stats?.pendingCount || 0} pending
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">Approved</p>
              <div className="p-2 bg-emerald-100 rounded-xl">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {fmtCurrency(stats?.approvedAmount || 0)}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              {stats?.approvedCount || 0} deposits
            </p>
          </div>

          <div
            onClick={() => setShowNewDeposit(true)}
            className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-green-100 text-sm">Quick Action</p>
              <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition">
                <Plus size={20} />
              </div>
            </div>
            <p className="text-xl font-bold">Add Deposit</p>
            <p className="text-green-100 text-xs mt-2">Top up your balance</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reference, amount..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 focus:border-[#021f3b]/30 transition"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 bg-white cursor-pointer min-w-36"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Approved</option>
              <option value="FAILED">Rejected</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm font-medium">
            <Download size={16} /> Export
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">Deposit History</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredDeposits.length} record
                {filteredDeposits.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Reference",
                    "Method",
                    "Amount",
                    "Status",
                    "Receipt",
                    "Date",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredDeposits.length > 0 ? (
                  filteredDeposits.map((dep) => (
                    <tr
                      key={dep.id}
                      className="hover:bg-gray-50/70 transition group"
                    >
                      {/* Reference */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Hash size={13} className="text-gray-300" />
                          <span className="font-mono text-sm font-semibold text-gray-700">
                            {dep.reference || dep.transactionId || "—"}
                          </span>
                          {(dep.reference || dep.transactionId) && (
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  dep.reference || dep.transactionId || ""
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                            >
                              <Copy size={12} className="text-gray-400" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 rounded-lg">
                            {getMethodIcon(dep.method)}
                          </div>
                          <span className="text-sm text-gray-700">
                            {getMethodLabel(dep.method)}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="text-base font-bold text-gray-800">
                          {fmtCurrency(dep.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={dep.status} />
                      </td>

                      {/* Receipt */}
                      <td className="px-5 py-4">
                        {dep.attachment ? (
                          <button
                            onClick={() => setReceiptDeposit(dep)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-xs font-semibold transition border border-purple-200"
                          >
                            <Image size={12} /> View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar size={13} />
                          {fmtDate(dep.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedDeposit(dep)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Eye size={17} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Wallet size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No deposits found
                        </p>
                        <button
                          onClick={() => setShowNewDeposit(true)}
                          className="px-5 py-2 bg-[#021f3b] text-white rounded-xl text-sm font-semibold hover:bg-[#0a3a6b] transition"
                        >
                          Make First Deposit
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl shrink-0">
              <Building2 size={22} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">
                Bank Transfer Details
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Use these details for direct bank transfers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(BANK_DETAILS).map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl p-3.5 border border-blue-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{key}</p>
                      <p className="font-semibold text-gray-800 text-sm">{val}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(val)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Copy size={13} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW DEPOSIT MODAL */}
      <AnimatePresence>
        {showNewDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewDeposit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/15 rounded-xl">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">New Deposit Request</h2>
                    <p className="text-blue-200 text-xs">
                      Add funds to your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewDeposit(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-5"
              >
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (SAR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                      SAR
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="100"
                      step="0.01"
                      className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 focus:border-[#021f3b] transition"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum: SAR 100</p>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedMethod === m.id
                            ? "border-[#021f3b] bg-[#021f3b]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 ${m.color} rounded-lg flex items-center justify-center text-white mb-2`}
                        >
                          <m.icon size={18} />
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction / Reference ID
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID (if applicable)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 focus:border-[#021f3b] transition font-mono"
                  />
                </div>

                {/* Receipt upload */}
                <ReceiptUploader
                  file={receiptFile}
                  onChange={setReceiptFile}
                  onClear={() => setReceiptFile(null)}
                />

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 focus:border-[#021f3b] transition"
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Your deposit request will be reviewed by admin within{" "}
                    <strong>1-2 business days</strong>.
                  </p>
                </div>
              </form>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewDeposit(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !amount || !selectedMethod}
                  className="flex-1 py-2.5 bg-[#021f3b] text-white rounded-xl font-bold hover:bg-[#0a3a6b] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Submit Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDeposit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-gray-800">Deposit Details</h3>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Amount */}
                <div className="text-center py-4 bg-gray-50 rounded-2xl">
                  <p className="text-3xl font-bold text-gray-800">
                    {fmtCurrency(selectedDeposit.amount)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={selectedDeposit.status} />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 divide-y divide-gray-50">
                  {[
                    {
                      label: "Reference",
                      value: selectedDeposit.reference || "—",
                      mono: true,
                    },
                    {
                      label: "Transaction ID",
                      value: selectedDeposit.transactionId || "—",
                      mono: true,
                    },
                    {
                      label: "Method",
                      value: getMethodLabel(selectedDeposit.method),
                      mono: false,
                    },
                    {
                      label: "Currency",
                      value: selectedDeposit.currency,
                      mono: false,
                    },
                    {
                      label: "Submitted",
                      value: fmtDate(selectedDeposit.createdAt),
                      mono: false,
                    },
                    ...(selectedDeposit.approvedAt
                      ? [
                          {
                            label: "Approved",
                            value: fmtDate(selectedDeposit.approvedAt),
                            mono: false,
                          },
                        ]
                      : []),
                    ...(selectedDeposit.rejectedAt
                      ? [
                          {
                            label: "Rejected",
                            value: fmtDate(selectedDeposit.rejectedAt),
                            mono: false,
                          },
                        ]
                      : []),
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between py-2.5">
                      <span className="text-gray-500 text-sm">{row.label}</span>
                      <span
                        className={`text-sm font-semibold text-gray-800 ${
                          row.mono ? "font-mono" : ""
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rejection note */}
                {selectedDeposit.rejectionNote && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-bold text-red-600 uppercase mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700">
                      {selectedDeposit.rejectionNote}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedDeposit.notes && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedDeposit.notes}
                    </p>
                  </div>
                )}

                {/* Receipt thumbnail */}
                {selectedDeposit.attachment && (
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="text-xs font-bold text-purple-500 uppercase mb-2 flex items-center gap-1.5">
                      <Image size={12} /> Payment Receipt
                    </p>
                    <div
                      onClick={() => setReceiptDeposit(selectedDeposit)}
                      className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-purple-200 hover:border-purple-400 transition-all"
                    >
                      <img
                        src={getAttachmentUrl(selectedDeposit.attachment)}
                        alt="Receipt"
                        className="w-full h-36 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-receipt.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-white text-gray-800 px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg">
                          <ZoomIn size={14} /> View Full Receipt
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="w-full py-2.5 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] transition text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECEIPT MODAL */}
      {receiptDeposit?.attachment && (
        <ReceiptModal
          url={getAttachmentUrl(receiptDeposit.attachment)}
          reference={
            receiptDeposit.reference ||
            receiptDeposit.transactionId ||
            "—"
          }
          amount={receiptDeposit.amount}
          date={receiptDeposit.createdAt}
          onClose={() => setReceiptDeposit(null)}
        />
      )}

      {/* Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}