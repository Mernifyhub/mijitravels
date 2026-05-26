import { Plane, Users, ChevronRight, Star, MoreHorizontal, Luggage } from "lucide-react";
import { useState } from "react";

interface GroupFare {
  id: number;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: { code: string; time: string };
  destination: { code: string; time: string };
  duration: string;
  stops: number;
  class: "economy" | "business" | "first";
  seats: { total: number; available: number };
  pricing: { adult: number };
  status: "active" | "inactive" | "soldout" | "expired";
  isFeatured: boolean;
  baggage: string;
}

interface Props {
  fare: GroupFare;
  onView: () => void;
}

export default function GroupFareMinimalCard({ fare, onView }: Props) {
  const formatPrice = (n: number) => `৳${n.toLocaleString()}`;
  const seatPercent = (fare.seats.available / fare.seats.total) * 100;

  const colors = {
    economy: "bg-blue-500",
    business: "bg-purple-500",
    first: "bg-amber-500",
  };

  const status = {
    active: "bg-emerald-500",
    inactive: "bg-gray-400",
    soldout: "bg-red-500",
    expired: "bg-amber-500",
  };

  return (
    <div 
      onClick={onView}
      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] group ${
        fare.isFeatured ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${colors[fare.class]} rounded-lg flex items-center justify-center text-white text-[10px] font-bold`}>
            {fare.airlineCode}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">{fare.airline}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${status[fare.status]}`} />
              {fare.isFeatured && <Star size={12} className="text-amber-400 fill-amber-400" />}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{fare.flightNumber}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-bold text-gray-900">{fare.origin.time}</p>
          <p className="text-sm font-medium text-gray-600">{fare.origin.code}</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center mx-4">
          <div className="flex items-center w-full">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="flex-1 border-t border-dashed border-gray-300 mx-1 relative">
              <Plane size={12} className="text-gray-400 absolute left-1/2 -translate-x-1/2 -top-1.5 rotate-90 bg-white" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
          <span className="text-[10px] text-gray-400 mt-1">
            {fare.duration} • {fare.stops === 0 ? "Direct" : `${fare.stops}stop`}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{fare.destination.time}</p>
          <p className="text-sm font-medium text-gray-600">{fare.destination.code}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Seats */}
          <div className="flex items-center gap-1">
            <Users size={12} className="text-gray-400" />
            <span className={`text-xs font-semibold ${seatPercent > 30 ? "text-emerald-600" : "text-red-600"}`}>
              {fare.seats.available} seats
            </span>
          </div>
          {/* Baggage */}
          <div className="flex items-center gap-1 text-gray-400">
            <Luggage size={12} />
            <span className="text-[10px]">{fare.baggage}</span>
          </div>
        </div>
        
        {/* Price */}
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">{formatPrice(fare.pricing.adult)}</span>
          <span className="text-[10px] text-gray-400 ml-1">/person</span>
        </div>
      </div>
    </div>
  );
}