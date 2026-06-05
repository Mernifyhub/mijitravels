// app/components/admin/request-process/AgentInfoCard.tsx
"use client";

interface AgentInfoCardProps {
  agent: any;
}

export default function AgentInfoCard({ agent }: AgentInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
        Agent Info
      </h3>
      <div className="flex justify-between py-1.5 border-b border-gray-50">
        <span className="text-[10px] font-bold text-gray-400">Agent Name</span>
        <span className="text-[10px] font-black text-gray-700 text-right max-w-[140px] truncate">
          {agent?.agentName || "—"}
        </span>
      </div>
    </div>
  );
}