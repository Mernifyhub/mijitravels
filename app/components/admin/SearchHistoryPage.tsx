"use client";

import React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, Users, Plane, Calendar, Clock,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye, Download, RefreshCw,
  X, ChevronDown, RotateCcw, SlidersHorizontal,
  Globe, TrendingUp, TrendingDown, Activity, Loader2,
  Info, CheckCircle2, XCircle, AlertCircle, History,
  ArrowRight, Building2, Sparkles, Target, Timer,
  Route, Repeat, CalendarDays, Armchair, PlaneTakeoff,
  PlaneLanding, FileText, FileSpreadsheet, File, Printer,
  MoreHorizontal, Copy, Check, ExternalLink, Verified,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SearchEntry {
  id:              string;
  agentId:         string;
  agentName:       string;
  agentCompany:    string;
  agentEmail:      string;
  verified:        boolean;
  origin:          string;
  originCity:      string;
  destination:     string;
  destinationCity: string;
  departureDate:   string;
  returnDate?:     string;
  tripType:        "oneway" | "roundtrip" | "multicity";
  adults:          number;
  children:        number;
  infants:         number;
  cabinClass:      "economy" | "premium_economy" | "business" | "first";
  resultsCount:    number;
  searchTime:      number;
  searchedAt:      string;
  ipAddress:       string;
  device:          "desktop" | "mobile" | "tablet";
  converted:       boolean;
  bookingId?:      string;
}

interface Toast {
  id:      string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}

interface TopRoute {
  route:      string;
  count:      number;
  percentage: number;
}

interface TopAgent {
  id:          string;
  name:        string;
  company:     string;
  searches:    number;
  conversions: number;
}

// ─── Config helpers (no JSX.Element) ─────────────────────────────────────────
function getTripTypeConfig(tripType: string): {
  bg: string; text: string; label: string; icon: React.ReactElement;
} {
  const configs: Record<string, { bg: string; text: string; label: string; icon: React.ReactElement }> = {
    oneway:    { bg: "bg-blue-50",   text: "text-blue-700",   label: "One Way",    icon: <ArrowRight size={12} /> },
    roundtrip: { bg: "bg-purple-50", text: "text-purple-700", label: "Round Trip", icon: <Repeat     size={12} /> },
    multicity: { bg: "bg-amber-50",  text: "text-amber-700",  label: "Multi City", icon: <Route      size={12} /> },
  };
  return configs[tripType] || configs.oneway;
}

function getCabinClassConfig(cabinClass: string): {
  bg: string; text: string; label: string;
} {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    economy:         { bg: "bg-slate-100",  text: "text-slate-700",  label: "Economy"          },
    premium_economy: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Premium Economy"  },
    business:        { bg: "bg-purple-100", text: "text-purple-700", label: "Business"          },
    first:           { bg: "bg-amber-100",  text: "text-amber-700",  label: "First Class"       },
  };
  return configs[cabinClass] || configs.economy;
}

function getDeviceIcon(device: string): string {
  switch (device) {
    case "mobile":  return "📱";
    case "tablet":  return "📱";
    default:        return "💻";
  }
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const generateSearchHistory = (): SearchEntry[] => {
  const origins = [
    { code: "RUH", city: "Riyadh"  }, { code: "JED", city: "Jeddah"  },
    { code: "DMM", city: "Dammam"  }, { code: "DXB", city: "Dubai"   },
    { code: "DOH", city: "Doha"    }, { code: "KWI", city: "Kuwait"  },
  ];
  const destinations = [
    { code: "DAC", city: "Dhaka"       }, { code: "CGP", city: "Chittagong" },
    { code: "ZYL", city: "Sylhet"      }, { code: "CXB", city: "Cox's Bazar"},
    { code: "LHR", city: "London"      }, { code: "IST", city: "Istanbul"   },
  ];
  const agents = [
    { id: "AGT001", name: "Mohamed Yahia",    company: "Al Diwanya Travel",   email: "yahia@aldiwanya.com",   verified: true  },
    { id: "AGT002", name: "Abdur Rehman",     company: "Come Habibi Travel",  email: "rehman@comehabibi.com", verified: false },
    { id: "AGT003", name: "Fatima Al-Hassan", company: "Sky Travel Agency",   email: "fatima@skytravel.sa",   verified: true  },
    { id: "AGT004", name: "Ahmed Kamal",      company: "Gulf Wings Travel",   email: "ahmed@gulfwings.com",   verified: true  },
    { id: "AGT005", name: "Sarah Johnson",    company: "Royal Tours Qatar",   email: "sarah@royaltours.qa",   verified: true  },
    { id: "AGT006", name: "Layla Mohammed",   company: "Falcon Air Services", email: "layla@falconair.ae",    verified: true  },
  ];
  const tripTypes:    SearchEntry["tripType"][]    = ["oneway", "roundtrip", "multicity"];
  const cabinClasses: SearchEntry["cabinClass"][]  = ["economy", "premium_economy", "business", "first"];
  const devices:      SearchEntry["device"][]      = ["desktop", "mobile", "tablet"];
  const searches: SearchEntry[] = [];

  for (let i = 0; i < 100; i++) {
    const origin      = origins[Math.floor(Math.random() * origins.length)];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    const agent       = agents[Math.floor(Math.random() * agents.length)];
    const tripType    = tripTypes[Math.floor(Math.random() * tripTypes.length)];
    const converted   = Math.random() > 0.7;
    const searchDate  = new Date();
    searchDate.setHours(searchDate.getHours() - Math.floor(Math.random() * 168));
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 60) + 1);
    const returnDate = tripType === "roundtrip" ? new Date(departureDate) : undefined;
    if (returnDate) returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 14) + 3);

    searches.push({
      id:              `SCH${String(i + 1).padStart(5, "0")}`,
      agentId:         agent.id,
      agentName:       agent.name,
      agentCompany:    agent.company,
      agentEmail:      agent.email,
      verified:        agent.verified,
      origin:          origin.code,
      originCity:      origin.city,
      destination:     destination.code,
      destinationCity: destination.city,
      departureDate:   departureDate.toISOString().split("T")[0],
      returnDate:      returnDate?.toISOString().split("T")[0],
      tripType,
      adults:          Math.floor(Math.random() * 3) + 1,
      children:        Math.floor(Math.random() * 3),
      infants:         Math.floor(Math.random() * 2),
      cabinClass:      cabinClasses[Math.floor(Math.random() * cabinClasses.length)],
      resultsCount:    Math.floor(Math.random() * 50) + 5,
      searchTime:      Math.floor(Math.random() * 3000) + 500,
      searchedAt:      searchDate.toISOString(),
      ipAddress:       `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device:          devices[Math.floor(Math.random() * devices.length)],
      converted,
      bookingId:       converted ? `POA${Math.floor(Math.random() * 9000) + 1000}` : undefined,
    });
  }

  return searches.sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime());
};

const sampleSearchHistory = generateSearchHistory();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const getRelativeTime = (dateStr: string) => {
  const diff    = new Date().getTime() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 1)  return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 7)     return `${days}d ago`;
  return formatDate(dateStr);
};

// ─── Toast ────────────────────────────────────────────────────────────────────
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
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm
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

// ─── Search Detail Modal ──────────────────────────────────────────────────────
const SearchDetailModal = ({
  search, onClose,
}: {
  search:  SearchEntry | null;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  if (!search) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tripConfig  = getTripTypeConfig(search.tripType);
  const cabinConfig = getCabinClassConfig(search.cabinClass);
  const totalPax    = search.adults + search.children + search.infants;

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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center
                justify-center backdrop-blur-sm">
                <Search size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Search Details</h2>
                <p className="text-blue-100 text-sm">{search.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Flight Route */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl
            p-5 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                text-xs font-semibold bg-white/20">
                {tripConfig.icon}
                {tripConfig.label}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                text-xs font-semibold bg-white/20">
                <Armchair size={12} />
                {cabinConfig.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold">{search.origin}</p>
                <p className="text-slate-400 text-sm mt-1">{search.originCity}</p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex items-center w-full">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="flex-1 h-px bg-gradient-to-r from-white via-slate-500
                    to-emerald-400 mx-2 relative">
                    <Plane size={20} className="text-white absolute left-1/2
                      -translate-x-1/2 -top-2.5 rotate-90" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{search.destination}</p>
                <p className="text-slate-400 text-sm mt-1">{search.destinationCity}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4
              border-t border-slate-700 text-sm">
              <div className="flex items-center gap-2">
                <PlaneTakeoff size={14} className="text-slate-400" />
                <span>{formatDate(search.departureDate)}</span>
              </div>
              {search.returnDate && (
                <div className="flex items-center gap-2">
                  <PlaneLanding size={14} className="text-slate-400" />
                  <span>{formatDate(search.returnDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" /> Agent Information
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600
                rounded-xl flex items-center justify-center text-white font-bold">
                {search.agentName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{search.agentName}</p>
                  {search.verified && <Verified size={14} className="text-blue-500" />}
                </div>
                <p className="text-sm text-slate-500">{search.agentCompany}</p>
                <p className="text-xs text-slate-400">{search.agentEmail}</p>
              </div>
              <div className="text-right">
                <code className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">
                  {search.agentId}
                </code>
              </div>
            </div>
          </div>

          {/* Search Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Passengers</p>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{totalPax} Pax</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {search.adults} Adult{search.adults > 1 ? "s" : ""}
                {search.children > 0 && `, ${search.children} Child`}
                {search.infants  > 0 && `, ${search.infants} Infant`}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Results Found</p>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{search.resultsCount} Flights</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Search Time</p>
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">
                  {(search.searchTime / 1000).toFixed(2)}s
                </span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Searched At</p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{formatTime(search.searchedAt)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{formatDate(search.searchedAt)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Device</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getDeviceIcon(search.device)}</span>
                <span className="font-semibold text-slate-800 capitalize">{search.device}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">IP Address</p>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-400" />
                <span className="font-mono text-sm text-slate-800">{search.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Conversion Status */}
          <div className={`rounded-xl p-4
            ${search.converted ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {search.converted ? (
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <Clock size={20} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <p className={`font-semibold
                    ${search.converted ? "text-emerald-700" : "text-slate-700"}`}>
                    {search.converted ? "Converted to Booking" : "Not Converted"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {search.converted
                      ? "This search resulted in a booking"
                      : "No booking was made from this search"}
                  </p>
                </div>
              </div>
              {search.bookingId && (
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm
                  font-medium hover:bg-emerald-700 transition flex items-center gap-2">
                  <ExternalLink size={14} />
                  {search.bookingId}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center
          justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button onClick={() => handleCopy(search.id)}
              className="p-2 hover:bg-white rounded-lg transition" title="Copy Search ID">
              {copied
                ? <Check size={18} className="text-emerald-500" />
                : <Copy  size={18} className="text-slate-500"   />}
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
              <Printer size={18} className="text-slate-500" />
            </button>
          </div>
          <button onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm
              font-medium hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Analytics Card ───────────────────────────────────────────────────────────
const AnalyticsCard = ({
  title, value, subValue, icon, trend, trendValue, color,
}: {
  title:       string;
  value:       string | number;
  subValue?:   string;
  icon:        React.ReactElement;
  trend?:      "up" | "down" | "neutral";
  trendValue?: string;
  color:       string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm
      hover:shadow-md transition"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium
            ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"}`}>
            {trend === "up"   && <TrendingUp   size={12} />}
            {trend === "down" && <TrendingDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`w-12 h-12 ${color.replace("text-", "bg-").replace("-600", "-50").replace("-700", "-50")}
        rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// ─── Top Routes Card ──────────────────────────────────────────────────────────
const TopRoutesCard = ({ routes }: { routes: TopRoute[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Globe size={18} className="text-blue-500" /> Top Routes
      </h3>
      <span className="text-xs text-slate-400">Last 7 days</span>
    </div>
    <div className="space-y-3">
      {routes.slice(0, 5).map((route, index) => (
        <div key={route.route}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center
                text-xs font-bold
                ${index === 0 ? "bg-amber-100 text-amber-700"  :
                  index === 1 ? "bg-slate-200 text-slate-700"  :
                  index === 2 ? "bg-amber-50  text-amber-600"  :
                  "bg-slate-100 text-slate-600"}`}>
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-700">{route.route}</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{route.count}</span>
          </div>
          <div className="ml-7 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${route.percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// ─── Top Agents Card ──────────────────────────────────────────────────────────
const TopAgentsCard = ({ agents }: { agents: TopAgent[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Users size={18} className="text-purple-500" /> Top Searchers
      </h3>
      <span className="text-xs text-slate-400">By search count</span>
    </div>
    <div className="space-y-3">
      {agents.slice(0, 5).map((agent, index) => (
        <div key={agent.id}
          className="flex items-center justify-between p-2 hover:bg-slate-50
            rounded-xl transition">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
              text-white font-bold text-sm
              ${index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-500" :
                index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500" :
                index === 2 ? "bg-gradient-to-br from-amber-300 to-amber-400" :
                "bg-gradient-to-br from-blue-400 to-blue-500"}`}>
              {agent.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{agent.name}</p>
              <p className="text-xs text-slate-400">{agent.company}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{agent.searches}</p>
            <p className="text-xs text-emerald-600">{agent.conversions} converted</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// ─── Export Dropdown ──────────────────────────────────────────────────────────
const ExportDropdown = ({ onExport }: { onExport: (format: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200
          rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50
          transition shadow-sm">
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
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl
                shadow-xl border border-slate-100 py-1.5 z-20"
            >
              {[
                { format: "pdf",   label: "Export as PDF",   icon: <File            size={16} className="text-rose-500"    /> },
                { format: "excel", label: "Export as Excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
                { format: "csv",   label: "Export as CSV",   icon: <FileText        size={16} className="text-blue-500"    /> },
              ].map(({ format, label, icon }) => (
                <button key={format}
                  onClick={() => { onExport(format); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 text-sm text-left text-slate-700
                    hover:bg-slate-50 flex items-center gap-3">
                  {icon} {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SearchHistoryPage() {
  const [searchHistory,  setSearchHistory]  = useState<SearchEntry[]>(sampleSearchHistory);
  const [loading,        setLoading]        = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [agentFilter,    setAgentFilter]    = useState("");
  const [tripTypeFilter, setTripTypeFilter] = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [convertedFilter,setConvertedFilter]= useState<string>("");
  const [showFilters,    setShowFilters]    = useState(false);
  const [page,           setPage]           = useState(1);
  const [pageSize,       setPageSize]       = useState(20);
  const [sortBy,         setSortBy]         = useState<string>("searchedAt");
  const [sortOrder,      setSortOrder]      = useState<"asc" | "desc">("desc");
  const [selectedSearch, setSelectedSearch] = useState<SearchEntry | null>(null);
  const [toasts,         setToasts]         = useState<Toast[]>([]);
  const [isLive,         setIsLive]         = useState(true);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Live updates
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newSearch = { ...generateSearchHistory()[0] };
      newSearch.id         = `SCH${Date.now()}`;
      newSearch.searchedAt = new Date().toISOString();
      setSearchHistory((prev) => [newSearch, ...prev.slice(0, 99)]);
    }, 30000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Stats
  const stats = useMemo(() => {
    const today         = new Date().toDateString();
    const todaySearches = searchHistory.filter((s) => new Date(s.searchedAt).toDateString() === today);
    const totalSearches = searchHistory.length;
    const totalConversions = searchHistory.filter((s) => s.converted).length;
    return {
      totalSearches,
      todaySearches:    todaySearches.length,
      totalConversions,
      conversionRate:   totalSearches > 0 ? (totalConversions / totalSearches) * 100 : 0,
      avgSearchTime:    searchHistory.reduce((sum, s) => sum + s.searchTime, 0) / totalSearches,
      uniqueAgents:     new Set(searchHistory.map((s) => s.agentId)).size,
    };
  }, [searchHistory]);

  // Top routes
  const topRoutes = useMemo(() => {
    const routeCounts: Record<string, number> = {};
    searchHistory.forEach((s) => {
      const route = `${s.origin} - ${s.destination}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const sorted   = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxCount = sorted[0]?.[1] || 1;
    return sorted.map(([route, count]) => ({ route, count, percentage: (count / maxCount) * 100 }));
  }, [searchHistory]);

  // Top agents
  const topAgents = useMemo(() => {
    const agentStats: Record<string, { name: string; company: string; searches: number; conversions: number }> = {};
    searchHistory.forEach((s) => {
      if (!agentStats[s.agentId]) {
        agentStats[s.agentId] = { name: s.agentName, company: s.agentCompany, searches: 0, conversions: 0 };
      }
      agentStats[s.agentId].searches++;
      if (s.converted) agentStats[s.agentId].conversions++;
    });
    return Object.entries(agentStats)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 10);
  }, [searchHistory]);

  // Unique agents for filter
  const uniqueAgents = useMemo(() => {
    const agentsMap = new Map<string, { name: string; company: string }>();
    searchHistory.forEach((s) => {
      if (!agentsMap.has(s.agentId)) agentsMap.set(s.agentId, { name: s.agentName, company: s.agentCompany });
    });
    return Array.from(agentsMap.entries()).map(([id, data]) => ({ id, ...data }));
  }, [searchHistory]);

  // Filtered data
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = searchHistory.filter((item) => {
      const matchSearch =
        q === "" ? true :
        item.id.toLowerCase().includes(q) ||
        item.agentName.toLowerCase().includes(q) ||
        item.agentCompany.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.originCity.toLowerCase().includes(q) ||
        item.destinationCity.toLowerCase().includes(q);
      const matchAgent     = agentFilter     ? item.agentId === agentFilter              : true;
      const matchTripType  = tripTypeFilter  ? item.tripType === tripTypeFilter           : true;
      const matchConverted = convertedFilter
        ? convertedFilter === "yes" ? item.converted : !item.converted
        : true;
      const matchFrom = dateFrom ? new Date(item.searchedAt) >= new Date(dateFrom) : true;
      const matchTo   = dateTo   ? new Date(item.searchedAt) <= new Date(dateTo + "T23:59:59") : true;
      return matchSearch && matchAgent && matchTripType && matchConverted && matchFrom && matchTo;
    });

    if (sortBy) {
      result = [...result].sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === "searchedAt" || sortBy === "departureDate") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = (valB || "").toLowerCase();
        }
        return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }
    return result;
  }, [searchQuery, agentFilter, tripTypeFilter, convertedFilter, searchHistory, sortBy, sortOrder, dateFrom, dateTo]);

  const totalPages    = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Handlers
  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortOrder("desc"); }
  };

  const handleReset = () => {
    setSearchQuery(""); setAgentFilter(""); setTripTypeFilter("");
    setConvertedFilter(""); setDateFrom(""); setDateTo("");
    setPage(1); setSortBy("searchedAt"); setSortOrder("desc");
    addToast("Filters cleared", "info");
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setSearchHistory(generateSearchHistory());
      setLoading(false);
      addToast("Search history refreshed!", "success");
    }, 1000);
  };

  const handleExport = (format: string) => {
    addToast(`Exporting as ${format.toUpperCase()}...`, "info");
    setTimeout(() => addToast("Export completed!", "success"), 1500);
  };

  const activeFilterCount = [agentFilter, tripTypeFilter, convertedFilter, dateFrom, dateTo].filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────────────────
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600
                rounded-xl flex items-center justify-center">
                <History size={22} className="text-white" />
              </div>
              Search History
            </h1>
            <p className="text-slate-500 mt-1">
              Monitor all agent search activities across the portal
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                font-medium transition shadow-sm
                ${isLive
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}>
              <span className={`w-2 h-2 rounded-full
                ${isLive ? "bg-white animate-pulse" : "bg-slate-400"}`} />
              {isLive ? "Live" : "Paused"}
            </button>
            <ExportDropdown onExport={handleExport} />
            <button onClick={handleRefresh} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r
                from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium
                hover:from-blue-700 hover:to-indigo-700 transition shadow-sm
                disabled:opacity-70">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
        >
          <AnalyticsCard
            title="Total Searches"
            value={stats.totalSearches.toLocaleString()}
            icon={<Search    size={24} className="text-blue-600"    />}
            trend="up" trendValue="+12.5% this week"
            color="text-blue-600"
          />
          <AnalyticsCard
            title="Today's Searches"
            value={stats.todaySearches}
            icon={<Activity  size={24} className="text-purple-600"  />}
            trend="up" trendValue="+8 from yesterday"
            color="text-purple-600"
          />
          <AnalyticsCard
            title="Conversions"
            value={stats.totalConversions}
            icon={<CheckCircle2 size={24} className="text-emerald-600" />}
            subValue={`${stats.conversionRate.toFixed(1)}% rate`}
            color="text-emerald-600"
          />
          <AnalyticsCard
            title="Avg Search Time"
            value={`${(stats.avgSearchTime / 1000).toFixed(2)}s`}
            icon={<Timer     size={24} className="text-amber-600"   />}
            trend="down" trendValue="-0.3s improved"
            color="text-amber-600"
          />
          <AnalyticsCard
            title="Active Agents"
            value={stats.uniqueAgents}
            icon={<Users     size={24} className="text-indigo-600"  />}
            color="text-indigo-600"
          />
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl
            p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.conversionRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400">
                  <TrendingUp size={12} /> +2.3% this month
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopRoutesCard routes={topRoutes} />
          <TopAgentsCard agents={topAgents} />
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search by ID, agent, route..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20
                    focus:border-blue-400 transition" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                      hover:bg-slate-100 rounded-full">
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              <button onClick={handleReset}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm
                  font-medium hover:bg-slate-200 transition flex items-center gap-2 shrink-0">
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className="relative">
                <select value={agentFilter}
                  onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200
                    rounded-xl text-sm focus:outline-none focus:ring-2
                    focus:ring-blue-500/20 focus:border-blue-400 bg-white
                    cursor-pointer min-w-[150px]">
                  <option value="">All Agents</option>
                  {uniqueAgents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center
                  gap-2 transition relative
                  ${showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500
                    text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
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
                <div className="mt-4 pt-4 border-t border-slate-100
                  grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Trip Type
                    </label>
                    <div className="relative">
                      <select value={tripTypeFilter}
                        onChange={(e) => { setTripTypeFilter(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                          text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20
                          bg-white appearance-none pr-10">
                        <option value="">All Types</option>
                        <option value="oneway">One Way</option>
                        <option value="roundtrip">Round Trip</option>
                        <option value="multicity">Multi City</option>
                      </select>
                      <ChevronDown size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Converted
                    </label>
                    <div className="relative">
                      <select value={convertedFilter}
                        onChange={(e) => { setConvertedFilter(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                          text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20
                          bg-white appearance-none pr-10">
                        <option value="">All</option>
                        <option value="yes">Converted</option>
                        <option value="no">Not Converted</option>
                      </select>
                      <ChevronDown size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Date From
                    </label>
                    <input type="date" value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Date To
                    </label>
                    <input type="date" value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl
                        text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleReset}
                      className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 transition">
                      Clear all
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center
          justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{paginatedData.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">{filteredData.length}</span>{" "}
            searches
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm
                  bg-white appearance-none pr-8 cursor-pointer">
                {[20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading search history...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100
                    border-b border-slate-100">
                    <th className="px-4 py-4 text-left">
                      <button onClick={() => handleSort("searchedAt")}
                        className="flex items-center gap-1 text-xs font-semibold
                          text-slate-500 uppercase tracking-wider
                          hover:text-slate-800 transition">
                        Time
                        {sortBy === "searchedAt"
                          ? sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          : <ArrowUpDown size={14} className="opacity-40" />}
                      </button>
                    </th>
                    {["Agent", "Route", "Travel Date", "Type", "Pax", "Results", "Status", "Action"].map((h) => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-semibold
                        text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((search, index) => {
                      const tripConfig = getTripTypeConfig(search.tripType);
                      const totalPax   = search.adults + search.children + search.infants;
                      return (
                        <motion.tr
                          key={search.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-slate-50/80 transition group"
                        >
                          {/* Time */}
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-slate-800">
                              {getRelativeTime(search.searchedAt)}
                            </p>
                            <p className="text-xs text-slate-400">{formatTime(search.searchedAt)}</p>
                          </td>

                          {/* Agent */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500
                                to-indigo-600 rounded-lg flex items-center justify-center
                                text-white font-bold text-sm">
                                {search.agentName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium text-slate-800">
                                    {search.agentName}
                                  </p>
                                  {search.verified && (
                                    <Verified size={12} className="text-blue-500" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">{search.agentCompany}</p>
                              </div>
                            </div>
                          </td>

                          {/* Route */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{search.origin}</span>
                              <div className="flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                <Plane size={12} className="text-blue-500 rotate-90" />
                                <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              </div>
                              <span className="font-semibold text-slate-800">{search.destination}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {search.originCity} → {search.destinationCity}
                            </p>
                          </td>

                          {/* Travel Date */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="text-sm text-slate-700">
                                {formatDate(search.departureDate)}
                              </span>
                            </div>
                            {search.returnDate && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                Return: {formatDate(search.returnDate)}
                              </p>
                            )}
                          </td>

                          {/* Type */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1
                              rounded-full text-xs font-semibold
                              ${tripConfig.bg} ${tripConfig.text}`}>
                              {tripConfig.icon}
                              {tripConfig.label}
                            </span>
                          </td>

                          {/* Pax */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">{totalPax}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {search.adults}A{" "}
                              {search.children > 0 && `${search.children}C `}
                              {search.infants  > 0 && `${search.infants}I`}
                            </p>
                          </td>

                          {/* Results */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">
                                {search.resultsCount}
                              </span>
                              <span className="text-xs text-slate-400">flights</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {(search.searchTime / 1000).toFixed(2)}s
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {search.converted ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-1
                                  rounded-full text-xs font-semibold
                                  bg-emerald-50 text-emerald-700">
                                  <CheckCircle2 size={12} /> Converted
                                </span>
                                {search.bookingId && (
                                  <p className="text-xs text-emerald-600 mt-1 font-mono">
                                    {search.bookingId}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1
                                rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setSelectedSearch(search)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                title="View details">
                                <Eye size={16} className="text-slate-500" />
                              </button>
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
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-20 h-20 bg-slate-100 rounded-full
                            flex items-center justify-center mb-4">
                            <Search size={36} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No searches found</p>
                          <p className="text-slate-400 text-sm mt-1">
                            Try adjusting your search or filters
                          </p>
                          <button onClick={handleReset}
                            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl
                              text-sm font-medium hover:bg-blue-700 transition
                              flex items-center gap-2">
                            <RotateCcw size={16} /> Reset Filters
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
              Page{" "}
              <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages || 1}</span>
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button disabled={page === 1} onClick={() => setPage(1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                  let pageNum: number;
                  const total = totalPages || 1;
                  if (total <= 5)          pageNum = i + 1;
                  else if (page <= 3)      pageNum = i + 1;
                  else if (page >= total - 2) pageNum = total - 4 + i;
                  else                    pageNum = page - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition
                        ${page === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "hover:bg-slate-100 text-slate-600 border border-slate-200"}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(totalPages)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedSearch && (
          <SearchDetailModal
            search={selectedSearch}
            onClose={() => setSelectedSearch(null)}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}