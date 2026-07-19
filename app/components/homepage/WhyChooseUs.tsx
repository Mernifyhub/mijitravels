"use client";

import {
  Headphones,
  PlaneTakeoff,
  ShieldCheck,
  Wallet,
  Sparkles,
  Users,
  Star,
  Globe2,
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

const cardData = [
  {
    icon: Wallet,
    gradient: "from-blue-500 to-blue-700",
    glow: "shadow-blue-500/30",
    bgAccent: "bg-blue-50",
    textAccent: "text-blue-600",
  },
  {
    icon: Headphones,
    gradient: "from-purple-500 to-purple-700",
    glow: "shadow-purple-500/30",
    bgAccent: "bg-purple-50",
    textAccent: "text-purple-600",
  },
  {
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-emerald-700",
    glow: "shadow-emerald-500/30",
    bgAccent: "bg-emerald-50",
    textAccent: "text-emerald-600",
  },
  {
    icon: PlaneTakeoff,
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/30",
    bgAccent: "bg-orange-50",
    textAccent: "text-orange-600",
  },
];

const stats = [
  { icon: Users, value: "2M+", label: "Happy Travelers" },
  { icon: Globe2, value: "500+", label: "Destinations" },
  { icon: Star, value: "4.9", label: "Rated Service" },
  { icon: ShieldCheck, value: "100%", label: "Secure Payments" },
];

export default function WhyChooseUs() {
  const { t, container } = useApp();

  const features: Feature[] =
    Array.isArray(t?.whyUs?.features) && t.whyUs.features.length
      ? t.whyUs.features.slice(0, 4)
      : fallbackFeatures;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-10 sm:py-14 lg:py-20">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-[120px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-[120px] sm:h-96 sm:w-96" />

      {/* Grid pattern overlay */}
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
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm">
            <Sparkles size={14} className="text-amber-500" />
            Why Choose Us
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">
            Built For{" "}
            <span className="bg-black from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Modern Travelers
            </span>
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {features.map((item, i) => {
            const data = cardData[i % cardData.length];
            const Icon = data.icon;
            const num = String(i + 1).padStart(2, "0");

            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:rounded-3xl sm:p-6"
              >
                {/* Number badge (background) */}
                <div className="pointer-events-none absolute -right-2 -top-2 select-none text-6xl font-black text-slate-100 transition-all duration-500 group-hover:text-slate-200 sm:text-7xl">
                  {num}
                </div>

                {/* Icon */}
                <div
                  className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${data.gradient} text-white shadow-lg ${data.glow} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl`}
                >
                  <Icon size={22} className="sm:hidden" />
                  <Icon size={26} className="hidden sm:block" />
                </div>

                {/* Title */}
                <h3 className="relative text-base font-bold text-slate-900 sm:text-lg">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="relative mt-2 text-[13px] leading-6 text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                  {item.desc}
                </p>

                {/* Bottom accent line */}
                <div
                  className={`mt-4 h-1 w-8 rounded-full bg-gradient-to-r ${data.gradient} transition-all duration-500 group-hover:w-16 sm:mt-5`}
                />
              </div>
            );
          })}
        </div>

        {/* Stats Bar */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A2540] via-[#0f3560] to-[#0A2540] p-5 shadow-[0_20px_50px_rgba(10,37,64,0.25)] sm:mt-12 sm:rounded-3xl sm:p-8">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 sm:gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300 backdrop-blur-sm sm:h-12 sm:w-12 sm:rounded-2xl">
                    <Icon size={18} className="sm:hidden" />
                    <Icon size={22} className="hidden sm:block" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white sm:text-2xl">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-medium text-white/60 sm:text-xs">
                      {stat.label}
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