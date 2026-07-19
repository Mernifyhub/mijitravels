"use client";

import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Plane,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import useApp from "./hooks/useApp";

const cities = [
  {
    city: "Jeddah",
    code: "JED",
    country: "Saudi Arabia",
    price: 32000,
    direct: true,
    trending: true,
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070",
  },
  {
    city: "Dubai",
    code: "DXB",
    country: "UAE",
    price: 25000,
    direct: false,
    trending: true,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
  },
  {
    city: "Riyadh",
    code: "RUH",
    country: "Saudi Arabia",
    price: 39000,
    direct: true,
    trending: false,
    image:
      "https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=2070",
  },
  {
    city: "London",
    code: "LHR",
    country: "UK",
    price: 85000,
    direct: false,
    trending: true,
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070",
  },
  {
    city: "Singapore",
    code: "SIN",
    country: "Singapore",
    price: 57000,
    direct: false,
    trending: false,
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070",
  },
  {
    city: "Istanbul",
    code: "IST",
    country: "Turkey",
    price: 57000,
    direct: false,
    trending: false,
    image:
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070",
  },
];

export default function DestinationsSection() {
  const { t, formatPrice, container } = useApp();

  return (
    <section
      id="destinations"
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-4 sm:py-6"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-[120px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-[120px] sm:h-96 sm:w-96" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0A2540 1px, transparent 1px), linear-gradient(90deg, #0A2540 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className={`${container} relative`}>
        {/* Header — compact */}
        <div className="mx-auto mb-2 max-w-3xl text-center sm:mb-5">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
            <Sparkles size={13} className="text-amber-500" />
            {t.destinations.badge}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Explore{" "}
            <span className="bg-black from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Top Destinations
            </span>
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5 xl:grid-cols-6 xl:gap-4">
          {cities.map((city, i) => (
            <Link
              key={i}
              href="/login"
              className="group relative block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_25px_60px_rgba(15,23,42,0.15)]"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden sm:h-52 xl:h-40">
                <img
                  src={city.image}
                  alt={city.city}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Top-left: Code only */}
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#0A2540] shadow-lg backdrop-blur">
                    {city.code}
                  </span>
                </div>

                {/* Top-right: ONE badge only (HOT or Direct, priority: HOT) */}
                <div className="absolute right-3 top-3">
                  {city.trending ? (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                      <TrendingUp size={10} />
                      HOT
                    </span>
                  ) : city.direct ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                      <Plane size={10} />
                      Direct
                    </span>
                  ) : null}
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xl font-black leading-tight drop-shadow-lg sm:text-2xl xl:text-lg">
                    {city.city}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/90">
                    <MapPin size={11} />
                    {city.country}
                  </p>
                </div>
              </div>

              {/* Content — Clean & Balanced */}
              <div className="p-4">
                {/* Price row */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.destinations.from}
                  </p>
                  <p className="mt-0.5 text-xl font-black text-[#0A2540] xl:text-lg">
                    {formatPrice(city.price)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    per person • one-way
                  </p>
                </div>

                {/* Divider */}
                <div className="my-3 h-px bg-slate-100" />

                {/* Bottom: Route + Arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Plane size={12} className="text-[#E31E24]" />
                    <span className="font-semibold">
                      DAC → {city.code}
                    </span>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2540] text-white shadow-md transition-colors duration-300 group-hover:bg-[#E31E24]">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-[#E31E24] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Bottom Button */}
        <div className="mt-5 flex justify-center sm:mt-6">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0A2540] to-[#0f3560] px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(10,37,64,0.25)] transition-all hover:shadow-[0_15px_40px_rgba(10,37,64,0.35)]"
          >
            View All Destinations
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}