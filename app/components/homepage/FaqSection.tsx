"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import useApp from "./hooks/useApp";

type FaqItem = { q: string; a: string };

const fallbackFaqs: FaqItem[] = [
  {
    q: "How do I book a flight?",
    a: "Simply search for your desired route, select the best fare, fill in passenger details, and complete payment. Your e-ticket will be sent instantly to your email.",
  },
  {
    q: "Can I change or cancel my booking?",
    a: "Yes, you can modify or cancel your booking from your account dashboard. Cancellation fees may apply depending on the airline's policy and fare type.",
  },
  {
    q: "Are the prices inclusive of taxes?",
    a: "All displayed prices include base fare, airport taxes, and fuel surcharges. Any additional services like baggage or meals will be shown separately before payment.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, bank transfers, mobile banking (bKash, Nagad), and international payment gateways for secure transactions.",
  },
  {
    q: "How do I receive my ticket?",
    a: "Your confirmed e-ticket with PNR and booking reference will be sent to your registered email and phone number within minutes of successful payment.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. We use 256-bit SSL encryption and PCI-DSS compliant payment gateways. Your financial data is never stored on our servers.",
  },
];

export default function FaqSection() {
  const { t, container } = useApp();
  const [active, setActive] = useState<number | null>(0);

  // Ensure exactly 6 items for perfect 2-column grid
  const faqItems: FaqItem[] = (() => {
    const source =
      Array.isArray(t?.faq?.items) && t.faq.items.length >= 6
        ? t.faq.items
        : fallbackFaqs;
    return source.slice(0, 6);
  })();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-6 sm:py-8">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-[120px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-[120px] sm:h-96 sm:w-96" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0A2540 1px, transparent 1px), linear-gradient(90deg, #0A2540 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className={`${container} relative`}>
        {/* Header */}
        <div className="mx-auto mb-5 max-w-3xl text-center sm:mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm">
            <Sparkles size={14} className="text-amber-500" />
            {t.faq.badge}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Frequently Asked{" "}
            <span className="bg-black from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
        </div>

        {/* FAQ List — Two columns */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {faqItems.map((faq, i) => {
              const isOpen = active === i;
              return (
                <div
                  key={i}
                  className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-blue-200 shadow-[0_12px_40px_rgba(37,99,235,0.1)]"
                      : "border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:border-blue-100 hover:shadow-[0_8px_25px_rgba(37,99,235,0.08)]"
                  }`}
                >
                  <button
                    onClick={() => setActive(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Number */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-all duration-300 ${
                          isOpen
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30"
                            : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <span
                        className={`text-sm font-bold transition ${
                          isOpen ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {faq.q}
                      </span>
                    </div>

                    {/* Plus / X */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      <Plus size={16} />
                    </div>
                  </button>

                  {/* Answer */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="ml-11 border-l-2 border-blue-200 pl-4 text-[13px] leading-relaxed text-slate-600">
                          {faq.a}
                        </div>
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