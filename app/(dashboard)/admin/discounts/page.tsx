// app/(dashboard)/admin/discounts/page.tsx

"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Plane, MapPin, Users, Globe, DollarSign, Percent,
  Loader2, CheckCircle2, XCircle, Info, AlertTriangle,
  Gift, Copy,
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
  { value: "PROMO",         label: "Promo Code",      color: "pink"    },
  { value: "CAMPAIGN",      label: "Campaign",        color: "teal"    },
];

const C: Record<string, Record<string, string>> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200"  },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200"  },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
  pink:    { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200"    },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"    },
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
  { code: "EY", name: "Etihad Airways"     },
  { code: "AI", name: "Air India"          },
  { code: "FZ", name: "Fly Dubai"          },
  { code: "G9", name: "Air Arabia"         },
  { code: "MH", name: "Malaysia Airlines"  },
  { code: "SQ", name: "Singapore Airlines" },
];

const AGENT_TIERS = [
  { value: "",         label: "All Tiers" },
  { value: "BRONZE",   label: "Bronze"    },
  { value: "SILVER",   label: "Silver"    },
  { value: "GOLD",     label: "Gold"      },
  { value: "PLATINUM", label: "Platinum"  },
];

const CABIN_CLASSES = [
  { value: "",                 label: "All Classes"     },
  { value: "economy",         label: "Economy"         },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business",        label: "Business"        },
  { value: "first",           label: "First Class"     },
];

const EMPTY_FORM = {
  type: "GLOBAL",
  name: "",
  description: "",
  discountType: "FLAT",
  discountValue: "",
  discountOn: "TOTAL",
  maxDiscount: "",
  minFare: "",
  airlineCode: "",
  airlineName: "",
  origin: "",
  destination: "",
  routeMatchType: "EXACT",
  cabinClass: "",
  agentId: "",
  agentTier: "",
  promoCode: "",
  validFrom: "",
  validTo: "",
  maxUsageTotal: "",
  maxUsagePerAgent: "",
  priority: "10",
  isActive: true,
  isStackable: false,
  currency: "SAR",
};

// ==================== HELPERS ====================

// ✅ ID sanitize — empty string / null → null
const cleanId = (val: any): string | null => {
  if (!val) return null;
  const s = String(val).trim();
  return s === "" || s === "null" || s === "undefined" ? null : s;
};

// ==================== COMPONENT ====================

export default function DiscountManagement() {
  const [discounts, setDiscounts]       = useState<any[]>([]);
  const [agents, setAgents]             = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [toggling, setToggling]         = useState<string | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [filterType, setFilterType]     = useState("");
  const [search, setSearch]             = useState("");
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);
  const [form, setForm]                 = useState({ ...EMPTY_FORM });
  const [userId, setUserId]             = useState("");
  const [debugInfo, setDebugInfo]       = useState<string>("");

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("userId") || "");
  }, []);

  const showToast = useCallback((msg: string, ok = true) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, ok });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ==================== AGENT HELPERS ====================

  // ✅ dropdown value — real DB user id
  const getAgentValue = useCallback((obj: any): string => {
    return String(obj?.userId || obj?.user?.id || obj?.id || "");
  }, []);

  // ✅ dropdown display name
  const getAgentDisplayName = useCallback((obj: any): string => {
    if (!obj) return "";
    if (obj.agentName) return obj.agentName;
    if (obj.agent?.agentName) return obj.agent.agentName;
    if (obj.agent?.firstName || obj.agent?.lastName)
      return `${obj.agent?.firstName || ""} ${obj.agent?.lastName || ""}`.trim();
    if (obj.firstName || obj.lastName)
      return `${obj.firstName || ""} ${obj.lastName || ""}`.trim();
    return obj.email || obj.id || "";
  }, []);

  // ==================== FETCH DISCOUNTS ====================

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filterType) p.set("type", filterType);
      if (search) p.set("search", search);

      const data = await apiClient(`/admin/discount-rules?${p.toString()}`);
      setDiscounts(data.data || []);
    } catch (err: any) {
      console.error("Discounts fetch error:", err);
      showToast(err.message || "Failed to load discounts", false);
    } finally {
      setLoading(false);
    }
  }, [filterType, search, showToast]);

  // ==================== FETCH AGENTS ====================

  const fetchAgents = useCallback(async () => {
    setAgentLoading(true);
    try {
      const data = await apiClient(`/admin/agents?limit=500`);

      let agentList: any[] = [];
      if (Array.isArray(data))              agentList = data;
      else if (Array.isArray(data?.data))   agentList = data.data;
      else if (Array.isArray(data?.agents)) agentList = data.agents;
      else if (Array.isArray(data?.users))  agentList = data.users;

      setAgents(agentList);
    } catch (err: any) {
      console.error("Agents fetch error:", err);

      if (String(err?.message || "").includes("401")) {
        showToast("Session expired. Please login again.", false);
      }

      setAgents([]);
    } finally {
      setAgentLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);
  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setDebugInfo("");
  }, []);

  // ==================== COMPUTED ====================

  const getTypeConfig = (type: string) =>
    TYPE_OPTIONS.find((t) => t.value === type) || TYPE_OPTIONS[0];

  const isExpired    = (v: string | null) => v ? new Date(v) < new Date() : false;
  const isNotStarted = (v: string | null) => v ? new Date(v) > new Date() : false;

  const setField = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const needsAirline = ["AIRLINE", "AIRLINE_AGENT"].includes(form.type);
  const needsRoute   = ["ROUTE", "ROUTE_AGENT"].includes(form.type);
  const needsAgent   = ["AGENT", "AIRLINE_AGENT", "ROUTE_AGENT"].includes(form.type);

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      if (filterType && d.type !== filterType) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const agentName = getAgentDisplayName(d).toLowerCase();
      return (
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.promoCode?.toLowerCase().includes(q) ||
        d.airlineCode?.toLowerCase().includes(q) ||
        d.origin?.toLowerCase().includes(q) ||
        d.destination?.toLowerCase().includes(q) ||
        d.agentTier?.toLowerCase().includes(q) ||
        agentName.includes(q)
      );
    });
  }, [discounts, filterType, search, getAgentDisplayName]);

  // ==================== BUILD BODY ====================
  // ✅ সব API call এ same body builder use হবে

  const buildBody = useCallback((formData: typeof form, isEdit: boolean) => {
    const airline = AIRLINES.find((a) => a.code === formData.airlineCode);
    const typeNeedsAgent = ["AGENT", "AIRLINE_AGENT", "ROUTE_AGENT"].includes(formData.type);

    return {
      type: formData.type,
      name: formData.name?.trim() || "",
      description: formData.description || null,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      discountOn: formData.discountOn || "TOTAL",
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      minFare: formData.minFare ? parseFloat(formData.minFare) : null,
      airlineCode: formData.airlineCode || null,
      airlineName: airline?.name || formData.airlineName || null,
      origin: formData.origin || null,
      destination: formData.destination || null,
      routeMatchType: formData.routeMatchType || "EXACT",
      cabinClass: formData.cabinClass || null,
      agentId: typeNeedsAgent ? cleanId(formData.agentId) : null,
      agentTier: formData.agentTier || null,
      promoCode: formData.promoCode || null,
      validFrom: formData.validFrom || null,
      validTo: formData.validTo || null,
      maxUsageTotal: formData.maxUsageTotal ? parseInt(formData.maxUsageTotal) : null,
      maxUsagePerAgent: formData.maxUsagePerAgent ? parseInt(formData.maxUsagePerAgent) : null,
      priority: parseInt(formData.priority) || 10,
      isActive: formData.isActive,
      isStackable: formData.isStackable,
      currency: formData.currency || "SAR",
      ...(isEdit
        ? { updatedById: cleanId(userId) }
        : { createdById: cleanId(userId) }),
    };
  }, [userId]);

  // ==================== OPEN EDIT ====================

  const openEdit = useCallback((d: any) => {
    setForm({
      type: d.type || "GLOBAL",
      name: d.name || "",
      description: d.description || "",
      discountType: d.discountType || "FLAT",
      discountValue: d.discountValue != null ? String(d.discountValue) : "",
      discountOn: d.discountOn || "TOTAL",
      maxDiscount: d.maxDiscount != null ? String(d.maxDiscount) : "",
      minFare: d.minFare != null ? String(d.minFare) : "",
      airlineCode: d.airlineCode || "",
      airlineName: d.airlineName || "",
      origin: d.origin || "",
      destination: d.destination || "",
      routeMatchType: d.routeMatchType || "EXACT",
      cabinClass: d.cabinClass || "",
      agentId: d.agentId || "",
      agentTier: d.agentTier || "",
      promoCode: d.promoCode || "",
      validFrom: d.validFrom ? d.validFrom.slice(0, 10) : "",
      validTo: d.validTo ? d.validTo.slice(0, 10) : "",
      maxUsageTotal: d.maxUsageTotal != null ? String(d.maxUsageTotal) : "",
      maxUsagePerAgent: d.maxUsagePerAgent != null ? String(d.maxUsagePerAgent) : "",
      priority: d.priority != null ? String(d.priority) : "10",
      isActive: d.isActive !== false,
      isStackable: d.isStackable || false,
      currency: d.currency || "SAR",
    });
    setEditId(d.id);
    setTimeout(() => setShowModal(true), 50);
  }, []);

  // ==================== SAVE (CREATE / UPDATE) ====================

  const handleSave = async () => {
    if (!form.name.trim())                         { showToast("Rule name is required!", false); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { showToast("Discount value must be > 0!", false); return; }
    if (needsAirline && !form.airlineCode)         { showToast("Please select an airline!", false); return; }
    if (needsRoute && (!form.origin || !form.destination)) { showToast("Please enter origin and destination!", false); return; }
    if (needsAgent && !form.agentId)               { showToast("Please select an agent!", false); return; }

    setSaving(true);
    setDebugInfo("");

    try {
      const url    = editId ? `/admin/discount-rules/${editId}` : "/admin/discount-rules";
      const method = editId ? "PUT" : "POST";
      const body   = buildBody(form, !!editId);

      const data = await apiClient(url, {
        method,
        body: JSON.stringify(body),
      });

      showToast(editId ? "Discount updated successfully!" : "Discount created successfully!");
      setShowModal(false);
      resetForm();
      fetchDiscounts();
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err.message || "Failed to save discount", false);
      setDebugInfo(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE ====================

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount rule?")) return;

    setDeleting(id);
    try {
      await apiClient(`/admin/discount-rules/${id}`, { method: "DELETE" });
      showToast("Discount deleted successfully!");
      fetchDiscounts();
    } catch (err: any) {
      showToast(err.message || "Failed to delete", false);
    } finally {
      setDeleting(null);
    }
  };

  // ==================== TOGGLE ACTIVE ====================

  const toggleActive = async (d: any) => {
    const newStatus = !d.isActive;
    setToggling(d.id);

    setDiscounts((prev) =>
      prev.map((item) => item.id === d.id ? { ...item, isActive: newStatus } : item)
    );

    try {
      const toggleForm = {
        ...EMPTY_FORM,
        type: d.type || "GLOBAL",
        name: d.name || "",
        description: d.description || "",
        discountType: d.discountType || "FLAT",
        discountValue: d.discountValue != null ? String(d.discountValue) : "0",
        discountOn: d.discountOn || "TOTAL",
        maxDiscount: d.maxDiscount != null ? String(d.maxDiscount) : "",
        minFare: d.minFare != null ? String(d.minFare) : "",
        airlineCode: d.airlineCode || "",
        origin: d.origin || "",
        destination: d.destination || "",
        routeMatchType: d.routeMatchType || "EXACT",
        cabinClass: d.cabinClass || "",
        agentId: d.agentId || "",
        agentTier: d.agentTier || "",
        promoCode: d.promoCode || "",
        validFrom: d.validFrom || "",
        validTo: d.validTo || "",
        maxUsageTotal: d.maxUsageTotal != null ? String(d.maxUsageTotal) : "",
        maxUsagePerAgent: d.maxUsagePerAgent != null ? String(d.maxUsagePerAgent) : "",
        priority: d.priority != null ? String(d.priority) : "10",
        isActive: newStatus,
        isStackable: d.isStackable || false,
        currency: d.currency || "SAR",
      };

      const body = buildBody(toggleForm, true);

      await apiClient(`/admin/discount-rules/${d.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      showToast(newStatus ? "Discount activated!" : "Discount deactivated!", true);
      fetchDiscounts();
    } catch (err: any) {
      setDiscounts((prev) =>
        prev.map((item) => item.id === d.id ? { ...item, isActive: d.isActive } : item)
      );
      showToast(err.message || "Failed to update", false);
    } finally {
      setToggling(null);
    }
  };

  // ==================== RENDER ====================

  if (loading && !discounts.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#021f3b] mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-bold">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* TOAST */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-bold transition-all duration-300 ${
            toast.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {toast.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {toast.msg}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Gift size={22} className="text-emerald-600" />
              Discount Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Route, Airline, Agent & Promo discount rules ({filteredDiscounts.length} total)
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#021f3b] hover:bg-[#0a3a6b] text-white rounded-xl font-bold text-sm transition active:scale-95 shadow-lg"
          >
            <Plus size={16} /> Add Discount Rule
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {TYPE_OPTIONS.map((t) => {
            const c = C[t.color];
            const count = discounts.filter((d) => d.type === t.value && d.isActive).length;
            const total = discounts.filter((d) => d.type === t.value).length;
            const sel = filterType === t.value;
            return (
              <button key={t.value}
                onClick={() => setFilterType(sel ? "" : t.value)}
                className={`rounded-xl p-3 border-2 text-left transition hover:shadow-md ${sel ? `${c.bg} ${c.border}` : "bg-white border-gray-100"}`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${sel ? c.text : "text-gray-400"}`}>{t.label}</p>
                <p className="text-2xl font-black text-gray-800">
                  {count}{total > count && <span className="text-xs text-gray-300 font-normal">/{total}</span>}
                </p>
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, promo code, airline, route, agent..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="text-center py-16">
              <Gift size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="font-bold text-gray-400">No discount rules found</p>
              <p className="text-sm text-gray-300 mt-1">{search || filterType ? "Try clearing your filters" : 'Click "Add Discount Rule" to start'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Type","Scope","Discount","On","Promo","Usage","Validity","Status","Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDiscounts.map((d) => {
                    const tc = getTypeConfig(d.type);
                    const c  = C[tc.color];
                    const exp  = isExpired(d.validTo);
                    const pend = isNotStarted(d.validFrom);
                    const isTogglingThis = toggling === d.id;
                    const isDeletingThis = deleting === d.id;
                    const agentName = getAgentDisplayName(d);

                    return (
                      <tr key={d.id} className={`hover:bg-gray-50/50 transition ${!d.isActive || exp ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${c.bg} ${c.text} ${c.border}`}>{tc.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="font-black text-gray-800 text-xs">{d.name}</p>
                            {d.airlineCode && (
                              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700"><Plane size={11} className="text-gray-400" />{d.airlineCode}</p>
                            )}
                            {d.origin && d.destination && (
                              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <MapPin size={11} className="text-gray-400" />{d.origin} → {d.destination}
                                {d.routeMatchType === "BIDIRECTIONAL" && <span className="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">↔</span>}
                              </p>
                            )}
                            {agentName && (
                              <p className="flex items-center gap-1.5 text-xs font-bold text-gray-700"><Users size={11} className="text-gray-400" />{agentName}</p>
                            )}
                            {d.agentTier && <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Tier: {d.agentTier}</span>}
                            {d.type === "GLOBAL" && !d.airlineCode && !d.origin && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-400 italic"><Globe size={11} /> All bookings</p>
                            )}
                            {d.isStackable && (
                              <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded"><Copy size={8} className="inline mr-0.5" /> Stackable</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1 font-black text-gray-800 text-xs">
                            {d.discountType === "FLAT"
                              ? <><DollarSign size={11} className="text-emerald-500" />{d.currency} {Number(d.discountValue).toLocaleString()}</>
                              : <><Percent size={11} className="text-indigo-500" />{Number(d.discountValue)}%</>
                            }
                          </span>
                          {d.maxDiscount && <p className="text-[9px] text-gray-400 mt-0.5">Max: {d.currency} {d.maxDiscount}</p>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{d.discountOn === "TOTAL" ? "Total" : "Base"}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {d.promoCode
                            ? <span className="text-[10px] font-black text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">🎟️ {d.promoCode}</span>
                            : <span className="text-gray-300 text-xs">Auto</span>
                          }
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-black text-gray-700">{d.currentUsage || d._count?.usageLogs || 0}</span>
                          {d.maxUsageTotal && <span className="text-[10px] text-gray-400">/{d.maxUsageTotal}</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {exp ? <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Expired</span>
                           : pend ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Not Started</span>
                           : d.validTo ? <span className="text-[10px] font-bold text-gray-500">Until {new Date(d.validTo).toLocaleDateString("en-GB")}</span>
                           : <span className="text-[10px] text-gray-300">No Expiry</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!isTogglingThis) toggleActive(d); }}
                            disabled={isTogglingThis} className="transition hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                          >
                            {isTogglingThis
                              ? <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-black"><Loader2 size={12} className="animate-spin" /> ...</span>
                              : d.isActive
                                ? <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black"><ToggleRight size={12} /> Active</span>
                                : <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-black"><ToggleLeft size={12} /> Off</span>
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(d); }}
                              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition hover:scale-110" title="Edit"
                            >
                              <Edit2 size={13} className="text-indigo-600" />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(d.id); }}
                              disabled={isDeletingThis}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition hover:scale-110 disabled:opacity-50 disabled:cursor-wait" title="Delete"
                            >
                              {isDeletingThis ? <Loader2 size={13} className="animate-spin text-red-500" /> : <Trash2 size={13} className="text-red-500" />}
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

        {/* ==================== MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}
          >
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-6 py-4 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Gift size={16} />{editId ? "Edit Discount Rule" : "New Discount Rule"}
                </h2>
                {editId && <p className="text-[10px] text-blue-200 mt-0.5 font-mono">ID: {editId}</p>}
              </div>

              <div className="p-5 space-y-4">

                {debugInfo && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> Debug Info:</p>
                    <pre className="text-[9px] text-red-500 mt-1 whitespace-pre-wrap break-all">{debugInfo}</pre>
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rule Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TYPE_OPTIONS.map((t) => {
                      const c = C[t.color];
                      return (
                        <button key={t.value} type="button" onClick={() => setField("type", t.value)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition ${
                            form.type === t.value ? `${c.bg} ${c.border} ${c.text}` : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                          }`}>{t.label}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rule Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Eid Special Offer"
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-300" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2} placeholder="Optional description..."
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none resize-none transition placeholder:text-gray-300" />
                </div>

                {/* Airline */}
                {needsAirline && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Airline *</label>
                    <select value={form.airlineCode}
                      onChange={(e) => {
                        const a = AIRLINES.find((x) => x.code === e.target.value);
                        setForm((p) => ({ ...p, airlineCode: e.target.value, airlineName: a?.name || "" }));
                      }}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    >
                      <option value="">Select Airline</option>
                      {AIRLINES.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Route */}
                {needsRoute && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Origin *</label>
                        <input type="text" value={form.origin} onChange={(e) => setField("origin", e.target.value.toUpperCase())} placeholder="DAC" maxLength={3}
                          className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono font-bold outline-none transition uppercase placeholder:text-gray-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Destination *</label>
                        <input type="text" value={form.destination} onChange={(e) => setField("destination", e.target.value.toUpperCase())} placeholder="DXB" maxLength={3}
                          className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono font-bold outline-none transition uppercase placeholder:text-gray-300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Route Matching</label>
                      <div className="flex gap-2">
                        {[
                          { value: "EXACT", label: `${form.origin || "A"} → ${form.destination || "B"} only` },
                          { value: "BIDIRECTIONAL", label: `${form.origin || "A"} ↔ ${form.destination || "B"} both` },
                        ].map((opt) => (
                          <button key={opt.value} type="button" onClick={() => setField("routeMatchType", opt.value)}
                            className={`flex-1 py-2 px-3 rounded-xl border-2 text-[10px] font-bold transition ${
                              form.routeMatchType === opt.value ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-100 text-gray-500"
                            }`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Agent — fixed dropdown with real DB user id */}
                {needsAgent && (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
      Agent *
      {agentLoading && (
        <span className="ml-2 text-indigo-500 normal-case font-medium">
          Loading...
        </span>
      )}
    </label>

    <select
      value={form.agentId}
      onChange={(e) => setField("agentId", e.target.value)}
      disabled={agentLoading}
      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition disabled:bg-gray-50"
    >
      <option value="">Select Agent</option>
      {agents.map((a: any) => {
  const val = String(a.internalId || a.id || "");
  const label = a.agentId
    ? `${a.agentId} - ${a.agentName || a.name || a.email || ""}`
    : a.agentName || a.name || a.email || a.id;
  return <option key={val} value={val}>{label}</option>;
})}
    </select>

    {!agentLoading && agents.length === 0 && (
      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-600 font-bold">
        <AlertTriangle size={11} />
        No agents loaded.
        <button
          type="button"
          onClick={fetchAgents}
          className="underline hover:text-amber-700"
        >
          Retry
        </button>
      </div>
    )}
  </div>
)}

                {/* Discount Type + Value */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Discount Type *</label>
                  <div className="flex gap-2 mb-3">
                    {[
                      { value: "FLAT", label: "Fixed Amount", icon: <DollarSign size={13} /> },
                      { value: "PERCENT", label: "Percentage %", icon: <Percent size={13} /> },
                    ].map((dt) => (
                      <button key={dt.value} type="button" onClick={() => setField("discountType", dt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-bold transition ${
                          form.discountType === dt.value ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-100 text-gray-500"
                        }`}>{dt.icon} {dt.label}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        {form.discountType === "FLAT" ? "Amount (SAR)" : "Percentage"} *
                      </label>
                      <div className="relative">
                        {form.discountType === "FLAT"
                          ? <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          : <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        }
                        <input type="number" value={form.discountValue} onChange={(e) => setField("discountValue", e.target.value)}
                          placeholder="0" min="0" step={form.discountType === "PERCENT" ? "0.1" : "1"}
                          className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 focus:border-indigo-400 rounded-xl text-sm text-gray-800 outline-none transition placeholder:text-gray-300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Apply On</label>
                      <div className="flex gap-2">
                        {[{ value: "BASE_FARE", label: "Base Fare" }, { value: "TOTAL", label: "Total Fare" }].map((opt) => (
                          <button key={opt.value} type="button" onClick={() => setField("discountOn", opt.value)}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition ${
                              form.discountOn === opt.value ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-100 text-gray-500"
                            }`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Max Cap & Min Fare */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Max Discount Cap</label>
                    <input type="number" value={form.maxDiscount} onChange={(e) => setField("maxDiscount", e.target.value)} placeholder="No limit" min="0"
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Min Fare to Qualify</label>
                    <input type="number" value={form.minFare} onChange={(e) => setField("minFare", e.target.value)} placeholder="No minimum" min="0"
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-300" />
                  </div>
                </div>

                {/* Agent Tier & Cabin Class */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Agent Tier</label>
                    <select value={form.agentTier} onChange={(e) => setField("agentTier", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    >
                      {AGENT_TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Cabin Class</label>
                    <select value={form.cabinClass} onChange={(e) => setField("cabinClass", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition"
                    >
                      {CABIN_CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Promo Code */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Promo Code <span className="text-gray-300 font-normal normal-case">(leave empty = auto-apply)</span>
                  </label>
                  <input type="text" value={form.promoCode} onChange={(e) => setField("promoCode", e.target.value.toUpperCase())} placeholder="e.g. EID2025"
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 uppercase font-mono font-bold outline-none transition placeholder:text-gray-300 placeholder:font-normal" />
                </div>

                {/* Validity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Valid From</label>
                    <input type="date" value={form.validFrom} onChange={(e) => setField("validFrom", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Valid To</label>
                    <input type="date" value={form.validTo} onChange={(e) => setField("validTo", e.target.value)}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition" />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Max Total Usage</label>
                    <input type="number" value={form.maxUsageTotal} onChange={(e) => setField("maxUsageTotal", e.target.value)} placeholder="Unlimited" min="0"
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Max Per Agent</label>
                    <input type="number" value={form.maxUsagePerAgent} onChange={(e) => setField("maxUsagePerAgent", e.target.value)} placeholder="Unlimited" min="0"
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-300" />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Priority <span className="text-gray-300 font-normal normal-case">(higher wins)</span>
                  </label>
                  <input type="number" value={form.priority} onChange={(e) => setField("priority", e.target.value)} min="0" max="999"
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition" />
                </div>

                {/* Active + Stackable */}
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-gray-600">Status</span>
                    <button type="button" onClick={() => setField("isActive", !form.isActive)} className="transition hover:scale-105">
                      {form.isActive
                        ? <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black"><ToggleRight size={14} /> Active</span>
                        : <span className="inline-flex items-center gap-1.5 text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-black"><ToggleLeft size={14} /> Inactive</span>
                      }
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-gray-600">Stackable</span>
                    <button type="button" onClick={() => setField("isStackable", !form.isStackable)} className="transition hover:scale-105">
                      {form.isStackable
                        ? <span className="inline-flex items-center gap-1.5 text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-black"><ToggleRight size={14} /> Yes</span>
                        : <span className="inline-flex items-center gap-1.5 text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-black"><ToggleLeft size={14} /> No</span>
                      }
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 font-bold">
                    Higher priority rules apply first. Stackable rules combine with the best rule. Promo code rules only apply when user enters the code.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition">Cancel</button>
                  <button type="button" onClick={handleSave} disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-[#021f3b] hover:bg-[#0a3a6b] text-white font-bold text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
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