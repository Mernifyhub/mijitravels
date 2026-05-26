"use client";

import { MapPin } from "lucide-react";
import useApp from "./hooks/useApp";

// All prices in BDT (base currency)
const cities = [
  { city: "Jeddah", code: "JED", country: "Saudi Arabia", price: 32000, direct: true },
  { city: "Dubai", code: "DXB", country: "UAE", price: 25000, direct: false },
  { city: "Riyadh", code: "RUH", country: "Saudi Arabia", price: 39000, direct: true },
  { city: "London", code: "LHR", country: "UK", price: 85000, direct: false },
  { city: "Singapore", code: "SIN", country: "Singapore", price: 57000, direct: false },
  { city: "Istanbul", code: "IST", country: "Turkey", price: 57000, direct: false },
];

export default function DestinationsSection() {
  const { t, formatPrice, container } = useApp();

  return (
    <section id="destinations" className="py-20 bg-gray-50">
      <div className={container}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <MapPin size={16} /> {t.destinations.badge}
          </div>
          <h2 className="text-4xl font-bold text-[#0A2540]">{t.destinations.title}</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t.destinations.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {cities.map((city, i) => (
            <div
              key={i}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div className="h-44 bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] flex items-center justify-center text-white text-5xl font-black relative group-hover:scale-105 transition-transform duration-500">
                {city.code}
                {city.direct && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t.destinations.direct}
                  </div>
                )}
              </div>
              <div className="p-5 text-center">
                <p className="font-bold text-lg text-[#0A2540]">{city.city}</p>
                <p className="text-xs text-gray-500">{city.country}</p>
                <p className="text-[#E31E24] text-sm font-semibold mt-2">
                  {t.destinations.from} {formatPrice(city.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}