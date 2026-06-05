"use client";

import React from "react";
import { ArrowRightLeft } from "lucide-react";
import AirportInput from "./AirportInput";
import DateInput from "./DateInput";
import SearchButton from "./SearchButton";
import TravelerDropdown from "./TravelerDropdown";
import TrustIndicators from "./TrustIndicators";
import { useAirportSearch } from "./hooks/useAirportSearch";
import type { TripType } from "./types";

interface Props {
  tripType: TripType;
  today: string;
  from: string;
  setFrom: (v: string) => void;
  fromQuery: string;
  setFromQuery: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  toQuery: string;
  setToQuery: (v: string) => void;
  departDate: string;
  setDepartDate: (v: string) => void;
  returnDate: string;
  setReturnDate: (v: string) => void;
  adults: number;
  setAdults: (n: number) => void;
  childs: number;
  setChilds: (n: number) => void;
  infants: number;
  setInfants: (n: number) => void;
  showTravelerDropdown: boolean;
  setShowTravelerDropdown: (b: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onSearch: () => void;
}

export default function OneWayRoundTripForm({
  tripType,
  today,
  from,
  setFrom,
  fromQuery,
  setFromQuery,
  to,
  setTo,
  toQuery,
  setToQuery,
  departDate,
  setDepartDate,
  returnDate,
  setReturnDate,
  adults,
  setAdults,
  childs,
  setChilds,
  infants,
  setInfants,
  showTravelerDropdown,
  setShowTravelerDropdown,
  dropdownRef,
  onSearch,
}: Props) {
  const fromSearch = useAirportSearch();
  const toSearch = useAirportSearch();

  const swapLocations = () => {
    const oldFrom = from;
    const oldFromQuery = fromQuery;
    setFrom(to);
    setFromQuery(toQuery);
    setTo(oldFrom);
    setToQuery(oldFromQuery);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 md:p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* FROM */}
          <AirportInput
            label="From"
            type="from"
            value={fromQuery}
            onChange={(v) => {
              setFrom("");
              setFromQuery(v);
              fromSearch.search(v);
            }}
            suggestions={fromSearch.suggestions}
            onSelect={(loc) => {
              setFrom(loc.iataCode);
              setFromQuery(`${loc.address.cityName} (${loc.iataCode})`);
              fromSearch.clear();
            }}
          />

          {/* SWAP */}
          <div className="flex justify-center lg:pb-0.5">
            <button
              onClick={swapLocations}
              className="bg-[#021f3b] text-white w-10 h-10 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center border-2 border-white"
            >
              <ArrowRightLeft size={16} className="lg:rotate-0 rotate-90" />
            </button>
          </div>

          {/* TO */}
          <AirportInput
            label="To"
            type="to"
            value={toQuery}
            onChange={(v) => {
              setTo("");
              setToQuery(v);
              toSearch.search(v);
            }}
            suggestions={toSearch.suggestions}
            onSelect={(loc) => {
              setTo(loc.iataCode);
              setToQuery(`${loc.address.cityName} (${loc.iataCode})`);
              toSearch.clear();
            }}
          />

          {/* DEPARTURE - normal, no days input */}
          <DateInput
            label="Departure"
            value={departDate}
            onChange={setDepartDate}
            min={today}
            color="green"
          />

          {/* RETURN - with days input */}
          {tripType === "ROUND_TRIP" && (
            <DateInput
              label="Return"
              value={returnDate}
              onChange={setReturnDate}
              min={departDate || today}
              color="orange"
              showDaysInput={true}
              departDate={departDate}
            />
          )}

          {/* TRAVELERS */}
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
              showDropdown={showTravelerDropdown}
              setShowDropdown={setShowTravelerDropdown}
              dropdownRef={dropdownRef}
            />
          </div>
        </div>
      </div>

      <SearchButton label="Search Flights" onClick={onSearch} />
      <TrustIndicators />
    </div>
  );
}