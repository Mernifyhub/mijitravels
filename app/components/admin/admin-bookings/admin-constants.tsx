import React from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Ban, RotateCcw } from "lucide-react";

export const getStatusConfig = (status: string) => {
  const configs: Record<string, {
    bg: string; text: string; icon: React.ReactNode; glow: string; label: string;
  }> = {
    ON_HOLD: {
      bg: "bg-amber-50", text: "text-amber-700",
      icon: <Clock size={14} />, glow: "shadow-amber-100", label: "On Hold",
    },
    CONFIRMED: {
      bg: "bg-emerald-50", text: "text-emerald-700",
      icon: <CheckCircle2 size={14} />, glow: "shadow-emerald-100", label: "Confirmed",
    },
    CANCELLED: {
      bg: "bg-rose-50", text: "text-rose-700",
      icon: <XCircle size={14} />, glow: "shadow-rose-100", label: "Cancelled",
    },
    VOIDED: {
      bg: "bg-slate-50", text: "text-slate-700",
      icon: <Ban size={14} />, glow: "shadow-slate-100", label: "Voided",
    },
    REFUNDED: {
      bg: "bg-purple-50", text: "text-purple-700",
      icon: <RotateCcw size={14} />, glow: "shadow-purple-100", label: "Refunded",
    },
  };

  return configs[status] || {
    bg: "bg-gray-50", text: "text-gray-700",
    icon: <AlertCircle size={14} />, glow: "shadow-gray-100", label: status,
  };
};

export const getPageTitle = (defaultStatus: string): string => {
  const titles: Record<string, string> = {
    ON_HOLD: "Admin - On Hold Bookings",
    CONFIRMED: "Admin - Confirmed Bookings",
    CANCELLED: "Admin - Cancelled Bookings",
    VOIDED: "Admin - Voided Bookings",
    REFUNDED: "Admin - Refunded Bookings",
  };
  return titles[defaultStatus] || "Admin - All Bookings";
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-BD", {
    style: "currency", currency: "SAR", minimumFractionDigits: 0,
  }).format(amount);

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const ALL_COLUMNS = [
  { key: "bookingId", label: "Booking ID" },
  { key: "status", label: "Status" },
  { key: "pnr", label: "PNR" },
  { key: "carrier", label: "Carrier" },
  { key: "route", label: "Route" },
  { key: "departure", label: "Departure" },
  { key: "passenger", label: "Passenger" },
  { key: "bookingDate", label: "Booking Date" },
  { key: "agent", label: "Agent" },
  { key: "issuedBy", label: "Issued By" },
  { key: "amount", label: "Amount" },
];