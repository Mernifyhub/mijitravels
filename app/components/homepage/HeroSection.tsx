"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ArrowRight, Plane, Headphones, X } from "lucide-react";
import useApp from "./hooks/useApp";
import { convertPrice } from "./lib/currencyRates";

const BASE_OFFERS = [
  {
    badge: "Trusted by 2 Million+",
    title: "Experience the World",
    highlight: "Like Never Before",
    desc: "Seamlessly book flights to over 500+ global destinations with our exclusive deals.",
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2070",
    link: "#deals",
  },
  {
    badge: "Exclusive Tropical Offer",
    title: "Escape to the",
    highlight: "Maldives Paradise",
    descBDT: 38500,
    descText: "Special honeymoon packages and direct flight fares starting from only",
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2070",
    link: "#maldives",
  },
  {
    badge: "Spiritual Journey",
    title: "Premium & Custom",
    highlight: "Umrah Packages",
    desc: "Perform your Umrah with ease. Includes premium hotels near Haram and direct flights.",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070",
    link: "#umrah",
  },
  {
    badge: "Urban Adventure",
    title: "Discover the Neon",
    highlight: "Lights of Tokyo",
    desc: "Get up to 15% discount on Japan Airlines and All Nippon Airways this season.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070",
    link: "#tokyo",
  },
  {
    badge: "European Dream",
    title: "The Magic of Paris",
    highlightBDT: 65000,
    highlightText: "Starting at",
    desc: "Fly to the city of lights. Early bird discounts available for summer 2024 bookings.",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=2070",
    link: "#paris",
  },
];

export default function HeroSection() {
  const { t, country, container } = useApp();
  const [current, setCurrent] = useState(0);
  const [showLoginCard, setShowLoginCard] = useState(true);

  const convert = (bdt) => convertPrice(bdt, country);

  // Build offers with converted prices
  const offers = BASE_OFFERS.map((offer) => {
    let finalHighlight = offer.highlight;
    if (offer.highlightBDT) {
      finalHighlight = `${offer.highlightText} ${convert(offer.highlightBDT)}`;
    }

    let finalDesc = offer.desc;
    if (offer.descBDT) {
      finalDesc = `${offer.descText} ${convert(offer.descBDT)}.`;
    }

    return { ...offer, highlight: finalHighlight, desc: finalDesc };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const isHidden = localStorage.getItem("hero_login_hidden");
    if (isHidden === "true") setShowLoginCard(false);
  }, []);

  const handleHideLoginCard = () => {
    setShowLoginCard(false);
    localStorage.setItem("hero_login_hidden", "true");
  };

  const slide = offers[current];

  return (
    <section className="relative w-full h-[450px] flex items-center bg-[#061229] overflow-hidden">

      {/* ✅ Background Image — less blur, more visible */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2070";
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ✅ Lighter gradient — image more visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#061229]/95 via-[#061229]/55 to-[#061229]/10" />

      {/* ✅ Subtle bottom fade only */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#061229]/80 to-transparent" />

      <div className={container} style={{ position: "relative", zIndex: 10 }}>
        <div className="grid gap-6 items-center grid-cols-12">

          {/* SECTION 1: PROMOTION TEXT */}
          <div
            className={`${
              showLoginCard ? "col-span-12 lg:col-span-7" : "col-span-12 lg:col-span-11"
            } transition-all duration-500`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.5 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                  <Award className="text-cyan-400" size={14} />
                  <span className="text-white text-[10px] font-bold uppercase tracking-[1.5px]">
                    {slide.badge}
                  </span>
                </div>

                {/* Heading */}
                <h1
                  className={`font-extrabold text-white leading-[1.1] tracking-tight transition-all duration-500 drop-shadow-lg ${
                    showLoginCard
                      ? "text-3xl md:text-4xl lg:text-5xl"
                      : "text-4xl md:text-5xl lg:text-6xl"
                  }`}
                >
                  {slide.title} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {slide.highlight}
                  </span>
                </h1>

                {/* Description */}
                <p
                  className={`mt-4 text-white/90 leading-relaxed transition-all duration-500 drop-shadow-md ${
                    showLoginCard
                      ? "text-sm md:text-base max-w-lg"
                      : "text-base md:text-lg max-w-2xl"
                  }`}
                >
                  {slide.desc}
                </p>

                {/* ✅ Currency indicator */}
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] text-white/80 font-semibold">
                    Prices in {country.currency} ({country.symbol})
                  </span>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={slide.link}
                    className="bg-white text-[#061229] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-cyan-50 transition-all shadow-lg active:scale-95"
                  >
                    {t.hero.checkOffers} <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="#routes"
                    className="bg-white/10 border border-white/25 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    {t.hero.popularRoutes}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SECTION 2: DOTS */}
          <div className="col-span-12 lg:col-span-1 flex lg:flex-col items-center justify-center gap-3">
            <div className="flex lg:flex-col gap-2">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-500 ${
                    current === i
                      ? "lg:h-8 lg:w-1.5 h-1.5 w-8 bg-cyan-400 shadow-lg shadow-cyan-400/30"
                      : "lg:h-3 lg:w-1.5 h-1.5 w-3 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <div className="text-white/40 text-[10px] font-black tracking-widest uppercase lg:rotate-90 lg:mt-4 whitespace-nowrap">
              0{current + 1} / 0{offers.length}
            </div>
          </div>

          {/* SECTION 3: LOGIN CARD */}
          <AnimatePresence>
            {showLoginCard && (
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="col-span-12 lg:col-span-4 hidden lg:block"
              >
                <div className="relative">
                  <button
                    onClick={handleHideLoginCard}
                    className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-white text-gray-600 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center group"
                    title="Hide login card"
                  >
                    <X size={14} className="group-hover:rotate-90 transition-transform" />
                  </button>

                  {/* ✅ Glass effect card */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/50">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#0A2540] to-[#061229] rounded-xl mb-2">
                        <Plane className="text-white" size={22} style={{ transform: "rotate(-45deg)" }} />
                      </div>
                      <h3 className="text-xl font-bold text-[#0A2540]">Agent Portal</h3>
                      <p className="text-xs text-gray-500 mt-1">Access your dashboard instantly</p>
                    </div>

                    <div className="space-y-2.5">
                      <Link
                        href="/login"
                        className="block w-full bg-[#0A2540] text-white text-center py-3 rounded-xl font-bold text-xs hover:bg-[#0d2d4f] transition-all shadow-md"
                      >
                        LOGIN TO DASHBOARD
                      </Link>

                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                          <span className="bg-white px-2 text-gray-400 font-semibold">NEW HERE?</span>
                        </div>
                      </div>

                      <Link
                        href="/register"
                        className="block w-full bg-cyan-50 text-[#0A2540] text-center py-3 rounded-xl font-bold text-xs hover:bg-cyan-100 transition-all border-2 border-cyan-100"
                      >
                        REGISTER AS AGENT
                      </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 bg-amber-50 p-2.5 rounded-xl">
                        <Headphones className="text-amber-600 flex-shrink-0" size={14} />
                        <div className="text-[11px]">
                          <span className="font-bold text-amber-900">Need Help? </span>
                          <span className="text-amber-700">
                            <strong>+880 1XXX-XXXXXX</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-3 -right-3 w-full h-full bg-cyan-400/10 rounded-2xl -z-10" />
                  <div className="absolute -bottom-3 -left-3 w-full h-full bg-blue-400/10 rounded-2xl -z-20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Login (when card hidden) */}
        {!showLoginCard && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setShowLoginCard(true);
              localStorage.removeItem("hero_login_hidden");
            }}
            className="fixed bottom-8 right-8 z-50 bg-white text-[#0A2540] px-5 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plane size={16} style={{ transform: "rotate(-45deg)" }} />
            Agent Login
          </motion.button>
        )}
      </div>

      {/* Subtle right glow */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
    </section>
  );
}