"use client";

import { useContext } from "react";
import { AppContext } from "../providers/AppProvider";
import type { AppContextType } from "../lib/types";

export default function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}