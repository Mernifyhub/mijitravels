"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  TrendingDown,
  Star,
  Shield,
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useApp from "./hooks/useApp";

type Deal = {
  airline: string;
  route: string;
  from: string;
  to: string;
  price: number;
  originalPrice: number;
  discount: string;
  seats: number;
  logo: string;
  duration: string;
  color: string;
  image: string;
  rating: number;
  stops: string;
};

const deals: Deal[] = [
  {
    airline: "Saudi Airlines",
    route: "Dhaka → Jeddah",
    from: "DAC",
    to: "JED",
    price: 45000,
    originalPrice: 72000,
    discount: "38%",
    seats: 12,
    logo: "SA",
    duration: "6h 30m",
    color: "from-green-600 to-green-800",
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070",
    rating: 4.8,
    stops: "Non-stop",
  },
  {
    airline: "Emirates",
    route: "Dhaka → Dubai",
    from: "DAC",
    to: "DXB",
    price: 32000,
    originalPrice: 43000,
    discount: "25%",
    seats: 8,
    logo: "EK",
    duration: "4h 45m",
    color: "from-red-600 to-red-800",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
    rating: 4.9,
    stops: "Non-stop",
  },
  {
    airline: "Qatar Airways",
    route: "Dhaka → London",
    from: "DAC",
    to: "LHR",
    price: 85000,
    originalPrice: 108000,
    discount: "20%",
    seats: 5,
    logo: "QR",
    duration: "12h 15m",
    color: "from-purple-700 to-purple-900",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070",
    rating: 4.9,
    stops: "1 Stop (DOH)",
  },
  {
    airline: "Turkish Airlines",
    route: "Dhaka → Istanbul",
    from: "DAC",
    to: "IST",
    price: 57000,
    originalPrice: 84000,
    discount: "32%",
    seats: 15,
    logo: "TK",
    duration: "8h 20m",
    color: "from-red-700 to-red-900",
    image:
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070",
    rating: 4.7,
    stops: "Non-stop",
  },
  {
    airline: "Etihad Airways",
    route: "Dhaka → Abu Dhabi",
    from: "DAC",
    to: "AUH",
    price: 38000,
    originalPrice: 55000,
    discount: "31%",
    seats: 10,
    logo: "EY",
    duration: "5h 15m",
    color: "from-amber-600 to-amber-800",
    image:
      "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=2070",
    rating: 4.8,
    stops: "Non-stop",
  },
];

export default function DealsCarousel() {
  const { country, t, formatPrice, container } = useApp();
  const [active, setActive] = useState(0);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize("mobile");
      else if (w < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentIndex =
    ((active % deals.length) + deals.length) % deals.length;

  const sizes = {
    desktop: { ACTIVE_WIDTH: 360, MID_WIDTH: 300, FAR_WIDTH: 260, OVERLAP: 40, height: 420 },
    tablet:  { ACTIVE_WIDTH: 300, MID_WIDTH: 240, FAR_WIDTH: 0,    OVERLAP: 30, height: 400 },
    mobile:  { ACTIVE_WIDTH: 300, MID_WIDTH: 0,    FAR_WIDTH: 0,    OVERLAP: 0,  height: 400 },
  };

  const { ACTIVE_WIDTH, MID_WIDTH, FAR_WIDTH, OVERLAP, height } = sizes[screenSize];

  const getPosition = (offset: number) => {
    if (offset === 0) return 0;
    if (offset === 1) return ACTIVE_WIDTH / 2 + MID_WIDTH / 2 - OVERLAP;
    if (offset === 2) return ACTIVE_WIDTH / 2 + MID_WIDTH + FAR_WIDTH / 2 - OVERLAP * 2;
    if (offset === -1) return -(ACTIVE_WIDTH / 2 + MID_WIDTH / 2 - OVERLAP);
    if (offset === -2) return -(ACTIVE_WIDTH / 2 + MID_WIDTH + FAR_WIDTH / 2 - OVERLAP * 2);
    return 0;
  };

  const getContentMargin = (offset: number) => {
    if (offset === 0) return { marginLeft: 0, marginRight: 0 };
    if (offset === -1) return { marginLeft: 0, marginRight: OVERLAP };
    if (offset === 1) return { marginLeft: OVERLAP, marginRight: 0 };
    if (offset === -2) return { marginLeft: 0, marginRight: OVERLAP };
    if (offset === 2) return { marginLeft: OVERLAP, marginRight: 0 };
    return {};
  };

  const visibleOffsets =
    screenSize === "mobile" ? [0]
    : screenSize === "tablet" ? [-1, 0, 1]
    : [-2, -1, 0, 1, 2];

  const slots = visibleOffsets.map((offset) => {
    const realIndex = ((active + offset) % deals.length + deals.length) % deals.length;
    return { offset, deal: deals[realIndex], realIndex };
  });

  return (
    <section
      id="deals"
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-3 sm:py-4"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-[120px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-[120px] sm:h-96 sm:w-96" />

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#0A2540 1px, transparent 1px), linear-gradient(90deg, #0A2540 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <style jsx>{`
        @keyframes rotateBorder { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .rotating-border { position: relative; background: white; border-radius: 20px; }
        .rotating-border::before {
          content: ""; position: absolute; inset: -2px; border-radius: 20px; padding: 2px;
          background: linear-gradient(90deg, #f97316, #fbbf24, #f97316, #ea580c, #f97316); background-size: 200% 100%;
          animation: rotateBorder 3s linear infinite; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
      `}</style>

      <div className={`${container} relative`}>

        {/* UNIFIED Header — same style on mobile AND desktop */}
        <div className="flex items-center justify-between mb-3 px-0 sm:mb-4">
          <div className="flex items-center gap-3">
            {/* 🔥 Icon — visible everywhere now! */}
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#E31E24] to-red-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <Flame size={20} className="sm:w-5 sm:h-5 w-4 h-4" />
              </div>
              <div className="absolute inset-0 bg-[#E31E24] rounded-xl animate-ping opacity-20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0A2540] sm:text-2xl md:text-3xl">
                  {t.deals.title}
                </h2>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-red-100 text-[#E31E24] text-[11px] font-bold rounded-full animate-pulse">
                  🔥 HOT
                </span>
                <span className="sm:hidden px-2 py-0.5 bg-red-100 text-[#E31E24] text-[9px] font-bold rounded-full animate-pulse">
                  HOT
                </span>
              </div>
              <p className="text-gray-500 text-[10px] mt-0.5 sm:text-xs sm:mt-1 hidden lg:block">
                {t.deals.subtitle}
              </p>
            </div>
          </div>

          {/* Nav Arrows — visible on both mobile & desktop */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 font-medium hidden sm:inline-flex mr-1 items-center gap-1">
              <Flame size={12} className="text-[#E31E24]" />
              {currentIndex + 1}/{deals.length}
            </span>
            
            <button
              onClick={() => setActive((prev) => prev - 1)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm active:scale-90 transition hover:bg-gray-50"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setActive((prev) => prev + 1)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E31E24] flex items-center justify-center shadow-sm active:scale-90 transition hover:bg-red-600"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative w-full" style={{ height: `${height}px` }}>
          <div className="relative flex h-full items-center justify-center">
            {slots.map((slot) => {
              const absOffset = Math.abs(slot.offset);
              const isActive = absOffset === 0;
              const isMid = absOffset === 1;
              const translateX = getPosition(slot.offset);
              const contentMargin = getContentMargin(slot.offset);
              const isUrgent = slot.deal.seats < 10;
              const seatPercentage = ((30 - slot.deal.seats) / 30) * 100;

              const cardWidth = isActive
                ? screenSize === "desktop" ? "w-[360px]"
                  : screenSize === "tablet" ? "w-[300px]"
                  : "w-[280px] max-w-[85vw]"
                : isMid
                  ? screenSize === "desktop" ? "w-[300px]" : "w-[240px]"
                  : "w-[260px]";

              const cardBase = isActive ? "rotating-border" : "border border-slate-200 rounded-[20px]";
              const imageHeight = isActive ? "h-28 sm:h-32" : isMid ? "h-24 sm:h-28" : "h-22 sm:h-24";
              const routeTextSize = isActive ? "text-lg sm:text-xl" : isMid ? "text-base sm:text-lg" : "text-sm sm:text-base";
              const priceTextSize = isActive ? "text-xl sm:text-2xl" : isMid ? "text-lg sm:text-xl" : "text-base sm:text-lg";

              return (
                <div
                  key={`${slot.offset}-${slot.realIndex}-${country?.currency}`}
                  onClick={() => setActive(active + slot.offset)}
                  className="absolute top-1/2 left-1/2 cursor-pointer transition-all duration-700 ease-out"
                  style={{ transform: `translate(-50%, -50%) translateX(${translateX}px)`, zIndex: isActive ? 30 : isMid ? 20 : 10 }}
                >
                  <div className={`overflow-hidden bg-white transition-all duration-500 ${cardWidth} ${cardBase}`}>
                    <div style={contentMargin} className="transition-all duration-500">
                      {/* Image */}
                      <div className={`relative overflow-hidden ${imageHeight} transition-all duration-500`}>
                        <img src={slot.deal.image} alt={slot.deal.route} className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Discount */}
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
                          <div className="bg-gradient-to-r from-red-500 to-[#E31E24] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <TrendingDown size={8} />{slot.deal.discount} {t.deals.off}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
                          <div className="bg-white/95 backdrop-blur px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                            <Star className="text-amber-500 fill-amber-500" size={8} /><span className="text-[9px] sm:text-[10px] font-bold text-[#0A2540]">{slot.deal.rating}</span>
                          </div>
                        </div>

                        {/* Route */}
                        <div className="absolute bottom-2 left-0 right-0 px-2 sm:px-3">
                          <div className="flex items-center justify-center gap-2 sm:gap-3 text-white">
                            <p className={`font-black ${routeTextSize}`}>{slot.deal.from}</p>
                            {isActive && (
                              <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px]">
                                <div className="w-full border-t border-dashed border-white/50" />
                                <p className="text-[8px] sm:text-[9px] text-white/80 mt-0.5 flex items-center gap-1"><Clock size={8} />{slot.deal.duration}</p>
                              </div>
                            )}
                            {!isActive && <span className="text-white/60 font-black">→</span>}
                            <p className={`font-black ${routeTextSize}`}>{slot.deal.to}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className={isActive ? "p-3 sm:p-4" : isMid ? "p-2.5 sm:p-3" : "p-2"}>
                        {/* Airline */}
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-dashed border-gray-200 sm:gap-2">
                          <div className={`bg-gradient-to-br ${slot.deal.color} rounded-lg flex items-center justify-center text-white font-bold shadow-md transition-all duration-500 ${isActive ? "w-7 h-7 text-[9px] sm:w-8 sm:h-8 sm:text-[10px]" : "w-6 h-6 text-[8px] sm:w-7 sm:h-7 sm:text-[9px]"}`}>
                            {slot.deal.logo}
                          </div>
                          <div className="flex-1 min-w-0"><p className={`font-bold text-[#0A2540] truncate ${isActive ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"}`}>{slot.deal.airline}</p><p className="text-[8px] sm:text-[9px] text-gray-400">{slot.deal.stops}</p></div>
                          {isActive && <div className="flex items-center gap-1 bg-green-50 px-1 sm:px-1.5 py-0.5 rounded-full"><Shield size={7} className="text-green-600" /><span className="text-[7px] sm:text-[8px] font-bold text-green-700">Verified</span></div>}
                        </div>

                        {/* Price */}
                        <div className="mb-2 text-center"><span className={`font-black text-[#0A2540] ${priceTextSize}`}>{formatPrice(slot.deal.price)}</span>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            <span className="text-gray-400 text-[9px] sm:text-[10px] line-through">{formatPrice(slot.deal.originalPrice)}</span>
                            <span className="text-green-600 text-[8px] sm:text-[9px] font-bold bg-green-50 px-1 sm:px-1.5 py-0.5 rounded-full">Save {formatPrice(slot.deal.originalPrice - slot.deal.price)}</span>
                          </div>
                          {isActive && <p className="text-[8px] sm:text-[9px] text-gray-400 mt-1">{t.deals.perPerson} • <span className="font-semibold text-[#0A2540]">{country.currency}</span></p>}
                        </div>

                        {/* Seats */}
                        {isActive && <div className="mb-2">
                          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                            <div className={`flex items-center gap-1 font-semibold ${isUrgent ? "text-red-600" : "text-gray-600"}`}><Users size={10} /><span>{slot.deal.seats} {t.deals.seatsLeft}</span></div>
                            {isUrgent && <span className="text-red-600 text-[8px] sm:text-[9px] font-bold animate-pulse">⚡ HURRY!</span>}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1 sm:h-1.5 overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-[#E31E24] to-orange-500"}`} style={{ width: `${seatPercentage}%` }} /></div>
                        </div>}

                        {/* Button */}
                        {isActive && <Link href="/login" className="block w-full text-center py-1.5 sm:py-2 bg-[#0A2540] text-white rounded-lg font-semibold text-[11px] sm:text-xs hover:bg-[#E31E24] transition-all shadow-md"><span className="flex items-center justify-center gap-1 sm:gap-1.5">{t.deals.bookBtn}<ArrowRight size={11} /></span></Link>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}