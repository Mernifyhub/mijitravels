"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Plane, MapPin, Users, Globe, Tag, DollarSign, Percent,
  Loader2, CheckCircle2, XCircle, Info, AlertTriangle,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// ==================== CONSTANTS ====================
const TYPE_OPTIONS = [
  { value: "GLOBAL",        label: "Global",          color: "blue"    },
  { value: "AIRLINE",       label: "Airline",         color: "indigo"  },
  { value: "ROUTE",         label: "Route",           color: "emerald" },
  { value: "AGENT",         label: "Agent",           color: "purple"  },
  { value: "AIRLINE_AGENT", label: "Airline + Agent", color: "amber"   },
  { value: "ROUTE_AGENT",   label: "Route + Agent",   color: "rose"    },
];

const C: Record<string, Record<string, string>> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200"  },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200"  },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
};

const AIRLINES = [
  { code: "SV", name: "Saudi Airlines"     },
  { code: "EK", name: "Emirates"           },
  { code: "QR", name: "Qatar Airways"      },
  { code: "TK", name: "Turkish Airlines"   },
  { code: "BG", name: "Biman Bangladesh"   },
  { code: "BS", name: "US-Bangla Airlines" },
  { code: "GF", name: "Gulf Air"           },
  { code: "KU", name: "Kuwait Airways"     },
  { code: "WY", name: "Oman Air"           },
  { code: "AI", name: "Air India"          },
  { code: "FZ", name: "Fly Dubai"          },
  { code: "G9", name: "Air Arabia"         },
  { code: "MH", name: "Malaysia Airlines"  },
  { code: "SQ", name: "Singapore Airlines" },
];

const EMPTY_FORM = {
  type: "GLOBAL",
  airlineCode: "",
  airlineName: "",
  origin: "",
  destination: "",
  routeMatchType: "EXACT",
  agentId: "",
  markupAmount: "",
  markupPercent: "",
  markupOn: "BASE_FARE",
  isActive: true,
  priority: "0",
  validFrom: "",
  validTo: "",
  note: "",
};

// ==================== MAIN ====================
export default function MarkupManagement() {
  const [markups, setMarkups]       = useState<any[]>([]);
  const [agents, setAgents]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [debugInfo, setDebugInfo]   = useState<string>("");

  const toastRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, ok = true) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, ok });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch Markups ──
  const fetchMarkups = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filterType) p.set("type", filterType);
      if (search) p.set("search", search);

      // ✅ apiClient → NestJS /api/v1/admin/markups
      const data = await apiClient(`/admin/markups?${p.toString()}`);
      setMarkups(data.markups || []);
    } catch (err: any) {
      console.error("Markups fetch error:", err?.message);
      if (!String(err?.message).includes("401")) {
        showToast("Failed to load markups", false);
      }
    } finally {
      setLoading(false);
    }
  }, [filterType, search, showToast]);

  // ── Fetch Agents ──
  const fetchAgents = useCallback(async () => {
    try {
      // ✅ apiClient → NestJS /api/v1/admin/agents
      const data = await apiClient(`/admin/agents?limit=500`);

      if (Array.isArray(data)) {
        setAgents(data);
      } else if (Array.isArray(data.agents)) {
        setAgents(data.agents);
      } else if (Array.isArray(data.users)) {
        setAgents(data.users);
      } else if (Array.isArray(data.data)) {
        setAgents(data.data);
      } else {
        setAgents([]);
      }
    } catch (e) {
      console.error("Failed to load agents:", e);
      setAgents([]);
    }
  }, []);

  useEffect(() => { fetchMarkups(); }, [fetchMarkups]);
  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setDebugInfo("");
  }, []);

  // ── Open Edit ──
  const openEdit = useCallback((m: any) => {
    const newForm = {
      type: m.type || "GLOBAL",
      airlineCode: m.airlineCode || "",
      airlineName: m.airlineName || "",
      origin: m.origin || "",
      destination: m.destination || "",
      routeMatchType: m.routeMatchType || "EXACT",
      agentId: m.agentId || "",
      markupAmount: m.markupAmount != null ? String(m.markupAmount) : "",
      markupPercent: m.markupPercent != null ? String(m.markupPercent) : "",
      markupOn: m.markupOn || "BASE_FARE",
      isActive: m.isActive !== false,
      priority: m.priority != null ? String(m.priority) : "0",
      validFrom: m.validFrom ? m.validFrom.slice(0, 10) : "",
      validTo: m.validTo ? m.validTo.slice(0, 10) : "",
      note: m.note || "",
    };

    setEditId(m.id);
    setForm(newForm);
    setDebugInfo("");

    setTimeout(() => setShowModal(true), 50);
  }, []);

  // ── Save ──
  const handleSave = async () => {
    if (!form.markupAmount && !form.markupPercent) {
      showToast("Amount or Percent is required!", false);
      return;
    }

    if (["AIRLINE", "AIRLINE_AGENT"].includes(form.type) && !form.airlineCode) {
      showToast("Please select an airline!", false);
      return;
    }

    if (["ROUTE", "ROUTE_AGENT"].includes(form.type) && (!form.origin || !form.destination)) {
      showToast("Please enter origin and destination!", false);
      return;
    }

    if (["AGENT", "AIRLINE_AGENT", "ROUTE_AGENT"].includes(form.type) && !form.agentId) {
      showToast("Please select an agent!", false);
      return;
    }

    setSaving(true);
    setDebugInfo("");

    try {
      const airline = AIRLINES.find((a) => a.code === form.airlineCode);

      const body = {
        type: form.type,
        airlineCode: form.airlineCode || null,
        airlineName: airline?.name || form.airlineName || null,
        origin: form.origin || null,
        destination: form.destination || null,
        routeMatchType: form.routeMatchType || "EXACT",
        agentId: form.agentId || null,
        markupAmount: form.markupAmount ? parseFloat(form.markupAmount) : 0,
        markupPercent: form.markupPercent ? parseFloat(form.markupPercent) : 0,
        markupOn: form.markupOn || "BASE_FARE",
        isActive: form.isActive,
        priority: parseInt(form.priority) || 0,
        validFrom: form.validFrom || null,
        validTo: form.validTo || null,
        note: form.note || null,
      };

      if (editId) {
        // ✅ PUT /api/v1/admin/markups/:id
        await apiClient(`/admin/markups/${editId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        showToast("Markup updated successfully!");
      } else {
        // ✅ POST /api/v1/admin/markups
        await apiClient("/admin/markups", {
          method: "POST",
          body: JSON.stringify(body),
        });
        showToast("Markup created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchMarkups();
    } catch (err: any) {
      console.error("Save error:", err?.message);
      const errMsg = String(err?.message || "")
        .replace(/API Error \d+ on [^:]+: /, "")
        .replace(/^{.*"message":"([^"]+)".*}$/, "$1");
      showToast(errMsg || "Failed to save markup", false);
      setDebugInfo(err?.message || "");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this markup rule?")) return;

    setDeleting(id);

    try {
      // ✅ DELETE /api/v1/admin/markups/:id
      await apiClient(`/admin/markups/${id}`, { method: "DELETE" });
      showToast("Markup deleted successfully!");
      fetchMarkups();
    } catch (err: any) {
      console.error("Delete error:", err?.message);
      showToast(err?.message || "Failed to delete", false);
    } finally {
      setDeleting(null);
    }
  };

  // ── Toggle Active ──
  const toggleActive = async (m: any) => {
    const newStatus = !m.isActive;
    setToggling(m.id);

    // Optimistic update
    setMarkups((prev) =>
      prev.map((item) =>
        item.id === m.id ? { ...item, isActive: newStatus } : item,
      ),
    );

    try {
      // ✅ PATCH /api/v1/admin/markups/:id/toggle
      await apiClient(`/admin/markups/${m.id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      showToast(newStatus ? "Markup activated!" : "Markup deactivated!");
      fetchMarkups();
    } catch (err: any) {
      // Revert on failure
      setMarkups((prev) =>
        prev.map((item) =>
          item.id === m.id ? { ...item, isActive: m.isActive } : item,
        ),
      );
      console.error("Toggle error:", err?.message);
      showToast(err?.message || "Failed to update", false);
    } finally {
      setToggling(null);
    }
  };

  // ── Helpers ──
  const getTypeConfig = (type: string) =>
    TYPE_OPTIONS.find((t) => t.value === type) || TYPE_OPTIONS[0];

  const isExpired = (v: string | null) =>
    v ? new Date(v) < new Date() : false;

  const isNotStarted = (v: string | null) =>
    v ? new Date(v) > new Date() : false;

  const setField = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const needsAirline = ["AIRLINE", "AIRLINE_AGENT"].includes(form.type);
  const needsRoute   = ["ROUTE", "ROUTE_AGENT"].includes(form.type);
  const needsAgent   = ["AGENT", "AIRLINE_AGENT", "ROUTE_AGENT"].includes(form.type);

  // ==================== LOADING ====================
  if (loading && !markups.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#021f3b] mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-bold">Loading markups...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* TOAST */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-bold transition-all duration-300 ${
            toast.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {toast.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {toast.msg}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Tag size={22} className="text-indigo-600" />
              Markup Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Airline, Route & Agent wise markup rules ({markups.length} total)
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#021f3b] hover:bg-[#0a3a6b] text-white rounded-xl font-bold text-sm transition active:scale-95 shadow-lg"
          >
            <Plus size={16} /> Add Markup Rule
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {TYPE_OPTIONS.map((t) => {
            const c = C[t.color];
            const count = markups.filter((m) => m.type === t.value && m.isActive).length;
            const total = markups.filter((m) => m.type === t.value).length;
            const sel = filterType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setFilterType(sel ? "" : t.value)}
                className={`rounded-xl p-3 border-2 text-left transition hover:shadow-md ${
                  sel ? `${c.bg} ${c.border}` : "bg-white border-gray-100"
                }`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${sel ? c.text : "text-gray-400"}`}>
                  {t.label}
                </p>
                <p className="text-2xl font-black text-gray-800">
                  {count}
                  {total > count && (
                    <span className="text-xs text-gray-300 font-normal">/{total}</span>
                  )}
                </p>
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by airline, route, agent..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : markups.length === 0 ? (
            <div className="text-center py-16">
              <Tag size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="font-bold text-gray-400">No markup rules found</p>
              <p className="text-sm text-gray-300 mt-1">Click &ldquo;Add Markup Rule&rdquo; to start</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Type", "Scope", "Amount", "%", "On", "Priority", "Validity", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {markups.map((m) => {
                    const tc = getTypeConfig(m.type);
                    const c = C[tc.color];
                    const exp = isExpired(m.validTo);
                    const pend = isNotStarted(m.validFrom);
                    const isTogglingThis = toggling === m.id;
                    const isDeletingThis = deleting === m.id;

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-gray-50/50 transition ${!m.isActive || exp ? "opacity-50" : ""}`}
                      >
                        {/* Type */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${c.bg} ${c.text} ${c.border}`}>
                            {tc.label}
                          </span>
                        </td>

                        {/* Scope */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {m.airlineCode && (
                              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <Plane size={11} className="text-gray-400" />
                                {m.airlineCode}
                                {m.airlineName && (
                                  <span className="text-gray-400 font-normal text-[10px]">({m.airlineName})</span>
                                )}
                              </p>
                            )}
                            {m.origin && m.destination && (
                              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <MapPin size={11} className="text-gray-400" />
                                {m.origin} → {m.destination}
                                {m.routeMatchType === "BIDIRECTIONAL" && (
                                  <span className="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                    ↔ Bidirectional
                                  </span>
                                )}
                              </p>
                            )}
                            {m.agent && (
                              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <Users size={11} className="text-gray-400" />
                                {m.agent.agentName || `${m.agent.firstName || ""} ${m.agent.lastName || ""}`.trim()}
                              </p>
                            )}
                            {m.type === "GLOBAL" && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-400 italic">
                                <Globe size={11} /> All bookings
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {Number(m.markupAmount) > 0 ? (
                            <span className="flex items-center gap-1 font-black text-gray-800 text-xs">
                              <DollarSign size={11} className="text-emerald-500" />
                              {Number(m.markupAmount).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Percent */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {Number(m.markupPercent) > 0 ? (
                            <span className="flex items-center gap-1 font-black text-gray-800 text-xs">
                              <Percent size={11} className="text-indigo-500" />
                              {Number(m.markupPercent)}%
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* On */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {m.markupOn === "TOTAL" ? "Total" : "Base"}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {m.priority}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {exp ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Expired</span>
                          ) : pend ? (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Not Started</span>
                          ) : m.validTo ? (
                            <span className="text-[10px] font-bold text-gray-500">
                              Until {new Date(m.validTo).toLocaleDateString("en-GB")}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300">No Expiry</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isTogglingThis) toggleActive(m);
                            }}
                            disabled={isTogglingThis}
                            className="transition hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                          >
                            {isTogglingThis ? (
                              <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-black">
                                <Loader2 size={12} className="animate-spin" /> ...
                              </span>
                            ) : m.isActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black">
                                <ToggleRight size={12} /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-black">
                                <ToggleLeft size={12} /> Off
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEdit(m);
                              }}
                              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition hover:scale-110"
                              title="Edit"
                            >
                              <Edit2 size={13} className="text-indigo-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(m.id);
                              }}
                              disabled={isDeletingThis}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition hover:scale-110 disabled:opacity-50 disabled:cursor-wait"
                              title="Delete"
                            >
                              {isDeletingThis ? (
                                <Loader2 size={13} className="animate-spin text-red-500" />
                              ) : (
                                <Trash2 size={13} className="text-red-500" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                resetForm();
              }
            }}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-6 py-4 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Tag size={16} />
                  {editId ? "Edit Markup Rule" : "New Markup Rule"}
                </h2>
                {editId && (
                  <p className="text-[10px] text-blue-200 mt-0.5 font-mono">ID: {editId}</p>
                )}
              </div>

              <div className="p-5 space-y-4">

                {/* Debug Info */}
                {debugInfo && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle size={12} /> Error:
                    </p>
                    <pre className="text-[9px] text-red-500 mt-1 whitespace-pre-wrap break-all">
                      {debugInfo}
                    </pre>
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Rule Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TYPE_OPTIONS.map((t) => {
                      const c = C[t.color];
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setField("type", t.value)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition ${
                            form.type === t.value
                              ? `${c.bg} ${c.border} ${c.text}`
                              : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Airline */}
                {needsAirline && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Airline *
                    </label>
                    <select
                      value={form.airlineCode}
                      onChange={(e) => {
                        const a = AIRLINES.find((x) => x.code === e.target.value);
                        setForm((p) => ({
                          ...p,
                          airlineCode: e.target.value,
                          airlineName: a?.name || "",
                        }));
                      }}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    >
                      <option value="">Select Airline</option>
                      {AIRLINES.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Route */}
                {needsRoute && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          Origin *
                        </label>
                        <input
                          type="text"
                          value={form.origin}
                          onChange={(e) => setField("origin", e.target.value.toUpperCase())}
                          placeholder="DAC"
                          maxLength={3}
                          className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono font-bold outline-none transition uppercase placeholder:text-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          Destination *
                        </label>
                        <input
                          type="text"
                          value={form.destination}
                          onChange={(e) => setField("destination", e.target.value.toUpperCase())}
                          placeholder="JED"
                          maxLength={3}
                          className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono font-bold outline-none transition uppercase placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        Route Matching
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: "EXACT", label: `${form.origin || "A"} → ${form.destination || "B"} only` },
                          { value: "BIDIRECTIONAL", label: `${form.origin || "A"} ↔ ${form.destination || "B"} both` },
                        ].map((d) => (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => setField("routeMatchType", d.value)}
                            className={`flex-1 py-2 px-3 rounded-xl border-2 text-[10px] font-bold transition ${
                              form.routeMatchType === d.value
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-gray-100 text-gray-500"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent */}
                {needsAgent && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Agent *
                    </label>
                    <select
                      value={form.agentId}
                      onChange={(e) => setField("agentId", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((a: any) => (
  <option key={a.internalId || a.id} value={a.internalId || a.id}>
    {a.agentId ? `${a.agentId} - ` : ""}
    {a.agentName || a.name || a.email || a.id}
  </option>
))}
                    </select>
                    {agents.length === 0 && (
                      <p className="text-[10px] text-amber-600 mt-1 font-bold">
                        ⚠️ No agents loaded. Check API.
                      </p>
                    )}
                  </div>
                )}

                {/* Amount & Percent */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Fixed Amount
                    </label>
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={form.markupAmount}
                        onChange={(e) => setField("markupAmount", e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 focus:border-indigo-400 rounded-xl text-sm text-gray-800 outline-none transition placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Percentage (%)
                    </label>
                    <div className="relative">
                      <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={form.markupPercent}
                        onChange={(e) => setField("markupPercent", e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 focus:border-indigo-400 rounded-xl text-sm text-gray-800 outline-none transition placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {form.markupAmount && form.markupPercent && (
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-bold">
                      Both amount & percent will be added together
                    </p>
                  </div>
                )}

                {/* Apply On */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Apply Markup On
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "BASE_FARE", label: "Base Fare" },
                      { value: "TOTAL", label: "Total Fare" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField("markupOn", opt.value)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition ${
                          form.markupOn === opt.value
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white border-gray-100 text-gray-500"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Priority{" "}
                    <span className="text-gray-300 font-normal normal-case">(higher wins)</span>
                  </label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setField("priority", e.target.value)}
                    min="0"
                    max="999"
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                  />
                </div>

                {/* Validity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) => setField("validFrom", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Valid To
                    </label>
                    <input
                      type="date"
                      value={form.validTo}
                      onChange={(e) => setField("validTo", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Note (Optional)
                  </label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setField("note", e.target.value)}
                    rows={2}
                    placeholder="Internal note..."
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none resize-none transition placeholder:text-gray-300"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-xs font-bold text-gray-600">Rule Status</span>
                  <button
                    type="button"
                    onClick={() => setField("isActive", !form.isActive)}
                    className="transition hover:scale-105"
                  >
                    {form.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black">
                        <ToggleRight size={14} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-black">
                        <ToggleLeft size={14} /> Inactive
                      </span>
                    )}
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-[#021f3b] hover:bg-[#0a3a6b] text-white font-bold text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    {editId ? "Update" : "Create"} Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}