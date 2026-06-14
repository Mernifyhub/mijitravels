"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  Globe,
  LogIn,
  RefreshCw,
  ArrowLeft,
  Plane,
  Lock,
  Mail,
  Sparkles,
  Zap,
  TrendingUp,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  Award,
  Users,
  Headphones,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

type Step = "credentials" | "otp";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) {
    const raw = err.message || "";
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      try {
        const parsed = JSON.parse(raw.slice(jsonStart));
        if (Array.isArray(parsed?.message)) return parsed.message[0];
        if (parsed?.message) return parsed.message;
      } catch {}
    }
    const cleaned = raw
      .replace(/^API Error \d+ on [^:]+:\s*/i, "")
      .replace(/^Auth error on [^:]+:\s*/i, "")
      .replace(/^\d+ on [^:]+:\s*/i, "")
      .trim();
    if (cleaned) return cleaned;
  }
  return fallback;
};

const saveAuthData = (data: any): string => {
  const role = String(data?.Role || "").toUpperCase();
  localStorage.setItem("role", role);
  localStorage.setItem("userId", String(data?.userId || ""));
  localStorage.setItem("userName", String(data?.userName || ""));
  localStorage.setItem("userEmail", String(data?.userEmail || ""));
  localStorage.setItem("userType", String(data?.type || ""));
  localStorage.setItem("token", String(data?.token || ""));
  document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax; Secure`;
  document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax; Secure`;
  if (data?.deviceToken) {
    localStorage.setItem("deviceToken", String(data.deviceToken));
  }
  return role;
};

const getRedirectPath = (role: string, serverRedirect?: string): string => {
  if (serverRedirect) return serverRedirect;
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "USER":
    case "OPERATOR":
    case "VIEWER":
      return "/user/dashboard";
    default:
      return "";
  }
};

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
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [form, setForm] = useState({ email: "", password: "" });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(true);

  const otp = otpDigits.join("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError("");
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (e.key === "Enter" && otp.length === 6) handleVerifyOtp();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newDigits = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtpDigits(newDigits);
    const lastIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  };

  const startCooldown = (seconds = 120) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      const deviceToken =
        typeof window !== "undefined"
          ? localStorage.getItem("deviceToken") || undefined
          : undefined;
      const data = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          deviceToken,
        }),
        skipAuthRedirect: true,
        skipAuthToken: true,
      });
      if (data?.token && !data?.requireOtp) {
        const role = saveAuthData(data);
        const redirectPath = getRedirectPath(role, data?.redirectTo);
        if (!redirectPath) {
          setError("Unknown role. Please contact support.");
          return;
        }
        window.location.href = redirectPath;
        return;
      }
      if (data?.requireOtp) {
        setOtpEmail(data.email || form.email.trim());
        setSuccessMsg(data.message || "OTP sent to your email");
        setStep("otp");
        startCooldown(120);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      const data = await apiClient("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: otpEmail, otp, rememberDevice }),
        skipAuthRedirect: true,
        skipAuthToken: true,
      });
      if (!data?.token) {
        setError("Verification failed — no token received.");
        return;
      }
      const role = saveAuthData(data);
      const redirectPath = getRedirectPath(role, data?.redirectTo);
      if (!redirectPath) {
        setError("Unknown role. Please contact support.");
        return;
      }
      window.location.href = redirectPath;
    } catch (err) {
      setError(
        getErrorMessage(err, "OTP verification failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      const data = await apiClient("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: otpEmail }),
        skipAuthRedirect: true,
        skipAuthToken: true,
      });
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg((data as any)?.message || "New OTP sent");
      startCooldown(120);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step === "credentials") handleLogin();
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
          
          {/* Left: MIJI PORTAL - pure gradient glow behind */}
          <div className="relative">
            {/* Soft gradient glow behind text */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-red-500/30 blur-3xl opacity-60" />
            
            {/* Content */}
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
                B2B Enterprise Travel Platform
              </p>
            </div>
          </div>

          {/* Right: Big Time - pure gradient glow behind */}
          <div className="hidden md:block relative">
            {/* Soft gradient glow behind text */}
            <div className="absolute -inset-6 bg-gradient-to-r from-red-500/30 via-indigo-500/20 to-blue-600/30 blur-3xl opacity-60" />
            
            {/* Content */}
            <div className="relative text-right">
              <div className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-red-300 bg-clip-text text-transparent leading-none font-mono drop-shadow-2xl">
                <BigClock />
              </div>
              <p className="text-[10px] text-blue-300/70 tracking-[0.3em] uppercase font-semibold mt-1">
                Current Time
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CARD (Form pushed UP) ═══════════ */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 md:pt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden grid md:grid-cols-2">
            {/* ── LEFT BRANDING ── */}
            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#1d4e89] text-white p-8 text-center relative overflow-hidden">
              <div className="absolute top-[-15%] right-[-15%] w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-15%] left-[-15%] w-44 h-44 bg-gradient-to-tr from-red-500/15 to-orange-400/10 rounded-full blur-3xl" />

              <div className="z-10 mb-5">
                <div className="relative inline-block mb-3">
                  <div className="p-3.5 bg-gradient-to-br from-blue-400/30 to-red-400/20 rounded-2xl shadow-2xl shadow-blue-500/40">
                    <LogIn className="w-7 h-7 text-blue-200" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-red-300" />
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-1.5 bg-gradient-to-r from-white via-blue-100 to-red-200 bg-clip-text text-transparent">
                  MIJI
                </h2>
                <div className="h-0.5 w-16 bg-gradient-to-r from-blue-400 via-red-400 to-blue-400 mx-auto rounded-full" />
              </div>

              <div className="z-10 max-w-xs">
                <h3 className="text-lg font-semibold mb-2">Welcome Back! 👋</h3>
                <p className="text-blue-100/80 text-xs leading-relaxed mb-5">
                  Your gateway to seamless travel operations. Manage, track, and
                  scale globally.
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
                    { value: "10K+", label: "Bookings", color: "from-blue-300 to-cyan-300" },
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
                  B2B Travel Solutions
                </span>
              </div>
            </div>

            {/* ── RIGHT FORM ── */}
            <div className="p-7 md:p-9 flex flex-col justify-center bg-white relative">
              <AnimatePresence mode="wait">
                {step === "credentials" && (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-1">
                      <h2 className="text-2xl font-bold text-[#0B2545]">Sign In</h2>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Welcome back, please authenticate
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs px-3 py-2 rounded-md shadow-sm"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    <div className="relative mt-2 group">
                      <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                      <input
                        name="email"
                        value={form.email}
                        placeholder=" "
                        className="peer w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-gray-50 shadow-sm focus:bg-white focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                      />
                      <label className="absolute left-9 -top-2 text-[10px] text-gray-700 bg-white px-1 font-medium">
                        Email / Username
                      </label>
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1d4e89] transition" />
                      <input
                        type={showPass ? "text" : "password"}
                        name="password"
                        value={form.password}
                        placeholder=" "
                        className="peer w-full h-10 pl-9 pr-9 text-sm rounded-lg bg-gray-50 shadow-sm focus:bg-white focus:shadow-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 transition-all"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
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

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
                        <input type="checkbox" className="w-3 h-3 rounded text-[#1d4e89]" />
                        Keep me signed in
                      </label>
                      <button className="text-[11px] text-red-600 hover:text-red-700 hover:underline transition font-medium">
                        Forgot password?
                      </button>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.005 }}
                      disabled={loading}
                      onClick={handleLogin}
                      className="w-full relative bg-gradient-to-r from-[#0B2545] via-[#1d4e89] to-[#0B2545] text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            SIGN IN SECURELY
                          </>
                        )}
                      </span>
                    </motion.button>

                    <div className="text-center pt-1">
                      <p className="text-xs text-gray-600">
                        Don&apos;t have an account?{" "}
                        <a
                          href="/register"
                          className="font-semibold text-[#1d4e89] hover:text-red-600 transition-colors duration-200 inline-flex items-center gap-1 group"
                        >
                          Create Account
                          <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      </p>
                    </div>

                    <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Protected by enterprise-grade security
                    </div>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="relative inline-flex items-center justify-center w-12 h-12 mb-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-red-100 rounded-xl shadow-md" />
                        <ShieldCheck className="relative w-6 h-6 text-[#1d4e89]" />
                      </div>
                      <h2 className="text-xl font-bold text-[#0B2545]">
                        Two-Factor Authentication
                      </h2>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Code sent to{" "}
                        <span className="font-semibold text-[#1d4e89]">{otpEmail}</span>
                      </p>
                    </div>

                    {successMsg && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 border-l-4 border-green-500 text-green-700 text-xs px-3 py-2 rounded-md shadow-sm"
                      >
                        ✅ {successMsg}
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs px-3 py-2 rounded-md shadow-sm"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    <div className="flex justify-center gap-1.5" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-10 h-12 text-center text-xl font-bold rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d4e89]/30 focus:bg-white focus:shadow-md transition-all"
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>

                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none justify-center">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#1d4e89]"
                      />
                      Trust this device for 12 hours
                    </label>

                    <p className="text-center text-[10px] text-gray-400">
                      ⏱ Code expires in 5 minutes
                    </p>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.005 }}
                      disabled={loading || otp.length !== 6}
                      onClick={handleVerifyOtp}
                      className="w-full relative bg-gradient-to-r from-[#0B2545] via-[#1d4e89] to-[#0B2545] text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            VERIFY & CONTINUE
                          </>
                        )}
                      </span>
                    </motion.button>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStep("credentials");
                          setOtpDigits(["", "", "", "", "", ""]);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
                      >
                        <ArrowLeft size={12} />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 disabled:text-gray-400 transition font-medium"
                      >
                        <RefreshCw size={12} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      {/* ═══════════ DETAILED PREMIUM FOOTER ═══════════ */}
      <footer className="relative z-10 mt-10">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-black/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-10">
            
            {/* Top: 4-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              
              {/* Column 1: Brand */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="p-2 bg-gradient-to-br from-blue-500/30 to-red-500/20 rounded-lg shadow-lg shadow-blue-500/30">
                      <Plane className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full shadow-md shadow-red-500/50">
                      <div className="w-full h-full bg-red-400 rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold bg-gradient-to-r from-white via-blue-200 to-red-300 bg-clip-text text-transparent">
                        MIJI PORTAL
                      </span>
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500/20 to-red-500/20 rounded text-[8px] font-bold text-blue-200 uppercase tracking-wider shadow-sm">
                        v2.0
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed mb-4">
                  The complete B2B travel management platform powering thousands
                  of agencies worldwide with cutting-edge technology.
                </p>
                <div className="flex gap-2">
                  {[
                    { Icon: Facebook, color: "hover:text-blue-400", href: "#" },
                    { Icon: Twitter, color: "hover:text-sky-400", href: "#" },
                    { Icon: Instagram, color: "hover:text-pink-400", href: "#" },
                    { Icon: Linkedin, color: "hover:text-blue-500", href: "#" },
                  ].map(({ Icon, color, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      className={`p-2 bg-white/5 hover:bg-white/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-white/60 ${color} hover:-translate-y-0.5`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Column 2: Quick Links */}
              <div>
                <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-red-400 rounded-full" />
                  Quick Links
                </h4>
                <ul className="space-y-2.5 text-xs">
                  {["About Us", "Our Services", "Pricing Plans", "Contact Us", "Careers"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/50 hover:text-blue-300 transition flex items-center gap-2 group">
                        <span className="w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Services */}
              <div>
                <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-red-400 rounded-full" />
                  Services
                </h4>
                <ul className="space-y-2.5 text-xs">
                  {[
                    { icon: Plane, label: "Flight Booking" },
                    { icon: CreditCard, label: "Payment Gateway" },
                    { icon: Users, label: "B2B Solutions" },
                    { icon: Headphones, label: "24/7 Support" },
                    { icon: BarChart3, label: "Analytics Dashboard" },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label}>
                      <a href="#" className="text-white/50 hover:text-blue-300 transition flex items-center gap-2 group">
                        <Icon className="w-3 h-3 text-blue-400/70 group-hover:text-blue-400" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Contact */}
              <div>
                <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-red-400 rounded-full" />
                  Get in Touch
                </h4>
                <ul className="space-y-3 text-xs text-white/50">
                  <li className="flex items-start gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-md mt-0.5 shadow-sm">
                      <Mail className="w-3 h-3 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Email</p>
                      <a href="mailto:support@mijitravels.com" className="hover:text-blue-300 transition">
                        support@mijitravels.com
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1.5 bg-red-500/10 rounded-md mt-0.5 shadow-sm">
                      <Phone className="w-3 h-3 text-red-300" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Phone</p>
                      <a href="tel:+8801234567890" className="hover:text-red-300 transition">
                        +880 1234-567890
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-md mt-0.5 shadow-sm">
                      <MapPin className="w-3 h-3 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Address</p>
                      <span>Dhaka, Bangladesh</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/40">
                <span>© 2026 MIJI Portal. All rights reserved.</span>
                <span className="hidden md:inline text-white/20">•</span>
                <a href="#" className="hover:text-blue-300 transition">Privacy Policy</a>
                <span className="hidden md:inline text-white/20">•</span>
                <a href="#" className="hover:text-blue-300 transition">Terms of Service</a>
                <span className="hidden md:inline text-white/20">•</span>
                <a href="#" className="hover:text-blue-300 transition">Cookie Policy</a>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span>Trusted by 10,000+ travel agencies worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}