// app/components/flight/PolicySection.tsx
"use client";

import { Luggage, Shield, Clock } from "lucide-react";

interface PolicySectionProps {
  checkedBag: string;
  refundable: string;
}

const colorMap: Record<string, string> = {
  blue:    "bg-blue-50 text-blue-500",
  emerald: "bg-emerald-50 text-emerald-500",
  amber:   "bg-amber-50 text-amber-500",
  red:     "bg-red-50 text-red-500",
};

export default function PolicySection({ checkedBag, refundable }: PolicySectionProps) {
  const policies = [
    {
      icon: <Luggage size={11} />,
      label: checkedBag !== "Not Included" ? `${checkedBag} Baggage` : "No Check-in Bag",
      color: checkedBag !== "Not Included" ? "blue" : "red",
    },
    {
      icon: <Shield size={11} />,
      label: refundable === "true" ? "Refundable" : "Non-Refundable",
      color: refundable === "true" ? "emerald" : "red",
    },
    {
      icon: <Clock size={11} />,
      label: "Free Hold for 24hrs",
      color: "amber",
    },
  ];

  return (
    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
      <div className="space-y-2">
        {policies.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${colorMap[item.color]}`}>
              {item.icon}
            </div>
            <span className="text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}