"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import {
  Plane, CreditCard, ChevronDown,
  ArrowRight, ArrowLeft, Check, AlertCircle, Loader2,
  User, Baby, Shield, Clock, Luggage, CheckCircle2,
  Wallet, AlertTriangle, DollarSign, TrendingUp, Tag,
} from "lucide-react";

// ==================== TYPES ====================
interface PassengerForm {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  type: "ADULT" | "CHILD" | "INFANT";
}

interface UserBalance {
  balance: number;
  currency: string;
  creditLimit: number;
  usedLimit: number;
  availableCredit: number;
  totalAvailable: number;
}

const defaultPassenger = (type: "ADULT" | "CHILD" | "INFANT"): PassengerForm => ({
  title: "", firstName: "", lastName: "", gender: "",
  dateOfBirth: "", nationality: "", passportNumber: "",
  passportExpiry: "", email: "", phone: "", type,
});

const TITLES = {
  ADULT: ["MR", "MRS", "MS"],
  CHILD: ["MSTR", "MISS"],
  INFANT: ["INF"],
};

const NATIONALITIES = [
  "Saudi Arabian", "Bangladeshi", "Pakistani", "Indian", "Filipino",
  "Egyptian", "Yemeni", "Syrian", "Jordanian", "Lebanese",
  "British", "American", "Canadian", "Australian", "German",
  "French", "Emirati", "Kuwaiti", "Qatari", "Bahraini",
];

// ==================== FORMAT HELPERS ====================
const formatTime = (dt: string) =>
  new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

const formatDate = (dt: string) =>
  new Date(dt).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });

const formatDuration = (dur: string) => {
  const h = dur.match(/(\d+)H/)?.[1] || "0";
  const m = dur.match(/(\d+)M/)?.[1] || "0";
  return `${h}h ${m}m`;
};

const fmtMoney = (amount: number, currency: string) =>
  `${currency} ${Math.round(amount).toLocaleString()}`;

// ==================== MAIN ====================
export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Flight info from URL ──
  const flightId     = searchParams.get("flightId") || "";
  const carrier      = searchParams.get("carrier") || "";
  const flightNo     = searchParams.get("flightNo") || "";
  const origin       = searchParams.get("origin") || "";
  const destination  = searchParams.get("destination") || "";
  const departure    = searchParams.get("departure") || "";
  const arrival      = searchParams.get("arrival") || "";
  const tripType     = searchParams.get("tripType") || "ONE_WAY";
  const cabinClass   = searchParams.get("cabinClass") || "Economy";
  const checkedBag   = searchParams.get("checkedBag") || "Not Included";
  const cabinBag     = searchParams.get("cabinBag") || "Not Included";
  const checkedBagRaw = searchParams.get("checkedBagRaw") || "0";
  const cabinBagRaw  = searchParams.get("cabinBagRaw") || "0";
  const refundable   = searchParams.get("refundable") || "false";
  const changeable   = searchParams.get("changeable") || "false";
  const refundPenalty = searchParams.get("refundPenalty") || "";
  const changePenalty = searchParams.get("changePenalty") || "";

  const adults   = Number(searchParams.get("adults") || 1);
  const children = Number(searchParams.get("children") || 0);
  const infants  = Number(searchParams.get("infants") || 0);

  // ── Fare from URL — backend already computed ──
  const currency      = searchParams.get("currency") || "SAR";
  const baseFare      = Number(searchParams.get("baseFare") || 0);
  const taxAmount     = Number(searchParams.get("taxAmount") || 0);
  const promoDiscount = Number(searchParams.get("promoDiscount") || 0);
  const grandTotal    = Math.max(
    0,
    Number(searchParams.get("grandTotal") ||
      searchParams.get("netFare") || 0)
  );
  const customerInvoiceTotal = Number(
    searchParams.get("customerInvoiceTotal") || grandTotal
  );
  const totalBaseTax = baseFare + taxAmount;
  const totalPax     = adults + children + infants;
  const perPerson    = Math.round(grandTotal / Math.max(totalPax, 1));

  const bookingTotal = grandTotal; // single source of truth

  // ── Segments ──
  const segments = JSON.parse(searchParams.get("segments") || "[]");

  // ==================== STATE ====================
  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const list: PassengerForm[] = [];
    for (let i = 0; i < adults; i++) list.push(defaultPassenger("ADULT"));
    for (let i = 0; i < children; i++) list.push(defaultPassenger("CHILD"));
    for (let i = 0; i < infants; i++) list.push(defaultPassenger("INFANT"));
    return list;
  });

  const [expandedIdx, setExpandedIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pnr, setPnr] = useState("");

  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // ── Simple balance check — backend is final authority ──
  const totalAvailable = userBalance?.totalAvailable ?? 0;
  const hasSufficientBalance = totalAvailable >= bookingTotal;
  const shortfall = Math.max(0, bookingTotal - totalAvailable);

  // ==================== FETCH BALANCE ====================
  useEffect(() => {
    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        const data = await apiClient("/balance");
        if (data.success) {
          setUserBalance({
            balance:        Number(data.balance || 0),
            currency:       data.currency || currency,
            creditLimit:    Number(data.creditLimit || 0),
            usedLimit:      Number(data.usedLimit || 0),
            availableCredit: Number(data.availableCredit ?? data.remainingCredit ?? 0),
            totalAvailable: Number(data.totalAvailable || 0),
          });
        } else {
          setUserBalance({
            balance: 0, currency, creditLimit: 0,
            usedLimit: 0, availableCredit: 0, totalAvailable: 0,
          });
        }
      } catch {
        setUserBalance({
          balance: 0, currency, creditLimit: 0,
          usedLimit: 0, availableCredit: 0, totalAvailable: 0,
        });
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // ==================== HELPERS ====================
  const updatePassenger = (
    idx: number,
    field: keyof PassengerForm,
    value: string,
  ) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "gender" && updated[idx].type === "ADULT") {
        updated[idx].title = value === "MALE" ? "MR" : "MRS";
      }
      return updated;
    });
  };

  const validate = (): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (
        !p.title || !p.firstName || !p.lastName ||
        !p.gender || !p.dateOfBirth || !p.nationality
      ) {
        setError(`Please fill all required fields for passenger ${i + 1}`);
        setExpandedIdx(i);
        return false;
      }
    }
    return true;
  };

  // ==================== CONFIRM ====================
  const handleConfirm = async () => {
    setError("");

    // simple UI pre-check — backend is final
    if (!hasSufficientBalance) {
      setShowDepositModal(true);
      return;
    }

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        flightId, carrier, flightNo,
        origin, destination, departure, arrival, tripType,
        // ✅ backend already computed values
        netFare:   bookingTotal,
        baseFare:  customerInvoiceTotal,
        currency,
        segments,
        passengers,
        checkedBag, cabinBag, checkedBagRaw, cabinBagRaw,
        refundable, changeable, refundPenalty, changePenalty, cabinClass,
      };

      const data = await apiClient("/bookings/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setPnr(data.pnr);
      setSuccess(true);
    } catch (err: any) {
      console.error("Booking error:", err?.message);
      if (
        String(err?.message).includes("INSUFFICIENT") ||
        String(err?.message).includes("402")
      ) {
        setShowDepositModal(true);
        return;
      }
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== SUCCESS ====================
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm mb-6">Your booking has been successfully created.</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Your PNR</p>
            <p className="text-4xl font-bold text-blue-700 tracking-[0.25em] font-mono">{pnr}</p>
            <p className="text-[11px] text-slate-400 mt-2">Please save this reference number</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            {[
              { label: "Route", value: `${origin} → ${destination}` },
              { label: "Departure", value: formatDate(departure) },
              { label: "Passengers", value: `${passengers.length} Pax` },
              { label: "Total Fare", value: fmtMoney(bookingTotal, currency), highlight: true },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-sm font-bold ${(item as any).highlight ? "text-blue-700" : "text-slate-700"}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

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

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-20">

      {/* DEPOSIT MODAL */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowDepositModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-red-500 to-orange-500 px-6 py-7 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
                </div>
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                    <Wallet size={28} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Insufficient Balance</h3>
                  <p className="text-red-100 text-sm">You need more funds to complete this booking</p>
                </div>
              </div>

              <div className="px-5 py-5">
                <div className="space-y-2.5 mb-5">
                  {/* Wallet */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wallet size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Wallet Balance</p>
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
                      {(userBalance?.balance || 0) >= bookingTotal ? "Sufficient" : "Insufficient"}
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
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Available Credit</p>
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
                        {userBalance.availableCredit >= bookingTotal ? "Sufficient" : "Insufficient"}
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
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Booking Cost</p>
                        <p className="text-sm font-bold text-red-700">{fmtMoney(bookingTotal, currency)}</p>
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
                    <p className="text-xl font-bold text-amber-700">{fmtMoney(shortfall, currency)}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      router.push(`/user/deposits?amount=${shortfall}&returnUrl=${encodeURIComponent(window.location.href)}`);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <DollarSign size={16} /> Deposit Now <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => { setShowDepositModal(false); router.push("/user/deposits"); }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={14} /> Go to Deposit Page
                  </button>
                  <button
                    onClick={() => setShowDepositModal(false)}
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

      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#0B1D35] via-[#122B4D] to-[#0B1D35] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-wide">Complete Booking</h1>
            <p className="text-[11px] text-blue-300">
              {origin} → {destination} · {passengers.length} Passenger{passengers.length > 1 ? "s" : ""}
            </p>
          </div>
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
                  <span className="opacity-60">/ CR {fmtMoney(userBalance.availableCredit, currency)}</span>
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

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* INSUFFICIENT BALANCE BANNER */}
        {!balanceLoading && !hasSufficientBalance && (
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
                  Wallet: <span className="font-bold">{fmtMoney(userBalance?.balance || 0, currency)}</span>
                  {userBalance && userBalance.creditLimit > 0 && (
                    <> · Credit: <span className="font-bold">{fmtMoney(userBalance.availableCredit, currency)}</span></>
                  )}
                  · Total: <span className="font-bold">{fmtMoney(totalAvailable, currency)}</span>
                  · Need: <span className="font-bold">{fmtMoney(shortfall, currency)}</span> more.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/user/deposits?amount=${shortfall}&returnUrl=${encodeURIComponent(window.location.href)}`)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center gap-2 flex-shrink-0"
            >
              <DollarSign size={14} /> Deposit Now
            </button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT: PASSENGER FORMS */}
          <div className="lg:col-span-2 space-y-4">

            {/* Steps */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">1</span>
                </div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Passenger Info</span>
              </div>
              <div className="h-[1px] flex-1 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-400">2</span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirm</span>
              </div>
            </div>

            {/* Passenger Cards */}
            {passengers.map((pax, idx) => {
              const isExpanded = expandedIdx === idx;
              const paxLabel =
                pax.type === "ADULT" ? `Adult ${idx + 1}`
                : pax.type === "CHILD" ? `Child ${idx - adults + 1}`
                : `Infant ${idx - adults - children + 1}`;
              const isComplete =
                pax.title && pax.firstName && pax.lastName &&
                pax.gender && pax.dateOfBirth && pax.nationality;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        pax.type === "ADULT" ? "bg-blue-100 text-blue-600"
                        : pax.type === "CHILD" ? "bg-amber-100 text-amber-600"
                        : "bg-pink-100 text-pink-600"
                      }`}>
                        {pax.type === "INFANT" ? <Baby size={18} /> : <User size={18} />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">{paxLabel}</p>
                        {pax.firstName
                          ? <p className="text-xs text-blue-600 font-medium mt-0.5">{pax.title} {pax.firstName} {pax.lastName}</p>
                          : <p className="text-xs text-slate-400 mt-0.5">Click to fill details</p>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-slate-100">
                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">

                            {/* Title */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                                Title <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2 flex-wrap">
                                {TITLES[pax.type].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => updatePassenger(idx, "title", t)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                                      pax.title === t
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-slate-100 text-slate-500 hover:border-blue-200"
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Gender */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                                Gender <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
                                {["MALE", "FEMALE"].map((g) => (
                                  <button
                                    key={g}
                                    onClick={() => updatePassenger(idx, "gender", g)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                                      pax.gender === g
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-slate-100 text-slate-500 hover:border-blue-200"
                                    }`}
                                  >
                                    {g === "MALE" ? "♂ Male" : "♀ Female"}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* First Name */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                                First Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={pax.firstName}
                                onChange={(e) => updatePassenger(idx, "firstName", e.target.value.toUpperCase())}
                                placeholder="As per passport"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                              />
                            </div>

                            {/* Last Name */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                                Last Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={pax.lastName}
                                onChange={(e) => updatePassenger(idx, "lastName", e.target.value.toUpperCase())}
                                placeholder="As per passport"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                              />
                            </div>

                            {/* DOB */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={pax.dateOfBirth}
                                onChange={(e) => updatePassenger(idx, "dateOfBirth", e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer"
                              />
                            </div>

                            {/* Nationality */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">
                                Nationality <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={pax.nationality}
                                onChange={(e) => updatePassenger(idx, "nationality", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer bg-white"
                              >
                                <option value="">Select nationality</option>
                                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>

                            {/* Passport */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">Passport Number</label>
                              <input
                                type="text"
                                value={pax.passportNumber}
                                onChange={(e) => updatePassenger(idx, "passportNumber", e.target.value.toUpperCase())}
                                placeholder="e.g. A12345678"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                              />
                            </div>

                            {/* Passport Expiry */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-2">Passport Expiry</label>
                              <input
                                type="date"
                                value={pax.passportExpiry}
                                onChange={(e) => updatePassenger(idx, "passportExpiry", e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer"
                              />
                            </div>

                            {/* Email */}
                            {idx === 0 && (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-2">Email</label>
                                <input
                                  type="email"
                                  value={pax.email}
                                  onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                                  placeholder="email@example.com"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                                />
                              </div>
                            )}

                            {/* Phone */}
                            {idx === 0 && (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-2">Phone</label>
                                <input
                                  type="tel"
                                  value={pax.phone}
                                  onChange={(e) => updatePassenger(idx, "phone", e.target.value)}
                                  placeholder="+966 5XX XXX XXXX"
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                                />
                              </div>
                            )}
                          </div>

                          {idx < passengers.length - 1 && (
                            <button
                              onClick={() => setExpandedIdx(idx + 1)}
                              className="mt-4 w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-xl text-xs font-semibold text-blue-600 transition-all flex items-center justify-center gap-1.5"
                            >
                              Next Passenger <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Confirm / Deposit button */}
            {!balanceLoading && !hasSufficientBalance ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Wallet size={16} /> Deposit Now — {fmtMoney(shortfall, currency)} Needed <ArrowRight size={14} />
                </button>
                <p className="text-center text-xs text-slate-400">
                  Your current balance & credit are insufficient. Please deposit to proceed.
                </p>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || balanceLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-blue-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : balanceLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Checking Balance...</>
                ) : (
                  <><Shield size={15} /> Confirm Booking <ArrowRight size={14} /></>
                )}
              </button>
            )}
          </div>

          {/* RIGHT: FLIGHT SUMMARY */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-20">

              {/* Flight Header */}
              <div className="bg-gradient-to-r from-[#0B1D35] via-[#15294A] to-[#0B1D35] px-5 py-4">
                <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wide mb-1">Flight Summary</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">{origin}</span>
                  <Plane size={14} className="text-blue-400 rotate-90" />
                  <span className="text-xl font-bold text-white">{destination}</span>
                </div>
                <p className="text-xs text-blue-300 mt-1">
                  {formatDate(departure)} · {tripType === "ROUND_TRIP" ? "Round Trip" : "One Way"}
                </p>
              </div>

              {/* Segments */}
              <div className="p-4 space-y-3">
                {segments.map((seg: any, i: number) => (
                  <div key={i} className={i !== 0 ? "pt-3 border-t border-dashed border-slate-100" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={`https://pics.avs.io/80/80/${seg.airline}.png`}
                            alt={seg.airline}
                            className="w-5 h-5 object-contain"
                            onError={(e) => { e.currentTarget.src = ""; }}
                          />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{seg.airline} {seg.flightNo}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                        {formatDuration(seg.duration || "PT0H0M")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="text-base font-bold text-slate-800">{formatTime(seg.departure)}</p>
                        <p className="text-xs font-semibold text-blue-600">{seg.from}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(seg.departure)}</p>
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-blue-200" />
                        <Plane size={9} className="text-blue-400 rotate-90 flex-shrink-0" />
                        <div className="h-[1px] flex-1 bg-slate-200" />
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-slate-800">{formatTime(seg.arrival)}</p>
                        <p className="text-xs font-semibold text-blue-600">{seg.to}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(seg.arrival)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Passengers */}
              <div className="px-4 pb-4">
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Passengers</p>
                  <div className="space-y-1.5">
                    {adults > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-600">Adults</span>
                        <span className="text-xs font-bold text-slate-800">×{adults}</span>
                      </div>
                    )}
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-600">Children</span>
                        <span className="text-xs font-bold text-slate-800">×{children}</span>
                      </div>
                    )}
                    {infants > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-600">Infants</span>
                        <span className="text-xs font-bold text-slate-800">×{infants}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Balance Section */}
              <div className="px-4 pb-4">
                <div className={`rounded-xl border p-3.5 ${
                  balanceLoading ? "bg-slate-50 border-slate-100"
                  : hasSufficientBalance ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Your Balance</p>
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
                          {(userBalance?.balance || 0) >= bookingTotal
                            ? <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">OK</span>
                            : <span className="text-[9px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">Low</span>
                          }
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
                            {userBalance.availableCredit >= bookingTotal
                              ? <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">OK</span>
                              : <span className="text-[9px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">Low</span>
                            }
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

                      {/* Booking total */}
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

                      {/* Deposit button */}
                      {!hasSufficientBalance && (
                        <button
                          onClick={() => router.push(
                            `/user/deposits?amount=${shortfall}&returnUrl=${encodeURIComponent(window.location.href)}`
                          )}
                          className="w-full mt-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                          <DollarSign size={12} /> Deposit {fmtMoney(shortfall, currency)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100">
                <div className="px-4 py-3.5 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Price Breakdown
                  </p>

                  {adults > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Adult × {adults}</span>
                      <span className="text-xs font-bold text-slate-800">{fmtMoney(totalBaseTax, currency)}</span>
                    </div>
                  )}
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Child × {children}</span>
                      <span className="text-xs font-bold text-slate-800">Included</span>
                    </div>
                  )}
                  {infants > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Infant × {infants}</span>
                      <span className="text-xs font-bold text-slate-800">Included</span>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-1" />

                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Base Fare</span>
                    <span className="text-xs font-bold text-slate-800">{fmtMoney(baseFare, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Tax & Fee</span>
                    <span className="text-xs font-bold text-slate-800">{fmtMoney(taxAmount, currency)}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-1" />

                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-slate-600">Total Base & Tax</span>
                    <span className="text-xs font-bold text-slate-800">{fmtMoney(totalBaseTax, currency)}</span>
                  </div>

                  <div className="flex justify-between bg-blue-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs font-semibold text-blue-700">Customer Invoice Total</span>
                    <span className="text-xs font-bold text-blue-800">{fmtMoney(customerInvoiceTotal, currency)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between bg-emerald-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-xs font-semibold text-emerald-700">Discount</span>
                      <span className="text-xs font-bold text-emerald-700">− {fmtMoney(promoDiscount, currency)}</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-3 py-2.5 mt-1">
                    <div>
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Grand Total</p>
                      <p className="text-[9px] text-blue-300">{totalPax} Pax · {currency}</p>
                    </div>
                    <span className="text-base font-black text-white">{fmtMoney(grandTotal, currency)}</span>
                  </div>

                  {totalPax > 1 && (
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] text-slate-400">Per Person</span>
                      <span className="text-[10px] font-bold text-slate-500">{fmtMoney(perPerson, currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Policies */}
              <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                <div className="space-y-2">
                  {[
                    {
                      icon: <Luggage size={11} />,
                      label: checkedBag !== "Not Included" ? `${checkedBag} Baggage` : "No Check-in Bag",
                      color: checkedBag !== "Not Included" ? "blue" : "red",
                    },
                    {
                      icon: <Shield size={11} />,
                      label: refundable === "true" ? "Refundable" : "Non-Refundable",
                      color: refundable === "true" ? "emerald" : "red",
                    },
                    { icon: <Clock size={11} />, label: "Free Hold for 24hrs", color: "amber" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        item.color === "blue" ? "bg-blue-50 text-blue-500"
                        : item.color === "emerald" ? "bg-emerald-50 text-emerald-500"
                        : item.color === "amber" ? "bg-amber-50 text-amber-500"
                        : "bg-red-50 text-red-500"
                      }`}>
                        {item.icon}
                      </div>
                      <span className="text-xs text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}