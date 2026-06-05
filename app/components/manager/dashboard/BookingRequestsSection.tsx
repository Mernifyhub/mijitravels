// app/components/manager/dashboard/BookingRequestsSection.tsx
"use client";

import {
  Bell, Ticket, RefreshCw, XCircle, Ban, Wallet, ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingRequestsSectionProps {
  requestStats: Record<string, number>;
}

// Request card config — type অনুযায়ী icon, color, route
const requestCardConfig = [
  {
    key: "ISSUE",
    label: "Issue Requests",
    icon: <Ticket size={22} />,
    color: "from-emerald-500 to-emerald-600",
    bg: "from-emerald-50 to-white",
    border: "border-emerald-200",
    text: "text-emerald-700",
    route: "/manager/requests/issue",
  },
  {
    key: "REISSUE",
    label: "Reissue Requests",
    icon: <RefreshCw size={22} />,
    color: "from-indigo-500 to-indigo-600",
    bg: "from-indigo-50 to-white",
    border: "border-indigo-200",
    text: "text-indigo-700",
    route: "/manager/requests/reissue",
  },
  {
    key: "CANCEL",
    label: "Cancel Requests",
    icon: <XCircle size={22} />,
    color: "from-rose-500 to-rose-600",
    bg: "from-rose-50 to-white",
    border: "border-rose-200",
    text: "text-rose-700",
    route: "/manager/requests/cancel",
  },
  {
    key: "VOID",
    label: "Void Requests",
    icon: <Ban size={22} />,
    color: "from-amber-500 to-amber-600",
    bg: "from-amber-50 to-white",
    border: "border-amber-200",
    text: "text-amber-700",
    route: "/manager/requests/void",
  },
  {
    key: "REFUND",
    label: "Refund Requests",
    icon: <Wallet size={22} />,
    color: "from-purple-500 to-purple-600",
    bg: "from-purple-50 to-white",
    border: "border-purple-200",
    text: "text-purple-700",
    route: "/manager/requests/refund",
  },
];

export default function BookingRequestsSection({
  requestStats,
}: BookingRequestsSectionProps) {
  const router = useRouter();

  // requestStats থেকে count বের করো
  // API থেকে { ISSUE: 3, CANCEL: 1 } এই format-এ আসতে পারে
  // অথবা { issue: 3, cancel: 1 } lowercase-এও আসতে পারে
  const getCount = (key: string): number => {
    // দুইভাবেই try করো — uppercase ও lowercase
    return (
      Number(requestStats?.[key] || 0) ||
      Number(requestStats?.[key.toLowerCase()] || 0)
    );
  };

  // Total pending count
  const totalPending = requestCardConfig.reduce(
    (sum, card) => sum + getCount(card.key),
    0,
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl relative">
            <Bell size={22} className="text-indigo-600" />
            {/* Total pending badge */}
            {totalPending > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalPending > 99 ? "99+" : totalPending}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Booking Requests
            </h2>
            <p className="text-sm text-gray-500">
              {totalPending > 0
                ? `${totalPending} pending requests need your attention`
                : "No pending requests"}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/manager/requests/issue")}
          className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {requestCardConfig.map((item) => {
          const count = getCount(item.key);

          return (
            <button
              key={item.key}
              onClick={() => router.push(item.route)}
              className={`relative text-left p-4 rounded-xl border-2 bg-gradient-to-br ${item.bg} ${item.border} hover:shadow-md hover:-translate-y-1 transition-all group`}
            >
              {/* Count Badge — যদি count > 0 হয় */}
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md z-10 animate-pulse">
                  {count > 99 ? "99+" : count}
                </span>
              )}

              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition`}
              >
                {item.icon}
              </div>

              {/* Label */}
              <p className={`text-sm font-bold ${item.text}`}>{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {count > 0 ? "Pending action" : "No pending"}
              </p>

              {/* Count + Arrow */}
              <div className="mt-4 flex items-end justify-between">
                <h3 className={`text-3xl font-black ${item.text}`}>
                  {count}
                </h3>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 group-hover:text-[#021f3b] transition">
                  Open <ArrowRight size={12} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}