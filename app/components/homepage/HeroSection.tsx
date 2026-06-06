"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ArrowRight, Plane, Headphones, X } from "lucide-react";
import useApp from "./hooks/useApp";

const offers = [
  {
    badge: "Trusted by 2 Million+",
    title: "Experience the World",
    highlight: "Like Never Before",
    desc: "Seamlessly book flights to over 500+ global destinations with our exclusive deals.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074",
    link: "#deals",
  },
  {
    badge: "Exclusive Tropical Offer",
    title: "Escape to the",
    highlight: "Maldives Paradise",
    desc: "Special honeymoon packages and direct flight fares starting from only ৳38,500.",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2070",
    link: "#maldives",
  },
  {
    badge: "Spiritual Journey",
    title: "Premium & Custom",
    highlight: "Umrah Packages",
    desc: "Perform your Umrah with ease. Includes premium hotels near Haram and direct flights.",
    image: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=2070",
    link: "#umrah",
  },
  {
    badge: "Urban Adventure",
    title: "Discover the Neon",
    highlight: "Lights of Tokyo",
    desc: "Get up to 15% discount on Japan Airlines and All Nippon Airways this season.",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2070",
    link: "#tokyo",
  },
  {
    badge: "European Dream",
    title: "The Magic of Paris",
    highlight: "Starting at ৳65,000",
    desc: "Fly to the city of lights. Early bird discounts available for summer 2024 bookings.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073",
    link: "#paris",
  },
];

export default function HeroSection() {
  const { t, container } = useApp();
  const [current, setCurrent] = useState(0);
  const [showLoginCard, setShowLoginCard] = useState(true); // ✅ Login card visibility state

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Optional: Remember user's choice in localStorage
  useEffect(() => {
    const isHidden = localStorage.getItem("hero_login_hidden");
    if (isHidden === "true") {
      setShowLoginCard(false);
    }
  }, []);

  const handleHideLoginCard = () => {
    setShowLoginCard(false);
    localStorage.setItem("hero_login_hidden", "true");
  };

  const slide = offers[current];

  return (
    <section className="relative h-[520px] flex items-center bg-[#061229] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#061229] via-[#061229]/60 to-transparent" />

      <div className={container} style={{ position: "relative", zIndex: 10 }}>
        <div className={`grid ${showLoginCard ? "lg:grid-cols-12" : "grid-cols-1"} gap-8 items-center`}>
          
          {/* LEFT - Original Content */}
          <div className={showLoginCard ? "lg:col-span-7" : "max-w-2xl"}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-lg mb-6">
                  <Award className="text-indigo-400" size={16} />
                  <span className="text-indigo-100 text-[11px] font-bold uppercase tracking-[1.5px]">
                    {slide.badge}
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                  {slide.title} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {slide.highlight}
                  </span>
                </h1>

                <p className="mt-6 text-lg text-slate-300 max-w-lg leading-relaxed opacity-90">
                  {slide.desc}
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href={slide.link}
                    className="bg-white text-[#061229] px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-cyan-50 transition-all shadow-lg active:scale-95"
                  >
                    {t.hero.checkOffers} <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="#routes"
                    className="bg-white/5 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    {t.hero.popularRoutes}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT - Login Card (Dynamic Hide/Show) */}
          <AnimatePresence>
            {showLoginCard && (
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-5 hidden lg:block"
              >
                <div className="relative">
                  {/* ✅ Close Button */}
                  <button
                    onClick={handleHideLoginCard}
                    className="absolute -top-3 -right-3 z-20 w-8 h-8 bg-white text-gray-600 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center group"
                    title="Hide login card"
                  >
                    <X size={16} className="group-hover:rotate-90 transition-transform" />
                  </button>

                  <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    {/* Card Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#0A2540] to-[#061229] rounded-xl mb-3">
                        <Plane className="text-white" size={26} style={{ transform: "rotate(-45deg)" }} />
                      </div>
                      <h3 className="text-2xl font-bold text-[#0A2540]">
                        Agent Portal
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Access your dashboard instantly
                      </p>
                    </div>

                    {/* Login/Register Buttons */}
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        className="block w-full bg-[#0A2540] text-white text-center py-4 rounded-xl font-bold text-sm hover:bg-[#0d2d4f] transition-all shadow-md"
                      >
                        Login to Dashboard
                      </Link>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white px-3 text-gray-400">NEW HERE?</span>
                        </div>
                      </div>

                      <Link
                        href="/register"
                        className="block w-full bg-cyan-50 text-[#0A2540] text-center py-4 rounded-xl font-bold text-sm hover:bg-cyan-100 transition-all border-2 border-cyan-100"
                      >
                        Register as Agent
                      </Link>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg">
                        <Headphones className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-xs">
                          <p className="font-bold text-amber-900">Need Help?</p>
                          <p className="text-amber-700 mt-0.5">
                            Call us: <strong>+880 1XXX-XXXXXX</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Background */}
                  <div className="absolute -top-4 -right-4 w-full h-full bg-cyan-400/10 rounded-2xl -z-10" />
                  <div className="absolute -bottom-4 -left-4 w-full h-full bg-blue-400/10 rounded-2xl -z-20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Slider Dots */}
        <div className="absolute -bottom-16 left-0 flex items-center gap-6">
          <div className="flex gap-2">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  current === i ? "w-10 bg-cyan-400" : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>
          <div className="text-white/40 text-[10px] font-black tracking-widest uppercase">
            0{current + 1} / 0{offers.length}
          </div>
        </div>

        {/* ✅ Show Login Card Button (when hidden) */}
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

      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
    </section>
  );
}