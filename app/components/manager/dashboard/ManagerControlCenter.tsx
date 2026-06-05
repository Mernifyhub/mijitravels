// app/components/manager/dashboard/ManagerControlCenter.tsx
"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManagerControlCenter() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-[#021f3b] via-[#0a3a6b] to-[#0a4d8c] rounded-2xl p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Settings size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Manager Control Center</h3>
            <p className="text-blue-200">
              Manage CMS, Markup Settings, Agent Approvals, Deposits & System
              Configuration
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/manager/notice")}
          className="px-6 py-3 bg-white text-[#021f3b] rounded-xl font-semibold hover:bg-blue-50 transition whitespace-nowrap"
        >
          Go to CMS
        </button>
      </div>
    </div>
  );
}