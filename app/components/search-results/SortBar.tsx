// src/components/search-results/SortBar.tsx

"use client";

import { TrendingDown, Star, Timer } from "lucide-react";
import type { SortOption } from "./helpers";

interface SortBarProps {
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  cheapestLabel: string;
  fastestLabel: string;
}

export function SortBar({ sortBy, setSortBy, cheapestLabel, fastestLabel }: SortBarProps) {
  const tabs = [
    {
      key: "cheapest" as const,
      label: "Cheapest",
      icon: <TrendingDown size={13} />,
      value: cheapestLabel,
      color: "emerald",
    },
    {
      key: "best" as const,
      label: "Best",
      icon: <Star size={13} />,
      value: "Recommended",
      color: "indigo",
    },
    {
      key: "fastest" as const,
      label: "Fastest",
      icon: <Timer size={13} />,
      value: fastestLabel,
      color: "amber",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };

  const iconColorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
    amber: "text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0.5 flex gap-0.5 -mt-4">
      {tabs.map((tab) => {
        const isActive = sortBy === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border transition-all duration-300 ${
              isActive
                ? colorMap[tab.color]
                : "border-transparent hover:bg-slate-50 text-slate-600"
            }`}
          >
            <span className={isActive ? iconColorMap[tab.color] : "text-slate-400"}>
              {tab.icon}
            </span>
            <div className="text-left leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-wide">{tab.label}</p>
              <p className="text-[8px] font-medium opacity-75">{tab.value}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}