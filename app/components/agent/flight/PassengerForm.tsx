// app/components/flight/PassengerForm.tsx
"use client";

import { ArrowRight } from "lucide-react";
import { PassengerForm as PassengerFormType } from "./types";
import { TITLES, NATIONALITIES } from "./constants";

interface PassengerFormFieldsProps {
  pax: PassengerFormType;
  idx: number;
  totalPassengers: number;
  onChange: (idx: number, field: keyof PassengerFormType, value: string) => void;
  onNext: () => void;
}

export default function PassengerFormFields({
  pax, idx, totalPassengers, onChange, onNext,
}: PassengerFormFieldsProps) {
  return (
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
                onClick={() => onChange(idx, "title", t)}
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
                onClick={() => onChange(idx, "gender", g)}
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
            onChange={(e) => onChange(idx, "firstName", e.target.value.toUpperCase())}
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
            onChange={(e) => onChange(idx, "lastName", e.target.value.toUpperCase())}
            placeholder="As per passport"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={pax.dateOfBirth}
            onChange={(e) => onChange(idx, "dateOfBirth", e.target.value)}
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
            onChange={(e) => onChange(idx, "nationality", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer bg-white"
          >
            <option value="">Select nationality</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Passport Number */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-2">
            Passport Number
          </label>
          <input
            type="text"
            value={pax.passportNumber}
            onChange={(e) => onChange(idx, "passportNumber", e.target.value.toUpperCase())}
            placeholder="e.g. A12345678"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
          />
        </div>

        {/* Passport Expiry */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-2">
            Passport Expiry
          </label>
          <input
            type="date"
            value={pax.passportExpiry}
            onChange={(e) => onChange(idx, "passportExpiry", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer"
          />
        </div>

        {/* Email — first passenger only */}
        {idx === 0 && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={pax.email}
              onChange={(e) => onChange(idx, "email", e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
            />
          </div>
        )}

        {/* Phone — first passenger only */}
        {idx === 0 && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={pax.phone}
              onChange={(e) => onChange(idx, "phone", e.target.value)}
              placeholder="+966 5XX XXX XXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all"
            />
          </div>
        )}
      </div>

      {/* Next Passenger Button */}
      {idx < totalPassengers - 1 && (
        <button
          onClick={onNext}
          className="mt-4 w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-xl text-xs font-semibold text-blue-600 transition-all flex items-center justify-center gap-1.5"
        >
          Next Passenger <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}