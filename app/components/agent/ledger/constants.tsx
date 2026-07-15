import React from "react";
import {
  Plane, Wallet, RotateCcw, RefreshCw, XCircle,
  Receipt, FileText, Clock,
} from "lucide-react";

export function getTypeConfig(type: string) {
  const t = type?.toUpperCase() || "";
  const configs: Record<string, {
    bg: string; text: string; icon: React.ReactNode; iconColor: string;
  }> = {
    TICKET: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <Plane size={12} />, iconColor: "text-emerald-600" },
    TICKET_REQUESTED: { bg: "bg-yellow-50", text: "text-yellow-700", icon: <Plane size={12} />, iconColor: "text-yellow-600" },
    BOOKING: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <Plane size={12} />, iconColor: "text-emerald-600" },
    DEPOSIT: { bg: "bg-sky-50", text: "text-sky-700", icon: <Wallet size={12} />, iconColor: "text-sky-600" },
    REFUNDED: { bg: "bg-amber-50", text: "text-amber-700", icon: <RotateCcw size={12} />, iconColor: "text-amber-600" },
    REFUND: { bg: "bg-amber-50", text: "text-amber-700", icon: <RotateCcw size={12} />, iconColor: "text-amber-600" },
    REISSUE: { bg: "bg-blue-50", text: "text-blue-700", icon: <RefreshCw size={12} />, iconColor: "text-blue-600" },
    VOID: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle size={12} />, iconColor: "text-rose-600" },
    VOIDED: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle size={12} />, iconColor: "text-rose-600" },
    CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle size={12} />, iconColor: "text-rose-600" },
    MANUAL: { bg: "bg-purple-50", text: "text-purple-700", icon: <Receipt size={12} />, iconColor: "text-purple-600" },
    PENDING: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock size={12} />, iconColor: "text-amber-600" },
  };
  return configs[t] || {
    bg: "bg-gray-50", text: "text-gray-700",
    icon: <FileText size={12} />, iconColor: "text-gray-600",
  };
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency", currency: "SAR", minimumFractionDigits: 0,
  }).format(value || 0);

export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
};