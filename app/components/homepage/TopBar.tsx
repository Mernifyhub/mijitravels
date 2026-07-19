"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Shield, Globe, ChevronDown } from "lucide-react";
import useApp from "./hooks/useApp";
import { COUNTRIES, LANGUAGES } from "./lib/constants";

function Dropdown({
  trigger,
  children,
  className = "",
}: {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-white/10 px-2.5 sm:px-4 py-2 rounded-xl transition text-[13px] sm:text-sm font-medium whitespace-nowrap"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 z-[70] min-w-[180px] sm:min-w-[220px] max-w-[calc(100vw-1rem)] overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const { country, lang, t, setCountry, setCurrency, setLang, container } = useApp();

  return (
    <div className="bg-[#0A2540] text-white py-2 text-[13px] sm:text-xs border-b border-white/10 relative z-[70]">
      <div className={container}>
        <div className="flex justify-between items-center gap-2 sm:gap-2 flex-nowrap">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-nowrap min-w-0">

            {/* Country */}
            <Dropdown
              trigger={
                <span className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="hidden sm:inline">{country.name}</span>
                  <ChevronDown size={14} />
                </span>
              }
            >
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 ${
                    country.code === c.code ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span>{c.name}</span>
                  <span className="ml-auto text-gray-500 text-sm">{c.currency}</span>
                </button>
              ))}
            </Dropdown>

            {/* Currency — HIDDEN on mobile */}
            <Dropdown
              className="hidden sm:block"
              trigger={
                <span className="flex items-center gap-2">
                  <span className="font-bold">{country.currency}</span>
                  <span className="text-white/60">({country.symbol})</span>
                  <ChevronDown size={14} />
                </span>
              }
            >
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 ${
                    country.code === c.code ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="font-semibold">{c.currency}</span>
                  <span className="text-gray-500">({c.symbol})</span>
                </button>
              ))}
            </Dropdown>

            {/* Language */}
            <Dropdown
              trigger={
                <span className="flex items-center gap-2">
                  <Globe size={15} />
                  <span>{lang.label}</span>
                  <ChevronDown size={14} />
                </span>
              }
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                    lang.code === l.code ? "bg-blue-50" : ""
                  }`}
                >
                  {l.label} ({l.native})
                </button>
              ))}
            </Dropdown>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 sm:gap-5 text-[13px] sm:text-sm flex-nowrap">
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-white/80 transition whitespace-nowrap"
            >
              <Shield size={15} className="text-green-400" />
              <span>{t.topbar.iata}</span>
            </Link>

            <Link
              href="/login"
              className="hover:text-white/80 transition whitespace-nowrap"
            >
              {t.topbar.login}
            </Link>

            <Link
              href="/register"
              className="bg-[#E31E24] hover:bg-red-700 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition whitespace-nowrap"
            >
              {t.topbar.join}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}