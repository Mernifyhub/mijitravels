"use client";

import type { TripType } from "./types";

interface Props {
  tripType: TripType;
  setTripType: (value: TripType) => void;
  cabinClass: string;
  setCabinClass: (value: string) => void;
}

const tripTypes: { id: TripType; label: string }[] = [
  { id: "ONE_WAY", label: "One Way" },
  { id: "ROUND_TRIP", label: "Round Trip" },
  { id: "MULTI_CITY", label: "Multi City" },
];

export default function TripTypeSelector({
  tripType,
  setTripType,
  cabinClass,
  setCabinClass,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-100">
      <div className="flex gap-4">
        {tripTypes.map((type) => (
          <label
            key={type.id}
            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border-2 transition-all ${
              tripType === type.id
                ? "border-[#021f3b] bg-blue-50 text-[#021f3b]"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="tripType"
              checked={tripType === type.id}
              onChange={() => setTripType(type.id)}
              className="hidden"
            />
            <span className="text-sm font-medium">{type.label}</span>
          </label>
        ))}
      </div>

      <div className="ml-auto">
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value)}
          className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full outline-none cursor-pointer hover:bg-gray-200 transition"
        >
          <option>Economy</option>
          <option>Premium Economy</option>
          <option>Business</option>
          <option>First Class</option>
        </select>
      </div>
    </div>
  );
}