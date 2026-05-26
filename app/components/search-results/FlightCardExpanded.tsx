// src/components/search-results/FlightCardExpanded.tsx

"use client";

import { Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SOURCE_CONFIG,
  type FlightData,
  type ApiSourceKey,
} from "./helpers";
import { ExpandedRouteTimeline } from "./ExpandedRouteTimeline";
import { ExpandedSeatAvailability } from "./ExpandedSeatAvailability";
import { ExpandedFlightSummary } from "./ExpandedFlightSummary";
import { ExpandedTravelTips } from "./ExpandedTravelTips";
import { ExpandedFareBreakdown } from "./ExpandedFareBreakdown";
import { ExpandedBaggagePolicies } from "./ExpandedBaggagePolicies";
import { ExpandedCabinFeatures } from "./ExpandedCabinFeatures";

interface Props {
  isExpanded: boolean;
  flight: FlightData;
  apiSource: ApiSourceKey;
  airlineName: string;
  cabinClass: string;
  availableSeats: number;
  // Fare
  currency: string;
  baseFare: number;
  taxAmount: number;
  extraFee: number;
  subtotal: number;
  promoDiscount: number;
  discountLabels: string[];
  youPay: number;
  // Baggage & Conditions
  baggageChecked: string;
  baggageCabin: string;
  baggageCheckedRaw: number;
  baggageCabinRaw: number;
  refundLabel: string;
  changeLabel: string;
  isRefundable: boolean;
  isChangeable: boolean;
  // Actions
  handleBookNow: () => void;
}

export function FlightCardExpanded({
  isExpanded,
  flight,
  apiSource,
  airlineName,
  cabinClass,
  availableSeats,
  currency,
  baseFare,
  taxAmount,
  extraFee,
  subtotal,
  promoDiscount,
  discountLabels,
  youPay,
  baggageChecked,
  baggageCabin,
  baggageCheckedRaw,
  baggageCabinRaw,
  refundLabel,
  changeLabel,
  isRefundable,
  isChangeable,
  handleBookNow,
}: Props) {
  const itineraries = flight.itineraries || [];
  const currentSourceCfg =
    SOURCE_CONFIG[apiSource] || SOURCE_CONFIG.duffel;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border-t border-slate-100">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A1128] via-[#1a2342] to-[#0A1128] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-white/70" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Flight Details
                </span>
                {airlineName && (
                  <span className="text-[11px] text-indigo-300">
                    • {airlineName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 capitalize">
                  {cabinClass}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${currentSourceCfg.badgeCls}`}
                >
                  {currentSourceCfg.label}
                </span>
                <span className="text-[10px] font-bold text-indigo-300 bg-white/10 px-2 py-0.5 rounded-full">
                  {itineraries.length > 1
                    ? `${itineraries.length} Journeys`
                    : "1 Journey"}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 bg-gradient-to-b from-slate-50/30 to-white">
              <div className="grid lg:grid-cols-2 gap-6">

                {/* LEFT */}
                <div className="space-y-5">
                  <ExpandedRouteTimeline itineraries={itineraries} />
                  <ExpandedSeatAvailability availableSeats={availableSeats} />
                  <ExpandedFlightSummary
                    itinerary={itineraries[0]}
                    airlineName={airlineName}
                  />
                  <ExpandedTravelTips
                    hasConnectingFlight={
                      itineraries[0]?.segments?.length > 1
                    }
                    isRefundable={isRefundable}
                  />
                </div>

                {/* RIGHT */}
                <div className="space-y-5">
                  <ExpandedFareBreakdown
                    currency={currency}
                    baseFare={baseFare}
                    taxAmount={taxAmount}
                    extraFee={extraFee}
                    subtotal={subtotal}
                    promoDiscount={promoDiscount}
                    discountLabels={discountLabels}
                    youPay={youPay}
                  />
                  <ExpandedBaggagePolicies
                    baggageChecked={baggageChecked}
                    baggageCabin={baggageCabin}
                    baggageCheckedRaw={baggageCheckedRaw}
                    baggageCabinRaw={baggageCabinRaw}
                    refundLabel={refundLabel}
                    changeLabel={changeLabel}
                    isRefundable={isRefundable}
                    isChangeable={isChangeable}
                  />
                  <ExpandedCabinFeatures
                    cabinClass={cabinClass}
                    hasBaggage={baggageCheckedRaw > 0}
                  />

                  {/* CO2 */}
                  {flight._duffel?.totalEmissions && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                        🌱
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">
                          CO₂ Emissions
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700">
                          {flight._duffel.totalEmissions} kg / passenger
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Book CTA */}
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    BOOK THIS FLIGHT <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}