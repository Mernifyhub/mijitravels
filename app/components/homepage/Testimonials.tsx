"use client";

import { Star } from "lucide-react";
import useApp from "./hooks/useApp";

// Dynamic data — future: API/CMS
const testimonials = [
  {
    name: "Ahmed Khan",
    role: "Business Traveller",
    city: "Dhaka",
    content: "Got the cheapest ticket to Jeddah. The booking was super smooth!",
    rating: 5,
    initials: "AK",
    color: "from-cyan-400 to-blue-500",
  },
  {
    name: "Sarah Rahman",
    role: "Travel Agent",
    city: "Chittagong",
    content: "As an agent, Miji has been a game-changer. Excellent commission structure!",
    rating: 5,
    initials: "SR",
    color: "from-purple-400 to-pink-500",
  },
  {
    name: "Mohammad Ali",
    role: "Family Holiday Planner",
    city: "Sylhet",
    content: "Booked a family holiday to Dubai. Prices were amazing and everything was professional.",
    rating: 5,
    initials: "MA",
    color: "from-orange-400 to-red-500",
  },
];

export default function Testimonials() {
  const { country, t, container } = useApp();

  return (
    <section className="py-20 bg-gradient-to-br from-[#0A2540] to-[#0d2d5a]">
      <div className={container}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">{t.testimonials.title}</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            {t.testimonials.subtitle} {country.name}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="bg-white/8 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:bg-white/12 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, ri) => (
                  <Star key={ri} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <p className="text-white/85 leading-relaxed mb-6 italic">&quot;{item.content}&quot;</p>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                >
                  {item.initials}
                </div>
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-white/50 text-sm">
                    {item.role} • {item.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}