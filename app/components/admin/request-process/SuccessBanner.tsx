// app/components/admin/request-process/SuccessBanner.tsx
"use client";

import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface SuccessBannerProps {
  actionDone: string | null;
}

export default function SuccessBanner({ actionDone }: SuccessBannerProps) {
  return (
    <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
      <CheckCircle2 size={18} className="text-emerald-600" />
      <p className="font-bold text-emerald-700">
        {actionDone === "APPROVED"   ? "✅ Request Approved! Redirecting..."   :
         actionDone === "REJECTED"   ? "❌ Request Rejected! Redirecting..."   :
         "🔄 Marked as Processing! Redirecting..."}
      </p>
    </div>
  );
}