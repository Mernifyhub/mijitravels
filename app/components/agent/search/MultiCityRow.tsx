"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import AirportInput from "./AirportInput";
import DateInput from "./DateInput";
import TravelerDropdown from "./TravelerDropdown";
import type { MultiCitySegment } from "./types";

interface Props {
  index: number;
  city: MultiCitySegment;
  totalCities: number;
  minDate: string;
  onUpdate: (index: number, field: keyof MultiCitySegment, value: any) => void;
  onSearchAirport: (
    keyword: string,
    index: number,
    type: "from" | "to"
  ) => void;
  onRemove: (index: number) => void;
  onAddCity: () => void;

  showTravelers?: boolean;
  adults?: number;
  setAdults?: (n: number) => void;
  childs?: number;
  setChilds?: (n: number) => void;
  infants?: number;
  setInfants?: (n: number) => void;
  showTravelerDropdown?: boolean;
  setShowTravelerDropdown?: (b: boolean) => void;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}

export default function MultiCityRow({
  index,
  city,
  totalCities,
  minDate,
  onUpdate,
  onSearchAirport,
  onRemove,
  onAddCity,
  showTravelers,
  adults,
  setAdults,
  childs,
  setChilds,
  infants,
  setInfants,
  showTravelerDropdown,
  setShowTravelerDropdown,
  dropdownRef,
}: Props) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-100 relative">
      <div className="absolute -left-2 top-4 w-7 h-7 bg-[#021f3b] text-white rounded-full flex items-center justify-center text-xs font-black shadow-md z-10">
        {index + 1}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end gap-3 pl-4">
        <AirportInput
          label="From"
          type="from"
          value={city.fromQuery}
          onChange={(value) => {
            onUpdate(index, "from", "");
            onUpdate(index, "fromQuery", value);
            onSearchAirport(value, index, "from");
          }}
          suggestions={city.fromSuggestions}
          onSelect={(loc) => {
            onUpdate(index, "from", loc.iataCode);
            onUpdate(index, "fromQuery", `${loc.address.cityName} (${loc.iataCode})`);
            onUpdate(index, "fromSuggestions", []);
          }}
        />

        <AirportInput
          label="To"
          type="to"
          value={city.toQuery}
          onChange={(value) => {
            onUpdate(index, "to", "");
            onUpdate(index, "toQuery", value);
            onSearchAirport(value, index, "to");
          }}
          suggestions={city.toSuggestions}
          onSelect={(loc) => {
            onUpdate(index, "to", loc.iataCode);
            onUpdate(index, "toQuery", `${loc.address.cityName} (${loc.iataCode})`);
            onUpdate(index, "toSuggestions", []);
          }}
        />

        <DateInput
          label="Date"
          value={city.date}
          onChange={(value) => onUpdate(index, "date", value)}
          min={minDate}
        />

        {showTravelers &&
          adults !== undefined &&
          setAdults &&
          childs !== undefined &&
          setChilds &&
          infants !== undefined &&
          setInfants &&
          setShowTravelerDropdown &&
          dropdownRef && (
            <div className="flex-1 min-w-0 lg:max-w-[220px]">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Travelers
              </label>

              <TravelerDropdown
                adults={adults}
                setAdults={setAdults}
                childs={childs}
                setChilds={setChilds}
                infants={infants}
                setInfants={setInfants}
                showDropdown={!!showTravelerDropdown}
                setShowDropdown={setShowTravelerDropdown}
                dropdownRef={dropdownRef}
              />
            </div>
          )}

        <div className="flex items-center gap-2 lg:pb-1">
          {index > 0 && (
            <button
              onClick={() => onRemove(index)}
              className="w-11 h-11 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
          )}

          {index === totalCities - 1 && totalCities < 5 && (
            <button
              onClick={onAddCity}
              className="flex items-center gap-2 px-4 h-11 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm shadow-md"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add City</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}