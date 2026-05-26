"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
  extractFareFromBooking,
  calculateFare,
} from "@/lib/fare";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle,
  Clock, Plane, Users, User, Baby, Globe,
  FileText, Mail, Phone, Tag, Ticket,
  RefreshCw, Ban, Wallet, Hash, DollarSign,
  Building2, CreditCard, Calendar,
  Lock, Unlock, UserCheck, ShieldAlert, ChevronDown,
  TrendingUp, Percent, Zap, BarChart3,
} from "lucide-react";

// ==================== CONFIGS ====================
const TYPE_MAP: Record<string, { title: string; color: string; icon: JSX.Element }> = {
  issue:   { title: "Issue Ticket",     color: "emerald", icon: <Ticket size={18} />    },
  reissue: { title: "Reissue / Change", color: "indigo",  icon: <RefreshCw size={18} /> },
  cancel:  { title: "Cancel Booking",   color: "rose",    icon: <XCircle size={18} />   },
  void:    { title: "Void Ticket",      color: "amber",   icon: <Ban size={18} />       },
  refund:  { title: "Process Refund",   color: "purple",  icon: <Wallet size={18} />    },
};

const COLOR_MAP: Record<string, { btn: string; badge: string; light: string; text: string }> = {
  emerald: { btn: "bg-emerald-600 hover:bg-emerald-700", badge: "bg-emerald-100 text-emerald-700", light: "bg-emerald-50 border-emerald-200", text: "text-emerald-600" },
  indigo:  { btn: "bg-indigo-600  hover:bg-indigo-700",  badge: "bg-indigo-100  text-indigo-700",  light: "bg-indigo-50  border-indigo-200",  text: "text-indigo-600"  },
  rose:    { btn: "bg-rose-600    hover:bg-rose-700",    badge: "bg-rose-100    text-rose-700",    light: "bg-rose-50    border-rose-200",    text: "text-rose-600"    },
  amber:   { btn: "bg-amber-600   hover:bg-amber-700",   badge: "bg-amber-100   text-amber-700",   light: "bg-amber-50   border-amber-200",   text: "text-amber-600"   },
  purple:  { btn: "bg-purple-600  hover:bg-purple-700",  badge: "bg-purple-100  text-purple-700",  light: "bg-purple-50  border-purple-200",  text: "text-purple-600"  },
};

// ==================== MAIN ====================
export default function AdminRequestProcessPage() {
  const router    = useRouter();
  const params    = useParams();
  const type      = (params.type as string)?.toLowerCase();
  const requestId = params.requestId as string;

  const [request,    setRequest]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [adminNote,  setAdminNote]  = useState("");
  const [processing, setProcessing] = useState(false);
  const [done,       setDone]       = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const [gdsPnr,       setGdsPnr]       = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [issueAmount,  setIssueAmount]  = useState("");

  const [assignLoading,   setAssignLoading]   = useState(false);
  const [currentUserId,   setCurrentUserId]   = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [showPriceExtra,  setShowPriceExtra]  = useState(false);

  const current = TYPE_MAP[type]  || TYPE_MAP.issue;
  const colors  = COLOR_MAP[current.color] || COLOR_MAP.emerald;
  const isIssue = type === "issue";

  // ── Get current user from profile API ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient("/auth/profile");
        setCurrentUserId(
          profile?.id || profile?.user?.id || profile?.actualUserId || ""
        );
        setCurrentUserName(
          profile?.agentName ||
          `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
          profile?.email ||
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

  // ── Fetch request detail ──
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // ✅ NestJS: GET /api/v1/admin/requests/:id
        const data = await apiClient(`/admin/requests/${requestId}`);
        setRequest(data);
      } catch (e: any) {
        console.error("Request fetch error:", e?.message || e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  // ── Auto-fill GDS PNR ──
  useEffect(() => {
    if (request?.gdsPnr) {
      setGdsPnr(request.gdsPnr.toUpperCase());
    } else if (request?.booking?.pnr) {
      setGdsPnr(request.booking.pnr.toUpperCase());
    }
  }, [request]);

  // ── Assign logic ──
  const isAssigned        = !!request?.assignedToId;
  const isAssignedToMe    = request?.assignedToId === currentUserId;
  const isAssignedToOther = isAssigned && !isAssignedToMe;

  const assignedPersonName =
    request?.assignedTo?.agentName ||
    `${request?.assignedTo?.firstName || ""} ${request?.assignedTo?.lastName || ""}`.trim() ||
    "";

  // ── Assign handler ──
  const handleAssign = async () => {
    setAssignLoading(true);
    try {
      // ✅ NestJS: POST /api/v1/admin/requests/:id/assign
      const data = await apiClient(`/admin/requests/${requestId}/assign`, {
        method: "POST",
      });
      setRequest((prev: any) => ({
        ...prev,
        assignedToId: data.assignedToId || currentUserId,
        assignedTo:   data.assignedTo || { agentName: currentUserName, firstName: currentUserName, lastName: "" },
        assignedAt:   data.assignedAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error("Assign error:", err?.message || err);
      alert(err?.message || "Failed to assign");
    } finally {
      setAssignLoading(false);
    }
  };

  // ── Release handler ──
  const handleRelease = async () => {
    setAssignLoading(true);
    try {
      // ✅ NestJS: DELETE /api/v1/admin/requests/:id/release
      await apiClient(`/admin/requests/${requestId}/release`, {
        method: "DELETE",
      });
      setRequest((prev: any) => ({
        ...prev,
        assignedToId: null,
        assignedTo:   null,
        assignedAt:   null,
      }));
    } catch (err: any) {
      console.error("Release error:", err?.message || err);
      alert(err?.message || "Failed to release");
    } finally {
      setAssignLoading(false);
    }
  };

  // ── Process handler ──
  const handleProcess = async (action: "APPROVED" | "REJECTED" | "PROCESSING") => {
    if (isIssue && action === "APPROVED") {
      if (!gdsPnr.trim())       { alert("Please enter GDS PNR!");       return; }
      if (!ticketNumber.trim()) { alert("Please enter Ticket Number!"); return; }
      if (!supplierName.trim()) { alert("Please enter Supplier Name!"); return; }
    }

    setProcessing(true);
    try {
      // ✅ NestJS: POST /api/v1/admin/requests/:id/process
      await apiClient(`/admin/requests/${requestId}/process`, {
        method: "POST",
        body: JSON.stringify({
          action,
          adminNote,
          ...(isIssue && {
            gdsPnr:       gdsPnr.trim()       || null,
            ticketNumber: ticketNumber.trim() || null,
            supplierName: supplierName.trim() || null,
            issueAmount:  issueAmount ? parseFloat(issueAmount) : null,
          }),
        }),
      });
      setDone(true);
      setActionDone(action);
      setTimeout(() => router.push(`/admin/requests/${type}`), 2000);
    } catch (e: any) {
      console.error("Process error:", e?.message || e);
      alert(e?.message || "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#021f3b]" />
    </div>
  );

  const booking    = request?.booking;
  const agent      = request?.agent;
  const passengers = booking?.passengers || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ===== Header ===== */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className={`p-2.5 rounded-xl border ${colors.light}`}>
            <span className={colors.text}>{current.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{current.title}</h1>
            <p className="text-sm text-gray-500">
              Booking: {booking?.bookingId} · PNR: {booking?.pnr}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            {isAssigned && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                isAssignedToMe
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-orange-100 text-orange-700 border-orange-200"
              }`}>
                <UserCheck size={13} />
                {isAssignedToMe ? "Assigned to You" : `Assigned: ${assignedPersonName}`}
              </span>
            )}
            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
              request?.status === "PENDING"    ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
              request?.status === "PROCESSING" ? "bg-blue-100   text-blue-700   border-blue-200"   :
              request?.status === "APPROVED"   ? "bg-green-100  text-green-700  border-green-200"  :
              "bg-red-100 text-red-700 border-red-200"
            }`}>
              {request?.status}
            </span>
          </div>
        </div>

        {/* Locked Warning */}
        {isAssignedToOther && (
          <div className="mb-4 flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-3">
            <ShieldAlert size={20} className="text-orange-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-orange-700 text-sm">
                🔒 This request is assigned to {assignedPersonName}
              </p>
              <p className="text-orange-600 text-xs mt-0.5">
                You cannot take action until they release it.
              </p>
            </div>
            <Lock size={18} className="text-orange-400" />
          </div>
        )}

        {/* Success Banner */}
        {done && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <p className="font-bold text-emerald-700">
              {actionDone === "APPROVED"   ? "✅ Request Approved! Redirecting..."   :
               actionDone === "REJECTED"   ? "❌ Request Rejected! Redirecting..."   :
               "🔄 Marked as Processing! Redirecting..."}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ==================== LEFT ==================== */}
          <div className="lg:col-span-2 space-y-4">

            {/* Booking Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                      <Plane size={16} className="text-indigo-300 rotate-90" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Booking</p>
                      <p className="text-base font-black text-white">{booking?.bookingId}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-indigo-200 bg-white/10 px-3 py-1 rounded-lg">
                    {booking?.pnr}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{booking?.route?.split("-")[0]}</p>
                    <p className="text-[9px] text-indigo-300 uppercase">Departure</p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/20" />
                    <Plane size={14} className="text-indigo-400 rotate-90" />
                    <div className="h-px flex-1 bg-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">{booking?.route?.split("-")[1]}</p>
                    <p className="text-[9px] text-indigo-300 uppercase">Arrival</p>
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Trip Type", value: booking?.tripType },
                  { label: "Carrier",   value: booking?.carrier  },
                  { label: "Status",    value: booking?.status   },
                  { label: "Departure", value: formatDate(booking?.departureDate) },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-black text-gray-800 truncate">{item.value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Information (Issue only) */}
            {isIssue && (
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
                isAssignedToOther ? "border-gray-200 opacity-60" : "border-emerald-200"
              }`}>
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3.5 flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <Ticket size={15} className="text-white" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Ticket Information</h3>
                  <span className="ml-auto text-[9px] font-black text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
                    {isAssignedToOther ? "Locked" : "Required for Approval"}
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      GDS PNR <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Hash size={14} className="text-emerald-500" />
                      </div>
                      <input
                        type="text"
                        value={gdsPnr || ""}
                        onChange={(e) => setGdsPnr(e.target.value.toUpperCase())}
                        disabled={done || isAssignedToOther}
                        autoComplete="off"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm font-mono font-black outline-none transition disabled:bg-gray-50 disabled:opacity-60 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Ticket Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <CreditCard size={14} className="text-emerald-500" />
                      </div>
                      <input type="text" value={ticketNumber}
                        onChange={(e) => setTicketNumber(e.target.value)}
                        placeholder="e.g. 1234567890123"
                        disabled={done || isAssignedToOther}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm font-mono outline-none transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Supplier Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Building2 size={14} className="text-emerald-500" />
                      </div>
                      <input type="text" value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="e.g. Sabre / Amadeus / Galileo"
                        disabled={done || isAssignedToOther}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm outline-none transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Issue Amount (SAR)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <DollarSign size={14} className="text-emerald-500" />
                      </div>
                      <input type="number" value={issueAmount}
                        onChange={(e) => setIssueAmount(e.target.value)}
                        placeholder={`${booking?.gross || "0.00"}`}
                        disabled={done || isAssignedToOther}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm outline-none transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:opacity-60"
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <Tag size={8} /> Booking gross: SAR {booking?.gross?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {!done && !isAssignedToOther && (!gdsPnr || !ticketNumber || !supplierName) && (
                  <div className="px-5 pb-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Clock size={12} className="text-amber-500 shrink-0" />
                      <p className="text-[9px] font-bold text-amber-700">
                        GDS PNR, Ticket Number & Supplier Name are required before approving
                      </p>
                    </div>
                  </div>
                )}

                {!done && !isAssignedToOther && gdsPnr && ticketNumber && supplierName && (
                  <div className="px-5 pb-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <p className="text-[9px] font-bold text-emerald-700">
                        All required fields filled — ready to approve!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Passengers */}
            {passengers.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users size={14} className="text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Passengers</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {["ADULT", "CHILD", "INFANT"].map((t) => {
                      const count = passengers.filter((p: any) => p.type === t).length;
                      if (!count) return null;
                      return (
                        <span key={t} className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          t === "ADULT" ? "bg-indigo-400/30 text-indigo-100" :
                          t === "CHILD" ? "bg-amber-400/30  text-amber-100"  :
                          "bg-pink-400/30 text-pink-100"}`}>
                          {count} {t}
                        </span>
                      );
                    })}
                    <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">
                      {passengers.length} Total
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {passengers.map((pax: any, i: number) => (
                    <div key={i} className={`rounded-xl border overflow-hidden ${
                      pax.type === "ADULT" ? "border-indigo-100" :
                      pax.type === "CHILD" ? "border-amber-100"  : "border-pink-100"}`}>
                      <div className={`px-4 py-2.5 flex items-center justify-between ${
                        pax.type === "ADULT" ? "bg-indigo-50" :
                        pax.type === "CHILD" ? "bg-amber-50"  : "bg-pink-50"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                            pax.type === "ADULT" ? "bg-indigo-600 text-white" :
                            pax.type === "CHILD" ? "bg-amber-500  text-white" : "bg-pink-500 text-white"}`}>
                            {pax.type === "INFANT"
                              ? <Baby size={16} />
                              : pax.firstName?.[0]?.toUpperCase() || <User size={16} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-gray-900">
                                {pax.title} {pax.firstName} {pax.lastName}
                              </p>
                              <span className="text-[8px] font-black text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md">
                                PAX {i + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                                pax.type === "ADULT" ? "bg-indigo-100 text-indigo-700" :
                                pax.type === "CHILD" ? "bg-amber-100  text-amber-700"  : "bg-pink-100 text-pink-700"}`}>
                                {pax.type}
                              </span>
                              {pax.gender && (
                                <span className="text-[8px] font-bold text-gray-400 uppercase">· {pax.gender}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {pax.dateOfBirth && (
                          <div className="text-right hidden sm:block">
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Date of Birth</p>
                            <p className="text-[10px] font-black text-gray-700">
                              {new Date(pax.dateOfBirth).toLocaleDateString("en-US", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 bg-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5">
                          {pax.passportNumber && (
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText size={11} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Passport No.</p>
                                <p className="text-[10px] font-black text-gray-800 font-mono">{pax.passportNumber}</p>
                              </div>
                            </div>
                          )}
                          {pax.passportExpiry && (
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Clock size={11} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Passport Expiry</p>
                                <p className={`text-[10px] font-black ${
                                  new Date(pax.passportExpiry) < new Date() ? "text-red-600" :
                                  new Date(pax.passportExpiry) < new Date(Date.now() + 180 * 86400000) ? "text-amber-600" :
                                  "text-gray-800"}`}>
                                  {new Date(pax.passportExpiry).toLocaleDateString("en-US", {
                                    day: "2-digit", month: "short", year: "numeric",
                                  })}
                                  {new Date(pax.passportExpiry) < new Date() && (
                                    <span className="ml-1 text-[8px] bg-red-100 text-red-600 px-1 rounded">EXPIRED</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                          {pax.nationality && (
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Globe size={11} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Nationality</p>
                                <p className="text-[10px] font-black text-gray-800">{pax.nationality}</p>
                              </div>
                            </div>
                          )}
                          {pax.email && (
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Mail size={11} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Email</p>
                                <p className="text-[10px] font-black text-gray-800 truncate max-w-[120px]">{pax.email}</p>
                              </div>
                            </div>
                          )}
                          {pax.phone && (
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Phone size={11} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Phone</p>
                                <p className="text-[10px] font-black text-gray-800">{pax.phone}</p>
                              </div>
                            </div>
                          )}
                          {pax.dateOfBirth && (
                            <div className="flex items-start gap-2 sm:hidden">
                              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Calendar size={11} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Date of Birth</p>
                                <p className="text-[10px] font-black text-gray-800">
                                  {new Date(pax.dateOfBirth).toLocaleDateString("en-US", {
                                    day: "2-digit", month: "short", year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ==================== RIGHT ==================== */}
          <div className="space-y-4">

            {/* Agent Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Agent Info</h3>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-[10px] font-bold text-gray-400">Agent Name</span>
                <span className="text-[10px] font-black text-gray-700 text-right max-w-[140px] truncate">
                  {agent?.agentName || "—"}
                </span>
              </div>
            </div>

            {/* ==================== FARE BREAKDOWN ==================== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Tag size={11} className="text-indigo-500" /> Fare Breakdown
              </h3>

              {(() => {
                const sourceCurrency = booking?.currency || "SAR";
                const fareInput = extractFareFromBooking(booking);
                const fareCalc = fareInput
                  ? calculateFare({ ...fareInput, currency: sourceCurrency })
                  : null;

                if (!fareCalc) {
                  return (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-bold text-amber-700">Fare data not available.</p>
                    </div>
                  );
                }

                const f   = fareCalc.agentUi;
                const a   = fareCalc.admin;
                const cur = f.currency || sourceCurrency;
                const net        = Number(booking?.net        || 0);
                const gross      = Number(booking?.gross      || 0);
                const commission = Number(booking?.commission || 0);

                return (
                  <div className="space-y-1.5">

                    {/* ── Agent View ── */}
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Agent View
                    </p>

                    {f.adults > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500">Adult × {f.adults}</span>
                        <span className="text-xs font-black text-slate-700">{cur} {f.totalBaseTax.toLocaleString()}</span>
                      </div>
                    )}
                    {f.children > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500">Child × {f.children}</span>
                        <span className="text-xs font-black text-slate-700">Included</span>
                      </div>
                    )}
                    {f.infants > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500">Infant × {f.infants}</span>
                        <span className="text-xs font-black text-slate-700">Included</span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-slate-500">Base Fare</span>
                      <span className="text-xs font-black text-slate-700">{cur} {f.baseFare.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-slate-500">Tax & Fee</span>
                      <span className="text-xs font-black text-slate-700">{cur} {f.taxAmount.toLocaleString()}</span>
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <div className="flex justify-between items-center py-1.5 bg-slate-50 rounded-xl px-3">
                      <span className="text-xs font-bold text-slate-600">Total Base & Tax</span>
                      <span className="text-xs font-black text-slate-800">{cur} {f.totalBaseTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 bg-blue-50 rounded-xl px-3">
                      <span className="text-xs font-bold text-blue-700">Customer Invoice Total</span>
                      <span className="text-xs font-black text-blue-800">{cur} {f.customerInvoiceTotal.toLocaleString()}</span>
                    </div>
                    {f.discountOrCommission > 0 && (
                      <div className="flex justify-between items-center py-1.5 bg-emerald-50 rounded-xl px-3">
                        <span className="text-xs font-bold text-emerald-700">Discount / Commission</span>
                        <span className="text-xs font-black text-emerald-700">− {cur} {f.discountOrCommission.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Grand Total */}
                    <div className="flex justify-between items-center py-3 px-3 mt-1 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Grand Total</p>
                        <p className="text-[10px] text-indigo-300 mt-0.5">{f.totalPax} Pax · {cur}</p>
                      </div>
                      <span className="text-xl font-black text-white">{cur} {f.grandTotal.toLocaleString()}</span>
                    </div>

                    {f.totalPax > 1 && (
                      <div className="flex justify-between items-center py-1 px-1">
                        <span className="text-xs font-bold text-slate-400">Per Person</span>
                        <span className="text-xs font-black text-slate-500">{cur} {f.perPerson.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Show More Button */}
                    <button
                      onClick={() => setShowPriceExtra(!showPriceExtra)}
                      className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 transition active:scale-95"
                    >
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        {showPriceExtra ? "Show Less" : "Show More Details"}
                      </span>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${showPriceExtra ? "rotate-180" : ""}`} />
                    </button>

                    {/* ── Expanded Section ── */}
                    {showPriceExtra && (
                      <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">

                        {/* Markup & Fees */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-amber-500" /> Markup & Fees
                          </p>
                          <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                            {[
                              { label: "Markup",          value: a.markup,            show: true },
                              { label: "Service Fee",     value: a.serviceFee,        show: a.serviceFee > 0 },
                              { label: "Convenience Fee", value: a.convenienceFee,    show: a.convenienceFee > 0 },
                              { label: "Transaction Fee", value: a.transactionFee,    show: a.transactionFee > 0 },
                              { label: "Gateway Fee",     value: a.paymentGatewayFee, show: a.paymentGatewayFee > 0 },
                            ].filter(i => i.show).map((item, i) => (
                              <div key={i} className="flex justify-between px-3 py-2 border-b border-amber-100 last:border-b-0">
                                <span className="text-xs text-amber-700">{item.label}</span>
                                <span className="text-xs font-black text-amber-800">+ {cur} {item.value.toLocaleString()}</span>
                              </div>
                            ))}
                            {a.markup === 0 && a.serviceFee === 0 && (
                              <div className="px-3 py-2 text-xs text-amber-600 italic">No markup applied</div>
                            )}
                          </div>
                        </div>

                        {/* Discounts & Commission */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Percent size={10} className="text-emerald-500" /> Discounts & Commission
                          </p>
                          <div className="bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden">
                            {[
                              { label: "Agent Discount", value: a.agentDiscount, show: a.agentDiscount > 0 },
                              { label: "Promo Discount", value: a.promoDiscount, show: a.promoDiscount > 0 },
                              { label: "Commission",     value: a.commission,    show: a.commission > 0 },
                            ].filter(i => i.show).map((item, i) => (
                              <div key={i} className="flex justify-between px-3 py-2 border-b border-emerald-100 last:border-b-0">
                                <span className="text-xs text-emerald-700">{item.label}</span>
                                <span className="text-xs font-black text-emerald-800">− {cur} {item.value.toLocaleString()}</span>
                              </div>
                            ))}
                            {a.agentDiscount === 0 && a.promoDiscount === 0 && a.commission === 0 && (
                              <div className="px-3 py-2 text-xs text-emerald-600 italic">No discounts applied</div>
                            )}
                          </div>
                        </div>

                        {/* Tax & AIT */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Zap size={10} className="text-sky-500" /> Tax & Regulatory
                          </p>
                          <div className="bg-sky-50 rounded-xl border border-sky-100 overflow-hidden">
                            {[
                              { label: "AIT",       value: a.ait,      show: a.ait !== 0 },
                              { label: "VAT",       value: a.vat,      show: a.vat !== 0 },
                              { label: "Round Off", value: a.roundOff, show: a.roundOff !== 0 },
                            ].filter(i => i.show).map((item, i) => (
                              <div key={i} className="flex justify-between px-3 py-2 border-b border-sky-100 last:border-b-0">
                                <span className="text-xs text-sky-700">{item.label}</span>
                                <span className="text-xs font-black text-sky-800">{cur} {item.value.toLocaleString()}</span>
                              </div>
                            ))}
                            {a.ait === 0 && a.vat === 0 && a.roundOff === 0 && (
                              <div className="px-3 py-2 text-xs text-sky-600 italic">No tax applied</div>
                            )}
                          </div>
                        </div>

                        {/* Supplier Fare */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <BarChart3 size={10} className="text-slate-500" /> Admin / Internal
                          </p>
                          <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            {[
                              { label: "Supplier Fare",  value: a.supplierFare  },
                              { label: "Published Fare", value: a.publishedFare },
                              { label: "Offered Fare",   value: a.offeredFare   },
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between px-3 py-2 border-b border-slate-100 last:border-b-0">
                                <span className="text-xs text-slate-500">{item.label}</span>
                                <span className="text-xs font-black text-slate-700">{cur} {item.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Settlement */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Settlement
                          </p>
                          <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <div className="flex justify-between px-3 py-2 border-b border-slate-100">
                              <span className="text-xs text-slate-500">Net Payable to Supplier</span>
                              <span className="text-xs font-black text-rose-700">{cur} {a.netPayableToSupplier.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between px-3 py-2">
                              <span className="text-xs text-slate-500">Net Receivable from Agent</span>
                              <span className="text-xs font-black text-teal-700">{cur} {a.netReceivableFromAgent.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Profit Summary */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-indigo-500" /> Profit Summary
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-indigo-50 rounded-xl p-2.5 border border-indigo-100 text-center">
                              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">Gross Profit</p>
                              <p className="text-xs font-black text-indigo-800">{cur} {a.grossProfit.toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100 text-center">
                              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Net Profit</p>
                              <p className="text-xs font-black text-emerald-800">{cur} {a.netProfit.toLocaleString()}</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-100 text-center">
                              <p className="text-[8px] font-black text-purple-500 uppercase tracking-widest mb-1">Margin</p>
                              <p className="text-xs font-black text-purple-800">{a.marginPercent}%</p>
                            </div>
                          </div>
                        </div>

                        {/* DB Raw Values */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Stored in DB
                          </p>
                          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                            <div className="flex justify-between px-3 py-2 border-b border-gray-100">
                              <span className="text-xs text-slate-500">Net (Agent Payable)</span>
                              <span className="text-xs font-black text-slate-700">{cur} {net.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between px-3 py-2 border-b border-gray-100">
                              <span className="text-xs text-slate-500">Gross (Invoice)</span>
                              <span className="text-xs font-black text-slate-700">{cur} {gross.toLocaleString()}</span>
                            </div>
                            {commission > 0 && (
                              <div className="flex justify-between px-3 py-2">
                                <span className="text-xs text-slate-500">Commission</span>
                                <span className="text-xs font-black text-emerald-700">− {cur} {commission.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pricing Config */}
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Pricing Config
                          </p>
                          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-1">
                            {[
                              { label: "Commission Type", value: fareCalc.meta.commissionType },
                              { label: "Commission Mode", value: fareCalc.meta.commissionMode },
                              { label: "Commission On",   value: fareCalc.meta.commissionOn   },
                              { label: "AIT Applied On",  value: fareCalc.meta.aitOn          },
                              { label: "Source",          value: fareCalc.meta.source         },
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between items-center py-0.5">
                                <span className="text-[10px] font-semibold text-slate-400">{item.label}</span>
                                <span className="text-[10px] font-black text-slate-600 capitalize bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Agent Remarks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Agent Remarks</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-sm text-blue-800 leading-relaxed">
                  {request?.remarks || "No remarks added"}
                </p>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 flex items-center gap-1">
                <Clock size={9} /> {formatDate(request?.createdAt)}
              </p>
            </div>

            {/* Admin Action Panel */}
            <div className={`bg-white rounded-2xl border shadow-sm p-5 ${
              isAssignedToOther ? "border-orange-200 opacity-60" : "border-gray-100"
            }`}>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Admin Action</h3>

              {done ? (
                <div className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm border-2 ${
                  actionDone === "APPROVED"   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  actionDone === "REJECTED"   ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-blue-50 text-blue-700 border-blue-200"}`}>
                  {actionDone === "APPROVED"   && <><CheckCircle2 size={18} /> Approved!</>}
                  {actionDone === "REJECTED"   && <><XCircle size={18} /> Rejected!</>}
                  {actionDone === "PROCESSING" && <><Clock size={18} /> Marked Processing!</>}
                </div>
              ) : (
                <>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Add admin note (optional)..."
                    disabled={isAssignedToOther}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#021f3b] resize-none placeholder:text-gray-300 mb-3 transition disabled:bg-gray-50 disabled:opacity-60"
                  />

                  <div className="space-y-2">

                    {/* Approve */}
                    <button
                      onClick={() => handleProcess("APPROVED")}
                      disabled={processing || isAssignedToOther}
                      className={`w-full py-3 rounded-xl text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${colors.btn}`}
                    >
                      {processing ? <Loader2 size={16} className="animate-spin" /> :
                       isAssignedToOther ? <Lock size={16} /> : <CheckCircle2 size={16} />}
                      {current.title}
                    </button>

                    {/* Assign / Release */}
                    {!isAssigned ? (
                      <button
                        onClick={handleAssign}
                        disabled={assignLoading}
                        className="w-full py-2.5 rounded-xl bg-[#021f3b] hover:bg-[#0a3a6b] text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {assignLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                        Assign to Me
                      </button>
                    ) : isAssignedToMe ? (
                      <button
                        onClick={handleRelease}
                        disabled={assignLoading}
                        className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {assignLoading ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                        Release
                      </button>
                    ) : (
                      <div className="w-full py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <Lock size={14} />
                        Locked by {assignedPersonName}
                      </div>
                    )}

                    {/* Mark Processing */}
                    <button
                      onClick={() => handleProcess("PROCESSING")}
                      disabled={processing || isAssignedToOther}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {processing ? <Loader2 size={14} className="animate-spin" /> :
                       isAssignedToOther ? <Lock size={14} /> : <Clock size={14} />}
                      Mark Processing
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => handleProcess("REJECTED")}
                      disabled={processing || isAssignedToOther}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {processing ? <Loader2 size={14} className="animate-spin" /> :
                       isAssignedToOther ? <Lock size={14} /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>

                  {isAssignedToOther && (
                    <p className="text-[9px] text-orange-600 text-center mt-2 flex items-center justify-center gap-1">
                      <Lock size={9} /> Locked by {assignedPersonName}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}