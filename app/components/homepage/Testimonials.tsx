"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
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
  { name: "Japan Airlines", code: "JL" },
];

export default function AirlinePartners() {
  const { container } = useApp();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0); // Manual scroll offset

  const tripledAirlines = useMemo(
    () => [...airlines, ...airlines, ...airlines],
    []
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frameId = 0;
    const speed = 0.5;

    // Start from middle set
    el.scrollLeft = el.scrollWidth / 3;

    const animate = () => {
      // Continuous auto-scroll + apply manual offset
      el.scrollLeft += speed + offsetRef.current;
      
      // Decay manual offset gradually (smooth deceleration)
      if (offsetRef.current !== 0) {
        offsetRef.current *= 0.92;
        if (Math.abs(offsetRef.current) < 0.1) offsetRef.current = 0;
      }

      const oneThird = el.scrollWidth / 3;
      const twoThirds = oneThird * 2;

      // Seamless infinite loop both directions
      if (el.scrollLeft >= twoThirds) {
        el.scrollLeft -= oneThird;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += oneThird;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Arrow click → add momentum to offset
  const handleArrowClick = (direction: "left" | "right") => {
    const momentum = direction === "right" ? 15 : -15;
    offsetRef.current += momentum;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0d2d5a] to-[#0A2540] pt-6 pb-12 sm:pt-8 sm:pb-14">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.08),transparent_26%)]" />
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px]" />

      {/* HEADER with Gradient Shadow */}
      <div className={`${container} relative mb-6`}>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl relative inline-block">
            Trusted by Leading{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-red-300 bg-clip-text text-transparent">
              Airlines Worldwide
            </span>
          </h2>

          {/* Gradient Shadow Line */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400/60" />
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500 rounded-full shadow-lg shadow-blue-500/50" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-400/60" />
          </div>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 h-8 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-red-500/20 blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Scrollable Airlines Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          aria-label="Partner airlines"
          className="scrollbar-hide flex gap-5 overflow-x-auto px-14 py-2 sm:px-16 lg:px-20"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tripledAirlines.map((airline, i) => (
            <div
              key={`${airline.code}-${i}`}
              className="group flex flex-col items-center flex-shrink-0"
            >
              {/* Round Logo Container */}
              <div className="relative">
                {/* Hover glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500 rounded-full blur-md opacity-0 group-hover:opacity-60 transition duration-300" />
                
                {/* Logo circle */}
                <div className="relative w-20 h-20 rounded-full bg-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110 flex items-center justify-center p-2 overflow-hidden border-2 border-white/20">
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
                        parent.innerHTML = `<div class="flex items-center justify-center w-full h-full text-base font-black text-[#0B2545]">${airline.code}</div>`;
                      }
                    }}
                    unoptimized
                  />
                </div>

                {/* IATA Code badge */}
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-600 text-white shadow-md shadow-red-500/50 border border-white/20">
                  {airline.code}
                </div>
              </div>

              <p className="mt-3 text-[11px] font-semibold text-white/80 group-hover:text-cyan-300 transition text-center max-w-[90px] truncate">
                {airline.name}
              </p>
            </div>
          ))}
        </div>

        {/* LEFT ARROW */}
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center justify-center pl-2 pr-4 bg-gradient-to-r from-[#0A2540] via-[#0A2540] to-transparent">
          <button
            onClick={() => handleArrowClick("left")}
            aria-label="Scroll left"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* RIGHT ARROW */}
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-center pr-2 pl-4 bg-gradient-to-l from-[#0A2540] via-[#0A2540] to-transparent">
          <button
            onClick={() => handleArrowClick("right")}
            aria-label="Scroll right"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-110 group"
          >
            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}