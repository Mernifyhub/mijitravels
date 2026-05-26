"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Printer, Copy, Building2 } from "lucide-react";
import { LedgerEntry } from "./types";
import { getTypeConfig, formatCurrency } from "./constants";

export default function TransactionDetailModal({
  entry,
  onClose,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;
  const tc = getTypeConfig(entry.type);

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

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tc.bg}`}>
                <Receipt size={24} className={tc.iconColor} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{entry.reference}</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tc.bg} ${tc.text}`}>
                  {tc.icon} {entry.category}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className={`rounded-xl p-4 ${entry.credit > 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
              <p className="text-sm text-slate-500 mb-1">{entry.credit > 0 ? "Credit Amount" : "Debit Amount"}</p>
              <p className={`text-2xl font-bold ${entry.credit > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(entry.credit || entry.debit)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Date & Time</p>
                <p className="font-medium text-slate-800 text-sm">
                  {new Date(entry.date).toLocaleString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className="font-semibold text-slate-800 text-sm">{entry.status}</p>
              </div>
              {entry.meta?.pnr && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">PNR</p>
                  <p className="font-mono font-semibold text-slate-800 text-sm">{String(entry.meta.pnr)}</p>
                </div>
              )}
              {entry.meta?.route && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Route</p>
                  <p className="font-medium text-slate-800 text-sm">{String(entry.meta.route)}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="font-medium text-slate-800">{entry.description}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
                <Printer size={18} className="text-slate-600" />
              </button>
              <button onClick={() => navigator.clipboard.writeText(entry.reference)}
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