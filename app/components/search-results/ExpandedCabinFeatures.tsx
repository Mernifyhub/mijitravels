// src/components/search-results/ExpandedCabinFeatures.tsx

"use client";

import { Star } from "lucide-react";

interface Props {
  cabinClass: string;
  hasBaggage: boolean;
}

export function ExpandedCabinFeatures({ cabinClass, hasBaggage }: Props) {
  const features = [
    { icon: "💺", label: "Seat", value: cabinClass },
    {
      icon: "🍽️",
      label: "Meal",
      value:
        cabinClass.toLowerCase() === "economy"
          ? "Meal Incl."
          : "Premium Dining",
    },
    { icon: "🔌", label: "Power", value: "USB Available" },
    { icon: "📺", label: "IFE", value: "In-flight" },
    { icon: "📶", label: "Wi-Fi", value: "Check airline" },
    {
      icon: "🧳",
      label: "Bag",
      value: hasBaggage ? "Included" : "Extra fee",
    },
  ];

  return (
    <div>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Star size={11} className="text-indigo-500" /> Cabin Features
      </h5>
      <div className="bg-white rounded-xl border border-slate-100 p-3">
        <div className="grid grid-cols-3 gap-2">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50 border border-slate-100"
            >
              <span className="text-base mb-0.5">{feat.icon}</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                {feat.label}
              </p>
              <p className="text-[10px] font-bold text-slate-600 leading-tight capitalize">
                {feat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}