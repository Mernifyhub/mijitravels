// app/components/flight/DepositModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, CreditCard, Tag,
  AlertTriangle, DollarSign, ArrowRight, TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UserBalance } from "./types";
import { fmtMoney } from "./helpers";

interface DepositModalProps {
  show: boolean;
  onClose: () => void;
  userBalance: UserBalance | null;
  bookingTotal: number;
  shortfall: number;
  currency: string;
}

export default function DepositModal({
  show, onClose, userBalance,
  bookingTotal, shortfall, currency,
}: DepositModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 to-orange-500 px-6 py-7 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
              </div>
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                  <Wallet size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Insufficient Balance
                </h3>
                <p className="text-red-100 text-sm">
                  You need more funds to complete this booking
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <div className="space-y-2.5 mb-5">
                {/* Wallet */}
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wallet size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        Wallet Balance
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {fmtMoney(userBalance?.balance || 0, currency)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                    (userBalance?.balance || 0) >= bookingTotal
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-red-500 bg-red-50"
                  }`}>
                    {(userBalance?.balance || 0) >= bookingTotal
                      ? "Sufficient" : "Insufficient"}
                  </span>
                </div>

                {/* Credit */}
                {userBalance && userBalance.creditLimit > 0 && (
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard size={14} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          Available Credit
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {fmtMoney(userBalance.availableCredit, currency)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      userBalance.availableCredit >= bookingTotal
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-red-500 bg-red-50"
                    }`}>
                      {userBalance.availableCredit >= bookingTotal
                        ? "Sufficient" : "Insufficient"}
                    </span>
                  </div>
                )}

                {/* Booking Cost */}
                <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Tag size={14} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
                        Booking Cost
                      </p>
                      <p className="text-sm font-bold text-red-700">
                        {fmtMoney(bookingTotal, currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shortfall */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className="text-amber-600" />
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                      Minimum Deposit Needed
                    </p>
                  </div>
                  <p className="text-xl font-bold text-amber-700">
                    {fmtMoney(shortfall, currency)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    onClose();
                    router.push(
                      `/user/deposits?amount=${shortfall}&returnUrl=${encodeURIComponent(window.location.href)}`
                    );
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <DollarSign size={16} /> Deposit Now <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => { onClose(); router.push("/user/deposits"); }}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp size={14} /> Go to Deposit Page
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}