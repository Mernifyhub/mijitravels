// app/components/admin/request-process/AgentRemarksCard.tsx
"use client";

import { Clock } from "lucide-react";

interface AgentRemarksCardProps {
  remarks?: string;
  createdAt?: string;
  formatDate: (d: string) => string;
}

export default function AgentRemarksCard({ remarks, createdAt, formatDate }: AgentRemarksCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
        Agent Remarks
      </h3>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <p className="text-sm text-blue-800 leading-relaxed">
          {remarks || "No remarks added"}
        </p>
      </div>
      <p className="text-[9px] text-gray-400 mt-2 flex items-center gap-1">
        <Clock size={9} /> {formatDate(createdAt || "")}
      </p>
    </div>
  );
}