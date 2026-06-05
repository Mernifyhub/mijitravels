import type { Country, Language } from "./types";

export const COUNTRIES: Country[] = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", symbol: "SAR", defaultLang: "ar" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", symbol: "AED", defaultLang: "ar" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT", symbol: "TK", defaultLang: "bn" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR", symbol: "₨", defaultLang: "en" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", symbol: "INR", defaultLang: "en" },
];

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "bn", label: "Bengali", native: "বাংলা", dir: "ltr" },
];

// Base currency: BDT (all prices are stored in BDT)
// Exchange rates: 1 BDT = ? target currency
// Future: fetch from API
export const EXCHANGE_RATES: Record<string, number> = {
  BDT: 1,        // Base
  SAR: 0.034,    // 1 BDT = 0.034 SAR
  AED: 0.033,    // 1 BDT = 0.033 AED
  PKR: 2.53,     // 1 BDT = 2.53 PKR
  INR: 0.76,     // 1 BDT = 0.76 INR
  USD: 0.0091,   // 1 BDT = 0.0091 USD (future use)
};

export const DEFAULT_COUNTRY = COUNTRIES[2]; // Bangladesh
export const DEFAULT_LANG = LANGUAGES[0];    // English
export const CONTAINER = "max-w-7xl mx-auto px-5 sm:px-8 lg:px-12";