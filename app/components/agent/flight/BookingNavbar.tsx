// app/components/flight/BookingNavbar.tsx
"use client";

import { ArrowLeft, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserBalance } from "./types";
import { fmtMoney } from "./helpers";

interface BookingNavbarProps {
  origin: string;
  destination: string;
  passengerCount: number;
  bookingTotal: number;
  currency: string;
  userBalance: UserBalance | null;
  balanceLoading: boolean;
  hasSufficientBalance: boolean;
}

export default function BookingNavbar({
  origin, destination, passengerCount,
  bookingTotal, currency, userBalance,
  balanceLoading, hasSufficientBalance,
}: BookingNavbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#0B1D35] via-[#122B4D] to-[#0B1D35] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Title */}
        <div>
          <h1 className="text-sm font-bold tracking-wide">Complete Booking</h1>
          <p className="text-[11px] text-blue-300">
            {origin} → {destination} · {passengerCount} Passenger{passengerCount > 1 ? "s" : ""}
          </p>
        </div>

        {/* Balance & Total */}
        <div className="ml-auto flex items-center gap-3">
          {!balanceLoading && userBalance && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${
              hasSufficientBalance
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <Wallet size={12} />
              {fmtMoney(userBalance.balance, currency)}
              {userBalance.availableCredit > 0 && (
                <span className="opacity-60">
                  / CR {fmtMoney(userBalance.availableCredit, currency)}
                </span>
              )}
            </div>
          )}
          <div className="text-right">
            <p className="text-[10px] text-blue-300 font-medium">Total</p>
            <p className="text-lg font-bold">{fmtMoney(bookingTotal, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}