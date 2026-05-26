"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  extractFareFromBooking,
  calculateFare,
  type FareBreakdown,
} from "@/lib/fare";
import { getDisplayCurrency, convertCurrency } from "@/lib/currency";
import {
  ArrowLeft, Plane, Calendar, Users, Clock, MapPin, Copy,
  Printer, Mail, CheckCircle2, XCircle, AlertCircle, Loader2,
  Send, RotateCcw, Ban, FileText, ChevronDown, User, Baby,
  Globe, Phone, Zap, X, Wallet, Ticket, Hash, Download,
  Edit2, Luggage, ShieldCheck, Info, MessageSquare, Shield, CreditCard,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RequestConfig {
  label:    string;
  icon:     React.ReactElement;
  desc:     string;
  btnClass: string;
  color:    string;
}

interface StatusConfig {
  bg:     string;
  text:   string;
  icon:   React.ReactElement;
  border: string;
  glow:   string;
}

// ─── Configs ─────────────────────────────────────────────────────────────────
const REQUEST_CONFIG: Record<string, RequestConfig> = {
  ISSUE: {
    label:    "Issue Ticket",
    icon:     <CheckCircle2 size={18} />,
    desc:     "Request admin to issue the ticket",
    btnClass: "from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600",
    color:    "emerald",
  },
  REISSUE: {
    label:    "Reissue / Change",
    icon:     <RotateCcw size={18} />,
    desc:     "Request date change or reissue",
    btnClass: "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600",
    color:    "indigo",
  },
  CANCEL: {
    label:    "Cancel Booking",
    icon:     <XCircle size={18} />,
    desc:     "Request cancellation for this booking",
    btnClass: "from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600",
    color:    "rose",
  },
  VOID: {
    label:    "Void Ticket",
    icon:     <Ban size={18} />,
    desc:     "Request void within 24hrs of ticketing",
    btnClass: "from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600",
    color:    "amber",
  },
  REFUND: {
    label:    "Refund Request",
    icon:     <Wallet size={18} />,
    desc:     "Request refund for cancelled booking",
    btnClass: "from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600",
    color:    "purple",
  },
};

const ALLOWED_ACTIONS: Record<string, string[]> = {
  ON_HOLD:   ["ISSUE"],
  CONFIRMED: ["REISSUE", "CANCEL", "VOID"],
  CANCELLED: ["REFUND"],
  VOIDED:    [],
  REFUNDED:  [],
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  ON_HOLD: {
    bg: "bg-amber-50", text: "text-amber-700",
    icon: <Clock size={14} />, border: "border-amber-200", glow: "shadow-amber-100",
  },
  CONFIRMED: {
    bg: "bg-emerald-50", text: "text-emerald-700",
    icon: <CheckCircle2 size={14} />, border: "border-emerald-200", glow: "shadow-emerald-100",
  },
  CANCELLED: {
    bg: "bg-rose-50", text: "text-rose-700",
    icon: <XCircle size={14} />, border: "border-rose-200", glow: "shadow-rose-100",
  },
  VOIDED: {
    bg: "bg-slate-50", text: "text-slate-700",
    icon: <Ban size={14} />, border: "border-slate-200", glow: "shadow-slate-100",
  },
  REFUNDED: {
    bg: "bg-purple-50", text: "text-purple-700",
    icon: <RotateCcw size={14} />, border: "border-purple-200", glow: "shadow-purple-100",
  },
};

// ─── Request Type/Status Configs (inside component) ──────────────────────────
function getRequestTypeConfig(type: string): {
  bg: string; text: string; icon: React.ReactElement; label: string;
} {
  const map: Record<string, { bg: string; text: string; icon: React.ReactElement; label: string }> = {
    ISSUE:   { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 size={10} />, label: "Issue Ticket" },
    REISSUE: { bg: "bg-indigo-100",  text: "text-indigo-700",  icon: <RotateCcw    size={10} />, label: "Reissue"      },
    CANCEL:  { bg: "bg-rose-100",    text: "text-rose-700",    icon: <XCircle      size={10} />, label: "Cancel"       },
    VOID:    { bg: "bg-amber-100",   text: "text-amber-700",   icon: <Ban          size={10} />, label: "Void"         },
    REFUND:  { bg: "bg-purple-100",  text: "text-purple-700",  icon: <Wallet       size={10} />, label: "Refund"       },
  };
  return map[type] || {
    bg: "bg-slate-100", text: "text-slate-700",
    icon: <FileText size={10} />, label: type,
  };
}

function getRequestStatusConfig(status: string): {
  bg: string; text: string; border: string; label: string; dot: string;
} {
  const map: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
    PENDING:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Pending",    dot: "bg-amber-400"   },
    PROCESSING: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    label: "Processing", dot: "bg-blue-400"    },
    APPROVED:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Approved",   dot: "bg-emerald-400" },
    REJECTED:   { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    label: "Rejected",   dot: "bg-rose-400"    },
  };
  return map[status] || map["PENDING"];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingDetailsPage() {
  const router    = useRouter();
  const params    = useParams();
  const bookingId = params.bookingId as string;

  const [booking,            setBooking]            = useState<any>(null);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState("");
  const [showRequestModal,   setShowRequestModal]   = useState(false);
  const [requestType,        setRequestType]        = useState<string>("");
  const [requestRemarks,     setRequestRemarks]     = useState("");
  const [submittingRequest,  setSubmittingRequest]  = useState(false);
  const [requestSuccess,     setRequestSuccess]     = useState("");
  const [requestError,       setRequestError]       = useState("");
  const [showPriceExtra,     setShowPriceExtra]     = useState(false);
  const [showRequestExtra,   setShowRequestExtra]   = useState(false);

  const [showFareEditor,  setShowFareEditor]  = useState(false);
  const [editNet,         setEditNet]         = useState("");
  const [editGross,       setEditGross]       = useState("");
  const [editCommission,  setEditCommission]  = useState("");

  // ── Derived fare data ──
  const displayCurrency = getDisplayCurrency(
    typeof window !== "undefined" ? window.location.hostname : undefined
  );

  const sourceCurrency = booking?.currency || "SAR";
  const extractedFare  = booking ? extractFareFromBooking(booking) : null;
  const rawFareInput   = extractedFare ? { ...extractedFare, currency: sourceCurrency } : null;

  const convertedInput = rawFareInput
    ? {
        ...rawFareInput,
        baseFare:  convertCurrency(Number(rawFareInput.baseFare  || 0), sourceCurrency, displayCurrency),
        taxAmount: convertCurrency(Number(rawFareInput.taxAmount || 0), sourceCurrency, displayCurrency),
        discount:  convertCurrency(Number(rawFareInput.discount  || 0), sourceCurrency, displayCurrency),
        currency:  displayCurrency,
      }
    : null;

  const fareRaw: FareBreakdown | null = convertedInput
    ? calculateFare(convertedInput)
    : null;

  const fare: FareBreakdown | null = fareRaw
    ? {
        ...fareRaw,
        baseFare:             Math.round(fareRaw.baseFare),
        taxAmount:            Math.round(fareRaw.taxAmount),
        customerInvoiceTotal: Math.round(fareRaw.customerInvoiceTotal),
        discount:             Math.round(fareRaw.discount),
        grandTotal:           Math.round(fareRaw.grandTotal),
        perPerson:            Math.round(fareRaw.perPerson),
        agentUi: {
          ...fareRaw.agentUi,
          baseFare:             Math.round(fareRaw.agentUi.baseFare),
          taxAmount:            Math.round(fareRaw.agentUi.taxAmount),
          totalBaseTax:         Math.round(fareRaw.agentUi.totalBaseTax),
          customerInvoiceTotal: Math.round(fareRaw.agentUi.customerInvoiceTotal),
          discountOrCommission: Math.round(fareRaw.agentUi.discountOrCommission),
          grandTotal:           Math.round(fareRaw.agentUi.grandTotal),
          perPerson:            Math.round(fareRaw.agentUi.perPerson),
        },
        admin: {
          ...fareRaw.admin,
          supplierFare:           Math.round(fareRaw.admin.supplierFare),
          publishedFare:          Math.round(fareRaw.admin.publishedFare),
          offeredFare:            Math.round(fareRaw.admin.offeredFare),
          markup:                 Math.round(fareRaw.admin.markup),
          serviceFee:             Math.round(fareRaw.admin.serviceFee),
          convenienceFee:         Math.round(fareRaw.admin.convenienceFee),
          transactionFee:         Math.round(fareRaw.admin.transactionFee),
          agentDiscount:          Math.round(fareRaw.admin.agentDiscount),
          promoDiscount:          Math.round(fareRaw.admin.promoDiscount),
          commission:             Math.round(fareRaw.admin.commission),
          ait:                    Math.round(fareRaw.admin.ait),
          vat:                    Math.round(fareRaw.admin.vat),
          roundOff:               Math.round(fareRaw.admin.roundOff),
          paymentGatewayFee:      Math.round(fareRaw.admin.paymentGatewayFee),
          netPayableToSupplier:   Math.round(fareRaw.admin.netPayableToSupplier),
          netReceivableFromAgent: Math.round(fareRaw.admin.netReceivableFromAgent),
          grossProfit:            Math.round(fareRaw.admin.grossProfit),
          netProfit:              Math.round(fareRaw.admin.netProfit),
          marginPercent:          fareRaw.admin.marginPercent,
        },
      }
    : null;

  const currencyLabel = fare?.agentUi.currency || displayCurrency;

  // ── Ticket Info ──
  const ticketInfo = booking?.requests?.find(
    (r: any) => r.type === "ISSUE" && r.status === "APPROVED"
  );
  const isTicketed = booking?.status === "CONFIRMED" && !!ticketInfo;
  const convertedIssueAmount =
    ticketInfo?.issueAmount != null
      ? Math.round(convertCurrency(
          Number(ticketInfo.issueAmount || 0),
          sourceCurrency,
          displayCurrency
        ))
      : null;

  // ── Fetch ──
  const fetchBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient(`/bookings/${bookingId}`);
      setBooking(data);

      const src = data?.currency || "SAR";
      setEditNet(        String(Math.round(convertCurrency(Number(data?.net        || 0), src, displayCurrency))));
      setEditGross(      String(Math.round(convertCurrency(Number(data?.gross      || 0), src, displayCurrency))));
      setEditCommission( String(Math.round(convertCurrency(Number(data?.commission || 0), src, displayCurrency))));
    } catch (err: any) {
      console.error("Booking fetch error:", err?.message);
      if (String(err?.message).includes("401")) {
        window.location.href = "/login";
        return;
      }
      setError(err?.message || "Booking not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, displayCurrency]);

  // ── Formatters ──
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
    }) : "—";

  const formatTime = (d: string) =>
    d ? new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    }) : "—";

  const formatDateTime = (d: string) => {
    if (!d) return "—";
    const dt = new Date(d);
    return (
      dt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    );
  };

  // ── Ticket HTML ──
  const generateTicketHTML = () => {
    const agent       = booking?.agent;
    const companyName = agent?.agentName || "MIJI Portal";
    const companyAddress = agent?.agentAddress || "Travel Services";
    const companyPhone   = agent?.phone  || "";
    const companyEmail   = agent?.email  || "";
    const agentUserName  =
      agent?.firstName && agent?.lastName
        ? `${agent.firstName} ${agent.lastName}`
        : agent?.agentName || "Agent";

    const printNet        = parseFloat(editNet        || "0");
    const printGross      = parseFloat(editGross      || "0");
    const printCommission = parseFloat(editCommission || "0");
    const printTax        = Math.max(0, printGross - printNet);

    return `<!DOCTYPE html>
<html>
<head>
  <title>E-Ticket - ${booking?.bookingId}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;font-size:10px;line-height:1.3}
    .page{max-width:720px;margin:0 auto;background:white}
    .co-header{display:flex;align-items:stretch;border-bottom:2.5px solid #0A1128}
    .co-left{display:flex;align-items:center;gap:10px;padding:10px 18px;flex:1;background:linear-gradient(135deg,#f8fafc,#eef2ff)}
    .co-icon{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#0A1128,#1a2342);display:flex;align-items:center;justify-content:center;color:white;font-size:15px;font-weight:900;flex-shrink:0;box-shadow:0 3px 8px rgba(10,17,40,0.25)}
    .co-name{font-size:15px;font-weight:900;color:#0A1128}
    .co-sub{font-size:7px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
    .co-badge{display:inline-block;font-size:6.5px;font-weight:800;color:#6366f1;background:#eef2ff;border:1px solid #c7d2fe;border-radius:20px;padding:1.5px 7px;letter-spacing:1px;text-transform:uppercase;margin-top:3px}
    .co-right{display:flex;flex-direction:column;justify-content:center;gap:4px;padding:10px 18px;background:white;border-left:1px solid #e2e8f0;min-width:190px}
    .ci{display:flex;align-items:flex-start;gap:6px}
    .ci-icon{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
    .ci-icon.addr{background:#fef3c7}.ci-icon.phone{background:#d1fae5}.ci-icon.email{background:#dbeafe}
    .ci-label{font-size:7px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.8px}
    .ci-value{font-size:9px;font-weight:800;color:#1e293b;margin-top:0.5px}
    .tkt-bar{background:linear-gradient(135deg,#0A1128,#1a2342,#0a3a6b);color:white;padding:8px 18px;display:flex;align-items:center;justify-content:space-between}
    .tkt-bar-title{font-size:7.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#a5b4fc}
    .tkt-bar-ref{font-size:17px;font-weight:900;color:white;margin-top:1px;letter-spacing:0.5px}
    .tkt-date{font-size:7px;color:#a5b4fc;margin-bottom:3px;text-align:right}
    .tkt-status{font-size:8px;font-weight:900;background:#10b981;color:white;padding:2px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase}
    .bk-bar{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #e2e8f0;background:#f8fafc}
    .bk-cell{padding:7px 14px;border-right:1px solid #e2e8f0}
    .bk-cell:last-child{border-right:none}
    .bk-label{font-size:7px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
    .bk-value{font-size:10px;font-weight:800;color:#1e293b;font-family:'Courier New',monospace}
    .pax-section{padding:8px 18px}
    .pax-sec-title{font-size:7.5px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px;padding-bottom:4px;border-bottom:1.5px solid #e2e8f0}
    .pax-table{width:100%;border-collapse:collapse}
    .pax-table th{background:#1e293b;color:white;padding:6px 10px;text-align:left;font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
    .pax-table td{padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:9.5px;color:#1e293b;font-weight:600;vertical-align:middle}
    .pax-table tr:nth-child(even) td{background:#f8fafc}
    .pax-name-cell{font-size:10px;font-weight:800;color:#0A1128}
    .pax-type-badge{display:inline-block;font-size:7px;font-weight:800;padding:1.5px 7px;border-radius:10px;text-transform:uppercase}
    .type-adult{background:#dbeafe;color:#1d4ed8}
    .type-child{background:#fef3c7;color:#92400e}
    .type-infant{background:#fce7f3;color:#9d174d}
    .pp-num{font-family:'Courier New',monospace;font-size:9px;color:#475569}
    .route{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-bottom:1.5px dashed #e2e8f0}
    .city-code{font-size:30px;font-weight:900;color:#0A1128;letter-spacing:2px;line-height:1}
    .city-label{font-size:7px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-top:3px}
    .route-plane{font-size:18px;color:#6366f1}
    .route-triptype{font-size:7px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:3px}
    .body{padding:8px 18px}
    .sec-title{font-size:7.5px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;margin-top:8px;padding-bottom:4px;border-bottom:1.5px solid #e2e8f0}
    .seg{display:grid;grid-template-columns:110px 1fr 70px;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:7px 10px;margin-bottom:4px}
    .seg-flight{font-size:10px;font-weight:800;color:#1e293b}
    .seg-num{font-size:7.5px;color:#94a3b8;margin-top:1px}
    .seg-route{display:flex;align-items:center;justify-content:center;gap:8px}
    .seg-city .code{font-size:15px;font-weight:900;color:#4338ca}
    .seg-city .time{font-size:10px;font-weight:700;color:#1e293b;margin-top:1px}
    .seg-city .dt{font-size:7px;color:#94a3b8;margin-top:1px}
    .seg-arrow{font-size:16px;color:#c7d2fe}
    .seg-right{text-align:right;font-size:8px;color:#64748b}
    .baggage-box{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:5px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:6px;overflow:hidden}
    .bag-header{grid-column:1/-1;background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;padding:5px 12px;font-size:7.5px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px}
    .bag-item{text-align:center;padding:5px 6px;background:white;margin:4px;border-radius:5px;border:1px solid #bfdbfe}
    .bag-icon{font-size:13px;margin-bottom:2px}
    .bag-label{font-size:7px;font-weight:800;color:#1d4ed8;text-transform:uppercase}
    .bag-value{font-size:9px;font-weight:900;color:#1e3a8a;margin-top:1px}
    .bag-sub{font-size:6.5px;color:#60a5fa;margin-top:1px}
    .fare-box{border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-top:6px}
    .fare-row{display:flex;justify-content:space-between;align-items:center;padding:5px 12px;border-bottom:1px solid #f1f5f9;font-size:9px;color:#475569}
    .fare-label{font-weight:600}.fare-val{font-weight:700;font-family:'Courier New',monospace}
    .fare-total{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;background:#0A1128;color:white}
    .fare-total-label{font-size:9.5px;font-weight:700}
    .fare-total-val{font-size:14px;font-weight:900;font-family:'Courier New',monospace}
    .barcode-wrap{text-align:center;padding:7px 0 4px;border-top:1px dashed #e2e8f0;margin-top:7px}
    .barcode{font-family:'Courier New',monospace;font-size:20px;letter-spacing:5px;color:#1e293b;display:inline-block;border:1px solid #e2e8f0;padding:5px 20px;border-radius:6px;background:#f8fafc;font-weight:700}
    .barcode-label{font-size:7px;color:#94a3b8;margin-top:3px;letter-spacing:2px;text-transform:uppercase}
    .notice-box{margin-top:8px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden}
    .notice-header{background:#0A1128;color:white;padding:5px 14px;font-size:7.5px;font-weight:900;text-transform:uppercase;letter-spacing:2px}
    .notice-body{padding:7px 14px;background:#fffbeb;border-top:2px solid #fbbf24;display:grid;grid-template-columns:1fr 1fr;gap:5px 12px}
    .notice-title{font-size:7.5px;font-weight:900;color:#92400e;text-transform:uppercase;margin-bottom:2px}
    .notice-text{font-size:7px;color:#78350f;line-height:1.5}
    .footer{background:#f8fafc;padding:6px 18px;text-align:center;font-size:7px;color:#94a3b8;border-top:1px solid #e2e8f0;margin-top:8px}
    .footer strong{color:#0A1128}
    @media print{body{background:white;padding:0;margin:0}.page{max-width:100%}@page{margin:6mm;size:A4}}
  </style>
</head>
<body>
<div class="page">
  <div class="co-header">
    <div class="co-left">
      <div class="co-icon">${companyName.substring(0, 2).toUpperCase()}</div>
      <div>
        <div class="co-name">${companyName}</div>
        <div class="co-sub">✈ Authorized Travel Agency</div>
        <div class="co-badge">E-Ticket · Official Document</div>
      </div>
    </div>
    <div class="co-right">
      ${companyAddress ? `<div class="ci"><div class="ci-icon addr">📍</div><div><div class="ci-label">Address</div><div class="ci-value">${companyAddress}</div></div></div>` : ""}
      ${companyPhone   ? `<div class="ci"><div class="ci-icon phone">📞</div><div><div class="ci-label">Phone</div><div class="ci-value">${companyPhone}</div></div></div>` : ""}
      ${companyEmail   ? `<div class="ci"><div class="ci-icon email">✉️</div><div><div class="ci-label">Email</div><div class="ci-value">${companyEmail}</div></div></div>` : ""}
    </div>
  </div>
  <div class="tkt-bar">
    <div>
      <div class="tkt-bar-title">Electronic Ticket / Itinerary Receipt</div>
      <div class="tkt-bar-ref">${booking?.bookingId}</div>
    </div>
    <div>
      <div class="tkt-date">${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}</div>
      <div style="text-align:right"><span class="tkt-status">✓ ${booking?.status}</span></div>
    </div>
  </div>
  <div class="bk-bar">
    <div class="bk-cell"><div class="bk-label">Booking ID</div><div class="bk-value">${booking?.bookingId}</div></div>
    <div class="bk-cell"><div class="bk-label">Airline PNR</div><div class="bk-value">${booking?.pnr}</div></div>
    <div class="bk-cell"><div class="bk-label">Booking Date</div><div class="bk-value" style="font-family:sans-serif;font-size:9px">${formatDate(booking?.bookingDate || booking?.createdAt)}</div></div>
    <div class="bk-cell"><div class="bk-label">Booked By</div><div class="bk-value" style="font-family:sans-serif;font-size:9px">${agentUserName}</div></div>
  </div>
  <div class="pax-section">
    <div class="pax-sec-title">👥 Passenger Information</div>
    <table class="pax-table">
      <thead><tr><th>#</th><th>Full Name</th><th>Ticket Number</th><th>Type</th><th>Gender</th><th>Passport No.</th><th>Nationality</th></tr></thead>
      <tbody>
        ${(booking?.passengers || []).map((pax: any, i: number) => `
        <tr>
          <td style="color:#94a3b8;width:25px;font-weight:800">${i + 1}</td>
          <td><div class="pax-name-cell">${pax.title} ${pax.firstName} ${pax.lastName}</div></td>
          <td style="font-family:'Courier New',monospace;font-size:9px;color:#059669;font-weight:700">${ticketInfo?.ticketNumber || "—"}</td>
          <td><span class="pax-type-badge type-${(pax.type || "adult").toLowerCase()}">${pax.type || "—"}</span></td>
          <td style="font-size:9px">${pax.gender || "—"}</td>
          <td class="pp-num">${pax.passportNumber || "—"}</td>
          <td style="font-size:9px">${pax.nationality || "—"}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>
  <div class="route">
    <div><div class="city-code">${booking?.route?.split("-")[0] || ""}</div><div class="city-label">Origin</div></div>
    <div style="text-align:center"><div class="route-plane">─ ─ ✈ ─ ─</div><div class="route-triptype">${(booking?.tripType || "").replace("_", " ")}</div></div>
    <div style="text-align:right"><div class="city-code">${booking?.route?.split("-")[1] || ""}</div><div class="city-label">Destination</div></div>
  </div>
  <div class="body">
    <div class="sec-title">✈ &nbsp;Flight Segments</div>
    ${(booking?.segments || []).map((seg: any, i: number) => `
    <div class="seg">
      <div><div class="seg-flight">${seg.airline} · ${seg.flightNo}</div><div class="seg-num">Segment ${i + 1}</div></div>
      <div class="seg-route">
        <div class="seg-city" style="text-align:right"><div class="code">${seg.from}</div><div class="time">${formatTime(seg.departure)}</div><div class="dt">${formatDate(seg.departure)}</div></div>
        <div class="seg-arrow">✈</div>
        <div class="seg-city" style="text-align:left"><div class="code">${seg.to}</div><div class="time">${formatTime(seg.arrival)}</div><div class="dt">${formatDate(seg.arrival)}</div></div>
      </div>
      <div class="seg-right"><div style="font-weight:800;font-size:9px">${seg.airline}</div><div>${seg.flightNo}</div></div>
    </div>`).join("")}
    <div class="baggage-box">
      <div class="bag-header">🧳 &nbsp;Baggage Allowance</div>
      <div class="bag-item"><div class="bag-icon">🧳</div><div class="bag-label">Checked</div><div class="bag-value">${booking?.baggageInfo?.checked || "As per fare"}</div><div class="bag-sub">${(booking?.baggageInfo?.checkedRaw || 0) > 0 ? "Included in fare" : "Airline policy applies"}</div></div>
      <div class="bag-item"><div class="bag-icon">🎒</div><div class="bag-label">Carry-On</div><div class="bag-value">${booking?.baggageInfo?.cabin || "1 Bag"}</div><div class="bag-sub">Per passenger</div></div>
      <div class="bag-item"><div class="bag-icon">📐</div><div class="bag-label">Size Limit</div><div class="bag-value">22×15×8 in</div><div class="bag-sub">Max 45in total</div></div>
    </div>
    <div class="sec-title">💰 &nbsp;Fare Summary</div>
    <div class="fare-box">
      <div class="fare-row"><span class="fare-label">Base Fare (Net)</span><span class="fare-val">${currencyLabel} ${printNet.toLocaleString()}</span></div>
      <div class="fare-row"><span class="fare-label">Taxes &amp; Markup</span><span class="fare-val">${currencyLabel} ${printTax.toLocaleString()}</span></div>
      ${printCommission > 0 ? `<div class="fare-row"><span class="fare-label">Commission</span><span class="fare-val">${currencyLabel} ${printCommission.toLocaleString()}</span></div>` : ""}
      <div class="fare-total"><span class="fare-total-label">Total · ${booking?.passengers?.length} Pax · ${currencyLabel}</span><span class="fare-total-val">${currencyLabel} ${printGross.toLocaleString()}</span></div>
    </div>
    ${ticketInfo?.ticketNumber ? `<div class="barcode-wrap"><div class="barcode">${ticketInfo.ticketNumber}</div><div class="barcode-label">Ticket Number</div></div>` : ""}
    <div class="notice-box">
      <div class="notice-header">⚠ &nbsp;Important Notice For Travelers</div>
      <div class="notice-body">
        <div><div class="notice-title">🎫 E-Ticket Notice</div><div class="notice-text">Carriage and other services provided by the carrier are subject to conditions of carriage.</div></div>
        <div><div class="notice-title">🛂 Passport / Visa</div><div class="notice-text">Please ensure valid passport &amp; necessary Visas for your destination.</div></div>
        <div><div class="notice-title">🎒 Carry-On</div><div class="notice-text"><strong>LIMIT:</strong> 1 bag | <strong>SIZE:</strong> 22×15×8 in | <strong>WEIGHT:</strong> Max 7 kg</div></div>
        <div><div class="notice-title">🕐 Check-In</div><div class="notice-text">Check-in opens <strong>3hrs</strong> before international. Counters close <strong>90 min</strong> before departure.</div></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>Electronically generated e-ticket. <strong>No signature required.</strong></p>
    <p style="margin-top:3px">Issued by: <strong>${companyName}</strong>${companyPhone ? ` · 📞 <strong>${companyPhone}</strong>` : ""} · Generated: <strong>${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}</strong></p>
  </div>
</div>
</body>
</html>`;
  };

  // ── Handlers ──
  const handlePrintTicket = () => {
    const html = generateTicketHTML();
    const w    = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); w.close(); }, 500);
  };

  const handleDownloadTicket = () => {
    const html = generateTicketHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `E-Ticket-${booking?.bookingId}-${ticketInfo?.ticketNumber || "ticket"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmitRequest = async () => {
    if (!requestType || !booking?.id) return;
    setSubmittingRequest(true);
    setRequestSuccess("");
    setRequestError("");
    try {
      await apiClient("/bookings/requests", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          type:      requestType,
          remarks:   requestRemarks.trim() || null,
        }),
      });
      setRequestSuccess(
        `${REQUEST_CONFIG[requestType]?.label} submitted successfully!`
      );
      setShowRequestModal(false);
      setRequestType("");
      setRequestRemarks("");
      const updated = await apiClient(`/bookings/${bookingId}`);
      setBooking(updated);
    } catch (err: any) {
      console.error("Request error:", err?.message);
      setRequestError(err?.message || "Something went wrong");
    } finally {
      setSubmittingRequest(false);
    }
  };

  // ── Loading / Error ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500
            to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <Loader2 size={28} className="animate-spin text-white" />
          </div>
          <p className="text-sm font-bold text-slate-500">Loading booking details...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-10 text-center max-w-md shadow-lg"
        >
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center
            justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Booking Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white
              rounded-xl font-bold text-sm transition"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const statusCfg      = STATUS_CONFIG[booking?.status] || STATUS_CONFIG.ON_HOLD;
  const allowedActions = ALLOWED_ACTIONS[booking?.status] || [];

  const TearLine = () => (
    <div className="relative flex items-center bg-white h-4">
      <div className="absolute -left-3 h-6 w-6 rounded-full border border-emerald-200 bg-[#F4F7FA]" />
      <div className="mx-3 flex-1 border-t-2 border-dashed border-emerald-300" />
      <div className="absolute -right-3 h-6 w-6 rounded-full border border-emerald-200 bg-[#F4F7FA]" />
    </div>
  );

  const issuedReq = booking?.requests?.find(
    (r: any) => r.type === "ISSUE" && r.status === "APPROVED"
  );
  const hasIssued  = !!issuedReq;
  const origin     = booking?.route?.split("-")?.[0] || "—";
  const destination = booking?.route?.split("-")?.[1] || "—";
  const firstSeg   = booking?.segments?.[0];
  const lastSeg    = booking?.segments?.[booking?.segments?.length - 1];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F7FA]">

      {/* ── Navbar ── */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#0A1128]
        via-[#111936] to-[#0A1128] text-white shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20
                flex items-center justify-center transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest">Booking Details</h1>
              <p className="text-xs text-indigo-300 font-medium">{booking?.bookingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(booking?.pnr)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition"
              title="Copy PNR"
            >
              <Copy size={16} />
            </button>
            {isTicketed && (
              <>
                <button
                  onClick={() => setShowFareEditor(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500
                    hover:bg-amber-600 rounded-xl transition text-sm font-black active:scale-95"
                >
                  <Edit2 size={14} /> Fare
                </button>
                <button
                  onClick={handlePrintTicket}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500
                    hover:bg-emerald-600 rounded-xl transition text-sm font-black active:scale-95"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={handleDownloadTicket}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500
                    hover:bg-indigo-600 rounded-xl transition text-sm font-black active:scale-95"
                >
                  <Download size={14} /> Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">

        <AnimatePresence>
          {requestSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-3 bg-emerald-50 border
                border-emerald-200 rounded-2xl px-5 py-3 shadow-sm"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <p className="text-sm font-bold text-emerald-700 flex-1">{requestSuccess}</p>
              <button
                onClick={() => setRequestSuccess("")}
                className="p-1 hover:bg-emerald-100 rounded-lg transition"
              >
                <X size={15} className="text-emerald-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ══════════════════════ LEFT COL ══════════════════════ */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white
                shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1e3a8a_0%,_#0f172a_38%,_#020617_100%)] px-5 py-4">
                <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
                <div className="relative z-10">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl
                        border border-white/10 bg-white/10 backdrop-blur-sm shadow-lg">
                        <Plane size={18} className="rotate-90 text-indigo-300" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-indigo-300">
                          Electronic Ticket
                        </p>
                        <p className="mt-0.5 text-lg font-black tracking-tight text-white">
                          {booking?.bookingId || "—"}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border
                      px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm
                      ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      {statusCfg.icon} {booking?.status}
                    </span>
                  </div>
                  <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="min-w-[72px] text-center">
                        <p className="text-3xl font-black leading-none tracking-[2px] text-white">
                          {origin}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-indigo-300">
                          {firstSeg?.departure ? formatTime(firstSeg.departure) : "—"}
                        </p>
                        <p className="text-[9px] text-indigo-400">
                          {booking?.departureDate ? formatDate(booking.departureDate) : "—"}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-indigo-400/60 to-indigo-400/60" />
                          <div className="flex h-9 w-9 items-center justify-center rounded-full
                            border border-indigo-300/20 bg-indigo-500/15">
                            <Plane size={13} className="rotate-90 text-indigo-300" />
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-l from-white/10 via-indigo-400/60 to-indigo-400/60" />
                        </div>
                        <p className="mt-2 text-center text-[10px] font-bold text-indigo-300">
                          {booking?.carrier || "—"} · {(booking?.tripType || "—").replace(/_/g, " ")} · {booking?.passengers?.length || 0} Pax
                        </p>
                      </div>
                      <div className="min-w-[72px] text-center">
                        <p className="text-3xl font-black leading-none tracking-[2px] text-white">
                          {destination}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-indigo-300">
                          {lastSeg?.arrival ? formatTime(lastSeg.arrival) : "—"}
                        </p>
                        <p className="text-[9px] text-indigo-400">
                          {lastSeg?.arrival ? formatDate(lastSeg.arrival) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Info */}
              <div className="bg-white px-5 py-4">
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2.5">
                    <p className="flex items-center gap-1 text-[8px] font-black uppercase
                      tracking-widest text-indigo-500">
                      <Hash size={10} /> PNR
                    </p>
                    <p className="mt-1 text-sm font-black text-indigo-800 font-mono truncate">
                      {booking?.pnr || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                    <p className="flex items-center gap-1 text-[8px] font-black uppercase
                      tracking-widest text-blue-500">
                      <Clock size={10} /> Booking Time
                    </p>
                    <p className="mt-1 text-xs font-black text-blue-800 truncate">
                      {formatDateTime(booking?.bookingDate || booking?.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2.5">
                    <p className="flex items-center gap-1 text-[8px] font-black uppercase
                      tracking-widest text-sky-500">
                      <Plane size={10} /> Flight Time
                    </p>
                    <p className="mt-1 text-xs font-black text-sky-800 truncate">
                      {formatDateTime(booking?.departureDate)}
                    </p>
                  </div>
                  {(() => {
                    const hi = !!issuedReq?.processedAt;
                    return (
                      <div className={`rounded-2xl border px-3 py-2.5
                        ${hi ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
                        <p className={`flex items-center gap-1 text-[8px] font-black
                          uppercase tracking-widest
                          ${hi ? "text-emerald-500" : "text-slate-400"}`}>
                          <Ticket size={10} /> Issue Time
                        </p>
                        <p className={`mt-1 text-xs font-black truncate
                          ${hi ? "text-emerald-800" : "text-slate-400 italic"}`}>
                          {hi ? formatDateTime(issuedReq.processedAt) : "Not issued"}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Ticket Strip */}
              {hasIssued && ticketInfo?.ticketNumber && (
                <>
                  <TearLine />
                  <div className="bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                          E-Ticket Issued & Confirmed
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 shadow-sm">
                          <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500">
                            Ticket Number
                          </p>
                          <p className="mt-0.5 text-sm font-black text-emerald-800 font-mono">
                            {ticketInfo.ticketNumber}
                          </p>
                        </div>
                        {convertedIssueAmount != null && (
                          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 shadow-sm">
                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500">
                              Issued Amount
                            </p>
                            <p className="mt-0.5 text-sm font-black text-emerald-800 font-mono">
                              {currencyLabel} {convertedIssueAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Passengers */}
              <div className="bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                    <Users size={13} className="text-purple-600" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                    Passenger Information
                  </p>
                  <span className="text-[9px] font-black text-purple-500 bg-purple-50
                    border border-purple-100 px-1.5 py-0.5 rounded-md">
                    {booking?.passengers?.length || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {booking?.passengers?.map((pax: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-slate-100
                      bg-slate-50 overflow-hidden">
                      <div className="flex items-center gap-3 px-3.5 py-3 bg-white
                        border-b border-slate-100">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl
                          text-sm font-black shrink-0
                          ${pax.type === "ADULT" ? "bg-indigo-100 text-indigo-700"
                          : pax.type === "CHILD" ? "bg-amber-100 text-amber-700"
                          : "bg-pink-100 text-pink-700"}`}>
                          {pax.type === "INFANT" ? <Baby size={14} /> : (pax.firstName?.[0] || "?")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-800 truncate">
                            {pax.title} {pax.firstName} {pax.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase
                              ${pax.type === "ADULT" ? "bg-indigo-100 text-indigo-700"
                              : pax.type === "CHILD" ? "bg-amber-100 text-amber-700"
                              : "bg-pink-100 text-pink-700"}`}>
                              {pax.type}
                            </span>
                            {pax.gender && (
                              <span className="text-[9px] font-bold text-slate-400">{pax.gender}</span>
                            )}
                          </div>
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px]
                          font-black text-slate-500">
                          #{i + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                        {[
                          { icon: <FileText size={10} />, label: "Passport",    value: pax.passportNumber },
                          { icon: <Clock    size={10} />, label: "Expiry",      value: pax.passportExpiry ? formatDate(pax.passportExpiry) : null },
                          { icon: <Globe    size={10} />, label: "Nationality", value: pax.nationality },
                          { icon: <Calendar size={10} />, label: "DOB",         value: pax.dateOfBirth ? formatDate(pax.dateOfBirth) : null },
                          { icon: <Mail     size={10} />, label: "Email",       value: pax.email },
                          { icon: <Phone    size={10} />, label: "Phone",       value: pax.phone },
                        ].map((item, j) =>
                          item.value ? (
                            <div key={j} className="flex items-center gap-2 rounded-xl
                              border border-slate-100 bg-white px-2.5 py-2">
                              <span className="text-slate-400 shrink-0">{item.icon}</span>
                              <div className="min-w-0">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  {item.label}
                                </p>
                                <p className="mt-0.5 text-xs font-bold text-slate-700 truncate">
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <TearLine />

              {/* Flight Segments */}
              <div className="bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                    <MapPin size={13} className="text-indigo-600" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                    Flight Segments
                  </p>
                  <span className="text-[9px] font-black text-indigo-500 bg-indigo-50
                    border border-indigo-100 px-1.5 py-0.5 rounded-md">
                    {booking?.segments?.length || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {booking?.segments?.map((seg: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-slate-100
                      bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg
                            border border-slate-100 bg-white overflow-hidden shadow-sm shrink-0">
                            <img
                              src={`https://pics.avs.io/80/80/${seg.airline}.png`}
                              alt={seg.airline}
                              className="h-4 w-4 object-contain"
                              onError={(e) => { e.currentTarget.src = ""; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-slate-800 truncate">
                              {seg.airline} · {seg.flightNo}
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Segment {i + 1}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-lg bg-white px-2 py-1 text-[9px] font-black
                          text-slate-500 border border-slate-100">
                          {formatDate(seg.departure)}
                        </span>
                      </div>
                      <div className="grid grid-cols-[58px_1fr_58px] items-center gap-2">
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 leading-none">
                            {formatTime(seg.departure)}
                          </p>
                          <p className="mt-0.5 text-xs font-black text-indigo-600">{seg.from}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-indigo-300" />
                          <div className="flex h-5 w-5 items-center justify-center rounded-full
                            bg-indigo-50 border border-indigo-100">
                            <Plane size={8} className="rotate-90 text-indigo-500" />
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-indigo-300" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 leading-none">
                            {formatTime(seg.arrival)}
                          </p>
                          <p className="mt-0.5 text-xs font-black text-indigo-600">{seg.to}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baggage */}
              <div className="bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                    <Luggage size={13} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                    Baggage Information
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3.5 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl
                        bg-blue-500 text-white shrink-0">
                        <Luggage size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                          Checked Baggage
                        </p>
                        <p className="mt-1 text-base font-black text-slate-900">
                          {booking?.baggageInfo?.checked || "As per fare"}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          {booking?.baggageInfo?.checkedRaw > 0
                            ? "✓ Included in fare"
                            : "Airline policy applies"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3.5 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl
                        bg-indigo-500 text-white shrink-0">
                        <ShieldCheck size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                          Cabin Baggage
                        </p>
                        <p className="mt-1 text-base font-black text-slate-900">
                          {booking?.baggageInfo?.cabin || "7 KG"}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">
                          Max 1 bag per passenger
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Length", value: "55 cm",  sub: "22 in"  },
                    { label: "Width",  value: "40 cm",  sub: "15 in"  },
                    { label: "Depth",  value: "20 cm",  sub: "8 in"   },
                    { label: "Weight", value: "7 KG",   sub: "15 lbs" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-slate-100
                      bg-slate-50 px-2.5 py-2 text-center">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs font-black text-slate-800">{item.value}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <TearLine />

              {/* Policy */}
              <div className="bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                    <AlertCircle size={13} className="text-amber-600" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                    Policy & Rules
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: <Luggage      size={10} />, title: "Extra Baggage",     text: "Additional bags can be purchased online or at check-in counter.",                                             bg: "bg-blue-50 border-blue-100",   iconColor: "text-blue-500",   textColor: "text-blue-700"   },
                    { icon: <AlertCircle  size={10} />, title: "Restricted Items",  text: "Liquids >100ml, sharp objects & batteries over 160Wh prohibited in cabin.",                                  bg: "bg-amber-50 border-amber-100", iconColor: "text-amber-500", textColor: "text-amber-700" },
                    { icon: <Info         size={10} />, title: "Policy Notice",     text: "Allowance varies by airline, route, fare class & loyalty status. Verify before travel.",                     bg: "bg-slate-50 border-slate-100", iconColor: "text-slate-400", textColor: "text-slate-600" },
                  ].map((tip, i) => (
                    <div key={i} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 ${tip.bg}`}>
                      <span className={`${tip.iconColor} shrink-0 mt-0.5`}>{tip.icon}</span>
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-0.5
                          ${tip.textColor} opacity-80`}>
                          {tip.title}
                        </p>
                        <p className={`text-[10px] font-medium leading-relaxed ${tip.textColor}`}>
                          {tip.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {booking?.conditions && (
                    <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 border
                      text-xs font-black
                      ${booking.conditions.refundable
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-100"}`}
                    >
                      <ShieldCheck size={12} />
                      <span>{booking.conditions.refundable ? "Refundable" : "Non-Refundable"}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ══════════════════════ RIGHT SIDEBAR ══════════════════════ */}
          <div className="space-y-4">

            {/* Price Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest
                    flex items-center gap-2">
                    <CreditCard size={14} className="text-indigo-500" />
                    Price Breakdown
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100
                    text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    {currencyLabel}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {fare ? (
                  <>
                    <div className="space-y-1.5">
                      {fare.agentUi.adults > 0 && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm font-semibold text-slate-500">
                            Adult × {fare.agentUi.adults}
                          </span>
                          <span className="text-sm font-black text-slate-700">
                            {fare.agentUi.currency} {fare.agentUi.totalBaseTax.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {fare.agentUi.children > 0 && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm font-semibold text-slate-500">
                            Child × {fare.agentUi.children}
                          </span>
                          <span className="text-sm font-black text-slate-700">Included</span>
                        </div>
                      )}
                      {fare.agentUi.infants > 0 && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm font-semibold text-slate-500">
                            Infant × {fare.agentUi.infants}
                          </span>
                          <span className="text-sm font-black text-slate-700">Included</span>
                        </div>
                      )}
                      <div className="border-t border-slate-100 my-1" />
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-slate-500">Base Fare</span>
                        <span className="text-sm font-black text-slate-700">
                          {fare.agentUi.currency} {fare.agentUi.baseFare.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-slate-500">Tax & Fee</span>
                        <span className="text-sm font-black text-slate-700">
                          {fare.agentUi.currency} {fare.agentUi.taxAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 my-1" />
                      <div className="flex justify-between items-center py-1.5
                        bg-slate-50 rounded-xl px-3">
                        <span className="text-sm font-bold text-slate-600">Total Base & Tax</span>
                        <span className="text-sm font-black text-slate-800">
                          {fare.agentUi.currency} {fare.agentUi.totalBaseTax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5
                        bg-blue-50 rounded-xl px-3">
                        <span className="text-sm font-bold text-blue-700">
                          Customer Invoice Total
                        </span>
                        <span className="text-sm font-black text-blue-800">
                          {fare.agentUi.currency} {fare.agentUi.customerInvoiceTotal.toLocaleString()}
                        </span>
                      </div>
                      {fare.agentUi.discountOrCommission > 0 && (
                        <div className="flex justify-between items-center py-1.5
                          bg-emerald-50 rounded-xl px-3">
                          <span className="text-sm font-bold text-emerald-700">
                            Discount / Commission
                          </span>
                          <span className="text-sm font-black text-emerald-700">
                            − {fare.agentUi.currency} {fare.agentUi.discountOrCommission.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 px-3 mt-1
                        bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl
                        shadow-md shadow-indigo-100">
                        <div>
                          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                            Grand Total
                          </p>
                          <p className="text-[10px] text-indigo-300 mt-0.5">
                            {fare.agentUi.totalPax} Pax · {fare.agentUi.currency}
                          </p>
                        </div>
                        <span className="text-xl font-black text-white">
                          {fare.agentUi.currency} {fare.agentUi.grandTotal.toLocaleString()}
                        </span>
                      </div>
                      {fare.agentUi.totalPax > 1 && (
                        <div className="flex justify-between items-center py-1 px-1">
                          <span className="text-xs font-bold text-slate-400">Per Person</span>
                          <span className="text-xs font-black text-slate-500">
                            {fare.agentUi.currency} {fare.agentUi.perPerson.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowPriceExtra(!showPriceExtra)}
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl
                        border border-slate-200 bg-slate-50 hover:bg-slate-100
                        px-3 py-2.5 transition active:scale-95"
                    >
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        {showPriceExtra ? "Show Less" : "Show More Details"}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-500 transition-transform duration-300
                          ${showPriceExtra ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {showPriceExtra && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-3 border-t border-slate-100 space-y-5">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase
                                tracking-widest mb-3 flex items-center gap-1.5">
                                <Wallet size={11} className="text-slate-400" /> Agent Summary
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-emerald-50 rounded-xl px-3 py-3 border border-emerald-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Wallet size={12} className="text-emerald-500" />
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                      Balance
                                    </p>
                                  </div>
                                  <p className="text-sm font-black text-emerald-800">
                                    {currencyLabel} {Math.round(convertCurrency(
                                      Number(booking?.agent?.balance || 0),
                                      booking?.currency || "SAR",
                                      currencyLabel
                                    )).toLocaleString()}
                                  </p>
                                </div>
                                <div className="bg-indigo-50 rounded-xl px-3 py-3 border border-indigo-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <CreditCard size={12} className="text-indigo-500" />
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                      Credit
                                    </p>
                                  </div>
                                  <p className="text-sm font-black text-indigo-800">
                                    {currencyLabel} {Math.round(convertCurrency(
                                      Number(booking?.agent?.creditLimit || 0),
                                      "SAR",
                                      currencyLabel
                                    )).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {booking?.baggageInfo && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase
                                  tracking-widest mb-2 flex items-center gap-1.5">
                                  <Luggage size={11} className="text-slate-400" /> Baggage
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2
                                    border text-xs font-black
                                    ${booking?.baggageInfo?.checkedRaw > 0
                                      ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                      : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                    <Luggage size={11} />
                                    <span>Check-in: {booking?.baggageInfo?.checked || "N/A"}</span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2
                                    border text-xs font-black
                                    ${booking?.baggageInfo?.cabinRaw > 0
                                      ? "bg-sky-50 text-sky-600 border-sky-100"
                                      : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                    <Luggage size={11} />
                                    <span>Cabin: {booking?.baggageInfo?.cabin || "N/A"}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {booking?.conditions && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase
                                  tracking-widest mb-2 flex items-center gap-1.5">
                                  <ShieldCheck size={11} className="text-slate-400" /> Fare Rules
                                </p>
                                <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2
                                  border text-xs font-black
                                  ${booking?.conditions?.refundable
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                                  <ShieldCheck size={11} />
                                  <span>
                                    {booking?.conditions?.refundable ? "Refundable" : "Non-Refundable"}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase
                                tracking-widest mb-2">
                                Pricing Config
                              </p>
                              {[
                                { label: "Commission Type", value: fare.meta.commissionType },
                                { label: "Commission Mode", value: fare.meta.commissionMode },
                                { label: "Commission On",   value: fare.meta.commissionOn   },
                                { label: "AIT Applied On",  value: fare.meta.aitOn          },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-0.5">
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {item.label}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-600
                                    capitalize bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Loader2 size={20} className="animate-spin text-slate-300 mx-auto" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            {allowedActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest
                  mb-4 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" /> Quick Actions
                </h3>
                <div className="space-y-2.5">
                  {allowedActions.map((action) => {
                    const cfg = REQUEST_CONFIG[action];
                    if (!cfg) return null;
                    return (
                      <button
                        key={action}
                        onClick={() => {
                          setRequestType(action);
                          setRequestRemarks("");
                          setRequestError("");
                          setShowRequestModal(true);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                          bg-gradient-to-r text-white transition-all shadow-md
                          hover:shadow-lg active:scale-[0.98] ${cfg.btnClass}`}
                      >
                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center
                          justify-center shrink-0">
                          {cfg.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black">{cfg.label}</p>
                          <p className="text-xs font-medium opacity-80">{cfg.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Request History */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {(() => {
                const requests           = booking?.requests || [];
                const approvedIssueReq   = requests.find(
                  (r: any) => r.type === "ISSUE" && r.status === "APPROVED"
                );
                const bookingTime = booking?.bookingDate || booking?.createdAt;
                const issueTime   = approvedIssueReq?.processedAt || null;

                return (
                  <>
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-400 uppercase
                          tracking-widest flex items-center gap-2">
                          <MessageSquare size={14} className="text-purple-500" />
                          Request History
                        </h3>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 border
                          border-purple-100 text-[10px] font-black text-purple-600
                          uppercase tracking-widest">
                          {requests.length} Request{requests.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Timeline Header */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50
                          border border-indigo-100 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Clock size={12} className="text-indigo-600" />
                            </div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                              Booking Time
                            </p>
                          </div>
                          <p className="text-sm font-black text-indigo-800 ml-8">
                            {bookingTime ? formatDateTime(bookingTime) : "—"}
                          </p>
                        </div>

                        {approvedIssueReq && (
                          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50
                            border border-emerald-100 px-4 py-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Ticket size={12} className="text-emerald-600" />
                              </div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                Issue Time
                              </p>
                            </div>
                            <p className="text-sm font-black text-emerald-800 ml-8">
                              {issueTime ? formatDateTime(issueTime) : "Processing..."}
                            </p>
                            <div className="mt-2 ml-8 flex flex-wrap gap-2">
                              {approvedIssueReq?.ticketNumber && (
                                <div className="flex items-center gap-1.5 bg-emerald-100
                                  rounded-lg px-2.5 py-1">
                                  <Ticket size={10} className="text-emerald-600" />
                                  <span className="text-[10px] font-black text-emerald-700 font-mono">
                                    {approvedIssueReq.ticketNumber}
                                  </span>
                                </div>
                              )}
                              {approvedIssueReq?.gdsPnr && (
                                <div className="flex items-center gap-1.5 bg-emerald-100
                                  rounded-lg px-2.5 py-1">
                                  <Hash size={10} className="text-emerald-600" />
                                  <span className="text-[10px] font-black text-emerald-700 font-mono">
                                    {approvedIssueReq.gdsPnr}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Show More / Empty */}
                      {requests.length > 0 ? (
                        <button
                          onClick={() => setShowRequestExtra(!showRequestExtra)}
                          className="w-full mt-4 flex items-center justify-center gap-2
                            rounded-xl border border-slate-200 bg-slate-50
                            hover:bg-slate-100 px-3 py-2.5 transition active:scale-95"
                        >
                          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {showRequestExtra
                              ? "Hide Details"
                              : `View All ${requests.length} Request${requests.length > 1 ? "s" : ""}`}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-slate-500 transition-transform duration-300
                              ${showRequestExtra ? "rotate-180" : ""}`}
                          />
                        </button>
                      ) : (
                        <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200
                          bg-slate-50 px-4 py-6 text-center">
                          <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center
                            justify-center mx-auto mb-3">
                            <FileText size={18} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">No request history yet</p>
                          <p className="text-xs text-slate-300 mt-1">
                            Use actions above to submit a request
                          </p>
                        </div>
                      )}

                      {/* Expanded Request Cards */}
                      <AnimatePresence initial={false}>
                        {showRequestExtra && requests.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                              {requests.map((req: any, i: number) => {
                                const typeCfg   = getRequestTypeConfig(req.type);
                                const statusCfgR = getRequestStatusConfig(req.status);

                                return (
                                  <motion.div
                                    key={req.id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-2xl border border-slate-100 bg-white
                                      overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    {/* Card Header */}
                                    <div className="px-4 py-3 flex items-center justify-between
                                      gap-2 bg-gradient-to-r from-slate-50 to-white
                                      border-b border-slate-100">
                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5
                                          text-[10px] font-black uppercase px-2.5 py-1.5
                                          rounded-xl ${typeCfg.bg} ${typeCfg.text}`}>
                                          {typeCfg.icon}
                                          {typeCfg.label}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5
                                          text-[10px] font-black px-2.5 py-1.5 rounded-xl border
                                          ${statusCfgR.bg} ${statusCfgR.text} ${statusCfgR.border}`}>
                                          <span className="relative flex h-2 w-2">
                                            {(req.status === "PENDING" || req.status === "PROCESSING") && (
                                              <span className={`animate-ping absolute inline-flex
                                                h-full w-full rounded-full opacity-75
                                                ${statusCfgR.dot}`} />
                                            )}
                                            <span className={`relative inline-flex rounded-full
                                              h-2 w-2 ${statusCfgR.dot}`} />
                                          </span>
                                          {statusCfgR.label}
                                        </span>
                                      </div>
                                      {req.processedBy && (
                                        <div className="flex items-center gap-1.5 bg-slate-100
                                          rounded-lg px-2 py-1">
                                          <Shield size={10} className="text-slate-500" />
                                          <span className="text-[10px] font-bold text-slate-600">
                                            By {String(req.processedBy).trim().split(" ").slice(-1)[0]}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                      <div className="flex items-start gap-3 mb-3">
                                        <div className="flex flex-col items-center mt-1">
                                          <div className={`w-2.5 h-2.5 rounded-full ${statusCfgR.dot}`} />
                                          {req.processedAt && (
                                            <>
                                              <div className="w-px h-8 bg-slate-200" />
                                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                            </>
                                          )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <p className="text-[9px] font-black text-slate-400
                                              uppercase tracking-widest">Requested</p>
                                            <p className="text-xs font-bold text-slate-700">
                                              {req.createdAt ? formatDateTime(req.createdAt) : "—"}
                                            </p>
                                          </div>
                                          {req.processedAt && (
                                            <div>
                                              <p className="text-[9px] font-black text-emerald-500
                                                uppercase tracking-widest">Processed</p>
                                              <p className="text-xs font-bold text-slate-700">
                                                {formatDateTime(req.processedAt)}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        {req.remarks && (
                                          <div className="bg-blue-50 rounded-xl px-3 py-2.5
                                            border border-blue-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <User size={10} className="text-blue-500" />
                                              <p className="text-[9px] font-black text-blue-500
                                                uppercase tracking-widest">Agent Note</p>
                                            </div>
                                            <p className="text-xs font-medium text-blue-800 ml-4">
                                              {req.remarks}
                                            </p>
                                          </div>
                                        )}
                                        {req.adminNote ? (
                                          <div className="bg-amber-50 rounded-xl px-3 py-2.5
                                            border border-amber-200">
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <Shield size={10} className="text-amber-600" />
                                              <p className="text-[9px] font-black text-amber-600
                                                uppercase tracking-widest">Admin Response</p>
                                            </div>
                                            <p className="text-xs font-semibold text-amber-800 ml-4">
                                              {req.adminNote}
                                            </p>
                                          </div>
                                        ) : (req.status === "PENDING" || req.status === "PROCESSING") ? (
                                          <div className="bg-slate-50 rounded-xl px-3 py-2.5
                                            border border-slate-100">
                                            <div className="flex items-center gap-1.5">
                                              <Clock size={10} className="text-slate-400" />
                                              <p className="text-[10px] font-medium text-slate-400 italic">
                                                Waiting for admin response...
                                              </p>
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                );
              })()}
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Fare Editor Modal ── */}
      <AnimatePresence>
        {showFareEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
              flex items-center justify-center p-4"
            onClick={() => setShowFareEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4
                flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Edit2 size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-base">Edit Fare for Print</p>
                    <p className="text-amber-100 text-xs">Changes are NOT saved to database</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFareEditor(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                  rounded-xl px-4 py-2.5">
                  <AlertCircle size={14} className="text-amber-500 shrink-0" />
                  <p className="text-xs font-bold text-amber-700">
                    Only affects printed/downloaded ticket.
                  </p>
                </div>
                {[
                  { label: `Base Fare (Net) — ${currencyLabel}`,         val: editNet,        set: setEditNet        },
                  { label: `Total Gross — ${currencyLabel}`,             val: editGross,      set: setEditGross      },
                  { label: `Commission — ${currencyLabel} (optional)`,   val: editCommission, set: setEditCommission },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="block text-xs font-black text-slate-400 uppercase
                      tracking-widest mb-2">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={field.val}
                      onChange={(e) => field.set(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-100
                        focus:border-amber-400 focus:ring-2 focus:ring-amber-100
                        rounded-xl text-base font-bold outline-none transition"
                    />
                  </div>
                ))}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">
                    Live Preview
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Base Fare</span>
                      <span className="font-black text-slate-800">
                        {currencyLabel} {parseFloat(editNet || "0").toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Taxes & Markup</span>
                      <span className="font-black text-slate-800">
                        {currencyLabel} {Math.max(
                          0,
                          parseFloat(editGross || "0") - parseFloat(editNet || "0")
                        ).toLocaleString()}
                      </span>
                    </div>
                    {parseFloat(editCommission || "0") > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-500">Commission</span>
                        <span className="font-black text-emerald-600">
                          {currencyLabel} {parseFloat(editCommission || "0").toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base pt-2 border-t border-slate-200 mt-1">
                      <span className="font-black text-indigo-700">Total (Gross)</span>
                      <span className="font-black text-indigo-700">
                        {currencyLabel} {parseFloat(editGross || "0").toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const src = booking?.currency || "SAR";
                    setEditNet(        String(Math.round(convertCurrency(Number(booking?.net        || 0), src, displayCurrency))));
                    setEditGross(      String(Math.round(convertCurrency(Number(booking?.gross      || 0), src, displayCurrency))));
                    setEditCommission( String(Math.round(convertCurrency(Number(booking?.commission || 0), src, displayCurrency))));
                  }}
                  className="w-full py-2.5 text-xs font-black text-slate-400
                    hover:text-slate-600 uppercase tracking-widest transition"
                >
                  ↺ Reset to Original Values
                </button>
              </div>
              <div className="px-5 pb-5 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowFareEditor(false)}
                  className="py-3 rounded-xl border-2 border-slate-100 text-sm font-black
                    text-slate-500 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowFareEditor(false); setTimeout(handlePrintTicket, 100); }}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white
                    text-sm font-black flex items-center justify-center gap-2
                    transition active:scale-95"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => { setShowFareEditor(false); setTimeout(handleDownloadTicket, 100); }}
                  className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white
                    text-sm font-black flex items-center justify-center gap-2
                    transition active:scale-95"
                >
                  <Download size={14} /> Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Request Modal ── */}
      <AnimatePresence>
        {showRequestModal && requestType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50
              flex items-center justify-center p-4"
            onClick={() => !submittingRequest && setShowRequestModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center
                      ${requestType === "ISSUE"   ? "bg-emerald-100 text-emerald-600"
                      : requestType === "REISSUE" ? "bg-indigo-100  text-indigo-600"
                      : requestType === "CANCEL"  ? "bg-rose-100    text-rose-600"
                      : requestType === "REFUND"  ? "bg-purple-100  text-purple-600"
                      : "bg-amber-100 text-amber-600"}`}>
                      {REQUEST_CONFIG[requestType]?.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800">
                        {REQUEST_CONFIG[requestType]?.label}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {REQUEST_CONFIG[requestType]?.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => !submittingRequest && setShowRequestModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 space-y-2">
                  {[
                    { label: "Booking", value: booking?.bookingId },
                    { label: "PNR",     value: booking?.pnr       },
                    { label: "Route",   value: booking?.route     },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-400">{item.label}</span>
                      <span className="font-black text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>

                {requestError && (
                  <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200
                    rounded-xl px-4 py-2.5">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <p className="text-sm font-bold text-rose-700">{requestError}</p>
                  </div>
                )}

                <label className="block text-xs font-black text-slate-400 uppercase
                  tracking-widest mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={requestRemarks}
                  onChange={(e) => setRequestRemarks(e.target.value)}
                  placeholder="Add any notes for admin..."
                  rows={3}
                  disabled={submittingRequest}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100
                    focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none
                    text-sm text-slate-800 resize-none placeholder:text-slate-300
                    transition-all disabled:opacity-50"
                />
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  disabled={submittingRequest}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-100 text-sm
                    font-black text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest}
                  className={`flex-1 py-3 rounded-xl bg-gradient-to-r text-white text-sm
                    font-black uppercase tracking-widest transition-all shadow-lg
                    active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2
                    ${REQUEST_CONFIG[requestType]?.btnClass}`}
                >
                  {submittingRequest
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send    size={16} />}
                  {submittingRequest ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}