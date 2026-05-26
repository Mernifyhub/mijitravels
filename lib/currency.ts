import type { FareBreakdown } from "@/lib/fare";

// ==========================================
// Constants
// ==========================================

export const DISPLAY_CURRENCY = "SAR";

// ==========================================
// Types
// ==========================================

export type SupportedCurrency =
  | "SAR"
  | "USD"
  | "EUR"
  | "GBP"
  | "BDT"
  | "AED"
  | "INR"
  | string;

export interface DisplayFare {
  currency: string;
  originalCurrency: string;
  converted: boolean;
  exchangeRate: number;

  amount: number;
  baseFare: number;
  taxAmount: number;
  totalFare: number;
  totalBaseTax: number;
  customerInvoiceTotal: number;
  grandTotal: number;
  discountOrCommission: number;
  perPerson: number;

  raw?: FareBreakdown | Record<string, any> | null;
}

// ==========================================
// Exchange Rates
// ==========================================

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    USD: 1,
    SAR: 3.75,
    EUR: 0.92,
    GBP: 0.79,
    BDT: 110.0,
    AED: 3.67,
    INR: 83.5,
  },
  SAR: {
    SAR: 1,
    USD: 0.2667,
    EUR: 0.245,
    GBP: 0.211,
    BDT: 29.33,
    AED: 0.978,
    INR: 22.27,
  },
  EUR: {
    EUR: 1,
    USD: 1.087,
    SAR: 4.08,
    GBP: 0.859,
    BDT: 119.57,
    AED: 3.99,
    INR: 90.76,
  },
  GBP: {
    GBP: 1,
    USD: 1.266,
    SAR: 4.75,
    EUR: 1.164,
    BDT: 139.2,
    AED: 4.645,
    INR: 105.7,
  },
  BDT: {
    BDT: 1,
    USD: 0.00909,
    SAR: 0.0341,
    EUR: 0.00836,
    GBP: 0.00719,
    AED: 0.0334,
    INR: 0.759,
  },
  AED: {
    AED: 1,
    USD: 0.2725,
    SAR: 1.0225,
    EUR: 0.2506,
    GBP: 0.2153,
    BDT: 29.96,
    INR: 22.75,
  },
  INR: {
    INR: 1,
    USD: 0.01198,
    SAR: 0.0449,
    EUR: 0.01102,
    GBP: 0.00946,
    BDT: 1.317,
    AED: 0.04396,
  },
};

// ==========================================
// Helpers
// ==========================================

function round2(value: number): number {
  return Math.round((value || 0) * 100) / 100;
}

function normalizeCurrency(currency?: string | null): string {
  return String(currency || DISPLAY_CURRENCY).trim().toUpperCase();
}

function toNum(value: any): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isNumericLike(value: any): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string" && value.trim() !== "") {
    return !Number.isNaN(Number(value));
  }
  return false;
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function extractCurrency(fare?: any, fallback = DISPLAY_CURRENCY): string {
  return normalizeCurrency(
    fare?.currency ||
      fare?.originalCurrency ||
      fare?.price?.currency ||
      fare?.priceBreakdown?.currency ||
      fallback
  );
}

function getNested(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function pickFirstNumber(obj: any, paths: string[]): number {
  for (const path of paths) {
    const value = getNested(obj, path);
    if (isNumericLike(value)) return toNum(value);
  }
  return 0;
}

// Monetary fields only — these will be converted
const MONEY_KEYS = new Set([
  "amount",
  "base",
  "baseFare",
  "tax",
  "taxes",
  "taxAmount",
  "fees",
  "fee",
  "markup",
  "commission",
  "discount",
  "discountOrCommission",
  "total",
  "totalFare",
  "totalBaseTax",
  "customerInvoiceTotal",
  "grandTotal",
  "perPerson",
  "subtotal",
  "subTotal",
  "netFare",
  "sellingPrice",
  "payable",
]);

function deepConvertMoneyFields(value: any, from: string, to: string): any {
  if (Array.isArray(value)) {
    return value.map((item) => deepConvertMoneyFields(item, from, to));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const cloned: Record<string, any> = { ...value };

  for (const key of Object.keys(cloned)) {
    const current = cloned[key];

    if (key === "currency" && typeof current === "string") {
      cloned[key] = to;
      continue;
    }

    if (MONEY_KEYS.has(key) && isNumericLike(current)) {
      cloned[key] = round2(convertCurrency(toNum(current), from, to));
      continue;
    }

    if (current && typeof current === "object") {
      cloned[key] = deepConvertMoneyFields(current, from, to);
    }
  }

  return cloned;
}

// ==========================================
// Core Currency Helpers
// ==========================================

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return round2(amount);

  const directRate = EXCHANGE_RATES[from]?.[to];
  if (directRate) {
    return round2(amount * directRate);
  }

  const toUsd = EXCHANGE_RATES[from]?.USD;
  const fromUsd = EXCHANGE_RATES.USD?.[to];

  if (toUsd && fromUsd) {
    return round2(amount * toUsd * fromUsd);
  }

  console.warn(
    `⚠️ No exchange rate found for ${from} → ${to}. Returning original amount.`
  );
  return round2(amount);
}

export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): number {
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (from === to) return 1;

  const direct = EXCHANGE_RATES[from]?.[to];
  if (direct) return round2(direct);

  const toUsd = EXCHANGE_RATES[from]?.USD;
  const fromUsd = EXCHANGE_RATES.USD?.[to];

  if (toUsd && fromUsd) {
    return round2(toUsd * fromUsd);
  }

  return 1;
}

export function getSupportedCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES);
}

export function isSupportedCurrency(currency: string): boolean {
  return normalizeCurrency(currency) in EXCHANGE_RATES;
}

export function getDisplayCurrency(_hostname?: string): string {
  return normalizeCurrency(
    process.env.NEXT_PUBLIC_DISPLAY_CURRENCY || DISPLAY_CURRENCY
  );
}

export function formatCurrency(amount: number, currency: string): string {
  const c = normalizeCurrency(currency);

  const symbols: Record<string, string> = {
    USD: "$",
    SAR: "﷼",
    EUR: "€",
    GBP: "£",
    BDT: "৳",
    AED: "د.إ",
    INR: "₹",
  };

  const symbol = symbols[c] || c;
  return `${symbol}${round2(amount).toLocaleString()}`;
}

// ==========================================
// Fare Conversion Helpers
// ==========================================

export function convertFare<T extends Record<string, any> | null | undefined>(
  fare: T,
  targetCurrency: string = DISPLAY_CURRENCY,
  sourceCurrency?: string
): T {
  if (!fare) return fare;

  const from = normalizeCurrency(sourceCurrency || extractCurrency(fare));
  const to = normalizeCurrency(targetCurrency);

  if (from === to) {
    const same = clonePlain(fare);
    if (same && typeof same === "object") {
      (same as any).currency = to;
      if (!(same as any).originalCurrency) {
        (same as any).originalCurrency = from;
      }
      (same as any).converted = false;
    }
    return same;
  }

  const cloned = clonePlain(fare);
  const converted = deepConvertMoneyFields(cloned, from, to);

  if (converted && typeof converted === "object") {
    converted.currency = to;
    if (!converted.originalCurrency) {
      converted.originalCurrency = from;
    }
    converted.converted = true;
    converted.exchangeRate = getExchangeRate(from, to);
  }

  return converted as T;
}

export function convertFareToDisplay(
  fare?: FareBreakdown | Record<string, any> | null,
  hostname?: string
): DisplayFare {
  const displayCurrency = getDisplayCurrency(hostname);

  if (!fare) {
    return {
      currency: displayCurrency,
      originalCurrency: displayCurrency,
      converted: false,
      exchangeRate: 1,
      amount: 0,
      baseFare: 0,
      taxAmount: 0,
      totalFare: 0,
      totalBaseTax: 0,
      customerInvoiceTotal: 0,
      grandTotal: 0,
      discountOrCommission: 0,
      perPerson: 0,
      raw: fare ?? null,
    };
  }

  const originalCurrency = extractCurrency(fare, displayCurrency);
  const convertedFare = convertFare(
    fare as Record<string, any>,
    displayCurrency,
    originalCurrency
  ) as Record<string, any>;

  const baseFare = pickFirstNumber(convertedFare, [
    "baseFare",
    "base",
    "price.base",
    "priceBreakdown.agentUi.baseFare",
  ]);

  const taxAmount = pickFirstNumber(convertedFare, [
    "taxAmount",
    "tax",
    "priceBreakdown.agentUi.taxAmount",
  ]);

  const totalBaseTax = pickFirstNumber(convertedFare, [
    "totalBaseTax",
    "totalFare",
    "price.total",
    "priceBreakdown.agentUi.totalBaseTax",
  ]);

  const customerInvoiceTotal = pickFirstNumber(convertedFare, [
    "customerInvoiceTotal",
    "priceBreakdown.agentUi.customerInvoiceTotal",
  ]);

  const grandTotal = pickFirstNumber(convertedFare, [
    "grandTotal",
    "price.grandTotal",
    "priceBreakdown.agentUi.grandTotal",
  ]);

  const discountOrCommission = pickFirstNumber(convertedFare, [
    "discountOrCommission",
    "priceBreakdown.agentUi.discountOrCommission",
  ]);

  const perPerson = pickFirstNumber(convertedFare, [
    "perPerson",
    "priceBreakdown.agentUi.perPerson",
  ]);

  const amount =
    grandTotal || customerInvoiceTotal || totalBaseTax || baseFare + taxAmount;

  return {
    currency: displayCurrency,
    originalCurrency,
    converted: originalCurrency !== displayCurrency,
    exchangeRate: getExchangeRate(originalCurrency, displayCurrency),
    amount: round2(amount),
    baseFare: round2(baseFare),
    taxAmount: round2(taxAmount),
    totalFare: round2(totalBaseTax || amount),
    totalBaseTax: round2(totalBaseTax || baseFare + taxAmount),
    customerInvoiceTotal: round2(customerInvoiceTotal || totalBaseTax || amount),
    grandTotal: round2(grandTotal || amount),
    discountOrCommission: round2(discountOrCommission),
    perPerson: round2(perPerson),
    raw: convertedFare,
  };
}