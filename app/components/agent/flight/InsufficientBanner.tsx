// app/components/flight/InsufficientBanner.tsx
"use client";

import { motion } from "framer-motion";
import { AlertTriangle, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserBalance } from "./types";
import { fmtMoney } from "./helpers";

interface InsufficientBannerProps {
  userBalance: UserBalance | null;
  bookingTotal: number;
  shortfall: number;
  totalAvailable: number;
  currency: string;
}

export default function InsufficientBanner({
  userBalance, bookingTotal, shortfall, totalAvailable, currency,
}: InsufficientBannerProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-800">Insufficient Balance</p>
          <p className="text-xs text-red-600 mt-0.5">
            Wallet:{" "}
            <span className="font-bold">
              {fmtMoney(userBalance?.balance || 0, currency)}
            </span>
            {userBalance && userBalance.creditLimit > 0 && (
              <>
                {" "}· Credit:{" "}
                <span className="font-bold">
                  {fmtMoney(userBalance.availableCredit, currency)}
                </span>
              </>
            )}
            {" "}· Total:{" "}
            <span className="font-bold">{fmtMoney(totalAvailable, currency)}</span>
            {" "}· Need:{" "}
            <span className="font-bold">{fmtMoney(shortfall, currency)}</span> more.
          </p>
        </div>
      </div>
      <button
        onClick={() =>
          router.push(
            `/user/deposits?amount=${shortfall}&returnUrl=${encodeURIComponent(window.location.href)}`
          )
        }
        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 flex-shrink-0"
      >
        <DollarSign size={14} /> Deposit Now
      </button>
    </motion.div>
  );
}