"use client";

import {
  Plane, Shield, ChevronDown,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Phone, Mail, MapPin,
} from "lucide-react";
import useApp from "./hooks/useApp";

export default function Footer() {
  const { country, t, container } = useApp();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className={container}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-gray-800">

          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] rounded-2xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" style={{ transform: "rotate(-45deg)" }} />
              </div>
              <span className="text-3xl font-bold">Miji</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              {t.footer.desc} {country.name} since 2015.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#E31E24] hover:text-white transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-5">{t.footer.services}</h4>
            <ul className="space-y-3 text-sm">
              {t.footer.serviceLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition flex items-center gap-1">
                    <ChevronDown size={14} className="rotate-45" /> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-5">{t.footer.company}</h4>
            <ul className="space-y-3 text-sm">
              {t.footer.companyLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition flex items-center gap-1">
                    <ChevronDown size={14} className="rotate-45" /> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5">{t.footer.contact}</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={16} />
                </div>
                <span>+880 1700-000000</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={16} />
                </div>
                <span>support@miji.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} />
                </div>
                <span>Gulshan-1, Dhaka, BD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-green-400">
            <Shield size={16} />
            <span>{t.footer.certified}</span>
          </div>
          <p className="text-gray-500">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white transition">{t.footer.terms}</a>
            <a href="#" className="hover:text-white transition">{t.footer.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}