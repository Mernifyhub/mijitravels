// src/components/search-results/ExpandedFareBreakdown.tsx

"use client";

import { Tag, Users, Baby, User } from "lucide-react";
import { formatMoney } from "./helpers";

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

interface Props {
  currency: string;
  baseFare: number;       // ✅ Total Base Fare (sum of all pax)
  taxAmount: number;
  extraFee: number;
  subtotal: number;
  promoDiscount: number;
  discountLabels: string[];
  youPay: number;

  paxWisePricing?: PaxWisePricing;
  adults?: number;
  children?: number;
  infants?: number;
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
  paxWisePricing,
  adults = 0,
  children = 0,
  infants = 0,
}: Props) {
  const hasPaxData =
    paxWisePricing &&
    (paxWisePricing.adult || paxWisePricing.child || paxWisePricing.infant);

  return (
    <div>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Tag size={11} className="text-indigo-500" /> Fare Breakdown
      </h5>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {/* PER PASSENGER BREAKDOWN */}
        {hasPaxData && (
          <>
            <div className="px-3 py-2 bg-indigo-50/50 border-b border-slate-100">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                Per Passenger
              </p>
            </div>

            {paxWisePricing?.adult && adults > 0 && (
              <PaxRow
                icon={<User size={11} className="text-indigo-500" />}
                label="Adult"
                count={adults}
                perPax={paxWisePricing.adult.totalFare}
                subtotal={paxWisePricing.adult.subtotal}
                currency={currency}
                bgColor="bg-indigo-50/30"
              />
            )}

            {paxWisePricing?.child && children > 0 && (
              <PaxRow
                icon={<Users size={11} className="text-amber-500" />}
                label="Child"
                count={children}
                perPax={paxWisePricing.child.totalFare}
                subtotal={paxWisePricing.child.subtotal}
                currency={currency}
                bgColor="bg-amber-50/30"
              />
            )}

            {paxWisePricing?.infant && infants > 0 && (
              <PaxRow
                icon={<Baby size={11} className="text-pink-500" />}
                label="Infant"
                count={infants}
                perPax={paxWisePricing.infant.totalFare}
                subtotal={paxWisePricing.infant.subtotal}
                currency={currency}
                bgColor="bg-pink-50/30"
              />
            )}

            <div className="px-3 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Total Fare
              </p>
            </div>
          </>
        )}

        {/* ✅ Total Base Fare (sum of all pax) */}
        <Row
          label="Total Base Fare"
          value={formatMoney(baseFare, currency)}
        />

        {/* Tax & Fee */}
        <Row label="Tax & Fee" value={formatMoney(taxAmount, currency)} />

        {/* Extra Fee (if any) */}
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

// ─────────────────────────────────────
// Helper: Simple Row
// ─────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2 border-b border-slate-50">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────
// Helper: Pax Row with breakdown
// ─────────────────────────────────────
function PaxRow({
  icon,
  label,
  count,
  perPax,
  subtotal,
  currency,
  bgColor = "",
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  perPax: number;
  subtotal: number;
  currency: string;
  bgColor?: string;
}) {
  return (
    <div
      className={`flex justify-between items-center px-3 py-2 border-b border-slate-50 ${bgColor}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">
            {label} × {count}
          </p>
          <p className="text-[9px] text-slate-400">
            {formatMoney(perPax, currency)} per pax
          </p>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-800">
        {formatMoney(subtotal, currency)}
      </span>
    </div>
  );
}