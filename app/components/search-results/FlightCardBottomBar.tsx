// src/components/search-results/FlightCardBottomBar.tsx

"use client";

import { ShieldCheck, Edit3, Briefcase, Luggage } from "lucide-react";

interface FlightCardBottomBarProps {
  refundable: boolean;
  changeable: boolean;
  cabinClass: string;
  availableSeats: number;
  baggageChecked: string;
  baggageCheckedRaw: number;
}

export function FlightCardBottomBar({
  refundable,
  changeable,
  cabinClass,
  availableSeats,
  baggageChecked,
  baggageCheckedRaw,
}: FlightCardBottomBarProps) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Refundable */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            refundable
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}
        >
          <ShieldCheck size={11} />
          <span>{refundable ? "Refundable" : "Non-Refundable"}</span>
        </div>

        {/* Changeable */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            changeable
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          <Edit3 size={11} />
          <span>{changeable ? "Changeable" : "No Change"}</span>
        </div>

        {/* Cabin Class */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Briefcase size={11} />
          <span className="capitalize">{cabinClass}</span>
        </div>

        {/* Seats */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            availableSeats <= 3
              ? "bg-rose-50 text-rose-700 border border-rose-100"
              : "bg-amber-50 text-amber-700 border border-amber-100"
          }`}
        >
          <SeatIcon />
          <span>
            {availableSeats <= 3
              ? `Only ${availableSeats} left!`
              : `${availableSeats} seats`}
          </span>
        </div>

        {/* Baggage */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
            baggageCheckedRaw > 0
              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          <Luggage size={11} />
          <span>{baggageCheckedRaw > 0 ? baggageChecked : "No Bag"}</span>
        </div>
      </div>
    </div>
  );
}

function SeatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 18v3h3" />
      <path d="M20 18v3h-3" />
      <path d="M12 2v8" />
      <path d="M2 10h20" />
      <rect x="4" y="10" width="16" height="8" rx="2" />
    </svg>
  );
}