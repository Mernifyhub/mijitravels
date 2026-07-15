// "use client";

// import Link from "next/link";
// import {
//   Flame,
//   ArrowRight,
//   Users,
//   Clock,
//   Plane,
//   TrendingDown,
//   Star,
//   Shield,
// } from "lucide-react";
// import useApp from "./hooks/useApp";

// const deals = [
//   {
//     airline: "Saudi Airlines",
//     route: "Dhaka → Jeddah",
//     from: "DAC",
//     to: "JED",
//     price: 45000,
//     originalPrice: 72000,
//     discount: "38%",
//     seats: 12,
//     logo: "SA",
//     duration: "6h 30m",
//     color: "from-green-600 to-green-800",
//     image:
//       "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070",
//     rating: 4.8,
//     stops: "Non-stop",
//   },
//   {
//     airline: "Emirates",
//     route: "Dhaka → Dubai",
//     from: "DAC",
//     to: "DXB",
//     price: 32000,
//     originalPrice: 43000,
//     discount: "25%",
//     seats: 8,
//     logo: "EK",
//     duration: "4h 45m",
//     color: "from-red-600 to-red-800",
//     image:
//       "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070",
//     rating: 4.9,
//     stops: "Non-stop",
//   },
//   {
//     airline: "Qatar Airways",
//     route: "Dhaka → London",
//     from: "DAC",
//     to: "LHR",
//     price: 85000,
//     originalPrice: 108000,
//     discount: "20%",
//     seats: 5,
//     logo: "QR",
//     duration: "12h 15m",
//     color: "from-purple-700 to-purple-900",
//     image:
//       "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070",
//     rating: 4.9,
//     stops: "1 Stop (DOH)",
//   },
//   {
//     airline: "Turkish Airlines",
//     route: "Dhaka → Istanbul",
//     from: "DAC",
//     to: "IST",
//     price: 57000,
//     originalPrice: 84000,
//     discount: "32%",
//     seats: 15,
//     logo: "TK",
//     duration: "8h 20m",
//     color: "from-red-700 to-red-900",
//     image:
//       "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070",
//     rating: 4.7,
//     stops: "Non-stop",
//   },
// ];

// export default function DealsSection() {
//   const { country, t, formatPrice, container } = useApp();

//   return (
//     <section
//       id="deals"
//       className="relative overflow-hidden py-8 bg-gradient-to-b from-blue-50/60 via-[#f3f8ff] to-blue-100/50"
//     >
//       <div className="absolute top-0 left-0 w-96 h-96 bg-red-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/35 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

//       {/* Subtle white blend only at bottom */}
//       <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-white/45 to-white" />

//       <div className={`${container} relative`}>
//         {/* Header */}
//         <div className="flex items-center justify-between mb-12">
//           <div className="flex items-center gap-4">
//             <div className="relative">
//               <div className="w-14 h-14 bg-gradient-to-br from-[#E31E24] to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
//                 <Flame size={28} />
//               </div>
//               <div className="absolute inset-0 bg-[#E31E24] rounded-2xl animate-ping opacity-20" />
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <h2 className="text-4xl font-bold text-[#0A2540]">
//                   {t.deals.title}
//                 </h2>
//                 <span className="px-3 py-1 bg-red-100 text-[#E31E24] text-xs font-bold rounded-full animate-pulse">
//                   🔥 HOT
//                 </span>
//               </div>
//               <p className="text-gray-500 mt-1 text-sm">{t.deals.subtitle}</p>
//             </div>
//           </div>
//           <Link
//             href="/login"
//             className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#E31E24] text-[#E31E24] rounded-full font-semibold hover:bg-[#E31E24] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg group"
//           >
//             {t.deals.viewAll}
//             <ArrowRight
//               size={18}
//               className="group-hover:translate-x-1 transition-transform"
//             />
//           </Link>
//         </div>

//         {/* Deals Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {deals.map((deal, i) => {
//             const seatPercentage = ((30 - deal.seats) / 30) * 100;
//             const isUrgent = deal.seats < 10;

//             return (
//               <div
//                 key={i}
//                 className="group relative bg-white rounded-[28px] border border-gray-100 hover:border-[#E31E24]/30 hover:shadow-[0_20px_60px_rgba(227,30,36,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
//               >
//                 <div className="relative h-40 overflow-hidden">
//                   <img
//                     src={deal.image}
//                     alt={deal.route}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                     onError={(e) => {
//                       e.currentTarget.src =
//                         "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074";
//                     }}
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

//                   <div className="absolute top-3 left-3">
//                     <div className="bg-gradient-to-r from-red-500 to-[#E31E24] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
//                       <TrendingDown size={11} />
//                       {deal.discount} {t.deals.off}
//                     </div>
//                   </div>

//                   <div className="absolute top-3 right-3">
//                     <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
//                       <Star className="text-amber-500 fill-amber-500" size={11} />
//                       <span className="text-[11px] font-bold text-[#0A2540]">
//                         {deal.rating}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="absolute bottom-3 left-3 right-3">
//                     <div className="flex items-center justify-between text-white">
//                       <div className="text-center">
//                         <p className="text-xl font-black">{deal.from}</p>
//                       </div>
//                       <div className="flex-1 px-3">
//                         <div className="relative flex items-center justify-center">
//                           <div className="w-full border-t border-dashed border-white/40" />
//                           <Plane
//                             size={14}
//                             className="absolute text-white bg-transparent rotate-90"
//                           />
//                         </div>
//                         <p className="text-[9px] text-white/70 text-center mt-1 flex items-center justify-center gap-1">
//                           <Clock size={9} />
//                           {deal.duration}
//                         </p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-xl font-black">{deal.to}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-5">
//                   <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-200">
//                     <div
//                       className={`w-10 h-10 bg-gradient-to-br ${deal.color} rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
//                     >
//                       {deal.logo}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-bold text-[#0A2540] text-sm truncate">
//                         {deal.airline}
//                       </p>
//                       <p className="text-[10px] text-gray-400">{deal.stops}</p>
//                     </div>
//                     <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
//                       <Shield size={10} className="text-green-600" />
//                       <span className="text-[9px] font-bold text-green-700">
//                         Verified
//                       </span>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <div className="flex items-baseline gap-2 flex-wrap">
//                       <span className="text-2xl font-black text-[#0A2540]">
//                         {formatPrice(deal.price)}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className="text-gray-400 text-xs line-through">
//                         {formatPrice(deal.originalPrice)}
//                       </span>
//                       <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
//                         Save {formatPrice(deal.originalPrice - deal.price)}
//                       </span>
//                     </div>
//                     <p className="text-[10px] text-gray-400 mt-1.5">
//                       {t.deals.perPerson} •{" "}
//                       <span className="font-semibold text-[#0A2540]">
//                         {country.currency}
//                       </span>
//                     </p>
//                   </div>

//                   <div className="mb-4">
//                     <div className="flex items-center justify-between text-xs mb-1.5">
//                       <div
//                         className={`flex items-center gap-1.5 font-semibold ${
//                           isUrgent ? "text-red-600" : "text-gray-600"
//                         }`}
//                       >
//                         <Users size={13} />
//                         <span>
//                           {deal.seats} {t.deals.seatsLeft}
//                         </span>
//                       </div>
//                       {isUrgent && (
//                         <span className="text-red-600 text-[10px] font-bold animate-pulse">
//                           ⚡ HURRY!
//                         </span>
//                       )}
//                     </div>
//                     <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
//                       <div
//                         className={`h-full rounded-full transition-all duration-1000 ${
//                           isUrgent
//                             ? "bg-gradient-to-r from-red-500 to-red-600"
//                             : "bg-gradient-to-r from-[#E31E24] to-orange-500"
//                         }`}
//                         style={{ width: `${seatPercentage}%` }}
//                       />
//                     </div>
//                   </div>

//                   <Link
//                     href="/login"
//                     className="block w-full text-center py-3 bg-[#0A2540] text-white rounded-2xl font-semibold text-sm group-hover:bg-[#E31E24] transition-all shadow-md hover:shadow-xl relative overflow-hidden group/btn"
//                   >
//                     <span className="relative z-10 flex items-center justify-center gap-2">
//                       {t.deals.bookBtn}
//                       <ArrowRight
//                         size={15}
//                         className="group-hover/btn:translate-x-1 transition-transform"
//                       />
//                     </span>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="md:hidden mt-8 text-center">
//           <Link
//             href="/login"
//             className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31E24] text-white rounded-full font-semibold shadow-lg"
//           >
//             {t.deals.viewAll}
//             <ArrowRight size={18} />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }
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

const ACTIVE_WIDTH = 360;
const MID_WIDTH = 300;
const FAR_WIDTH = 260;
const OVERLAP = 40;

export default function DealsCarousel() {
  const { country, t, formatPrice, container } = useApp();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getPosition = (offset: number) => {
    if (offset === 0) return 0;
    if (offset === 1) return ACTIVE_WIDTH / 2 + MID_WIDTH / 2 - OVERLAP;
    if (offset === 2)
      return ACTIVE_WIDTH / 2 + MID_WIDTH + FAR_WIDTH / 2 - OVERLAP * 2;
    if (offset === -1) return -(ACTIVE_WIDTH / 2 + MID_WIDTH / 2 - OVERLAP);
    if (offset === -2)
      return -(ACTIVE_WIDTH / 2 + MID_WIDTH + FAR_WIDTH / 2 - OVERLAP * 2);
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

  const slots = [-2, -1, 0, 1, 2].map((offset) => {
    const realIndex =
      ((active + offset) % deals.length + deals.length) % deals.length;
    return {
      offset,
      deal: deals[realIndex],
      realIndex,
    };
  });

  return (
    <section
      id="deals"
      className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-[#f3f8ff] to-blue-100/50"
    >
      <style jsx>{`
        @keyframes rotateBorder {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .rotating-border {
          position: relative;
          background: white;
          border-radius: 20px;
        }
        .rotating-border::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(
            90deg,
            #f97316,
            #fbbf24,
            #f97316,
            #ea580c,
            #f97316
          );
          background-size: 200% 100%;
          animation: rotateBorder 3s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      <div className={`${container} relative`}>
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-[#E31E24] to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <Flame size={28} />
              </div>
              <div className="absolute inset-0 bg-[#E31E24] rounded-2xl animate-ping opacity-20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-4xl font-bold text-[#0A2540]">
                  {t.deals.title}
                </h2>
                <span className="px-3 py-1 bg-red-100 text-[#E31E24] text-xs font-bold rounded-full animate-pulse">
                  🔥 HOT
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm">{t.deals.subtitle}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#E31E24] text-[#E31E24] rounded-full font-semibold hover:bg-[#E31E24] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg group"
          >
            {t.deals.viewAll}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div> */}

        {/* Carousel */}
        <div className="relative h-[440px] w-full">
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
                ? "w-[360px]"
                : isMid
                ? "w-[300px]"
                : "w-[260px]";

              const cardBase = isActive
                ? "rotating-border"
                : "border border-slate-200 rounded-[20px]";

              const imageHeight = isActive
                ? "h-32"
                : isMid
                ? "h-28"
                : "h-24";

              const routeTextSize = isActive
                ? "text-xl"
                : isMid
                ? "text-lg"
                : "text-base";

              const priceTextSize = isActive
                ? "text-2xl"
                : isMid
                ? "text-xl"
                : "text-lg";

              return (
                <div
                  key={`${slot.offset}-${slot.realIndex}-${country?.currency}`}
                  onClick={() => setActive(active + slot.offset)}
                  className="absolute top-1/2 left-1/2 cursor-pointer transition-all duration-700 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${translateX}px)`,
                    zIndex: isActive ? 30 : isMid ? 20 : 10,
                  }}
                >
                  <div
                    className={`overflow-hidden bg-white transition-all duration-500 ${cardWidth} ${cardBase}`}
                  >
                    <div
                      style={contentMargin}
                      className="transition-all duration-500"
                    >
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden ${imageHeight} transition-all duration-500`}
                      >
                        <img
                          src={slot.deal.image}
                          alt={slot.deal.route}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Discount */}
                        <div className="absolute top-2.5 left-2.5">
                          <div className="bg-gradient-to-r from-red-500 to-[#E31E24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <TrendingDown size={9} />
                            {slot.deal.discount} {t.deals.off}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="absolute top-2.5 right-2.5">
                          <div className="bg-white/95 backdrop-blur px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                            <Star
                              className="text-amber-500 fill-amber-500"
                              size={9}
                            />
                            <span className="text-[10px] font-bold text-[#0A2540]">
                              {slot.deal.rating}
                            </span>
                          </div>
                        </div>

                        {/* Route - CENTERED */}
                        <div className="absolute bottom-2 left-0 right-0 px-3">
                          <div className="flex items-center justify-center gap-3 text-white">
                            <p className={`font-black ${routeTextSize}`}>
                              {slot.deal.from}
                            </p>
                            {isActive && (
                              <div className="flex flex-col items-center min-w-[60px]">
                                <div className="w-full border-t border-dashed border-white/50" />
                                <p className="text-[9px] text-white/80 mt-0.5 flex items-center gap-1">
                                  <Clock size={9} />
                                  {slot.deal.duration}
                                </p>
                              </div>
                            )}
                            {!isActive && (
                              <span className="text-white/60 text-lg font-black">
                                →
                              </span>
                            )}
                            <p className={`font-black ${routeTextSize}`}>
                              {slot.deal.to}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className={
                          isActive ? "p-4" : isMid ? "p-3" : "p-2.5"
                        }
                      >
                        {/* Airline */}
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-gray-200">
                          <div
                            className={`bg-gradient-to-br ${slot.deal.color} rounded-lg flex items-center justify-center text-white font-bold shadow-md transition-all duration-500 ${
                              isActive
                                ? "w-8 h-8 text-[10px]"
                                : "w-7 h-7 text-[9px]"
                            }`}
                          >
                            {slot.deal.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold text-[#0A2540] truncate ${isActive ? "text-sm" : "text-xs"}`}
                            >
                              {slot.deal.airline}
                            </p>
                            <p className="text-[9px] text-gray-400">
                              {slot.deal.stops}
                            </p>
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
                              <Shield size={8} className="text-green-600" />
                              <span className="text-[8px] font-bold text-green-700">
                                Verified
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price - CENTERED */}
                        <div className="mb-2 text-center">
                          <span
                            className={`font-black text-[#0A2540] ${priceTextSize}`}
                          >
                            {formatPrice(slot.deal.price)}
                          </span>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="text-gray-400 text-[10px] line-through">
                              {formatPrice(slot.deal.originalPrice)}
                            </span>
                            <span className="text-green-600 text-[9px] font-bold bg-green-50 px-1.5 py-0.5 rounded-full">
                              Save{" "}
                              {formatPrice(
                                slot.deal.originalPrice - slot.deal.price
                              )}
                            </span>
                          </div>
                          {isActive && (
                            <p className="text-[9px] text-gray-400 mt-1">
                              {t.deals.perPerson} •{" "}
                              <span className="font-semibold text-[#0A2540]">
                                {country.currency}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Seats (only active) */}
                        {isActive && (
                          <div className="mb-2.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <div
                                className={`flex items-center gap-1 font-semibold ${
                                  isUrgent ? "text-red-600" : "text-gray-600"
                                }`}
                              >
                                <Users size={11} />
                                <span className="text-[11px]">
                                  {slot.deal.seats} {t.deals.seatsLeft}
                                </span>
                              </div>
                              {isUrgent && (
                                <span className="text-red-600 text-[9px] font-bold animate-pulse">
                                  ⚡ HURRY!
                                </span>
                              )}
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  isUrgent
                                    ? "bg-gradient-to-r from-red-500 to-red-600"
                                    : "bg-gradient-to-r from-[#E31E24] to-orange-500"
                                }`}
                                style={{ width: `${seatPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Button (only active) */}
                        {isActive && (
                          <Link
                            href="/login"
                            className="block w-full text-center py-2 bg-[#0A2540] text-white rounded-lg font-semibold text-xs hover:bg-[#E31E24] transition-all shadow-md"
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              {t.deals.bookBtn}
                              <ArrowRight size={12} />
                            </span>
                          </Link>
                        )}
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