"use client";

import {
  Plane,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Send,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useApp from "./hooks/useApp";

export default function Footer() {
  const { country, t, container } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
      setLoading(false);
    }, 1200);
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0A2540] via-[#06182f] to-black text-gray-400 overflow-hidden">
      {/* ✅ Toaster included in same file */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0A2540",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* ═══════════ Background Effects ═══════════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-500/8 rounded-full blur-[150px]" />
      </div>

      {/* ═══════════ TOP CTA STRIP ═══════════ */}
      <div className="relative border-b border-white/5">
        <div className={`${container} py-10`}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900/60 to-red-950/40 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-blue-500/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-red-500/20 rounded-full mb-3 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    Stay Updated
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Subscribe to Our Newsletter
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  Exclusive deals, latest fares & travel insights delivered weekly.
                </p>
              </div>

              {/* Subscribe Form */}
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:min-w-[400px]"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={loading}
                    className="w-full h-11 pl-10 pr-3 bg-white rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 shadow-lg shadow-black/20 transition-all disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 h-11 bg-red-600 hover:bg-red-700 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200 active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN FOOTER GRID ═══════════ */}
      <div className={`${container} relative py-12`}>
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 pb-10 border-b border-white/5">
          
          {/* Brand Column (4 cols) */}
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <Plane className="w-6 h-6 text-blue-300" style={{ transform: "rotate(-45deg)" }} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-md shadow-red-500/50">
                  <div className="w-full h-full bg-red-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black bg-gradient-to-r from-white via-blue-200 to-red-300 bg-clip-text text-transparent">
                    MIJI Portal
                  </span>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500/20 to-red-500/20 rounded text-[8px] font-bold text-blue-200 uppercase tracking-wider shadow-sm">
                    v2.0
                  </span>
                </div>
                <p className="text-[10px] text-blue-300/60 tracking-[0.2em] uppercase font-semibold">
                  Enterprise B2B Portal Platform
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6 text-white/50">
              {t.footer.desc} {country.name} since 2015. Empowering travel agencies with cutting-edge technology and global airline partnerships.
            </p>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { value: "500+", label: "Agencies", color: "from-blue-300 to-cyan-300" },
                { value: "100+", label: "Airlines", color: "from-green-300 to-emerald-300" },
                { value: "10+", label: "Years", color: "from-red-300 to-orange-300" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 text-center shadow-md hover:bg-white/10 transition">
                  <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-[9px] text-white/50 uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { Icon: Facebook, color: "hover:bg-blue-600" },
                { Icon: Twitter, color: "hover:bg-sky-500" },
                { Icon: Instagram, color: "hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600" },
                { Icon: Linkedin, color: "hover:bg-blue-700" },
                { Icon: Youtube, color: "hover:bg-red-600" },
              ].map(({ Icon, color }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={`Social link ${i}`}
                  className={`w-9 h-9 bg-white/5 backdrop-blur-md rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors duration-300 shadow-md ${color}`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services (2 cols) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-red-400 rounded-full" />
              {t.footer.services}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {t.footer.serviceLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-blue-300 transition flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition" />
                    <span>{item}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company (2 cols) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-red-400 rounded-full" />
              {t.footer.company}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {t.footer.companyLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-blue-300 transition flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition" />
                    <span>{item}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (4 cols) */}
          <div className="col-span-2 md:col-span-4">
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-red-400 rounded-full" />
              {t.footer.contact}
            </h4>
            <div className="space-y-3">
              <a href="tel:+96605608992" className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shadow-md">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Phone size={15} className="text-green-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Call us</p>
                  <p className="text-sm text-white/80 group-hover:text-white transition truncate">+966-0560-8992</p>
                </div>
              </a>

              <a href="mailto:support@miji.com" className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shadow-md">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Mail size={15} className="text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Email us</p>
                  <p className="text-sm text-white/80 group-hover:text-white transition truncate">support@miji.com</p>
                </div>
              </a>

              <div className="group flex items-start gap-3 p-2.5 rounded-xl bg-white/5 shadow-md">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin size={15} className="text-red-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Visit us</p>
                  <p className="text-sm text-white/80 leading-tight">Riyadh, Riyadh Region, KSA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ COPYRIGHT ═══════════ */}
        <div className="pt-6 text-center">
          <p className="text-[11px] text-white/40">
            © {new Date().getFullYear()}{" "}
            <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent font-semibold">
              MIJI 
            </span>{" "}
            • {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}