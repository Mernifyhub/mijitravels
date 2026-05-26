"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { COUNTRIES, LANGUAGES, EXCHANGE_RATES, CONTAINER } from "../lib/constants";
import type { Country, Language, Translations, AppContextType } from "../lib/types";

import en from "../locales/en.json";
import ar from "../locales/ar.json";
import bn from "../locales/bn.json";

const translations: Record<string, Translations> = { en, ar, bn };

export const AppContext = createContext<AppContextType | null>(null);

function getLangByCode(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

// ✅ UAE country object find helper
function getUAECountry(): Country {
  return COUNTRIES.find((c) => c.currency === "AED") ?? COUNTRIES[0];
}

// ✅ English language object find helper
function getEnglishLang(): Language {
  return LANGUAGES.find((l) => l.code === "en") ?? LANGUAGES[0];
}

export default function AppProvider({ children }: { children: ReactNode }) {
  // ✅ Default: UAE country (AED/DH currency)
  const [country, setCountryState] = useState<Country>(getUAECountry());

  // ✅ Default: English language
  const [lang, setLangState] = useState<Language>(getEnglishLang());

  // ✅ Default: English translations
  const [t, setT] = useState<Translations>(en as Translations);

  useEffect(() => {
    setT((translations[lang.code] ?? en) as Translations);
  }, [lang.code]);

  // Country change → auto currency + auto language
  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    const defaultLang = getLangByCode(newCountry.defaultLang);
    setLangState(defaultLang);
  };

  // Currency change → only currency, language stays
  const setCurrency = (newCountry: Country) => {
    setCountryState(newCountry);
  };

  // Language change → only language
  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  // Convert BDT price to selected country currency
  const convertPrice = useCallback(
    (bdtPrice: number): string => {
      const rate = EXCHANGE_RATES[country.currency] ?? 1;
      const converted = bdtPrice * rate;

      // Smart formatting based on currency
      if (
        country.currency === "BDT" ||
        country.currency === "PKR" ||
        country.currency === "INR"
      ) {
        return Math.round(converted).toLocaleString();
      }

      // SAR, AED — show 2 decimal places
      return converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    [country.currency]
  );

  // Format with symbol: ৳ 1,249 or AED 42.46
  const formatPrice = useCallback(
    (bdtPrice: number): string => {
      return `${country.symbol} ${convertPrice(bdtPrice)}`;
    },
    [country.symbol, convertPrice]
  );

  // RTL support
  useEffect(() => {
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
  }, [lang]);

  const value: AppContextType = {
    country,
    lang,
    t,
    setCountry,
    setCurrency,
    setLang,
    convertPrice,
    formatPrice,
    container: CONTAINER,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}