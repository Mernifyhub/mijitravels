"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api";
import type { AirportSuggestion } from "../types";

export function useAirportSearch() {
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);

  const search = useCallback(async (keyword: string) => {
    if (!keyword || keyword.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await apiClient(
        `/flights/location?keyword=${encodeURIComponent(keyword)}`
      );
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Airport search error:", error);
      setSuggestions([]);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, search, clear };
}