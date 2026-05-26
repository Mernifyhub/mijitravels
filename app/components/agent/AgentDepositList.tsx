"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Filter, Download, RefreshCw, Eye, CheckCircle, XCircle,
  Clock, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  FileText, MessageSquare, Info, Copy, Wallet, FileSpreadsheet,
  FileDown, Smartphone, Building2, CreditCard, Banknote, RotateCcw,
  Receipt, Loader2, ArrowUpRight, Image, Paperclip, ZoomIn,
  ZoomOut, RotateCw, ExternalLink, AlertTriangle, CheckCircle2,
  TrendingUp, Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdminTopBar from "@/app/components/admin/AdminTopBar";

// ==================== TYPES ====================
interface DepositRequest {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentFullName: string;
  agentPhone: string;
  agentEmail: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  type: "MFS" | "Bank" | "Cash";
  senderAcc: string;
  senderType: string;
  receiver: string;
  amount: number;
  currency: string;
  requestedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  attachment?: string | null;
  reference: string;
  remarks?: string | null;
  rejectionNote?: string | null;
  transactionId?: string | null;
  previousBalance: number;
}

interface SortConfig {
  key: keyof DepositRequest | null;
  direction: "asc" | "desc";
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

type TabType = "all" | "pending" | "approved" | "rejected";

// ==================== DEBOUNCE ====================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ==================== FORMAT ====================
const fmt = (n: number) =>
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
  });

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const fmtDateTime = (s: string) => `${fmtDate(s)}, ${fmtTime(s)}`;

// ==================== BADGES ====================
const StatusBadge = ({ status }: { status: DepositRequest["status"] }) => {
  const cfg = {
    PENDING: { cls: "bg-amber-100 text-amber-700 border-amber-300", icon: <Clock size={13} />, label: "Pending" },
    SUCCESS: { cls: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: <CheckCircle size={13} />, label: "Approved" },
    FAILED: { cls: "bg-red-100 text-red-700 border-red-300", icon: <XCircle size={13} />, label: "Rejected" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    MFS: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Bank: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Cash: "bg-lime-100 text-lime-700 border-lime-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[type] || "bg-gray-100 border-gray-200"}`}>
      {type}
    </span>
  );
};

const MethodIcon = ({ method }: { method: string }) => {
  const m = method.toLowerCase().replace("_", "");
  if (m.includes("bkash")) return <Smartphone size={15} className="text-pink-600" />;
  if (m.includes("nagad")) return <Smartphone size={15} className="text-orange-600" />;
  if (m.includes("rocket")) return <Smartphone size={15} className="text-purple-600" />;
  if (m.includes("mobilebanking")) return <Smartphone size={15} className="text-blue-600" />;
  if (m.includes("bank")) return <Building2 size={15} className="text-blue-600" />;
  if (m.includes("cash")) return <Banknote size={15} className="text-green-600" />;
  return <CreditCard size={15} className="text-gray-600" />;
};

const MethodBadge = ({ method, label }: { method: string; label: string }) => {
  const m = method.toLowerCase().replace("_", "");
  const style =
    m.includes("bkash") ? "bg-pink-50 text-pink-700 border-pink-200" :
    m.includes("nagad") ? "bg-orange-50 text-orange-700 border-orange-200" :
    m.includes("rocket") ? "bg-purple-50 text-purple-700 border-purple-200" :
    m.includes("bank") ? "bg-blue-50 text-blue-700 border-blue-200" :
    m.includes("cash") ? "bg-green-50 text-green-700 border-green-200" :
    "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}>
      <MethodIcon method={method} /> {label}
    </span>
  );
};

const SortIcon = ({ col, cfg }: { col: keyof DepositRequest; cfg: SortConfig }) =>
  cfg.key !== col ? (
    <div className="flex flex-col opacity-30">
      <ChevronUp className="w-3 h-3 -mb-1" />
      <ChevronDown className="w-3 h-3" />
    </div>
  ) : cfg.direction === "asc" ? (
    <ChevronUp className="w-4 h-4 text-[#0B2545]" />
  ) : (
    <ChevronDown className="w-4 h-4 text-[#0B2545]" />
  );

// ==================== TOAST ====================
const Toast = ({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) => {
  if (!toast?.show) return null;
  const cfg = {
    success: { cls: "bg-emerald-500", icon: <CheckCircle2 size={18} /> },
    error: { cls: "bg-red-500", icon: <XCircle size={18} /> },
    info: { cls: "bg-blue-500", icon: <Info size={18} /> },
    warning: { cls: "bg-amber-500", icon: <AlertTriangle size={18} /> },
  }[toast.type];
  return (
    <div className={`fixed top-20 right-4 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white min-w-72 ${cfg.cls}`}>
      {cfg.icon}
      <span className="font-medium flex-1">{toast.message}</span>
      <button onClick={onClose} className="hover:opacity-75 transition"><X size={16} /></button>
    </div>
  );
};

// ==================== RECEIPT MODAL ====================
const ReceiptModal = ({
  url, reference, amount, date, onClose,
}: {
  url: string; reference: string; amount: number; date: string; onClose: () => void;
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
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
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-2 hover:bg-gray-200 rounded-lg transition" title="Zoom out">
              <ZoomOut size={16} className="text-gray-600" />
            </button>
            <span className="text-xs font-medium text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-2 hover:bg-gray-200 rounded-lg transition" title="Zoom in">
              <ZoomIn size={16} className="text-gray-600" />
            </button>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-2 hover:bg-gray-200 rounded-lg transition" title="Rotate">
              <RotateCw size={16} className="text-gray-600" />
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 rounded-lg transition" title="Open full size">
              <ExternalLink size={16} className="text-gray-600" />
            </a>
            <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-lg transition ml-1">
              <X size={18} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 min-h-0 flex items-center justify-center">
          <img
            src={url}
            alt="Payment Receipt"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: "transform 0.2s ease", maxWidth: "100%", objectFit: "contain" }}
            className="rounded-xl shadow-lg"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-receipt.png"; }}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-bold text-[#0B2545]">{fmt(amount)}</span>
            <span className="text-gray-300">|</span>
            <span>{fmtDateTime(date)}</span>
          </div>
          <a href={url} download className="flex items-center gap-2 px-4 py-2 bg-[#0B2545] text-white rounded-xl text-sm font-medium hover:bg-[#0a1f3a] transition">
            <Download size={14} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

// ==================== DETAIL MODAL ====================
const DetailModal = ({
  request, onClose, onApprove, onReject, onViewReceipt,
}: {
  request: DepositRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onViewReceipt: () => void;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] p-5 text-white sticky top-0 z-10 rounded-t-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Deposit Details</h2>
            <p className="text-blue-200 text-sm font-mono mt-1">{request.reference}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition"><X size={22} /></button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Status */}
        <div className={`p-4 rounded-2xl flex items-center justify-between ${
          request.status === "PENDING" ? "bg-amber-50 border border-amber-200" :
          request.status === "SUCCESS" ? "bg-emerald-50 border border-emerald-200" :
          "bg-red-50 border border-red-200"
        }`}>
          <div className="flex items-center gap-3">
            {request.status === "PENDING" && <Clock className="text-amber-500" size={28} />}
            {request.status === "SUCCESS" && <CheckCircle className="text-emerald-500" size={28} />}
            {request.status === "FAILED" && <XCircle className="text-red-500" size={28} />}
            <div>
              <p className="font-bold text-lg text-gray-800">
                {request.status === "SUCCESS" ? "Approved" : request.status === "FAILED" ? "Rejected" : "Awaiting Review"}
              </p>
              {request.processedAt && (
                <p className="text-xs text-gray-500">
                  {fmtDateTime(request.processedAt)}{request.processedBy && ` · by ${request.processedBy}`}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Agent info */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Agent Information</h3>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
              {request.agentName?.charAt(0) || "A"}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-800">{request.agentName}</p>
              {request.agentFullName && request.agentFullName !== request.agentName && (
                <p className="text-sm text-gray-500">{request.agentFullName}</p>
              )}
              <span className="inline-block mt-1 px-3 py-0.5 bg-[#0B2545] text-white text-xs font-bold rounded-full">
                {request.agentId}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>📧 {request.agentEmail}</div>
            <div>📞 {request.agentPhone}</div>
          </div>
        </div>

        {/* Transaction */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Transaction Details</h3>
          <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Deposit Amount</span>
            <span className="text-3xl font-bold text-[#0B2545]">{fmt(request.amount)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Type</p>
              <TypeBadge type={request.type} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Method</p>
              <MethodBadge method={request.senderType} label={request.senderAcc} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Reference</p>
              <p className="font-mono font-semibold text-blue-600">{request.reference}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Requested</p>
              <p className="font-medium text-gray-700">{fmtDateTime(request.requestedAt)}</p>
            </div>
            {request.transactionId && (
              <div className="col-span-2">
                <p className="text-gray-400 text-xs uppercase mb-1">Transaction ID</p>
                <p className="font-mono font-semibold text-gray-700">{request.transactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={13} /> Balance Impact
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-gray-400 mb-1">Before</p>
              <p className="font-bold text-gray-700 text-sm">{fmt(request.previousBalance)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <p className="text-xs text-gray-400 mb-1">Deposit</p>
              <p className="font-bold text-emerald-600 text-sm">+{fmt(request.amount)}</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-gray-400 mb-1">After</p>
              <p className="font-bold text-blue-700 text-sm">{fmt(request.previousBalance + request.amount)}</p>
            </div>
          </div>
        </div>

        {/* Receipt */}
        {request.attachment ? (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Paperclip size={13} /> Payment Receipt
            </h3>
            <div onClick={onViewReceipt} className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all">
              <img src={request.attachment} alt="Receipt" className="w-full h-48 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-receipt.png"; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-xl font-medium shadow-lg">
                  <ZoomIn size={16} /> View Full Receipt
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-5 border border-dashed border-slate-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Paperclip size={13} /> Receipt
            </h3>
            <p className="text-sm text-gray-400 flex items-center gap-2"><Image size={16} /> No receipt uploaded</p>
          </div>
        )}

        {/* Rejection note */}
        {request.status === "FAILED" && request.rejectionNote && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
            <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2 text-sm"><XCircle size={15} /> Rejection Reason</h3>
            <p className="text-gray-700 text-sm">{request.rejectionNote}</p>
          </div>
        )}

        {/* Remarks */}
        {request.remarks && request.status !== "FAILED" && (
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><MessageSquare size={15} /> Remarks</h3>
            <p className="text-gray-700 text-sm">{request.remarks}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {request.status === "PENDING" && (
        <div className="p-5 border-t bg-gray-50 flex gap-3 sticky bottom-0 rounded-b-2xl">
          <button onClick={onReject} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition flex items-center justify-center gap-2 shadow-sm">
            <XCircle size={18} /> Reject
          </button>
          <button onClick={onApprove} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle size={18} /> Approve
          </button>
        </div>
      )}
    </div>
  </div>
);

// ==================== APPROVE MODAL ====================
const ApproveModal = ({
  request, loading, onConfirm, onClose,
}: {
  request: DepositRequest; loading: boolean; onConfirm: () => void; onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
      <div className="p-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Approve Deposit</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Please review before confirming</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-xl flex items-center justify-center text-white font-bold">
            {request.agentName?.charAt(0) || "A"}
          </div>
          <div>
            <p className="font-bold text-gray-800">{request.agentName}</p>
            <p className="text-xs text-gray-400">{request.agentId} · {request.agentEmail}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Balance</span>
            <span className="font-semibold">{fmt(request.previousBalance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deposit Amount</span>
            <span className="font-bold text-emerald-600">+{fmt(request.amount)}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">New Balance</span>
            <span className="font-bold text-lg text-blue-600">{fmt(request.previousBalance + request.amount)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><CheckCircle size={18} /> Confirm</>}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ==================== REJECT MODAL ====================
const RejectModal = ({
  request, loading, reason, onReasonChange, onConfirm, onClose,
}: {
  request: DepositRequest; loading: boolean; reason: string;
  onReasonChange: (v: string) => void; onConfirm: () => void; onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
      <div className="p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Reject Deposit</h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          <span className="font-bold text-red-600">{fmt(request.amount)}</span> from{" "}
          <span className="font-semibold">{request.agentName}</span>
        </p>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Provide a clear reason for rejection..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">{reason.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!reason.trim() || loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Rejecting...</> : <><XCircle size={18} /> Reject</>}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ==================== MAIN PAGE ====================
export default function AdminDepositManagement() {
  const router = useRouter();

  const [data, setData] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [filterType, setFilterType] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "requestedAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [detailItem, setDetailItem] = useState<DepositRequest | null>(null);
  const [approveItem, setApproveItem] = useState<DepositRequest | null>(null);
  const [rejectItem, setRejectItem] = useState<DepositRequest | null>(null);
  const [receiptItem, setReceiptItem] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState["type"] = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "info");
  };

  // Fetch deposits
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/deposits");
      if (!res.ok) {
        if (res.status === 401) { router.push("/login"); return; }
        throw new Error("Failed to fetch");
      }
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      showToast("Failed to load deposits", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [router, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Approve
  const confirmApprove = async () => {
    if (!approveItem) return;
    setProcessingId(approveItem.id);
    try {
      const res = await fetch(`/api/admin/deposits/${approveItem.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");

      setData((prev) => prev.map((d) =>
        d.id === approveItem.id
          ? { ...d, status: "SUCCESS" as const, processedAt: new Date().toISOString(), processedBy: "Admin" }
          : d
      ));
      showToast(`${fmt(approveItem.amount)} approved for ${approveItem.agentName}!`, "success");
      setApproveItem(null);
      setDetailItem(null);
    } catch (err: any) {
      showToast(err.message || "Approve failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Reject
  const confirmReject = async () => {
    if (!rejectItem || !rejectReason.trim()) return;
    setProcessingId(rejectItem.id);
    try {
      const res = await fetch(`/api/admin/deposits/${rejectItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionNote: rejectReason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");

      setData((prev) => prev.map((d) =>
        d.id === rejectItem.id
          ? { ...d, status: "FAILED" as const, rejectionNote: rejectReason, processedAt: new Date().toISOString() }
          : d
      ));
      showToast("Deposit rejected", "success");
      setRejectItem(null);
      setDetailItem(null);
      setRejectReason("");
    } catch (err: any) {
      showToast(err.message || "Reject failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    const pendingIds = data.filter((d) => selectedItems.includes(d.id) && d.status === "PENDING").map((d) => d.id);
    if (!pendingIds.length) { showToast("No pending items selected", "warning"); return; }
    setProcessingId("bulk");
    try {
      let count = 0;
      for (const id of pendingIds) {
        const res = await fetch(`/api/admin/deposits/${id}/approve`, { method: "POST" });
        if (res.ok) count++;
      }
      await fetchData();
      showToast(`${count} deposits approved`, "success");
      setSelectedItems([]);
    } catch {
      showToast("Bulk approve failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Export
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format === "csv") {
      const headers = ["Agent ID", "Agency Name", "Agent Name", "Amount", "Status", "Method", "Reference", "Date"];
      const rows = filteredData.map((d) =>
        [d.agentId, d.agentName, d.agentFullName, d.amount, d.status, d.senderAcc, d.reference, fmtDateTime(d.requestedAt)].join(",")
      );
      const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deposits-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    showToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  // Filter & sort
  const filteredData = useMemo(() => {
    let r = [...data];
    if (activeTab !== "all") {
      const m: Record<string, string> = { pending: "PENDING", approved: "SUCCESS", rejected: "FAILED" };
      r = r.filter((d) => d.status === m[activeTab]);
    }
    if (filterType !== "all") r = r.filter((d) => d.type === filterType);
    if (filterMethod !== "all") r = r.filter((d) => d.senderType.includes(filterMethod));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      r = r.filter((d) =>
        d.agentId.toLowerCase().includes(q) ||
        d.agentName.toLowerCase().includes(q) ||
        d.agentFullName?.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q) ||
        d.agentEmail.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      r.sort((a, b) => {
        const av = a[sortConfig.key!], bv = b[sortConfig.key!];
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [data, activeTab, filterType, filterMethod, debouncedSearch, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => {
    const pending = data.filter((d) => d.status === "PENDING");
    const approved = data.filter((d) => d.status === "SUCCESS");
    const today = new Date().toISOString().split("T")[0];
    return {
      total: data.length,
      pending: pending.length,
      approved: approved.length,
      rejected: data.filter((d) => d.status === "FAILED").length,
      pendingAmount: pending.reduce((s, d) => s + d.amount, 0),
      approvedAmount: approved.reduce((s, d) => s + d.amount, 0),
      todayCount: data.filter((d) => d.requestedAt.startsWith(today)).length,
    };
  }, [data]);

  const activeFiltersCount = (filterType !== "all" ? 1 : 0) + (filterMethod !== "all" ? 1 : 0);

  const handleSort = (key: keyof DepositRequest) => {
    setSortConfig((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }));
  };

  if (isLoading) {
    return (
      <>
        <AdminTopBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-[#0B2545] mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Loading deposits...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ===== ADMIN TOP BAR ===== */}
      <AdminTopBar />

      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* ===== FILTER BAR ===== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
          {/* Top row - title + actions */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0B2545]/10 rounded-xl">
                <Wallet size={20} className="text-[#0B2545]" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">Deposit Management</h1>
                <p className="text-xs text-gray-400">
                  {stats.total} total ·{" "}
                  <span className="text-amber-600 font-semibold">{stats.pending} pending</span> ·{" "}
                  <span className="text-emerald-600 font-semibold">{stats.todayCount} today</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Export */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition">
                  <Download size={15} /> Export <ChevronDown size={13} />
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {[
                    { f: "csv", icon: <FileText size={14} className="text-green-600" />, label: "CSV" },
                    { f: "excel", icon: <FileSpreadsheet size={14} className="text-emerald-600" />, label: "Excel" },
                    { f: "pdf", icon: <FileDown size={14} className="text-red-600" />, label: "PDF" },
                  ].map((e) => (
                    <button key={e.f} onClick={() => handleExport(e.f as any)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                      {e.icon} Export {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refresh */}
              <button
                onClick={async () => { setRefreshing(true); await fetchData(); showToast("Refreshed", "success"); }}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition disabled:opacity-50"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* Tabs row */}
          <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100 overflow-x-auto">
            {[
              { key: "all", label: `All (${stats.total})`, active: "bg-[#0B2545] text-white shadow-sm" },
              { key: "pending", label: `Pending (${stats.pending})`, active: "bg-amber-500 text-white shadow-sm", icon: <Clock size={13} /> },
              { key: "approved", label: `Approved (${stats.approved})`, active: "bg-emerald-500 text-white shadow-sm", icon: <CheckCircle size={13} /> },
              { key: "rejected", label: `Rejected (${stats.rejected})`, active: "bg-red-500 text-white shadow-sm", icon: <XCircle size={13} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as TabType); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.key ? tab.active : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Search + controls row */}
          <div className="px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search agent, reference, email..."
                    className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545] transition"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={14} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Reset */}
                <button
                  onClick={() => { setFilterType("all"); setFilterMethod("all"); setSearchTerm(""); setActiveTab("all"); setCurrentPage(1); }}
                  className="px-3.5 py-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 text-sm font-medium flex items-center gap-1.5 transition"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    showFilters || activeFiltersCount > 0
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={14} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(+e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 bg-white"
                >
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n} rows</option>)}
                </select>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedItems.length > 0 && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-sm font-bold text-blue-700">{selectedItems.length} selected</span>
                <div className="h-4 w-px bg-blue-200" />
                <button
                  onClick={handleBulkApprove}
                  disabled={processingId === "bulk"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium transition disabled:opacity-50"
                >
                  {processingId === "bulk" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  Approve Selected
                </button>
                <button onClick={() => setSelectedItems([])} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X size={13} /> Clear
                </button>
              </div>
            )}

            {/* Extended filters */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Type</label>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 bg-white">
                    <option value="all">All Types</option>
                    <option value="MFS">MFS</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Method</label>
                  <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 bg-white">
                    <option value="all">All Methods</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">From Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">To Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  {/* Select all */}
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onChange={() => setSelectedItems(
                        selectedItems.length === paginatedData.length ? [] : paginatedData.map((d) => d.id)
                      )}
                      className="w-4 h-4 rounded border-gray-300 text-[#0B2545] focus:ring-[#0B2545]"
                    />
                  </th>

                  {/* Columns */}
                  {[
                    { key: "agentId" as const, label: "Agent / Agency", sortable: true },
                    { key: null, label: "Status" },
                    { key: null, label: "Type" },
                    { key: null, label: "Method" },
                    { key: "amount" as const, label: "Amount", sortable: true },
                    { key: null, label: "Receipt", center: true },
                    { key: null, label: "Actions", center: true },
                    { key: "requestedAt" as const, label: "Date", sortable: true },
                  ].map((col, i) => (
                    <th
                      key={i}
                      onClick={col.key ? () => handleSort(col.key!) : undefined}
                      className={`px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                        col.key ? "cursor-pointer hover:text-gray-800 transition select-none" : ""
                      } ${col.center ? "text-center" : "text-left"}`}
                    >
                      <div className={`flex items-center gap-1.5 ${col.center ? "justify-center" : ""}`}>
                        {col.label}
                        {col.key && <SortIcon col={col.key} cfg={sortConfig} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Receipt size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium text-sm">No deposits found</p>
                        <button
                          onClick={() => { setFilterType("all"); setFilterMethod("all"); setSearchTerm(""); setActiveTab("all"); }}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={`group transition-colors hover:bg-blue-50/20 ${
                      selectedItems.includes(item.id) ? "bg-blue-50/40" : ""
                    } ${item.status === "PENDING" ? "border-l-[3px] border-l-amber-400" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => setSelectedItems((p) =>
                          e.target.checked ? [...p, item.id] : p.filter((id) => id !== item.id)
                        )}
                        className="w-4 h-4 rounded border-gray-300 text-[#0B2545] focus:ring-[#0B2545]"
                      />
                    </td>

                    {/* Agent / Agency */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {item.agentName?.charAt(0) || "A"}
                        </div>
                        <div className="min-w-0">
                          {/* Company name - primary */}
                          <p className="font-bold text-gray-800 text-sm truncate">{item.agentName}</p>
                          {/* Agent ID + person name */}
                          <p className="text-xs text-gray-400 truncate">
                            <span className="font-mono">{item.agentId}</span>
                            {item.agentFullName && item.agentFullName !== item.agentName && (
                              <span className="text-gray-300"> · {item.agentFullName}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>

                    {/* Type */}
                    <td className="px-4 py-3.5"><TypeBadge type={item.type} /></td>

                    {/* Method */}
                    <td className="px-4 py-3.5">
                      <MethodBadge method={item.senderType} label={item.senderAcc} />
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900">{fmt(item.amount)}</p>
                      <p className="text-xs text-gray-400">{item.currency}</p>
                    </td>

                    {/* Receipt */}
                    <td className="px-4 py-3.5 text-center">
                      {item.attachment ? (
                        <button
                          onClick={() => setReceiptItem(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-xs font-semibold transition border border-purple-200"
                        >
                          <Image size={12} /> View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {item.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => setApproveItem(item)}
                              disabled={processingId === item.id}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                              title="Approve"
                            >
                              {processingId === item.id
                                ? <Loader2 size={16} className="animate-spin" />
                                : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => setRejectItem(item)}
                              disabled={processingId === item.id}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => copyToClipboard(item.reference)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                          title="Copy Reference"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-700">{fmtDate(item.requestedAt)}</p>
                      <p className="text-xs text-gray-400">{fmtTime(item.requestedAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINATION ===== */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-t border-gray-50 bg-gray-50/30">
              <p className="text-sm text-gray-400 mb-3 sm:mb-0">
                Showing{" "}
                <span className="font-bold text-gray-600">{(currentPage - 1) * itemsPerPage + 1}</span>
                {" – "}
                <span className="font-bold text-gray-600">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>
                {" of "}
                <span className="font-bold text-gray-600">{filteredData.length}</span>
              </p>

              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition">
                  <ChevronLeft size={14} /><ChevronLeft size={14} className="-ml-2.5" />
                </button>
                <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition">
                  <ChevronLeft size={14} />
                </button>

                <div className="flex gap-1 mx-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = totalPages <= 5 ? i + 1 :
                      currentPage <= 3 ? i + 1 :
                      currentPage >= totalPages - 2 ? totalPages - 4 + i :
                      currentPage - 2 + i;
                    return (
                      <button key={pg} onClick={() => setCurrentPage(pg)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                          currentPage === pg ? "bg-[#0B2545] text-white shadow-md" : "border border-gray-200 text-gray-600 hover:bg-white"
                        }`}>
                        {pg}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition">
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition">
                  <ChevronRight size={14} /><ChevronRight size={14} className="-ml-2.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {detailItem && (
        <DetailModal
          request={detailItem}
          onClose={() => setDetailItem(null)}
          onApprove={() => { setApproveItem(detailItem); setDetailItem(null); }}
          onReject={() => { setRejectItem(detailItem); setDetailItem(null); }}
          onViewReceipt={() => setReceiptItem(detailItem)}
        />
      )}

      {approveItem && (
        <ApproveModal
          request={approveItem}
          loading={processingId === approveItem.id}
          onConfirm={confirmApprove}
          onClose={() => setApproveItem(null)}
        />
      )}

      {rejectItem && (
        <RejectModal
          request={rejectItem}
          loading={processingId === rejectItem.id}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={confirmReject}
          onClose={() => { setRejectItem(null); setRejectReason(""); }}
        />
      )}

      {receiptItem?.attachment && (
        <ReceiptModal
          url={receiptItem.attachment}
          reference={receiptItem.reference}
          amount={receiptItem.amount}
          date={receiptItem.requestedAt}
          onClose={() => setReceiptItem(null)}
        />
      )}
    </>
  );
}