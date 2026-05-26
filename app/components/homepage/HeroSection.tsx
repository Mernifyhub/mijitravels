"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="max-w-2xl">
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
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
    </section>
  );
}