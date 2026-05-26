"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
  ArrowLeft, Loader2, Ticket, RefreshCw, XCircle, Ban,
  Wallet, Clock, Plane, Eye, AlertCircle, UserCheck, Lock, Unlock,
} from "lucide-react";

const TYPE_MAP: Record<string, {
  title: string;
  action: string;
  color: string;
  bg: string;
  icon: JSX.Element;
}> = {
  issue: {
    title: "Issue Requests",
    action: "Make Issue",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <Ticket size={20} />,
  },
  reissue: {
    title: "Reissue Requests",
    action: "Process Reissue",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    icon: <RefreshCw size={20} />,
  },
  cancel: {
    title: "Cancel Requests",
    action: "Approve Cancel",
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    icon: <XCircle size={20} />,
  },
  void: {
    title: "Void Requests",
    action: "Approve Void",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: <Ban size={20} />,
  },
  refund: {
    title: "Refund Requests",
    action: "Process Refund",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    icon: <Wallet size={20} />,
  },
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-100   text-blue-700   border-blue-200",
  APPROVED:   "bg-green-100  text-green-700  border-green-200",
  REJECTED:   "bg-red-100    text-red-700    border-red-200",
};

export default function AdminRequestListPage() {
  const router = useRouter();
  const params = useParams();
  const type   = (params.type as string)?.toLowerCase();

  const [requests, setRequests]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [assigningId, setAssigningId]   = useState<string | null>(null);

  const current = TYPE_MAP[type] || TYPE_MAP.issue;

  // ── Fetch current user profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient("/auth/profile");
        setCurrentUserId(
          profile?.id ||
          profile?.user?.id ||
          profile?.actualUserId ||
          ""
        );
      } catch (err: any) {
        console.error("Profile fetch error:", err?.message || err);
        if (String(err?.message).includes("401")) {
          window.location.href = "/login";
        }
      }
    };
    fetchProfile();
  }, []);

  // ── Fetch requests ──
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient(
        `/admin/requests?type=${type.toUpperCase()}`
      );

      if (Array.isArray(data)) {
        setRequests(data);
      } else if (Array.isArray(data?.data)) {
        setRequests(data.data);
      } else {
        setRequests([]);
        setError("Unexpected data format");
      }
    } catch (e: any) {
      console.error("Requests fetch error:", e?.message || e);
      if (String(e?.message).includes("401")) {
        window.location.href = "/login";
        return;
      }
      setError(e?.message || "Failed to fetch requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // ── Assign handler ──
  const handleAssign = async (requestId: string) => {
    setAssigningId(requestId);
    try {
      const data = await apiClient(
        `/admin/requests/${requestId}/assign`,
        { method: "POST" }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                assignedToId: data.assignedToId,
                assignedTo:   data.assignedTo,
                assignedAt:   data.assignedAt,
              }
            : r
        )
      );
    } catch (err: any) {
      console.error("Assign error:", err?.message || err);
      alert(err?.message || "Failed to assign");
    } finally {
      // ✅ always reset
      setAssigningId(null);
    }
  };

  // ── Release handler ──
  const handleRelease = async (requestId: string) => {
    setAssigningId(requestId);
    try {
      await apiClient(
        `/admin/requests/${requestId}/release`,
        { method: "DELETE" }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, assignedToId: null, assignedTo: null, assignedAt: null }
            : r
        )
      );
    } catch (err: any) {
      console.error("Release error:", err?.message || err);
      alert(err?.message || "Failed to release");
    } finally {
      // ✅ always reset
      setAssigningId(null);
    }
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div className={`p-2.5 rounded-xl border ${current.bg}`}>
              <span className={current.color}>{current.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{current.title}</h1>
              <p className="text-sm text-gray-500">
                {requests.length} request{requests.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={fetchRequests}
                className="text-red-600 text-xs underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#021f3b]" />
            </div>
          ) : !Array.isArray(requests) || requests.length === 0 ? (
            <div className="p-16 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${current.bg}`}>
                <span className={current.color}>{current.icon}</span>
              </div>
              <p className="text-gray-500 font-medium">
                No {type} requests found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                All requests have been processed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Booking ID", "PNR", "Route", "Agent",
                      "Remarks", "Requested At", "Assigned", "Status", "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => {
                    const isAssigned        = !!req.assignedToId;
                    const isAssignedToMe    = req.assignedToId === currentUserId;
                    const isAssignedToOther = isAssigned && !isAssignedToMe;
                    const isThisAssigning   = assigningId === req.id;

                    const assignedName =
                      req.assignedTo?.agentName ||
                      `${req.assignedTo?.firstName || ""} ${req.assignedTo?.lastName || ""}`.trim() ||
                      "Unknown";

                    return (
                      <tr
                        key={req.id}
                        className={`hover:bg-gray-50 transition ${
                          isAssignedToMe    ? "bg-emerald-50/30" :
                          isAssignedToOther ? "bg-orange-50/30"  :
                          req.status === "PROCESSING" ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Booking ID */}
                        <td className="px-5 py-4 font-semibold text-gray-800 text-sm">
                          {req.booking?.bookingId || "—"}
                        </td>

                        {/* PNR */}
                        <td className="px-5 py-4 font-mono font-semibold text-[#021f3b] text-sm">
                          {req.booking?.pnr || "—"}
                        </td>

                        {/* Route */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                            <Plane size={13} className="text-slate-400" />
                            {req.booking?.route || "—"}
                          </div>
                        </td>

                        {/* Agent */}
                        <td className="px-5 py-4 text-gray-600 text-sm">
                          {req.agent?.agentName || "—"}
                        </td>

                        {/* Remarks */}
                        <td className="px-5 py-4 text-gray-500 text-sm max-w-[140px] truncate">
                          {req.remarks || "—"}
                        </td>

                        {/* Requested At */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <Clock size={13} />
                            {new Date(req.createdAt).toLocaleDateString("en-US", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Assigned */}
                        <td className="px-5 py-4">
                          {!isAssigned ? (
                            <button
                              onClick={() => handleAssign(req.id)}
                              disabled={isThisAssigning}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#021f3b] text-white rounded-full text-xs font-semibold hover:bg-[#0a3a6b] transition active:scale-95 disabled:opacity-50"
                            >
                              {isThisAssigning
                                ? <Loader2 size={11} className="animate-spin" />
                                : <UserCheck size={11} />
                              }
                              Assign
                            </button>
                          ) : isAssignedToMe ? (
                            <button
                              onClick={() => handleRelease(req.id)}
                              disabled={isThisAssigning}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold hover:bg-orange-600 transition active:scale-95 disabled:opacity-50"
                            >
                              {isThisAssigning
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Unlock size={11} />
                              }
                              Release
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
                              <Lock size={11} />
                              {assignedName.length > 8
                                ? assignedName.slice(0, 8) + ".."
                                : assignedName}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[req.status] || STATUS_COLOR.PENDING}`}>
                            {req.status === "PROCESSING" && (
                              <RefreshCw size={12} className="animate-spin" />
                            )}
                            {req.status}
                            {req.status === "PROCESSING" && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              router.push(`/admin/requests/${type}/${req.id}`)
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                              isAssignedToOther
                                ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                                : "bg-[#021f3b] text-white hover:bg-[#0a3a6b]"
                            }`}
                          >
                            {isAssignedToOther
                              ? <><Lock size={12} /> View</>
                              : <><Eye size={12} /> {current.action}</>
                            }
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}