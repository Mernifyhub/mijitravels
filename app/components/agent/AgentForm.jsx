"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  UploadCloud,
  CheckCircle2,
  PlaneTakeoff,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/authApi";

export default function AgentRegistration() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  }>({ type: "error", text: "" });

  // FILE STATE
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [nidPreview, setNidPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // FILE HANDLER
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "nid" | "license"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG, PNG, PDF allowed" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be under 5MB" });
      return;
    }

    if (type === "nid") {
      setNidFile(file);
      setNidPreview(URL.createObjectURL(file));
    } else {
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }

    setMessage({ type: "error", text: "" });
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "error", text: "" });

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (!nidFile || !licenseFile) {
      setMessage({
        type: "error",
        text: "Please upload NID & Trade License",
      });
      return;
    }

    if (form.password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Append text fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append files
      formData.append("nidCopy", nidFile);
      formData.append("tradeLicense", licenseFile);

      // ✅ Use your apiClient through authApi
      const data = await authApi.register(formData);

      // ✅ Store tokens
      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data?.user?.id) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setMessage({
        type: "success",
        text: data?.message || "Registration successful!",
      });

      // Reset form
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
      setNidPreview(null);
      setLicensePreview(null);

      // Redirect after 2s
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-200"
      >
        {/* Left Branding */}
        <div className="hidden md:flex flex-col justify-center items-start bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#1d4e89] text-white p-12 w-full max-w-[500px]">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PlaneTakeoff className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-extrabold tracking-tight">MIJI</h2>
            </div>
            <h3 className="text-2xl font-semibold leading-tight">
              Elevate Your Aviation Business To The Next Level.
            </h3>
            <p className="mt-4 text-blue-100 opacity-90 leading-relaxed">
              Join our exclusive network of agents and experience a smarter way
              to manage bookings and operations.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="font-medium">Real-time Management</p>
                <p className="text-sm text-blue-200 opacity-80">
                  Track and manage flights and bookings instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <p className="font-medium">Secure & Reliable</p>
                <p className="text-sm text-blue-200 opacity-80">
                  Industry-standard security for all your transactions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-300 mt-1" />
              <div>
                <p className="font-medium">Advanced Analytics</p>
                <p className="text-sm text-blue-200 opacity-80">
                  Get deep insights to grow your business faster.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 w-full">
            <p className="text-xs text-blue-300 opacity-70">
              Trusted by 500+ aviation agencies worldwide.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5 bg-white text-gray-800"
        >
          <h2 className="text-2xl font-bold text-[#0B2545] text-center">
            Agent Registration
          </h2>

          <p className="text-center text-gray-600 text-sm">
            Please enter correct information to continue
          </p>

          {/* Message */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-lg text-sm text-center ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative w-full mt-3">
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder=" "
                required
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
                First Name
              </label>
            </div>
            <div className="relative w-full mt-3">
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder=" "
                required
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
                Last Name
              </label>
            </div>
          </div>

          {/* Company Fields */}
          <div className="relative w-full mt-3">
            <input
              name="agentName"
              value={form.agentName}
              onChange={handleChange}
              placeholder=" "
              required
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
              Agent Name
            </label>
          </div>

          <div className="relative w-full mt-3">
            <input
              name="agentAddress"
              value={form.agentAddress}
              onChange={handleChange}
              placeholder=" "
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
              Agent Address
            </label>
          </div>

          {/* Phone + Aviation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative w-full mt-3">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder=" "
                required
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
                Phone Number
              </label>
            </div>
            <div className="relative w-full mt-3">
              <input
                name="aviationNumber"
                value={form.aviationNumber}
                onChange={handleChange}
                placeholder=" "
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
                Civil Aviation Number
              </label>
            </div>
          </div>

          {/* Email */}
          <div className="relative w-full mt-3">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              required
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">
              Email
            </label>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                minLength={8}
                className="w-full h-11 px-3 pr-10 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                minLength={8}
                className="w-full h-11 px-3 pr-10 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* File Upload */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500 hover:text-blue-500 ${
                nidFile
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-300 text-gray-500"
              }`}
              onClick={() => document.getElementById("nid-upload")?.click()}
            >
              {nidPreview ? (
                <img
                  src={nidPreview}
                  alt="NID Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <UploadCloud size={20} />
              )}
              <p className="text-xs text-center break-all">
                {nidFile ? nidFile.name : "NID Copy *"}
              </p>
              <input
                id="nid-upload"
                type="file"
                hidden
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFileChange(e, "nid")}
              />
            </div>

            <div
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500 hover:text-blue-500 ${
                licenseFile
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-300 text-gray-500"
              }`}
              onClick={() =>
                document.getElementById("license-upload")?.click()
              }
            >
              {licensePreview ? (
                <img
                  src={licensePreview}
                  alt="License Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <UploadCloud size={20} />
              )}
              <p className="text-xs text-center break-all">
                {licenseFile ? licenseFile.name : "Trade License *"}
              </p>
              <input
                id="license-upload"
                type="file"
                hidden
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFileChange(e, "license")}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !nidFile || !licenseFile}
            className="w-full bg-gradient-to-r from-[#0B2545] to-[#1d4e89] text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                REGISTERING...
              </>
            ) : (
              "REGISTER →"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}