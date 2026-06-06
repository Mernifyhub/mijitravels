"use client";

import {
  BadgeCheck,
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
    desc: "Clear fare details without confusion.",
  },
  {
    title: "Responsive Support",
    desc: "Quick help before and after booking.",
  },
  {
    title: "Secure Handling",
    desc: "Safe and dependable booking process.",
  },
  {
    title: "Smooth Booking",
    desc: "Simple, organized, and professional.",
  },
];

const icons = [Wallet, Headphones, ShieldCheck, PlaneTakeoff];

export default function WhyChooseUs() {
  const { country, t, container } = useApp();

  const features: Feature[] =
    Array.isArray(t?.whyUs?.features) && t.whyUs.features.length
      ? t.whyUs.features.slice(0, 4)
      : fallbackFeatures;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f8fbff] to-[#eff6ff] pt-0 pb-10 sm:pt-1 sm:pb-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.05),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(147,197,253,0.16),transparent_30%)]" />

      <div className={`${container} relative`}>
        <div className="rounded-[28px] border border-blue-100 bg-white/80 p-3 shadow-[0_12px_40px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:p-4">
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe] p-5 text-[#0A2540]">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <BadgeCheck size={14} />
                {t?.whyUs?.badge || "Why Choose Us"}
              </div>

              <h2 className="mt-4 text-xl font-bold leading-tight sm:text-2xl">
                {t?.whyUs?.title || "Smart travel support, built for trust"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#33506f]">
                Reliable booking help for travelers in {country?.name || "your region"}.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Clear Fares", "Fast Support", "Secure Process"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-blue-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {features.map((item, i) => {
              const Icon = icons[i % icons.length];

              return (
                <div
                  key={i}
                  className="lg:col-span-2 rounded-[24px] border border-blue-100 bg-[#f8fbff] p-4 text-[#0A2540] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(37,99,235,0.10)]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                    <Icon size={18} />
                  </div>

                  <h3 className="text-sm font-semibold leading-5 sm:text-[15px]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}