"use client";

import React from "react";
import { apiClient } from "@/lib/api";
import MultiCityRow from "./MultiCityRow";
import SearchButton from "./SearchButton";
import TrustIndicators from "./TrustIndicators";
import type { MultiCitySegment } from "./types";

interface Props {
  multiCity: MultiCitySegment[];
  setMultiCity: React.Dispatch<React.SetStateAction<MultiCitySegment[]>>;
  today: string;

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

export default function MultiCityForm({
  multiCity,
  setMultiCity,
  today,
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
  const updateMultiCity = (
    index: number,
    field: keyof MultiCitySegment,
    value: any
  ) => {
    setMultiCity((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const searchMultiCityAirport = async (
    keyword: string,
    index: number,
    type: "from" | "to"
  ) => {
    if (!keyword || keyword.trim().length < 2) {
      updateMultiCity(index, type === "from" ? "fromSuggestions" : "toSuggestions", []);
      return;
    }

    try {
      const data = await apiClient(
        `/flights/location?keyword=${encodeURIComponent(keyword)}`
      );

      updateMultiCity(
        index,
        type === "from" ? "fromSuggestions" : "toSuggestions",
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Multi-city airport search error:", error);
      updateMultiCity(index, type === "from" ? "fromSuggestions" : "toSuggestions", []);
    }
  };

  const addCity = () => {
    if (multiCity.length >= 5) return;

    const lastCity = multiCity[multiCity.length - 1];

    setMultiCity((prev) => [
      ...prev,
      {
        from: lastCity.to,
        fromQuery: lastCity.toQuery,
        to: "",
        toQuery: "",
        date: "",
        fromSuggestions: [],
        toSuggestions: [],
      },
    ]);
  };

  const removeCity = (index: number) => {
    setMultiCity((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {multiCity.map((city, index) => (
        <MultiCityRow
          key={index}
          index={index}
          city={city}
          totalCities={multiCity.length}
          minDate={index === 0 ? today : multiCity[index - 1]?.date || today}
          onUpdate={updateMultiCity}
          onSearchAirport={searchMultiCityAirport}
          onRemove={removeCity}
          onAddCity={addCity}
          showTravelers={index === 0}
          adults={adults}
          setAdults={setAdults}
          childs={childs}
          setChilds={setChilds}
          infants={infants}
          setInfants={setInfants}
          showTravelerDropdown={showTravelerDropdown}
          setShowTravelerDropdown={setShowTravelerDropdown}
          dropdownRef={dropdownRef}
        />
      ))}

      <div className="pt-4">
        <SearchButton label="Search Multi-City Flights" onClick={onSearch} />
      </div>

      <TrustIndicators
        items={[
          { label: "Best Price Guarantee", color: "green" },
          { label: "500+ Airlines", color: "blue" },
        ]}
      />
    </div>
  );
}