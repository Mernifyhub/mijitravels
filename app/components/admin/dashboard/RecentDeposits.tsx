// app/components/admin/dashboard/RecentDeposits.tsx
"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

interface RecentDepositsProps {
  deposits: any[];
  role: "admin" | "manager";
}

export default function RecentDeposits({ deposits, role }: RecentDepositsProps) {
  const router = useRouter();
  const depositRoute = role === "admin" ? "/admin/agent/agent-deposit-list" : "/manager/agent/agent-deposit-list";

  const getIcon = (status: string) => {
    if (status === "approved") return <CheckCircle size={18} className="text-green-600" />;
    if (status === "pending") return <Clock size={18} className="text-yellow-600" />;
    return <XCircle size={18} className="text-red-600" />;
  };

  const getBg = (status: string) => {
    if (status === "approved") return "bg-green-100";
    if (status === "pending") return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Recent Deposits</h2>
          <p className="text-sm text-gray-500">Agent deposits</p>
        </div>
        <button onClick={() => router.push(depositRoute)} className="text-sm text-[#021f3b] font-medium hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {deposits.length > 0 ? deposits.map((deposit: any) => (
          <div key={deposit.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBg(deposit.status)}`}>
              {getIcon(deposit.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{deposit.agent}</p>
              <p className="text-xs text-gray-500">{deposit.method}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">{deposit.amount}</p>
              <StatusBadge status={deposit.status} />
            </div>
          </div>
        )) : (
          <p className="text-center text-gray-500 py-8">No deposits</p>
        )}
      </div>
    </div>
  );
}