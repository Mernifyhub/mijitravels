// src/components/search-results/index.ts

// ── Data & Utilities ──────────────────────────────────────
export * from "./helpers";
export * from "./airlineData";

// ── Page ──────────────────────────────────────────────────
export { default as SearchResultsPage } from "./SearchResultsPage";

// ── Layout ────────────────────────────────────────────────
export { Navbar }           from "./Navbar";
export { AirlineFilterBar } from "./AirlineFilterBar";
export { FilterSidebar }    from "./FilterSidebar";
export { SortBar }          from "./SortBar";
export { FlightList }       from "./FlightList";

// ── Flight Card ───────────────────────────────────────────
export { FlightCard }            from "./FlightCard";
export { FlightCardRoute }       from "./FlightCardRoute";
export { FlightCardBottomBar }   from "./FlightCardBottomBar";
export { FlightCardPrice }       from "./FlightCardPrice";
export { FlightCardExpanded }    from "./FlightCardExpanded";

// ── Expanded Sections ─────────────────────────────────────
export { ExpandedRouteTimeline }    from "./ExpandedRouteTimeline";
export { ExpandedFareBreakdown }    from "./ExpandedFareBreakdown";
export { ExpandedBaggagePolicies }  from "./ExpandedBaggagePolicies";
export { ExpandedCabinFeatures }    from "./ExpandedCabinFeatures";
export { ExpandedFlightSummary }    from "./ExpandedFlightSummary";
export { ExpandedSeatAvailability } from "./ExpandedSeatAvailability";
export { ExpandedTravelTips }       from "./ExpandedTravelTips";