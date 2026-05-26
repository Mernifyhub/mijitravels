// hooks/useFareDisplay.ts
"use client";

import { useCallback, useMemo } from "react";
import {
  convertCurrency,
  convertFareToDisplay,
  getDisplayCurrency,
  type DisplayFare,
} from "@/lib/currency";
import type { FareBreakdown } from "@/lib/fare";

export function useFareDisplay(fare?: FareBreakdown, hostname?: string) {
  const displayCurrency = useMemo(() => {
    return getDisplayCurrency(hostname);
  }, [hostname]);

  // ✅ convertFare এর বদলে convertFareToDisplay use করো
  // কারণ convertFare → FareBreakdown return করে
  // কিন্তু convertFareToDisplay → DisplayFare return করে
  const convertFareFn = useCallback(
    (inputFare: FareBreakdown): DisplayFare => {
      return convertFareToDisplay(inputFare, displayCurrency);
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
    convertFare:           convertFareFn,
    convertFareToDisplay:  convertFareToDisplayFn,
  };
} 