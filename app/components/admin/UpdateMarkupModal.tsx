"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function UpdateMarkupModal({ data, onClose, onSave }: any) {

  // ================== STATE ==================
  const [form, setForm] = useState({
    id: data?.id,
    name: data?.name || "",
    code: data?.code || "",
    soto: data?.soto || 0,
    soti: data?.soti || 0,
    sito: data?.sito || 0,
    domestic: data?.domestic || 0,
    markup: data?.markup || 0,
    issuePermit: data?.issuePermit || "manual",
    paymentType: data?.instantPayment === "Yes" ? "instant" : "non_instant",
    blocked: data?.blocked === "Yes" ? "yes" : "no",
    bookable: "yes",
  });

  // ================== INPUT CHANGE ==================
  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ================== SUBMIT ==================
  const handleSubmit = () => {
    onSave({
      ...form,
      instantPayment: form.paymentType === "instant" ? "Yes" : "No",
      blocked: form.blocked === "yes" ? "Yes" : "No",
    });
    onClose(); // submit er pore modal close
  };

  return (

    // ================== OVERLAY ==================
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose} // 👉 outside click = modal close
    >

      {/* ================== MODAL BOX ================== */}
      <div
        className="bg-white w-[750px] rounded-2xl shadow-2xl border border-gray-200 p-6 relative"
        onClick={(e) => e.stopPropagation()} // 👉 inside click = close hobe na
      >

        {/* ================== CLOSE BUTTON ================== */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
        >
          <X size={20} />
        </button>

        {/* ================== TITLE ================== */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Update Airline Markup
        </h2>

        {/* ================== FORM GRID ================== */}
        <div className="grid grid-cols-2 gap-4">

          {/* Airline Name */}
          <div>
            <label className="text-xs text-gray-500">Airline Name</label>
            <input
              value={form.name}
              readOnly
              className="w-full mt-1 bg-gray-100 border border-gray-200 p-2 rounded-lg text-sm text-gray-800"
            />
          </div>

          {/* Code */}
          <div>
            <label className="text-xs text-gray-500">Code</label>
            <input
              value={form.code}
              readOnly
              className="w-full mt-1 bg-gray-100 border border-gray-200 p-2 rounded-lg text-sm text-gray-800"
            />
          </div>

          {/* Issue Permit */}
          <div>
            <label className="text-xs text-gray-500">Issue Permit</label>
            <select
              value={form.issuePermit}
              onChange={(e) => handleChange("issuePermit", e.target.value)}
              className="w-full mt-1 border border-gray-200 p-2 rounded-lg text-sm text-gray-800 bg-white focus:border-[#0B1E33] outline-none"
            >
              <option value="manual">Manual Issue</option>
              <option value="auto">Auto Issue</option>
            </select>
          </div>

          {/* Markup */}
          <div>
            <label className="text-xs text-gray-500">Markup</label>
            <input
              type="number"
              value={form.markup}
              onChange={(e) => handleChange("markup", e.target.value)}
              className="w-full mt-1 border border-gray-200 p-2 rounded-lg text-sm text-gray-800 outline-none"
            />
          </div>

          {/* Soto */}
          <div>
            <label className="text-xs text-gray-500">Soto</label>
            <input
              type="number"
              value={form.soto}
              onChange={(e) => handleChange("soto", e.target.value)}
              className="w-full mt-1 border border-gray-200 p-2 rounded-lg text-sm text-gray-800"
            />
          </div>

          {/* Soti */}
          <div>
            <label className="text-xs text-gray-500">Soti</label>
            <input
              type="number"
              value={form.soti}
              onChange={(e) => handleChange("soti", e.target.value)}
              className="w-full mt-1 border border-gray-200 p-2 rounded-lg text-sm text-gray-800"
            />
          </div>

          {/* Sito */}
          <div>
            <label className="text-xs text-gray-500">Sito</label>
            <input
              type="number"
              value={form.sito}
              onChange={(e) => handleChange("sito", e.target.value)}
              className="w-full mt-1 border border-gray-200 p-2 rounded-lg text-sm text-gray-800"
            />
          </div>

          {/* Domestic */}
          <div>
            <label className="text-xs text-gray-500">Domestic</label>
            <input
              type="number"
              value={form.domestic}
              onChange={(e) => handleChange("domestic", e.target.value)}
              className="w-full mt-1 border border-gray-200 p-2 rounded-lg text-sm text-gray-800"
            />
          </div>

        </div>

        {/* ================== RADIO SECTION ================== */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-700">

          {/* Payment Type */}
          <div>
            <p className="font-medium text-gray-800 mb-1">Payment Type</p>
            <label className="block">
              <input
                type="radio"
                checked={form.paymentType === "instant"}
                onChange={() => handleChange("paymentType", "instant")}
              /> Instant
            </label>
            <label className="block">
              <input
                type="radio"
                checked={form.paymentType === "non_instant"}
                onChange={() => handleChange("paymentType", "non_instant")}
              /> Non Instant
            </label>
          </div>

          {/* Airline Block */}
          <div>
            <p className="font-medium text-gray-800 mb-1">Airline Block</p>
            <label className="block">
              <input
                type="radio"
                checked={form.blocked === "yes"}
                onChange={() => handleChange("blocked", "yes")}
              /> Blocked
            </label>
            <label className="block">
              <input
                type="radio"
                checked={form.blocked === "no"}
                onChange={() => handleChange("blocked", "no")}
              /> Unblocked
            </label>
          </div>

          {/* Bookable */}
          <div>
            <p className="font-medium text-gray-800 mb-1">Bookable</p>
            <label className="block">
              <input
                type="radio"
                checked={form.bookable === "yes"}
                onChange={() => handleChange("bookable", "yes")}
              /> Yes
            </label>
            <label className="block">
              <input
                type="radio"
                checked={form.bookable === "no"}
                onChange={() => handleChange("bookable", "no")}
              /> No
            </label>
          </div>

        </div>

        {/* ================== SUBMIT BUTTON ================== */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-[#0B1E33] hover:bg-[#163a5f] text-white px-10 py-2 rounded-lg text-sm font-medium shadow-md transition"
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}