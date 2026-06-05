export type ActiveTab = "SEARCH" | "PNR" | "GROUP";
export type TripType = "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";

export interface AirportSuggestion {
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

export interface MultiCitySegment {
  from: string;
  fromQuery: string;
  to: string;
  toQuery: string;
  date: string;
  fromSuggestions: AirportSuggestion[];
  toSuggestions: AirportSuggestion[];
}