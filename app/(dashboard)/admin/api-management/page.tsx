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
} from "lucide-react";
import {
  getApiProviders,
  toggleApiProvider,
  type ApiProvider,
} from "@/lib/api"; // ✅ তোমার existing api.ts থেকে import

// ── Provider metadata
const PROVIDER_META: Record<
  string,
  { color: string; bg: string; border: string; icon: string }
> = {
  duffel: {
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "✈️",
  },
  amadeus: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "🌐",
  },
  travelpayouts: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "🗺️",
  },
};

export default function ApiManagementPage() {
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Fetch on mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // ── Auto hide toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Fetch all providers
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await getApiProviders();
      setProviders(res.data || []);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || "Failed to load providers",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle provider on/off
  const handleToggle = async (slug: string, currentStatus: boolean) => {
    // ✅ কমপক্ষে ১টা active থাকতে হবে
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

      // ✅ Optimistic update — DB response wait না করে UI update
      setProviders((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, isActive: !currentStatus } : p
        )
      );

      setToast({
        type: "success",
        message: `${slug} is now ${!currentStatus ? "active ✅" : "inactive ❌"}`,
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

  // ==================== RENDER ====================
  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`
            fixed top-5 right-5 z-50 flex items-center gap-2
            px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            animate-in slide-in-from-top-2 duration-300
            ${
              toast.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }
          `}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} className="flex-shrink-0" />
          ) : (
            <XCircle size={16} className="flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              API Management
            </h1>
            <p className="text-sm text-slate-500">
              Control which flight API providers are active
            </p>
          </div>
        </div>

        {/* ── Active / Inactive summary pills ── */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-700 font-medium">
              {activeCount} Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span className="text-slate-600 font-medium">
              {inactiveCount} Inactive
            </span>
          </div>
        </div>
      </div>

      {/* ── Warning: only 1 active ── */}
      {!loading && activeCount <= 1 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle
            size={16}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Warning:</span> Only 1 provider is
            active. You cannot disable it until another provider is enabled.
          </p>
        </div>
      )}

      {/* ── All providers disabled ── */}
      {!loading && activeCount === 0 && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-3">
          <XCircle
            size={16}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Critical:</span> All providers are
            disabled! No flights will appear in search results.
          </p>
        </div>
      )}

      {/* ── Provider Cards ── */}
      {loading ? (
        // Loading skeleton
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-slate-200 p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                </div>
                <div className="w-24 h-10 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        // Empty state
        <div className="text-center py-20 text-slate-400">
          <Globe size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No providers found</p>
          <p className="text-sm mt-1">
            Run the seed script to add providers
          </p>
        </div>
      ) : (
        // Provider list
        <div className="grid gap-4">
          {providers.map((provider) => {
            const meta = PROVIDER_META[provider.slug] || {
              color: "text-slate-700",
              bg: "bg-slate-50",
              border: "border-slate-200",
              icon: "🔌",
            };
            const isToggling = togglingSlug === provider.slug;
            const isLastActive =
              provider.isActive && activeCount <= 1;

            return (
              <div
                key={provider.id}
                className={`
                  rounded-2xl border-2 p-5
                  transition-all duration-300
                  ${
                    provider.isActive
                      ? `${meta.bg} ${meta.border} shadow-sm`
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }
                `}
              >
                <div className="flex items-center justify-between gap-4">

                  {/* ── Left: Icon + Info ── */}
                  <div className="flex items-center gap-4 min-w-0">

                    {/* Icon */}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center
                        justify-center text-2xl flex-shrink-0
                        ${provider.isActive ? "bg-white shadow-sm" : "bg-slate-100"}
                      `}
                    >
                      {meta.icon}
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-bold text-base ${meta.color}`}
                        >
                          {provider.name}
                        </h3>

                        {/* Active / Inactive badge */}
                        <span
                          className={`
                            text-xs px-2 py-0.5 rounded-full font-medium
                            ${
                              provider.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-500"
                            }
                          `}
                        >
                          {provider.isActive ? "● Active" : "○ Inactive"}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        {provider.description ||
                          `${provider.name} flight search API`}
                      </p>

                      {/* Last updated */}
                      <p className="text-xs text-slate-400 mt-1">
                        Last updated:{" "}
                        {new Date(provider.updatedAt).toLocaleString(
                          "en-US",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* ── Right: Toggle Button ── */}
                  <div className="flex-shrink-0">
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
                        flex items-center gap-2 px-5 py-2.5
                        rounded-xl font-semibold text-sm
                        transition-all duration-200
                        ${
                          isToggling || isLastActive
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                        }
                        ${
                          provider.isActive
                            ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                        }
                      `}
                    >
                      {isToggling ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Power size={15} />
                      )}
                      {isToggling
                        ? "Saving..."
                        : provider.isActive
                        ? "Turn OFF"
                        : "Turn ON"}
                    </button>
                  </div>
                </div>

                {/* ── Disabled notice (shown when inactive) ── */}
                {!provider.isActive && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-white rounded-lg px-3 py-2 border border-slate-200">
                    <XCircle size={13} className="text-red-400 flex-shrink-0" />
                    <span>
                      This provider is{" "}
                      <strong className="text-red-500">disabled</strong>.
                      Flights from{" "}
                      <strong>{provider.name}</strong> will not appear
                      in search results.
                    </span>
                  </div>
                )}

                {/* ── Last active warning ── */}
                {isLastActive && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                    <AlertCircle size={13} className="flex-shrink-0" />
                    <span>
                      This is the <strong>only active provider</strong>.
                      Enable another provider before disabling this one.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── How it works note ── */}
      <div className="mt-8 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Globe size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">How it works</p>
          <ul className="space-y-1 text-blue-600 list-disc list-inside">
            <li>
              Turning <strong>OFF</strong> a provider stops all flight
              searches from that API immediately
            </li>
            <li>
              Results from disabled providers will{" "}
              <strong>not appear</strong> for any user
            </li>
            <li>
              Changes take effect <strong>instantly</strong> — no restart
              needed
            </li>
            <li>
              At least <strong>one provider</strong> must remain active at
              all times
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}