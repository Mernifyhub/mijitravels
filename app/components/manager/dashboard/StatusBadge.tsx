// app/components/manager/dashboard/StatusBadge.tsx
"use client";

import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
  ticketed: {
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  confirmed: {
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle size={14} />,
  },
  pending: {
    color: "bg-yellow-100 text-yellow-700",
    icon: <AlertCircle size={14} />,
  },
  cancelled: {
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
  },
  approved: {
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  rejected: {
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || "pending";
  const config = statusMap[normalized] || statusMap.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}