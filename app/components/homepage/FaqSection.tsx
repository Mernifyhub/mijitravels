"use client";

import { useState } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import useApp from "./hooks/useApp";

export default function FaqSection() {
  const { t, container } = useApp();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-50">
      <div className={container}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <MessageSquare size={16} /> {t.faq.badge}
          </div>
          <h2 className="text-4xl font-bold text-[#0A2540]">{t.faq.title}</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {t.faq.items.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setActive(active === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
              >
                <span className="font-semibold text-[#0A2540] pr-4">{faq.q}</span>
                <ChevronDown
                  className={`text-gray-400 transition-transform flex-shrink-0 ${
                    active === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {active === i && (
                <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}