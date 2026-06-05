"use client";

import { useState } from "react";
import {
  CalendarDays,
  PlaneLanding,
  PlaneTakeoff,
  Users,
  UsersRound,
} from "lucide-react";

export default function GroupFareTab() {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 10,
    notes: "",
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <UsersRound size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Group Fare Request
          </h2>
          <p className="text-gray-500">
            Get special discounted fares for groups of 10+ passengers
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                From
              </label>
              <div className="relative">
                <PlaneTakeoff
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                />
                <input
                  type="text"
                  value={form.from}
                  onChange={(e) => update("from", e.target.value)}
                  placeholder="Departure City"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#021f3b] outline-none text-gray-800 font-medium placeholder:text-gray-400 bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                To
              </label>
              <div className="relative">
                <PlaneLanding
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                />
                <input
                  type="text"
                  value={form.to}
                  onChange={(e) => update("to", e.target.value)}
                  placeholder="Arrival City"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#021f3b] outline-none text-gray-800 font-medium placeholder:text-gray-400 bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                Travel Date
              </label>
              <div className="relative">
                <CalendarDays
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#021f3b] outline-none text-gray-800 font-medium bg-gray-50 hover:bg-white transition cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                Number of Passengers
              </label>
              <div className="relative">
                <Users
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#021f3b]"
                />
                <input
                  type="number"
                  min={10}
                  value={form.passengers}
                  onChange={(e) =>
                    update("passengers", parseInt(e.target.value || "10"))
                  }
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#021f3b] outline-none text-gray-800 font-medium bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any special requirements for your group..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:border-[#021f3b] outline-none text-gray-800 font-medium placeholder:text-gray-400 bg-gray-50 hover:bg-white transition resize-none"
            />
          </div>

          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-lg flex items-center justify-center gap-3">
            <UsersRound size={22} />
            Submit Group Fare Request
          </button>
        </div>
      </div>
    </div>
  );
}