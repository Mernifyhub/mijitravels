// src/components/search-results/FlightList.tsx

"use client";

import { AlertCircle } from "lucide-react";
import { FlightCard } from "./FlightCard";
import type { FlightData, SortOption } from "./helpers";

interface FlightListProps {
  flights: FlightData[];
  isLoading: boolean;
  expandedFlight: string | null;
  setExpandedFlight: (id: string | null) => void;
  sortBy: SortOption;
  searchParams: URLSearchParams;
  activeFilterCount: number;
  resetFilters: () => void;
  totalCount: number;
}

export function FlightList({
  flights,
  isLoading,
  expandedFlight,
  setExpandedFlight,
  sortBy,
  searchParams,
  activeFilterCount,
  resetFilters,
  totalCount,
}: FlightListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200"
          />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">No flights found</h3>
        <p className="text-sm text-slate-400 mb-6">
          Try adjusting your filters to see more results
        </p>
        <button
          onClick={resetFilters}
          className="bg-[#0A1128] hover:bg-[#111936] text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">
          Showing{" "}
          <span className="text-[#0A1128] font-black">{flights.length}</span>{" "}
          of{" "}
          <span className="font-black text-slate-700">{totalCount}</span> flights
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[10px] font-black text-[#0A1128] bg-[#0A1128]/5 hover:bg-[#0A1128]/10 px-3 py-1.5 rounded-full uppercase tracking-widest transition-all"
          >
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Flight Cards */}
      {flights.map((flight, index) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          isExpanded={expandedFlight === flight.id}
          setExpanded={() =>
            setExpandedFlight(expandedFlight === flight.id ? null : flight.id)
          }
          isFirst={index === 0}
          sortBy={sortBy}
          searchParams={searchParams}
        />
      ))}
    </>
  );
}