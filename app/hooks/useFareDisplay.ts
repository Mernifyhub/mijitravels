// hooks/useFareDisplay.ts
"use client";

import { useMemo } from "react";
import {
  convertCurrency,
  convertFareToDisplay,
  getDisplayCurrency,
  type DisplayFare,
} from "@/lib/currency";
import type { FareBreakdown } from "@/lib/fare";

export function useFareDisplay() {
  // 🎯 এই hostname-টাই future-এ subdomain detect করবে
  const hostname = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return window.location.hostname;
  }, []);

  const displayCurrency = useMemo(
    () => getDisplayCurrency(hostname),
    [hostname]
  );

  /**
   * Single amount convert
   */
  const convert = (amount: number, fromCurrency: string): number => {
    return convertCurrency(amount, fromCurrency, displayCurrency);
  };

  /**
   * Full FareBreakdown convert
   */
  const convertFare = (fare: FareBreakdown): DisplayFare => {
    return convertFareToDisplay(fare, displayCurrency);
  };

  /**
   * Format → "SAR 900"
   */
  const format = (amount: number): string => {
    return `${displayCurrency} ${amount.toLocaleString()}`;
  };

  return {
    currency: displayCurrency,
    convert,
    convertFare,
    format,
  };
}