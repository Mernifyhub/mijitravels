// src/components/search-results/FlightCard.tsx

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { extractFareFromFlight, calculateFare, fareToParams } from "@/lib/fare";
import { useFareDisplay } from "@/hooks/useFareDisplay";
import {formatMoney,detectApiSource,getAvailableSeats,SORT_BADGE_CONFIG,type FlightData,type SortOption,} from "./helpers";
import { FlightCardRoute } from "./FlightCardRoute";
import { FlightCardBottomBar } from "./FlightCardBottomBar";
import { FlightCardPrice } from "./FlightCardPrice";
import { FlightCardExpanded } from "./FlightCardExpanded";

interface FlightCardProps {
  flight: FlightData;
  isExpanded: boolean;
  setExpanded: () => void;
  isFirst: boolean;
  sortBy: SortOption;
  searchParams: URLSearchParams;
}

export function FlightCard({
  flight,
  isExpanded,
  setExpanded,
  isFirst,
  sortBy,
  searchParams,
}: FlightCardProps) {
  const router = useRouter();
  const itineraries = flight.itineraries || [];

  const adults = Number(searchParams.get("adults") || 1);
  const children = Number(searchParams.get("children") || 0);
  const infants = Number(searchParams.get("infants") || 0);
  const totalPax = adults + children + infants;

  // ==================== FARE + DISCOUNT ====================

  const fareDisplay = useFareDisplay();
  const flightFareInput = extractFareFromFlight(flight, {
    adults,
    children,
    infants,
  });
  const flightFareCalculated = calculateFare(flightFareInput);
  const fare = fareDisplay.convertFare(flightFareCalculated);
  const currency = fare.currency || "SAR";
  const baseFare = Math.round(Number(fare.baseFare || 0));
  const taxAmount = Math.round(Number(fare.taxAmount || 0));
  const subtotal = baseFare + taxAmount;

  const discountInfo = flight?.discountInfo || {
    discounts: [],
    totalDiscount: 0,
    hasPromo: false,
    labels: [],
  };
  const promoDiscount = Math.round(Number(discountInfo.totalDiscount || 0));
  const discountLabels: string[] = discountInfo.labels || [];
  const youPay = Math.max(0, subtotal - promoDiscount);
  const perPerson = Math.round(youPay / Math.max(totalPax, 1));
  const extraFee = 0;
  const totalDiscount = promoDiscount;

  // ==================== BAGGAGE & CONDITIONS ====================

  const baggageInfo = flight.baggageInfo || {
    checked: "Not Included",
    cabin: "Not Included",
    checkedRaw: 0,
    cabinRaw: 0,
  };
  const cond = flight.conditions || {};

  const refundLabel = cond.refundable
    ? cond.refundPenalty
      ? `Refundable (${formatMoney(parseFloat(cond.refundPenalty), currency)} fee)`
      : "Fully Refundable"
    : "Non-Refundable";

  const changeLabel = cond.changeable
    ? cond.changePenalty
      ? `Changeable (${formatMoney(parseFloat(cond.changePenalty), currency)} fee)`
      : "Free Change"
    : "Not Changeable";

  const airlineName =
    flight._duffel?.owner ||
    itineraries[0]?.segments[0]?.marketingCarrier?.name ||
    "";
  const cabinClass =
    itineraries[0]?.segments[0]?.cabinName || "Economy";

  // ==================== DERIVED VALUES ====================

  const availableSeats = useMemo(
    () => getAvailableSeats(flight.id),
    [flight.id]
  );
  const apiSource = useMemo(() => detectApiSource(flight), [flight]);

  // ==================== BOOK NOW ====================

  const handleBookNow = () => {
    const firstIt = itineraries?.[0];
    if (!firstIt || !firstIt.segments || firstIt.segments.length === 0) {
      console.error("❌ Missing itineraries or segments");
      return;
    }

    const firstSeg = firstIt.segments[0];
    const lastSeg = firstIt.segments[firstIt.segments.length - 1];

    if (!flight.priceBreakdown) {
      console.error("❌ Missing priceBreakdown on flight");
      return;
    }

    const fareParams = fareToParams(flight.priceBreakdown);

    const params = new URLSearchParams({
      flightId: String(flight.id || ""),
      apiSource: apiSource,
      carrier: String(firstSeg.carrierCode || ""),
      flightNo: String(firstSeg.number || ""),
      origin: String(firstSeg.departure?.iataCode || ""),
      destination: String(lastSeg.arrival?.iataCode || ""),
      departure: String(firstSeg.departure?.at || ""),
      arrival: String(lastSeg.arrival?.at || ""),
      duration: String(firstIt.duration || ""),
      stops: String(firstIt.segments.length - 1),
      tripType:
        searchParams.get("tripType") ||
        (itineraries.length > 1 ? "ROUND_TRIP" : "ONE_WAY"),
      ...fareParams,
      promoDiscount: String(promoDiscount || 0),
      discount: String(totalDiscount || 0),
      netFare: String(youPay),
      grandTotal: String(youPay),
      customerInvoiceTotal: String(youPay),
      checkedBag: String(baggageInfo.checked || "Not Included"),
      cabinBag: String(baggageInfo.cabin || "Not Included"),
      checkedBagRaw: String(baggageInfo.checkedRaw || 0),
      cabinBagRaw: String(baggageInfo.cabinRaw || 0),
      refundable: String(cond.refundable || false),
      changeable: String(cond.changeable || false),
      refundPenalty: String(cond.refundPenalty || ""),
      changePenalty: String(cond.changePenalty || ""),
      cabinClass: String(cabinClass || "Economy"),
      adults: String(searchParams.get("adults") || "1"),
      children: String(searchParams.get("children") || "0"),
      infants: String(searchParams.get("infants") || "0"),
      segments: JSON.stringify(
        itineraries.flatMap((it) =>
          (it.segments || []).map((seg) => ({
            from: seg.departure?.iataCode || "",
            to: seg.arrival?.iataCode || "",
            departure: seg.departure?.at || "",
            arrival: seg.arrival?.at || "",
            flightNo: seg.number || "",
            airline: seg.carrierCode || "",
            duration: seg.duration || "",
          }))
        )
      ),
    });

    router.push(`/user/flight/${flight.id}?${params.toString()}`);
  };

  // ==================== RENDER ====================

  const badgeCfg = SORT_BADGE_CONFIG[sortBy];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-500 overflow-hidden group"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Sort badge */}
      {isFirst && (
        <div
          className={`absolute top-3 left-4 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg ${badgeCfg.cls}`}
        >
          <span>{badgeCfg.icon}</span>
          <span>{badgeCfg.label}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* LEFT: Flight Info */}
        <div className="flex-1 flex flex-col">
          <FlightCardRoute
            itineraries={itineraries}
            airlineName={airlineName}
            isFirst={isFirst}
          />
          <FlightCardBottomBar
            refundable={!!cond.refundable}
            changeable={!!cond.changeable}
            cabinClass={cabinClass}
            availableSeats={availableSeats}
            baggageChecked={baggageInfo.checked}
            baggageCheckedRaw={baggageInfo.checkedRaw}
          />
        </div>

        {/* DIVIDER */}
        <div className="hidden lg:flex flex-col items-center justify-center py-4 px-0">
          <div className="w-4 h-4 bg-[#F4F7FA] border border-slate-200 rounded-full flex-shrink-0" />
          <div className="w-[1px] flex-1 border-r-2 border-dashed border-slate-200/80" />
          <div className="w-4 h-4 bg-[#F4F7FA] border border-slate-200 rounded-full flex-shrink-0" />
        </div>

        {/* RIGHT: Price */}
        <FlightCardPrice
          currency={currency}
          subtotal={subtotal}
          youPay={youPay}
          totalDiscount={totalDiscount}
          perPerson={perPerson}
          totalPax={totalPax}
          apiSource={apiSource}
          isExpanded={isExpanded}
          setExpanded={setExpanded}
          handleBookNow={handleBookNow}
          isRoundTrip={itineraries.length > 1}
        />
      </div>

      {/* EXPANDED */}
      <FlightCardExpanded
        isExpanded={isExpanded}
        flight={flight}
        apiSource={apiSource}
        airlineName={airlineName}
        cabinClass={cabinClass}
        availableSeats={availableSeats}
        currency={currency}
        baseFare={baseFare}
        taxAmount={taxAmount}
        extraFee={extraFee}
        subtotal={subtotal}
        promoDiscount={promoDiscount}
        discountLabels={discountLabels}
        youPay={youPay}
        baggageChecked={baggageInfo.checked}
        baggageCabin={baggageInfo.cabin}
        baggageCheckedRaw={baggageInfo.checkedRaw}
        baggageCabinRaw={baggageInfo.cabinRaw}
        refundLabel={refundLabel}
        changeLabel={changeLabel}
        isRefundable={!!cond.refundable}
        isChangeable={!!cond.changeable}
        handleBookNow={handleBookNow}
      />
    </motion.div>
  );
}