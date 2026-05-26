"use client";

import { useState, useEffect, useMemo} from "react";
import React from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  FileText,
  Calendar,
  User,
  Hash,
  MessageSquare,
  Shield,
  Info,
  Printer,
  Mail,
  Copy,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  History,
  Wallet,
  BadgeCheck,
  Ban,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";

// 🔥 Type Definitions
interface DepositRequest {
  id: string;
  requestId: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  amount: number;
  method: "bkash" | "nagad" | "rocket" | "bank";
  accountNumber: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  attachmentUrl?: string;
  previousBalance?: number;
  newBalance?: number;
}

interface SortConfig {
  key: keyof DepositRequest | null;
  direction: "asc" | "desc";
}

// 🔥 Sample Data
const sampleDepositData: DepositRequest[] = [
  {
    id: "1",
    requestId: "DEP-20241225-001",
    agentId: "AG001",
    agentName: "Rakib Hassan",
    agentPhone: "01712345678",
    agentEmail: "rakib@example.com",
    amount: 15000,
    method: "bkash",
    accountNumber: "01712345678",
    transactionId: "BKX1234567890",
    status: "pending",
    requestedAt: "2024-12-25 10:30:00",
    previousBalance: 5000,
  },
  {
    id: "2",
    requestId: "DEP-20241224-042",
    agentId: "AG023",
    agentName: "Sadia Rahman",
    agentPhone: "01898765432",
    agentEmail: "sadia@example.com",
    amount: 25000,
    method: "nagad",
    accountNumber: "01898765432",
    transactionId: "NGD9876543210",
    status: "approved",
    requestedAt: "2024-12-24 16:45:00",
    reviewedBy: "Admin",
    reviewedAt: "2024-12-24 17:10:00",
    previousBalance: 10000,
    newBalance: 35000,
  },
  {
    id: "3",
    requestId: "DEP-20241223-019",
    agentId: "AG007",
    agentName: "Karim Sheikh",
    agentPhone: "01556789012",
    agentEmail: "karim@example.com",
    amount: 8000,
    method: "rocket",
    accountNumber: "01556789012",
    transactionId: "RKT1122334455",
    status: "rejected",
    requestedAt: "2024-12-23 09:15:00",
    reviewedBy: "Manager",
    reviewedAt: "2024-12-23 11:20:00",
    notes: "Invalid Transaction ID - No matching record found",
    previousBalance: 2000,
  },
  {
    id: "4",
    requestId: "DEP-20241225-002",
    agentId: "AG015",
    agentName: "Fatima Begum",
    agentPhone: "01623456789",
    agentEmail: "fatima@example.com",
    amount: 50000,
    method: "bank",
    accountNumber: "1234567890123",
    transactionId: "DBBL20241225001",
    status: "pending",
    requestedAt: "2024-12-25 11:00:00",
    previousBalance: 25000,
  },
  {
    id: "5",
    requestId: "DEP-20241224-018",
    agentId: "AG032",
    agentName: "Abdul Kadir",
    agentPhone: "01934567890",
    agentEmail: "kadir@example.com",
    amount: 12000,
    method: "bkash",
    accountNumber: "01934567890",
    transactionId: "BKX5566778899",
    status: "approved",
    requestedAt: "2024-12-24 14:20:00",
    reviewedBy: "Admin",
    reviewedAt: "2024-12-24 14:45:00",
    previousBalance: 8000,
    newBalance: 20000,
  },
  {
    id: "6",
    requestId: "DEP-20241225-003",
    agentId: "AG008",
    agentName: "Nusrat Jahan",
    agentPhone: "01845678901",
    agentEmail: "nusrat@example.com",
    amount: 30000,
    method: "nagad",
    accountNumber: "01845678901",
    transactionId: "NGD2233445566",
    status: "pending",
    requestedAt: "2024-12-25 12:15:00",
    previousBalance: 15000,
  },
  {
    id: "7",
    requestId: "DEP-20241222-055",
    agentId: "AG019",
    agentName: "Mizanur Rahman",
    agentPhone: "01756789012",
    agentEmail: "mizan@example.com",
    amount: 5000,
    method: "rocket",
    accountNumber: "01756789012",
    transactionId: "RKT9988776655",
    status: "rejected",
    requestedAt: "2024-12-22 08:30:00",
    reviewedBy: "Admin",
    reviewedAt: "2024-12-22 10:00:00",
    notes: "Duplicate request - Already processed",
    previousBalance: 3000,
  },
  {
    id: "8",
    requestId: "DEP-20241225-004",
    agentId: "AG041",
    agentName: "Tasnim Ahmed",
    agentPhone: "01667890123",
    agentEmail: "tasnim@example.com",
    amount: 100000,
    method: "bank",
    accountNumber: "9876543210987",
    transactionId: "BRAC20241225002",
    status: "pending",
    requestedAt: "2024-12-25 09:45:00",
    previousBalance: 50000,
  },
];

// 🔥 Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function AccountManagementPage() {
  // States
  const [data, setData] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "requestedAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" } | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(sampleDepositData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        showToast("Failed to load data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show Toast
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setData(sampleDepositData);
    setRefreshing(false);
    showToast("Data refreshed successfully", "success");
  };

  // Handle Sort
  const handleSort = (key: keyof DepositRequest) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle View
  const handleView = (request: DepositRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  // Handle Approve Click
  const handleApproveClick = (request: DepositRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  // Handle Reject Click
  const handleRejectClick = (request: DepositRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  // Confirm Approve
  const confirmApprove = () => {
    if (!selectedRequest) return;

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id
          ? {
              ...item,
              status: "approved" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date().toLocaleString("en-GB"),
              newBalance: (item.previousBalance || 0) + item.amount,
            }
          : item
      )
    );

    setShowApproveModal(false);
    setSelectedRequest(null);
    showToast(`৳${selectedRequest.amount.toLocaleString()} approved for ${selectedRequest.agentName}`, "success");
  };

  // Confirm Reject
  const confirmReject = () => {
    if (!selectedRequest) return;

    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id
          ? {
              ...item,
              status: "rejected" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date().toLocaleString("en-GB"),
              notes: rejectReason || "Request rejected by admin",
            }
          : item
      )
    );

    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason("");
    showToast("Request rejected", "error");
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((item) => item.id));
    }
  };

  // Handle Bulk Approve
  const handleBulkApprove = () => {
    if (selectedItems.length === 0) return;

    setData((prev) =>
      prev.map((item) =>
        selectedItems.includes(item.id) && item.status === "pending"
          ? {
              ...item,
              status: "approved" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date().toLocaleString("en-GB"),
              newBalance: (item.previousBalance || 0) + item.amount,
            }
          : item
      )
    );

    showToast(`${selectedItems.length} requests approved`, "success");
    setSelectedItems([]);
  };

  // Handle Export
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const headers = ["Request ID", "Agent", "Amount", "Method", "Transaction ID", "Status", "Date"];
    const rows = filteredData.map((item) => [
      item.requestId,
      item.agentName,
      item.amount,
      item.method,
      item.transactionId,
      item.status,
      item.requestedAt,
    ]);

    if (format === "csv") {
      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deposit-requests-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
    showToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  // Clear Filters
  const clearFilters = () => {
    setFilterMethod("all");
    setSearchTerm("");
    setActiveTab("all");
  };

  // Filtered Data
 // Filtered Data
const filteredData = useMemo(() => {
  let result = [...data];

  // Filter by status
  if (activeTab !== "all") {
    result = result.filter((item) => item.status === activeTab);
  }

  // Filter by payment method
  if (filterMethod !== "all") {
    result = result.filter((item) => item.method === filterMethod);
  }

  // Search
  if (debouncedSearch.trim()) {
    const search = debouncedSearch.toLowerCase();

    result = result.filter((item) =>
      item.requestId.toLowerCase().includes(search) ||
      item.agentName.toLowerCase().includes(search) ||
      item.agentId.toLowerCase().includes(search) ||
      item.agentPhone.toLowerCase().includes(search) ||
      item.agentEmail.toLowerCase().includes(search) ||
      item.transactionId.toLowerCase().includes(search) ||
      item.accountNumber.toLowerCase().includes(search)
    );
  }

  // Sorting
  if (sortConfig.key) {
    result.sort((a, b) => {
      const key = sortConfig.key!;

      const aVal = a[key];
      const bVal = b[key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bVal == null) return sortConfig.direction === "asc" ? -1 : 1;

      // Number sorting
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      // String sorting
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  return result;
}, [data, activeTab, filterMethod, debouncedSearch, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Statistics
  const stats = useMemo(() => {
    const total = data.length;
    const pending = data.filter((d) => d.status === "pending").length;
    const approved = data.filter((d) => d.status === "approved").length;
    const rejected = data.filter((d) => d.status === "rejected").length;
    const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);
    const pendingAmount = data.filter((d) => d.status === "pending").reduce((sum, d) => sum + d.amount, 0);
    const approvedAmount = data.filter((d) => d.status === "approved").reduce((sum, d) => sum + d.amount, 0);
    const todayRequests = data.filter((d) => d.requestedAt.includes("2024-12-25")).length;

    return { total, pending, approved, rejected, totalAmount, pendingAmount, approvedAmount, todayRequests };
  }, [data]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterMethod !== "all") count++;
    return count;
  }, [filterMethod]);

// Method Icon
const MethodIcon = ({ method }: { method: string }) => {
  const icons: Record<string, React.ReactElement> = {
    bkash: <Smartphone className="text-pink-600" size={18} />,
    nagad: <Smartphone className="text-orange-600" size={18} />,
    rocket: <Smartphone className="text-purple-600" size={18} />,
    upay: <Smartphone className="text-blue-600" size={18} />,
    bank: <Building2 className="text-indigo-600" size={18} />,
    cash: <Wallet className="text-green-600" size={18} />,
  };
  return icons[method.toLowerCase()] || <Wallet className="text-gray-600" size={18} />;
};

  // Method Badge
  const MethodBadge = ({ method }: { method: string }) => {
    const styles: Record<string, string> = {
      bkash: "bg-pink-100 text-pink-700 border-pink-200",
      nagad: "bg-orange-100 text-orange-700 border-orange-200",
      rocket: "bg-purple-100 text-purple-700 border-purple-200",
      bank: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${styles[method]}`}>
        <MethodIcon method={method} />
        {method}
      </span>
    );
  };

  // Status Badge
  const StatusBadge = ({ status }: { status: DepositRequest["status"] }) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Sort Icon
  const SortIcon = ({ column }: { column: keyof DepositRequest }) => {
    if (sortConfig.key !== column) {
      return (
        <div className="flex flex-col opacity-40">
          <ChevronUp className="w-3 h-3 -mb-1" />
          <ChevronDown className="w-3 h-3" />
        </div>
      );
    }
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Format Currency
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-16 bg-gray-200 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔥 TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-300 ${
            toast.type === "success" ? "bg-emerald-500 text-white" : toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
          }`}
        >
          {toast.type === "success" && <CheckCircle size={20} />}
          {toast.type === "error" && <XCircle size={20} />}
          {toast.type === "info" && <Info size={20} />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={18} />
          </button>
        </div>
      )}

      {/* 🔥 HEADER */}
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
                Agent Deposit Requests • <span className="text-emerald-300">{stats.pending} pending</span> •{" "}
                <span className="text-white/80">{stats.todayRequests} today</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition text-sm font-medium border border-white/20">
                <Download size={16} />
                Export
                <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => handleExport("csv")} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                  <FileText size={16} className="text-green-600" />
                  Export CSV
                </button>
                <button onClick={() => handleExport("excel")} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  Export Excel
                </button>
                <button onClick={() => handleExport("pdf")} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                  <FileDown size={16} className="text-red-600" />
                  Export PDF
                </button>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition text-sm font-medium border border-white/20 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#021f3b] rounded-xl hover:bg-blue-50 transition text-sm font-bold shadow-lg">
              <Plus size={16} />
              Manual Deposit
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Requests */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Requests</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <ArrowUpRight size={12} />
                +{stats.todayRequests} today
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition">
              <FileText size={22} className="text-white" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-2">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg group-hover:scale-110 transition">
              <Clock size={22} className="text-white" />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Approved</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.approved}</p>
              <p className="text-xs text-emerald-600 mt-2">{formatCurrency(stats.approvedAmount)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition">
              <BadgeCheck size={22} className="text-white" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              <p className="text-xs text-gray-500 mt-2">Requires review</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition">
              <Ban size={22} className="text-white" />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Volume</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats.totalAmount)}</p>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp size={12} />
                +18.5% this week
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition">
              <DollarSign size={22} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 TABS & SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "all" ? "bg-[#021f3b] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Requests ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "pending" ? "bg-amber-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock size={16} />
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "approved" ? "bg-emerald-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CheckCircle size={16} />
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "rejected" ? "bg-red-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <XCircle size={16} />
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-lg">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Agent, Request ID, Transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition text-sm font-medium ${
                  showFilters || activeFiltersCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={16} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">{activeFiltersCount}</span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {/* Bulk Actions & Items Per Page */}
            <div className="flex items-center gap-3">
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                  <span className="text-sm text-blue-700 font-medium">{selectedItems.length} selected</span>
                  <div className="h-4 w-px bg-blue-200" />
                  <button onClick={handleBulkApprove} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition" title="Approve Selected">
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => setSelectedItems([])} className="p-1.5 text-gray-500 hover:text-gray-700 transition">
                    <X size={16} />
                  </button>
                </div>
              )}

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Payment Method</label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Methods</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Date Range</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Min Amount</label>
                <input type="number" placeholder="৳0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Max Amount</label>
                <input type="number" placeholder="৳100,000" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/30 text-blue-600 focus:ring-blue-500 bg-white/10"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition" onClick={() => handleSort("requestId")}>
                  <div className="flex items-center gap-2">
                    Request ID
                    <SortIcon column="requestId" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition" onClick={() => handleSort("agentName")}>
                  <div className="flex items-center gap-2">
                    Agent
                    <SortIcon column="agentName" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-2">
                    Amount
                    <SortIcon column="amount" />
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Method</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Transaction ID</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition" onClick={() => handleSort("requestedAt")}>
                  <div className="flex items-center justify-center gap-2">
                    Date & Time
                    <SortIcon column="requestedAt" />
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-gray-100 rounded-full">
                        <FileText size={48} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold text-lg">No requests found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                      <button onClick={clearFilters} className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/50 transition group ${selectedItems.includes(item.id) ? "bg-blue-50" : ""} ${
                      item.status === "pending" ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter((id) => id !== item.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-semibold text-[#021f3b] bg-blue-50 px-2 py-1 rounded">{item.requestId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {item.agentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.agentName}</p>
                          <p className="text-xs text-gray-500">{item.agentId} • {item.agentPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <MethodBadge method={item.method} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-700">{item.transactionId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.transactionId);
                            showToast("Transaction ID copied!", "info");
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{formatDate(item.requestedAt)}</p>
                        <p className="text-xs text-gray-500">{formatTime(item.requestedAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* View */}
                        <button onClick={() => handleView(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="View Details">
                          <Eye size={18} />
                        </button>

                        {/* Approve/Reject only for pending */}
                        {item.status === "pending" && (
                          <>
                            <button onClick={() => handleApproveClick(item)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleRejectClick(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{" "}
              <span className="font-semibold text-gray-700">{filteredData.length}</span> requests
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                <ChevronLeft size={16} className="-ml-3" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                        currentPage === pageNum ? "bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white shadow-lg" : "hover:bg-white border border-gray-200 text-gray-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
                <ChevronRight size={16} className="-ml-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 VIEW DETAIL MODAL */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] p-6 text-white sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">Deposit Request Details</h2>
                  <p className="text-blue-200 text-sm">{selectedRequest.requestId}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl flex items-center justify-between ${
                  selectedRequest.status === "pending"
                    ? "bg-amber-50 border border-amber-200"
                    : selectedRequest.status === "approved"
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedRequest.status === "pending" && <Clock className="text-amber-600" size={24} />}
                  {selectedRequest.status === "approved" && <CheckCircle className="text-emerald-600" size={24} />}
                  {selectedRequest.status === "rejected" && <XCircle className="text-red-600" size={24} />}
                  <div>
                    <p className="font-semibold capitalize">{selectedRequest.status}</p>
                    {selectedRequest.reviewedAt && <p className="text-xs text-gray-500">Reviewed at {selectedRequest.reviewedAt}</p>}
                  </div>
                </div>
                <StatusBadge status={selectedRequest.status} />
              </div>

              {/* Agent Info */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Agent Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Agent ID</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.agentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Agent Name</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.agentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.agentPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800">{selectedRequest.agentEmail}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-purple-600" />
                  Transaction Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-2xl font-bold text-[#021f3b]">{formatCurrency(selectedRequest.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method</span>
                    <MethodBadge method={selectedRequest.method} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Number</span>
                    <span className="font-mono font-semibold">{selectedRequest.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-blue-600">{selectedRequest.transactionId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRequest.transactionId);
                          showToast("Copied!", "info");
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Request Date</span>
                    <span className="font-semibold">{selectedRequest.requestedAt}</span>
                  </div>
                </div>
              </div>

              {/* Balance Info */}
              {(selectedRequest.previousBalance !== undefined || selectedRequest.newBalance !== undefined) && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wallet size={18} className="text-blue-600" />
                    Balance Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Previous Balance</p>
                      <p className="text-lg font-bold text-gray-700">{formatCurrency(selectedRequest.previousBalance || 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Deposit Amount</p>
                      <p className="text-lg font-bold text-emerald-600">+{formatCurrency(selectedRequest.amount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">New Balance</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedRequest.newBalance !== undefined ? formatCurrency(selectedRequest.newBalance) : formatCurrency((selectedRequest.previousBalance || 0) + selectedRequest.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <MessageSquare size={18} className="text-red-600" />
                    Admin Notes
                  </h3>
                  <p className="text-gray-700">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Review Info */}
              {selectedRequest.reviewedBy && (
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-gray-600" />
                    Review Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reviewed By</p>
                      <p className="font-semibold text-gray-800">{selectedRequest.reviewedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reviewed At</p>
                      <p className="font-semibold text-gray-800">{selectedRequest.reviewedAt}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {selectedRequest.status === "pending" && (
              <div className="bg-gray-50 p-6 flex gap-3 justify-end border-t sticky bottom-0">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRejectClick(selectedRequest);
                  }}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleApproveClick(selectedRequest);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 APPROVE CONFIRMATION MODAL */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Approve Deposit Request?</h2>
              <p className="text-gray-600 mb-4">
                You are about to approve <span className="font-bold text-emerald-600">{formatCurrency(selectedRequest.amount)}</span> for{" "}
                <span className="font-semibold">{selectedRequest.agentName}</span>
              </p>

              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Previous Balance:</span>
                  <span className="font-semibold">{formatCurrency(selectedRequest.previousBalance || 0)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Deposit Amount:</span>
                  <span className="font-semibold text-emerald-600">+{formatCurrency(selectedRequest.amount)}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm">
                  <span className="text-gray-500">New Balance:</span>
                  <span className="font-bold text-blue-600">{formatCurrency((selectedRequest.previousBalance || 0) + selectedRequest.amount)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
                <button onClick={confirmApprove} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold">
                  Confirm Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 REJECT CONFIRMATION MODAL */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Reject Deposit Request?</h2>
              <p className="text-gray-600 mb-4 text-center">
                You are about to reject <span className="font-bold text-red-600">{formatCurrency(selectedRequest.amount)}</span> from{" "}
                <span className="font-semibold">{selectedRequest.agentName}</span>
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button onClick={confirmReject} disabled={!rejectReason.trim()} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}