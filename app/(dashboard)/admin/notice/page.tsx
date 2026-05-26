"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Search,
  Plus,
  Edit2,
  Eye,
  X,
  Bell,
  BellRing,
  Pin,
  PinOff,
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Megaphone,
  Calendar,
  Clock,
  User,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Send,
  Archive,
  Copy,
  Globe,
  Lock,
  Users,
  FileText,
  TrendingUp,
  MoreVertical,
} from "lucide-react";

// 🔥 Types
interface Notice {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "urgent" | "success" | "announcement";
  priority: "low" | "medium" | "high";
  status: "draft" | "published" | "archived";
  isPinned: boolean;
  audience: "all" | "agents" | "managers" | "admins";
  createdBy: string;
  createdAt: string;
  viewCount: number;
}

interface SortConfig {
  key: keyof Notice | null;
  direction: "asc" | "desc";
}

// 🔥 Sample Data
const sampleNotices: Notice[] = [
  {
    id: 1,
    title: "System Maintenance Scheduled",
    content: "The system will undergo maintenance on January 30th from 2:00 AM to 4:00 AM UTC.",
    type: "warning",
    priority: "high",
    status: "published",
    isPinned: true,
    audience: "all",
    createdBy: "System Admin",
    createdAt: "2024-01-28T10:30:00.000Z",
    viewCount: 1250,
  },
  {
    id: 2,
    title: "New Airline Partnership - Emirates",
    content: "We're excited to announce our new partnership with Emirates Airlines!",
    type: "announcement",
    priority: "high",
    status: "published",
    isPinned: true,
    audience: "agents",
    createdBy: "Marketing Team",
    createdAt: "2024-01-27T14:00:00.000Z",
    viewCount: 3420,
  },
  {
    id: 3,
    title: "Commission Rate Update",
    content: "Effective February 1st, commission rates for international flights will be increased.",
    type: "success",
    priority: "medium",
    status: "published",
    isPinned: false,
    audience: "agents",
    createdBy: "Finance Team",
    createdAt: "2024-01-25T09:00:00.000Z",
    viewCount: 2180,
  },
  {
    id: 4,
    title: "New Feature: Bulk Booking",
    content: "Introducing bulk booking feature! You can now book multiple tickets at once.",
    type: "info",
    priority: "medium",
    status: "published",
    isPinned: false,
    audience: "all",
    createdBy: "Product Team",
    createdAt: "2024-01-24T16:45:00.000Z",
    viewCount: 1890,
  },
  {
    id: 5,
    title: "Security Alert: Update Your Password",
    content: "Please update your password if you haven't done so in the last 90 days.",
    type: "urgent",
    priority: "high",
    status: "published",
    isPinned: false,
    audience: "all",
    createdBy: "Security Team",
    createdAt: "2024-01-23T08:00:00.000Z",
    viewCount: 4560,
  },
  {
    id: 6,
    title: "Holiday Schedule Notice",
    content: "Please note our support team will have limited availability during holidays.",
    type: "info",
    priority: "low",
    status: "draft",
    isPinned: false,
    audience: "all",
    createdBy: "HR Team",
    createdAt: "2024-01-22T12:00:00.000Z",
    viewCount: 0,
  },
];

export default function NoticePage() {
  // States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "desc" });
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as Notice["type"],
    priority: "medium" as Notice["priority"],
    audience: "all" as Notice["audience"],
  });

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" } | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNotices(sampleNotices);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Show toast
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNotices(sampleNotices);
    setRefreshing(false);
    showToast("Notices refreshed", "success");
  };

  // Sort
  const handleSort = (key: keyof Notice) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Save notice
  const handleSave = () => {
    if (!formData.title || !formData.content) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (editMode && selectedNotice) {
      setNotices(notices.map((n) => (n.id === selectedNotice.id ? { ...n, ...formData } : n)));
      showToast("Notice updated successfully", "success");
    } else {
      const newNotice: Notice = {
        id: Math.max(...notices.map((n) => n.id)) + 1,
        ...formData,
        status: "draft",
        isPinned: false,
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
        viewCount: 0,
      };
      setNotices([newNotice, ...notices]);
      showToast("Notice created successfully", "success");
    }

    setShowAddModal(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: "", content: "", type: "info", priority: "medium", audience: "all" });
    setEditMode(false);
    setSelectedNotice(null);
  };

  // Edit
  const handleEdit = (notice: Notice) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      priority: notice.priority,
      audience: notice.audience,
    });
    setSelectedNotice(notice);
    setEditMode(true);
    setShowAddModal(true);
  };

  // Delete
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(notices.filter((n) => n.id !== id));
      showToast("Notice deleted", "success");
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedItems.length} notices?`)) {
      setNotices(notices.filter((n) => !selectedItems.includes(n.id)));
      setSelectedItems([]);
      showToast(`${selectedItems.length} notices deleted`, "success");
    }
  };

  // Toggle pin
  const togglePin = (id: number) => {
    setNotices(notices.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  // Toggle status
  const toggleStatus = (id: number, status: Notice["status"]) => {
    setNotices(notices.map((n) => (n.id === id ? { ...n, status } : n)));
    showToast(`Notice ${status}`, "success");
  };

  // View
  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((n) => n.id));
    }
  };

  // Duplicate
  const handleDuplicate = (notice: Notice) => {
    const newNotice: Notice = {
      ...notice,
      id: Math.max(...notices.map((n) => n.id)) + 1,
      title: `${notice.title} (Copy)`,
      status: "draft",
      isPinned: false,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    };
    setNotices([newNotice, ...notices]);
    showToast("Notice duplicated", "success");
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterPriority !== "all") count++;
    return count;
  }, [filterType, filterStatus, filterPriority]);

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    let result = [...notices];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(searchLower) || n.content.toLowerCase().includes(searchLower)
      );
    }

    if (filterType !== "all") result = result.filter((n) => n.type === filterType);
    if (filterStatus !== "all") result = result.filter((n) => n.status === filterStatus);
    if (filterPriority !== "all") result = result.filter((n) => n.priority === filterPriority);

    // Sort - pinned first
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortConfig.key) {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [notices, search, filterType, filterStatus, filterPriority, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const stats = useMemo(
    () => ({
      total: notices.length,
      published: notices.filter((n) => n.status === "published").length,
      draft: notices.filter((n) => n.status === "draft").length,
      urgent: notices.filter((n) => n.type === "urgent").length,
      pinned: notices.filter((n) => n.isPinned).length,
      totalViews: notices.reduce((sum, n) => sum + n.viewCount, 0),
    }),
    [notices]
  );

  // Configs
  const typeConfig = {
    info: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Info size={14} /> },
    warning: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertTriangle size={14} /> },
    urgent: { color: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle size={14} /> },
    success: { color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle size={14} /> },
    announcement: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Megaphone size={14} /> },
  };

  const priorityConfig = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-600",
    high: "bg-red-100 text-red-600",
  };

  const statusConfig = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-100 text-green-600",
    archived: "bg-orange-100 text-orange-600",
  };

  const audienceConfig = {
    all: { icon: <Globe size={14} />, label: "Everyone" },
    agents: { icon: <Users size={14} />, label: "Agents" },
    managers: { icon: <User size={14} />, label: "Managers" },
    admins: { icon: <Lock size={14} />, label: "Admins" },
  };

  // Sort Icon
  const SortIcon = ({ column }: { column: keyof Notice }) => {
    if (sortConfig.key !== column) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="w-3 h-3 text-gray-300 -mb-1" />
          <ChevronDown className="w-3 h-3 text-gray-300" />
        </div>
      );
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-white" />
    ) : (
      <ChevronDown className="w-4 h-4 text-white" />
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-16 bg-gray-200 rounded-xl" />
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔥 TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 🔥 HEADER */}
      <div className="bg-white border border-gray-200 px-6 py-5 mb-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Notice Management</h1>
              <p className="text-sm text-gray-500">Manage announcements and notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white rounded-lg hover:from-[#0a3a6b] hover:to-[#0a4d8c] transition text-sm font-medium shadow-lg"
            >
              <Plus size={16} />
              Add Notice
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total Notices", value: stats.total, icon: <FileText size={20} />, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.published, icon: <CheckCircle size={20} />, color: "from-green-500 to-green-600" },
          { label: "Draft", value: stats.draft, icon: <Edit2 size={20} />, color: "from-gray-500 to-gray-600" },
          { label: "Urgent", value: stats.urgent, icon: <AlertCircle size={20} />, color: "from-red-500 to-red-600" },
          { label: "Pinned", value: stats.pinned, icon: <Pin size={20} />, color: "from-purple-500 to-purple-600" },
          { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: <Eye size={20} />, color: "from-cyan-500 to-cyan-600" },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white group-hover:scale-110 transition shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition text-sm font-medium ${
                showFilters || activeFiltersCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Filter size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">{selectedItems.length} selected</span>
                <button onClick={handleBulkDelete} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                  <Trash2 size={14} />
                </button>
                <button onClick={() => setSelectedItems([])} className="p-1.5 text-gray-500 hover:text-gray-700">
                  <X size={14} />
                </button>
              </div>
            )}

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
                <option value="success">Success</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white">
              <tr>
                <th className="px-4 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-4 py-4 text-left w-12"></th>
                <th
                  className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Notice
                    <SortIcon column="title" />
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Priority</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Audience</th>
                <th
                  className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition"
                  onClick={() => handleSort("viewCount")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Views
                    <SortIcon column="viewCount" />
                  </div>
                </th>
                <th
                  className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Created
                    <SortIcon column="createdAt" />
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Bell size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No notices found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((notice) => (
                  <tr
                    key={notice.id}
                    className={`hover:bg-blue-50/50 transition group ${
                      selectedItems.includes(notice.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(notice.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, notice.id]);
                          } else {
                            setSelectedItems(selectedItems.filter((id) => id !== notice.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePin(notice.id)}
                        className={`p-1 rounded transition ${
                          notice.isPinned ? "text-purple-500" : "text-gray-300 hover:text-purple-500"
                        }`}
                      >
                        <Pin size={16} className={notice.isPinned ? "fill-current" : ""} />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{notice.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{notice.content}</p>
                        <p className="text-xs text-gray-400 mt-1">by {notice.createdBy}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig[notice.type].color}`}>
                        {typeConfig[notice.type].icon}
                        {notice.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[notice.priority]}`}>
                        {notice.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[notice.status]}`}>
                        {notice.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        {audienceConfig[notice.audience].icon}
                        {audienceConfig[notice.audience].label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Eye size={14} />
                        {notice.viewCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleView(notice)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(notice)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-medium text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium text-gray-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{" "}
              <span className="font-medium text-gray-700">{filteredData.length}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                <ChevronLeft size={16} className="-ml-3" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
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
                      className={`w-9 h-9 rounded-lg font-medium text-sm transition ${
                        currentPage === pageNum
                          ? "bg-[#021f3b] text-white shadow"
                          : "hover:bg-gray-100 text-gray-600"
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
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
                <ChevronRight size={16} className="-ml-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 ADD/EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editMode ? "bg-blue-100" : "bg-green-100"}`}>
                  {editMode ? <Edit2 size={20} className="text-blue-600" /> : <Plus size={20} className="text-green-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{editMode ? "Edit Notice" : "Create Notice"}</h2>
                  <p className="text-sm text-gray-500">Fill in the notice details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notice title"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter notice content"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">ℹ️ Info</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="urgent">🚨 Urgent</option>
                    <option value="success">✅ Success</option>
                    <option value="announcement">📢 Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Audience</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">🌍 Everyone</option>
                    <option value="agents">👥 Agents</option>
                    <option value="managers">👤 Managers</option>
                    <option value="admins">🔒 Admins</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white rounded-lg hover:from-[#0a3a6b] hover:to-[#0a4d8c] transition font-medium shadow-lg flex items-center gap-2"
              >
                {editMode ? <Check size={16} /> : <Send size={16} />}
                {editMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 VIEW MODAL */}
      {showViewModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${typeConfig[selectedNotice.type].color}`}>
                  {typeConfig[selectedNotice.type].icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedNotice.title}</h2>
                  <p className="text-sm text-gray-500">by {selectedNotice.createdBy}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${typeConfig[selectedNotice.type].color}`}>
                  {typeConfig[selectedNotice.type].icon}
                  {selectedNotice.type}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${priorityConfig[selectedNotice.priority]}`}>
                  {selectedNotice.priority} priority
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[selectedNotice.status]}`}>
                  {selectedNotice.status}
                </span>
                {selectedNotice.isPinned && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    <Pin size={14} />
                    Pinned
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Audience</p>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {audienceConfig[selectedNotice.audience].icon}
                    {audienceConfig[selectedNotice.audience].label}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Views</p>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Eye size={14} />
                    {selectedNotice.viewCount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(selectedNotice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between sticky bottom-0 bg-white">
              <div className="flex items-center gap-2">
                {selectedNotice.status === "draft" && (
                  <button
                    onClick={() => {
                      toggleStatus(selectedNotice.id, "published");
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition flex items-center gap-2"
                  >
                    <Send size={14} />
                    Publish
                  </button>
                )}
                {selectedNotice.status === "published" && (
                  <button
                    onClick={() => {
                      toggleStatus(selectedNotice.id, "archived");
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition flex items-center gap-2"
                  >
                    <Archive size={14} />
                    Archive
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedNotice);
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition flex items-center gap-2"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}