// app/components/admin/GroupFareCard.tsx
"use client";

import { Plane, Users, ChevronRight, Star, Luggage } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ✅ সব props add করা হয়েছে
interface Props {
  fare: GroupFare;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onToggleFeatured: () => void;
  onDuplicate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GroupFareCard({
  fare,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onDuplicate,
}: Props) {
  const formatPrice  = (n: number) => `৳${n.toLocaleString()}`;
  const seatPercent  = (fare.seats.available / fare.seats.total) * 100;

  const classColors: Record<GroupFare["class"], string> = {
    economy:  "bg-blue-500",
    business: "bg-purple-500",
    first:    "bg-amber-500",
  };

  const statusColors: Record<GroupFare["status"], string> = {
    active:   "bg-emerald-500",
    inactive: "bg-gray-400",
    soldout:  "bg-red-500",
    expired:  "bg-amber-500",
  };

  const statusLabels: Record<GroupFare["status"], string> = {
    active:   "Active",
    inactive: "Inactive",
    soldout:  "Sold Out",
    expired:  "Expired",
  };

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-all
        hover:shadow-lg group
        ${fare.isFeatured
          ? "border-amber-300 ring-1 ring-amber-200"
          : "border-gray-100"}`}
    >
      {/* ── Main Card (clickable) ── */}
      <div
        onClick={onView}
        className="p-4 cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${classColors[fare.class]} rounded-lg
                flex items-center justify-center text-white text-[10px] font-bold`}
            >
              {fare.airlineCode}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{fare.airline}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusColors[fare.status]}`}
                  title={statusLabels[fare.status]}
                />
                {fare.isFeatured && (
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {fare.flightNumber}
              </span>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-gray-500 transition"
          />
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
                <Plane
                  size={12}
                  className="text-gray-400 absolute left-1/2 -translate-x-1/2
                    -top-1.5 rotate-90 bg-white"
                />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
            <span className="text-[10px] text-gray-400 mt-1">
              {fare.duration} •{" "}
              {fare.stops === 0 ? "Direct" : `${fare.stops} stop`}
            </span>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {fare.destination.time}
            </p>
            <p className="text-sm font-medium text-gray-600">
              {fare.destination.code}
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users size={12} className="text-gray-400" />
              <span
                className={`text-xs font-semibold
                  ${seatPercent > 30 ? "text-emerald-600" : "text-red-600"}`}
              >
                {fare.seats.available} seats
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Luggage size={12} />
              <span className="text-[10px]">{fare.baggage}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(fare.pricing.adult)}
            </span>
            <span className="text-[10px] text-gray-400 ml-1">/person</span>
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100
        flex items-center justify-between gap-2">

        {/* Status Badge */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white
            ${statusColors[fare.status]}`}
        >
          {statusLabels[fare.status]}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Toggle Featured */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }}
            title={fare.isFeatured ? "Remove Featured" : "Mark Featured"}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition border
              ${fare.isFeatured
                ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"}`}
          >
            <Star size={11} className={fare.isFeatured ? "fill-amber-400" : ""} />
          </button>

          {/* Toggle Status */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
            title={fare.status === "active" ? "Deactivate" : "Activate"}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition border
              ${fare.status === "active"
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"}`}
          >
            {fare.status === "active" ? "ON" : "OFF"}
          </button>

          {/* Duplicate */}
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate"
            className="px-2.5 py-1 rounded-md text-[10px] font-bold transition border
              bg-gray-100 text-gray-500 border-gray-200 hover:bg-indigo-50
              hover:text-indigo-600 hover:border-indigo-200"
          >
            Copy
          </button>

          {/* Edit */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit"
            className="px-2.5 py-1 rounded-md text-[10px] font-bold transition border
              bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
          >
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="px-2.5 py-1 rounded-md text-[10px] font-bold transition border
              bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}