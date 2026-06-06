"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  UploadCloud,
  CheckCircle2,
  PlaneTakeoff,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/apiClient";

export default function AgentRegistration() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ✅ FILE STATE
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
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (!nidFile || !licenseFile) {
      setMessage({ type: "error", text: "Upload NID & Trade License" });
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

      // ✅ apiClient দিয়ে call
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
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-200"
      >
        {/* Left Branding */}
        <div className="hidden md:flex flex-col justify-center items-start bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#1d4e89] text-white p-12 w-full max-w-[500px]">
          {/* Logo & Headline */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PlaneTakeoff className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-extrabold tracking-tight">MIJI</h2>
            </div>
            <h3 className="text-2xl font-semibold leading-tight">
              Elevate Your Aviation Business To The Next Level.
            </h3>
            <p className="mt-4 text-blue-100 opacity-90 leading-relaxed">
              Join our exclusive network of agents and experience a smarter way to manage bookings and operations.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="font-medium">Real-time Management</p>
                <p className="text-sm text-blue-200 opacity-80">Track and manage flights and bookings instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <p className="font-medium">Secure & Reliable</p>
                <p className="text-sm text-blue-200 opacity-80">Industry-standard security for all your transactions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-300 mt-1" />
              <div>
                <p className="font-medium">Advanced Analytics</p>
                <p className="text-sm text-blue-200 opacity-80">Get deep insights to grow your business faster.</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-white/10 w-full">
            <p className="text-xs text-blue-300 opacity-70">
              Trusted by 500+ aviation agencies worldwide.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white text-gray-800 opacity-100">
          <h2 className="text-2xl font-bold text-[#0B2545] text-center">
            Agent Registration
          </h2>

          <p className="text-center text-gray-600 text-sm">
            Please enter correct information to continue
          </p>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative w-full mt-3">
              <input
                name="firstName"
                value={form.firstName}
                placeholder=" "
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
                onChange={handleChange}
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">First Name</label>
            </div>
            <div className="relative w-full mt-3">
              <input
                name="lastName"
                value={form.lastName}
                placeholder=" "
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
                onChange={handleChange}
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">Last Name</label>
            </div>
          </div>

          {/* Company Fields */}
          <div className="relative w-full mt-3">
            <input
              name="agentName"
              value={form.agentName}
              placeholder=" "
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              onChange={handleChange}
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">Agent Name</label>
          </div>

          <div className="relative w-full mt-3">
            <input
              name="agentAddress"
              value={form.agentAddress}
              placeholder=" "
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
              onChange={handleChange}
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">Agent Address</label>
          </div>

          {/* Phone + Aviation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative w-full mt-3">
              <input
                name="phone"
                value={form.phone}
                placeholder=" "
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
                onChange={handleChange}
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">Phone Number</label>
            </div>
            <div className="relative w-full mt-3">
              <input
                name="aviationNumber"
                value={form.aviationNumber}
                placeholder=" "
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
                onChange={handleChange}
              />
              <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">Civil Aviation Number</label>
            </div>
          </div>

          {/* Email */}
          <div className="relative w-full mt-3">
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
            />
            <label className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1">Email</label>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                placeholder="Password"
                className="w-full h-11 px-3 pr-10 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
                onChange={handleChange}
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
                placeholder="Confirm Password"
                className="w-full h-11 px-3 pr-10 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0B2545]"
                onChange={handleChange}
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <p className={`text-xs ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
              {message.text}
            </p>
          )}

          {/* Upload */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition">
              <label className="upload-box">
                <UploadCloud size={20} />
                <p>{nidFile ? nidFile.name : "NID Copy *"}</p>
                <input type="file" hidden onChange={(e) => setNidFile(e.target.files[0])} />
              </label>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition">
              <label className="upload-box">
                <UploadCloud size={20} />
                <p>{licenseFile ? licenseFile.name : "Trade License"}</p>
                <input type="file" hidden onChange={(e) => setLicenseFile(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0B2545] to-[#1d4e89] text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "REGISTERING..." : "REGISTER →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}