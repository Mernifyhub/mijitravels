// src/components/search-results/airlineData.tsx
// ✅ .tsx extension — JSX is allowed here

import Image from "next/image";
import type { AirlineFilter } from "./helpers";

// ==================== AIRLINE LOGO HELPER ====================

export const airlineLogo = (code: string, alt: string): React.ReactNode => (
  <div className="relative w-8 h-8 flex-shrink-0">
    <Image
      src={`https://pics.avs.io/80/80/${code}.png`}
      alt={alt}
      width={34}
      height={34}
      className="object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
);

// ==================== AIRLINE FILTERS DATA ====================

export const AIRLINE_FILTERS: AirlineFilter[] = [
  {
    name: "All",
    code: "ALL",
    price: "0",
    logo: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm">✈</span>
      </div>
    ),
  },
  // ── Middle East ────────────────────────────────────────────
  { name: "Emirates",       code: "EK", price: "0", logo: airlineLogo("EK", "Emirates")          },
  { name: "Qatar Airways",  code: "QR", price: "0", logo: airlineLogo("QR", "Qatar Airways")     },
  { name: "Etihad",         code: "EY", price: "0", logo: airlineLogo("EY", "Etihad Airways")    },
  { name: "flydubai",       code: "FZ", price: "0", logo: airlineLogo("FZ", "flydubai")          },
  { name: "Air Arabia",     code: "G9", price: "0", logo: airlineLogo("G9", "Air Arabia")        },
  { name: "Saudia",         code: "SV", price: "0", logo: airlineLogo("SV", "Saudia")            },
  { name: "Oman Air",       code: "WY", price: "0", logo: airlineLogo("WY", "Oman Air")          },
  { name: "Kuwait Airways", code: "KU", price: "0", logo: airlineLogo("KU", "Kuwait Airways")    },
  { name: "Gulf Air",       code: "GF", price: "0", logo: airlineLogo("GF", "Gulf Air")          },
  // ── South Asia ────────────────────────────────────────────
  { name: "Biman",          code: "BG", price: "0", logo: airlineLogo("BG", "Biman Bangladesh")  },
  { name: "US-Bangla",      code: "BS", price: "0", logo: airlineLogo("BS", "US-Bangla Airlines")},
  { name: "Air India",      code: "AI", price: "0", logo: airlineLogo("AI", "Air India")         },
  { name: "IndiGo",         code: "6E", price: "0", logo: airlineLogo("6E", "IndiGo")            },
  { name: "SpiceJet",       code: "SG", price: "0", logo: airlineLogo("SG", "SpiceJet")          },
  { name: "SriLankan",      code: "UL", price: "0", logo: airlineLogo("UL", "SriLankan Airlines")},
  // ── Asia ──────────────────────────────────────────────────
  { name: "Singapore",      code: "SQ", price: "0", logo: airlineLogo("SQ", "Singapore Airlines")},
  { name: "Malaysia",       code: "MH", price: "0", logo: airlineLogo("MH", "Malaysia Airlines") },
  { name: "Thai Airways",   code: "TG", price: "0", logo: airlineLogo("TG", "Thai Airways")      },
  { name: "Cathay Pacific", code: "CX", price: "0", logo: airlineLogo("CX", "Cathay Pacific")    },
  { name: "ANA",            code: "NH", price: "0", logo: airlineLogo("NH", "All Nippon Airways") },
  { name: "JAL",            code: "JL", price: "0", logo: airlineLogo("JL", "Japan Airlines")    },
  { name: "Korean Air",     code: "KE", price: "0", logo: airlineLogo("KE", "Korean Air")        },
  { name: "EVA Air",        code: "BR", price: "0", logo: airlineLogo("BR", "EVA Air")            },
  { name: "China Southern", code: "CZ", price: "0", logo: airlineLogo("CZ", "China Southern")    },
  { name: "China Eastern",  code: "MU", price: "0", logo: airlineLogo("MU", "China Eastern")     },
  // ── Europe ────────────────────────────────────────────────
  { name: "Turkish",        code: "TK", price: "0", logo: airlineLogo("TK", "Turkish Airlines")  },
  { name: "British Airways",code: "BA", price: "0", logo: airlineLogo("BA", "British Airways")   },
  { name: "Lufthansa",      code: "LH", price: "0", logo: airlineLogo("LH", "Lufthansa")         },
  { name: "KLM",            code: "KL", price: "0", logo: airlineLogo("KL", "KLM")               },
  { name: "Air France",     code: "AF", price: "0", logo: airlineLogo("AF", "Air France")        },
  { name: "SWISS",          code: "LX", price: "0", logo: airlineLogo("LX", "SWISS")             },
  { name: "Austrian",       code: "OS", price: "0", logo: airlineLogo("OS", "Austrian Airlines") },
  { name: "Finnair",        code: "AY", price: "0", logo: airlineLogo("AY", "Finnair")           },
  { name: "Iberia",         code: "IB", price: "0", logo: airlineLogo("IB", "Iberia")            },
  { name: "LOT",            code: "LO", price: "0", logo: airlineLogo("LO", "LOT Polish Airlines")},
  { name: "Pegasus",        code: "PC", price: "0", logo: airlineLogo("PC", "Pegasus Airlines")  },
  // ── Americas ──────────────────────────────────────────────
  { name: "American",       code: "AA", price: "0", logo: airlineLogo("AA", "American Airlines") },
  { name: "Delta",          code: "DL", price: "0", logo: airlineLogo("DL", "Delta Air Lines")   },
  { name: "United",         code: "UA", price: "0", logo: airlineLogo("UA", "United Airlines")   },
  { name: "Air Canada",     code: "AC", price: "0", logo: airlineLogo("AC", "Air Canada")        },
  // ── Oceania ───────────────────────────────────────────────
  { name: "Qantas",         code: "QF", price: "0", logo: airlineLogo("QF", "Qantas")            },
];