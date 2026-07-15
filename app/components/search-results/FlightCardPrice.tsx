// src/components/search-results/FlightCardPrice.tsx

"use client";

import { User, Users, Baby, ArrowRight, ChevronDown } from "lucide-react";
import { formatMoney, SOURCE_CONFIG, type ApiSourceKey } from "./helpers";

// ✅ Pax fare types
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

interface FlightCardPriceProps {
  currency: string;
  subtotal: number;
  youPay: number;
  totalDiscount: number;
  perPerson: number;
  totalPax: number;
  apiSource: ApiSourceKey;
  isExpanded: boolean;
  setExpanded: () => void;
  handleBookNow: () => void;
  isRoundTrip?: boolean;

  // ✅ NEW: Pax-wise pricing & counts
  paxWisePricing?: PaxWisePricing;
  adults?: number;
  children?: number;
  infants?: number;
}

export function FlightCardPrice({
  currency,
  subtotal,
  youPay,
  totalDiscount,
  perPerson,
  totalPax,
  apiSource,
  isExpanded,
  setExpanded,
  handleBookNow,
  isRoundTrip = false,
  paxWisePricing,
  adults = 0,
  children = 0,
  infants = 0,
}: FlightCardPriceProps) {
  const currentSourceCfg =
    SOURCE_CONFIG[apiSource] || SOURCE_CONFIG.duffel;

  // ✅ Check if we have pax-wise data + multiple pax types
  const hasMultiplePaxTypes =
    paxWisePricing &&
    [paxWisePricing.adult, paxWisePricing.child, paxWisePricing.infant].filter(
      Boolean,
    ).length > 1;

  // ✅ Dynamic sizing based on trip type
  const sizes = isRoundTrip
    ? {
        wrapper: "lg:w-60 px-5 py-4",
        spacing: "space-y-2",
        badgeGap: "gap-1.5 mb-2",
        badgeHeight: "h-6",
        badgePx: "px-2.5",
        badgeText: "text-[9px]",
        currencyText: "text-[10px]",
        oldPriceText: "text-sm",
        priceText: "text-[28px]",
        saveText: "text-[10px]",
        perPersonText: "text-[10px]",
        bookBtnPy: "py-2.5",
        bookBtnText: "text-xs",
        detailsBtnPy: "py-2",
        detailsBtnText: "text-[11px]",
        iconSize: 11,
        paxRowText: "text-[10px]",
        paxRowIcon: 9,
      }
    : {
        wrapper: "lg:w-52 px-4 py-3",
        spacing: "space-y-1.5",
        badgeGap: "gap-1 mb-1.5",
        badgeHeight: "h-5",
        badgePx: "px-2",
        badgeText: "text-[8px]",
        currencyText: "text-[9px]",
        oldPriceText: "text-xs",
        priceText: "text-2xl",
        saveText: "text-[9px]",
        perPersonText: "text-[9px]",
        bookBtnPy: "py-2",
        bookBtnText: "text-[11px]",
        detailsBtnPy: "py-1.5",
        detailsBtnText: "text-[10px]",
        iconSize: 10,
        paxRowText: "text-[9px]",
        paxRowIcon: 8,
      };

  return (
    <div
      className={`${sizes.wrapper} lg:self-start border-t lg:border-t-0 bg-gradient-to-b from-slate-50/50 to-white`}
    >
      <div className={sizes.spacing}>
        {/* Pax + API + Tax badges */}
        <div
          className={`flex items-center justify-end ${sizes.badgeGap} flex-wrap sm:flex-nowrap`}
        >
          <div
            className={`${sizes.badgeHeight} ${sizes.badgePx} rounded-full border border-indigo-100 bg-indigo-50/90 shadow-sm flex items-center gap-1.5 whitespace-nowrap`}
          >
            {totalPax === 1 ? (
              <User
                size={sizes.iconSize}
                className="text-indigo-600 stroke-[2.6px]"
              />
            ) : (
              <Users
                size={sizes.iconSize}
                className="text-indigo-600 stroke-[2.6px]"
              />
            )}
            <span
              className={`${sizes.badgeText} font-black text-indigo-800 leading-none`}
            >
              {totalPax} {totalPax === 1 ? "Traveler" : "Travelers"}
            </span>
          </div>

          <div
            title={currentSourceCfg.label}
            className={`${sizes.badgeHeight} ${sizes.badgePx} rounded-full border shadow-sm flex items-center gap-1 whitespace-nowrap ${currentSourceCfg.badgeCls}`}
          >
            <span className={`${sizes.badgeText} font-black leading-none`}>
              {currentSourceCfg.short}
            </span>
          </div>

          <div
            className={`${sizes.badgeHeight} ${sizes.badgePx} rounded-full border border-emerald-100 bg-emerald-50 shadow-sm flex items-center whitespace-nowrap`}
          >
            <span
              className={`${sizes.badgeText} font-black text-emerald-700 uppercase tracking-tight leading-none`}
            >
              Tax Incl.
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-center">
          <p
            className={`${sizes.currencyText} font-bold text-slate-400 uppercase mb-0.5`}
          >
            {currency}
          </p>

          {totalDiscount > 0 && (
            <p
              className={`${sizes.oldPriceText} font-bold text-slate-400 line-through mb-0.5`}
            >
              {subtotal.toLocaleString()}
            </p>
          )}

          <p
            className={`${sizes.priceText} font-extrabold leading-none text-slate-900`}
          >
            {youPay.toLocaleString()}
          </p>

          {totalDiscount > 0 && (
            <p className={`${sizes.saveText} font-bold text-emerald-600 mt-0.5`}>
              Save {formatMoney(totalDiscount, currency)}
            </p>
          )}

          {totalPax > 1 && !hasMultiplePaxTypes && (
            <p className={`${sizes.perPersonText} text-slate-400 mt-0.5`}>
              {formatMoney(perPerson, currency)} / person
            </p>
          )}
        </div>

        {/* ✅ NEW: Pax-wise mini breakdown (only when multiple pax types) */}
        {hasMultiplePaxTypes && (
          <div className="bg-slate-50/80 rounded-lg border border-slate-100 px-2 py-1.5 space-y-0.5">
            {paxWisePricing?.adult && adults > 0 && (
              <PaxMiniRow
                icon={
                  <User
                    size={sizes.paxRowIcon}
                    className="text-indigo-500 stroke-[2.5px]"
                  />
                }
                label="Adult"
                count={adults}
                perPax={paxWisePricing.adult.totalFare}
                currency={currency}
                textSize={sizes.paxRowText}
              />
            )}
            {paxWisePricing?.child && children > 0 && (
              <PaxMiniRow
                icon={
                  <Users
                    size={sizes.paxRowIcon}
                    className="text-amber-500 stroke-[2.5px]"
                  />
                }
                label="Child"
                count={children}
                perPax={paxWisePricing.child.totalFare}
                currency={currency}
                textSize={sizes.paxRowText}
              />
            )}
            {paxWisePricing?.infant && infants > 0 && (
              <PaxMiniRow
                icon={
                  <Baby
                    size={sizes.paxRowIcon}
                    className="text-pink-500 stroke-[2.5px]"
                  />
                }
                label="Infant"
                count={infants}
                perPax={paxWisePricing.infant.totalFare}
                currency={currency}
                textSize={sizes.paxRowText}
              />
            )}
          </div>
        )}

        {/* Book Now */}
        <button
          onClick={handleBookNow}
          className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white ${sizes.bookBtnPy} rounded-xl font-bold ${sizes.bookBtnText} tracking-wide uppercase transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2`}
        >
          <span>Book Now</span>
          <ArrowRight size={isRoundTrip ? 13 : 11} />
        </button>

        {/* Show Details */}
        <button
          onClick={setExpanded}
          className={`w-full ${sizes.detailsBtnPy} rounded-xl ${sizes.detailsBtnText} font-bold uppercase tracking-wide text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-1.5`}
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          <ChevronDown
            size={isRoundTrip ? 11 : 10}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// ✅ NEW Helper: Pax Mini Row
// ─────────────────────────────────────
function PaxMiniRow({
  icon,
  label,
  count,
  perPax,
  currency,
  textSize,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  perPax: number;
  currency: string;
  textSize: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {icon}
        <span className={`${textSize} font-bold text-slate-600`}>
          {label} × {count}
        </span>
      </div>
      <span className={`${textSize} font-black text-slate-700`}>
        {formatMoney(perPax, currency)}
      </span>
    </div>
  );
}