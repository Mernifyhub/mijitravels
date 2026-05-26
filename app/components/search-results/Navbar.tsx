// src/components/search-results/Navbar.tsx

"use client";

import {
  Plane, Calendar, Users, Briefcase, ArrowLeft, Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AirlineFilterBar } from "./AirlineFilterBar";
import type { AirlineFilter, SortOption } from "./helpers";

interface NavbarProps {
  searchParams: URLSearchParams;
  isLoading: boolean;
  dynamicAirlineFilters: AirlineFilter[];
  selectedAirline: string;
  setSelectedAirline: (code: string) => void;
  displayCurrency: string;
}

export function Navbar({
  searchParams,
  isLoading,
  dynamicAirlineFilters,
  selectedAirline,
  setSelectedAirline,
  displayCurrency,
}: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-[100] flex flex-col shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]">

      {/* TOP BAR */}
      <div className="relative bg-gradient-to-r from-[#0A1128] via-[#111936] to-[#0A1128] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="group hover:bg-white/10 p-2 rounded-xl transition-all border border-white/5 hover:border-white/20 active:scale-95"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block" />

            {/* Route info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter leading-none uppercase">
                    {searchParams.get("origin") || "DAC"}
                  </span>
                  <span className="text-[8px] text-indigo-300 font-bold uppercase tracking-tighter opacity-80 mt-0.5">
                    Departure
                  </span>
                </div>
                <div className="relative px-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-white/30" />
                  </div>
                  <div className="relative z-10 p-1 bg-[#1A2342] rounded-full border border-white/10">
                    <Plane size={11} className="text-indigo-400 rotate-90" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter leading-none uppercase">
                    {searchParams.get("destination") || "DXB"}
                  </span>
                  <span className="text-[8px] text-indigo-300 font-bold uppercase tracking-tighter opacity-80 mt-0.5">
                    Arrival
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                  {searchParams.get("tripType") === "MULTI_CITY"
                    ? "Multi City"
                    : searchParams.get("tripType") === "ROUND_TRIP"
                    ? "Round Trip"
                    : "One Way"}
                </span>
              </div>

              <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

              {/* Date / Pax / Class — same row এ inline */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                  <Calendar size={11} className="text-indigo-400" />
                  <span className="text-[10px] font-bold">
                    {searchParams.get("departureDate")}
                    {searchParams.get("returnDate") && ` — ${searchParams.get("returnDate")}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                  <Users size={11} className="text-indigo-400" />
                  <span className="text-[10px] font-bold">
                    {Number(searchParams.get("adults") || 1) + Number(searchParams.get("children") || 0)} Pax
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                  <Briefcase size={11} className="text-indigo-400" />
                  <span className="text-[10px] font-bold capitalize">
                    {searchParams.get("travelClass")?.toLowerCase() || "Economy"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modify search */}
          <button
            onClick={() => router.back()}
            className="group relative bg-white text-[#0A1128] px-4 py-2 rounded-xl font-black text-[11px] transition-all hover:bg-[#0A1128] hover:text-white flex items-center gap-2 border-2 border-[#0A1128]/10 hover:border-[#0A1128]"
          >
            <Search size={13} />
            MODIFY SEARCH
          </button>
        </div>

        {/* Loading bar */}
        {isLoading && (
          <div className="h-[3px] w-full absolute bottom-0 left-0 right-0 z-50 overflow-hidden bg-white/10">
            <motion.div
              className="h-full w-1/3 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "400%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(90deg, transparent, #6366f1, #a855f7, #ec4899, #f59e0b, #10b981, transparent)",
                boxShadow: "0 0 10px #a855f7, 0 0 20px #6366f1",
              }}
            />
          </div>
        )}
      </div>

      {/* AIRLINE FILTER BAR */}
      <AirlineFilterBar
        filters={dynamicAirlineFilters}
        selectedAirline={selectedAirline}
        setSelectedAirline={setSelectedAirline}
        displayCurrency={displayCurrency}
      />
    </nav>
  );
}