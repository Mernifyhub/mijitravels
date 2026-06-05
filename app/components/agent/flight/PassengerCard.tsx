// app/components/flight/PassengerCard.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, Baby, Check } from "lucide-react";
import { PassengerForm } from "./types";
import PassengerFormFields from "./PassengerForm";

interface PassengerCardProps {
  pax: PassengerForm;
  idx: number;
  totalPassengers: number;
  adults: number;
  children: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (idx: number, field: keyof PassengerForm, value: string) => void;
  onNext: () => void;
}

export default function PassengerCard({
  pax, idx, totalPassengers, adults, children,
  isExpanded, onToggle, onChange, onNext,
}: PassengerCardProps) {
  // Passenger label
  const paxLabel =
    pax.type === "ADULT"  ? `Adult ${idx + 1}`
    : pax.type === "CHILD"  ? `Child ${idx - adults + 1}`
    : `Infant ${idx - adults - children + 1}`;

  // Check if all required fields filled
  const isComplete =
    pax.title && pax.firstName && pax.lastName &&
    pax.gender && pax.dateOfBirth && pax.nationality;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Card Header Toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            pax.type === "ADULT"  ? "bg-blue-100 text-blue-600"
            : pax.type === "CHILD"  ? "bg-amber-100 text-amber-600"
            : "bg-pink-100 text-pink-600"
          }`}>
            {pax.type === "INFANT" ? <Baby size={18} /> : <User size={18} />}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{paxLabel}</p>
            {pax.firstName ? (
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {pax.title} {pax.firstName} {pax.lastName}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Click to fill details</p>
            )}
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
            className={`text-slate-400 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expandable Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <PassengerFormFields
              pax={pax}
              idx={idx}
              totalPassengers={totalPassengers}
              onChange={onChange}
              onNext={onNext}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}