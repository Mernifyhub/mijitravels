"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck } from "lucide-react";
import useApp from "./hooks/useApp";

type Airline = {
  name: string;
  code: string;
};

const airlines: Airline[] = [
  { name: "Emirates", code: "EK" },
  { name: "Qatar Airways", code: "QR" },
  { name: "Saudia", code: "SV" },
  { name: "Etihad", code: "EY" },
  { name: "Turkish Airlines", code: "TK" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Biman Bangladesh", code: "BG" },
  { name: "US-Bangla", code: "BS" },
  { name: "Malaysia Airlines", code: "MH" },
  { name: "Thai Airways", code: "TG" },
  { name: "Air India", code: "AI" },
  { name: "IndiGo", code: "6E" },
  { name: "Cathay Pacific", code: "CX" },
  { name: "Lufthansa", code: "LH" },
  { name: "British Airways", code: "BA" },
  { name: "Air Arabia", code: "G9" },
  { name: "FlyDubai", code: "FZ" },
  { name: "Oman Air", code: "WY" },
  { name: "Kuwait Airways", code: "KU" },
  { name: "SriLankan", code: "UL" },
  { name: "Vistara", code: "UK" },
  { name: "AirAsia", code: "AK" },
  { name: "Korean Air", code: "KE" },
  { name: "ANA", code: "NH" },
];

export default function AirlinePartners() {
  const { container } = useApp();
  const displayAirlines = useMemo(() => airlines, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-4 sm:py-6">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-blue-300/20 blur-[120px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-32 bottom-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-[120px] sm:h-96 sm:w-96" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0A2540 1px, transparent 1px), linear-gradient(90deg, #0A2540 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className={`${container} relative`}>
        {/* Compact Header */}
        {/* Compact Header */}
<div className="mx-auto mb-3 max-w-3xl text-center sm:mb-4">
  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm">
    <Sparkles size={14} className="text-amber-500" />
    Our Partners
  </div>
  <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
    Trusted by Leading{" "}
    <span className=" bg-black from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
      Airlines
    </span>
  </h2>
</div>

        {/* Airlines Grid Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
          {/* Subtle inner gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/40" />

          {/* Airlines Grid */}
          <div className="relative grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
            {displayAirlines.map((airline, i) => (
              <div
                key={`${airline.code}-${i}`}
                className="group relative flex flex-col items-center"
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 opacity-0 blur-md transition duration-300 group-hover:opacity-40" />

                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white p-1.5 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-blue-500/20 sm:h-16 sm:w-16 sm:p-2">
                    <Image
                      src={`https://pics.avs.io/80/80/${airline.code}.png`}
                      alt={airline.name}
                      width={64}
                      height={64}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center w-full h-full text-sm font-black text-[#0A2540]">${airline.code}</div>`;
                        }
                      }}
                      unoptimized
                    />
                  </div>

                  <div className="absolute -bottom-1 -right-1 rounded-md border border-white bg-gradient-to-br from-[#E31E24] to-red-700 px-1.5 py-0.5 text-[9px] font-black text-white shadow-md">
                    {airline.code}
                  </div>
                </div>

                <p className="mt-2 max-w-[70px] truncate text-center text-[10px] font-semibold text-slate-600 transition group-hover:text-blue-600 sm:text-[11px]">
                  {airline.name}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom trust bar (compact) */}
          <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-4 sm:mt-5 sm:gap-4 sm:pt-5">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
              <ShieldCheck size={14} />
              IATA Certified
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              ✈️ 500+ Airlines
            </div>
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
              ⭐ 4.9 Rated
            </div>
            <div className="flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700">
              🌍 Worldwide
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}