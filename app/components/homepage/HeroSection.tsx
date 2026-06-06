"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Plane, 
  Building2, 
  Users, 
  TrendingUp,
  Shield,
  Headphones,
  Globe
} from "lucide-react";
import useApp from "./hooks/useApp";

export default function HeroSection() {
  const { t, container } = useApp();

  const trustStats = [
    { value: "500+", label: "Airlines", icon: Plane },
    { value: "2,000+", label: "Active Agents", icon: Building2 },
    { value: "150+", label: "Countries", icon: Globe },
    { value: "24/7", label: "Support", icon: Headphones },
  ];

  const features = [
    "Real-time GDS Integration",
    "Competitive Net Rates",
    "Instant Booking Confirmation",
    "Dedicated Account Manager",
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#0A2540] via-[#0d2d4f] to-[#061229] overflow-hidden">
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

      <div className={`${container} relative py-16 md:py-20`}>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT - Main Content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full mb-6">
                <Shield className="text-cyan-400" size={14} />
                <span className="text-cyan-100 text-xs font-semibold tracking-wide">
                  IATA Certified • Trusted by 2,000+ Agencies
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                B2B Travel Portal for
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Modern Travel Agencies
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-6 text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
                Access the best fares from 500+ airlines, manage bookings effortlessly, 
                and grow your travel business with our enterprise-grade platform.
              </p>

              {/* Feature List */}
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 text-slate-200"
                  >
                    <CheckCircle2 className="text-cyan-400 flex-shrink-0" size={18} />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group bg-white text-[#0A2540] px-7 py-4 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-cyan-50 transition-all shadow-xl"
                >
                  Become an Agent
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="bg-transparent border-2 border-white/20 text-white px-7 py-4 rounded-lg font-bold text-sm hover:bg-white/5 hover:border-white/40 transition-all"
                >
                  Agent Login
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-semibold">
                  Trusted Partners
                </p>
                <div className="flex flex-wrap items-center gap-6 opacity-60">
                  <div className="text-white font-bold text-sm tracking-wider">IATA</div>
                  <div className="text-white font-bold text-sm tracking-wider">BAR</div>
                  <div className="text-white font-bold text-sm tracking-wider">ATAB</div>
                  <div className="text-white font-bold text-sm tracking-wider">TAAB</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT - Login Card or Quick Action */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                {/* Card Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#0A2540] to-[#061229] rounded-xl mb-3">
                    <Plane className="text-white" size={26} style={{ transform: "rotate(-45deg)" }} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A2540]">
                    Agent Portal
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Access your dashboard instantly
                  </p>
                </div>

                {/* Quick Login Options */}
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full bg-[#0A2540] text-white text-center py-4 rounded-xl font-bold text-sm hover:bg-[#0d2d4f] transition-all shadow-md"
                  >
                    Login to Dashboard
                  </Link>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-400">NEW HERE?</span>
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="block w-full bg-cyan-50 text-[#0A2540] text-center py-4 rounded-xl font-bold text-sm hover:bg-cyan-100 transition-all border-2 border-cyan-100"
                  >
                    Register as Agent
                  </Link>
                </div>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg">
                    <Headphones className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-xs">
                      <p className="font-bold text-amber-900">Need Help?</p>
                      <p className="text-amber-700 mt-0.5">
                        Call us: <strong>+880 1XXX-XXXXXX</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Background */}
              <div className="absolute -top-4 -right-4 w-full h-full bg-cyan-400/10 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-full h-full bg-blue-400/10 rounded-2xl -z-20" />
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-10 border-t border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <Icon className="text-cyan-400" size={22} />
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </section>
  );
}