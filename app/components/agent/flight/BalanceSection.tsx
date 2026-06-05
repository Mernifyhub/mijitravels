// app/components/flight/BalanceSection.tsx
"use client";

import { Loader2, Wallet, CreditCard, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserBalance } from "./types";
import { fmtMoney } from "./helpers";

interface BalanceSectionProps {
  userBalance: UserBalance | null;
  balanceLoading: boolean;
  bookingTotal: number;
  shortfall: number;
  hasSufficientBalance: boolean;
  totalAvailable: number;
  currency: string;
}

export default function BalanceSection({
  userBalance, balanceLoading, bookingTotal,
  shortfall, hasSufficientBalance, totalAvailable, currency,
}: BalanceSectionProps) {
  const router = useRouter();

  return (
    <div className="px-4 pb-4">
      <div className={`rounded-xl border p-3.5 ${
        balanceLoading
          ? "bg-slate-50 border-slate-100"
          : hasSufficientBalance
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}>
        {/* Label + Status */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Your Balance
          </p>
          {!balanceLoading && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              hasSufficientBalance
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}>
              {hasSufficientBalance ? "✓ Sufficient" : "✕ Insufficient"}
            </span>
          )}
        </div>

        {balanceLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-slate-400" />
            <span className="text-xs text-slate-400">Loading balance...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Wallet */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Wallet size={11} /> Wallet
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-800">
                  {fmtMoney(userBalance?.balance || 0, currency)}
                </span>
                {(userBalance?.balance || 0) >= bookingTotal ? (
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">OK</span>
                ) : (
                  <span className="text-[9px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">Low</span>
                )}
              </div>
            </div>

            {/* Credit */}
            {userBalance && userBalance.creditLimit > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <CreditCard size={11} /> Credit
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {fmtMoney(userBalance.availableCredit, currency)}
                  </span>
                  {userBalance.availableCredit >= bookingTotal ? (
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">OK</span>
                  ) : (
                    <span className="text-[9px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">Low</span>
                  )}
                </div>
              </div>
            )}

            {/* Total Available */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Total Available</span>
                <span className={`text-sm font-bold ${
                  hasSufficientBalance ? "text-emerald-700" : "text-red-700"
                }`}>
                  {fmtMoney(totalAvailable, currency)}
                </span>
              </div>
            </div>

            {/* Booking Total */}
            <div className="flex justify-between items-center bg-white rounded-lg px-2.5 py-2 border border-slate-100">
              <span className="text-xs text-slate-500">Booking Total</span>
              <span className="text-sm font-black text-slate-800">
                {fmtMoney(bookingTotal, currency)}
              </span>
            </div>

            {/* Shortfall */}
            {!hasSufficientBalance && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-700">Need More</span>
                <span className="text-sm font-black text-amber-700">
                  {fmtMoney(shortfall, currency)}
                </span>
              </div>
            )}

            {/* Deposit Button */}
            {!hasSufficientBalance && (
              <button
                onClick={() =>
                  router.push(
                    `/user/deposits?amount=${shortfall}&returnUrl=${encodeURIComponent(window.location.href)}`
                  )
                }
                className="w-full mt-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <DollarSign size={12} /> Deposit {fmtMoney(shortfall, currency)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}