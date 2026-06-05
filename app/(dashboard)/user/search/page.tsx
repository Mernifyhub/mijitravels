"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AgentTopBar from "@/app/components/agent/AgentTopBar";
import {
  GroupFareTab,
  HeroSection,
  MultiCityForm,
  OneWayRoundTripForm,
  PnrImportTab,
  SearchTabs,
  TripTypeSelector,
} from "@/app/components/agent/search";
import type {
  ActiveTab,
  MultiCitySegment,
  TripType,
} from "@/app/components/agent/search/types";

export default function FlightSearchPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState<ActiveTab>("SEARCH");
  const [tripType, setTripType] = useState<TripType>("ONE_WAY");
  const [cabinClass, setCabinClass] = useState("Economy");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [multiCity, setMultiCity] = useState<MultiCitySegment[]>([
    {
      from: "",
      fromQuery: "",
      to: "",
      toQuery: "",
      date: "",
      fromSuggestions: [],
      toSuggestions: [],
    },
  ]);

  // ✅ Traveler state direct page-এ
  const [adults, setAdults] = useState(1);
  const [childs, setChilds] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // outside click close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTravelerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!from || !to || !departDate) {
      alert("Please select departure city, destination and date.");
      return;
    }

    if (tripType === "ROUND_TRIP" && !returnDate) {
      alert("Please select a return date for Round Trip.");
      return;
    }

    const params = new URLSearchParams({
      tripType,
      origin: from,
      destination: to,
      departureDate: departDate,
      returnDate: tripType === "ROUND_TRIP" ? returnDate : "",
      adults: adults.toString(),
      children: childs.toString(),
      infants: infants.toString(),
      travelClass: cabinClass.toUpperCase().replace(/\s+/g, "_"),
    }).toString();

    router.push(`/user/search-results?${params}`);
  };

  const handleMultiCitySearch = () => {
    const isValid = multiCity.every((item) => item.from && item.to && item.date);

    if (!isValid) {
      alert("Please fill in all locations and dates for Multi-City search.");
      return;
    }

    const params = new URLSearchParams({
      tripType: "MULTI_CITY",
      segments: JSON.stringify(
        multiCity.map((item) => ({
          origin: item.from,
          destination: item.to,
          departureDate: item.date,
        }))
      ),
      adults: adults.toString(),
      children: childs.toString(),
      infants: infants.toString(),
      travelClass: cabinClass.toUpperCase().replace(/\s+/g, "_"),
    }).toString();

    router.push(`/user/search-results?${params}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="sticky top-0 z-50">
        <AgentTopBar />
      </div>

      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 pb-10">
        <SearchTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "SEARCH" && (
          <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
            <TripTypeSelector
              tripType={tripType}
              setTripType={setTripType}
              cabinClass={cabinClass}
              setCabinClass={setCabinClass}
            />

            {tripType !== "MULTI_CITY" ? (
              <OneWayRoundTripForm
                tripType={tripType}
                today={today}
                from={from}
                setFrom={setFrom}
                fromQuery={fromQuery}
                setFromQuery={setFromQuery}
                to={to}
                setTo={setTo}
                toQuery={toQuery}
                setToQuery={setToQuery}
                departDate={departDate}
                setDepartDate={setDepartDate}
                returnDate={returnDate}
                setReturnDate={setReturnDate}
                adults={adults}
                setAdults={setAdults}
                childs={childs}
                setChilds={setChilds}
                infants={infants}
                setInfants={setInfants}
                showTravelerDropdown={showTravelerDropdown}
                setShowTravelerDropdown={setShowTravelerDropdown}
                dropdownRef={dropdownRef}
                onSearch={handleSearch}
              />
            ) : (
              <MultiCityForm
                multiCity={multiCity}
                setMultiCity={setMultiCity}
                today={today}
                adults={adults}
                setAdults={setAdults}
                childs={childs}
                setChilds={setChilds}
                infants={infants}
                setInfants={setInfants}
                showTravelerDropdown={showTravelerDropdown}
                setShowTravelerDropdown={setShowTravelerDropdown}
                dropdownRef={dropdownRef}
                onSearch={handleMultiCitySearch}
              />
            )}
          </div>
        )}

        {activeTab === "PNR" && <PnrImportTab />}
        {activeTab === "GROUP" && <GroupFareTab />}
      </div>

      <div className="flex-1" />
    </div>
  );
}