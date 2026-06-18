"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Power,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Plane,
  Sparkles,
  RefreshCw,
  Settings2,
} from "lucide-react";
import {
  getApiProviders,
  toggleApiProvider,
  type ApiProvider,
} from "@/lib/api";

// ════════════════════════════════════════════════
// Provider metadata — gradient + icons + accent
// ════════════════════════════════════════════════
const PROVIDER_META: Record<
  string,
  {
    gradient: string;
    accent: string;
    glow: string;
    icon: string;
    tagline: string;
  }
> = {
  duffel: {
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    accent: "violet",
    glow: "shadow-violet-200/50",
    icon: "✈️",
    tagline: "Premium flight inventory",
  },
  amadeus: {
    gradient: "from-blue-500 via-cyan-500 to-sky-500",
    accent: "blue",
    glow: "shadow-blue-200/50",
    icon: "🌐",
    tagline: "Global GDS network",
  },
  travelpayouts: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    accent: "emerald",
    glow: "shadow-emerald-200/50",
    icon: "🗺️",
    tagline: "Best price aggregator",
  },
};

export default function ApiManagementPage() {
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchProviders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await getApiProviders();
      setProviders(res.data || []);

      if (silent) {
        setToast({ type: "success", message: "Refreshed successfully" });
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to load providers",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggle = async (slug: string, currentStatus: boolean) => {
    const activeCount = providers.filter((p) => p.isActive).length;
    if (currentStatus && activeCount <= 1) {
      setToast({
        type: "error",
        message: "At least one provider must remain active!",
      });
      return;
    }

    setTogglingSlug(slug);

    try {
      await toggleApiProvider(slug, !currentStatus);
      setProviders((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, isActive: !currentStatus } : p
        )
      );
      setToast({
        type: "success",
        message: `${slug} is now ${!currentStatus ? "active ✨" : "inactive"}`,
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || `Failed to toggle ${slug}`,
      });
    } finally {
      setTogglingSlug(null);
    }
  };

  const activeCount = providers.filter((p) => p.isActive).length;
  const inactiveCount = providers.length - activeCount;
  const healthPercent =
    providers.length > 0
      ? Math.round((activeCount / providers.length) * 100)
      : 0;

  // ════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">

        {/* ════════════════════════════════════════════════
            TOAST
            ════════════════════════════════════════════════ */}
        {toast && (
          <div
            className={`
              fixed top-6 right-6 z-50 flex items-center gap-3
              px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
              backdrop-blur-xl border
              animate-in slide-in-from-top-5 fade-in duration-300
              ${
                toast.type === "success"
                  ? "bg-emerald-500/95 border-emerald-400 text-white shadow-emerald-500/30"
                  : "bg-red-500/95 border-red-400 text-white shadow-red-500/30"
              }
            `}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="flex-shrink-0" />
            ) : (
              <XCircle size={18} className="flex-shrink-0" />
            )}
            {toast.message}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            HEADER
            ════════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Settings2 size={26} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  API Management
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Control your flight API providers in real-time
                </p>
              </div>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchProviders(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            STATS CARDS (4-column grid)
            ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Providers */}
          <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-100/50 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Globe size={18} className="text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Total
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {providers.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configured providers
              </p>
            </div>
          </div>

          {/* Active */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 hover:shadow-lg transition-all">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/50 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
                  <Zap size={18} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                  Active
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-700">
                {activeCount}
              </div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online now
              </p>
            </div>
          </div>

          {/* Inactive */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-slate-200/50 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center shadow-md">
                  <Power size={18} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Disabled
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-600">
                {inactiveCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Currently disabled
              </p>
            </div>
          </div>

          {/* Health */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 hover:shadow-lg transition-all">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/50 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Health
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-700">
                  {healthPercent}
                </span>
                <span className="text-lg font-bold text-blue-500">%</span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            CRITICAL ALERTS
            ════════════════════════════════════════════════ */}
        {!loading && activeCount === 0 && (
          <div className="mb-6 flex items-start gap-3 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl px-5 py-4 shadow-md">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-red-200">
              <XCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-700">
                Critical: All providers disabled
              </h3>
              <p className="text-sm text-red-600 mt-0.5">
                No flights will appear in search results. Enable at least one
                provider immediately.
              </p>
            </div>
          </div>
        )}

        {!loading && activeCount === 1 && (
          <div className="mb-6 flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-200">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-700">
                Only 1 provider active
              </h3>
              <p className="text-sm text-amber-600 mt-0.5">
                Cannot disable the last active provider. Enable another one
                first.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            PROVIDERS GRID
            ════════════════════════════════════════════════ */}
        {loading ? (
          // Loading skeleton — 3 column grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-100 rounded w-32" />
                  </div>
                </div>
                <div className="h-20 bg-slate-100 rounded-xl mb-4" />
                <div className="h-11 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-3xl border border-slate-200 py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Globe size={36} className="text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              No providers found
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Run the seed script to add providers
            </p>
          </div>
        ) : (
          // ════════════════════════════════════════════════
          // PROVIDER CARDS GRID — 3 column responsive
          // ════════════════════════════════════════════════
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((provider) => {
              const meta = PROVIDER_META[provider.slug] || {
                gradient: "from-slate-500 to-gray-500",
                accent: "slate",
                glow: "shadow-slate-200/50",
                icon: "🔌",
                tagline: "Flight API provider",
              };
              const isToggling = togglingSlug === provider.slug;
              const isLastActive = provider.isActive && activeCount <= 1;

              return (
                <div
                  key={provider.id}
                  className={`
                    group relative overflow-hidden rounded-3xl border-2
                    transition-all duration-500
                    ${
                      provider.isActive
                        ? `bg-white border-${meta.accent}-200 hover:border-${meta.accent}-300 hover:-translate-y-1 hover:shadow-xl ${meta.glow}`
                        : "bg-slate-50/50 border-slate-200 opacity-75 hover:opacity-100"
                    }
                  `}
                >
                  {/* Gradient header background */}
                  <div
                    className={`
                      absolute top-0 left-0 right-0 h-32
                      bg-gradient-to-br ${meta.gradient}
                      ${provider.isActive ? "opacity-10" : "opacity-5"}
                      group-hover:opacity-20 transition-opacity duration-500
                    `}
                  />

                  {/* Status indicator dot (top-right corner) */}
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold
                        backdrop-blur-md border
                        ${
                          provider.isActive
                            ? "bg-emerald-500/90 border-emerald-400 text-white"
                            : "bg-slate-400/90 border-slate-300 text-white"
                        }
                      `}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          provider.isActive
                            ? "bg-white animate-pulse"
                            : "bg-slate-200"
                        }`}
                      />
                      {provider.isActive ? "LIVE" : "OFFLINE"}
                    </div>
                  </div>

                  <div className="relative p-6">

                    {/* ── Top: Icon + Name ── */}
                    <div className="flex items-start gap-4 mb-5">

                      {/* Icon with gradient bg */}
                      <div
                        className={`
                          w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                          flex-shrink-0 shadow-lg transition-transform group-hover:scale-110
                          ${
                            provider.isActive
                              ? `bg-gradient-to-br ${meta.gradient} ${meta.glow}`
                              : "bg-gradient-to-br from-slate-300 to-slate-400"
                          }
                        `}
                      >
                        <span className="drop-shadow-md">{meta.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 truncate">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {meta.tagline}
                        </p>
                      </div>
                    </div>

                    {/* ── Description box ── */}
                    <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 mb-4">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {provider.description ||
                          `${provider.name} flight search API integration`}
                      </p>
                    </div>

                    {/* ── Meta info ── */}
                    <div className="flex items-center gap-3 mb-4 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>
                          {new Date(provider.updatedAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                      <div className="w-px h-3 bg-slate-300" />
                      <div className="flex items-center gap-1">
                        <Shield size={11} />
                        <span className="font-mono uppercase">
                          {provider.slug}
                        </span>
                      </div>
                    </div>

                    {/* ── Toggle Button ── */}
                    <button
                      onClick={() =>
                        handleToggle(provider.slug, provider.isActive)
                      }
                      disabled={isToggling || isLastActive}
                      title={
                        isLastActive
                          ? "Cannot disable — last active provider"
                          : provider.isActive
                          ? "Click to disable"
                          : "Click to enable"
                      }
                      className={`
                        w-full flex items-center justify-center gap-2
                        px-4 py-3 rounded-xl font-semibold text-sm
                        transition-all duration-200
                        ${
                          isToggling || isLastActive
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md"
                        }
                        ${
                          provider.isActive
                            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-200"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200"
                        }
                      `}
                    >
                      {isToggling ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : provider.isActive ? (
                        <>
                          <Power size={16} />
                          Turn OFF
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Activate
                        </>
                      )}
                    </button>

                    {/* ── Bottom warning (if last active) ── */}
                    {isLastActive && (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-200">
                        <AlertCircle size={12} className="flex-shrink-0" />
                        <span>Last active — cannot disable</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            INFO PANEL — 2 column grid
            ════════════════════════════════════════════════ */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* How it works */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <Zap size={16} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-blue-900">How it works</h3>
            </div>
            <ul className="space-y-2 text-xs text-blue-700">
              <li className="flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Toggling a provider takes effect <strong>instantly</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Disabled providers stop appearing in search results
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  No server restart needed — fully dynamic
                </span>
              </li>
            </ul>
          </div>

          {/* Safety */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
                <Shield size={16} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">
                Safety guards
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-emerald-700">
              <li className="flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>
                  At least <strong>one provider</strong> must remain active
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>Auto-cached for 30 seconds for performance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>Changes logged with timestamps</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}