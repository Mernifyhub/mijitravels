"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Search, MapPin, Star, Calendar,
  Users, Wifi, Coffee, Car, ArrowRight, Heart, Globe,
} from "lucide-react";
import Link from "next/link";
import useApp from "../hooks/useApp";
import { convertPrice } from "@/app/components/homepage/lib/currencyRates";

const hotels = [
  { name: "Burj Al Arab", location: "Dubai, UAE", basePriceBDT: 45000, rating: 5, reviews: 2847, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070", region: "Middle East" },
  { name: "Atlantis The Palm", location: "Dubai, UAE", basePriceBDT: 38000, rating: 5, reviews: 3412, image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2070", region: "Middle East" },
  { name: "JW Marriott Marquis", location: "Dubai, UAE", basePriceBDT: 22000, rating: 4.8, reviews: 1987, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070", region: "Middle East" },
  { name: "Makkah Clock Tower", location: "Makkah, KSA", basePriceBDT: 28000, rating: 5, reviews: 1923, image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070", region: "Middle East" },
  { name: "Ritz-Carlton Riyadh", location: "Riyadh, KSA", basePriceBDT: 35000, rating: 5, reviews: 1654, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070", region: "Middle East" },
  { name: "Mondrian Doha", location: "Doha, Qatar", basePriceBDT: 30000, rating: 4.9, reviews: 1245, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2070", region: "Middle East" },
  { name: "Marina Bay Sands", location: "Singapore", basePriceBDT: 38000, rating: 5, reviews: 4521, image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=2070", region: "Asia" },
  { name: "Raffles Singapore", location: "Singapore", basePriceBDT: 42000, rating: 5, reviews: 2876, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070", region: "Asia" },
  { name: "Shangri-La KL", location: "Kuala Lumpur, Malaysia", basePriceBDT: 15000, rating: 4.8, reviews: 2134, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070", region: "Asia" },
  { name: "The Datai Langkawi", location: "Langkawi, Malaysia", basePriceBDT: 25000, rating: 4.9, reviews: 1876, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080", region: "Asia" },
  { name: "Mandarin Oriental", location: "Bangkok, Thailand", basePriceBDT: 22000, rating: 5, reviews: 2156, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070", region: "Asia" },
  { name: "Anantara Riverside", location: "Bangkok, Thailand", basePriceBDT: 18000, rating: 4.7, reviews: 1543, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070", region: "Asia" },
  { name: "Centara Grand Beach", location: "Phuket, Thailand", basePriceBDT: 16000, rating: 4.8, reviews: 1987, image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070", region: "Asia" },
  { name: "Four Seasons Bali", location: "Bali, Indonesia", basePriceBDT: 32000, rating: 5, reviews: 2345, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038", region: "Asia" },
  { name: "Soneva Fushi", location: "Maldives", basePriceBDT: 65000, rating: 5, reviews: 1876, image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2070", region: "Islands" },
  { name: "Conrad Rangali", location: "Maldives", basePriceBDT: 58000, rating: 5, reviews: 2134, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2070", region: "Islands" },
  { name: "Heritance Kandalama", location: "Dambulla, Sri Lanka", basePriceBDT: 12000, rating: 4.7, reviews: 1432, image: "https://images.unsplash.com/photo-1586523969990-8b53a67ff2e0?q=80&w=2070", region: "Islands" },
  { name: "The Ritz London", location: "London, UK", basePriceBDT: 52000, rating: 5, reviews: 3214, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070", region: "Europe" },
  { name: "The Savoy", location: "London, UK", basePriceBDT: 48000, rating: 5, reviews: 2876, image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070", region: "Europe" },
  { name: "Le Meurice", location: "Paris, France", basePriceBDT: 55000, rating: 5, reviews: 2543, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073", region: "Europe" },
  { name: "Four Seasons Istanbul", location: "Istanbul, Turkey", basePriceBDT: 35000, rating: 5, reviews: 1876, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080", region: "Europe" },
  { name: "Ciragan Palace", location: "Istanbul, Turkey", basePriceBDT: 40000, rating: 5, reviews: 2198, image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070", region: "Europe" },
  { name: "Badrutt's Palace", location: "St. Moritz, Switzerland", basePriceBDT: 62000, rating: 5, reviews: 1654, image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070", region: "Europe" },
  { name: "Marriott Mena House", location: "Cairo, Egypt", basePriceBDT: 18000, rating: 4.8, reviews: 2345, image: "https://images.unsplash.com/photo-1539768942893-daf53e736b68?q=80&w=2070", region: "Africa" },
  { name: "Royal Mansour", location: "Marrakech, Morocco", basePriceBDT: 42000, rating: 5, reviews: 1567, image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=2070", region: "Africa" },
  { name: "Park Hyatt Tokyo", location: "Tokyo, Japan", basePriceBDT: 48000, rating: 5, reviews: 3456, image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2070", region: "East Asia" },
  { name: "Aman Tokyo", location: "Tokyo, Japan", basePriceBDT: 55000, rating: 5, reviews: 1234, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2070", region: "East Asia" },
  { name: "Signiel Seoul", location: "Seoul, South Korea", basePriceBDT: 35000, rating: 5, reviews: 1876, image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2070", region: "East Asia" },
  { name: "Dwarika's Hotel", location: "Kathmandu, Nepal", basePriceBDT: 10000, rating: 4.8, reviews: 1234, image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070", region: "South Asia" },
  { name: "Taj Mahal Palace", location: "Mumbai, India", basePriceBDT: 25000, rating: 5, reviews: 4567, image: "https://images.unsplash.com/photo-1566837497312-7be4a47f7c2e?q=80&w=2070", region: "South Asia" },
  { name: "The Oberoi Udaivilas", location: "Udaipur, India", basePriceBDT: 32000, rating: 5, reviews: 2876, image: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=2070", region: "South Asia" },
];

const regions = ["All", "Middle East", "Asia", "Islands", "Europe", "East Asia", "South Asia", "Africa"];

export default function Hotels() {
  const { country } = useApp();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [activeRegion, setActiveRegion] = useState("All");

  const convert = (bdt) => convertPrice(bdt, country);

  const filteredHotels = useMemo(() => {
    let list = hotels.filter((h) => {
      const matchSearch = (h.name + " " + h.location).toLowerCase().includes(query.toLowerCase());
      const matchRegion = activeRegion === "All" || h.region === activeRegion;
      return matchSearch && matchRegion;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.basePriceBDT - b.basePriceBDT);
    if (sort === "high") list = [...list].sort((a, b) => b.basePriceBDT - a.basePriceBDT);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return list;
  }, [query, sort, activeRegion]);

  const stats = useMemo(() => {
    const minPrice = Math.min(...hotels.map((h) => h.basePriceBDT));
    const totalReviews = hotels.reduce((acc, h) => acc + h.reviews, 0);
    return {
      total: hotels.length,
      minPrice: convert(minPrice),
      totalReviews: totalReviews.toLocaleString(),
    };
  }, [country]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HERO */}
      <section className="relative h-[280px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061229]/90 via-[#061229]/75 to-[#061229]/40" />

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 px-4 py-2 rounded-full backdrop-blur-sm mb-4">
              <Building2 className="text-cyan-400" size={16} />
              <span className="text-cyan-100 text-xs font-bold uppercase tracking-widest">
                {stats.total} Luxury Properties
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Hotel
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <span className="text-slate-300 text-sm">Curated 5-star hotels worldwide</span>
              <div className="hidden sm:flex items-center gap-3">
                <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                  From {stats.minPrice}/night
                </span>
                <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                  {stats.totalReviews} Reviews
                </span>
                <span className="bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-cyan-200 font-semibold">
                  {country.currency} ({country.symbol})
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-5 md:p-6 shadow-[0_20px_60px_rgba(2,6,23,0.12)] border border-gray-100"
        >
          <div className="grid md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">DESTINATION</label>
              <div className="group flex items-center gap-3 border-2 border-gray-100 rounded-2xl px-4 h-[54px] focus-within:border-[#0A2540] transition bg-gray-50 focus-within:bg-white">
                <MapPin size={18} className="text-gray-400 group-focus-within:text-[#0A2540]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="City, hotel, or country"
                  className="outline-none w-full bg-transparent text-sm font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">CHECK-IN</label>
              <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 h-[54px] hover:border-[#0A2540] transition bg-gray-50">
                <Calendar size={16} className="text-gray-400" />
                <input type="date" className="outline-none w-full bg-transparent text-sm" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">CHECK-OUT</label>
              <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 h-[54px] hover:border-[#0A2540] transition bg-gray-50">
                <Calendar size={16} className="text-gray-400" />
                <input type="date" className="outline-none w-full bg-transparent text-sm" />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1.5 block">GUESTS</label>
              <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-3 h-[54px] hover:border-[#0A2540] transition bg-gray-50">
                <Users size={16} className="text-gray-400" />
                <select defaultValue="2" className="outline-none w-full bg-transparent text-sm font-medium">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>
            </div>

            {/* ✅ Search → /login */}
            <div className="md:col-span-2 flex items-end">
              <Link
                href="/login"
                className="w-full h-[54px] bg-[#E31E24] hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                <Search size={18} /> Search
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* REGION FILTER + SORT */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeRegion === region
                    ? "bg-[#0A2540] text-white shadow-lg scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1">
            {[
              { k: "popular", l: "Popular" },
              { k: "low", l: "Price: Low" },
              { k: "high", l: "Price: High" },
              { k: "rating", l: "Top Rated" },
            ].map((s) => (
              <button
                key={s.k}
                onClick={() => setSort(s.k)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  sort === s.k ? "bg-[#0A2540] text-white shadow" : "text-gray-600 hover:text-[#0A2540]"
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LISTING */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0A2540]">
              {activeRegion === "All" ? "All Hotels" : activeRegion + " Hotels"}
            </h2>
            <p className="text-gray-500 mt-1">
              {filteredHotels.length} propert{filteredHotels.length !== 1 ? "ies" : "y"} • Prices in {country.currency}
            </p>
          </div>
        </div>

        {filteredHotels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[28px] border">
            <Globe size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700">No hotels found</p>
            <p className="text-sm text-gray-400 mt-1">Try changing your search or region</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredHotels.map((hotel, i) => (
              <motion.div
                key={hotel.name + hotel.location}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group"
              >
                <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_40px_rgba(2,6,23,0.06)] border border-gray-100 hover:shadow-[0_16px_60px_rgba(2,6,23,0.12)] transition-all duration-500 hover:-translate-y-1">
                  <div className="relative h-[220px] overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star className="text-amber-500 fill-amber-500" size={12} />
                        <span className="text-[11px] font-bold text-[#0A2540]">{hotel.rating}</span>
                      </div>
                    </div>

                    {/* ✅ Heart → /login */}
                    <Link
                      href="/login"
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition shadow-lg group/heart"
                    >
                      <Heart size={14} className="text-gray-600 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition" />
                    </Link>

                    <div className="absolute bottom-3 left-3">
                      <span className="bg-[#E31E24] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                        {hotel.region}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="bg-black/40 backdrop-blur text-white text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                        <MapPin size={10} /> {hotel.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-[#0A2540] truncate group-hover:text-[#E31E24] transition">
                      {hotel.name}
                    </h3>

                    <div className="flex items-center gap-3 text-gray-400 mt-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-1 text-[11px]"><Wifi size={13} /> Wifi</div>
                      <div className="flex items-center gap-1 text-[11px]"><Coffee size={13} /> Breakfast</div>
                      <div className="flex items-center gap-1 text-[11px]"><Car size={13} /> Parking</div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-[#0A2540]">
                            {convert(hotel.basePriceBDT)}
                          </span>
                          <span className="text-[10px] text-gray-500">/ night</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {hotel.reviews.toLocaleString()} reviews
                        </p>
                      </div>

                      {/* ✅ Arrow → /login */}
                      <Link
                        href="/login"
                        className="w-10 h-10 bg-[#0A2540] group-hover:bg-[#E31E24] text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}