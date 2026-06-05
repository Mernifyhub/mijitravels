// app/user/booking/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle, Loader2, Shield, Wallet, ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Types & Helpers
import { PassengerForm, UserBalance } from "@/app/components/flight/types";
import { defaultPassenger } from "@/app/components/flight/constants";
import { fmtMoney } from "@/app/components/flight/helpers";

// Components
import DepositModal       from "@/app/components/flight/DepositModal";
import BookingNavbar      from "@/app/components/flight/BookingNavbar";
import InsufficientBanner from "@/app/components/flight/InsufficientBanner";
import PassengerCard      from "@/app/components/flight/PassengerCard";
import FlightSummary      from "@/app/components/flight/FlightSummary";
import SuccessScreen      from "@/app/components/flight/SuccessScreen";

// ── Inner component (needs useSearchParams) ──
function BookingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL Params ──
  const flightId      = searchParams.get("flightId")      || "";
  const carrier       = searchParams.get("carrier")       || "";
  const flightNo      = searchParams.get("flightNo")      || "";
  const origin        = searchParams.get("origin")        || "";
  const destination   = searchParams.get("destination")   || "";
  const departure     = searchParams.get("departure")     || "";
  const arrival       = searchParams.get("arrival")       || "";
  const tripType      = searchParams.get("tripType")      || "ONE_WAY";
  const cabinClass    = searchParams.get("cabinClass")    || "Economy";
  const checkedBag    = searchParams.get("checkedBag")    || "Not Included";
  const cabinBag      = searchParams.get("cabinBag")      || "Not Included";
  const checkedBagRaw = searchParams.get("checkedBagRaw") || "0";
  const cabinBagRaw   = searchParams.get("cabinBagRaw")   || "0";
  const refundable    = searchParams.get("refundable")    || "false";
  const changeable    = searchParams.get("changeable")    || "false";
  const refundPenalty = searchParams.get("refundPenalty") || "";
  const changePenalty = searchParams.get("changePenalty") || "";
  const currency      = searchParams.get("currency")      || "SAR";

  const adults   = Number(searchParams.get("adults")   || 1);
  const children = Number(searchParams.get("children") || 0);
  const infants  = Number(searchParams.get("infants")  || 0);

  // ── Fare ──
  const baseFare      = Number(searchParams.get("baseFare")  || 0);
  const taxAmount     = Number(searchParams.get("taxAmount") || 0);
  const promoDiscount = Number(searchParams.get("promoDiscount") || 0);
  const grandTotal    = Math.max(
    0,
    Number(searchParams.get("grandTotal") || searchParams.get("netFare") || 0),
  );
  const customerInvoiceTotal = Number(
    searchParams.get("customerInvoiceTotal") || grandTotal,
  );
  const totalBaseTax = baseFare + taxAmount;
  const totalPax     = adults + children + infants;
  const perPerson    = Math.round(grandTotal / Math.max(totalPax, 1));
  const bookingTotal = grandTotal;

  const segments = JSON.parse(searchParams.get("segments") || "[]");

  // ── States ──
  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const list: PassengerForm[] = [];
    for (let i = 0; i < adults;   i++) list.push(defaultPassenger("ADULT"));
    for (let i = 0; i < children; i++) list.push(defaultPassenger("CHILD"));
    for (let i = 0; i < infants;  i++) list.push(defaultPassenger("INFANT"));
    return list;
  });

  const [expandedIdx,      setExpandedIdx]      = useState(0);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [error,            setError]            = useState("");
  const [success,          setSuccess]          = useState(false);
  const [pnr,              setPnr]              = useState("");
  const [userBalance,      setUserBalance]      = useState<UserBalance | null>(null);
  const [balanceLoading,   setBalanceLoading]   = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const totalAvailable       = userBalance?.totalAvailable ?? 0;
  const hasSufficientBalance = totalAvailable >= bookingTotal;
  const shortfall            = Math.max(0, bookingTotal - totalAvailable);

  // ── Fetch balance ──
  useEffect(() => {
    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        const data = await apiClient("/balance");
        if (data.success) {
          setUserBalance({
            balance:         Number(data.balance        || 0),
            currency:        data.currency              || currency,
            creditLimit:     Number(data.creditLimit    || 0),
            usedLimit:       Number(data.usedLimit      || 0),
            availableCredit: Number(data.availableCredit ?? data.remainingCredit ?? 0),
            totalAvailable:  Number(data.totalAvailable || 0),
          });
        } else {
          setUserBalance({
            balance: 0, currency,
            creditLimit: 0, usedLimit: 0,
            availableCredit: 0, totalAvailable: 0,
          });
        }
      } catch {
        setUserBalance({
          balance: 0, currency,
          creditLimit: 0, usedLimit: 0,
          availableCredit: 0, totalAvailable: 0,
        });
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // ── Update passenger field ──
  const updatePassenger = (
    idx: number,
    field: keyof PassengerForm,
    value: string,
  ) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      // Auto-set title based on gender for adults
      if (field === "gender" && updated[idx].type === "ADULT") {
        updated[idx].title = value === "MALE" ? "MR" : "MRS";
      }
      return updated;
    });
  };

  // ── Validate all passengers ──
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

  // ── Confirm booking ──
  const handleConfirm = async () => {
    setError("");

    if (!hasSufficientBalance) {
      setShowDepositModal(true);
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = await apiClient("/bookings/create", {
        method: "POST",
        body: JSON.stringify({
          flightId, carrier, flightNo,
          origin, destination, departure, arrival, tripType,
          netFare:  bookingTotal,
          baseFare: customerInvoiceTotal,
          currency,
          segments,
          passengers,
          checkedBag, cabinBag, checkedBagRaw, cabinBagRaw,
          refundable, changeable, refundPenalty, changePenalty, cabinClass,
        }),
      });
      setPnr(data.pnr);
      setSuccess(true);
    } catch (err: any) {
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

  // ── Success Screen ──
  if (success) {
    return (
      <SuccessScreen
        pnr={pnr}
        origin={origin}
        destination={destination}
        departure={departure}
        passengers={passengers}
        bookingTotal={bookingTotal}
        currency={currency}
      />
    );
  }

  // ── Main Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-20">

      {/* Deposit Modal */}
      <DepositModal
        show={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        userBalance={userBalance}
        bookingTotal={bookingTotal}
        shortfall={shortfall}
        currency={currency}
      />

      {/* Navbar */}
      <BookingNavbar
        origin={origin}
        destination={destination}
        passengerCount={passengers.length}
        bookingTotal={bookingTotal}
        currency={currency}
        userBalance={userBalance}
        balanceLoading={balanceLoading}
        hasSufficientBalance={hasSufficientBalance}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Insufficient Balance Banner */}
        {!balanceLoading && !hasSufficientBalance && (
          <InsufficientBanner
            userBalance={userBalance}
            bookingTotal={bookingTotal}
            shortfall={shortfall}
            totalAvailable={totalAvailable}
            currency={currency}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Passenger Forms ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">1</span>
                </div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Passenger Info
                </span>
              </div>
              <div className="h-[1px] flex-1 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-400">2</span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Confirm
                </span>
              </div>
            </div>

            {/* Passenger Cards */}
            {passengers.map((pax, idx) => (
              <PassengerCard
                key={idx}
                pax={pax}
                idx={idx}
                totalPassengers={passengers.length}
                adults={adults}
                children={children}
                isExpanded={expandedIdx === idx}
                onToggle={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                onChange={updatePassenger}
                onNext={() => setExpandedIdx(idx + 1)}
              />
            ))}

            {/* Error Message */}
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

            {/* Confirm / Deposit Button */}
            {!balanceLoading && !hasSufficientBalance ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Wallet size={16} />
                  Deposit Now — {fmtMoney(shortfall, currency)} Needed
                  <ArrowRight size={14} />
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

          {/* ── Right: Flight Summary ── */}
          <div>
            <FlightSummary
              origin={origin}
              destination={destination}
              departure={departure}
              tripType={tripType}
              segments={segments}
              adults={adults}
              children={children}
              infants={infants}
              currency={currency}
              baseFare={baseFare}
              taxAmount={taxAmount}
              totalBaseTax={totalBaseTax}
              customerInvoiceTotal={customerInvoiceTotal}
              promoDiscount={promoDiscount}
              grandTotal={grandTotal}
              totalPax={totalPax}
              perPerson={perPerson}
              bookingTotal={bookingTotal}
              shortfall={shortfall}
              hasSufficientBalance={hasSufficientBalance}
              totalAvailable={totalAvailable}
              userBalance={userBalance}
              balanceLoading={balanceLoading}
              checkedBag={checkedBag}
              refundable={refundable}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams-এর জন্য Suspense wrap করতে হবে
export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    }>
      <BookingPageInner />
    </Suspense>
  );
}