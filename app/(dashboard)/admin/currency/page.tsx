// app/(dashboard)/admin/currency/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Loader2, CheckCircle2, XCircle, ArrowRight,
  DollarSign, RefreshCw, Globe, TrendingUp,
  Calculator, Banknote, Info,
  ChevronRight, Clock, X,
  Layers,
} from "lucide-react";
import { SUBDOMAIN_CONFIG, type SubdomainConfig } from "@/lib/currency";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Rate {
  id: string;
  subdomain: string;
  countryName: string;
  countryCode: string;
  flag: string;
  currencyCode: string;
  currencyName: string;
  rate: number;
  isActive: boolean;
  note?: string;
  updatedAt: string;
}

interface BaseRate {
  id: string;
  fromCurrency: string;
  buyRate: number;
  sellRate: number;
  countryName: string;
  flag: string;
  isActive: boolean;
  updatedAt: string;
}

interface ConvResult {
  amount: number;
  amountSAR: number;
  rateToSAR: number;
  conversions: {
    subdomain: string;
    country: string;
    flag: string;
    currency: string;
    amountLocal: number;
    rate: number;
  }[];
}

const CURRENCY_PRESETS = [
  { fromCurrency: "USD", countryName: "United States", flag: "🇺🇸" },
  { fromCurrency: "EUR", countryName: "Euro Zone",     flag: "🇪🇺" },
  { fromCurrency: "GBP", countryName: "United Kingdom",flag: "🇬🇧" },
  { fromCurrency: "AED", countryName: "UAE",           flag: "🇦🇪" },
  { fromCurrency: "BDT", countryName: "Bangladesh",    flag: "🇧🇩" },
  { fromCurrency: "INR", countryName: "India",         flag: "🇮🇳" },
  { fromCurrency: "PKR", countryName: "Pakistan",      flag: "🇵🇰" },
  { fromCurrency: "MYR", countryName: "Malaysia",      flag: "🇲🇾" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CurrencyManagement() {

  // ── Subdomain rates ──
  const [rates,   setRates]   = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Base rates ──
  const [baseRates,      setBaseRates]      = useState<BaseRate[]>([]);
  const [baseLoading,    setBaseLoading]    = useState(true);
  const [showBaseModal,  setShowBaseModal]  = useState(false);
  const [editBaseId,     setEditBaseId]     = useState<string | null>(null);
  const [savingBase,     setSavingBase]     = useState(false);
  const [deletingBase,   setDeletingBase]   = useState<string | null>(null);
  const [baseForm, setBaseForm] = useState({
    fromCurrency: "",
    countryName:  "",
    flag:         "",
    buyRate:      "",
    sellRate:     "",
  });

  // ── Subdomain modal ──
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [form, setForm] = useState({
    subdomain: "", countryName: "", countryCode: "",
    flag: "", currencyCode: "", currencyName: "",
    rate: "", isActive: true, note: "",
  });

  // ── UI state ──
  const [search,        setSearch]        = useState("");
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [userId,        setUserId]        = useState("");
  const [showConverter, setShowConverter] = useState(false);
  const [expandedCard,  setExpandedCard]  = useState<string | null>(null);

  // ── Converter ──
  const [convAmount,  setConvAmount]  = useState("500");
  const [convResults, setConvResults] = useState<ConvResult | null>(null);
  const [converting,  setConverting]  = useState(false);

  // USD sell rate (used for preview calculations)
  const usdSarRate = baseRates.find(
    r => r.fromCurrency === "USD" && r.isActive
  )?.sellRate ?? 3.75;

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setUserId(localStorage.getItem("userId") || "");
  }, []);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const setField     = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const setBaseField = (k: string, v: unknown) => setBaseForm(p => ({ ...p, [k]: v }));

  // ─── Fetch subdomain rates ────────────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      const res  = await fetch(`/api/admin/currency?${p}`);
      const data = await res.json();
      setRates(
        Array.isArray(data.rates) ? data.rates :
        Array.isArray(data)       ? data        : []
      );
    } catch {
      showToast("Failed to load rates", false);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // ─── Fetch base rates ─────────────────────────────────────────────────────
  const fetchBaseRates = useCallback(async () => {
    setBaseLoading(true);
    try {
      const res  = await fetch("/api/admin/currency/base-rates");
      const data = await res.json();
      setBaseRates(data.rates || []);
    } catch {
      showToast("Failed to load base rates", false);
    } finally {
      setBaseLoading(false);
    }
  }, []);

  // ── Split useEffect so base rates don't refetch on search change ──
  useEffect(() => { fetchRates(); },     [fetchRates]);
  useEffect(() => { fetchBaseRates(); }, [fetchBaseRates]);

  // ─── Base Rate CRUD ───────────────────────────────────────────────────────
  const resetBaseForm = () => {
    setBaseForm({ fromCurrency: "", countryName: "", flag: "", buyRate: "", sellRate: "" });
    setEditBaseId(null);
  };

  const openEditBase = (r: BaseRate) => {
    setBaseForm({
      fromCurrency: r.fromCurrency,
      countryName:  r.countryName,
      flag:         r.flag,
      buyRate:      String(r.buyRate),
      sellRate:     String(r.sellRate),
    });
    setEditBaseId(r.id);
    setShowBaseModal(true);
  };

  const handleSaveBase = async () => {
    const { fromCurrency, buyRate, sellRate } = baseForm;
    if (!fromCurrency)                          { showToast("Currency required",        false); return; }
    if (!buyRate  || parseFloat(buyRate)  <= 0) { showToast("Valid buy rate required",  false); return; }
    if (!sellRate || parseFloat(sellRate) <= 0) { showToast("Valid sell rate required", false); return; }

    setSavingBase(true);
    try {
      const url    = editBaseId
        ? `/api/admin/currency/base-rates/${editBaseId}`
        : "/api/admin/currency/base-rates";
      const method = editBaseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...baseForm,
          buyRate:      parseFloat(buyRate),
          sellRate:     parseFloat(sellRate),
          createdById:  userId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to save", false);
        return;
      }
      showToast(editBaseId ? "Base rate updated" : "Base rate created");
      setShowBaseModal(false);
      resetBaseForm();
      fetchBaseRates();
    } catch {
      showToast("Failed to save", false);
    } finally {
      setSavingBase(false);
    }
  };

  const toggleBaseActive = async (id: string, current: boolean) => {
    setBaseRates(prev => prev.map(r => r.id === id ? { ...r, isActive: !current } : r));
    try {
      const res = await fetch(`/api/admin/currency/base-rates/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) {
        setBaseRates(prev => prev.map(r => r.id === id ? { ...r, isActive: current } : r));
        showToast("Failed to update", false);
      }
    } catch {
      setBaseRates(prev => prev.map(r => r.id === id ? { ...r, isActive: current } : r));
      showToast("Failed to update", false);
    }
  };

  const handleDeleteBase = async (id: string) => {
    if (!confirm("Delete this base rate?")) return;
    setDeletingBase(id);
    try {
      const res = await fetch(`/api/admin/currency/base-rates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to delete", false);
        return;
      }
      showToast("Base rate deleted");
      setBaseRates(prev => prev.filter(r => r.id !== id));
    } catch {
      showToast("Failed to delete", false);
    } finally {
      setDeletingBase(null);
    }
  };

  // ─── Subdomain Rate CRUD ──────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      subdomain: "", countryName: "", countryCode: "",
      flag: "", currencyCode: "", currencyName: "",
      rate: "", isActive: true, note: "",
    });
    setEditId(null);
  };

  // ✅ Fix: use (typeof SUBDOMAIN_CONFIG)[number] so all items are accepted
  const selectPreset = (sub: SubdomainConfig) => {
    setForm(prev => ({
      ...prev,
      subdomain:    sub.subdomain,
      countryName:  sub.countryName,
      countryCode:  sub.countryCode,
      flag:         sub.flag,
      currencyCode: sub.currencyCode,
      currencyName: sub.currencyName,
    }));
  };

  const openEdit = (r: Rate) => {
    if (!r?.id) return;
    setForm({
      subdomain:    r.subdomain    || "",
      countryName:  r.countryName  || "",
      countryCode:  r.countryCode  || "",
      flag:         r.flag         || "",
      currencyCode: r.currencyCode || "",
      currencyName: r.currencyName || "",
      rate:         r.rate ? String(r.rate) : "",
      isActive:     r.isActive !== false,
      note:         r.note || "",
    });
    setEditId(r.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.subdomain)                          { showToast("Select a country",        false); return; }
    if (!form.currencyCode)                       { showToast("Currency code required",  false); return; }
    if (!form.rate || parseFloat(form.rate) <= 0) { showToast("Enter a valid rate",      false); return; }

    setSaving(true);
    try {
      const url    = editId ? `/api/admin/currency/${editId}` : "/api/admin/currency";
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rate: parseFloat(form.rate),
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed", false); return; }
      showToast(editId ? "Rate updated" : "Rate created");
      setShowModal(false);
      resetForm();
      fetchRates();
    } catch {
      showToast("Failed to save", false);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    setRates(prev => prev.map(r => r.id === id ? { ...r, isActive: !current } : r));
    try {
      const res = await fetch(`/api/admin/currency/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) {
        setRates(prev => prev.map(r => r.id === id ? { ...r, isActive: current } : r));
        showToast("Failed to update", false);
      }
    } catch {
      setRates(prev => prev.map(r => r.id === id ? { ...r, isActive: current } : r));
      showToast("Failed to update", false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm("Delete this currency rate?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/currency/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to delete", false);
        return;
      }
      showToast("Rate deleted");
      setRates(prev => prev.filter(r => r.id !== id));
    } catch {
      showToast("Failed to delete", false);
    } finally {
      setDeleting(null);
    }
  };

  // ─── Converter ────────────────────────────────────────────────────────────
  const handleConvertAll = async () => {
    if (!convAmount) return;
    setConverting(true);
    try {
      const res = await fetch("/api/admin/currency/convert", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(convAmount), fromCurrency: "USD" }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed", false); return; }
      setConvResults(data);
    } catch {
      showToast("Convert failed", false);
    } finally {
      setConverting(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────
  const isFormValid =
    !!form.subdomain &&
    !!form.currencyCode &&
    !!form.rate &&
    parseFloat(form.rate) > 0;

  const isBaseFormValid =
    !!baseForm.fromCurrency &&
    !!baseForm.buyRate  && parseFloat(baseForm.buyRate)  > 0 &&
    !!baseForm.sellRate && parseFloat(baseForm.sellRate) > 0;

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading && !rates.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#021f3b]" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Toast ── */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-5 py-3
            rounded-xl shadow-2xl border text-sm font-bold
            ${toast.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"}`}
          >
            {toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600
              flex items-center justify-center shadow-lg">
              <Banknote size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">Currency Management</h1>
              <p className="text-sm text-gray-500">
                Multi-Source → SAR (Base) → Subdomain Currencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConverter(p => !p)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm
                transition active:scale-95 border
                ${showConverter
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}
            >
              <Calculator size={15} /> Converter
            </button>
            <button
              type="button"
              onClick={() => { resetBaseForm(); setShowBaseModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700
                text-white rounded-xl font-bold text-sm transition active:scale-95 shadow-lg"
            >
              <Plus size={15} /> Base Rate
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#021f3b] hover:bg-[#0a3a6b]
                text-white rounded-xl font-bold text-sm transition active:scale-95 shadow-lg"
            >
              <Plus size={15} /> Add Rate
            </button>
          </div>
        </div>

        {/* ── Flow Indicator ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
              <span className="text-xl">🔌</span>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  API Sources
                </p>
                <p className="text-sm font-black text-slate-700">Multi-Currency</p>
              </div>
            </div>

            <ChevronRight size={16} className="text-gray-300" />

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100
              rounded-xl px-4 py-2.5">
              <span className="text-xl">🇸🇦</span>
              <div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  Base Currency
                </p>
                <p className="text-sm font-black text-emerald-700">
                  SAR &nbsp;
                  <span className="text-emerald-500 font-bold text-xs">
                    ({baseRates.filter(r => r.isActive).length} rates)
                  </span>
                </p>
              </div>
            </div>

            <ChevronRight size={16} className="text-gray-300" />

            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100
              rounded-xl px-4 py-2.5">
              <span className="text-xl">🌍</span>
              <div>
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                  Subdomains
                </p>
                <p className="text-sm font-black text-purple-700">
                  {rates.filter(r => r.isActive).length} Active
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Accepted Sources:
            </p>
            {CURRENCY_PRESETS.map(c => (
              <span key={c.fromCurrency}
                className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {c.flag} {c.fromCurrency}
              </span>
            ))}
          </div>
        </div>

        {/* ── Step 1 — Base Rates ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Step 1
                </p>
                <h2 className="text-sm font-bold text-gray-800">
                  Base Rates — All Currencies → SAR
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {baseRates.length} rates
              </span>
              <button
                type="button"
                onClick={fetchBaseRates}
                disabled={baseLoading}
                className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center
                  transition border border-gray-100"
                title="Refresh"
              >
                <RefreshCw size={13}
                  className={`text-gray-400 ${baseLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="p-4">
            {baseLoading && !baseRates.length ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-gray-300" />
              </div>
            ) : baseRates.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm font-bold text-gray-400">No base rates yet</p>
                <button
                  type="button"
                  onClick={() => { resetBaseForm(); setShowBaseModal(true); }}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600
                    text-white rounded-lg font-bold text-xs"
                >
                  <Plus size={12} /> Add Base Rate
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {baseRates.map(r => (
                  <div key={r.id}
                    className={`rounded-xl border p-3 transition group
                      hover:shadow-sm hover:border-gray-200
                      ${!r.isActive ? "opacity-40 border-gray-100" : "border-gray-100"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{r.flag}</span>
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100
                          px-1.5 py-0.5 rounded">
                          {r.fromCurrency}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5
                        opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => toggleBaseActive(r.id, r.isActive)}
                          title={r.isActive ? "Deactivate" : "Activate"}
                          className={`w-5 h-5 rounded flex items-center justify-center transition
                            ${r.isActive
                              ? "hover:bg-emerald-100 text-emerald-500"
                              : "hover:bg-gray-100 text-gray-400"}`}
                        >
                          {r.isActive
                            ? <ToggleRight size={11} />
                            : <ToggleLeft  size={11} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditBase(r)}
                          title="Edit"
                          className="w-5 h-5 rounded hover:bg-indigo-100 flex items-center
                            justify-center transition"
                        >
                          <Edit2 size={9} className="text-indigo-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBase(r.id)}
                          disabled={deletingBase === r.id}
                          title="Delete"
                          className="w-5 h-5 rounded hover:bg-red-100 flex items-center
                            justify-center transition disabled:opacity-50"
                        >
                          {deletingBase === r.id
                            ? <Loader2 size={9} className="animate-spin text-red-400" />
                            : <Trash2  size={9} className="text-red-400" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-base font-black text-gray-800">
                      {Number(r.sellRate).toFixed(4)}
                    </p>
                    <p className="text-[8px] text-gray-400 font-bold mt-0.5">
                      Sell &nbsp;|&nbsp; Buy: {Number(r.buyRate).toFixed(4)}
                    </p>
                    <p className="text-[7px] text-gray-300 font-bold mt-0.5">
                      1 {r.fromCurrency} = {Number(r.sellRate).toFixed(4)} SAR
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Converter ── */}
        {showConverter && (
          <div className="bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-2xl
            overflow-hidden shadow-xl">
            <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Calculator size={16} className="text-indigo-300" />
                </div>
                <h2 className="text-sm font-black text-white">Live Converter</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowConverter(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20
                  flex items-center justify-center transition"
              >
                <X size={12} className="text-white/60" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex gap-3 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-[9px] font-black text-indigo-300
                    uppercase tracking-widest mb-1.5">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                      text-white/40 font-black">$</span>
                    <input
                      type="number"
                      value={convAmount}
                      onChange={e => setConvAmount(e.target.value)}
                      placeholder="500"
                      className="w-full pl-8 pr-3 py-3 rounded-xl bg-white/10
                        border border-white/15 text-white text-lg font-black outline-none
                        focus:border-indigo-400 transition"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConvertAll}
                  disabled={converting}
                  className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600
                    text-white font-black text-sm transition active:scale-95
                    disabled:opacity-60 flex items-center gap-2"
                >
                  {converting
                    ? <Loader2 size={14} className="animate-spin" />
                    : <RefreshCw size={14} />}
                  Convert
                </button>
              </div>

              {convResults && (
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇺🇸</span>
                      <span className="text-xl font-black text-white">
                        ${Number(convResults.amount).toLocaleString()}
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-emerald-400" />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇸🇦</span>
                      <span className="text-xl font-black text-emerald-400">
                        {Number(convResults.amountSAR).toLocaleString()} SAR
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-300 font-bold ml-auto">
                      @ {convResults.rateToSAR}
                    </span>
                  </div>

                  {convResults.conversions?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {convResults.conversions.map(c => (
                        <div key={c.subdomain}
                          className="bg-white/[0.07] rounded-xl border border-white/10
                            px-3 py-2.5 hover:bg-white/[0.12] transition">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{c.flag}</span>
                            <span className="text-xs font-bold text-white">{c.country}</span>
                          </div>
                          <p className="text-base font-black text-emerald-400">
                            {Number(c.amountLocal).toLocaleString(undefined,
                              { maximumFractionDigits: 0 })}
                            <span className="text-[10px] text-indigo-300 ml-1">
                              {c.currency}
                            </span>
                          </p>
                          <p className="text-[9px] text-indigo-400 mt-0.5">
                            1 SAR = {c.rate}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2 Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Layers size={15} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                Step 2
              </p>
              <h2 className="text-base font-black text-gray-700">
                Subdomain Currency Rates
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {rates.length} Total
            </span>
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {rates.filter(r => r.isActive).length} Active
            </span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search country, currency, subdomain..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200
              rounded-xl text-sm text-gray-800 outline-none focus:border-indigo-400
              transition placeholder:text-gray-300 shadow-sm"
          />
        </div>

        {/* ── Rate Cards ── */}
        {rates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Globe size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="font-bold text-gray-400">No subdomain rates configured</p>
            <button
              type="button"
              onClick={() => { resetForm(); setShowModal(true); }}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5
                bg-[#021f3b] text-white rounded-xl font-bold text-sm"
            >
              <Plus size={15} /> Add First Rate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {rates.map(r => {
              const isExpanded = expandedCard === r.id;
              return (
                <div key={r.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all duration-200
                    ${!r.isActive ? "opacity-40" : ""}
                    ${isExpanded
                      ? "shadow-lg border-indigo-200"
                      : "shadow-sm border-gray-100 hover:shadow-md hover:border-gray-200"}`}
                >
                  {/* Compact Header */}
                  <div
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => setExpandedCard(isExpanded ? null : r.id)}
                  >
                    <span className="text-2xl">{r.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-gray-800 truncate">
                          {r.countryName}
                        </p>
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100
                          px-1.5 py-0.5 rounded shrink-0">
                          {r.currencyCode}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">
                        {r.subdomain}.domain.com
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-indigo-600">
                        {Number(r.rate).toFixed(2)}
                      </p>
                      <p className="text-[8px] text-gray-400 font-bold">per SAR</p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100
                    flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggleActive(r.id, r.isActive); }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md
                          text-[9px] font-bold transition border
                          ${r.isActive
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200"}`}
                      >
                        {r.isActive
                          ? <ToggleRight size={11} />
                          : <ToggleLeft  size={11} />}
                        {r.isActive ? "ON" : "OFF"}
                      </button>
                      <span className="text-[9px] text-gray-400 hidden sm:inline">
                        $100 = {(100 * usdSarRate * Number(r.rate)).toLocaleString(undefined,
                          { maximumFractionDigits: 0 })} {r.currencyCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openEdit(r); }}
                        className="w-7 h-7 rounded-md hover:bg-indigo-50 flex items-center
                          justify-center transition group"
                        title="Edit"
                      >
                        <Edit2 size={12}
                          className="text-gray-400 group-hover:text-indigo-600" />
                      </button>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                        disabled={deleting === r.id}
                        className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center
                          justify-center transition group disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === r.id
                          ? <Loader2 size={12} className="animate-spin text-red-400" />
                          : <Trash2  size={12} className="text-gray-400 group-hover:text-red-500" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-gray-100 space-y-3">
                      <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
                        <p className="text-[8px] font-black text-indigo-400
                          uppercase tracking-widest mb-0.5">
                          Exchange Rate
                        </p>
                        <p className="text-2xl font-black text-indigo-700">
                          {Number(r.rate).toFixed(4)}
                        </p>
                        <p className="text-[9px] text-indigo-500 font-bold mt-0.5">
                          1 🇸🇦 SAR = {Number(r.rate).toFixed(2)} {r.flag} {r.currencyCode}
                        </p>
                      </div>

                      <div className="space-y-1">
                        {[100, 500, 1000, 5000].map(amt => (
                          <div key={amt}
                            className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400">
                              🇸🇦 {amt.toLocaleString()} SAR
                            </span>
                            <span className="font-black text-gray-700">
                              {r.flag} {(amt * Number(r.rate)).toLocaleString(undefined,
                                { maximumFractionDigits: 0 })} {r.currencyCode}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-500
                          uppercase tracking-widest mb-1">
                          Full Chain (USD → SAR → {r.currencyCode})
                        </p>
                        {[100, 500].map(usd => (
                          <div key={usd}
                            className="flex items-center gap-1 text-[9px] font-bold
                              text-emerald-700 mb-0.5 last:mb-0 flex-wrap">
                            <span>🇺🇸 ${usd}</span>
                            <ChevronRight size={8} className="text-emerald-400" />
                            <span>🇸🇦 {(usd * usdSarRate).toFixed(0)} SAR</span>
                            <ChevronRight size={8} className="text-emerald-400" />
                            <span className="font-black">
                              {r.flag} {(usd * usdSarRate * Number(r.rate)).toLocaleString(
                                undefined, { maximumFractionDigits: 0 })} {r.currencyCode}
                            </span>
                          </div>
                        ))}
                      </div>

                      {r.note && (
                        <div className="bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-100">
                          <p className="text-[9px] text-amber-700 font-bold">{r.note}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[9px] text-gray-300">
                        <Clock size={9} />
                        <span>
                          Updated {new Date(r.updatedAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            BASE RATE MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {showBaseModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
              flex items-center justify-center p-4"
            onClick={e => {
              if (e.target === e.currentTarget) {
                setShowBaseModal(false);
                resetBaseForm();
              }
            }}
          >
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4
                flex items-center justify-between">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <DollarSign size={15} />
                  {editBaseId ? "Edit Base Rate" : "Add Base Rate"}
                  <span className="font-normal opacity-70">→ SAR</span>
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowBaseModal(false); resetBaseForm(); }}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20
                    flex items-center justify-center transition"
                >
                  <X size={12} className="text-white/70" />
                </button>
              </div>

              <div className="p-5 space-y-4">

                {/* Currency Presets */}
                {!editBaseId && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-2">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {CURRENCY_PRESETS.map(p => {
                        const exists   = baseRates.some(r => r.fromCurrency === p.fromCurrency);
                        const selected = baseForm.fromCurrency === p.fromCurrency;
                        return (
                          <button
                            key={p.fromCurrency}
                            type="button"
                            disabled={exists}
                            onClick={() => {
                              if (!exists) {
                                setBaseForm(prev => ({
                                  ...prev,
                                  fromCurrency: p.fromCurrency,
                                  countryName:  p.countryName,
                                  flag:         p.flag,
                                }));
                              }
                            }}
                            title={exists ? `${p.fromCurrency} already added` : p.countryName}
                            className={`flex flex-col items-center gap-0.5 py-2 rounded-lg
                              border-2 transition
                              ${selected
                                ? "bg-emerald-50 border-emerald-300"
                                : exists
                                ? "bg-gray-50 border-gray-100 opacity-25 cursor-not-allowed"
                                : "bg-white border-gray-100 hover:border-gray-300"}`}
                          >
                            <span className="text-xl">{p.flag}</span>
                            <span className={`text-[7px] font-black uppercase
                              ${selected ? "text-emerald-600" : "text-gray-400"}`}>
                              {p.fromCurrency}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Currency Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-1">
                      From Currency *
                    </label>
                    <input
                      type="text"
                      value={baseForm.fromCurrency}
                      onChange={e => setBaseField("fromCurrency", e.target.value.toUpperCase())}
                      placeholder="USD"
                      maxLength={3}
                      disabled={!!editBaseId}
                      className="w-full border-2 border-gray-100 focus:border-emerald-400
                        rounded-lg px-3 py-2 text-sm text-gray-800 font-mono font-black
                        outline-none transition uppercase placeholder:text-gray-300
                        disabled:bg-gray-50 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={baseForm.countryName}
                      onChange={e => setBaseField("countryName", e.target.value)}
                      placeholder="United States"
                      className="w-full border-2 border-gray-100 focus:border-emerald-400
                        rounded-lg px-3 py-2 text-sm text-gray-800 outline-none
                        transition placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Buy + Sell Rate */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-blue-500
                      uppercase tracking-widest mb-1">
                      Buy Rate *
                      <span className="text-gray-400 font-normal normal-case ml-1">
                        (you buy SAR)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={baseForm.buyRate}
                      onChange={e => setBaseField("buyRate", e.target.value)}
                      placeholder="3.7400"
                      step="0.0001"
                      min="0"
                      className="w-full border-2 border-blue-100 focus:border-blue-400
                        rounded-lg px-3 py-2.5 text-sm text-gray-800 font-black
                        outline-none transition placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-600
                      uppercase tracking-widest mb-1">
                      Sell Rate *
                      <span className="text-gray-400 font-normal normal-case ml-1">
                        (you sell SAR)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={baseForm.sellRate}
                      onChange={e => setBaseField("sellRate", e.target.value)}
                      placeholder="3.7500"
                      step="0.0001"
                      min="0"
                      className="w-full border-2 border-emerald-100 focus:border-emerald-400
                        rounded-lg px-3 py-2.5 text-sm text-gray-800 font-black
                        outline-none transition placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Preview */}
                {baseForm.fromCurrency && baseForm.sellRate &&
                  parseFloat(baseForm.sellRate) > 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <p className="text-[8px] font-black text-emerald-400
                      uppercase tracking-widest mb-1.5">
                      Preview
                    </p>
                    {[1, 100, 1000].map(amt => (
                      <div key={amt}
                        className="flex justify-between text-[10px] font-bold
                          text-emerald-700 mb-0.5 last:mb-0">
                        <span>
                          {baseForm.flag} {amt} {baseForm.fromCurrency}
                        </span>
                        <span>
                          🇸🇦 {(amt * parseFloat(baseForm.sellRate)).toFixed(4)} SAR
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validation hint */}
                {!isBaseFormValid && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200
                    rounded-lg px-3 py-2">
                    <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] font-bold text-amber-700 space-y-0.5">
                      {!baseForm.fromCurrency && <p>• Enter currency code</p>}
                      {(!baseForm.buyRate || parseFloat(baseForm.buyRate) <= 0) &&
                        <p>• Enter valid buy rate</p>}
                      {(!baseForm.sellRate || parseFloat(baseForm.sellRate) <= 0) &&
                        <p>• Enter valid sell rate</p>}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowBaseModal(false); resetBaseForm(); }}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200
                      text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBase}
                    disabled={savingBase || !isBaseFormValid}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700
                      text-white font-bold text-sm transition active:scale-95
                      disabled:opacity-40 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {savingBase
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    {editBaseId ? "Update" : "Create"} Rate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBDOMAIN RATE MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
              flex items-center justify-center p-4"
            onClick={e => {
              if (e.target === e.currentTarget) { setShowModal(false); resetForm(); }
            }}
          >
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh]
              overflow-y-auto shadow-2xl">

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-5 py-4
                rounded-t-2xl sticky top-0 z-10 flex items-center justify-between">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Banknote size={15} />
                  {editId ? "Edit Subdomain Rate" : "Add Subdomain Rate"}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20
                    flex items-center justify-center transition"
                >
                  <X size={12} className="text-white/70" />
                </button>
              </div>

              <div className="p-5 space-y-4">

                {/* Country Presets */}
                {!editId && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-2">
                      Select Country
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {SUBDOMAIN_CONFIG.map((s: SubdomainConfig) => {
                        const exists   = rates.some(r => r.subdomain === s.subdomain);
                        const selected = form.subdomain === s.subdomain;
                        return (
                          <button
                            key={s.subdomain}
                            type="button"
                            onClick={() => !exists && selectPreset(s)}
                            disabled={exists}
                            title={exists
                              ? `${s.countryName} — already added`
                              : s.countryName}
                            className={`flex flex-col items-center gap-0.5 py-2
                              rounded-lg border-2 transition
                              ${selected
                                ? "bg-indigo-50 border-indigo-300"
                                : exists
                                ? "bg-gray-50 border-gray-100 opacity-25 cursor-not-allowed"
                                : "bg-white border-gray-100 hover:border-gray-300"}`}
                          >
                            <span className="text-lg">{s.flag}</span>
                            <span className={`text-[7px] font-black uppercase
                              ${selected ? "text-indigo-600" : "text-gray-400"}`}>
                              {s.subdomain}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Preview Banner */}
                {form.subdomain && (
                  <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100
                    rounded-xl px-3 py-2.5">
                    <span className="text-lg">🇸🇦</span>
                    <span className="font-black text-indigo-700 text-sm">SAR</span>
                    <ArrowRight size={14} className="text-indigo-400" />
                    <span className="text-lg">{form.flag}</span>
                    <span className="font-black text-indigo-700 text-sm">
                      {form.currencyCode || "?"}
                    </span>
                    <span className="ml-auto text-[9px] text-indigo-500 bg-indigo-100
                      px-2 py-0.5 rounded-full font-bold">
                      {form.subdomain}
                    </span>
                  </div>
                )}

                {/* Subdomain + Currency Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-1">
                      Subdomain *
                    </label>
                    <input
                      type="text"
                      value={form.subdomain}
                      onChange={e => setField("subdomain", e.target.value.toLowerCase())}
                      placeholder="bd"
                      maxLength={5}
                      disabled={!!editId}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400
                        rounded-lg px-3 py-2 text-sm text-gray-800 font-mono font-bold
                        outline-none transition placeholder:text-gray-300
                        disabled:bg-gray-50 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-1">
                      Currency Code *
                    </label>
                    <input
                      type="text"
                      value={form.currencyCode}
                      onChange={e => setField("currencyCode", e.target.value.toUpperCase())}
                      placeholder="BDT"
                      maxLength={3}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400
                        rounded-lg px-3 py-2 text-sm text-gray-800 font-mono font-bold
                        outline-none transition uppercase placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Country + Currency Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={form.countryName}
                      onChange={e => setField("countryName", e.target.value)}
                      placeholder="Bangladesh"
                      className="w-full border-2 border-gray-100 focus:border-indigo-400
                        rounded-lg px-3 py-2 text-sm text-gray-800 outline-none
                        transition placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400
                      uppercase tracking-widest mb-1">
                      Currency Name
                    </label>
                    <input
                      type="text"
                      value={form.currencyName}
                      onChange={e => setField("currencyName", e.target.value)}
                      placeholder="Bangladeshi Taka"
                      className="w-full border-2 border-gray-100 focus:border-indigo-400
                        rounded-lg px-3 py-2 text-sm text-gray-800 outline-none
                        transition placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-[10px] font-black text-emerald-600
                    uppercase tracking-widest mb-1">
                    Rate *
                    <span className="text-gray-400 font-normal normal-case ml-1">
                      (1 SAR = ? {form.currencyCode || "local"})
                    </span>
                  </label>
                  <div className="relative">
                    <TrendingUp size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="number"
                      value={form.rate}
                      onChange={e => setField("rate", e.target.value)}
                      placeholder="30.5000"
                      step="0.0001"
                      min="0"
                      className="w-full pl-9 pr-3 py-3 border-2 border-emerald-100
                        focus:border-emerald-400 rounded-xl text-lg text-gray-800
                        font-black outline-none transition placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Rate Preview */}
                {form.rate && parseFloat(form.rate) > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                    <p className="text-[9px] font-black text-gray-400
                      uppercase tracking-widest mb-1.5">
                      Preview (USD → SAR → {form.currencyCode})
                    </p>
                    {[100, 500, 1000].map(usd => (
                      <div key={usd}
                        className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">
                          🇺🇸 ${usd} → 🇸🇦 {(usd * usdSarRate).toFixed(0)} SAR
                        </span>
                        <span className="font-black text-gray-800">
                          {form.flag} {(usd * usdSarRate * parseFloat(form.rate))
                            .toLocaleString(undefined, { maximumFractionDigits: 0 }
                          )} {form.currencyCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400
                    uppercase tracking-widest mb-1">
                    Note
                  </label>
                  <textarea
                    value={form.note}
                    onChange={e => setField("note", e.target.value)}
                    rows={2}
                    placeholder="Optional..."
                    className="w-full border-2 border-gray-100 focus:border-indigo-400
                      rounded-lg px-3 py-2 text-sm text-gray-800 outline-none
                      resize-none transition placeholder:text-gray-300"
                  />
                </div>

                {/* Validation hints */}
                {!isFormValid && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200
                    rounded-lg px-3 py-2">
                    <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] font-bold text-amber-700 space-y-0.5">
                      {!form.subdomain    && <p>• Select a country or enter subdomain</p>}
                      {!form.currencyCode && <p>• Enter currency code</p>}
                      {(!form.rate || parseFloat(form.rate) <= 0) &&
                        <p>• Enter exchange rate</p>}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200
                      text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !isFormValid}
                    className="flex-1 py-2.5 rounded-xl bg-[#021f3b] hover:bg-[#0a3a6b]
                      text-white font-bold text-sm transition active:scale-95
                      disabled:opacity-40 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {saving
                      ? <Loader2 size={14} className="animate-spin" />
                      : <CheckCircle2 size={14} />}
                    {editId ? "Update" : "Create"} Rate
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