// app/components/flight/PriceBreakdown.tsx
"use client";

import { fmtMoney } from "./helpers";

// ✅ Pax-wise pricing type (matches backend)
interface PaxFareInfo {
  travelerType: string;
  baseFare: number;
  taxAmount: number;
  totalFare: number;
  count: number;
  subtotal: number;
  currency: string;
}

interface PaxWisePricing {
  adult?: PaxFareInfo | null;
  child?: PaxFareInfo | null;
  infant?: PaxFareInfo | null;
}

interface PriceBreakdownProps {
  adults: number;
  children: number;
  infants: number;
  baseFare: number;
  taxAmount: number;
  totalBaseTax: number;
  customerInvoiceTotal: number;
  promoDiscount: number;
  grandTotal: number;
  totalPax: number;
  perPerson: number;
  currency: string;

  // ✅ NEW: pax-wise pricing (optional)
  paxWisePricing?: PaxWisePricing;
}

export default function PriceBreakdown({
  adults,
  children,
  infants,
  baseFare,
  taxAmount,
  totalBaseTax,
  customerInvoiceTotal,
  promoDiscount,
  grandTotal,
  totalPax,
  perPerson,
  currency,
  paxWisePricing, // ✅ NEW
}: PriceBreakdownProps) {
  // ✅ Helper: get subtotal for each pax type
  const adultSubtotal = paxWisePricing?.adult?.subtotal ?? 0;
  const childSubtotal = paxWisePricing?.child?.subtotal ?? 0;
  const infantSubtotal = paxWisePricing?.infant?.subtotal ?? 0;

  // Per pax fare
  const adultPerPax = paxWisePricing?.adult?.totalFare ?? 0;
  const childPerPax = paxWisePricing?.child?.totalFare ?? 0;
  const infantPerPax = paxWisePricing?.infant?.totalFare ?? 0;

  return (
    <div className="border-t border-slate-100">
      <div className="px-4 py-3.5 space-y-2">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Price Breakdown
        </p>

        {/* ✅ Pax-wise fares with ACTUAL prices */}
        {adults > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">
              Adult × {adults}
              {adultPerPax > 0 && (
                <span className="text-[10px] text-slate-400 ml-1">
                  ({fmtMoney(adultPerPax, currency)} each)
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {fmtMoney(adultSubtotal || totalBaseTax, currency)}
            </span>
          </div>
        )}

        {children > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">
              Child × {children}
              {childPerPax > 0 && (
                <span className="text-[10px] text-slate-400 ml-1">
                  ({fmtMoney(childPerPax, currency)} each)
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {childSubtotal > 0
                ? fmtMoney(childSubtotal, currency)
                : "Included"}
            </span>
          </div>
        )}

        {infants > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">
              Infant × {infants}
              {infantPerPax > 0 && (
                <span className="text-[10px] text-slate-400 ml-1">
                  ({fmtMoney(infantPerPax, currency)} each)
                </span>
              )}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {infantSubtotal > 0
                ? fmtMoney(infantSubtotal, currency)
                : "Included"}
            </span>
          </div>
        )}

        <div className="border-t border-slate-100 pt-1" />

        {/* Base & Tax */}
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Base Fare</span>
          <span className="text-xs font-bold text-slate-800">
            {fmtMoney(baseFare, currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">Tax & Fee</span>
          <span className="text-xs font-bold text-slate-800">
            {fmtMoney(taxAmount, currency)}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-1" />

        <div className="flex justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Total Base & Tax
          </span>
          <span className="text-xs font-bold text-slate-800">
            {fmtMoney(totalBaseTax, currency)}
          </span>
        </div>

        {/* Customer Invoice */}
        <div className="flex justify-between bg-blue-50 rounded-lg px-2.5 py-1.5">
          <span className="text-xs font-semibold text-blue-700">
            Customer Invoice Total
          </span>
          <span className="text-xs font-bold text-blue-800">
            {fmtMoney(customerInvoiceTotal, currency)}
          </span>
        </div>

        {/* Promo Discount */}
        {promoDiscount > 0 && (
          <div className="flex justify-between bg-emerald-50 rounded-lg px-2.5 py-1.5">
            <span className="text-xs font-semibold text-emerald-700">
              Discount
            </span>
            <span className="text-xs font-bold text-emerald-700">
              − {fmtMoney(promoDiscount, currency)}
            </span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-3 py-2.5 mt-1">
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">
              Grand Total
            </p>
            <p className="text-[9px] text-blue-300">
              {totalPax} Pax · {currency}
            </p>
          </div>
          <span className="text-base font-black text-white">
            {fmtMoney(grandTotal, currency)}
          </span>
        </div>

        {/* Per Person */}
        {totalPax > 1 && (
          <div className="flex justify-between px-1">
            <span className="text-[10px] text-slate-400">Per Person</span>
            <span className="text-[10px] font-bold text-slate-500">
              {fmtMoney(perPerson, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}