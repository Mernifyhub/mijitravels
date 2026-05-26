// lib/markup.ts

import type { NormalizedFlight } from "@/lib/normalizers/types";
import { convertCurrency } from "@/lib/currency";

// ==========================================
// Constants
// ==========================================

const DISPLAY_CURRENCY = "SAR";

// ==========================================
// Types
// ==========================================

export type MarkupType =
  | "GLOBAL"
  | "AIRLINE"
  | "ROUTE"
  | "AGENT"
  | "AIRLINE_AGENT"
  | "ROUTE_AGENT";

export type MarkupOn = "BASE_FARE" | "TOTAL";
export type RouteMatchType = "EXACT" | "BIDIRECTIONAL";

export interface MarkupRule {
  id: string;
  type: MarkupType;

  airlineCode?: string | null;
  origin?: string | null;
  destination?: string | null;
  routeMatchType?: RouteMatchType;

  agentId?: string | null;

  markupAmount: number | string;
  markupPercent: number | string;
  markupOn: MarkupOn;
  markupCurrency?: string | null;

  priority?: number;
  isActive?: boolean;

  validFrom?: string | Date | null;
  validTo?: string | Date | null;
  deletedAt?: string | Date | null;

  createdAt?: string | Date;
}

export interface MarkupContext {
  airlineCode?: string;
  origin?: string;
  destination?: string;
  agentId?: string;
}

export interface AppliedMarkupResult {
  rule: MarkupRule | null;
  value: number;
  fixedPart: number;
  percentPart: number;
  fareBase: number;
}

// ==========================================
// Helpers
// ==========================================

function normalize(value?: string | null): string {
  return (value || "").trim().toUpperCase();
}

function toNum(value: any): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ==========================================
// Rule Key
// ==========================================

export function generateRuleKey(params: {
  type: string;
  airlineCode?: string;
  origin?: string;
  destination?: string;
  agentId?: string;
}): string {
  const { type, airlineCode, origin, destination, agentId } = params;

  switch (type) {
    case "GLOBAL":
      return "GLOBAL";
    case "AIRLINE":
      return `AIRLINE:${normalize(airlineCode)}`;
    case "ROUTE":
      return `ROUTE:${normalize(origin)}:${normalize(destination)}`;
    case "AGENT":
      return `AGENT:${agentId}`;
    case "AIRLINE_AGENT":
      return `AIRLINE_AGENT:${normalize(airlineCode)}:${agentId}`;
    case "ROUTE_AGENT":
      return `ROUTE_AGENT:${normalize(origin)}:${normalize(destination)}:${agentId}`;
    default:
      return `UNKNOWN:${Date.now()}`;
  }
}

// ==========================================
// Priority Order
// ==========================================

export const MARKUP_PRIORITY_ORDER = [
  "ROUTE_AGENT",
  "AIRLINE_AGENT",
  "ROUTE",
  "AGENT",
  "AIRLINE",
  "GLOBAL",
] as const;

function getTypeRank(type: string): number {
  const index = MARKUP_PRIORITY_ORDER.indexOf(type as any);
  return index === -1 ? 999 : index;
}

// ==========================================
// Validation
// ==========================================

export function validateMarkupInput(body: any): string | null {
  if (!body.type) return "Markup type is required";

  const amount = parseFloat(body.markupAmount || "0");
  const percent = parseFloat(body.markupPercent || "0");

  if (!amount && !percent) {
    return "Either markup amount or percent is required";
  }

  switch (body.type) {
    case "AIRLINE":
      if (!body.airlineCode) return "Airline code is required";
      break;
    case "ROUTE":
      if (!body.origin || !body.destination)
        return "Origin & destination required";
      break;
    case "AGENT":
      if (!body.agentId) return "Agent is required";
      break;
    case "AIRLINE_AGENT":
      if (!body.airlineCode) return "Airline code is required";
      if (!body.agentId) return "Agent is required";
      break;
    case "ROUTE_AGENT":
      if (!body.origin || !body.destination)
        return "Origin & destination required";
      if (!body.agentId) return "Agent is required";
      break;
  }

  return null;
}

// ==========================================
// Active / Validity Check
// ==========================================

export function isMarkupRuleActive(
  markup: MarkupRule,
  now = new Date()
): boolean {
  if (markup.isActive === false) return false;
  if (markup.deletedAt) return false;
  if (markup.validFrom && new Date(markup.validFrom) > now) return false;
  if (markup.validTo && new Date(markup.validTo) < now) return false;
  return true;
}

// ==========================================
// Route Match
// ==========================================

export function isRouteMatched(
  ruleOrigin?: string | null,
  ruleDestination?: string | null,
  contextOrigin?: string,
  contextDestination?: string,
  routeMatchType: RouteMatchType = "EXACT"
): boolean {
  const ro = normalize(ruleOrigin);
  const rd = normalize(ruleDestination);
  const co = normalize(contextOrigin);
  const cd = normalize(contextDestination);

  if (!ro || !rd || !co || !cd) return false;

  if (routeMatchType === "BIDIRECTIONAL") {
    return (ro === co && rd === cd) || (ro === cd && rd === co);
  }

  return ro === co && rd === cd;
}

// ==========================================
// Applicability Check
// ==========================================

export function isMarkupApplicable(
  markup: MarkupRule,
  context: MarkupContext
): boolean {
  if (!isMarkupRuleActive(markup)) return false;

  const airlineCode = normalize(context.airlineCode);
  const origin = normalize(context.origin);
  const destination = normalize(context.destination);
  const agentId = context.agentId || "";

  switch (markup.type) {
    case "GLOBAL":
      return true;

    case "AIRLINE":
      return normalize(markup.airlineCode) === airlineCode;

    case "ROUTE":
      return isRouteMatched(
        markup.origin,
        markup.destination,
        origin,
        destination,
        markup.routeMatchType || "EXACT"
      );

    case "AGENT":
      return !!markup.agentId && markup.agentId === agentId;

    case "AIRLINE_AGENT":
      return (
        normalize(markup.airlineCode) === airlineCode &&
        !!markup.agentId &&
        markup.agentId === agentId
      );

    case "ROUTE_AGENT":
      return (
        isRouteMatched(
          markup.origin,
          markup.destination,
          origin,
          destination,
          markup.routeMatchType || "EXACT"
        ) &&
        !!markup.agentId &&
        markup.agentId === agentId
      );

    default:
      return false;
  }
}

// ==========================================
// Filter Applicable Rules
// ==========================================

export function findApplicableRules(
  markups: MarkupRule[],
  context: MarkupContext
): MarkupRule[] {
  return markups.filter((m) => isMarkupApplicable(m, context));
}

// ==========================================
// Find Best Rule
// ==========================================

export function findBestRule(markups: MarkupRule[]): MarkupRule | null {
  if (!markups.length) return null;

  const sorted = [...markups].sort((a, b) => {
    const typeRankDiff = getTypeRank(a.type) - getTypeRank(b.type);
    if (typeRankDiff !== 0) return typeRankDiff;

    const priorityA = toNum(a.priority);
    const priorityB = toNum(b.priority);
    if (priorityA !== priorityB) return priorityB - priorityA;

    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdA - createdB;
  });

  return sorted[0];
}

// ==========================================
// Calculate Markup Value (all in SAR)
// ==========================================

export function calculateMarkupValue(params: {
  markupAmount: any;
  markupPercent: any;
  markupOn: string;
  baseFare: number;
  totalFare: number;
}): number {
  const { markupAmount, markupPercent, markupOn, baseFare, totalFare } = params;

  const fareBase = markupOn === "TOTAL" ? totalFare : baseFare;
  const fixedPart = toNum(markupAmount);
  const percentPart = (fareBase * toNum(markupPercent)) / 100;

  return round2(fixedPart + percentPart);
}

// ==========================================
// Apply Best Markup (all in SAR)
// ==========================================

export function applyBestMarkup(params: {
  markups: MarkupRule[];
  context: MarkupContext;
  baseFare: number;
  totalFare: number;
}): AppliedMarkupResult {
  const { markups, context, baseFare, totalFare } = params;

  const applicable = findApplicableRules(markups, context);
  const rule = findBestRule(applicable);

  if (!rule) {
    return {
      rule: null,
      value: 0,
      fixedPart: 0,
      percentPart: 0,
      fareBase: 0,
    };
  }

  const fareBase = rule.markupOn === "TOTAL" ? totalFare : baseFare;
  const fixedPart = round2(toNum(rule.markupAmount));
  const percentPart = round2((fareBase * toNum(rule.markupPercent)) / 100);
  const value = round2(fixedPart + percentPart);

  return {
    rule,
    value,
    fixedPart,
    percentPart,
    fareBase,
  };
}

// ==========================================
// Build Markup Context from Flight
// ==========================================

export function buildMarkupContext(
  flight: NormalizedFlight,
  overrides?: Partial<MarkupContext>
): MarkupContext {
  const segments = flight.itineraries?.[0]?.segments ?? [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  return {
    airlineCode: firstSeg?.carrierCode || "",
    origin: firstSeg?.departure?.iataCode || "",
    destination: lastSeg?.arrival?.iataCode || "",
    ...overrides,
  };
}

// ==========================================
// Convert Flight Prices to SAR
// ==========================================

export function convertFlightToSAR(flight: NormalizedFlight): NormalizedFlight {
  const sourceCurrency = (
    flight.priceBreakdown?.currency ||
    flight.price?.currency ||
    "USD"
  ).toUpperCase();

  // Already SAR — no conversion needed
  if (sourceCurrency === DISPLAY_CURRENCY) return flight;

  // Deep clone
  const updated: NormalizedFlight = JSON.parse(JSON.stringify(flight));

  // Convert price object
  if (updated.price) {
    updated.price.base = String(
      round2(convertCurrency(Number(updated.price.base || 0), sourceCurrency, DISPLAY_CURRENCY))
    );
    updated.price.total = String(
      round2(convertCurrency(Number(updated.price.total || 0), sourceCurrency, DISPLAY_CURRENCY))
    );
    updated.price.grandTotal = String(
      round2(convertCurrency(Number(updated.price.grandTotal || 0), sourceCurrency, DISPLAY_CURRENCY))
    );
    updated.price.currency = DISPLAY_CURRENCY;
  }

  // Convert agentUi
  const ui = updated.priceBreakdown?.agentUi;
  if (ui) {
    ui.baseFare = round2(convertCurrency(Number(ui.baseFare || 0), sourceCurrency, DISPLAY_CURRENCY));
    ui.taxAmount = round2(convertCurrency(Number(ui.taxAmount || 0), sourceCurrency, DISPLAY_CURRENCY));
    ui.totalBaseTax = round2(ui.baseFare + ui.taxAmount);
    ui.customerInvoiceTotal = ui.totalBaseTax;

    const discount = round2(
      convertCurrency(Number(ui.discountOrCommission || 0), sourceCurrency, DISPLAY_CURRENCY)
    );
    ui.discountOrCommission = discount;

    ui.grandTotal = round2(Math.max(0, ui.customerInvoiceTotal - discount));

    const totalPax = Math.max(
      1,
      (ui.adults || 1) + (ui.children || 0) + (ui.infants || 0)
    );
    ui.perPerson = round2(ui.grandTotal / totalPax);
  }

  // Update currency
  if (updated.priceBreakdown) {
    updated.priceBreakdown.currency = DISPLAY_CURRENCY;
  }

  // Store original currency info
  (updated as any)._currencyConversion = {
    originalCurrency: sourceCurrency,
    displayCurrency: DISPLAY_CURRENCY,
    converted: true,
  };

  return updated;
}

// ==========================================
// Apply Markup to Single Flight (already in SAR)
// ==========================================

export function applyMarkupToFlight(
  flight: NormalizedFlight,
  rules: MarkupRule[],
  context: MarkupContext
): NormalizedFlight {
  const ui = flight.priceBreakdown?.agentUi;
  if (!ui) return flight;

  const baseFare = Number(ui.baseFare || 0);
  const taxAmount = Number(ui.taxAmount || 0);

  const result = applyBestMarkup({
    markups: rules,
    context,
    baseFare,
    totalFare: baseFare + taxAmount,
  });

  if (!result.rule || result.value <= 0) return flight;

  // Deep clone
  const updated: NormalizedFlight = JSON.parse(JSON.stringify(flight));
  const updatedUi = updated.priceBreakdown!.agentUi;

  // Apply markup
  if (result.rule.markupOn === "BASE_FARE") {
    updatedUi.baseFare = round2(baseFare + result.value);
  } else {
    updatedUi.taxAmount = round2(taxAmount + result.value);
  }

  // Recalculate totals
  updatedUi.totalBaseTax = round2(updatedUi.baseFare + updatedUi.taxAmount);
  updatedUi.customerInvoiceTotal = updatedUi.totalBaseTax;

  const discount = Number(updatedUi.discountOrCommission || 0);
  updatedUi.grandTotal = round2(
    Math.max(0, updatedUi.customerInvoiceTotal - discount)
  );

  const totalPax = Math.max(
    1,
    (updatedUi.adults || 1) +
      (updatedUi.children || 0) +
      (updatedUi.infants || 0)
  );
  updatedUi.perPerson = round2(updatedUi.grandTotal / totalPax);

  // Sync price object
  if (updated.price) {
    updated.price.base = String(updatedUi.baseFare);
    updated.price.total = String(updatedUi.totalBaseTax);
    updated.price.grandTotal = String(updatedUi.grandTotal);
  }

  // Audit info
  (updated as any)._appliedMarkup = {
    ruleId: result.rule.id,
    ruleType: result.rule.type,
    markupAmount: result.value,
    markupOn: result.rule.markupOn,
    currency: DISPLAY_CURRENCY,
    fixedPart: result.fixedPart,
    percentPart: result.percentPart,
  };

  return updated;
}