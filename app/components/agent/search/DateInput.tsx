"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
} from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  color?: "green" | "orange";
  showDaysInput?: boolean;
  departDate?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_MAP = {
  green: {
    gradient: "from-green-500 to-emerald-600",
    ring: "ring-green-100",
    selected: "bg-green-500 text-white shadow-sm shadow-green-200",
    todayRing: "ring-1.5 ring-green-400",
    dot: "bg-green-500",
    quick: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100",
    daysInput: "border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200",
    badge: "bg-green-50 text-green-600 border-green-100",
  },
  orange: {
    gradient: "from-orange-500 to-amber-600",
    ring: "ring-orange-100",
    selected: "bg-orange-500 text-white shadow-sm shadow-orange-200",
    todayRing: "ring-1.5 ring-orange-400",
    dot: "bg-orange-500",
    quick: "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100",
    daysInput: "border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200",
    badge: "bg-orange-50 text-orange-600 border-orange-100",
  },
};

const parseDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function DateInput({
  label,
  value,
  onChange,
  min,
  color = "green",
  showDaysInput = false,
  departDate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [daysAfter, setDaysAfter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const fromDays = useRef(false);

  const todayStr = fmtYMD(new Date());
  const s = COLOR_MAP[color];

  const [view, setView] = useState(() => {
    if (value) return parseDate(value);
    if (min) return parseDate(min);
    return new Date();
  });

  useEffect(() => {
    if (value) setView(parseDate(value));
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

const handleDaysChange = useCallback(
  (val: string) => {
    setDaysAfter(val);

    // input empty হলে days + selected date দুটোই clear
    if (val === "") {
      fromDays.current = true;
      onChange("");

      setTimeout(() => {
        fromDays.current = false;
      }, 50);

      return;
    }

    if (!departDate) return;

    const days = parseInt(val, 10);
    if (isNaN(days) || days <= 0) return;

    const base = parseDate(departDate);
    base.setDate(base.getDate() + days);

    fromDays.current = true;
    onChange(fmtYMD(base));

    setTimeout(() => {
      fromDays.current = false;
    }, 50);
  },
  [departDate, onChange]
);
  useEffect(() => {
  if (!showDaysInput || fromDays.current) return;

  if (!departDate || !value) {
    if (!value && daysAfter !== "") setDaysAfter("");
    return;
  }

  const diff = Math.round(
    (parseDate(value).getTime() - parseDate(departDate).getTime()) / 86400000
  );

  if (diff > 0) {
    const next = String(diff);
    if (daysAfter !== next) setDaysAfter(next);
  } else if (daysAfter !== "") {
    setDaysAfter("");
  }
}, [value, departDate, showDaysInput, daysAfter]);
  const fmtShort = (ds: string) => {
    const d = parseDate(ds);
    return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const disabled = (ds: string) => (min ? ds < min : ds < todayStr);
  const selected = (ds: string) => value === ds;
  const today = (ds: string) => ds === todayStr;

  const daysUntil = () => {
    if (!value) return null;
    const d = Math.ceil(
      (parseDate(value).getTime() - parseDate(todayStr).getTime()) / 86400000
    );
    if (d === 0) return "Today";
    if (d === 1) return "Tomorrow";
    return d > 1 ? `${d}d away` : null;
  };

  const tripDur = () => {
    if (!value || !departDate) return null;
    const d = Math.round(
      (parseDate(value).getTime() - parseDate(departDate).getTime()) / 86400000
    );
    return d > 0 ? `${d}d trip` : null;
  };

  const pick = (ds: string) => {
    if (disabled(ds)) return;
    onChange(ds);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setDaysAfter("");
  };

  const prev = () => setView((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const next = () => setView((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  const canPrev = () => {
    const c = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    const m = min ? parseDate(min) : parseDate(todayStr);
    return c.getFullYear() > m.getFullYear() ||
      (c.getFullYear() === m.getFullYear() && c.getMonth() >= m.getMonth());
  };

  const cells = () => {
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    const r: (string | null)[] = [];
    for (let i = 0; i < first; i++) r.push(null);
    for (let d = 1; d <= total; d++)
      r.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    return r;
  };

  return (
    <div className="flex-1 min-w-0 relative" ref={ref}>
      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {label}
      </label>

      {/* ── Trigger — ORIGINAL SIZE (untouched) ── */}
      <div
        onClick={() => setOpen(!open)}
        className={`w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl
          text-gray-800 font-semibold text-sm outline-none transition-all bg-white
          hover:border-gray-300 cursor-pointer relative flex items-center justify-between gap-2
          ${open ? `border-[#021f3b] ring-2 ${s.ring}` : ""}`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-br ${s.gradient} rounded-l-xl flex items-center justify-center`}>
          <CalendarDays size={18} className="text-white" />
        </div>

        {value ? (
          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap truncate flex-1">
            {fmtShort(value)}
          </span>
        ) : (
          <span className="text-sm text-gray-400 font-normal whitespace-nowrap flex-1">
            Select date
          </span>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button type="button" onClick={clear}
              className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
              <X size={12} className="text-gray-400" />
            </button>
          )}
          <ChevronDown size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* ── Mini Calendar Dropdown ── */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[252px] bg-white rounded-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] border border-gray-200/80 z-50 overflow-hidden">

          {/* Compact header */}
          <div className="px-3 py-2 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-bold text-xs leading-tight">{label}</p>
              <p className="text-[10px] text-blue-200 truncate mt-0.5">
                {value ? fmtShort(value) : "Pick a date"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {daysUntil() && (
                <span className="text-[9px] bg-white/15 rounded px-1.5 py-0.5 font-medium text-blue-100">
                  {daysUntil()}
                </span>
              )}
              {tripDur() && showDaysInput && (
                <span className="text-[9px] bg-white/15 rounded px-1.5 py-0.5 font-medium text-blue-100">
                  {tripDur()}
                </span>
              )}
              <button type="button" onClick={() => setOpen(false)}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition ml-1">
                <X size={10} />
              </button>
            </div>
          </div>

{/* Days input (compact) */}
{showDaysInput && departDate && (
  <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
      After dept
    </span>
    <div className="relative w-16">
      <Plus size={9} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
      <input
        type="number"
        min={1}
        max={3650}
        placeholder="55"
        value={daysAfter}
        onChange={(e) => handleDaysChange(e.target.value)}
        className={`w-full pl-5 pr-3 py-1 border rounded-md text-[12px] font-black text-gray-900 placeholder:text-gray-400 placeholder:font-semibold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${s.daysInput}`}
      />
    </div>
    <span className="text-[10px] text-gray-400">days</span>
    {daysAfter && (
      <button
        type="button"
        onClick={() => { setDaysAfter(""); onChange(""); }}
        className="ml-auto text-[9px] font-black text-gray-400 hover:text-red-500 transition"
      >
        ✕
      </button>
    )}
  </div>
)}
          {/* Month nav */}
          <div className="px-2.5 py-1.5 flex items-center justify-between">
            <button type="button" onClick={prev} disabled={!canPrev()}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition
              ${!canPrev() ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"}`}>
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-gray-700 text-[11px] tracking-wide">
              {MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
            </span>
            <button type="button" onClick={next}
              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday row */}
          <div className="grid grid-cols-7 px-2.5">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-bold text-gray-400 pb-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-2.5 pb-2 gap-y-0.5">
            {cells().map((ds, i) => {
              if (!ds) return <div key={`e-${i}`} className="h-7" />;

              const dis = disabled(ds);
              const sel = selected(ds);
              const tod = today(ds);
              const day = Number(ds.split("-")[2]);

              return (
                <button key={ds} type="button" onClick={() => pick(ds)} disabled={dis}
                  className={`h-7 rounded-md text-[11px] font-semibold relative transition-all
                  ${dis ? "text-gray-300 cursor-not-allowed"
                    : sel ? s.selected
                    : tod ? `${s.todayRing} text-gray-800 hover:bg-gray-50`
                    : "text-gray-600 hover:bg-gray-100"}`}>
                  {day}
                  {tod && !sel && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full ${s.dot}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick picks */}
          <div className="px-2.5 pb-2 flex gap-1">
            {[
              { label: "Today", offset: 0 },
              { label: "+1", offset: 1 },
              { label: "+7", offset: 7 },
              { label: "+30", offset: 30 },
            ].map((item) => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              d.setDate(d.getDate() + item.offset);
              const ds = fmtYMD(d);
              const dis = disabled(ds);

              return (
                <button key={item.label} type="button"
                  onClick={() => !dis && pick(ds)} disabled={dis}
                  className={`flex-1 py-1 rounded-md text-[9px] font-bold transition
                  ${dis ? "bg-gray-50 text-gray-300 cursor-not-allowed" : s.quick}`}>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Tiny footer */}
          <div className="px-2.5 py-1.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 truncate">
              {value ? (
                <><span className="font-bold text-gray-600">{fmtShort(value)}</span></>
              ) : "No date"}
            </span>
            <button type="button" onClick={() => setOpen(false)}
              className="bg-[#021f3b] text-white px-3 py-1 rounded-md text-[10px] font-bold hover:bg-[#0a3a6b] transition active:scale-[0.97]">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}