// src/components/search-results/AirlineFilterBar.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney, type AirlineFilter } from "./helpers";

interface AirlineFilterBarProps {
  filters: AirlineFilter[];
  selectedAirline: string;
  setSelectedAirline: (code: string) => void;
  displayCurrency: string;
}

export function AirlineFilterBar({
  filters,
  selectedAirline,
  setSelectedAirline,
  displayCurrency,
}: AirlineFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [filters]);

  const scroll = (direction: "left" | "right") => {
    scrollContainerRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-white relative shadow-[0_2px_12px_-6px_rgba(0,0,0,0.05)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30" />
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">

        {/* Scroll left */}
        <button
          onClick={() => scroll("left")}
          className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 active:scale-90 transition-all duration-300 ${
            canScrollLeft ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {/* Airline list */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 w-full py-2"
          style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filters.map((air) => {
            const isSelected = selectedAirline === air.code;
            const priceNum = Number(air.price);
            const priceLabel = priceNum > 0 ? formatMoney(priceNum, displayCurrency) : "—";

            return (
              <button
                key={air.code}
                onClick={() => setSelectedAirline(air.code)}
                style={{ overflow: "visible" }}
                className={`group relative flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/20 shadow-sm"
                    : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm"
                  }`}
              >
                {isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-50">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border-2 border-white shadow-sm" />
                  </span>
                )}
                {isSelected && (
                  <div className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
                )}

                <div className={`flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 transition-all duration-300 ${
                  isSelected ? "bg-indigo-100/80 shadow-inner" : "bg-slate-50 group-hover:bg-indigo-50/60"
                }`}>
                  {air.logo}
                </div>

                <div className="text-left min-w-[60px]">
                  <p className={`text-[8px] font-bold uppercase tracking-wide leading-none mb-0.5 ${
                    isSelected ? "text-indigo-500" : "text-slate-400"
                  }`}>
                    {air.name}
                  </p>
                  <span className={`text-[11px] font-extrabold tracking-tight ${
                    isSelected ? "text-indigo-700" : "text-slate-800"
                  }`}>
                    {priceLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll right */}
        <button
          onClick={() => scroll("right")}
          className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 active:scale-90 transition-all duration-300 ${
            canScrollRight ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}