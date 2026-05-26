// app/components/AccessDenied.tsx
"use client";

import { ShieldX, ArrowLeft, Home, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  requiredRole?: string;
  currentRole?: string;
}

export default function AccessDenied({
  title = "Access Restricted",
  message = "You don't have permission to view this page. Please contact your agency admin for access.",
  showHomeButton = true,
  showBackButton = true,
  requiredRole,
  currentRole,
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center border-2 border-red-200">
            <ShieldX size={40} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>

        {/* Message */}
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>

        {/* Role Info */}
        {currentRole && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <Lock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Your Role</span>
                <span className="text-xs font-bold text-gray-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  {currentRole}
                </span>
              </div>
            </div>
            {requiredRole && (
              <p className="text-xs text-gray-400 mt-2">
                Required: <span className="font-semibold text-gray-600">{requiredRole}</span>
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={() => router.push("/user/dashboard")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#021f3b] text-white rounded-xl hover:bg-[#0a3a6b] transition text-sm font-medium shadow-md"
            >
              <Home size={16} /> Dashboard
            </button>
          )}
        </div>

        {/* Contact */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Mail size={14} />
            <p className="text-xs font-medium">
              Need access? Contact your agency admin
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}