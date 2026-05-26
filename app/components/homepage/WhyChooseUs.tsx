"use client";

import { Award, CheckCircle, Star } from "lucide-react";
import useApp from "./hooks/useApp";

export default function WhyChooseUs() {
  const { country, t, container } = useApp();

  return (
    <section className="py-20 bg-white">
      <div className={container}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
              <Award size={16} /> {t.whyUs.badge}
            </div>
            <h2 className="text-4xl font-bold text-[#0A2540] leading-tight mb-4">
              {t.whyUs.title}
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">{t.whyUs.desc}</p>

            <div className="space-y-6">
              {t.whyUs.features.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#0A2540]">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] text-white p-12 rounded-3xl max-w-md text-center shadow-2xl">
              <div className="text-8xl mb-6">🏆</div>
              <h3 className="text-3xl font-bold mb-3">{t.whyUs.awardTitle}</h3>
              <p className="text-lg opacity-80 mb-8">
                {t.whyUs.bestAgency} {country.name} 2024
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={32} />
                ))}
              </div>
              <div className="text-sm opacity-60">{t.whyUs.rated}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}