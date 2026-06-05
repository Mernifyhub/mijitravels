// app/components/flight/FlightSummary.tsx
"use client";

import { Plane } from "lucide-react";
import { Segment, UserBalance } from "./types";
import { formatDate, formatTime, formatDuration } from "./helpers";
import BalanceSection from "./BalanceSection";
import PriceBreakdown from "./PriceBreakdown";
import PolicySection from "./PolicySection";

interface FlightSummaryProps {
  origin: string;
  destination: string;
  departure: string;
  tripType: string;
  segments: Segment[];
  adults: number;
  children: number;
  infants: number;
  currency: string;
  baseFare: number;
  taxAmount: number;
  totalBaseTax: number;
  customerInvoiceTotal: number;
  promoDiscount: number;
  grandTotal: number;
  totalPax: number;
  perPerson: number;
  bookingTotal: number;
  shortfall: number;
  hasSufficientBalance: boolean;
  totalAvailable: number;
  userBalance: UserBalance | null;
  balanceLoading: boolean;
  checkedBag: string;
  refundable: string;
}

export default function FlightSummary({
  origin, destination, departure, tripType,
  segments, adults, children, infants,
  currency, baseFare, taxAmount, totalBaseTax,
  customerInvoiceTotal, promoDiscount, grandTotal,
  totalPax, perPerson, bookingTotal, shortfall,
  hasSufficientBalance, totalAvailable, userBalance,
  balanceLoading, checkedBag, refundable,
}: FlightSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-20">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1D35] via-[#15294A] to-[#0B1D35] px-5 py-4">
        <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wide mb-1">
          Flight Summary
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">{origin}</span>
          <Plane size={14} className="text-blue-400 rotate-90" />
          <span className="text-xl font-bold text-white">{destination}</span>
        </div>
        <p className="text-xs text-blue-300 mt-1">
          {formatDate(departure)} · {tripType === "ROUND_TRIP" ? "Round Trip" : "One Way"}
        </p>
      </div>

      {/* Segments */}
      <div className="p-4 space-y-3">
        {segments.map((seg, i) => (
          <div key={i} className={i !== 0 ? "pt-3 border-t border-dashed border-slate-100" : ""}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://pics.avs.io/80/80/${seg.airline}.png`}
                    alt={seg.airline}
                    className="w-5 h-5 object-contain"
                    onError={(e) => { e.currentTarget.src = ""; }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {seg.airline} {seg.flightNo}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                {formatDuration(seg.duration || "PT0H0M")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-left">
                <p className="text-base font-bold text-slate-800">{formatTime(seg.departure)}</p>
                <p className="text-xs font-semibold text-blue-600">{seg.from}</p>
                <p className="text-[10px] text-slate-400">{formatDate(seg.departure)}</p>
              </div>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-blue-200" />
                <Plane size={9} className="text-blue-400 rotate-90 flex-shrink-0" />
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-slate-800">{formatTime(seg.arrival)}</p>
                <p className="text-xs font-semibold text-blue-600">{seg.to}</p>
                <p className="text-[10px] text-slate-400">{formatDate(seg.arrival)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Passenger Count */}
      <div className="px-4 pb-4">
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Passengers
          </p>
          <div className="space-y-1.5">
            {adults > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Adults</span>
                <span className="text-xs font-bold text-slate-800">×{adults}</span>
              </div>
            )}
            {children > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Children</span>
                <span className="text-xs font-bold text-slate-800">×{children}</span>
              </div>
            )}
            {infants > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Infants</span>
                <span className="text-xs font-bold text-slate-800">×{infants}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance */}
      <BalanceSection
        userBalance={userBalance}
        balanceLoading={balanceLoading}
        bookingTotal={bookingTotal}
        shortfall={shortfall}
        hasSufficientBalance={hasSufficientBalance}
        totalAvailable={totalAvailable}
        currency={currency}
      />

      {/* Price Breakdown */}
      <PriceBreakdown
        adults={adults}
        children={children}
        infants={infants}
        baseFare={baseFare}
        taxAmount={taxAmount}
        totalBaseTax={totalBaseTax}
        customerInvoiceTotal={customerInvoiceTotal}
        promoDiscount={promoDiscount}
        grandTotal={grandTotal}
        totalPax={totalPax}
        perPerson={perPerson}
        currency={currency}
      />

      {/* Policies */}
      <PolicySection checkedBag={checkedBag} refundable={refundable} />
    </div>
  );
}