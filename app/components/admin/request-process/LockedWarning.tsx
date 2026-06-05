// app/components/admin/request-process/LockedWarning.tsx
"use client";

import { ShieldAlert, Lock } from "lucide-react";

interface LockedWarningProps {
  assignedPersonName: string;
}

export default function LockedWarning({ assignedPersonName }: LockedWarningProps) {
  return (
    <div className="mb-4 flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-xl px-4 py-3">
      <ShieldAlert size={20} className="text-orange-600 shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-orange-700 text-sm">
          🔒 This request is assigned to {assignedPersonName}
        </p>
        <p className="text-orange-600 text-xs mt-0.5">
          You cannot take action until they release it.
        </p>
      </div>
      <Lock size={18} className="text-orange-400" />
    </div>
  );
}