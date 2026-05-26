// src/components/search-results/ExpandedFareBreakdown.tsx

"use client";

import { Tag } from "lucide-react";
import { formatMoney } from "./helpers";

interface Props {
  currency: string;
  baseFare: number;
  taxAmount: number;
  extraFee: number;
  subtotal: number;
  promoDiscount: number;
  discountLabels: string[];
  youPay: number;
}

export function ExpandedFareBreakdown({
  currency,
  baseFare,
  taxAmount,
  extraFee,
  subtotal,
  promoDiscount,
  discountLabels,
  youPay,
}: Props) {
  return (
    <div>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Tag size={11} className="text-indigo-500" /> Fare Breakdown
      </h5>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {/* Base Fare */}
        <Row label="Base Fare" value={formatMoney(baseFare, currency)} />

        {/* Taxes */}
        <Row label="Taxes & Fees" value={formatMoney(taxAmount, currency)} />

        {/* Service Fee */}
        {extraFee > 0 && (
          <Row label="Service Fee" value={formatMoney(extraFee, currency)} />
        )}

        {/* Subtotal */}
        <div className="flex justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/80">
          <span className="text-xs font-semibold text-slate-600">Subtotal</span>
          <span className="text-xs font-bold text-slate-800">
            {formatMoney(subtotal, currency)}
          </span>
        </div>

        {/* Promo Discount */}
        {promoDiscount > 0 && (
          <div className="flex justify-between px-3 py-2 border-b border-slate-50 bg-emerald-50/60">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-700">
                  Discount
                </span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  APPLIED
                </span>
              </div>
              {discountLabels.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {discountLabels.map((label, i) => (
                    <span
                      key={i}
                      className="text-[8px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-emerald-700">
              - {formatMoney(promoDiscount, currency)}
            </span>
          </div>
        )}

        {/* You Pay */}
        <div className="flex items-center justify-between px-3 py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <p className="text-xs font-black text-indigo-700">You Pay</p>
            <p className="text-[9px] text-indigo-400">All taxes included</p>
          </div>
          <span className="text-lg font-extrabold text-indigo-700">
            {formatMoney(youPay, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2 border-b border-slate-50">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}