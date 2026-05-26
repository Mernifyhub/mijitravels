// src/components/search-results/ExpandedTravelTips.tsx

"use client";

import { Zap, Info } from "lucide-react";

interface Props {
  hasConnectingFlight: boolean;
  isRefundable: boolean;
}

export function ExpandedTravelTips({ hasConnectingFlight, isRefundable }: Props) {
  const tips = [
    <>
      Arrive at least <span className="font-bold text-slate-800">3 hours</span>{" "}
      before international flights
    </>,
    <>
      Carry a <span className="font-bold text-slate-800">valid passport</span>{" "}
      with 6+ months validity
    </>,
    <>Check visa requirements for your destination</>,
    ...(hasConnectingFlight
      ? [
          <>
            <span className="font-bold text-amber-700">
              Connecting flight:
            </span>{" "}
            Ensure minimum layover time
          </>,
        ]
      : []),
  ];

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-xl border border-amber-100 p-3">
        <h5 className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Zap size={11} className="text-amber-500" /> Travel Tips
        </h5>
        <div className="space-y-1.5">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Policy */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 flex items-start gap-2">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-bold text-blue-700 mb-0.5">
            Booking Policy
          </p>
          <p className="text-[10px] text-blue-600 leading-relaxed">
            Prices are subject to availability and may change. Complete your
            booking to lock in this fare.{" "}
            {isRefundable
              ? "This fare is refundable per airline policy."
              : "This fare is non-refundable once booked."}
          </p>
        </div>
      </div>
    </>
  );
}