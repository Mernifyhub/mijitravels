import React from "react";
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";

export const getStatusConfig = (status: string) => {
  const configs: Record<string, {
    bg: string; text: string; icon: React.ReactNode;
  }> = {
    confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={12} /> },
    CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 size={12} /> },
    pending: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock size={12} /> },
    ON_HOLD: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock size={12} /> },
    cancelled: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle size={12} /> },
    CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle size={12} /> },
    refunded: { bg: "bg-purple-50", text: "text-purple-700", icon: <RotateCcw size={12} /> },
    REFUNDED: { bg: "bg-purple-50", text: "text-purple-700", icon: <RotateCcw size={12} /> },
  };
  return configs[status] || configs.pending;
};

export const formatCurrency = (amount: number, currency = "SAR") =>
  new Intl.NumberFormat("en-SA", {
    style: "currency", currency, minimumFractionDigits: 0,
  }).format(amount || 0);

export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
};

export const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";