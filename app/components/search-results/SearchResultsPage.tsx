// src/components/search-results/SearchResultsPage.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extractFareFromFlight, calculateFare } from "@/lib/fare";
import { useFareDisplay } from "@/hooks/useFareDisplay";
import { apiClient } from "@/lib/api";
import {getPrice,formatMoney,getDurationMinutes,type FlightData,type SortOption,} from "./helpers";
import { Navbar } from "./Navbar";
import { FilterSidebar } from "./FilterSidebar";
import { SortBar } from "./SortBar";
import { FlightList } from "./FlightList";
import { AIRLINE_FILTERS } from "./airlineData"; 

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [selectedAirline, setSelectedAirline] = useState("ALL");
  const [priceRange, setPriceRange] = useState(10000);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("cheapest");
  const [selectedBaggage, setSelectedBaggage] = useState<string | null>(null);
  const [selectedRefundability, setSelectedRefundability] = useState<string | null>(null);
  const { currency: displayCurrency, convertFare } = useFareDisplay();

  // ==================== FETCH ====================

  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        const params = new URLSearchParams(searchParams.toString());
        if (!params.get("provider")) params.set("provider", "all");

        const data = await apiClient(
          `/flights/search?${params.toString()}`,
          { signal: controller.signal } as RequestInit
        );
        clearTimeout(timeoutId);

        if (data.meta?.isFallback) console.warn("⚠️ Showing fallback flights");

        const flightData = data.data || [];
        setFlights(flightData);

        if (flightData.length > 0) {
          const maxPrice = Math.max(...flightData.map(getPrice));
          setPriceRange(Math.ceil(maxPrice * 1.2));
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error("Flight search timed out");
        } else {
          console.error("Flight fetch error:", err?.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlights();
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get("provider")) {
      params.set("provider", "all");
      router.replace(`/user/search-results?${params.toString()}`);
    }
  }, [searchParams, router]);

  // ==================== COMPUTED ====================

  const maxPriceLimit = useMemo(() => {
    if (flights.length === 0) return 10000;
    return Math.ceil(Math.max(...flights.map(getPrice)) * 1.3);
  }, [flights]);

  const resetFilters = () => {
    setSelectedAirline("ALL");
    setPriceRange(maxPriceLimit);
    setSelectedStop(null);
    setSelectedTime(null);
    setSortBy("cheapest");
    setSelectedBaggage(null);
    setSelectedRefundability(null);
  };

  const activeFilterCount = [
    selectedAirline !== "ALL",
    selectedStop !== null,
    selectedBaggage !== null,
    selectedRefundability !== null,
    priceRange < maxPriceLimit,
  ].filter(Boolean).length;

  // ==================== FILTERING & SORTING ====================

  const filteredAndSortedFlights = useMemo(() => {
    let result = [...flights];

    // Airline filter
    if (selectedAirline !== "ALL") {
      result = result.filter((flight) =>
        flight.itineraries.some((it) =>
          it.segments.some((seg) => seg.carrierCode === selectedAirline)
        )
      );
    }

    // Price filter
    result = result.filter((flight) => getPrice(flight) <= priceRange);

    // Stop filter
    if (selectedStop) {
      result = result.filter((flight) => {
        const maxStops = flight.itineraries.reduce(
          (max, it) => Math.max(max, it.segments.length - 1),
          0
        );
        if (selectedStop === "Non-stop") return maxStops === 0;
        if (selectedStop === "1 Stop") return maxStops === 1;
        if (selectedStop === "2+ Stops") return maxStops >= 2;
        return true;
      });
    }

    // Baggage filter
    if (selectedBaggage) {
      result = result.filter((flight) => {
        const raw = flight?.baggageInfo?.checkedRaw || 0;
        if (selectedBaggage === "With baggage") return raw > 0;
        if (selectedBaggage === "No baggage") return raw === 0;
        return true;
      });
    }

    // Refundability filter
    if (selectedRefundability) {
      result = result.filter((flight) => {
        const refundable = flight?.conditions?.refundable === true;
        if (selectedRefundability === "Refundable") return refundable;
        if (selectedRefundability === "Non-refundable") return !refundable;
        return true;
      });
    }

    // Time filter
    if (selectedTime) {
      result = result.filter((flight) => {
        const hour = parseInt(
          flight.itineraries[0].segments[0].departure.at
            ?.split("T")[1]
            ?.slice(0, 2) || "0"
        );
        if (selectedTime === "Morning") return hour >= 6 && hour < 12;
        if (selectedTime === "Afternoon") return hour >= 12 && hour < 18;
        if (selectedTime === "Evening") return hour >= 18 && hour < 24;
        if (selectedTime === "Night") return hour >= 0 && hour < 6;
        return true;
      });
    }

    // Sorting
    if (sortBy === "cheapest") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "fastest") {
      result.sort(
        (a, b) =>
          getDurationMinutes(a.itineraries[0].duration) -
          getDurationMinutes(b.itineraries[0].duration)
      );
    } else if (sortBy === "best") {
      result.sort((a, b) => {
        const score = (f: FlightData) => {
          const price = getPrice(f);
          const mins = getDurationMinutes(f.itineraries[0].duration);
          const stops = f.itineraries[0].segments.length - 1;
          return price * 0.4 + mins * 0.4 + stops * 100 * 0.2;
        };
        return score(a) - score(b);
      });
    }

    return result;
  }, [
    flights,
    selectedAirline,
    priceRange,
    selectedStop,
    selectedBaggage,
    selectedRefundability,
    selectedTime,
    sortBy,
  ]);

  // ==================== SORT BAR DATA ====================

  const sortBarData = useMemo(() => {
    if (flights.length === 0) return { cheapest: "—", fastest: "—" };

    const cheapestFlight = [...flights].sort(
      (a, b) => getPrice(a) - getPrice(b)
    )[0];
    const fareInput = extractFareFromFlight(cheapestFlight, {
      adults: 1,
      children: 0,
      infants: 0,
    });
    const converted = convertFare(calculateFare(fareInput));
    const cheapestLabel = formatMoney(converted.grandTotal, converted.currency);

    const durations = flights.map((f) => {
      const mins = getDurationMinutes(f.itineraries[0].duration);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return { total: mins, label: `${h}h ${m}m` };
    });
    const fastest = durations.reduce(
      (min, d) => (d.total < min.total ? d : min),
      durations[0]
    );

    return { cheapest: cheapestLabel, fastest: fastest?.label || "—" };
  }, [flights, convertFare]);

  // ==================== DYNAMIC AIRLINE FILTERS ====================

  const dynamicAirlineFilters = useMemo(() => {
    if (flights.length === 0) return AIRLINE_FILTERS;

    const airlineMap = new Map<string, number>();
    flights.forEach((flight) => {
      flight.itineraries.forEach((it) => {
        it.segments.forEach((seg) => {
          const code = seg.carrierCode;
          const price = getPrice(flight);
          if (!airlineMap.has(code) || price < airlineMap.get(code)!) {
            airlineMap.set(code, price);
          }
        });
      });
    });

    const allMin = Math.min(...Array.from(airlineMap.values()));

    return AIRLINE_FILTERS.map((af) => {
      if (af.code === "ALL") return { ...af, price: String(allMin) };
      if (airlineMap.has(af.code))
        return { ...af, price: String(airlineMap.get(af.code)!) };
      return af;
    });
  }, [flights]);

  // ==================== RENDER ====================

  return (
    <div className="bg-[#F4F7FA] min-h-screen pb-20 selection:bg-indigo-100">
      <Navbar
        searchParams={searchParams}
        isLoading={isLoading}
        dynamicAirlineFilters={dynamicAirlineFilters}
        selectedAirline={selectedAirline}
        setSelectedAirline={setSelectedAirline}
        displayCurrency={displayCurrency}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:items-start">
          <FilterSidebar
            selectedStop={selectedStop}
            setSelectedStop={setSelectedStop}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            maxPriceLimit={maxPriceLimit}
            selectedBaggage={selectedBaggage}
            setSelectedBaggage={setSelectedBaggage}
            selectedRefundability={selectedRefundability}
            setSelectedRefundability={setSelectedRefundability}
            activeFilterCount={activeFilterCount}
            resetFilters={resetFilters}
            displayCurrency={displayCurrency}
          />

          <main className="lg:col-span-9 space-y-2">
            <SortBar
              sortBy={sortBy}
              setSortBy={setSortBy}
              cheapestLabel={sortBarData.cheapest}
              fastestLabel={sortBarData.fastest}
            />

            <FlightList
              flights={filteredAndSortedFlights}
              isLoading={isLoading}
              expandedFlight={expandedFlight}
              setExpandedFlight={setExpandedFlight}
              sortBy={sortBy}
              searchParams={searchParams}
              activeFilterCount={activeFilterCount}
              resetFilters={resetFilters}
              totalCount={flights.length}
            />
          </main>
        </div>
      </div>
    </div>
  );
}