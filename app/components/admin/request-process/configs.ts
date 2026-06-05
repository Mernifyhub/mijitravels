// app/components/admin/request-process/configs.ts
import React from "react";
import {
  Ticket, RefreshCw, XCircle, Ban, Wallet,
} from "lucide-react";
import { TypeMapEntry, ColorMapEntry } from "./types";

export const TYPE_MAP: Record<string, TypeMapEntry> = {
  issue:   { title: "Issue Ticket",     color: "emerald", icon: React.createElement(Ticket,    { size: 18 }) },
  reissue: { title: "Reissue / Change", color: "indigo",  icon: React.createElement(RefreshCw, { size: 18 }) },
  cancel:  { title: "Cancel Booking",   color: "rose",    icon: React.createElement(XCircle,   { size: 18 }) },
  void:    { title: "Void Ticket",      color: "amber",   icon: React.createElement(Ban,       { size: 18 }) },
  refund:  { title: "Process Refund",   color: "purple",  icon: React.createElement(Wallet,    { size: 18 }) },
};

export const COLOR_MAP: Record<string, ColorMapEntry> = {
  emerald: { btn: "bg-emerald-600 hover:bg-emerald-700", badge: "bg-emerald-100 text-emerald-700", light: "bg-emerald-50 border-emerald-200", text: "text-emerald-600" },
  indigo:  { btn: "bg-indigo-600  hover:bg-indigo-700",  badge: "bg-indigo-100  text-indigo-700",  light: "bg-indigo-50  border-indigo-200",  text: "text-indigo-600"  },
  rose:    { btn: "bg-rose-600    hover:bg-rose-700",    badge: "bg-rose-100    text-rose-700",    light: "bg-rose-50    border-rose-200",    text: "text-rose-600"    },
  amber:   { btn: "bg-amber-600   hover:bg-amber-700",   badge: "bg-amber-100   text-amber-700",   light: "bg-amber-50   border-amber-200",   text: "text-amber-600"   },
  purple:  { btn: "bg-purple-600  hover:bg-purple-700",  badge: "bg-purple-100  text-purple-700",  light: "bg-purple-50  border-purple-200",  text: "text-purple-600"  },
};