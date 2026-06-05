// app/components/flight/SuccessScreen.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PassengerForm } from "./types";
import { formatDate, fmtMoney } from "./helpers";

interface SuccessScreenProps {
  pnr: string;
  origin: string;
  destination: string;
  departure: string;
  passengers: PassengerForm[];
  bookingTotal: number;
  currency: string;
}

export default function SuccessScreen({
  pnr, origin, destination, departure,
  passengers, bookingTotal, currency,
}: SuccessScreenProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
          <CheckCircle2 size={40} className="text-white" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Your booking has been successfully created.
        </p>

        {/* PNR */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Your PNR
          </p>
          <p className="text-4xl font-bold text-blue-700 tracking-[0.25em] font-mono">
            {pnr}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Please save this reference number
          </p>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          {[
            { label: "Route",      value: `${origin} → ${destination}` },
            { label: "Departure",  value: formatDate(departure) },
            { label: "Passengers", value: `${passengers.length} Pax` },
            { label: "Total Fare", value: fmtMoney(bookingTotal, currency), highlight: true },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p className={`text-sm font-bold ${
                (item as any).highlight ? "text-blue-700" : "text-slate-700"
              }`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => router.push("/user/bookings/on-hold")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push("/user/search")}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:text-blue-600 border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
          >
            Search More Flights
          </button>
        </div>
      </motion.div>
    </div>
  );
}