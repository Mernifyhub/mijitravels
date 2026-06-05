"use client";

import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import type { AirportSuggestion } from "./types";

interface Props {
  label: string;
  type: "from" | "to";
  value: string;
  onChange: (value: string) => void;
  suggestions: AirportSuggestion[];
  onSelect: (item: AirportSuggestion) => void;
}

export default function AirportInput({
  label,
  type,
  value,
  onChange,
  suggestions,
  onSelect,
}: Props) {
  const Icon = type === "from" ? PlaneTakeoff : PlaneLanding;

  return (
    <div className="flex-1 min-w-0 relative">
      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#021f3b] rounded-l-xl flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="City or Airport"
          className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 bg-white shadow-2xl rounded-xl mt-1 max-h-60 overflow-y-auto border border-gray-100">
          {suggestions.map((loc) => (
            <div
              key={loc.iataCode}
              onClick={() => onSelect(loc)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
            >
              <div className="font-bold text-sm text-gray-800">{loc.name}</div>
              <div className="text-xs text-gray-500">
                {loc.address.cityName}, {loc.address.countryName} —{" "}
                {loc.iataCode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}