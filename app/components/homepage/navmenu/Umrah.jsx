"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Check, Calendar, Plane, Hotel, Users,
  MapPin, Star, Moon, BookOpen
} from "lucide-react";
import Link from "next/link";
import useApp from "../hooks/useApp";
import { convertPrice } from "@/app/components/homepage/lib/currencyRates";

const BASE_PACKAGES = [
  {
    name: "Economy Umrah",
    basePriceBDT: 95000,
    days: "10 Days",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=2070&q=80",
    features: [
      "3-Star Hotel (1.5km from Haram)",
      "Economy Class Flight",
      "Shared Transport",
      "Umrah Visa Processing",
      "Daily Halal Breakfast",
      "Ziyarat in Makkah",
    ],
  },
  {
    name: "Premium Umrah",
    basePriceBDT: 165000,
    days: "14 Days",
    popular: true,
    image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=2070&q=80",
    features: [
      "5-Star Hotel near Haram",
      "Business Class Flight",
      "Private Transport (AC)",
      "Umrah Visa Processing",
      "Full Board Halal Meals",
      "Religious Scholar Guide",
      "Madinah Ziyarat",
    ],
  },
  {
    name: "Luxury Umrah",
    basePriceBDT: 250000,
    days: "21 Days",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=2070&q=80",
    features: [
      "Luxury Hotel (Haram View)",
      "First Class Flight",
      "VIP Private Transport",
      "Umrah Visa Processing",
      "Premium Halal Meals",
      "Personal Islamic Guide",
      "Extended Madinah Stay",
      "Historical Site Tours",
    ],
  },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=2070&q=80";
const MAKKAH_IMAGE = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=2070&q=80";
const MADINAH_IMAGE = "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=2070&q=80";

export default function Umrah() {
  const { country } = useApp();

  const convert = (bdt) => convertPrice(bdt, country);

  const packages = useMemo(() =>
    BASE_PACKAGES.map((pkg) => ({
      ...pkg,
      displayPrice: convert(pkg.basePriceBDT),
    })),
  [country]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="relative h-[320px] flex items-center justify-center text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1828]/85 via-[#0A1828]/60 to-[#0A1828]/90" />

        <div className="relative max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              <Moon className="text-amber-400" size={14} />
              <span className="text-amber-100 text-xs font-semibold tracking-wide">
                Blessed Spiritual Journey
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Begin Your Sacred{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Umrah Journey
              </span>
            </h1>

            <p className="text-amber-300 mt-4 text-xl md:text-2xl" dir="rtl">
              لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
            </p>
            <p className="text-amber-100/60 text-xs italic">
              "Here I am, O Allah, here I am"
            </p>

            <div className="mt-4 inline-flex items-center gap-2">
              <span className="bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                Prices in {country.currency} ({country.symbol})
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* PACKAGES */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Choose Your Package
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540]">
            Curated Umrah Packages
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            All-inclusive packages with visa processing, return flights, and
            accommodation near Masjid al-Haram
          </p>
          <p className="text-xs text-amber-600 font-semibold mt-2">
            All prices shown in {country.currency} ({country.symbol})
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                pkg.popular ? "ring-2 ring-amber-400 md:scale-105" : ""
              }`}
            >
              {pkg.popular && (
                <span className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  ⭐ MOST POPULAR
                </span>
              )}

              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-amber-900 to-amber-700">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.src = HERO_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1828]/90 via-[#0A1828]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold">{pkg.name}</h3>
                  <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> {pkg.days}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-[#0A2540]">
                    {pkg.displayPrice}
                  </span>
                  <span className="text-sm text-gray-400">/person</span>
                </div>

                <ul className="space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-green-600" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* ✅ Book This Package → /login */}
                <Link
                  href="/login"
                  className={`w-full mt-6 py-4 rounded-xl font-bold transition text-center block ${
                    pkg.popular
                      ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:shadow-xl hover:scale-105"
                      : "bg-[#0A2540] text-white hover:bg-[#0d2d4f]"
                  }`}
                >
                  Book This Package
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TRUST SECTION */}
        <div className="mt-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#0A2540]">Why Choose Us</h3>
            <p className="text-gray-500 mt-1 text-sm">Trusted by thousands of pilgrims</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: "50,000+", label: "Pilgrims Served", color: "amber" },
              { icon: Hotel, value: "Premium", label: "Hotels Only", color: "green" },
              { icon: Plane, value: "Direct", label: "Flights Available", color: "blue" },
              { icon: Star, value: "4.9/5", label: "Pilgrim Rating", color: "yellow" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition border border-gray-100"
                >
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                    stat.color === "amber" ? "bg-amber-100" :
                    stat.color === "green" ? "bg-green-100" :
                    stat.color === "blue" ? "bg-blue-100" : "bg-yellow-100"
                  }`}>
                    <Icon
                      className={
                        stat.color === "amber" ? "text-amber-600" :
                        stat.color === "green" ? "text-green-600" :
                        stat.color === "blue" ? "text-blue-600" : "text-yellow-600"
                      }
                      size={26}
                    />
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540]">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* HOLY SITES */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen size={14} /> Holy Sites
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#0A2540]">
              Sacred Places You'll Visit
            </h3>
            <p className="text-gray-500 mt-1 text-sm">
              Spiritual destinations included in our packages
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-gradient-to-br from-amber-900 to-amber-700"
            >
              <img
                src={MAKKAH_IMAGE}
                alt="Masjid al-Haram, Makkah"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => { e.target.src = HERO_IMAGE; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1828] via-[#0A1828]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h4 className="text-2xl font-bold mb-2">Masjid al-Haram</h4>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin size={14} /> Makkah, Saudi Arabia
                </p>
                <p className="text-xs opacity-80 mt-2">
                  The holiest mosque in Islam, surrounding the sacred Kaaba
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-gradient-to-br from-green-900 to-green-700"
            >
              <img
                src={MADINAH_IMAGE}
                alt="Masjid an-Nabawi, Madinah"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => { e.target.src = HERO_IMAGE; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1828] via-[#0A1828]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h4 className="text-2xl font-bold mb-2">Masjid an-Nabawi</h4>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin size={14} /> Madinah, Saudi Arabia
                </p>
                <p className="text-xs opacity-80 mt-2">
                  The Prophet's Mosque, the second holiest site in Islam
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* QURANIC VERSE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-br from-[#0A1828] to-[#1a2942] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url('${HERO_IMAGE}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative">
            <Moon className="text-amber-400 mx-auto mb-4" size={32} />
            <p className="text-3xl md:text-4xl text-amber-300 mb-4" dir="rtl">
              وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ
            </p>
            <p className="text-lg italic text-slate-200 max-w-2xl mx-auto">
              "And complete the Hajj and Umrah for Allah."
            </p>
            <p className="text-sm text-amber-200/60 mt-2">— Quran 2:196</p>

            <p className="text-amber-300/80 text-sm mt-4">
              Packages starting from{" "}
              <span className="font-bold text-amber-300">
                {convert(BASE_PACKAGES[0].basePriceBDT)}
              </span>{" "}
              per person
            </p>

            {/* ✅ Start Your Journey → /login */}
            <Link
              href="/login"
              className="mt-6 bg-gradient-to-r from-amber-400 to-amber-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition inline-flex items-center gap-2"
            >
              Start Your Journey Today
              <Sparkles size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}