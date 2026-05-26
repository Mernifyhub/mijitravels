"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Upload,
  ImageIcon,
  Megaphone,
  CheckCircle,
  Search,
  Plus,
  Edit2,
  Eye,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Clock,
  Copy,
  Globe,
  Tag,
  ToggleLeft,
  ToggleRight,
  Percent,
  AlertCircle,
  FileText,
  TrendingUp,
  Zap,
  Star,
  Users,
  BarChart3,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  type: "banner" | "popup" | "slider" | "promo";
  status: "active" | "inactive" | "scheduled" | "expired";
  priority: "low" | "medium" | "high";
  discount?: string;
  couponCode?: string;
  targetAudience: "all" | "agents" | "new" | "premium";
  startDate: string;
  endDate: string;
  clicks: number;
  views: number;
  conversions: number;
  createdBy: string;
  createdAt: string;
  position: number;
}

interface SortConfig {
  key: keyof Offer | null;
  direction: "asc" | "desc";
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const sampleOffers: Offer[] = [
  {
    id: 1,
    title: "Summer Sale - 30% Off",
    description: "Get 30% discount on all international flights this summer season",
    image: "/offers/summer-sale.jpg",
    type: "banner",
    status: "active",
    priority: "high",
    discount: "30%",
    couponCode: "SUMMER30",
    targetAudience: "all",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    clicks: 1250,
    views: 8500,
    conversions: 320,
    createdBy: "Marketing Team",
    createdAt: "2024-01-01T10:00:00.000Z",
    position: 1,
  },
  {
    id: 2,
    title: "New Agent Welcome Bonus",
    description: "Special 5% extra commission for first 10 bookings",
    image: "/offers/welcome.jpg",
    type: "popup",
    status: "active",
    priority: "high",
    discount: "5%",
    couponCode: "WELCOME5",
    targetAudience: "new",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    clicks: 890,
    views: 4200,
    conversions: 156,
    createdBy: "Admin",
    createdAt: "2024-01-15T09:00:00.000Z",
    position: 2,
  },
  {
    id: 3,
    title: "Emirates Partnership Deal",
    description: "Exclusive rates on Emirates flights - Limited time offer",
    image: "/offers/emirates.jpg",
    type: "slider",
    status: "active",
    priority: "medium",
    discount: "15%",
    targetAudience: "premium",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    clicks: 2100,
    views: 12000,
    conversions: 480,
    createdBy: "Partnership Team",
    createdAt: "2024-02-01T08:00:00.000Z",
    position: 3,
  },
  {
    id: 4,
    title: "Weekend Flash Sale",
    description: "Book between Friday-Sunday for extra 10% off",
    image: "/offers/weekend.jpg",
    type: "promo",
    status: "scheduled",
    priority: "medium",
    discount: "10%",
    couponCode: "WEEKEND10",
    targetAudience: "all",
    startDate: "2024-02-15",
    endDate: "2024-02-18",
    clicks: 0,
    views: 0,
    conversions: 0,
    createdBy: "Marketing Team",
    createdAt: "2024-02-10T14:00:00.000Z",
    position: 4,
  },
  {
    id: 5,
    title: "Ramadan Special Offers",
    description: "Special fares for Umrah and Middle East destinations",
    image: "/offers/ramadan.jpg",
    type: "banner",
    status: "inactive",
    priority: "high",
    discount: "20%",
    targetAudience: "all",
    startDate: "2024-03-10",
    endDate: "2024-04-10",
    clicks: 3500,
    views: 18000,
    conversions: 720,
    createdBy: "Admin",
    createdAt: "2024-03-01T10:00:00.000Z",
    position: 5,
  },
  {
    id: 6,
    title: "Premium Agent Exclusive",
    description: "VIP commission rates for premium tier agents",
    image: "/offers/premium.jpg",
    type: "popup",
    status: "expired",
    priority: "low",
    discount: "8%",
    targetAudience: "premium",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    clicks: 450,
    views: 2800,
    conversions: 95,
    createdBy: "Sales Team",
    createdAt: "2023-12-01T12:00:00.000Z",
    position: 6,
  },
];

// ─── Configs ──────────────────────────────────────────────────────────────────
const typeConfig: Record<
  Offer["type"],
  { color: string; icon: React.ReactElement }
> = {
  banner: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <ImageIcon size={14} />,
  },
  popup: {
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <Zap size={14} />,
  },
  slider: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <RefreshCw size={14} />,
  },
  promo: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Tag size={14} />,
  },
};

const statusConfig: Record<
  Offer["status"],
  { color: string; icon: React.ReactElement }
> = {
  active:    { color: "bg-green-100 text-green-600",  icon: <CheckCircle size={12} /> },
  inactive:  { color: "bg-gray-100 text-gray-600",    icon: <ToggleLeft  size={12} /> },
  scheduled: { color: "bg-blue-100 text-blue-600",    icon: <Clock       size={12} /> },
  expired:   { color: "bg-red-100 text-red-600",      icon: <AlertCircle size={12} /> },
};

const priorityConfig: Record<Offer["priority"], string> = {
  low:    "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high:   "bg-red-100 text-red-600",
};

const audienceConfig: Record<
  Offer["targetAudience"],
  { icon: React.ReactElement; label: string }
> = {
  all:     { icon: <Globe size={14} />,  label: "Everyone"   },
  agents:  { icon: <Users size={14} />,  label: "All Agents" },
  new:     { icon: <Star  size={14} />,  label: "New Agents" },
  premium: { icon: <Zap   size={14} />,  label: "Premium"    },
};

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({
  column,
  sortConfig,
}: {
  column: keyof Offer;
  sortConfig: SortConfig;
}) {
  if (sortConfig.key !== column) {
    return (
      <div className="flex flex-col">
        <ChevronUp    className="w-3 h-3 text-gray-300 -mb-1" />
        <ChevronDown  className="w-3 h-3 text-gray-300" />
      </div>
    );
  }
  return sortConfig.direction === "asc" ? (
    <ChevronUp   className="w-4 h-4 text-white" />
  ) : (
    <ChevronDown className="w-4 h-4 text-white" />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OfferPage() {
  const [offers,          setOffers]          = useState<Offer[]>([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [search,          setSearch]          = useState("");
  const [sortConfig,      setSortConfig]      = useState<SortConfig>({ key: "position", direction: "asc" });
  const [filterType,      setFilterType]      = useState("all");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterPriority,  setFilterPriority]  = useState("all");
  const [showFilters,     setShowFilters]     = useState(false);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [itemsPerPage,    setItemsPerPage]    = useState(10);
  const [selectedItems,   setSelectedItems]   = useState<number[]>([]);
  const [refreshing,      setRefreshing]      = useState(false);
  const [viewMode,        setViewMode]        = useState<"table" | "grid">("table");

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showViewModal,   setShowViewModal]   = useState(false);
  const [selectedOffer,   setSelectedOffer]   = useState<Offer | null>(null);
  const [editMode,        setEditMode]        = useState(false);

  const [formData, setFormData] = useState({
    title:          "",
    description:    "",
    image:          "",
    type:           "banner"  as Offer["type"],
    priority:       "medium"  as Offer["priority"],
    discount:       "",
    couponCode:     "",
    targetAudience: "all"     as Offer["targetAudience"],
    startDate:      "",
    endDate:        "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Fetch ──
  useEffect(() => {
    const t = setTimeout(() => {
      setOffers(sampleOffers);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // ── Toast ──
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Refresh ──
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOffers(sampleOffers);
    setRefreshing(false);
    showToast("Offers refreshed", "success");
  };

  // ── Sort ──
  const handleSort = (key: keyof Offer) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ── Image Upload ──
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, image: url }));
  };

  // ── Save ──
  const handleSave = () => {
    if (!formData.title || !formData.description) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (editMode && selectedOffer) {
      setOffers((prev) =>
        prev.map((o) => (o.id === selectedOffer.id ? { ...o, ...formData } : o))
      );
      showToast("Offer updated successfully", "success");
    } else {
      const newOffer: Offer = {
        id:          Math.max(0, ...offers.map((o) => o.id)) + 1,
        ...formData,
        image:       imagePreview || "/offers/default.jpg",
        status:      "active",
        clicks:      0,
        views:       0,
        conversions: 0,
        createdBy:   "Current User",
        createdAt:   new Date().toISOString(),
        position:    offers.length + 1,
      };
      setOffers((prev) => [...prev, newOffer]);
      showToast("Offer created successfully", "success");
    }
    setShowAddModal(false);
    resetForm();
  };

  // ── Reset Form ──
  const resetForm = () => {
    setFormData({
      title:          "",
      description:    "",
      image:          "",
      type:           "banner",
      priority:       "medium",
      discount:       "",
      couponCode:     "",
      targetAudience: "all",
      startDate:      "",
      endDate:        "",
    });
    setImagePreview(null);
    setEditMode(false);
    setSelectedOffer(null);
  };

  // ── Edit ──
  const handleEdit = (offer: Offer) => {
    setFormData({
      title:          offer.title,
      description:    offer.description,
      image:          offer.image,
      type:           offer.type,
      priority:       offer.priority,
      discount:       offer.discount    || "",
      couponCode:     offer.couponCode  || "",
      targetAudience: offer.targetAudience,
      startDate:      offer.startDate,
      endDate:        offer.endDate,
    });
    setImagePreview(offer.image);
    setSelectedOffer(offer);
    setEditMode(true);
    setShowAddModal(true);
  };

  // ── Delete ──
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
      showToast("Offer deleted", "success");
    }
  };

  // ── Bulk Delete ──
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedItems.length} offers?`)) {
      setOffers((prev) => prev.filter((o) => !selectedItems.includes(o.id)));
      setSelectedItems([]);
      showToast(`${selectedItems.length} offers deleted`, "success");
    }
  };

  // ── Toggle Status ──
  const toggleStatus = (id: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "active" ? "inactive" : ("active" as const) }
          : o
      )
    );
    showToast("Status updated", "success");
  };

  // ── View ──
  const handleView = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowViewModal(true);
  };

  // ── Duplicate ──
  const handleDuplicate = (offer: Offer) => {
    const newOffer: Offer = {
      ...offer,
      id:        Math.max(0, ...offers.map((o) => o.id)) + 1,
      title:     `${offer.title} (Copy)`,
      status:    "inactive",
      clicks:    0,
      views:     0,
      conversions: 0,
      createdAt: new Date().toISOString(),
      position:  offers.length + 1,
    };
    setOffers((prev) => [newOffer, ...prev]);
    showToast("Offer duplicated", "success");
  };

  // ── Select All ──
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((o) => o.id));
    }
  };

  // ── Active Filters Count ──
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType     !== "all") count++;
    if (filterStatus   !== "all") count++;
    if (filterPriority !== "all") count++;
    return count;
  }, [filterType, filterStatus, filterPriority]);

  // ── Filtered & Sorted Data ──
  const filteredData = useMemo(() => {
    let result = [...offers];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(s) ||
          o.description.toLowerCase().includes(s) ||
          o.couponCode?.toLowerCase().includes(s)
      );
    }

    if (filterType     !== "all") result = result.filter((o) => o.type     === filterType);
    if (filterStatus   !== "all") result = result.filter((o) => o.status   === filterStatus);
    if (filterPriority !== "all") result = result.filter((o) => o.priority === filterPriority);

    // ✅ Fixed sort — no more 'aVal is possibly undefined'
    if (sortConfig.key) {
      const key = sortConfig.key;
      result = [...result].sort((a, b) => {
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [offers, search, filterType, filterStatus, filterPriority, sortConfig]);

  // ── Pagination ──
  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total:       offers.length,
      active:      offers.filter((o) => o.status === "active").length,
      inactive:    offers.filter((o) => o.status === "inactive").length,
      scheduled:   offers.filter((o) => o.status === "scheduled").length,
      totalClicks: offers.reduce((s, o) => s + o.clicks, 0),
      totalViews:  offers.reduce((s, o) => s + o.views, 0),
      totalConversions: offers.reduce((s, o) => s + o.conversions, 0),
      avgConversionRate:
        offers.length > 0
          ? (
              (offers.reduce((s, o) => s + o.conversions, 0) /
                Math.max(offers.reduce((s, o) => s + o.clicks, 0), 1)) *
              100
            ).toFixed(1)
          : "0",
    }),
    [offers]
  );

  // ── Loading ──
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3
            rounded-xl shadow-lg
            ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success"
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 px-6 py-5 mb-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600
              rounded-xl shadow-lg">
              <Megaphone size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Offer Management</h1>
              <p className="text-sm text-gray-500">
                Manage promotional banners and offers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700
                rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              {viewMode === "table" ? <BarChart3 size={16} /> : <FileText size={16} />}
              {viewMode === "table" ? "Grid" : "Table"}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700
                rounded-lg hover:bg-gray-200 transition text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r
                from-[#021f3b] to-[#0a3a6b] text-white rounded-lg
                hover:from-[#0a3a6b] hover:to-[#0a4d8c] transition
                text-sm font-medium shadow-lg"
            >
              <Plus size={16} />
              Add Offer
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[
          { label: "Total Offers", value: stats.total,                        icon: <FileText   size={20} />, color: "from-blue-500 to-blue-600"   },
          { label: "Active",       value: stats.active,                       icon: <CheckCircle size={20}/>, color: "from-green-500 to-green-600"  },
          { label: "Inactive",     value: stats.inactive,                     icon: <ToggleLeft size={20} />, color: "from-gray-500 to-gray-600"    },
          { label: "Scheduled",    value: stats.scheduled,                    icon: <Clock      size={20} />, color: "from-purple-500 to-purple-600" },
          { label: "Total Views",  value: stats.totalViews.toLocaleString(),  icon: <Eye        size={20} />, color: "from-cyan-500 to-cyan-600"    },
          { label: "Total Clicks", value: stats.totalClicks.toLocaleString(), icon: <TrendingUp size={20} />, color: "from-orange-500 to-orange-600" },
          { label: "Conv. Rate",   value: `${stats.avgConversionRate}%`,      icon: <Percent    size={20} />, color: "from-pink-500 to-pink-600"    },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100
              hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div
                className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white
                  group-hover:scale-110 transition shadow-lg`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search offers, coupon codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  focus:border-transparent text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border
                transition text-sm font-medium
                ${showFilters || activeFiltersCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}
            >
              <Filter size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs
                  flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2
                rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                >
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
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100
            grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="slider">Slider</option>
                <option value="promo">Promo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#021f3b] to-[#0a3a6b] text-white">
                <tr>
                  <th className="px-4 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th
                    className="px-4 py-4 text-left text-xs font-semibold uppercase
                      tracking-wider cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Offer
                      <SortIcon column="title" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Audience
                  </th>
                  <th
                    className="px-4 py-4 text-center text-xs font-semibold uppercase
                      tracking-wider cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Views
                      <SortIcon column="views" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-4 text-center text-xs font-semibold uppercase
                      tracking-wider cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSort("clicks")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Clicks
                      <SortIcon column="clicks" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <ImageIcon size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No offers found</p>
                        <p className="text-gray-400 text-sm">
                          Create your first promotional offer
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((offer) => (
                    <tr
                      key={offer.id}
                      className={`hover:bg-blue-50/50 transition group
                        ${selectedItems.includes(offer.id) ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(offer.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems((prev) => [...prev, offer.id]);
                            } else {
                              setSelectedItems((prev) =>
                                prev.filter((id) => id !== offer.id)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 bg-gray-100 rounded-lg overflow-hidden
                            relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br
                              from-orange-400 to-pink-500 flex items-center justify-center">
                              <ImageIcon size={16} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{offer.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {offer.description}
                            </p>
                            {offer.couponCode && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5
                                bg-yellow-100 text-yellow-700 rounded text-xs font-mono">
                                <Tag size={10} />
                                {offer.couponCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1
                            rounded-full text-xs font-medium border
                            ${typeConfig[offer.type].color}`}
                        >
                          {typeConfig[offer.type].icon}
                          {offer.type}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleStatus(offer.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1
                            rounded-full text-xs font-medium
                            ${statusConfig[offer.status].color}`}
                        >
                          {statusConfig[offer.status].icon}
                          {offer.status}
                        </button>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {offer.discount ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1
                            bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            <Percent size={12} />
                            {offer.discount}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          {audienceConfig[offer.targetAudience].icon}
                          {audienceConfig[offer.targetAudience].label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <Eye size={14} />
                          {offer.views.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <TrendingUp size={14} />
                          {offer.clicks.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center text-xs text-gray-500">
                        <div className="flex flex-col">
                          <span>
                            {new Date(offer.startDate).toLocaleDateString()}
                          </span>
                          <span className="text-gray-400">to</span>
                          <span>
                            {new Date(offer.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1
                          opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleView(offer)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(offer)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(offer)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                            title="Duplicate"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
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

          {/* Table Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between
              px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">{filteredData.length}</span>{" "}
                results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5)            pageNum = i + 1;
                      else if (currentPage <= 3)      pageNum = i + 1;
                      else if (currentPage >= totalPages - 2)
                                                      pageNum = totalPages - 4 + i;
                      else                            pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg font-medium text-sm transition
                            ${currentPage === pageNum
                              ? "bg-[#021f3b] text-white shadow"
                              : "hover:bg-gray-100 text-gray-600"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === "grid" && (
        <div>
          {paginatedData.length === 0 ? (
            <div className="bg-white p-16 rounded-xl text-center shadow-sm border">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full
                flex items-center justify-center mb-4">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No offers found</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first promotional offer
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedData.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border
                    border-gray-100 hover:shadow-lg transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br
                    from-orange-400 via-pink-500 to-purple-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon size={32} className="text-white/50" />
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                          ${statusConfig[offer.status].color}`}
                      >
                        {offer.status}
                      </span>
                      {offer.discount && (
                        <span className="px-2 py-1 bg-green-500 text-white
                          rounded-full text-xs font-semibold">
                          {offer.discount} OFF
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1
                      opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 bg-white/90 rounded-lg text-blue-600 hover:bg-white transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-1">
                        {offer.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium
                          ${priorityConfig[offer.priority]}`}
                      >
                        {offer.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {offer.description}
                    </p>

                    {offer.couponCode && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 px-3 py-1.5 bg-yellow-50 border
                          border-yellow-200 rounded-lg text-center font-mono
                          text-sm text-yellow-700">
                          {offer.couponCode}
                        </span>
                        <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500
                          hover:bg-gray-200 transition">
                          <Copy size={14} />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">
                          {offer.views.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <p className="text-lg font-bold text-gray-800">
                          {offer.clicks.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                          {offer.conversions}
                        </p>
                        <p className="text-xs text-gray-500">Conv.</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100
                    flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(offer.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      {audienceConfig[offer.targetAudience].icon}
                      {audienceConfig[offer.targetAudience].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200
                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                    transition flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200
                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                    transition flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm
          flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
            max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center
              justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl
                    ${editMode ? "bg-blue-100" : "bg-green-100"}`}
                >
                  {editMode
                    ? <Edit2 size={20} className="text-blue-600" />
                    : <Plus  size={20} className="text-green-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {editMode ? "Edit Offer" : "Create Offer"}
                  </h2>
                  <p className="text-sm text-gray-500">Fill in the offer details</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Banner Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6
                  text-center hover:border-blue-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br
                          from-orange-400 to-pink-500 flex items-center justify-center">
                          <ImageIcon size={32} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-600">
                          Click to upload banner image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: 800×370px, max 300KB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Enter offer title"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Enter offer description"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        type: e.target.value as Offer["type"],
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="banner">🖼️ Banner</option>
                    <option value="popup">⚡ Popup</option>
                    <option value="slider">🔄 Slider</option>
                    <option value="promo">🏷️ Promo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        priority: e.target.value as Offer["priority"],
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Discount & Coupon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, discount: e.target.value }))
                    }
                    placeholder="e.g., 20%"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        couponCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., SUMMER20"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      targetAudience: e.target.value as Offer["targetAudience"],
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">🌍 Everyone</option>
                  <option value="agents">👥 All Agents</option>
                  <option value="new">⭐ New Agents</option>
                  <option value="premium">⚡ Premium Agents</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, startDate: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, endDate: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center
              justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700
                  rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-[#021f3b] to-[#0a3a6b]
                  text-white rounded-lg hover:from-[#0a3a6b] hover:to-[#0a4d8c]
                  transition font-medium shadow-lg flex items-center gap-2"
              >
                <CheckCircle size={16} />
                {editMode ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showViewModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm
          flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
            max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center
              justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl border
                    ${typeConfig[selectedOffer.type].color}`}
                >
                  {typeConfig[selectedOffer.type].icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {selectedOffer.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created by {selectedOffer.createdBy}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Banner Preview */}
              <div className="relative h-48 bg-gradient-to-br from-orange-400
                via-pink-500 to-purple-500 rounded-xl mb-6
                flex items-center justify-center">
                <ImageIcon size={48} className="text-white/50" />
                {selectedOffer.discount && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-green-500
                    text-white rounded-full font-bold shadow-lg">
                    {selectedOffer.discount} OFF
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5
                    rounded-full text-sm font-medium border
                    ${typeConfig[selectedOffer.type].color}`}
                >
                  {typeConfig[selectedOffer.type].icon}
                  {selectedOffer.type}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5
                    rounded-full text-sm font-medium
                    ${statusConfig[selectedOffer.status].color}`}
                >
                  {statusConfig[selectedOffer.status].icon}
                  {selectedOffer.status}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium
                    ${priorityConfig[selectedOffer.priority]}`}
                >
                  {selectedOffer.priority} priority
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {selectedOffer.description}
                </p>
              </div>

              {/* Coupon */}
              {selectedOffer.couponCode && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-yellow-50
                  border border-yellow-200 rounded-xl">
                  <Tag className="text-yellow-600" size={20} />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-600 mb-1">Coupon Code</p>
                    <p className="font-mono font-bold text-lg text-yellow-800">
                      {selectedOffer.couponCode}
                    </p>
                  </div>
                  <button className="p-2 bg-yellow-200 rounded-lg text-yellow-700
                    hover:bg-yellow-300 transition">
                    <Copy size={16} />
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedOffer.views.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-700">Views</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedOffer.clicks.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700">Clicks</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedOffer.conversions}
                  </p>
                  <p className="text-xs text-purple-700">Conversions</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedOffer.clicks > 0
                      ? (
                          (selectedOffer.conversions / selectedOffer.clicks) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-orange-700">Conv. Rate</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Target Audience</p>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {audienceConfig[selectedOffer.targetAudience].icon}
                    {audienceConfig[selectedOffer.targetAudience].label}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(selectedOffer.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedOffer.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center
              justify-between sticky bottom-0 bg-white">
              <button
                onClick={() => toggleStatus(selectedOffer.id)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2
                  ${selectedOffer.status === "active"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"}`}
              >
                {selectedOffer.status === "active"
                  ? <ToggleLeft  size={14} />
                  : <ToggleRight size={14} />}
                {selectedOffer.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowViewModal(false); handleEdit(selectedOffer); }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium
                    hover:bg-blue-200 transition flex items-center gap-2"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium
                    hover:bg-gray-200 transition"
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