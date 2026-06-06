"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plane, Search, Calendar, Users, ArrowRight,
  ArrowLeftRight, MapPin, TrendingDown, Clock,
} from "lucide-react";
import Link from "next/link";
import useApp from "../hooks/useApp";
import { convertPrice } from "../lib/currencyRates";

const popularRoutes = [
  { from: "Dhaka", to: "Dubai", basePriceBDT: 32000, airline: "Emirates", duration: "4h 45m", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070" },
  { from: "Dhaka", to: "London", basePriceBDT: 85000, airline: "Qatar Airways", duration: "12h 15m", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070" },
  { from: "Dhaka", to: "Bangkok", basePriceBDT: 28000, airline: "Thai Airways", duration: "3h 30m", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2070" },
  { from: "Dhaka", to: "Singapore", basePriceBDT: 38000, airline: "Singapore Air", duration: "4h 20m", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070" },
  { from: "Dhaka", to: "Kuala Lumpur", basePriceBDT: 30000, airline: "Malaysia Air", duration: "4h 10m", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2070" },
  { from: "Dhaka", to: "Istanbul", basePriceBDT: 57000, airline: "Turkish Air", duration: "8h 20m", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070" },
];

export default function Flights() {
  const { country } = useApp();
  const [tripType, setTripType] = useState("oneway");

  const convert = (bdt) => convertPrice(bdt, country);

  const routes = useMemo(() =>
    popularRoutes.map((r) => ({
      ...r,
      displayPrice: convert(r.basePriceBDT),
    })),
  [country]);

  const lowestPrice = useMemo(() =>
    convert(Math.min(...popularRoutes.map((r) => r.basePriceBDT))),
  [country]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="relative h-[320px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061229]/90 via-[#061229]/75 to-[#061229]/40" />

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
              <Plane className="text-cyan-400" size={16} style={{ transform: "rotate(-45deg)" }} />
              <span className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">
                Best Flight Deals
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Fly Anywhere,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Pay Less
              </span>
            </h1>

            <p className="text-slate-300 mt-3 max-w-xl text-sm">
              Compare and book flights from 500+ airlines worldwide with exclusive agent fares.
            </p>

            <div className="hidden sm:flex items-center gap-3 mt-4">
              <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                From {lowestPrice}
              </span>
              <span className="bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-cyan-200 font-semibold">
                {country.currency} ({country.symbol})
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-5 md:p-6 shadow-[0_20px_60px_rgba(2,6,23,0.12)] border border-gray-100"
        >
          {/* Trip Type */}
          <div className="flex gap-2 mb-5">
            {[
              { key: "oneway", label: "One Way" },
              { key: "round", label: "Round Trip" },
              { key: "multi", label: "Multi City" },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setTripType(type.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  tripType === type.key
                    ? "bg-[#0A2540] text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Fields */}
          <div className="grid md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">FROM</label>
              <div className="group flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 h-[54px] focus-within:border-[#0A2540] transition bg-gray-50 focus-within:bg-white">
                <MapPin size={18} className="text-gray-400 group-focus-within:text-[#0A2540]" />
                <input type="text" placeholder="Dhaka (DAC)" className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-1 flex items-end justify-center pb-1">
              <button className="w-10 h-10 bg-[#0A2540] rounded-full flex items-center justify-center text-white hover:rotate-180 transition-transform duration-500 shadow-lg">
                <ArrowLeftRight size={15} />
              </button>
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">TO</label>
              <div className="group flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 h-[54px] focus-within:border-[#0A2540] transition bg-gray-50 focus-within:bg-white">
                <MapPin size={18} className="text-gray-400 group-focus-within:text-[#0A2540]" />
                <input type="text" placeholder="Dubai (DXB)" className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">DEPARTURE</label>
              <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 h-[54px] hover:border-[#0A2540] transition bg-gray-50">
                <Calendar size={16} className="text-gray-400" />
                <input type="date" className="outline-none w-full bg-transparent text-sm" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">PASSENGERS</label>
              <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 h-[54px] hover:border-[#0A2540] transition bg-gray-50">
                <Users size={16} className="text-gray-400" />
                <select defaultValue="1" className="outline-none w-full bg-transparent text-sm font-medium">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>
            </div>

            {/* ✅ Search → /login */}
            <div className="md:col-span-1 flex items-end">
              <Link
                href="/login"
                className="w-full h-[54px] bg-[#E31E24] hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-center transition shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                <Search size={20} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* POPULAR ROUTES */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0A2540]">Popular Routes</h2>
            <p className="text-gray-500 mt-1">
              Best deals on trending destinations • Prices in {country.currency}
            </p>
          </div>
          <span className="flex items-center gap-2 text-[#E31E24] font-semibold text-sm">
            <TrendingDown size={18} /> Lowest Prices
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {routes.map((route, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-[24px] overflow-hidden shadow-[0_8px_40px_rgba(2,6,23,0.06)] border border-gray-100 hover:shadow-[0_16px_60px_rgba(2,6,23,0.12)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={route.image}
                  alt={route.to}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="bg-white/95 backdrop-blur text-[#0A2540] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                    {route.airline}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="bg-black/40 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock size={10} /> {route.duration}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <span>{route.from}</span>
                    <Plane size={16} className="rotate-90" />
                    <span>{route.to}</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#0A2540]">
                      {route.displayPrice}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      per person • one way
                    </p>
                  </div>

                  {/* ✅ Book → /login */}
                  <Link
                    href="/login"
                    className="bg-[#0A2540] text-white px-5 py-3 rounded-xl font-semibold text-sm group-hover:bg-[#E31E24] transition-all duration-300 flex items-center gap-2 shadow-md group-hover:scale-105"
                  >
                    Book <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}