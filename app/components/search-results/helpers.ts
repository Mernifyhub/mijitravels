// src/components/search-results/helpers.ts
// ✅ Pure TS — NO JSX here

// ==================== TYPES ====================

export interface FlightSegment {
  carrierCode: string;
  number: string;
  departure: {
    iataCode: string;
    at: string;
    airport?: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    airport?: string;
    terminal?: string;
  };
  duration?: string;
  cabinName?: string;
  aircraft?: { name?: string };
  marketingCarrier?: { name?: string };
  operatingCarrier?: { name?: string };
}

export interface FlightItinerary {
  segments: FlightSegment[];
  duration: string;
}

export interface FlightData {
  id: string;
  source?: string;
  provider?: string;
  _provider?: string;
  _duffel?: {
    owner?: string;
    totalEmissions?: number;
  };
  _amadeus?: any;
  _travelpayouts?: any;
  price?: {
    grandTotal?: string | number;
    total?: string | number;
  };
  priceBreakdown?: any;
  itineraries: FlightItinerary[];
  baggageInfo?: {
    checked: string;
    cabin: string;
    checkedRaw: number;
    cabinRaw: number;
  };
  conditions?: {
    refundable?: boolean;
    changeable?: boolean;
    refundPenalty?: string;
    changePenalty?: string;
  };
  discountInfo?: {
    discounts: any[];
    totalDiscount: number;
    hasPromo: boolean;
    labels: string[];
  };
}

export interface AirlineFilter {
  name: string;
  code: string;
  price: string;
  logo: React.ReactNode;
}

export type SortOption = "cheapest" | "best" | "fastest";

// ==================== SOURCE CONFIG ====================

export const SOURCE_CONFIG = {
  duffel: {
    label: "Duffel API",
    short: "DA",
    badgeCls: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  amadeus: {
    label: "Amadeus API",
    short: "AA",
    badgeCls: "bg-sky-100 text-sky-800 border-sky-300",
  },
  travelpayouts: {
    label: "Travelpayouts API",
    short: "TA",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
} as const;

export type ApiSourceKey = keyof typeof SOURCE_CONFIG;

// ==================== SORT BADGE CONFIG ====================

export const SORT_BADGE_CONFIG = {
  cheapest: { label: "Cheapest", icon: "💰", cls: "bg-emerald-500 text-white" },
  fastest:  { label: "Fastest",  icon: "⚡", cls: "bg-amber-500 text-white"   },
  best:     { label: "Best",     icon: "⭐", cls: "bg-indigo-500 text-white"  },
} as const;

// ==================== PURE HELPER FUNCTIONS ====================

export const getPrice = (flight: FlightData): number =>
  Number(flight?.price?.grandTotal ?? flight?.price?.total ?? 0);

export const formatMoney = (amount: number, currency: string): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

export const formatDuration = (dur: string): string => {
  if (!dur) return "—";
  const h = dur.match(/(\d+)H/)?.[1] || "0";
  const m = dur.match(/(\d+)M/)?.[1] || "0";
  return `${h}h ${m}m`;
};

export const formatTime = (d: string): string =>
  d?.split("T")[1]?.slice(0, 5) || "—";

export const formatDate = (d: string): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });
};

export const formatFullDate = (d: string): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getDurationMinutes = (dur: string): number => {
  const h = parseInt(dur?.match(/(\d+)H/)?.[1] || "0");
  const m = parseInt(dur?.match(/(\d+)M/)?.[1] || "0");
  return h * 60 + m;
};

export const detectApiSource = (flight: FlightData): ApiSourceKey => {
  const rawSource =
    flight?.source ||
    flight?._provider ||
    flight?.provider ||
    (flight?._duffel        ? "duffel"         : null) ||
    (flight?._amadeus       ? "amadeus"        : null) ||
    (flight?._travelpayouts ? "travelpayouts"  : null);

  const normalized = String(rawSource || "").toLowerCase();

  if (normalized === "duffel")         return "duffel";
  if (normalized === "amadeus")        return "amadeus";
  if (normalized === "travelpayouts")  return "travelpayouts";

  return "duffel"; // default fallback
};

export const getAvailableSeats = (flightId: string): number => {
  let hash = 0;
  for (let i = 0; i < (flightId || "").length; i++) {
    hash = flightId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 7) + 2;
};