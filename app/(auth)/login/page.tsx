"use client";

import { useState } from "react";
import {Eye,EyeOff,ShieldCheck,BarChart3,Globe,LogIn,RefreshCw,ArrowLeft,} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

// ── Types ──
type Step = "credentials" | "otp";

type LoginResponse = {
  success: boolean;
  requireOtp?: boolean;
  email?: string;
  type?: string;
  message?: string;
};

type VerifyOtpResponse = {
  success: boolean;
  Role: string;
  type: string;
  redirectTo?: string;
  userId: string;
  userName: string;
  userEmail: string;
  token: string;
};

// ── Helper: extract error message ──
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) {
    const raw = err.message || "";

    // try to extract clean message from "API Error 401 on /auth/login: {JSON}"
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      try {
        const parsed = JSON.parse(raw.slice(jsonStart));
        if (Array.isArray(parsed?.message)) return parsed.message[0];
        if (parsed?.message) return parsed.message;
      } catch {}
    }

    // clean prefix like "API Error 401 on /auth/login: Invalid password"
    const cleaned = raw
      .replace(/^API Error \d+ on [^:]+:\s*/i, "")
      .replace(/^Auth error on [^:]+:\s*/i, "")
      .replace(/^\d+ on [^:]+:\s*/i, "")
      .trim();

    if (cleaned) return cleaned;
  }
  return fallback;
};

// ── Helper: extract status code from error ──
const getErrorStatus = (err: unknown): number | null => {
  if (err instanceof Error) {
    const match = err.message.match(/^API Error (\d+)/);
    if (match) return parseInt(match[1]);

    // check if apiClient attached status
    if ("status" in err && typeof (err as any).status === "number") {
      return (err as any).status;
    }
  }
  return null;
};

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(true);

  // ── Handle Input ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // ── Cooldown Timer ──
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

  // ========================
  // STEP 1: Login
  // ========================
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

    // ✅ trusted device hole direct login
    if (data?.token && !data?.requireOtp) {
      const role = String(data?.Role || "").toUpperCase();

      localStorage.setItem("role", role);
      localStorage.setItem("userId", String(data?.userId || ""));
      localStorage.setItem("userName", String(data?.userName || ""));
      localStorage.setItem("userEmail", String(data?.userEmail || ""));
      localStorage.setItem("userType", String(data?.type || ""));
      localStorage.setItem("token", String(data?.token || ""));
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax; Secure`;
      document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax; Secure`;
      // ---
      if (data?.deviceToken) localStorage.setItem("deviceToken", String(data.deviceToken));

      if (data?.redirectTo) {
        router.push(data.redirectTo);
        return;
      }

      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "MANAGER") router.push("/manager/dashboard");
      else if (["USER", "OPERATOR", "VIEWER"].includes(role))
        router.push("/user/dashboard");
      else setError("Unknown role. Please contact support.");

      return;
    }

    // ✅ normal OTP flow
    if (data?.requireOtp) {
      setOtpEmail(data.email || form.email.trim());
      setSuccessMsg(data.message || "OTP sent to your email");
      setStep("otp");
      startCooldown(120);
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    setError(getErrorMessage(err, "Login failed. Please try again."));
  } finally {
    setLoading(false);
  }
};

  // ========================
  // STEP 2: Verify OTP
  // ========================
const handleVerifyOtp = async () => {
  if (!otp.trim() || otp.trim().length !== 6) {
    setError("Please enter the 6-digit OTP");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = await apiClient("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: otpEmail,
        otp: otp.trim(),
        rememberDevice,
      }),
      skipAuthRedirect: true,
      skipAuthToken: true,
    });

    console.log("VERIFY OTP RESPONSE:", data);

    if (data?.deviceToken) {
      localStorage.setItem("deviceToken", data.deviceToken);
    }

    console.log("Saved deviceToken:", localStorage.getItem("deviceToken"));

    const role = String(data?.Role || "").toUpperCase();

    localStorage.setItem("role", role);
    localStorage.setItem("userId", String(data?.userId || ""));
    localStorage.setItem("userName", String(data?.userName || ""));
    localStorage.setItem("userEmail", String(data?.userEmail || ""));
    localStorage.setItem("userType", String(data?.type || ""));
    localStorage.setItem("token", String(data?.token || ""));

    if (data?.redirectTo) {
      router.push(data.redirectTo);
      return;
    }

    if (role === "ADMIN") router.push("/admin/dashboard");
    else if (role === "MANAGER") router.push("/manager/dashboard");
    else if (["USER", "OPERATOR", "VIEWER"].includes(role)) {
      router.push("/user/dashboard");
    } else {
      setError("Unknown role. Please contact support.");
    }
  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);
    setError("OTP verification failed.");
  } finally {
    setLoading(false);
  }
};
  // ========================
  // RESEND OTP
  // ========================
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

      setOtp("");
      setSuccessMsg(
        (data as any)?.message || "New OTP sent to your email"
      );
      startCooldown(120);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend OTP."));
    } finally {
      setLoading(false);
    }
  };

  // ── Enter Key ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "credentials") handleLogin();
      else handleVerifyOtp();
    }
  };

  // ========================
  // UI — তোমার EXACT design
  // ========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-200"
      >
        {/* ── Left Branding (EXACT SAME) ── */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#1d4e89] text-white p-12 text-center relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="z-10 mb-8">
            <div className="inline-block p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
              <LogIn className="w-15 h-7 text-blue-300" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2">
              MIJI
            </h2>
            <div className="h-1 w-20 bg-blue-400 mx-auto rounded-full" />
          </div>

          <div className="z-10 max-w-sm">
            <h3 className="text-xl font-semibold mb-3">Welcome Back!</h3>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
              Access your central command center to monitor operations, manage
              bookings, and scale your travel business.
            </p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-300 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Analytics
                </p>
                <p className="text-[10px] text-blue-200/60">
                  Real-time data insights
                </p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Secure
                </p>
                <p className="text-[10px] text-blue-200/60">
                  End-to-end encryption
                </p>
              </div>
            </div>
          </div>

          <div className="z-10 mt-12 flex items-center gap-2 text-blue-300/50">
            <Globe className="w-4 h-4" />
            <span className="text-xs tracking-widest uppercase">
              B2B Travel Solutions
            </span>
          </div>
        </div>

        {/* ── Right Form ── */}
        <div className="p-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Credentials ── */}
            {step === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="text-2xl font-bold text-[#0B2545] text-center">
                  Login
                </h2>
                <p className="text-center text-gray-600 text-sm">
                  Enter your credentials to continue
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="relative mt-3">
                  <input
                    name="email"
                    value={form.email}
                    placeholder=" "
                    className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-[#0B2545]"
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                  <label className="absolute left-3 -top-2 text-xs text-gray-950 bg-white px-1">
                    Email / Username
                  </label>
                </div>

                {/* Password */}
                <div className="relative mt-3">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    placeholder=" "
                    className="w-full h-11 px-3 pr-10 text-sm border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:border-[#0B2545]"
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                  <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
                    Password
                  </label>
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <button
                  disabled={loading}
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-[#0B2545] to-[#1d4e89] text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "LOGIN →"}
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-3">
                    <ShieldCheck className="w-7 h-7 text-[#1d4e89]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B2545]">
                    Verify OTP
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {successMsg && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl text-center">
                    {successMsg}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full h-14 px-4 text-center text-2xl font-bold tracking-[0.6em] border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1d4e89] bg-gray-50"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1d4e89] focus:ring-[#1d4e89]"
                  />
                  Remember this device for 12 hours
                </label>

                <p className="text-center text-xs text-gray-400">
                  Code expires in 5 minutes
                </p>

                <button
                  disabled={loading || otp.length !== 6}
                  onClick={handleVerifyOtp}
                  className="w-full bg-gradient-to-r from-[#0B2545] to-[#1d4e89] text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "VERIFY OTP →"}
                </button>

                <div className="flex items-center justify-between text-sm pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setOtp("");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1 text-[#1d4e89] hover:text-[#0B2545] disabled:text-gray-400 transition"
                  >
                    <RefreshCw size={14} />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend OTP"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}