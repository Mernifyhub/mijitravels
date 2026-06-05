// app/components/manager/dashboard/TopAgents.tsx
"use client";

import { Trophy, ArrowUpRight, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopAgentsProps {
  agents: any[];
}

export default function TopAgents({ agents }: TopAgentsProps) {
  const router = useRouter();

  const getRankStyle = (index: number) => {
    if (index === 0) {
      return {
        card: "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-400",
        badge: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        avatar: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      };
    }
    if (index === 1) {
      return {
        card: "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 hover:border-gray-400",
        badge: "bg-gradient-to-br from-gray-300 to-gray-500",
        avatar: "bg-gradient-to-br from-gray-400 to-gray-600",
      };
    }
    if (index === 2) {
      return {
        card: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400",
        badge: "bg-gradient-to-br from-orange-400 to-orange-600",
        avatar: "bg-gradient-to-br from-orange-400 to-orange-600",
      };
    }
    return {
      card: "bg-gray-50 border-gray-100 hover:border-gray-300",
      badge: "bg-[#021f3b]",
      avatar: "bg-[#021f3b]",
    };
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-xl">
            <Trophy size={22} className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Top Performing Agents
            </h2>
            <p className="text-sm text-gray-500">
              Based on bookings & revenue this month
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/manager/agent/all-agent")}
          className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {agents.length > 0 ? (
          agents.map((agent: any, index: number) => {
            const style = getRankStyle(index);
            const initials =
              agent.avatar ||
              agent.name
                .split(" ")
                .map((n: string) => n[0])
                .join("");

            return (
              <div
                key={index}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${style.card}`}
              >
                {/* Rank Badge */}
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${style.badge}`}
                >
                  <span className="text-white text-xs font-bold">
                    {index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 ${style.avatar}`}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {agent.bookings} bookings
                  </p>
                  <p className="font-bold text-[#021f3b] mt-2">
                    {agent.revenue}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-green-600 text-xs">
                    <ArrowUpRight size={12} />
                    <span>+{agent.growth}%</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="col-span-5 text-center text-gray-500 py-8">
            No data available
          </p>
        )}
      </div>
    </div>
  );
}