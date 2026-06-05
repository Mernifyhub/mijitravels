// app/components/manager/dashboard/BottomStatsCards.tsx
"use client";

import {
  CircleDollarSign, DollarSign, UserPlus, Bell, ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BottomStatsCardsProps {
  stats: {
    pendingDeposits?: number;
    todayRevenue?: number;
    pendingAgents?: number;
  };
}

export default function BottomStatsCards({ stats }: BottomStatsCardsProps) {
  const router = useRouter();

  const cards = [
    {
      label: "Pending Deposits",
      value: stats.pendingDeposits || 0,
      icon: <CircleDollarSign size={28} />,
      gradient: "from-orange-500 to-orange-600",
      actionLabel: "Review Now",
      route: "/manager/agent/agent-deposit-list",
    },
    {
      label: "Today's Sales",
      value: `$${stats.todayRevenue?.toLocaleString() || "0"}`,
      icon: <DollarSign size={28} />,
      gradient: "from-green-500 to-green-600",
    },
    {
      label: "Pending Agents",
      value: stats.pendingAgents || 0,
      icon: <UserPlus size={28} />,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "System Alerts",
      value: 5,
      icon: <Bell size={28} />,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">{card.label}</p>
              <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
            </div>
            {card.icon}
          </div>
          {card.actionLabel && card.route && (
            <button
              onClick={() => router.push(card.route!)}
              className="mt-4 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              {card.actionLabel} <ArrowRight size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}