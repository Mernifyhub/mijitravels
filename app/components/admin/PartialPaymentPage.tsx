"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  Users,
  CreditCard,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RefreshCw,
  X,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  History,
  Building2,
  Wallet,
  Banknote,
  Receipt,
  FileText,
  FileSpreadsheet,
  File,
  Printer,
  MoreHorizontal,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Send,
  Plus,
  PlusCircle,
  MinusCircle,
  CircleDollarSign,
  PiggyBank,
  Timer,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  DollarSign,
  Percent,
  Target,
  Sparkles,
  Bell,
  BellRing,
  MessageSquare,
  Phone,
  Hash,
  Verified,
  BadgePercent,
  ArrowRightLeft,
  Landmark,
  HandCoins,
  Coins,
  CircleCheck,
  CircleX,
  CircleDashed,
  ListChecks,
  Split,
  Layers,
  Edit,
  Trash2,
  Settings,
  HelpCircle,
  Shield,
  Plane,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "pending" | "overdue" | "partial";
  paidAmount?: number;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
}

interface PartialPayment {
  id: string;
  bookingId: string;
  pnr: string;
  agentId: string;
  agentName: string;
  agentCompany: string;
  agentEmail: string;
  agentPhone: string;
  verified: boolean;
  passengerName: string;
  route: string;
  origin: string;
  destination: string;
  travelDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: PaymentInstallment[];
  status: "active" | "completed" | "overdue" | "cancelled";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  dueDate: string;
  currency: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// Sample Data Generator
const generatePartialPayments = (): PartialPayment[] => {
  const agents = [
    { id: "AGT001", name: "Mohamed Yahia", company: "Al Diwanya Travel", email: "yahia@aldiwanya.com", phone: "+966 50 123 4567", verified: true },
    { id: "AGT002", name: "Abdur Rehman", company: "Come Habibi Travel", email: "rehman@comehabibi.com", phone: "+971 56 550 6248", verified: false },
    { id: "AGT003", name: "Fatima Al-Hassan", company: "Sky Travel Agency", email: "fatima@skytravel.sa", phone: "+966 55 987 6543", verified: true },
    { id: "AGT004", name: "Ahmed Kamal", company: "Gulf Wings Travel", email: "ahmed@gulfwings.com", phone: "+973 36 123 456", verified: true },
    { id: "AGT005", name: "Sarah Johnson", company: "Royal Tours Qatar", email: "sarah@royaltours.qa", phone: "+974 55 789 012", verified: true },
  ];

  const routes = [
    { origin: "RUH", destination: "DAC", route: "Riyadh → Dhaka" },
    { origin: "JED", destination: "CGP", route: "Jeddah → Chittagong" },
    { origin: "DMM", destination: "ZYL", route: "Dammam → Sylhet" },
    { origin: "DXB", destination: "DAC", route: "Dubai → Dhaka" },
    { origin: "DOH", destination: "CXB", route: "Doha → Cox's Bazar" },
  ];

  const passengers = [
    "MR JOHN DOE", "MS JANE SMITH", "MR AHMED ALI", "MRS FATIMA KHAN",
    "MR KARIM HASSAN", "MS LAYLA MOHAMMED", "MR OMAR HASSAN", "MRS SARAH AHMED"
  ];

  const payments: PartialPayment[] = [];
  const statuses: PartialPayment["status"][] = ["active", "completed", "overdue", "cancelled"];

  for (let i = 0; i < 30; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const routeInfo = routes[Math.floor(Math.random() * routes.length)];
    const totalAmount = Math.floor(Math.random() * 5000) + 1500;
    const installmentCount = Math.floor(Math.random() * 3) + 2;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const installmentAmount = Math.floor(totalAmount / installmentCount);
    const installments: PaymentInstallment[] = [];
    let paidTotal = 0;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30));

    for (let j = 0; j < installmentCount; j++) {
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + (j * 7));

      const isPaid = status === "completed" || (status === "active" && j < installmentCount - 1 && Math.random() > 0.3);
      const isOverdue = !isPaid && dueDate < new Date();
      
      const installmentStatus: PaymentInstallment["status"] = 
        isPaid ? "paid" : isOverdue ? "overdue" : "pending";

      const paidAmount = isPaid ? installmentAmount : 0;
      paidTotal += paidAmount;

      installments.push({
        id: `INS${i}${j}`,
        amount: installmentAmount,
        dueDate: dueDate.toISOString().split("T")[0],
        paidDate: isPaid ? new Date(dueDate.getTime() - Math.random() * 86400000 * 2).toISOString().split("T")[0] : undefined,
        status: installmentStatus,
        paidAmount: paidAmount,
        paymentMethod: isPaid ? ["Bank Transfer", "Cash", "Credit Card", "Online"][Math.floor(Math.random() * 4)] : undefined,
        transactionRef: isPaid ? `TXN${Math.random().toString(36).substring(7).toUpperCase()}` : undefined,
      });
    }

    const travelDate = new Date();
    travelDate.setDate(travelDate.getDate() + Math.floor(Math.random() * 60) + 10);

    const createdAt = new Date(baseDate);
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 10));

    const finalDueDate = new Date(baseDate);
    finalDueDate.setDate(finalDueDate.getDate() + ((installmentCount - 1) * 7));

    payments.push({
      id: `PP${String(i + 1).padStart(4, "0")}`,
      bookingId: `POA${1000 + i}`,
      pnr: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
      agentId: agent.id,
      agentName: agent.name,
      agentCompany: agent.company,
      agentEmail: agent.email,
      agentPhone: agent.phone,
      verified: agent.verified,
      passengerName: passengers[Math.floor(Math.random() * passengers.length)],
      route: routeInfo.route,
      origin: routeInfo.origin,
      destination: routeInfo.destination,
      travelDate: travelDate.toISOString().split("T")[0],
      totalAmount,
      paidAmount: paidTotal,
      remainingAmount: totalAmount - paidTotal,
      installments,
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Admin",
      dueDate: finalDueDate.toISOString().split("T")[0],
      currency: "SAR",
    });
  }

  return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const samplePayments = generatePartialPayments();

// Helper Functions
const formatCurrency = (amount: number, currency: string = "SAR") => {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; text: string; icon: JSX.Element; label: string }> = {
    active: { bg: "bg-blue-50", text: "text-blue-700", icon: <CircleDashed size={14} />, label: "Active" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CircleCheck size={14} />, label: "Completed" },
    overdue: { bg: "bg-rose-50", text: "text-rose-700", icon: <AlertTriangle size={14} />, label: "Overdue" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-600", icon: <CircleX size={14} />, label: "Cancelled" },
    paid: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={14} />, label: "Paid" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock size={14} />, label: "Pending" },
    partial: { bg: "bg-purple-50", text: "text-purple-700", icon: <Split size={14} />, label: "Partial" },
  };
  return configs[status] || configs.pending;
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "from-emerald-500 to-emerald-600";
  if (percentage >= 75) return "from-blue-500 to-blue-600";
  if (percentage >= 50) return "from-amber-500 to-amber-600";
  if (percentage >= 25) return "from-orange-500 to-orange-600";
  return "from-rose-500 to-rose-600";
};

// Toast Component
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : toast.type === "error"
              ? "bg-rose-500 text-white"
              : toast.type === "warning"
              ? "bg-amber-500 text-white"
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

// Add Payment Modal
const AddPaymentModal = ({
  payment,
  isOpen,
  onClose,
  onSubmit,
  loading,
}: {
  payment: PartialPayment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    transactionRef: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (payment) {
      setFormData((prev) => ({
        ...prev,
        amount: payment.remainingAmount.toString(),
      }));
    }
  }, [payment]);

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <HandCoins size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Record Payment</h2>
                <p className="text-emerald-100 text-sm">For {payment.bookingId}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Remaining Balance</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(payment.remainingAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="text-lg font-semibold text-slate-600">{formatCurrency(payment.totalAmount)}</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor((payment.paidAmount / payment.totalAmount) * 100)} rounded-full`}
              style={{ width: `${(payment.paidAmount / payment.totalAmount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(payment.paidAmount)} paid ({((payment.paidAmount / payment.totalAmount) * 100).toFixed(0)}%)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">SAR</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                max={payment.remainingAmount}
                className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-lg font-semibold"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: Math.floor(payment.remainingAmount / 2).toString() })}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: Math.floor(payment.remainingAmount * 0.75).toString() })}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: payment.remainingAmount.toString() })}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition"
              >
                Full Amount
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method *</label>
              <div className="relative">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 appearance-none bg-white"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="online">Online Payment</option>
                  <option value="cheque">Cheque</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Date *</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                required
              />
            </div>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction Reference</label>
            <input
              type="text"
              value={formData.transactionRef}
              onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
              placeholder="TXN123456789"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.amount || Number(formData.amount) <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Create New Partial Payment Modal
const CreatePartialPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    bookingId: "",
    pnr: "",
    agentId: "",
    passengerName: "",
    route: "",
    travelDate: "",
    totalAmount: "",
    initialPayment: "",
    installments: "2",
    dueInterval: "7",
    notes: "",
  });

  const agents = [
    { id: "AGT001", name: "Mohamed Yahia", company: "Al Diwanya Travel" },
    { id: "AGT002", name: "Abdur Rehman", company: "Come Habibi Travel" },
    { id: "AGT003", name: "Fatima Al-Hassan", company: "Sky Travel Agency" },
    { id: "AGT004", name: "Ahmed Kamal", company: "Gulf Wings Travel" },
    { id: "AGT005", name: "Sarah Johnson", company: "Royal Tours Qatar" },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const totalAmount = Number(formData.totalAmount) || 0;
  const initialPayment = Number(formData.initialPayment) || 0;
  const remainingAmount = totalAmount - initialPayment;
  const installmentCount = Number(formData.installments) || 2;
  const installmentAmount = remainingAmount > 0 ? Math.ceil(remainingAmount / installmentCount) : 0;

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Split size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Partial Payment</h2>
                <p className="text-blue-100 text-sm">Set up installment plan for a booking</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {/* Booking Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Plane size={16} className="text-blue-500" />
                Booking Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Booking ID *</label>
                  <input
                    type="text"
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    placeholder="POA1234"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">PNR *</label>
                  <input
                    type="text"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                    placeholder="ABC123"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-mono uppercase"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Agent *</label>
              <div className="relative">
                <select
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none bg-white"
                  required
                >
                  <option value="">Select an agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.company}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Passenger & Route */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Passenger Name *</label>
                <input
                  type="text"
                  value={formData.passengerName}
                  onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                  placeholder="MR JOHN DOE"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Route *</label>
                <input
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="RUH → DAC"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 uppercase"
                  required
                />
              </div>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Travel Date *</label>
              <input
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                required
              />
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Coins size={16} className="text-emerald-500" />
                Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Amount (SAR) *</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-lg font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Payment (SAR)</label>
                  <input
                    type="number"
                    value={formData.initialPayment}
                    onChange={(e) => setFormData({ ...formData, initialPayment: e.target.value })}
                    placeholder="0"
                    max={totalAmount}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Installment Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Number of Installments *</label>
                <div className="relative">
                  <select
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none bg-white"
                    required
                  >
                    <option value="2">2 Installments</option>
                    <option value="3">3 Installments</option>
                    <option value="4">4 Installments</option>
                    <option value="5">5 Installments</option>
                    <option value="6">6 Installments</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Days Between Payments *</label>
                <div className="relative">
                  <select
                    value={formData.dueInterval}
                    onChange={(e) => setFormData({ ...formData, dueInterval: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none bg-white"
                    required
                  >
                    <option value="7">Every 7 days</option>
                    <option value="14">Every 14 days</option>
                    <option value="21">Every 21 days</option>
                    <option value="30">Every 30 days</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Installment Preview */}
            {totalAmount > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <ListChecks size={16} />
                  Payment Schedule Preview
                </h4>
                <div className="space-y-2">
                  {initialPayment > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Initial Payment (Now)</span>
                      <span className="font-semibold text-blue-800">{formatCurrency(initialPayment)}</span>
                    </div>
                  )}
                  {Array.from({ length: installmentCount }).map((_, i) => {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + (i + 1) * Number(formData.dueInterval));
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">
                          Installment {i + 1} ({formatDate(dueDate.toISOString())})
                        </span>
                        <span className="font-semibold text-blue-800">{formatCurrency(installmentAmount)}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-200 mt-2">
                    <span className="font-semibold text-blue-800">Total</span>
                    <span className="font-bold text-blue-900">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  Create Plan
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Payment Detail Modal
const PaymentDetailModal = ({
  payment,
  onClose,
  onRecordPayment,
  onSendReminder,
}: {
  payment: PartialPayment | null;
  onClose: () => void;
  onRecordPayment: (payment: PartialPayment) => void;
  onSendReminder: (payment: PartialPayment) => void;
}) => {
  const [copied, setCopied] = useState(false);

  if (!payment) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = getStatusConfig(payment.status);
  const progressPercentage = (payment.paidAmount / payment.totalAmount) * 100;
  const daysUntilDue = getDaysUntilDue(payment.dueDate);

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Receipt size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{payment.id}</h2>
                <p className="text-blue-100 text-sm">Booking: {payment.bookingId} • PNR: {payment.pnr}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Progress Section */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">Payment Progress</p>
                <p className="text-3xl font-bold text-slate-800">{progressPercentage.toFixed(0)}%</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full`}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(payment.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Paid</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(payment.paidAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Remaining</p>
                <p className="text-lg font-bold text-rose-600">{formatCurrency(payment.remainingAmount)}</p>
              </div>
            </div>
          </div>

          {/* Due Date Warning */}
          {payment.status !== "completed" && payment.status !== "cancelled" && (
            <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
              daysUntilDue < 0
                ? "bg-rose-50 border border-rose-200"
                : daysUntilDue <= 3
                ? "bg-amber-50 border border-amber-200"
                : "bg-blue-50 border border-blue-200"
            }`}>
              {daysUntilDue < 0 ? (
                <AlertTriangle size={20} className="text-rose-600" />
              ) : daysUntilDue <= 3 ? (
                <Clock size={20} className="text-amber-600" />
              ) : (
                <CalendarClock size={20} className="text-blue-600" />
              )}
              <div>
                <p className={`font-semibold ${
                  daysUntilDue < 0 ? "text-rose-700" : daysUntilDue <= 3 ? "text-amber-700" : "text-blue-700"
                }`}>
                  {daysUntilDue < 0
                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                    : daysUntilDue === 0
                    ? "Due Today"
                    : `Due in ${daysUntilDue} days`}
                </p>
                <p className="text-sm text-slate-500">Final due date: {formatDate(payment.dueDate)}</p>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Plane size={16} className="text-blue-500" />
              Booking Details
            </h3>
            <div className="bg-slate-800 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold">{payment.origin}</p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center w-full">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div className="flex-1 h-px bg-slate-500 mx-2 relative">
                      <Plane size={16} className="text-white absolute left-1/2 -translate-x-1/2 -top-2 rotate-90" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{payment.destination}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{payment.passengerName}</span>
                <span>{formatDate(payment.travelDate)}</span>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-purple-500" />
              Agent Information
            </h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {payment.agentName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{payment.agentName}</p>
                    {payment.verified && <Verified size={14} className="text-blue-500" />}
                  </div>
                  <p className="text-sm text-slate-500">{payment.agentCompany}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{payment.agentEmail}</p>
                  <p className="text-xs text-slate-400">{payment.agentPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Installments */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Layers size={16} className="text-amber-500" />
              Payment Installments
            </h3>
            <div className="space-y-3">
              {payment.installments.map((inst, index) => {
                const instStatus = getStatusConfig(inst.status);
                return (
                  <div
                    key={inst.id}
                    className={`rounded-xl p-4 border ${
                      inst.status === "paid"
                        ? "bg-emerald-50 border-emerald-200"
                        : inst.status === "overdue"
                        ? "bg-rose-50 border-rose-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          inst.status === "paid"
                            ? "bg-emerald-100"
                            : inst.status === "overdue"
                            ? "bg-rose-100"
                            : "bg-slate-100"
                        }`}>
                          {inst.status === "paid" ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : inst.status === "overdue" ? (
                            <AlertTriangle size={18} className="text-rose-600" />
                          ) : (
                            <span className="text-sm font-semibold text-slate-600">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Installment {index + 1}</p>
                          <p className="text-sm text-slate-500">Due: {formatDate(inst.dueDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{formatCurrency(inst.amount)}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${instStatus.bg} ${instStatus.text}`}>
                          {instStatus.icon}
                          {instStatus.label}
                        </span>
                      </div>
                    </div>
                    {inst.status === "paid" && (
                      <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between text-sm">
                        <span className="text-emerald-600">Paid on {formatDate(inst.paidDate!)}</span>
                        <span className="font-mono text-xs text-emerald-700">{inst.transactionRef}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(payment.id)}
              className="p-2 hover:bg-white rounded-lg transition"
              title="Copy ID"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-slate-500" />}
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
              <Printer size={18} className="text-slate-500" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {payment.status !== "completed" && payment.status !== "cancelled" && (
              <>
                <button
                  onClick={() => onSendReminder(payment)}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition flex items-center gap-2"
                >
                  <BellRing size={16} />
                  Send Reminder
                </button>
                <button
                  onClick={() => onRecordPayment(payment)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  <HandCoins size={16} />
                  Record Payment
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Export Dropdown
const ExportDropdown = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
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
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20"
            >
              <button
                onClick={() => { onExport("pdf"); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              >
                <File size={16} className="text-rose-500" />
                Export as PDF
              </button>
              <button
                onClick={() => { onExport("excel"); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3"
              >
                <FileSpreadsheet size={16} className="text-emerald-500" />
                Export as Excel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Component
export default function PartialPaymentPage() {
  // State
  const [payments, setPayments] = useState<PartialPayment[]>(samplePayments);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPayment, setSelectedPayment] = useState<PartialPayment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentForRecording, setPaymentForRecording] = useState<PartialPayment | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast helper
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate stats
  const stats = useMemo(() => {
    const active = payments.filter((p) => p.status === "active").length;
    const completed = payments.filter((p) => p.status === "completed").length;
    const overdue = payments.filter((p) => p.status === "overdue").length;
    const totalOutstanding = payments
      .filter((p) => p.status === "active" || p.status === "overdue")
      .reduce((sum, p) => sum + p.remainingAmount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalExpected = payments.reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      total: payments.length,
      active,
      completed,
      overdue,
      totalOutstanding,
      totalCollected,
      totalExpected,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
    };
  }, [payments]);

  // Unique agents for filter
  const uniqueAgents = useMemo(() => {
    const agents = new Map<string, { name: string; company: string }>();
    payments.forEach((p) => {
      if (!agents.has(p.agentId)) {
        agents.set(p.agentId, { name: p.agentName, company: p.agentCompany });
      }
    });
    return Array.from(agents.entries()).map(([id, data]) => ({ id, ...data }));
  }, [payments]);

  // Filter and search
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = payments.filter((item) => {
      const matchSearch =
        query === ""
          ? true
          : item.id.toLowerCase().includes(query) ||
            item.bookingId.toLowerCase().includes(query) ||
            item.pnr.toLowerCase().includes(query) ||
            item.agentName.toLowerCase().includes(query) ||
            item.passengerName.toLowerCase().includes(query);

      const matchStatus = statusFilter ? item.status === statusFilter : true;
      const matchAgent = agentFilter ? item.agentId === agentFilter : true;

      let matchDateFrom = true;
      let matchDateTo = true;
      if (dateFrom) {
        matchDateFrom = new Date(item.createdAt) >= new Date(dateFrom);
      }
      if (dateTo) {
        matchDateTo = new Date(item.createdAt) <= new Date(dateTo + "T23:59:59");
      }

      return matchSearch && matchStatus && matchAgent && matchDateFrom && matchDateTo;
    });

    // Sorting
    if (sortBy) {
      result = [...result].sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === "createdAt" || sortBy === "dueDate") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB?.toLowerCase() || "";
        }

        if (sortOrder === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    return result;
  }, [searchQuery, statusFilter, agentFilter, payments, sortBy, sortOrder, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Handlers
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("");
    setAgentFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
    addToast("Filters cleared", "info");
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPayments(generatePartialPayments());
      setLoading(false);
      addToast("Data refreshed!", "success");
    }, 1000);
  };

  const handleExport = (format: string) => {
    addToast(`Exporting as ${format.toUpperCase()}...`, "info");
    setTimeout(() => {
      addToast(`Export completed!`, "success");
    }, 1500);
  };

  const handleViewPayment = (payment: PartialPayment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleRecordPayment = (payment: PartialPayment) => {
    setPaymentForRecording(payment);
    setShowDetailModal(false);
    setShowAddPaymentModal(true);
  };

  const handleSendReminder = (payment: PartialPayment) => {
    addToast(`Payment reminder sent to ${payment.agentName}`, "success");
  };

  const handleRecordPaymentSubmit = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      if (paymentForRecording) {
        const amount = Number(data.amount);
        setPayments((prev) =>
          prev.map((p) => {
            if (p.id === paymentForRecording.id) {
              const newPaidAmount = p.paidAmount + amount;
              const newRemainingAmount = p.totalAmount - newPaidAmount;
              return {
                ...p,
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                status: newRemainingAmount <= 0 ? "completed" : p.status,
              };
            }
            return p;
          })
        );
        addToast(`Payment of ${formatCurrency(amount)} recorded successfully!`, "success");
      }
      setShowAddPaymentModal(false);
      setPaymentForRecording(null);
      setLoading(false);
    }, 1000);
  };

  const handleCreatePartialPayment = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      addToast("Partial payment plan created successfully!", "success");
      setShowCreateModal(false);
      setLoading(false);
    }, 1000);
  };

  const activeFilterCount = [statusFilter, agentFilter, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Split size={22} className="text-white" />
              </div>
              Partial Payments
            </h1>
            <p className="text-slate-500 mt-1">
              Manage installment plans and track payment collections
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <ExportDropdown onExport={handleExport} />
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
            >
              <PlusCircle size={16} />
              Create Plan
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4"
        >
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Plans</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Layers size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <CircleDashed size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CircleCheck size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Overdue</p>
                <p className="text-2xl font-bold text-rose-600">{stats.overdue}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Outstanding</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(stats.totalOutstanding)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Coins size={20} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Collected</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalCollected)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <HandCoins size={20} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Collection Rate</p>
                <p className="text-2xl font-bold text-white">{stats.collectionRate.toFixed(1)}%</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by ID, booking, PNR, agent..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
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

            {/* Filters */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 bg-white cursor-pointer min-w-[130px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Agent Filter */}
              <div className="relative">
                <select
                  value={agentFilter}
                  onChange={(e) => {
                    setAgentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 bg-white cursor-pointer min-w-[150px]"
                >
                  <option value="">All Agents</option>
                  {uniqueAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* More Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${
                  showFilters
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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

          {/* Extended Filters */}
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
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Date To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
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
        </motion.div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{paginatedData.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{filteredData.length}</span> payment plans
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white appearance-none pr-8 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading payment plans...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Plan ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((payment) => {
                      const statusConfig = getStatusConfig(payment.status);
                      const progressPercentage = (payment.paidAmount / payment.totalAmount) * 100;
                      const daysUntilDue = getDaysUntilDue(payment.dueDate);

                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-50/80 transition group"
                        >
                          {/* Plan ID */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleViewPayment(payment)}
                              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            >
                              <Receipt size={12} />
                              {payment.id}
                            </button>
                          </td>

                          {/* Booking */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">{payment.bookingId}</p>
                              <p className="text-xs text-slate-400">PNR: {payment.pnr}</p>
                            </div>
                          </td>

                          {/* Agent */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {payment.agentName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium text-slate-800">{payment.agentName}</p>
                                  {payment.verified && <Verified size={12} className="text-blue-500" />}
                                </div>
                                <p className="text-xs text-slate-400">{payment.agentCompany}</p>
                              </div>
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="px-4 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-600">
                                  {formatCurrency(payment.paidAmount)}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {progressPercentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                of {formatCurrency(payment.totalAmount)}
                              </p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm text-slate-700">{formatDate(payment.dueDate)}</p>
                              {payment.status !== "completed" && payment.status !== "cancelled" && (
                                <p className={`text-xs font-medium ${
                                  daysUntilDue < 0
                                    ? "text-rose-600"
                                    : daysUntilDue <= 3
                                    ? "text-amber-600"
                                    : "text-slate-400"
                                }`}>
                                  {daysUntilDue < 0
                                    ? `${Math.abs(daysUntilDue)} days overdue`
                                    : daysUntilDue === 0
                                    ? "Due today"
                                    : `${daysUntilDue} days left`}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Remaining */}
                          <td className="px-4 py-4 text-right">
                            <p className={`font-bold ${payment.remainingAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {formatCurrency(payment.remainingAmount)}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewPayment(payment)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                title="View details"
                              >
                                <Eye size={16} className="text-slate-500" />
                              </button>
                              {payment.status !== "completed" && payment.status !== "cancelled" && (
                                <button
                                  onClick={() => handleRecordPayment(payment)}
                                  className="p-2 hover:bg-emerald-50 rounded-lg transition"
                                  title="Record payment"
                                >
                                  <HandCoins size={16} className="text-emerald-600" />
                                </button>
                              )}
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                                <MoreHorizontal size={16} className="text-slate-500" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Split size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No payment plans found</p>
                          <p className="text-slate-400 text-sm mt-1">
                            Try adjusting your search or filters
                          </p>
                          <button
                            onClick={handleReset}
                            className="mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition flex items-center gap-2"
                          >
                            <RotateCcw size={16} />
                            Reset Filters
                          </button>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
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

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                  let pageNum;
                  const total = totalPages || 1;
                  if (total <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= total - 2) {
                    pageNum = total - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        page === pageNum
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
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

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedPayment && (
          <PaymentDetailModal
            payment={selectedPayment}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPayment(null);
            }}
            onRecordPayment={handleRecordPayment}
            onSendReminder={handleSendReminder}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPaymentModal && paymentForRecording && (
          <AddPaymentModal
            payment={paymentForRecording}
            isOpen={showAddPaymentModal}
            onClose={() => {
              setShowAddPaymentModal(false);
              setPaymentForRecording(null);
            }}
            onSubmit={handleRecordPaymentSubmit}
            loading={loading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <CreatePartialPaymentModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePartialPayment}
            loading={loading}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}