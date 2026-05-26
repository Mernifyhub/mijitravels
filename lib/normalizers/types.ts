// lib/normalizers/types.ts

import type { FareBreakdown } from '../fare';

export interface NormalizedFlight {
  id: string;

  // backward compat — existing pages ভাঙবে না
  price: {
    total:      string;
    grandTotal: string;
    base:       string;
    tax?:       string;
    markup?:    string;
    ait?:       string;
    currency:   string;
  };

  // ✅ B2B OTA standard full breakdown
  priceBreakdown: FareBreakdown;

  passengerFares?: {
    type:           'adult' | 'child' | 'infant_without_seat';
    count:          number;
    baseFarePerPax: string;
    taxPerPax:      string;
    totalPerPax:    string;
    subTotal:       string;
  }[];

  itineraries: {
    duration:      string;
    fareBrandName: string;
    stopCount?:    number;
    layovers?: {
      airport:  string;
      cityName: string;
      duration: string;
    }[];
    segments: {
      carrierCode: string;
      number:      string;
      departure: {
        iataCode: string;
        at:       string;
        terminal: string | null;
        cityName: string;
        airport:  string;
      };
      arrival: {
        iataCode: string;
        at:       string;
        terminal: string | null;
        cityName: string;
        airport:  string;
      };
      duration:   string;
      stopCount?: number;
      aircraft: {
        code: string;
        name: string;
      };
      operatingCarrier: {
        name: string;
        code: string;
      };
      marketingCarrier: {
        name: string;
        code: string;
      };
      cabin:     string;
      cabinName: string;
      baggage: {
        checked: number;
        cabin:   number;
      };
      fareBasis: string;
    }[];
  }[];

  conditions: {
    refundable:      boolean;
    changeable:      boolean;
    refundPenalty:   string | null;
    changePenalty:   string | null;
    penaltyCurrency: string;
  };

  baggageInfo: {
    checked:    string;
    cabin:      string;
    checkedRaw: number;
    cabinRaw:   number;
  };

  _duffel: {
    owner:               string;
    ownerCode:           string;
    ownerLogo:           string;
    passengers:          any[];
    paymentRequirements: any;
    expiresAt:           string;
    totalEmissions:      number | null;
  };
}