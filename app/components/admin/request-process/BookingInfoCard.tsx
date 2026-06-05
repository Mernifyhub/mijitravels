// app/components/admin/request-process/BookingInfoCard.tsx
"use client";

import { Plane } from "lucide-react";

interface BookingInfoCardProps {
  booking: any;
  formatDate: (d: string) => string;
}

export default function BookingInfoCard({ booking, formatDate }: BookingInfoCardProps) {
  const [from, to] = (booking?.route || "-").split("-");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Plane size={16} className="text-indigo-300 rotate-90" />
            </div>
            <div>
              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Booking</p>
              <p className="text-base font-black text-white">{booking?.bookingId}</p>
            </div>
          </div>
          <span className="font-mono text-sm text-indigo-200 bg-white/10 px-3 py-1 rounded-lg">
            {booking?.pnr}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-xl font-black text-white">{from}</p>
            <p className="text-[9px] text-indigo-300 uppercase">Departure</p>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/20" />
            <Plane size={14} className="text-indigo-400 rotate-90" />
            <div className="h-px flex-1 bg-white/20" />
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-white">{to}</p>
            <p className="text-[9px] text-indigo-300 uppercase">Arrival</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Trip Type", value: booking?.tripType },
          { label: "Carrier",   value: booking?.carrier  },
          { label: "Status",    value: booking?.status   },
          { label: "Departure", value: formatDate(booking?.departureDate) },
        ].map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              {item.label}
            </p>
            <p className="text-sm font-black text-gray-800 truncate">{item.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}