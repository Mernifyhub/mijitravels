// app/admin/import-booking/page.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search, CheckCircle2, XCircle, AlertCircle,
  Loader2, X, ChevronsUpDown, Plane, Users,
  Save, RotateCcw, ArrowRight, Clock,
  Luggage, User, CreditCard,
  Info, Download, FileText, AlertTriangle,
  Check, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

// ==================== TYPES ====================

interface Agent {
  id: string;
  agentId: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  creditLimit: number;
  status: string;
}

interface GDSPassenger {
  title: string;
  firstName: string;
  lastName: string;
  type: "ADT" | "CHD" | "INF";
  ticketNumber?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
}

interface GDSSegment {
  segmentNumber: number;
  airline: string;
  flightNumber: string;
  class: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  status: string;
  terminal?: string;
  baggage?: string;
  duration?: string;
}

interface GDSFare {
  baseFare: number;
  tax: number;
  serviceFee: number;
  totalFare: number;
  currency: string;
  fareType: string;
  cabinClass: string;
}

interface GDSBooking {
  pnr: string;
  status: string;
  airline: string;
  bookingDate: string;
  timeLimit?: string;
  passengers: GDSPassenger[];
  segments: GDSSegment[];
  fare: GDSFare;
  remarks?: string[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ==================== TOAST ====================

const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
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
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl ${
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

// ==================== AGENT DROPDOWN ====================

const AgentDropdown = ({
  agents,
  selectedAgent,
  onSelect,
  loading,
}: {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelect: (agent: Agent) => void;
  loading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return agents;
    const q = search.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.agentId.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }, [agents, search]);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Agency <span className="text-rose-500">*</span>
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 bg-white border-2 rounded-xl transition-all ${
          isOpen
            ? "border-blue-400 ring-4 ring-blue-500/10"
            : selectedAgent
            ? "border-blue-200 bg-blue-50/30"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {selectedAgent ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {selectedAgent.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800 text-sm">{selectedAgent.name}</p>
              <p className="text-xs text-slate-500">
                {selectedAgent.agentId} • BAL: SAR {selectedAgent.balance.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">
            {loading ? "Loading agencies..." : "Select agency..."}
          </span>
        )}
        {loading ? (
          <Loader2 size={18} className="text-slate-400 animate-spin" />
        ) : (
          <ChevronsUpDown size={18} className="text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onSelect(agent);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between p-3 hover:bg-slate-50 transition ${
                      selectedAgent?.id === agent.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        {agent.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800 text-sm">{agent.name}</p>
                        <p className="text-xs text-slate-500">
                          {agent.agentId} • SAR {agent.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedAgent?.id === agent.id && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">No agencies found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== GDS BOOKING DISPLAY ====================

const GDSBookingDisplay = ({
  booking,
  agent,
  onSave,
  onCancel,
  saving,
}: {
  booking: GDSBooking;
  agent: Agent;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["CONFIRMED", "HK"].includes(s)) return "bg-emerald-100 text-emerald-700";
    if (["WAITLISTED", "HL"].includes(s)) return "bg-amber-100 text-amber-700";
    if (["CANCELLED", "XX"].includes(s)) return "bg-rose-100 text-rose-700";
    return "bg-slate-100 text-slate-700";
  };

  const getPaxType = (type: string) => {
    if (type === "ADT") return { label: "Adult", color: "bg-blue-100 text-blue-700" };
    if (type === "CHD") return { label: "Child", color: "bg-amber-100 text-amber-700" };
    if (type === "INF") return { label: "Infant", color: "bg-purple-100 text-purple-700" };
    return { label: type, color: "bg-slate-100 text-slate-700" };
  };

  const totalFare = booking.fare.totalFare;
  const hasBalance = totalFare <= agent.balance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Plane size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white font-mono tracking-wider">
                    {booking.pnr}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  {booking.airline} •{" "}
                  {new Date(booking.bookingDate).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {booking.timeLimit && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock size={14} />
                  <span className="text-xs font-medium">Time Limit</span>
                </div>
                <p className="text-white font-bold text-sm mt-0.5">
                  {new Date(booking.timeLimit).toLocaleString("en-GB", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Agent Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {agent.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">{agent.name}</p>
              <p className="text-xs text-slate-500">{agent.agentId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Available Balance</p>
            <p className={`font-bold text-sm ${hasBalance ? "text-emerald-600" : "text-rose-600"}`}>
              SAR {agent.balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users size={18} className="text-slate-400" />
          <h3 className="font-bold text-slate-800">Passengers ({booking.passengers.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {booking.passengers.map((pax, idx) => {
            const pt = getPaxType(pax.type);
            return (
              <div key={idx} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm">
                      {pax.title} {pax.lastName}/{pax.firstName}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pt.color}`}>
                      {pt.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {pax.ticketNumber && (
                      <span className="font-mono flex items-center gap-1">
                        <FileText size={10} /> {pax.ticketNumber}
                      </span>
                    )}
                    {pax.passportNumber && (
                      <span className="font-mono flex items-center gap-1">
                        <Shield size={10} /> {pax.passportNumber}
                      </span>
                    )}
                    {pax.nationality && <span>{pax.nationality}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Segments */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Plane size={18} className="text-slate-400" />
          <h3 className="font-bold text-slate-800">
            Flight Itinerary ({booking.segments.length} segment{booking.segments.length > 1 ? "s" : ""})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {booking.segments.map((seg, idx) => (
            <div key={idx} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Plane size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {seg.airline} {seg.flightNumber}
                    </p>
                    <p className="text-xs text-slate-500">Class: {seg.class} • {seg.duration || "—"}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(seg.status)}`}>
                  {seg.status}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-slate-800">{seg.origin}</p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">{seg.departureTime}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(seg.departureDate).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", weekday: "short",
                    })}
                  </p>
                  {seg.terminal && <p className="text-xs text-slate-400 mt-0.5">Terminal {seg.terminal}</p>}
                </div>

                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-center">
                    <div className="h-px bg-slate-300 flex-1" />
                    <div className="mx-2 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <Plane size={16} className="text-blue-500 rotate-90" />
                    </div>
                    <div className="h-px bg-slate-300 flex-1" />
                  </div>
                  {seg.baggage && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Luggage size={10} /> {seg.baggage}
                    </span>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-slate-800">{seg.destination}</p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">{seg.arrivalTime}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(seg.arrivalDate).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", weekday: "short",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fare */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <CreditCard size={18} className="text-slate-400" />
          <h3 className="font-bold text-slate-800">Fare Details</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Base Fare</span>
            <span className="font-medium text-slate-800">
              {booking.fare.currency} {booking.fare.baseFare.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Taxes & Fees</span>
            <span className="font-medium text-slate-800">
              {booking.fare.currency} {booking.fare.tax.toLocaleString()}
            </span>
          </div>
          {booking.fare.serviceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Service Fee</span>
              <span className="font-medium text-slate-800">
                {booking.fare.currency} {booking.fare.serviceFee.toLocaleString()}
              </span>
            </div>
          )}
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-bold text-slate-800">Total Fare</span>
            <span className="text-2xl font-bold text-blue-600">
              {booking.fare.currency} {booking.fare.totalFare.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 bg-slate-100 rounded-lg">{booking.fare.fareType}</span>
            <span className="px-2 py-1 bg-slate-100 rounded-lg">{booking.fare.cabinClass}</span>
          </div>

          {!hasBalance && (
            <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-800">Insufficient Balance</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Agent balance: SAR {agent.balance.toLocaleString()} • Required: {booking.fare.currency}{" "}
                  {booking.fare.totalFare.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remarks */}
      {booking.remarks && booking.remarks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Remarks</h3>
          </div>
          <div className="p-5 space-y-2">
            {booking.remarks.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-slate-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> New Search
          </button>
          <button
            onClick={onSave}
            disabled={saving || !hasBalance}
            className="flex-[2] py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving to Hold List...
              </>
            ) : (
              <>
                <Save size={18} /> Save to Agent Hold List
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MAIN PAGE ====================

export default function ImportBookingPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [pnr, setPnr] = useState("");
  const [lastName, setLastName] = useState("");
  const [loadingPNR, setLoadingPNR] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gdsBooking, setGdsBooking] = useState<GDSBooking | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const result = await apiClient("/admin/agents?limit=100");
        const list = result?.agents || result?.data || (Array.isArray(result) ? result : []);
        setAgents(
          list.map((a: any) => ({
            id: a.id,
            agentId: a.agentId || "N/A",
            name: a.agentName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "Unknown",
            email: a.email || "",
            phone: a.phone || "",
            balance: Number(a.balance || 0),
            creditLimit: Number(a.creditLimit || 0),
            status: String(a.status || "active").toLowerCase(),
          }))
        );
      } catch (err: any) {
        console.error("Agent fetch error:", err);
        setAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Load PNR
  // handleLoadPNR function — এই part টুকু replace করুন

const handleLoadPNR = async () => {
  if (!selectedAgent) {
    addToast("Please select an agency first", "warning");
    return;
  }
  if (!pnr.trim() || pnr.trim().length !== 6) {
    addToast("Please enter a valid 6-character PNR", "warning");
    return;
  }
  if (!lastName.trim()) {
    addToast("Please enter passenger last name", "warning");
    return;
  }

  setLoadingPNR(true);
  setError(null);
  setGdsBooking(null);

  try {
    const result = await apiClient(
      `/admin/import-booking/load-pnr?pnr=${pnr.trim().toUpperCase()}&lastName=${lastName.trim().toUpperCase()}&agentId=${selectedAgent.id}`
    );

    if (result?.booking) {
      setGdsBooking(result.booking);

      // ✅ Backend থেকে আসা latest agent data দিয়ে update করো
      if (result?.agent) {
        setSelectedAgent((prev) =>
          prev
            ? {
                ...prev,
                balance: Number(result.agent.balance || prev.balance || 0),
                creditLimit: Number(result.agent.creditLimit || prev.creditLimit || 0),
              }
            : prev
        );
      }

      addToast(`PNR ${pnr.toUpperCase()} loaded successfully`, "success");
    } else {
      setError("No booking found for this PNR and Last Name combination");
      addToast("No booking found", "error");
    }
  } catch (err: any) {
    const msg = err?.message || "Failed to load PNR. Please check and try again.";
    setError(msg);
    addToast(msg, "error");
  } finally {
    setLoadingPNR(false);
  }
};
  // Save
  const handleSave = async () => {
    if (!gdsBooking || !selectedAgent) return;

    setSaving(true);
    try {
      const result = await apiClient("/admin/import-booking/save", {
        method: "POST",
        body: JSON.stringify({
          agentId: selectedAgent.id,
          pnr: gdsBooking.pnr,
          bookingData: gdsBooking,
        }),
      });

      addToast(
        result?.message || `Booking ${gdsBooking.pnr} saved to ${selectedAgent.name}'s hold list`,
        "success"
      );
      setGdsBooking(null);
      setPnr("");
      setLastName("");
    } catch (err: any) {
      addToast(err?.message || "Failed to save booking", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGdsBooking(null);
    setPnr("");
    setLastName("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] rounded-xl flex items-center justify-center">
              <Download size={22} className="text-white" />
            </div>
            Import Booking
          </h1>
          <p className="text-slate-500 mt-1">
            Load PNR from GDS and save to agent hold list
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-6 py-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Search size={18} /> PNR Lookup
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">
              Select agency, enter PNR and last name to retrieve booking from GDS
            </p>
          </div>

          <div className="p-6 space-y-5">
            <AgentDropdown
              agents={agents}
              selectedAgent={selectedAgent}
              onSelect={setSelectedAgent}
              loading={agentsLoading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  PNR <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-white font-mono text-lg tracking-widest uppercase placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base placeholder:font-sans"
                  onKeyDown={(e) => e.key === "Enter" && handleLoadPNR()}
                />
                <p className="text-xs text-slate-400 mt-1.5">6-character alphanumeric code</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.toUpperCase())}
                  placeholder="DOE"
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-white text-lg uppercase placeholder:text-slate-300 placeholder:normal-case placeholder:text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleLoadPNR()}
                />
                <p className="text-xs text-slate-400 mt-1.5">As per GDS booking</p>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-rose-800 flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load Button */}
            <button
              onClick={handleLoadPNR}
              disabled={loadingPNR || !selectedAgent || pnr.trim().length !== 6 || !lastName.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white rounded-xl font-bold text-base hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              {loadingPNR ? (
                <>
                  <Loader2 size={22} className="animate-spin" /> Loading from GDS...
                </>
              ) : (
                <>
                  <ArrowRight size={22} /> Load PNR
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading Animation */}
        <AnimatePresence>
          {loadingPNR && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                    <Plane size={36} className="text-blue-500 animate-pulse" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full"
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">Retrieving from GDS...</p>
                  <p className="text-sm text-slate-500 mt-1">
                    PNR: <span className="font-mono font-bold">{pnr.toUpperCase()}</span> •
                    Last Name: <span className="font-bold">{lastName.toUpperCase()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {["Connecting", "Authenticating", "Fetching"].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                    >
                      {step}...
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GDS Booking */}
        <AnimatePresence>
          {gdsBooking && selectedAgent && !loadingPNR && (
            <GDSBookingDisplay
              booking={gdsBooking}
              agent={selectedAgent}
              onSave={handleSave}
              onCancel={handleReset}
              saving={saving}
            />
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!gdsBooking && !loadingPNR && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Plane size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">Ready to Import</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Select an agency, enter PNR and passenger last name, then click "Load PNR" to retrieve the booking from GDS
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
              {[
                { step: "1", label: "Select Agency" },
                { step: "2", label: "Enter PNR" },
                { step: "3", label: "Load & Save" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight size={16} className="text-slate-300 mr-4" />}
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">{item.step}</span>
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}