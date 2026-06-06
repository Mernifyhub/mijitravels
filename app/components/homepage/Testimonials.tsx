"use client";

import { BadgeCheck, Building2, MapPin, Quote } from "lucide-react";
import { useEffect, useRef } from "react";
import useApp from "./hooks/useApp";

type Review = {
  agency: string;
  person: string;
  role: string;
  country: string;
  flag: string;
  content: string;
  initials: string;
  color: string;
};

const reviews: Review[] = [
  {
    agency: "Sky Travel BD",
    person: "Rafiq Uddin",
    role: "Managing Director",
    country: "Bangladesh",
    flag: "🇧🇩",
    content:
      "Excellent platform for agencies. Competitive fares and smooth ticketing process every time.",
    initials: "ST",
    color: "from-cyan-500 to-blue-600",
  },
  {
    agency: "Gulf Star Tourism",
    person: "Khalid Al Mansoor",
    role: "Operations Manager",
    country: "UAE",
    flag: "🇦🇪",
    content:
      "We handle hundreds of bookings monthly. The system is fast, reliable, and support is always available.",
    initials: "GS",
    color: "from-emerald-500 to-green-600",
  },
  {
    agency: "Al Haramain Travels",
    person: "Fahad Bin Saleh",
    role: "CEO",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    content:
      "Best rates for Hajj and Umrah group bookings. Professional service with clear communication.",
    initials: "AH",
    color: "from-amber-500 to-orange-600",
  },
  {
    agency: "Karachi Fly Agency",
    person: "Imran Siddiqui",
    role: "Senior Agent",
    country: "Pakistan",
    flag: "🇵🇰",
    content:
      "Reliable partner for our agency. Quick confirmations and transparent pricing structure.",
    initials: "KF",
    color: "from-green-500 to-teal-600",
  },
  {
    agency: "Delhi Wings Travel",
    person: "Amit Sharma",
    role: "Branch Manager",
    country: "India",
    flag: "🇮🇳",
    content:
      "Smooth integration with our workflow. Great fares and dependable after-sales support.",
    initials: "DW",
    color: "from-orange-500 to-red-500",
  },
  {
    agency: "Zia International Tours",
    person: "Nasir Ahmed",
    role: "Founder",
    country: "Bangladesh",
    flag: "🇧🇩",
    content:
      "Our go-to platform for international ticketing. The pricing is always competitive.",
    initials: "ZI",
    color: "from-blue-500 to-indigo-600",
  },
  {
    agency: "Riyadh Express Travel",
    person: "Sultan Al Otaibi",
    role: "General Manager",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    content:
      "Fast processing, great rates, and professional support. Highly recommended for agencies.",
    initials: "RE",
    color: "from-violet-500 to-purple-600",
  },
  {
    agency: "Mumbai Jet Agency",
    person: "Pradeep Nair",
    role: "Director",
    country: "India",
    flag: "🇮🇳",
    content:
      "We switched last year and haven't looked back. Consistent service and competitive pricing.",
    initials: "MJ",
    color: "from-rose-500 to-pink-600",
  },
  {
    agency: "Lahore Air Connect",
    person: "Hassan Raza",
    role: "Travel Consultant",
    country: "Pakistan",
    flag: "🇵🇰",
    content:
      "Dependable and professional. Our clients are always satisfied with the booking experience.",
    initials: "LA",
    color: "from-teal-500 to-cyan-600",
  },
  {
    agency: "Dubai Fly Hub",
    person: "Ahmed Al Hashimi",
    role: "Operations Head",
    country: "UAE",
    flag: "🇦🇪",
    content:
      "Seamless booking flow and excellent fare options for both economy and business class.",
    initials: "DF",
    color: "from-sky-500 to-blue-600",
  },
];

export default function Testimonials() {
  const { t, container } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.5;

    const step = () => {
      if (!pauseRef.current && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const doubled = [...reviews, ...reviews];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0d2d5a] to-[#0A2540] py-12 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_26%)]" />

      <div className={`${container} relative`}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur">
              <BadgeCheck size={16} />
              {t?.testimonials?.badge || "Agency Reviews"}
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t?.testimonials?.title || "Trusted by agencies across the globe"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/65 sm:text-base">
              {t?.testimonials?.subtitle ||
                "Partner agencies from Bangladesh, UAE, Saudi Arabia, Pakistan, and India share their experience."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["🇧🇩 BD", "🇦🇪 UAE", "🇸🇦 KSA", "🇵🇰 PK", "🇮🇳 IND"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Scrollable reviews */}
      <div
        ref={scrollRef}
        onMouseEnter={() => (pauseRef.current = true)}
        onMouseLeave={() => (pauseRef.current = false)}
        className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-hide sm:px-6 lg:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {doubled.map((item, i) => (
          <article
            key={i}
            className="group relative flex-shrink-0 w-[320px] sm:w-[360px] rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition-all duration-300 hover:bg-white/[0.1]"
          >
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-[24px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-60" />

            {/* Agency + Person */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-sm font-bold text-white shadow-sm`}
                >
                  {item.initials}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {item.agency}
                    </h3>
                    <span className="text-base leading-none">{item.flag}</span>
                  </div>
                  <p className="truncate text-xs text-white/55">
                    {item.person} • {item.role}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-cyan-300">
                <Quote size={14} />
              </div>
            </div>

            {/* Review */}
            <p className="text-sm leading-6 text-white/80">
              &quot;{item.content}&quot;
            </p>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70">
                <MapPin size={11} />
                {item.country}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70">
                <Building2 size={11} />
                Agency Partner
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0A2540] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0A2540] to-transparent sm:w-24" />
    </section>
  );
}