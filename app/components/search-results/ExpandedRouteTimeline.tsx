// src/components/search-results/ExpandedRouteTimeline.tsx

"use client";

import { Plane, MapPin, Clock } from "lucide-react";
import {
  formatTime, formatFullDate, formatDuration,
  type FlightItinerary,
} from "./helpers";

interface Props {
  itineraries: FlightItinerary[];
}

export function ExpandedRouteTimeline({ itineraries }: Props) {
  return (
    <div>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
        <MapPin size={11} className="text-indigo-500" /> Route
      </h5>
      {itineraries.map((it, itIdx) => (
        <div key={itIdx} className={itIdx !== 0 ? "mt-5" : ""}>
          {itineraries.length > 1 && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase mb-3 border ${
                itIdx === 0
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                  : "bg-rose-50 text-rose-600 border-rose-100"
              }`}
            >
              <Plane
                size={9}
                className={itIdx === 0 ? "rotate-90" : "-rotate-90"}
              />
              {itIdx === 0 ? "Outbound" : "Return"}
            </div>
          )}
          {it.segments.map((seg, sIdx) => {
            const isLast = sIdx === it.segments.length - 1;
            return (
              <div key={sIdx}>
                {/* Departure node */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                      <img
                        src={`https://pics.avs.io/80/80/${seg.carrierCode}.png`}
                        alt=""
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                    <div className="w-[2px] h-8 bg-gradient-to-b from-indigo-200 to-indigo-50 my-0.5" />
                  </div>
                  <div className="pb-1 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-lg font-extrabold text-slate-900">
                            {formatTime(seg.departure.at)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatFullDate(seg.departure.at)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-indigo-600 mt-0.5">
                          {seg.departure.iataCode}
                        </p>
                        {seg.departure.airport && (
                          <p className="text-[11px] text-slate-500">
                            {seg.departure.airport}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {seg.carrierCode}-{seg.number}
                        </span>
                        {seg.duration && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatDuration(seg.duration)}
                          </p>
                        )}
                        {seg.aircraft?.name && (
                          <p className="text-[10px] text-slate-400">
                            {seg.aircraft.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrival node */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 shadow-sm ${
                        isLast
                          ? "bg-indigo-600 border-indigo-600"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      {isLast ? (
                        <MapPin size={12} className="text-white" />
                      ) : (
                        <Clock size={12} className="text-amber-500" />
                      )}
                    </div>
                    {!isLast && (
                      <div className="w-[2px] h-6 bg-amber-100 my-0.5" />
                    )}
                  </div>
                  <div className="pb-3 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-lg font-extrabold text-slate-900">
                        {formatTime(seg.arrival.at)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatFullDate(seg.arrival.at)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600 mt-0.5">
                      {seg.arrival.iataCode}
                    </p>
                    {seg.arrival.airport && (
                      <p className="text-[11px] text-slate-500">
                        {seg.arrival.airport}
                      </p>
                    )}
                    {!isLast && (
                      <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                        <Clock size={9} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600">
                          Layover · {seg.arrival.iataCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}