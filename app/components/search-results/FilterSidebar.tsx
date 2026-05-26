// src/components/search-results/FilterSidebar.tsx

"use client";

import {
  SlidersHorizontal, Plane, Tag, Luggage, ShieldCheck,
} from "lucide-react";
import { formatMoney } from "./helpers";

interface FilterSidebarProps {
  selectedStop: string | null;
  setSelectedStop: (val: string | null) => void;
  priceRange: number;
  setPriceRange: (val: number) => void;
  maxPriceLimit: number;
  selectedBaggage: string | null;
  setSelectedBaggage: (val: string | null) => void;
  selectedRefundability: string | null;
  setSelectedRefundability: (val: string | null) => void;
  activeFilterCount: number;
  resetFilters: () => void;
  displayCurrency: string;
}

export function FilterSidebar({
  selectedStop,
  setSelectedStop,
  priceRange,
  setPriceRange,
  maxPriceLimit,
  selectedBaggage,
  setSelectedBaggage,
  selectedRefundability,
  setSelectedRefundability,
  activeFilterCount,
  resetFilters,
  displayCurrency,
}: FilterSidebarProps) {
  return (
    <aside className="lg:col-span-3 lg:sticky lg:top-[190px] self-start">
      <div className="bg-white rounded-[22px] p-4 shadow-sm border border-slate-200 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0A1128]/5 flex items-center justify-center border border-[#0A1128]/10">
              <SlidersHorizontal size={16} className="text-[#0A1128]" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-[15px] leading-none">Filters</h3>
              <p className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                Refine Results
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {activeFilterCount > 0 && (
              <span className="text-[9px] font-black text-white bg-[#0A1128] min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-[9px] font-black text-[#0A1128] bg-[#0A1128]/5 hover:bg-[#0A1128]/10 px-2 py-1 rounded-full uppercase transition-all active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Stops */}
        <FilterSection
          icon={<Plane size={12} className="text-indigo-600" />}
          iconBg="bg-indigo-50 border-indigo-100"
          label="Flight Stop"
        >
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { label: "Non-stop", sub: "Direct flights only" },
              { label: "1 Stop", sub: "One layover" },
              { label: "2+ Stops", sub: "More route options" },
            ].map((item) => {
              const isActive = selectedStop === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedStop(isActive ? null : item.label)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                    isActive
                      ? "border-[#0A1128] bg-[#0A1128]/5 shadow-sm"
                      : "border-slate-100 hover:border-[#0A1128]/20 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className={`text-[13px] font-bold ${isActive ? "text-[#0A1128]" : "text-slate-700"}`}>
                      {item.label}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isActive ? "border-[#0A1128] bg-[#0A1128]" : "border-slate-200"
                    }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Budget */}
        <FilterSection
          icon={<Tag size={12} className="text-emerald-600" />}
          iconBg="bg-emerald-50 border-emerald-100"
          label="Your Budget"
        >
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-white p-3">
            <div className="flex items-end justify-between mb-2.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Max Price</span>
              <span className="text-[17px] font-black text-[#0A1128]">
                {formatMoney(priceRange, displayCurrency)}
              </span>
            </div>
            <div className="h-7 flex items-end gap-1 mb-2 px-1">
              {[35, 60, 45, 80, 55, 30, 75, 50, 38, 58].map((h, i) => {
                const activeIndex = Math.floor((priceRange / maxPriceLimit) * 10);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-colors duration-300 ${
                      i <= activeIndex ? "bg-indigo-500" : "bg-indigo-200/60"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
            <input
              type="range"
              min="0"
              max={maxPriceLimit}
              step={Math.max(1, Math.round(maxPriceLimit / 100))}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] font-bold text-slate-400">0</span>
              <span className="text-[9px] font-bold text-slate-400">
                {formatMoney(maxPriceLimit, displayCurrency)}
              </span>
            </div>
          </div>
        </FilterSection>

        {/* Baggage */}
        <FilterSection
          icon={<Luggage size={12} className="text-amber-600" />}
          iconBg="bg-amber-50 border-amber-100"
          label="Baggage"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {[
              {
                label: "With baggage",
                sub: "Checked bag included",
                activeColor: "border-indigo-300 bg-indigo-50",
                textColor: "text-indigo-700",
              },
              {
                label: "No baggage",
                sub: "Travel light",
                activeColor: "border-slate-300 bg-slate-50",
                textColor: "text-slate-700",
              },
            ].map((item) => {
              const isActive = selectedBaggage === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedBaggage(isActive ? null : item.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? `${item.activeColor} shadow-sm`
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className={`text-[10px] font-black leading-tight ${isActive ? item.textColor : "text-slate-700"}`}>
                    {item.label}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 leading-tight">{item.sub}</p>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Refundability */}
        <FilterSection
          icon={<ShieldCheck size={12} className="text-rose-600" />}
          iconBg="bg-rose-50 border-rose-100"
          label="Refundability"
        >
          <div className="grid grid-cols-2 gap-1.5">
            {[
              {
                label: "Refundable",
                sub: "Flexible option",
                activeColor: "border-emerald-300 bg-emerald-50",
                textColor: "text-emerald-700",
              },
              {
                label: "Non-refundable",
                sub: "Lower fare",
                activeColor: "border-rose-300 bg-rose-50",
                textColor: "text-rose-700",
              },
            ].map((item) => {
              const isActive = selectedRefundability === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedRefundability(isActive ? null : item.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? `${item.activeColor} shadow-sm`
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className={`text-[10px] font-black leading-tight ${isActive ? item.textColor : "text-slate-700"}`}>
                    {item.label}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 leading-tight">{item.sub}</p>
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

// ==================== REUSABLE FILTER SECTION ====================

function FilterSection({
  icon,
  iconBg,
  label,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}