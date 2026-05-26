"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Printer, Copy, Share2, Plane, Building2 } from "lucide-react";
import { SalesEntry } from "./types";
import { getStatusConfig, formatCurrency, formatDate, capitalize } from "./constants";

export default function SaleDetailModal({
  entry,
  onClose,
}: {
  entry: SalesEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;
  const sc = getStatusConfig(entry.status);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

          {/* Header — slate theme */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Receipt size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{entry.booking}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                  {entry.ticketType}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition">
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Route visual */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-3xl font-bold">{entry.origin || "—"}</p>
                  <p className="text-slate-400 text-sm mt-1">Origin</p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center w-full">
                    <div className="w-3 h-3 rounded-full bg-white" />
                    <div className="flex-1 h-px bg-gradient-to-r from-white via-slate-500 to-emerald-400 mx-2 relative">
                      <Plane size={20} className="text-white absolute left-1/2 -translate-x-1/2 -top-2.5 rotate-90" />
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{entry.destination || "—"}</p>
                  <p className="text-slate-400 text-sm mt-1">Destination</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">Status</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                {sc.icon} {capitalize(entry.status)}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Date", value: formatDate(entry.date) },
                { label: "PNR", value: entry.pnr || "—", mono: true },
                { label: "Passengers", value: `${entry.pax} Pax` },
                { label: "Commission", value: formatCurrency(entry.commission, entry.currency), green: true },
              ].map((row) => (
                <div key={row.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{row.label}</p>
                  <p className={`font-semibold text-sm ${(row as any).green ? "text-emerald-600" : "text-slate-800"} ${(row as any).mono ? "font-mono" : ""}`}>
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Agent */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Building2 size={18} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{entry.agentName}</p>
                <p className="text-xs text-slate-500 truncate">{entry.agent}</p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-800">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-700">{formatCurrency(entry.amount, entry.currency)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
                <Printer size={18} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition" title="Share">
                <Share2 size={18} className="text-slate-600" />
              </button>
              <button onClick={() => navigator.clipboard.writeText(entry.pnr || entry.booking)}
                className="p-2 hover:bg-white rounded-lg transition" title="Copy">
                <Copy size={18} className="text-slate-600" />
              </button>
            </div>
            <button onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}