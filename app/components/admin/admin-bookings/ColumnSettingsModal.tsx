"use client";

import { motion } from "framer-motion";
import { Columns3, X } from "lucide-react";
import { Column } from "./types";

interface Props {
  columns: Column[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
  onClose: () => void;
}

export default function ColumnSettingsModal({
  columns,
  visibleColumns,
  onToggle,
  onClose,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns3 size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Column Visibility</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {columns.map((col) => (
            <label key={col.key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => onToggle(col.key)}
                className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              />
              <span className="text-sm text-slate-700">{col.label}</span>
            </label>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose}
            className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
            Apply Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}