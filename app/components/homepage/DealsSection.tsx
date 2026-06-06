"use client";

import Link from "next/link";
import { Flame, ArrowRight, Users, Clock, Plane, TrendingDown } from "lucide-react";
import useApp from "./hooks/useApp";

const deals = [
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
  },
];

export default function DealsSection() {
  const { country, t, formatPrice, container } = useApp();

  return (
    <section id="deals" className="py-20 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className={`${container} relative`}>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-[#E31E24] to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <Flame size={28} />
              </div>
              {/* Pulse animation */}
              <div className="absolute inset-0 bg-[#E31E24] rounded-2xl animate-ping opacity-20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-4xl font-bold text-[#0A2540]">{t.deals.title}</h2>
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
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal, i) => {
            const seatPercentage = ((30 - deal.seats) / 30) * 100;
            const isUrgent = deal.seats < 10;

            return (
              <div
                key={i}
                className="group relative bg-white rounded-3xl border border-gray-100 hover:border-[#E31E24]/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${deal.color}`} />

                {/* Discount Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-[#E31E24] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <TrendingDown size={12} />
                    {deal.discount} {t.deals.off}
                  </div>
                </div>

                <div className="p-6">
                  {/* Airline Logo */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${deal.color} rounded-2xl flex items-center justify-center text-white font-bold text-base mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    {deal.logo}
                  </div>

                  {/* Route with Airport Codes */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-center">
                        <p className="text-2xl font-black text-[#0A2540]">{deal.from}</p>
                        <p className="text-[10px] text-gray-400 uppercase">Dhaka</p>
                      </div>
                      <div className="flex-1 px-2">
                        <div className="relative">
                          <div className="h-[1px] bg-dashed border-t border-dashed border-gray-300" />
                          <Plane className="w-4 h-4 text-[#E31E24] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white" style={{ transform: "translate(-50%, -50%) rotate(90deg)" }} />
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-1 flex items-center justify-center gap-1">
                          <Clock size={10} />
                          {deal.duration}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-[#0A2540]">{deal.to}</p>
                        <p className="text-[10px] text-gray-400 uppercase">
                          {deal.route.split("→")[1].trim()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center font-medium mt-3 pb-3 border-b border-dashed border-gray-200">
                      {deal.airline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black text-[#0A2540]">
                        {formatPrice(deal.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-sm line-through">
                        {formatPrice(deal.originalPrice)}
                      </span>
                      <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">
                        Save {formatPrice(deal.originalPrice - deal.price)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {t.deals.perPerson} •{" "}
                      <span className="font-semibold text-[#0A2540]">{country.currency}</span>
                    </p>
                  </div>

                  {/* Seats Progress */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className={`flex items-center gap-1.5 font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                        <Users size={14} />
                        <span>{deal.seats} {t.deals.seatsLeft}</span>
                      </div>
                      {isUrgent && (
                        <span className="text-red-600 text-[10px] font-bold animate-pulse">
                          ⚡ HURRY!
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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

                  {/* Book Button */}
                  <Link
                    href="/login"
                    className="block w-full text-center py-3.5 bg-[#0A2540] text-white rounded-2xl font-semibold group-hover:bg-[#E31E24] transition-all shadow-md hover:shadow-xl relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t.deals.bookBtn}
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E31E24] text-white rounded-full font-semibold shadow-lg"
          >
            {t.deals.viewAll}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}