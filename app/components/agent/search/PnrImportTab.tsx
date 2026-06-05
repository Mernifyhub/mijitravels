"use client";

import { useState } from "react";
import { FileInput } from "lucide-react";

export default function PnrImportTab() {
  const [pnr, setPnr] = useState("");

  return (
    <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-12">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FileInput size={40} className="text-[#021f3b]" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">PNR Import</h2>
        <p className="text-gray-500 mb-8">
          Enter your PNR to import and manage your booking
        </p>

        <div className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              PNR / Booking Reference
            </label>
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:border-[#021f3b] focus:ring-4 focus:ring-blue-100 outline-none text-gray-800 font-bold text-xl uppercase tracking-[0.3em] text-center placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal placeholder:text-base bg-gray-50"
            />
          </div>

          <button className="w-full bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-lg flex items-center justify-center gap-2">
            <FileInput size={22} />
            Import PNR
          </button>
        </div>
      </div>
    </div>
  );
}