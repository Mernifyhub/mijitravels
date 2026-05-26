"use client";

import Link from "next/link";
import { Flame, ArrowRight, Users } from "lucide-react";
import useApp from "./hooks/useApp";

// All prices stored in BDT (base currency)
const deals = [
  { airline: "Saudi Airlines", route: "Dhaka → Jeddah", price: 45000, originalPrice: 72000, discount: "38%", seats: 12, logo: "SA" },
  { airline: "Emirates", route: "Dhaka → Dubai", price: 32000, originalPrice: 43000, discount: "25%", seats: 8, logo: "EK" },
  { airline: "Qatar Airways", route: "Dhaka → London", price: 85000, originalPrice: 108000, discount: "20%", seats: 5, logo: "QR" },
  { airline: "Turkish Airlines", route: "Dhaka → Istanbul", price: 57000, originalPrice: 84000, discount: "32%", seats: 15, logo: "TK" },
];

export default function DealsSection() {
  const { country, t, formatPrice, container } = useApp();

  return (
    <section id="deals" className="py-20 bg-white">
      <div className={container}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E31E24] rounded-2xl flex items-center justify-center text-white">
              <Flame size={28} />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-[#0A2540]">{t.deals.title}</h2>
              <p className="text-gray-500 mt-1 text-sm">{t.deals.subtitle}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="hidden md:flex items-center gap-2 text-[#E31E24] font-semibold hover:gap-3 transition-all text-sm"
          >
            {t.deals.viewAll} <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal, i) => (
            <div
              key={i}
              className="group border border-gray-100 rounded-3xl p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-[#E31E24] text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg">
                {deal.discount} {t.deals.off}
              </div>

              <div className="w-14 h-14 bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] rounded-2xl flex items-center justify-center text-white font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
                {deal.logo}
              </div>

              <div className="mb-6">
                <p className="font-bold text-xl text-[#0A2540]">{deal.route}</p>
                <p className="text-sm text-gray-500 mt-1">{deal.airline}</p>
              </div>

              <div className="mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#0A2540]">
                    {formatPrice(deal.price)}
                  </span>
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(deal.originalPrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t.deals.perPerson} •{" "}
                  <span className="font-semibold text-[#0A2540]">{country.currency}</span>
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Users size={14} />
                  <span>{deal.seats} {t.deals.seatsLeft}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E31E24] to-orange-500 rounded-full"
                    style={{ width: `${((30 - deal.seats) / 30) * 100}%` }}
                  />
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full text-center py-3.5 bg-[#0A2540] text-white rounded-2xl font-semibold group-hover:bg-[#E31E24] transition-all shadow-lg hover:shadow-xl"
              >
                {t.deals.bookBtn}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}