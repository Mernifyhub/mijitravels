"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Search, Globe, CheckCircle2, Clock3,
  ArrowRight, FileCheck2, Sparkles,
} from "lucide-react";
import Link from "next/link";
import useApp from "../hooks/useApp";
import { convertPrice } from "@/app/components/homepage/lib/currencyRates";

const countries = [
  { name: "United Arab Emirates", time: "3-5 Days", basePriceBDT: 8500, success: "98%", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070", flag: "🇦🇪" },
  { name: "Saudi Arabia", time: "5-7 Days", basePriceBDT: 12000, success: "97%", image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=2070", flag: "🇸🇦" },
  { name: "Malaysia", time: "2-3 Days", basePriceBDT: 6500, success: "99%", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2070", flag: "🇲🇾" },
  { name: "Singapore", time: "3-5 Days", basePriceBDT: 9000, success: "96%", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070", flag: "🇸🇬" },
  { name: "Thailand", time: "2-4 Days", basePriceBDT: 5500, success: "99%", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2070", flag: "🇹🇭" },
  { name: "Schengen (Europe)", time: "10-15 Days", basePriceBDT: 15000, success: "94%", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073", flag: "🇪🇺" },
];

const filters = [
  { key: "All", label: "All" },
  { key: "fast", label: "3 Days or Less" },
  { key: "highSuccess", label: "98%+ Success" },
  { key: "budget", label: "Budget Friendly" },
];

const getMinDays = (time) => {
  const nums = time.match(/\d+/g);
  return nums ? Number(nums[0]) : 999;
};

const getSuccessValue = (success) => Number(success.replace("%", ""));

export default function Visa() {
  const { country } = useApp();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const convert = (bdt) => convertPrice(bdt, country);

  const stats = useMemo(() => {
    const minPrice = Math.min(...countries.map((c) => c.basePriceBDT));
    const maxSuccess = Math.max(...countries.map((c) => getSuccessValue(c.success)));
    const fastest = countries.reduce((prev, curr) =>
      getMinDays(curr.time) < getMinDays(prev.time) ? curr : prev
    );
    return {
      total: countries.length,
      minPrice: convert(minPrice),
      maxSuccess: `${maxSuccess}%`,
      fastestTime: fastest.time,
    };
  }, [country]);

  const filteredCountries = useMemo(() => {
    let result = countries.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (activeFilter === "fast") result = result.filter((c) => getMinDays(c.time) <= 3);
    if (activeFilter === "highSuccess") result = result.filter((c) => getSuccessValue(c.success) >= 98);
    if (activeFilter === "budget") result = result.filter((c) => c.basePriceBDT <= 7000);
    return result;
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[280px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2035')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061229]/90 via-[#061229]/70 to-[#061229]/40" />

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
              <Shield className="text-cyan-400" size={16} />
              <span className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">
                {stats.total} Visa Destinations
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Visa Processing{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Made Clear
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <span className="text-slate-300 text-sm">Compare processing time, fee and success rate</span>
              <div className="hidden sm:flex items-center gap-3">
                <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                  From {stats.minPrice}
                </span>
                <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                  Best {stats.maxSuccess}
                </span>
                <span className="bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-cyan-200 font-semibold">
                  {country.currency} ({country.symbol})
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-2xl mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#0A2540] transition font-medium text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === filter.key
                      ? "bg-[#0A2540] text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Info Bar */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-2xl p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <FileCheck2 size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A2540]">Transparent Visa Overview</p>
                <p className="text-xs text-gray-600">Prices in {country.currency} — auto converted</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white text-[#0A2540] text-[10px] px-2.5 py-1 rounded-full font-bold border border-green-100">
                Starts {stats.minPrice}
              </span>
              <span className="bg-white text-[#0A2540] text-[10px] px-2.5 py-1 rounded-full font-bold border border-green-100">
                Best Success {stats.maxSuccess}
              </span>
              <span className="bg-white text-[#0A2540] text-[10px] px-2.5 py-1 rounded-full font-bold border border-green-100">
                Fastest {stats.fastestTime}
              </span>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0A2540]">
              {activeFilter === "All"
                ? "All Visa Destinations"
                : filters.find((f) => f.key === activeFilter)?.label}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredCountries.length} destination
              {filteredCountries.length !== 1 ? "s" : ""} • Prices in {country.currency}
            </p>
          </div>
        </div>

        {/* Grid */}
        {filteredCountries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Globe size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No destination found</p>
            <p className="text-sm text-gray-400 mt-1">Try changing your search or filter</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
            {filteredCountries.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2035";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-[#E31E24] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                      Visa Service
                    </span>
                    <span className="bg-cyan-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                      <Sparkles size={10} /> {c.flag} Destination
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <CheckCircle2 size={10} /> {c.success}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#0A2540] flex items-center gap-1">
                      <Clock3 size={10} /> {c.time}
                    </span>
                    <span className="bg-black/40 backdrop-blur px-2 py-1 rounded-lg text-white text-lg leading-none">
                      {c.flag}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[#0A2540] truncate group-hover:text-[#E31E24] transition">
                    {c.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Shield size={11} /> Visa processing support
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                      Processing: {c.time}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      Success: {c.success}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xl font-bold text-[#0A2540]">
                        {convert(c.basePriceBDT)}
                      </p>
                      <p className="text-[10px] text-gray-400 -mt-0.5">processing fee</p>
                    </div>

                    {/* ✅ Apply → /login */}
                    <Link
                      href="/login"
                      className="bg-[#0A2540] text-white p-2.5 rounded-xl group-hover:bg-[#E31E24] transition-all duration-300 group-hover:scale-110 shadow-md flex items-center justify-center"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}