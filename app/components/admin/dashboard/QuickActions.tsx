// app/components/admin/dashboard/QuickActions.tsx
"use client";

import { Bell, Percent, CircleDollarSign, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  role: "admin" | "manager";
}

export default function QuickActions({ role }: QuickActionsProps) {
  const router = useRouter();
  const basePath = role === "admin" ? "/admin" : "/manager";

  const actions = [
    { icon: <Bell size={24} />, label: "CMS / Notice", color: "bg-blue-500", route: `${basePath}/notice` },
    { icon: <Percent size={24} />, label: "Markup Settings", color: "bg-purple-500", route: `${basePath}/markup` },
    { icon: <CircleDollarSign size={24} />, label: "Agent Deposits", color: "bg-green-500", route: `${basePath}/agent/agent-deposit-list` },
    { icon: <BarChart3 size={24} />, label: "Sales Report", color: "bg-orange-500", route: `${basePath}/sales/sales-report` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button key={index} onClick={() => router.push(action.route)}
          className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left">
          <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition`}>
            {action.icon}
          </div>
          <h3 className="font-semibold text-gray-800">{action.label}</h3>
        </button>
      ))}
    </div>
  );
}