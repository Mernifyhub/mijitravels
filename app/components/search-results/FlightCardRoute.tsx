// src/components/search-results/FlightCardRoute.tsx

"use client";

import { Plane } from "lucide-react";
import { motion } from "framer-motion";
import { formatTime, formatDate, formatDuration, type FlightItinerary } from "./helpers";

interface FlightCardRouteProps {
  itineraries: FlightItinerary[];
  airlineName: string;
  isFirst: boolean;
}

const getDayOffset = (from?: string, to?: string) => {
  if (!from || !to) return 0;
  const f = new Date(from);
  const t = new Date(to);
  const fd = new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
  const td = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return Math.max(0, Math.round((td - fd) / 86400000));
};

export function FlightCardRoute({
  itineraries,
  airlineName,
}: FlightCardRouteProps) {
  const isRoundTrip = itineraries.length > 1;

  const sizes = isRoundTrip
    ? {
        wrapper: "px-5 py-4 space-y-3",
        logoHeight: "h-9",
        airlineName: "text-[9px]",
        flightNum: "text-[9px]",
        timeText: "text-xl",
        iataText: "text-xs",
        airportText: "text-[9px]",
        dateText: "text-[9px]",
        durationText: "text-[11px]",
        stopText: "text-[10px]",
        codeBadge: "text-[9px]",
      }
    : {
        wrapper: "px-5 pt-5 pb-3",
        logoHeight: "h-10",
        airlineName: "text-[10px]",
        flightNum: "text-[9px]",
        timeText: "text-xl",
        iataText: "text-xs",
        airportText: "text-[10px]",
        dateText: "text-[9px]",
        durationText: "text-[11px]",
        stopText: "text-[11px]",
        codeBadge: "text-[9px]",
      };

  return (
    <div className={sizes.wrapper}>
      {itineraries.map((itinerary, idx) => {
        if (!itinerary?.segments?.length) return null;

        const firstSeg = itinerary.segments[0];
        const lastSeg = itinerary.segments[itinerary.segments.length - 1];
        const stops = itinerary.segments.length - 1;
        const stopCodes = itinerary.segments
          .slice(0, -1)
          .map((s) => s.arrival.iataCode)
          .filter(Boolean);
        const arrivalOffset = getDayOffset(firstSeg.departure?.at, lastSeg.arrival?.at);
        const carrierLabel = firstSeg.marketingCarrier?.name || airlineName || firstSeg.carrierCode;
        const isReturn = isRoundTrip && idx === 1;

        return (
          <div
            key={idx}
            className={
              idx !== 0
                ? "pt-3 border-t border-dashed border-slate-200 grid grid-cols-[110px_1fr_1.4fr_1fr] gap-3 items-center"
                : "grid grid-cols-[110px_1fr_1.4fr_1fr] gap-3 items-center"
            }
          >
            {/* ============ COLUMN 1: AIRLINE INFO ============ */}
            <div className="flex flex-col items-center">
              <img
                src={`https://pics.avs.io/200/80/${firstSeg.carrierCode}.png`}
                alt={carrierLabel}
                className={`w-full ${sizes.logoHeight} object-contain`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <p className={`${sizes.airlineName} font-semibold text-slate-700 mt-0.5 text-center leading-tight line-clamp-1 w-full`}>
                {carrierLabel}
              </p>
              <span className={`${sizes.flightNum} font-medium text-slate-400 tracking-wide leading-tight`}>
                {firstSeg.carrierCode}-{firstSeg.number}
              </span>
            </div>

            {/* ============ COLUMN 2: DEPARTURE ============ */}
            <div className="text-center">
              <p className={`${sizes.dateText} font-semibold text-indigo-600 leading-none`}>
                {formatDate(firstSeg.departure.at)}
              </p>
              <p className={`${sizes.timeText} font-bold text-slate-900 leading-tight mt-1`}>
                {formatTime(firstSeg.departure.at)}
              </p>
              <p className={`${sizes.iataText} font-semibold text-slate-500 uppercase mt-0.5`}>
                {firstSeg.departure.iataCode}
              </p>
              {firstSeg.departure.airport && (
                <p className={`${sizes.airportText} text-slate-400 leading-tight mt-0.5 line-clamp-1`}>
                  {firstSeg.departure.airport}
                </p>
              )}
            </div>

            {/* ============ COLUMN 3: TIMELINE (CENTER) ============ */}
            <div className="flex flex-col items-center justify-center w-full">
              <span className={`${sizes.durationText} font-medium text-slate-500 mb-1`}>
                {formatDuration(itinerary.duration)}
              </span>

              {/* Animated line */}
              <div className="w-full relative h-5 flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-indigo-300 via-indigo-200 to-indigo-300 rounded-full" />

                {/* Start dot */}
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10 ${
                    isReturn
                      ? "bg-indigo-500"
                      : "border-2 border-indigo-400 bg-white"
                  }`}
                />

                {/* Connecting airport dots */}
                {stops > 0 &&
                  stopCodes.map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 border-2 border-white shadow-sm z-10"
                      style={{ left: `${((i + 1) / (stops + 1)) * 100}%` }}
                    />
                  ))}

                {/* End dot */}
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10 ${
                    isReturn
                      ? "border-2 border-indigo-400 bg-white"
                      : "bg-indigo-500"
                  }`}
                />

                {/* Moving Plane Icon */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                  animate={{ left: isReturn ? ["98%", "2%"] : ["2%", "98%"] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                >
                  <Plane
                    size={14}
                    className="text-indigo-600 fill-indigo-600 drop-shadow-sm"
                    style={{
                      transform: isReturn ? "rotate(225deg)" : "rotate(45deg)",
                    }}
                  />
                </motion.div>
              </div>

              {/* Stop info - fixed height */}
              <div className="h-4 mt-1.5 flex items-center justify-center">
                {stops === 0 ? (
                  <span className={`${sizes.stopText} font-medium text-emerald-600 leading-none`}>
                    Non-stop
                  </span>
                ) : (
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <span className={`${sizes.stopText} font-medium text-rose-500 leading-none`}>
                      {stops} stop{stops > 1 ? "s" : ""}
                    </span>
                    {stopCodes.map((code, i) => (
                      <span
                        key={i}
                        className={`${sizes.codeBadge} font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none`}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ============ COLUMN 4: ARRIVAL ============ */}
            <div className="text-center">
              <p className={`${sizes.dateText} font-semibold text-indigo-600 leading-none`}>
                {formatDate(lastSeg.arrival.at)}
              </p>
              <div className="flex items-start justify-center mt-1">
                <p className={`${sizes.timeText} font-bold text-slate-900 leading-tight`}>
                  {formatTime(lastSeg.arrival.at)}
                </p>
                {arrivalOffset > 0 && (
                  <span className="text-[10px] font-semibold text-rose-500 ml-0.5 mt-0.5">
                    +{arrivalOffset}
                  </span>
                )}
              </div>
              <p className={`${sizes.iataText} font-semibold text-slate-500 uppercase mt-0.5`}>
                {lastSeg.arrival.iataCode}
              </p>
              {lastSeg.arrival.airport && (
                <p className={`${sizes.airportText} text-slate-400 leading-tight mt-0.5 line-clamp-1`}>
                  {lastSeg.arrival.airport}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}