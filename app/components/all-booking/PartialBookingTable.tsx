"use client";

const data = [
  {
    bookingId: "BK1023",
    company: "Al Faruk Travels",
    status: "Pending",
    bookingDate: "18 Mar 2026",
    dueDate: "25 Mar 2026",
    due: "SAR 1,200",
    paid: "SAR 500",
    net: "SAR 700",
  },
];

export default function PartialBookingTable() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Partial Booking Management
      </h2>

      {/* Search */}
      <div className="flex justify-end gap-2 mb-4">
        <input
          placeholder="Enter Search Word..."
          className="border border-gray-300 px-3 py-2 rounded-lg w-64 text-sm outline-none focus:border-[#0B2545]"
        />
        <button className="bg-[#0B2545] text-white px-4 py-2 rounded-lg text-sm">
          Search
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#dbe7f5] text-gray-700">
              <th className="p-3 text-left">Booking ID</th>
              <th className="p-3 text-left">Company Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Booking Date</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">Due amount</th>
              <th className="p-3 text-left">Paid amount</th>
              <th className="p-3 text-left">Net Fare</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  No Data Found
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-[#0B2545] font-medium">
                    {item.bookingId}
                  </td>
                  <td className="p-3">{item.company}</td>

                  <td className="p-3">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3">{item.bookingDate}</td>
                  <td className="p-3">{item.dueDate}</td>

                  <td className="p-3 font-medium text-red-500">
                    {item.due}
                  </td>

                  <td className="p-3 font-medium text-green-600">
                    {item.paid}
                  </td>

                  <td className="p-3 font-semibold text-gray-800">
                    {item.net}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6 text-gray-500">
        <button className="hover:text-black">«</button>
        <button className="hover:text-black">‹</button>
        <button className="hover:text-black">›</button>
        <button className="hover:text-black">»</button>
      </div>
    </div>
  );
}
