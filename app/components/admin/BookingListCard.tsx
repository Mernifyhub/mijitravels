"use client";

import { useState } from "react";

type Booking = {
  id: string;
  passenger: string;
  route: string;
  date: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  price: string;
};

export default function BookingListCard() {
  const [search, setSearch] = useState("");

  const bookings: Booking[] = [
    {
      id: "BK-10231",
      passenger: "John Smith",
      route: "DAC → DXB",
      date: "12 Mar 2026",
      status: "Confirmed",
      price: "$420",
    },
    {
      id: "BK-10232",
      passenger: "Rahim Ahmed",
      route: "DAC → KUL",
      date: "13 Mar 2026",
      status: "Pending",
      price: "$350",
    },
    {
      id: "BK-10233",
      passenger: "Maria Khan",
      route: "DAC → LHR",
      date: "15 Mar 2026",
      status: "Cancelled",
      price: "$650",
    },
  ];

  const filtered = bookings.filter((b) =>
    b.passenger.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">
          Recent Bookings
        </h2>

        <input
          type="text"
          placeholder="Search passenger..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          
          <thead className="border-b text-sm text-gray-500 ">
            <tr>
              <th className="py-3">Passenger</th>
              <th>Booking ID</th>
              <th>Route</th>
              <th>Date</th>
              <th>Status</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((b, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition"
              >
                
                {/* Passenger */}
                <td className="py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {b.passenger.charAt(0)}
                  </div>

                  <span className="font-medium text-gray-800">
                    {b.passenger}
                  </span>
                </td>

                <td className="text-gray-700 font-medium">
                  {b.id}
                </td>

                <td className="text-gray-700">
                  {b.route}
                </td>

                <td className="text-gray-600">
                  {b.date}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      b.status === "Confirmed" &&
                      "bg-green-100 text-green-700"
                    }
                    ${
                      b.status === "Pending" &&
                      "bg-yellow-100 text-yellow-700"
                    }
                    ${
                      b.status === "Cancelled" &&
                      "bg-red-100 text-red-700"
                    }
                  `}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="font-semibold text-gray-800">
                  {b.price}
                </td>

                {/* View Button */}
                <td>
                  <button className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}