"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  UserPlus,
  RefreshCw,
  ArrowRight,
  Plane,
  Lock,
  Mail,
  Sparkles,
  User,
  Phone as PhoneIcon,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Building2,
  Hash,
  FileText,
  CreditCard,
  Users,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import Footer from "../homepage/Footer";

// ⏰ Big Clock with Seconds
const BigClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time}</span>;
};

export default function AgentRegistration() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // FILE STATE
  const [nidFile, setNidFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    agentName: "",
    agentAddress: "",
    phone: "",
    aviationNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setMessage({ type: "", text: "" });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    if (!nidFile || !licenseFile) {
      setMessage({ type: "error", text: "Please upload NID & Trade License" });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // TEXT
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // FILES
      formData.append("nidCopy", nidFile);
      formData.append("tradeLicense", licenseFile);

      // API call
      const data = await apiClient("/auth/register", {
        method: "POST",
        body: formData,
        skipAuthToken: true,
      });

      setMessage({
        type: "success",
        text: data?.message || "Registration successful!",
      });

      // RESET
      setForm({
        firstName: "",
        lastName: "",
        agentName: "",
        agentAddress: "",
        phone: "",
        aviationNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setNidFile(null);
      setLicenseFile(null);

    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#020617] flex flex-col">
      {/* ═══════════ BACKGROUND ═══════════ */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0B2545] to-slate-950" />
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-red-600/15 to-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-20 flex-shrink-0 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: MIJI PORTAL */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-red-500/30 blur-3xl opacity-60" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-red-300 bg-clip-text text-transparent leading-none drop-shadow-2xl">
                  MIJI PORTAL
                </h1>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500/30 to-red-500/30 rounded text-[9px] font-bold text-blue-100 uppercase tracking-wider">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-blue-300/70 tracking-[0.3em] uppercase font-semibold mt-1">
                Enterprise B2B Portal Platform
              </p>
            </div>
          </div>

          {/* Right: Big Time */}
          <div className="hidden md:block relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-red-500/30 via-indigo-500/20 to-blue-600/30 blur-3xl opacity-60" />
            <div className="relative text-right">
              <div className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-red-300 bg-clip-text text-transparent leading-none font-mono drop-shadow-2xl">
                <BigClock />
              </div>
              <p className="text-[10px] text-blue-300/70 tracking-[0.3em] uppercase font-semibold mt-1">
               Time and tide wait for none
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CARD ═══════════ */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4 md:pt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden grid md:grid-cols-2">
            
            {/* ── LEFT BRANDING ── */}
            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#1d4e89] text-white p-8 text-center relative overflow-hidden">
              <div className="absolute top-[-15%] right-[-15%] w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-15%] left-[-15%] w-44 h-44 bg-gradient-to-tr from-red-500/15 to-orange-400/10 rounded-full blur-3xl" />

              <div className="z-10 mb-5">
                <div className="relative inline-block mb-3">
                  <div className="p-3.5 bg-gradient-to-br from-blue-400/30 to-red-400/20 rounded-2xl shadow-2xl shadow-blue-500/40">
                    <UserPlus className="w-7 h-7 text-blue-200" />
                  </div>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-1.5 bg-gradient-to-r from-white via-blue-100 to-red-200 bg-clip-text text-transparent">
                 MIJI
                </h2>
                <div className="h-0.5 w-16 bg-gradient-to-r from-blue-400 via-red-400 to-blue-400 mx-auto rounded-full" />
              </div>

              <div className="z-10 max-w-xs">
                <h3 className="text-lg font-semibold mb-2">Agent Registration</h3>
                <p className="text-blue-100/80 text-xs leading-relaxed mb-5">
                  Elevate your aviation business to the next level. Join our exclusive network of agents.
                </p>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon: BarChart3, color: "text-blue-300", bg: "from-blue-500/20 to-blue-600/10", label: "Analytics" },
                    { icon: ShieldCheck, color: "text-green-400", bg: "from-green-500/20 to-green-600/10", label: "Secure" },
                    { icon: Zap, color: "text-red-300", bg: "from-red-500/20 to-orange-500/10", label: "Fast" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`p-2 bg-gradient-to-br ${item.bg} rounded-lg shadow-md hover:shadow-lg transition`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color} mb-1`} />
                      <p className="text-[9px] font-bold uppercase tracking-wider">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 pt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { value: "500+", label: "Agencies", color: "from-blue-300 to-cyan-300" },
                    { value: "99.9%", label: "Uptime", color: "from-green-300 to-emerald-300" },
                    { value: "24/7", label: "Support", color: "from-red-300 to-orange-300" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className={`text-base font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-[9px] text-blue-200/60 uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="z-10 mt-4 flex items-center gap-1.5 text-blue-300/70">
                <Globe className="w-3 h-3" />
                <span className="text-[9px] tracking-widest uppercase">
                  Enterprise B2B Portal Platform
                </span>
              </div>
            </div>

            {/* ── RIGHT FORM ── */}
            <div className="p-7 md:p-8 flex flex-col justify-center bg-white relative">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="text-center mb-1">
                  <h2 className="text-2xl font-bold text-[#0B2545]">Agent Registration</h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Please enter correct information to continue
                  </p>
                </div>

                {/* Message */}
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-xs px-3 py-2 rounded-md shadow-sm border-l-4 ${
                      message.type === "error"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "bg-green-50 border-green-500 text-green-700"
                    }`}
                  >
                    {message.type === "error" ? "⚠️" : "✅"} {message.text}
                  </motion.div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group mt-2">
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                    <input
                      name="firstName"
                      value={form.firstName}
                      placeholder=" "
                      className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                      onChange={handleChange}
                    />
                    <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                      First Name
                    </label>
                  </div>
                  <div className="relative group mt-2">
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                    <input
                      name="lastName"
                      value={form.lastName}
                      placeholder=" "
                      className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                      onChange={handleChange}
                    />
                    <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                      Last Name
                    </label>
                  </div>
                </div>

                {/* Agent Name */}
                <div className="relative group">
                  <Building2 className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                  <input
                    name="agentName"
                    value={form.agentName}
                    placeholder=" "
                    className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                    onChange={handleChange}
                  />
                  <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                    Agent / Company Name
                  </label>
                </div>

                {/* Agent Address */}
                <div className="relative group">
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                  <input
                    name="agentAddress"
                    value={form.agentAddress}
                    placeholder=" "
                    className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                    onChange={handleChange}
                  />
                  <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                    Agent Address
                  </label>
                </div>

                {/* Phone + Aviation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <PhoneIcon className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                    <input
                      name="phone"
                      value={form.phone}
                      placeholder=" "
                      className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                      onChange={handleChange}
                    />
                    <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                      Phone Number
                    </label>
                  </div>
                  <div className="relative group">
                    <Hash className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                    <input
                      name="aviationNumber"
                      value={form.aviationNumber}
                      placeholder=" "
                      className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                      onChange={handleChange}
                    />
                    <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                      Civil Aviation No.
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder=" "
                    className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                    onChange={handleChange}
                  />
                  <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                    Email Address
                  </label>
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      value={form.password}
                      placeholder=" "
                      className="peer w-full h-10 pl-9 pr-9 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                      onChange={handleChange}
                    />
                    <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      placeholder=" "
                      className="peer w-full h-10 pl-9 pr-9 text-sm rounded-lg bg-gray-50 shadow-sm hover:shadow-md focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                      onChange={handleChange}
                    />
                    <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* NID */}
                  <label className="cursor-pointer group">
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all ${
                      nidFile 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700" 
                        : "bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#1d4e89]"
                    }`}>
                      {nidFile ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <UploadCloud className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-[11px] font-medium truncate">
                        {nidFile ? nidFile.name : "Upload NID Copy *"}
                      </span>
                    </div>
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => setNidFile(e.target.files[0])}
                    />
                  </label>

                  {/* Trade License */}
                  <label className="cursor-pointer group">
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all ${
                      licenseFile 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700" 
                        : "bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#1d4e89]"
                    }`}>
                      {licenseFile ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-[11px] font-medium truncate">
                        {licenseFile ? licenseFile.name : "Upload Trade License *"}
                      </span>
                    </div>
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => setLicenseFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <p className="text-[10px] text-gray-500">
                  By registering, you agree to our Terms of Service & Privacy Policy.
                </p>

                {/* Submit Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.005 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative bg-gradient-to-r from-[#0B2545] via-[#1d4e89] to-[#0B2545] text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 mt-2"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        REGISTERING...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        REGISTER NOW
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Sign In Link */}
                <div className="text-center pt-1">
                  <p className="text-xs text-gray-600">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="font-semibold text-[#1d4e89] hover:text-red-600 transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      Sign In
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

       {/* ═══════════ DETAILED PREMIUM FOOTER ═══════════ */}
            <footer className="relative z-10 mt-50">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              <Footer/>
            </footer>
          </div>
    
  );
}