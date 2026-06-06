"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Palmtree, MapPin, Calendar, Star, ArrowRight, Heart,
  Search, Globe, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import useApp from "../hooks/useApp";
import { convertPrice } from "@/app/components/homepage/lib/currencyRates";

const allPackages = [
  { name: "Thailand Explorer", location: "Thailand", basePriceBDT: 45000, days: "5D/4N", rating: 4.8, image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2070", tag: "Popular", region: "Asia", visa: "On Arrival", visaInfo: "VOA - 15 Days" },
  { name: "Bali Paradise", location: "Indonesia", basePriceBDT: 55000, days: "6D/5N", rating: 4.9, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038", tag: "Adventure", region: "Asia", visa: "On Arrival", visaInfo: "VOA - 30 Days" },
  { name: "Malaysia Discovery", location: "Malaysia", basePriceBDT: 42000, days: "5D/4N", rating: 4.7, image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2070", tag: "Family", region: "Asia", visa: "Free", visaInfo: "Visa Free 30D" },
  { name: "Singapore City", location: "Singapore", basePriceBDT: 70000, days: "4D/3N", rating: 4.8, image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070", tag: "City", region: "Asia", visa: "e-Visa", visaInfo: "E-Visa 3 Days" },
  { name: "Vietnam Heritage", location: "Vietnam", basePriceBDT: 38000, days: "6D/5N", rating: 4.6, image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070", tag: "Budget", region: "Asia", visa: "On Arrival", visaInfo: "VOA Available" },
  { name: "Cambodia Temples", location: "Cambodia", basePriceBDT: 35000, days: "5D/4N", rating: 4.5, image: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?q=80&w=2070", tag: "Heritage", region: "Asia", visa: "On Arrival", visaInfo: "E-Visa/VOA" },
  { name: "Dubai Luxury", location: "UAE", basePriceBDT: 75000, days: "4D/3N", rating: 4.9, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070", tag: "Luxury", region: "Middle East", visa: "On Arrival", visaInfo: "VOA 14 Days" },
  { name: "Qatar Premium", location: "Qatar", basePriceBDT: 82000, days: "4D/3N", rating: 4.8, image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=2070", tag: "Luxury", region: "Middle East", visa: "On Arrival", visaInfo: "Hayya - Free" },
  { name: "Oman Adventure", location: "Oman", basePriceBDT: 68000, days: "5D/4N", rating: 4.7, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2070", tag: "Adventure", region: "Middle East", visa: "e-Visa", visaInfo: "E-Visa 4 Days" },
  { name: "Jordan Discovery", location: "Jordan", basePriceBDT: 78000, days: "5D/4N", rating: 4.8, image: "https://images.unsplash.com/photo-1580834341580-8c17a3a630c8?q=80&w=2070", tag: "Heritage", region: "Middle East", visa: "On Arrival", visaInfo: "VOA Available" },
  { name: "Maldives Paradise", location: "Maldives", basePriceBDT: 85000, days: "5D/4N", rating: 4.9, image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2070", tag: "Honeymoon", region: "Islands", visa: "Free", visaInfo: "Free 30 Days" },
  { name: "Sri Lanka Wonder", location: "Sri Lanka", basePriceBDT: 40000, days: "6D/5N", rating: 4.7, image: "https://images.unsplash.com/photo-1586523969990-8b53a67ff2e0?q=80&w=2070", tag: "Nature", region: "Islands", visa: "e-Visa", visaInfo: "ETA Online" },
  { name: "Nepal Mountains", location: "Nepal", basePriceBDT: 28000, days: "5D/4N", rating: 4.6, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070", tag: "Budget", region: "South Asia", visa: "On Arrival", visaInfo: "VOA Free" },
  { name: "Bhutan Bliss", location: "Bhutan", basePriceBDT: 95000, days: "6D/5N", rating: 4.9, image: "https://images.unsplash.com/photo-1553856622-d1b352e24bc4?q=80&w=2070", tag: "Exclusive", region: "South Asia", visa: "Permit", visaInfo: "Permit Required" },
  { name: "Kashmir Beauty", location: "India", basePriceBDT: 32000, days: "6D/5N", rating: 4.8, image: "https://images.unsplash.com/photo-1566837497312-7be4a47f7c2e?q=80&w=2070", tag: "Nature", region: "South Asia", visa: "Visa Required", visaInfo: "Tourist Visa" },
  { name: "Kolkata Heritage", location: "India", basePriceBDT: 18000, days: "3D/2N", rating: 4.5, image: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=2070", tag: "Budget", region: "South Asia", visa: "Visa Required", visaInfo: "Tourist Visa" },
  { name: "Tokyo Neon", location: "Japan", basePriceBDT: 120000, days: "7D/6N", rating: 4.9, image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2070", tag: "Premium", region: "East Asia", visa: "e-Visa", visaInfo: "E-Visa Available" },
  { name: "Seoul Wave", location: "South Korea", basePriceBDT: 85000, days: "5D/4N", rating: 4.8, image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2070", tag: "Trending", region: "East Asia", visa: "e-Visa", visaInfo: "K-ETA" },
  { name: "Istanbul Magic", location: "Turkey", basePriceBDT: 72000, days: "5D/4N", rating: 4.8, image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070", tag: "Popular", region: "Europe", visa: "e-Visa", visaInfo: "E-Visa Instant" },
  { name: "Paris Romance", location: "France", basePriceBDT: 150000, days: "7D/6N", rating: 4.9, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073", tag: "Premium", region: "Europe", visa: "Schengen", visaInfo: "Schengen Visa" },
  { name: "London Classic", location: "UK", basePriceBDT: 145000, days: "6D/5N", rating: 4.8, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070", tag: "Premium", region: "Europe", visa: "Visa Required", visaInfo: "UK Visa" },
  { name: "Switzerland Alps", location: "Switzerland", basePriceBDT: 165000, days: "6D/5N", rating: 4.9, image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070", tag: "Premium", region: "Europe", visa: "Schengen", visaInfo: "Schengen Visa" },
  { name: "Egypt Pyramids", location: "Egypt", basePriceBDT: 65000, days: "5D/4N", rating: 4.7, image: "https://images.unsplash.com/photo-1539768942893-daf53e736b68?q=80&w=2070", tag: "Heritage", region: "Africa", visa: "On Arrival", visaInfo: "VOA Available" },
  { name: "Morocco Exotic", location: "Morocco", basePriceBDT: 78000, days: "6D/5N", rating: 4.6, image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=2070", tag: "Adventure", region: "Africa", visa: "Free", visaInfo: "Visa Free" },
];

const regions = ["All", "Asia", "Middle East", "Islands", "South Asia", "East Asia", "Europe", "Africa"];

const visaConfig = {
  "Free": { color: "bg-green-500", text: "text-white", icon: "✓" },
  "On Arrival": { color: "bg-blue-500", text: "text-white", icon: "🛬" },
  "e-Visa": { color: "bg-cyan-500", text: "text-white", icon: "💻" },
  "Visa Required": { color: "bg-amber-500", text: "text-white", icon: "📄" },
  "Schengen": { color: "bg-purple-500", text: "text-white", icon: "🇪🇺" },
  "Permit": { color: "bg-pink-500", text: "text-white", icon: "🎫" },
};

export default function Holidays() {
  const { country } = useApp();
  const [activeRegion, setActiveRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const convert = (bdt) => convertPrice(bdt, country);

  const filteredPackages = useMemo(() => {
    return allPackages.filter((pkg) => {
      const matchRegion = activeRegion === "All" || pkg.region === activeRegion;
      const matchSearch =
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [activeRegion, searchQuery]);

  const getVisaStyle = (visa) => visaConfig[visa] || visaConfig["Visa Required"];

  const lowestPrice = useMemo(
    () => convert(Math.min(...allPackages.map((p) => p.basePriceBDT))),
    [country]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[280px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061229]/90 via-[#061229]/70 to-[#061229]/40" />

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
              <Palmtree className="text-cyan-400" size={16} />
              <span className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">
                {allPackages.length} Dream Destinations
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Holiday Awaits
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <span className="text-slate-300 text-sm">Handpicked destinations with easy visa process</span>
              <div className="hidden sm:flex items-center gap-3">
                <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                  From {lowestPrice}
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
                placeholder="Search destinations, countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#0A2540] transition font-medium text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeRegion === region
                      ? "bg-[#0A2540] text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visa Info Bar */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-2xl p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A2540]">Visa Assistance Included</p>
                <p className="text-xs text-gray-600">Prices in {country.currency} — auto converted</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(visaConfig).slice(0, 4).map(([type, config]) => (
                <span key={type} className={`${config.color} ${config.text} text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1`}>
                  <span>{config.icon}</span> {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0A2540]">
              {activeRegion === "All" ? "All Destinations" : activeRegion}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredPackages.length} packages • Prices in {country.currency}
            </p>
          </div>
        </div>

        {/* Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Globe size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No packages found</p>
            <p className="text-sm text-gray-400 mt-1">Try changing your search or filter</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
            {filteredPackages.map((pkg, i) => {
              const visaStyle = getVisaStyle(pkg.visa);
              return (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="bg-[#E31E24] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                        {pkg.tag}
                      </span>
                      <span className={`${visaStyle.color} ${visaStyle.text} text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1`}>
                        <span>{visaStyle.icon}</span> {pkg.visa}
                      </span>
                    </div>

                    {/* ✅ Heart → /login */}
                    <Link
                      href="/login"
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition group/heart shadow-lg"
                    >
                      <Heart size={14} className="text-gray-600 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition" />
                    </Link>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#0A2540] flex items-center gap-1">
                        <Calendar size={10} /> {pkg.days}
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-1 rounded-lg">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-white">{pkg.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-[#0A2540] truncate group-hover:text-[#E31E24] transition">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {pkg.location}
                    </p>

                    <div className="mt-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                        {pkg.visaInfo}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xl font-bold text-[#0A2540]">
                          {convert(pkg.basePriceBDT)}
                        </p>
                        <p className="text-[10px] text-gray-400 -mt-0.5">per person</p>
                      </div>

                      {/* ✅ Arrow → /login */}
                      <Link
                        href="/login"
                        className="bg-[#0A2540] text-white p-2.5 rounded-xl group-hover:bg-[#E31E24] transition-all duration-300 group-hover:scale-110 shadow-md flex items-center justify-center"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}