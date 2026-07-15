"use client";

import Link from "next/link";
import { MapPin, ArrowRight, Plane } from "lucide-react";
import useApp from "./hooks/useApp";

// All prices in BDT (base currency)
const cities = [
  {
    city: "Jeddah",
    code: "JED",
    country: "Saudi Arabia",
    price: 32000,
    direct: true,
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070",
  },
  {
    city: "Dubai",
    code: "DXB",
    country: "UAE",
    price: 25000,
    direct: false,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
  },
  {
    city: "Riyadh",
    code: "RUH",
    country: "Saudi Arabia",
    price: 39000,
    direct: true,
    image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=2070",
  },
  {
    city: "London",
    code: "LHR",
    country: "UK",
    price: 85000,
    direct: false,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070",
  },
  {
    city: "Singapore",
    code: "SIN",
    country: "Singapore",
    price: 57000,
    direct: false,
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070",
  },
  {
    city: "Istanbul",
    code: "IST",
    country: "Turkey",
    price: 57000,
    direct: false,
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070",
  },
];

export default function DestinationsSection() {
  const { t, formatPrice, container } = useApp();

  return (
    <section
      id="destinations"
      className="py-4 bg-gradient-to-b from-white to-gray-50"
    >
      <div className={container}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <MapPin size={16} /> {t.destinations.badge}
          </div>
          <h2 className="text-4xl font-bold text-[#0A2540]">
            {t.destinations.title}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {t.destinations.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {cities.map((city, i) => (
            <Link
              key={i}
              href="/login"
              className="group block bg-white rounded-[26px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-[0_18px_60px_rgba(2,6,23,0.12)] hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={city.image}
                  alt={city.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Code */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/95 backdrop-blur text-[#0A2540] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {city.code}
                  </span>
                </div>

                {/* Direct badge */}
                {city.direct && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {t.destinations.direct}
                    </span>
                  </div>
                )}

                {/* Bottom overlay content */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xl font-bold leading-tight">{city.city}</p>
                  <p className="text-xs text-white/80 mt-1">{city.country}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                      {t.destinations.from}
                    </p>
                    <p className="text-2xl font-black text-[#0A2540] mt-1">
                      {formatPrice(city.price)}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center shadow-md group-hover:bg-[#E31E24] group-hover:scale-110 transition-all duration-300">
                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Plane size={13} className="text-[#E31E24]" />
                    <span>{city.code}</span>
                  </div>
                  <span className="font-semibold text-[#0A2540] group-hover:text-[#E31E24] transition">
                    View Fare
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}