"use client";

import { useCallback, useMemo } from "react";
import {
  convertCurrency,
  convertFare,
  convertFareToDisplay,
  getDisplayCurrency,
  type DisplayFare,
} from "@/lib/currency";
import type { FareBreakdown } from "@/lib/fare";

export function useFareDisplay(fare?: FareBreakdown, hostname?: string) {
  const displayCurrency = useMemo(() => {
    return getDisplayCurrency(hostname);
  }, [hostname]);

  const convertFareFn = useCallback(
    (inputFare: FareBreakdown): DisplayFare => {
      return convertFare(inputFare, displayCurrency);
    },
    [displayCurrency]
  );

  const convertFareToDisplayFn = useCallback(
    (inputFare: FareBreakdown): DisplayFare => {
      return convertFareToDisplay(inputFare, displayCurrency);
    },
    [displayCurrency]
  );

  const displayFare = useMemo<DisplayFare | null>(() => {
    if (!fare) return null;
    return convertFareFn(fare);
  }, [fare, convertFareFn]);

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string) => {
      return convertCurrency(
        amount,
        fromCurrency,
        toCurrency || displayCurrency
      );
    },
    [displayCurrency]
  );

  return {
    displayCurrency,
    displayFare,
    convertAmount,

    // backward compatibility
    convertFare: convertFareFn,
    convertFareToDisplay: convertFareToDisplayFn,
  };
}