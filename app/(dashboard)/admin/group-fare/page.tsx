"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  Search,
  Plus,
  Filter,
  RefreshCw,
  FileText,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
  Briefcase,
} from "lucide-react";
import GroupFareCard from "@/app/components/admin/GroupFareCard";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GroupFare {
  id: number;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  aircraft: string;
  origin: {
    code: string;
    city: string;
    airport: string;
    time: string;
    date: string;
  };
  destination: {
    code: string;
    city: string;
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  class: "economy" | "business" | "first";
  seats: {
    total: number;
    available: number;
    booked: number;
  };
  pricing: {
    adult: number;
    child: number;
    infant: number;
    currency: string;
  };
  commission: number;
  baggage: string;
  meals: boolean;
  refundable: boolean;
  status: "active" | "inactive" | "soldout" | "expired";
  validity: {
    from: string;
    to: string;
  };
  isFeatured: boolean;
  bookings: number;
  revenue: number;
  createdAt: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const sampleData: GroupFare[] = [
  {
    id: 1,
    airline: "Emirates",
    airlineCode: "EK",
    flightNumber: "EK-582",
    aircraft: "Boeing 777-300ER",
    origin: {
      code: "DAC",
      city: "Dhaka",
      airport: "Hazrat Shahjalal Intl",
      time: "02:05",
      date: "2025-08-29",
    },
    destination: {
      code: "DXB",
      city: "Dubai",
      airport: "Dubai Intl",
      time: "17:25",
      date: "2025-08-29",
    },
    duration: "5h 20m",
    stops: 0,
    class: "economy",
    seats: { total: 50, available: 32, booked: 18 },
    pricing: { adult: 54500, child: 41000, infant: 8500, currency: "BDT" },
    commission: 5,
    baggage: "30 KG",
    meals: true,
    refundable: false,
    status: "active",
    validity: { from: "2025-08-01", to: "2025-08-31" },
    isFeatured: true,
    bookings: 18,
    revenue: 981000,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    airline: "Qatar Airways",
    airlineCode: "QR",
    flightNumber: "QR-639",
    aircraft: "Airbus A350-900",
    origin: {
      code: "DAC",
      city: "Dhaka",
      airport: "Hazrat Shahjalal Intl",
      time: "03:30",
      date: "2025-09-15",
    },
    destination: {
      code: "DOH",
      city: "Doha",
      airport: "Hamad Intl",
      time: "06:45",
      date: "2025-09-15",
    },
    duration: "5h 15m",
    stops: 0,
    class: "economy",
    seats: { total: 40, available: 25, booked: 15 },
    pricing: { adult: 48000, child: 36000, infant: 7500, currency: "BDT" },
    commission: 6,
    baggage: "30 KG",
    meals: true,
    refundable: true,
    status: "active",
    validity: { from: "2025-09-01", to: "2025-09-30" },
    isFeatured: true,
    bookings: 15,
    revenue: 720000,
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    flightNumber: "SQ-437",
    aircraft: "Boeing 787-10",
    origin: {
      code: "DAC",
      city: "Dhaka",
      airport: "Hazrat Shahjalal Intl",
      time: "10:15",
      date: "2025-10-01",
    },
    destination: {
      code: "SIN",
      city: "Singapore",
      airport: "Changi",
      time: "18:30",
      date: "2025-10-01",
    },
    duration: "4h 15m",
    stops: 0,
    class: "business",
    seats: { total: 20, available: 12, booked: 8 },
    pricing: { adult: 125000, child: 95000, infant: 18000, currency: "BDT" },
    commission: 7,
    baggage: "40 KG",
    meals: true,
    refundable: true,
    status: "active",
    validity: { from: "2025-10-01", to: "2025-10-31" },
    isFeatured: false,
    bookings: 8,
    revenue: 1000000,
    createdAt: "2024-01-13",
  },
  {
    id: 4,
    airline: "Turkish Airlines",
    airlineCode: "TK",
    flightNumber: "TK-713",
    aircraft: "Airbus A330-300",
    origin: {
      code: "DAC",
      city: "Dhaka",
      airport: "Hazrat Shahjalal Intl",
      time: "00:45",
      date: "2025-11-10",
    },
    destination: {
      code: "IST",
      city: "Istanbul",
      airport: "Istanbul Airport",
      time: "08:20",
      date: "2025-11-10",
    },
    duration: "9h 35m",
    stops: 0,
    class: "economy",
    seats: { total: 60, available: 0, booked: 60 },
    pricing: { adult: 68000, child: 52000, infant: 10000, currency: "BDT" },
    commission: 5.5,
    baggage: "30 KG",
    meals: true,
    refundable: false,
    status: "soldout",
    validity: { from: "2025-11-01", to: "2025-11-30" },
    isFeatured: true,
    bookings: 60,
    revenue: 4080000,
    createdAt: "2024-01-12",
  },
  {
    id: 5,
    airline: "Biman Bangladesh",
    airlineCode: "BG",
    flightNumber: "BG-147",
    aircraft: "Boeing 787-8",
    origin: {
      code: "DAC",
      city: "Dhaka",
      airport: "Hazrat Shahjalal Intl",
      time: "08:00",
      date: "2025-07-20",
    },
    destination: {
      code: "JED",
      city: "Jeddah",
      airport: "King Abdulaziz Intl",
      time: "13:30",
      date: "2025-07-20",
    },
    duration: "7h 30m",
    stops: 0,
    class: "economy",
    seats: { total: 80, available: 45, booked: 35 },
    pricing: { adult: 58000, child: 44000, infant: 9000, currency: "BDT" },
    commission: 4,
    baggage: "46 KG",
    meals: true,
    refundable: false,
    status: "active",
    validity: { from: "2025-07-01", to: "2025-07-31" },
    isFeatured: false,
    bookings: 35,
    revenue: 2030000,
    createdAt: "2024-01-11",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GroupFarePage() {
  const router = useRouter();

  const [data, setData]               = useState<GroupFare[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass]   = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode]       = useState<"card" | "table">("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage]                     = useState(10);
  const [toast, setToast]             = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Fetch ──
  useEffect(() => {
    const t = setTimeout(() => {
      setData(sampleData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // ── Toast ──
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Actions ──
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setData(sampleData);
    setRefreshing(false);
    showToast("Data refreshed", "success");
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this group fare?")) {
      setData((prev) => prev.filter((f) => f.id !== id));
      showToast("Group fare deleted", "success");
    }
  };

  const handleToggleStatus = (id: number) => {
    setData((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: f.status === "active" ? "inactive" : ("active" as const) }
          : f
      )
    );
    showToast("Status updated", "success");
  };

  const handleToggleFeatured = (id: number) => {
    setData((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isFeatured: !f.isFeatured } : f))
    );
    showToast("Featured status updated", "success");
  };

  const handleDuplicate = (id: number) => {
    const fare = data.find((f) => f.id === id);
    if (fare) {
      const newFare: GroupFare = {
        ...fare,
        id: Date.now(),
        status: "inactive",
        isFeatured: false,
      };
      setData((prev) => [newFare, ...prev]);
      showToast("Group fare duplicated", "success");
    }
  };

  // ── Filtered & Paginated ──
  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.airline.toLowerCase().includes(s) ||
          f.flightNumber.toLowerCase().includes(s) ||
          f.origin.code.toLowerCase().includes(s) ||
          f.destination.code.toLowerCase().includes(s) ||
          f.origin.city.toLowerCase().includes(s) ||
          f.destination.city.toLowerCase().includes(s)
      );
    }

    if (filterStatus !== "all")
      result = result.filter((f) => f.status === filterStatus);
    if (filterClass !== "all")
      result = result.filter((f) => f.class === filterClass);

    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return result;
  }, [data, search, filterStatus, filterClass]);

  const totalPages   = Math.ceil(filteredData.length / perPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total:      data.length,
      active:     data.filter((f) => f.status === "active").length,
      soldout:    data.filter((f) => f.status === "soldout").length,
      totalSeats: data.reduce((s, f) => s + f.seats.total, 0),
      available:  data.reduce((s, f) => s + f.seats.available, 0),
      revenue:    data.reduce((s, f) => s + f.revenue, 0),
    }),
    [data]
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-16 bg-gray-200 rounded-xl" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-xl" />
          ))}
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
            rounded-xl shadow-lg text-white
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {toast.type === "success"
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 px-6 py-5 mb-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600
              rounded-xl shadow-lg">
              <Plane size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Group Fare Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage group flight fares & pricing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
              className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Toggle View"
            >
              {viewMode === "card" ? <FileText size={18} /> : <Grid3X3 size={18} />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200
                transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Export"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => router.push("/admin/add-group-fare")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#021f3b] text-white
                rounded-lg hover:bg-[#0a3a6b] transition text-sm font-medium shadow-lg"
            >
              <Plus size={16} />
              Add Fare
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          {
            label: "Total Fares",
            value: stats.total,
            icon: <FileText size={20} />,
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Active",
            value: stats.active,
            icon: <CheckCircle size={20} />,
            color: "from-green-500 to-green-600",
          },
          {
            label: "Sold Out",
            value: stats.soldout,
            icon: <AlertCircle size={20} />,
            color: "from-red-500 to-red-600",
          },
          {
            label: "Total Seats",
            value: stats.totalSeats,
            icon: <Users size={20} />,
            color: "from-purple-500 to-purple-600",
          },
          {
            label: "Available",
            value: stats.available,
            icon: <Briefcase size={20} />,
            color: "from-cyan-500 to-cyan-600",
          },
          {
            label: "Revenue",
            value: `৳${(stats.revenue / 1_000_000).toFixed(1)}M`,
            icon: <DollarSign size={20} />,
            color: "from-orange-500 to-orange-600",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100
              hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
              </div>
              <div
                className={`p-2.5 bg-gradient-to-br ${s.color} rounded-xl text-white
                  shadow group-hover:scale-110 transition`}
              >
                {s.icon}
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
                placeholder="Search airline, flight, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                text-sm font-medium transition
                ${showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-700"}`}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredData.length}
            </span>{" "}
            results
          </p>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                  focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="soldout">Sold Out</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Class
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                  focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Cards / Empty State ── */}
      {paginatedData.length === 0 ? (
        <div className="bg-white p-16 rounded-xl text-center shadow-sm border">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full
            flex items-center justify-center mb-4">
            <Plane size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No group fares found</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first group fare
          </p>
          <button
            onClick={() => router.push("/admin/add-group-fare")}
            className="mt-4 px-5 py-2 bg-[#021f3b] text-white rounded-lg
              text-sm font-medium"
          >
            Add Group Fare
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedData.map((fare) => (
            <GroupFareCard
              key={fare.id}
              fare={fare}
              onEdit={()         => router.push(`/admin/edit-group-fare/${fare.id}`)}
              onDelete={()       => handleDelete(fare.id)}
              onToggleStatus={() => handleToggleStatus(fare.id)}
              onToggleFeatured={()=> handleToggleFeatured(fare.id)}
              onDuplicate={()    => handleDuplicate(fare.id)}
              onView={()         => router.push(`/admin/group-fare/${fare.id}`)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {filteredData.length > perPage && (
        <div className="mt-6 flex items-center justify-between bg-white p-4
          rounded-xl border">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-1 text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}