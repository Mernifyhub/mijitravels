// src/components/search-results/ExpandedFlightSummary.tsx

"use client";

import { Clock, MapPin, Plane, Building2, Info } from "lucide-react";
import { formatDuration, type FlightItinerary } from "./helpers";

interface Props {
  itinerary: FlightItinerary;
  airlineName: string;
}

export function ExpandedFlightSummary({ itinerary, airlineName }: Props) {
  const firstSeg = itinerary.segments[0];
  const stops = itinerary.segments.length - 1;

  const items = [
    {
      icon: <Clock size={13} className="text-indigo-500" />,
      bg: "bg-indigo-50",
      label: "Total Duration",
      value: formatDuration(itinerary.duration),
    },
    {
      icon: <MapPin size={13} className="text-amber-500" />,
      bg: "bg-amber-50",
      label: "Stops",
      value: stops === 0 ? "Non-Stop" : `${stops} Stop(s)`,
    },
    {
      icon: <Plane size={13} className="text-purple-500" />,
      bg: "bg-purple-50",
      label: "Aircraft",
      value: firstSeg?.aircraft?.name || "Standard",
    },
    {
      icon: <Building2 size={13} className="text-sky-500" />,
      bg: "bg-sky-50",
      label: "Operated by",
      value: firstSeg?.operatingCarrier?.name || airlineName || "Airline",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 p-3">
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Info size={11} className="text-indigo-500" /> Flight Summary
      </h5>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100"
          >
            <div
              className={`w-7 h-7 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                {item.label}
              </p>
              <p className="text-[12px] font-bold text-slate-700 truncate max-w-[100px]">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}