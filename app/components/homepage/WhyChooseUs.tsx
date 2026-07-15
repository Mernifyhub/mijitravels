"use client";

import {
  Headphones,
  PlaneTakeoff,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import useApp from "./hooks/useApp";

type Feature = {
  title: string;
  desc: string;
};

const fallbackFeatures: Feature[] = [
  {
    title: "Transparent Pricing",
    desc: "Clear fare details with no hidden charges or surprises.",
  },
  {
    title: "24/7 Support",
    desc: "Professional assistance whenever you need travel help.",
  },
  {
    title: "Secure Booking",
    desc: "Protected payments and trusted booking experience.",
  },
  {
    title: "Fast Processing",
    desc: "Quick confirmation with smooth travel arrangements.",
  },
];

const icons = [Wallet, Headphones, ShieldCheck, PlaneTakeoff];

export default function WhyChooseUs() {
  const { t, container } = useApp();

  const features: Feature[] =
    Array.isArray(t?.whyUs?.features) && t.whyUs.features.length
      ? t.whyUs.features.slice(0, 4)
      : fallbackFeatures;

  return (
    <section className="relative overflow-hidden bg-[#f7fbff] py-4">
      {/* Background Blur */}
      <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-blue-200/30 blur-[120px]" />
      <div className="absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-cyan-200/30 blur-[120px]" />

      <div className={`${container} relative`}>
        <div className="rounded-[36px] bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl md:p-10 lg:p-12">
          {/* Header */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Why Professionals Choose Miji
            </h2>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item, i) => {
              const Icon = icons[i % icons.length];

              return (
                <div
                  key={i}
                  className="group rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(37,99,235,0.12)]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] transition-all duration-300 group-hover:scale-105">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Trust Bar */}
          <div className="mt-10 rounded-[28px] bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Trusted By Thousands Of Travelers
                </h4>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Delivering reliable travel experiences with secure payments
                  and dedicated support.
                </p>
              </div>

              <div className="inline-flex rounded-full bg-green-100 px-5 py-2 text-sm font-bold text-green-700 shadow-sm">
                ⭐ Excellent Rated
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}