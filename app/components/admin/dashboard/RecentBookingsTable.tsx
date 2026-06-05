// app/components/admin/dashboard/RecentBookingsTable.tsx
"use client";

import { Plane, Eye, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

interface RecentBookingsTableProps {
  bookings: any[];
  role: "admin" | "manager";
}

export default function RecentBookingsTable({ bookings, role }: RecentBookingsTableProps) {
  const router = useRouter();
  const allBookingsRoute = role === "admin" ? "/admin/bookings/all-bookings" : "/manager/bookings/all-bookings";

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
          <p className="text-sm text-gray-500">Latest booking transactions</p>
        </div>
        <button
          onClick={() => router.push(allBookingsRoute)}
          className="text-sm text-[#021f3b] font-medium hover:underline flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PNR</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Passenger</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length > 0 ? bookings.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono font-semibold text-[#021f3b]">{booking.pnr || "N/A"}</td>
                <td className="px-6 py-4 text-gray-800 font-medium">{booking.passenger}</td>
                <td className="px-6 py-4 flex items-center gap-1 text-gray-600">
                  <Plane size={14} /> {booking.route}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">{booking.amount}</td>
                <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                <td className="px-6 py-4 text-gray-600">{booking.agent}</td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Eye size={18} className="text-gray-500" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No bookings</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}