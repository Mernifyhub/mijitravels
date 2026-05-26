"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, ChevronDown, File, FileSpreadsheet,
  FileText, Printer,
} from "lucide-react";

export default function ExportDropdown({
  onExport,
}: {
  onExport: (format: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = [
    { format: "pdf", label: "Export as PDF", icon: <File size={16} className="text-rose-500" /> },
    { format: "excel", label: "Export as Excel", icon: <FileSpreadsheet size={16} className="text-emerald-500" /> },
    { format: "csv", label: "Export as CSV", icon: <FileText size={16} className="text-blue-500" /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
            {items.map((item) => (
              <button key={item.format}
                onClick={() => { onExport(item.format); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                {item.icon} {item.label}
              </button>
            ))}
            <hr className="my-1.5 border-slate-100" />
            <button onClick={() => { onExport("print"); setIsOpen(false); }}
              className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3">
              <Printer size={16} className="text-slate-500" /> Print Statement
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}