"use client";

import { useState, useRef, useEffect } from "react";
import { PlaneTakeoff,PlaneLanding,CalendarDays,Users, Plus,Minus,Trash2,Search,FileInput,UsersRound,ChevronDown,ArrowRightLeft,Plane,User,Baby,X,} from "lucide-react";
import { useRouter } from "next/navigation";
import AgentTopBar from "@/app/components/agent/AgentTopBar";
import { apiClient } from "@/lib/api";

export default function FlightSearchPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState("SEARCH");
  const [tripType, setTripType] = useState("ONE_WAY");
  const [multiCity, setMultiCity] = useState([
    {
      from: "",
      fromQuery: "",
      to: "",
      toQuery: "",
      date: "",
      fromSuggestions: [] as any[],
      toSuggestions: [] as any[],
    },
  ]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("Economy");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ━━━━ Airport Search (One Way / Round Trip) ━━━━
  const searchCity = async (keyword: string, type: "from" | "to") => {
    if (!keyword || keyword.trim().length < 2) {
      if (type === "from") {
        setFromSuggestions([]);
      } else {
        setToSuggestions([]);
      }
      return;
    }

    try {
      const data = await apiClient(
        `/flights/location?keyword=${encodeURIComponent(keyword)}`,
      );

      if (type === "from") {
        setFromSuggestions(Array.isArray(data) ? data : []);
      } else {
        setToSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("API Error:", err);

      if (type === "from") {
        setFromSuggestions([]);
      } else {
        setToSuggestions([]);
      }
    }
  };

  // ━━━━ One Way / Round Trip Search ━━━━
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
      children: children.toString(),
      infants: infants.toString(),
      travelClass: cabinClass.toUpperCase().replace(" ", "_"),
    }).toString();
    router.push(`/user/search-results?${params}`);
  };

  // ━━━━ Multi City Search ━━━━
  const handleMultiCitySearch = () => {
    const isValid = multiCity.every(
      (item) => item.from && item.to && item.date,
    );
    if (!isValid) {
      alert("Please fill in all locations and dates for Multi-City search.");
      return;
    }
    const params = new URLSearchParams({
      tripType: "MULTI_CITY",
      segments: JSON.stringify(
        multiCity.map((c) => ({
          origin: c.from,
          destination: c.to,
          departureDate: c.date,
        })),
      ),
      adults: adults.toString(),
      children: children.toString(),
      infants: infants.toString(),
      travelClass: cabinClass.toUpperCase().replace(" ", "_"),
    }).toString();
    router.push(`/user/search-results?${params}`);
  };

  // ━━━━ Multi City Helpers ━━━━
  const updateMultiCity = (index: number, field: string, value: any) => {
    const updated = [...multiCity];
    (updated[index] as any)[field] = value;
    setMultiCity(updated);
  };

  const searchMultiCityAirport = async (
    keyword: string,
    index: number,
    type: "from" | "to",
  ) => {
    if (!keyword || keyword.trim().length < 2) {
      updateMultiCity(
        index,
        type === "from" ? "fromSuggestions" : "toSuggestions",
        [],
      );
      return;
    }
    try {
      const data = await apiClient(
        `/flights/location?keyword=${encodeURIComponent(keyword)}`,
      );
      updateMultiCity(
        index,
        type === "from" ? "fromSuggestions" : "toSuggestions",
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error("Multi-city search error:", err);
      updateMultiCity(
        index,
        type === "from" ? "fromSuggestions" : "toSuggestions",
        [],
      );
    }
  };

  const addCity = () => {
    if (multiCity.length < 5) {
      const lastCity = multiCity[multiCity.length - 1];
      setMultiCity([
        ...multiCity,
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
    }
  };

  const removeCity = (index: number) => {
    setMultiCity(multiCity.filter((_, i) => i !== index));
  };

  // ━━━━ Swap ━━━━
  const swapLocations = () => {
    const tempIata = from;
    const tempQuery = fromQuery;
    setFrom(to);
    setFromQuery(toQuery);
    setTo(tempIata);
    setToQuery(tempQuery);
  };

  // ━━━━ Close dropdown outside click ━━━━
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "SEARCH", label: "Search Flights", icon: <Search size={18} /> },
    { id: "PNR", label: "PNR Import", icon: <FileInput size={18} /> },
    { id: "GROUP", label: "Group Fare", icon: <UsersRound size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ✅ TOPBAR - Fixed Position */}
      <div className="sticky top-0 z-50">
        <AgentTopBar />
      </div>
      {/* 🔥 HERO SECTION WITH BACKGROUND */}
      <div className="relative bg-gradient-to-r from-[#021f3b] via-[#0a3a6b] to-[#021f3b] pt-2 pb-16 overflow-hidden">
        {/* ── Background animated elements ── */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large plane top left */}
          <div className="absolute -top-6 -left-6 opacity-3">
            <Plane size={180} className="text-white rotate-12" />
          </div>
          
          {/* Small plane top right */}
          <div className="absolute top-8 right-16 opacity-5 animate-pulse">
            <Plane size={90} className="text-white -rotate-12" />
          </div>
          </div>

        {/* ── Hero Content ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Main heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Find Your{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">
                Perfect Flight
              </span>
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 300 8"
                fill="none"
              >
                <path
                  d="M0 6 Q75 0 150 4 Q225 8 300 2"
                  stroke="url(#grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="grad"
                    x1="0"
                    y1="0"
                    x2="300"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#93C5FD" />
                    <stop offset="1" stopColor="#6EE7B7" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
        </div>
      </div>

      {/* 🔥 MAIN SEARCH CARD - Overlapping Hero */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 pb-10">
        {/* TAB BUTTONS */}
        <div className="bg-white rounded-t-2xl shadow-sm border-b border-gray-100 p-1 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl
                font-medium transition-all duration-300 text-sm md:text-base
                ${
                  activeTab === tab.id
                    ? "bg-[#021f3b] text-white shadow-lg"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 🔥 SEARCH TAB CONTENT */}
        {activeTab === "SEARCH" && (
          <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
            {/* TRIP TYPE SELECTOR */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="flex gap-4">
                {[
                  { id: "ONE_WAY", label: "One Way" },
                  { id: "ROUND_TRIP", label: "Round Trip" },
                  { id: "MULTI_CITY", label: "Multi City" },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full 
                      border-2 transition-all
                      ${
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

              {/* Cabin Class Selector */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="text-sm font-medium text-gray-600 bg-gray-100 
                    px-4 py-2 rounded-full outline-none cursor-pointer
                    hover:bg-gray-200 transition"
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
            </div>

            {/* 🔥 ONE WAY / ROUND TRIP SEARCH */}
            {tripType !== "MULTI_CITY" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 md:p-6 border border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                    {/* FROM */}
                    <div className="flex-1 min-w-0 relative">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        From
                      </label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#021f3b] rounded-l-xl flex items-center justify-center">
                          <PlaneTakeoff size={18} className="text-white" />
                        </div>
                        <input
                          type="text"
                          value={fromQuery}
                          onChange={(e) => {
                            setFromQuery(e.target.value);
                            searchCity(e.target.value, "from");
                          }}
                          placeholder="City or Airport"
                          className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300"
                        />
                      </div>
                      {fromSuggestions.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 bg-white shadow-2xl rounded-xl mt-1 max-h-60 overflow-y-auto border border-gray-100">
                          {fromSuggestions.map((loc: any) => (
                            <div
                              key={loc.iataCode}
                              onClick={() => {
                                setFrom(loc.iataCode);
                                setFromQuery(
                                  `${loc.address.cityName} (${loc.iataCode})`,
                                );
                                setFromSuggestions([]);
                              }}
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
                            >
                              <div className="font-bold text-sm text-gray-800">
                                {loc.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {loc.address.cityName},{" "}
                                {loc.address.countryName} — {loc.iataCode}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SWAP */}
                    <div className="flex justify-center lg:pb-0.5">
                      <button
                        onClick={swapLocations}
                        className="bg-[#021f3b] text-white w-10 h-10 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center border-2 border-white"
                        title="Swap locations"
                      >
                        <ArrowRightLeft
                          size={16}
                          className="hover:rotate-180 transition-transform duration-500 lg:rotate-0 rotate-90"
                        />
                      </button>
                    </div>

                    {/* TO */}
                    <div className="flex-1 min-w-0 relative">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        To
                      </label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#021f3b] rounded-l-xl flex items-center justify-center">
                          <PlaneLanding size={18} className="text-white" />
                        </div>
                        <input
                          type="text"
                          value={toQuery}
                          onChange={(e) => {
                            setToQuery(e.target.value);
                            searchCity(e.target.value, "to");
                          }}
                          placeholder="City or Airport"
                          className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300"
                        />
                      </div>
                      {toSuggestions.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 bg-white shadow-2xl rounded-xl mt-1 max-h-60 overflow-y-auto border border-gray-100">
                          {toSuggestions.map((loc: any) => (
                            <div
                              key={loc.iataCode}
                              onClick={() => {
                                setTo(loc.iataCode);
                                setToQuery(
                                  `${loc.address.cityName} (${loc.iataCode})`,
                                );
                                setToSuggestions([]);
                              }}
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
                            >
                              <div className="font-bold text-sm text-gray-800">
                                {loc.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {loc.address.cityName},{" "}
                                {loc.address.countryName} — {loc.iataCode}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* DEPARTURE */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Departure
                      </label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-l-xl flex items-center justify-center">
                          <CalendarDays size={18} className="text-white" />
                        </div>
                        <input
                          type="date"
                          min={today}
                          value={departDate}
                          onChange={(e) => setDepartDate(e.target.value)}
                          className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* RETURN (Round Trip only) */}
                    {tripType === "ROUND_TRIP" && (
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Return
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-l-xl flex items-center justify-center">
                            <CalendarDays size={18} className="text-white" />
                          </div>
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            min={departDate}
                            className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* TRAVELERS */}
                    <div className="flex-1 min-w-0 lg:max-w-[180px]">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Travelers
                      </label>
                      <TravelerDropdown
                        adults={adults}
                        setAdults={setAdults}
                        childs={children}
                        setChilds={setChildren}
                        infants={infants}
                        setInfants={setInfants}
                        showDropdown={showTravelerDropdown}
                        setShowDropdown={setShowTravelerDropdown}
                        dropdownRef={dropdownRef}
                      />
                    </div>
                  </div>
                </div>

                {/* SEARCH BUTTON */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSearch}
                    className="group bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white py-4 px-16 rounded-xl shadow-lg hover:shadow-xl hover:from-[#0a3a6b] hover:to-[#0c5a9e] transition-all duration-300 font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Search
                      size={20}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    <span>Search Flights</span>
                    <Plane
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>

                {/* Trust */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Best Price Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>500+ Airlines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            )}

            {/* 🔥 MULTI CITY SEARCH */}
            {tripType === "MULTI_CITY" && (
              <div className="space-y-3">
                {multiCity.map((city, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-100 relative"
                  >
                    {/* City number */}
                    <div className="absolute -left-2 top-4 w-7 h-7 bg-[#021f3b] text-white rounded-full flex items-center justify-center text-xs font-black shadow-md z-10">
                      {index + 1}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end gap-3 pl-4">
                      {/* FROM */}
                      <div className="flex-1 min-w-0 relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          From
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#021f3b] rounded-l-xl flex items-center justify-center">
                            <PlaneTakeoff size={18} className="text-white" />
                          </div>
                          <input
                            type="text"
                            value={city.fromQuery}
                            onChange={(e) => {
                              updateMultiCity(
                                index,
                                "fromQuery",
                                e.target.value,
                              );
                              searchMultiCityAirport(
                                e.target.value,
                                index,
                                "from",
                              );
                            }}
                            placeholder="City or Airport"
                            className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300"
                          />
                        </div>
                        {city.fromSuggestions?.length > 0 && (
                          <div className="absolute z-50 w-full bg-white shadow-2xl rounded-xl mt-1 max-h-60 overflow-y-auto border border-gray-100">
                            {city.fromSuggestions.map((loc: any) => (
                              <div
                                key={loc.iataCode}
                                onClick={() => {
                                  updateMultiCity(index, "from", loc.iataCode);
                                  updateMultiCity(
                                    index,
                                    "fromQuery",
                                    `${loc.address.cityName} (${loc.iataCode})`,
                                  );
                                  updateMultiCity(index, "fromSuggestions", []);
                                }}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
                              >
                                <div className="font-bold text-sm text-gray-800">
                                  {loc.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {loc.address.cityName},{" "}
                                  {loc.address.countryName} — {loc.iataCode}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* TO */}
                      <div className="flex-1 min-w-0 relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          To
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#021f3b] rounded-l-xl flex items-center justify-center">
                            <PlaneLanding size={18} className="text-white" />
                          </div>
                          <input
                            type="text"
                            value={city.toQuery}
                            onChange={(e) => {
                              updateMultiCity(index, "toQuery", e.target.value);
                              searchMultiCityAirport(
                                e.target.value,
                                index,
                                "to",
                              );
                            }}
                            placeholder="City or Airport"
                            className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300"
                          />
                        </div>
                        {city.toSuggestions?.length > 0 && (
                          <div className="absolute z-50 w-full bg-white shadow-2xl rounded-xl mt-1 max-h-60 overflow-y-auto border border-gray-100">
                            {city.toSuggestions.map((loc: any) => (
                              <div
                                key={loc.iataCode}
                                onClick={() => {
                                  updateMultiCity(index, "to", loc.iataCode);
                                  updateMultiCity(
                                    index,
                                    "toQuery",
                                    `${loc.address.cityName} (${loc.iataCode})`,
                                  );
                                  updateMultiCity(index, "toSuggestions", []);
                                }}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
                              >
                                <div className="font-bold text-sm text-gray-800">
                                  {loc.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {loc.address.cityName},{" "}
                                  {loc.address.countryName} — {loc.iataCode}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* DATE */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Date
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-l-xl flex items-center justify-center">
                            <CalendarDays size={18} className="text-white" />
                          </div>
                          <input
                            type="date"
                            value={city.date}
                            min={
                              index === 0
                                ? today
                                : multiCity[index - 1]?.date || today
                            }
                            onChange={(e) =>
                              updateMultiCity(index, "date", e.target.value)
                            }
                            className="w-full pl-14 pr-3 py-3.5 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:border-[#021f3b] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* TRAVELERS (first row only) */}
                      {index === 0 && (
                        <div className="flex-1 min-w-0 lg:max-w-[160px]">
                          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Travelers
                          </label>
                          <TravelerDropdown
                            adults={adults}
                            setAdults={setAdults}
                            childs={children}
                            setChilds={setChildren}
                            infants={infants}
                            setInfants={setInfants}
                            showDropdown={showTravelerDropdown}
                            setShowDropdown={setShowTravelerDropdown}
                            dropdownRef={dropdownRef}
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:pb-1">
                        {index > 0 && (
                          <button
                            onClick={() => removeCity(index)}
                            className="w-11 h-11 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition flex items-center justify-center"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {index === multiCity.length - 1 &&
                          multiCity.length < 5 && (
                            <button
                              onClick={addCity}
                              className="flex items-center gap-2 px-4 h-11 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                            >
                              <Plus size={18} />
                              <span className="hidden sm:inline">Add City</span>
                            </button>
                          )}
                      </div>
                    </div>

                    {/* Connected line between rows */}
                    {index < multiCity.length - 1 && (
                      <div className="absolute -bottom-3 left-1.5 w-[2px] h-6 bg-[#021f3b]/20 z-0" />
                    )}
                  </div>
                ))}

                {/* SEARCH BUTTON */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleMultiCitySearch}
                    className="group bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white px-16 py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-[#0a3a6b] hover:to-[#0c5a9e] transition-all duration-300 font-bold text-base flex items-center gap-3 active:scale-[0.98]"
                  >
                    <Search
                      size={20}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    <span>Search Multi-City Flights</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Best Price Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>500+ Airlines</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* 🔥 PNR IMPORT TAB */}
        {activeTab === "PNR" && (
          <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-12">
            <div className="max-w-md mx-auto text-center">
              <div
                className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 
                rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
              >
                <FileInput size={40} className="text-[#021f3b]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                PNR Import
              </h2>
              <p className="text-gray-500 mb-8">
                Enter your PNR to import and manage your booking
              </p>

              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    PNR / Booking Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC123"
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 
                      focus:border-[#021f3b] focus:ring-4 focus:ring-blue-100 
                      outline-none text-gray-800 font-bold text-xl uppercase tracking-[0.3em]
                      text-center placeholder:text-gray-300 placeholder:font-normal 
                      placeholder:tracking-normal placeholder:text-base bg-gray-50"
                    maxLength={6}
                  />
                </div>

                <button
                  className="w-full bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white 
                    px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all 
                    font-bold text-lg flex items-center justify-center gap-2"
                >
                  <FileInput size={22} />
                  Import PNR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 GROUP FARE TAB */}
        {activeTab === "GROUP" && (
          <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div
                  className="bg-gradient-to-br from-green-100 to-emerald-200 w-24 h-24 
                  rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                >
                  <UsersRound size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Group Fare Request
                </h2>
                <p className="text-gray-500">
                  Get special discounted fares for groups of 10+ passengers
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                      From
                    </label>
                    <div className="relative">
                      <PlaneTakeoff
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                      />
                      <input
                        type="text"
                        placeholder="Departure City"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl
                          focus:border-[#021f3b] outline-none text-gray-800 font-medium 
                          placeholder:text-gray-400 bg-gray-50 hover:bg-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                      To
                    </label>
                    <div className="relative">
                      <PlaneLanding
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                      />
                      <input
                        type="text"
                        placeholder="Arrival City"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl
                          focus:border-[#021f3b] outline-none text-gray-800 font-medium 
                          placeholder:text-gray-400 bg-gray-50 hover:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                      Travel Date
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                      />
                      <input
                        type="date"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl
                          focus:border-[#021f3b] outline-none text-gray-800 font-medium 
                          bg-gray-50 hover:bg-white transition cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                      Number of Passengers
                    </label>
                    <div className="relative">
                      <Users
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                      />
                      <input
                        type="number"
                        min={10}
                        defaultValue={10}
                        placeholder="Min 10 passengers"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl
                          focus:border-[#021f3b] outline-none text-gray-800 font-medium 
                          bg-gray-50 hover:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any special requirements for your group..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 
                      focus:border-[#021f3b] outline-none text-gray-800 font-medium
                      placeholder:text-gray-400 bg-gray-50 hover:bg-white 
                      transition resize-none"
                  />
                </div>

                <button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white 
                    px-6 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all 
                    font-bold text-lg flex items-center justify-center gap-3"
                >
                  <UsersRound size={22} />
                  Submit Group Fare Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER SPACE */}
      <div className="flex-1" />
    </div>
  );
}

//////////////////////////////////////////////////
// 🔥 TRAVELER DROPDOWN COMPONENT - COMPACT
//////////////////////////////////////////////////

function TravelerDropdown({
  adults,
  setAdults,
  childs,
  setChilds,
  infants,
  setInfants,
  showDropdown,
  setShowDropdown,
  dropdownRef,
}: {
  adults: number;
  setAdults: (n: number) => void;
  childs: number;
  setChilds: (n: number) => void;
  infants: number;
  setInfants: (n: number) => void;
  showDropdown: boolean;
  setShowDropdown: (b: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const total = adults + childs + infants;

  const getSummary = () => {
    if (total === 1) return "1 Traveler";
    return `${total} Travelers`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full pl-14 pr-3 py-3.5 border-2 rounded-xl cursor-pointer 
          text-gray-800 font-semibold text-sm transition-all bg-white 
          flex items-center justify-between relative
          ${
            showDropdown
              ? "border-[#021f3b] ring-2 ring-blue-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
      >
        {/* Icon Box */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-l-xl flex items-center justify-center">
          <Users size={18} className="text-white" />
        </div>

        <span className="truncate">{getSummary()}</span>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[300px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Passengers</h4>
                <p className="text-blue-200 text-xs">Select travelers</p>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 
                  flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Passengers List */}
          <div className="divide-y divide-gray-100">
            {/* Adults */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-[#021f3b]" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Adults</p>
                  <p className="text-xs text-gray-500">12+ years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adults > 1 && setAdults(adults - 1)}
                  disabled={adults <= 1}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                    ${
                      adults <= 1
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-bold text-gray-800 text-lg">
                  {adults}
                </span>
                <button
                  onClick={() => adults < 9 && setAdults(adults + 1)}
                  disabled={adults >= 9}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                    ${
                      adults >= 9
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Children</p>
                  <p className="text-xs text-gray-500">2-11 years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => childs > 0 && setChilds(childs - 1)}
                  disabled={childs <= 0}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                    ${
                      childs <= 0
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-bold text-gray-800 text-lg">
                  {childs}
                </span>
                <button
                  onClick={() => childs < 9 && setChilds(childs + 1)}
                  disabled={childs >= 9}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                    ${
                      childs >= 9
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                  <Baby size={20} className="text-pink-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Infants</p>
                  <p className="text-xs text-gray-500">Under 2</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => infants > 0 && setInfants(infants - 1)}
                  disabled={infants <= 0}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                    ${
                      infants <= 0
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-bold text-gray-800 text-lg">
                  {infants}
                </span>
                <button
                  onClick={() => infants < adults && setInfants(infants + 1)}
                  disabled={infants >= adults}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                    ${
                      infants >= adults
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-[#021f3b] text-[#021f3b] hover:bg-[#021f3b] hover:text-white"
                    }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Warning for infants */}
          {infants > 0 && (
            <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Baby size={14} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Each infant must be with an adult
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Total: </span>
              <span className="font-bold text-[#021f3b]">
                {total} Passenger{total > 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="bg-[#021f3b] text-white px-6 py-2.5 rounded-lg text-sm font-bold 
                hover:bg-[#0a3a6b] transition-all shadow-md hover:shadow-lg
                active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
