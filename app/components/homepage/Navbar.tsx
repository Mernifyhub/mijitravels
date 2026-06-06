"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plane, Menu, X } from "lucide-react";
import useApp from "./hooks/useApp";

export default function Navbar() {
  const { t, container } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: t.nav.flights, href: "#" },
    { label: t.nav.hotels, href: "#" },
    { label: t.nav.umrah, href: "#" },
    { label: t.nav.visa, href: "#" },
    { label: t.nav.holidays, href: "#" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b transition-all duration-500 ${
        isScrolled ? "shadow-xl py-2" : "py-3"
      }`}
    >
      <div className={container}>
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0A2540] via-[#1e3a5f] to-[#0A2540] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <Plane className="w-5 h-5 text-white" style={{ transform: "rotate(-45deg)" }} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E31E24] rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="text-[9px] font-bold text-white">M</span>
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-[-1px] text-[#0A2540] group-hover:text-[#E31E24] transition-colors">
              MIJI
            </h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-gray-700">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="relative py-2 group hover:text-[#0A2540] transition-all">
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-[#E31E24] group-hover:w-6 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pb-3 border-t pt-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-2 px-3 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}