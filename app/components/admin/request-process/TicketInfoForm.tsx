// app/components/admin/request-process/TicketInfoForm.tsx
"use client";

import {
  Ticket, Hash, CreditCard, Building2,
  DollarSign, Clock, CheckCircle2, Tag,
} from "lucide-react";

interface TicketInfoFormProps {
  booking: any;
  gdsPnr: string;
  ticketNumber: string;
  supplierName: string;
  issueAmount: string;
  done: boolean;
  isAssignedToOther: boolean;
  setGdsPnr: (v: string) => void;
  setTicketNumber: (v: string) => void;
  setSupplierName: (v: string) => void;
  setIssueAmount: (v: string) => void;
}

export default function TicketInfoForm({
  booking, gdsPnr, ticketNumber, supplierName, issueAmount,
  done, isAssignedToOther,
  setGdsPnr, setTicketNumber, setSupplierName, setIssueAmount,
}: TicketInfoFormProps) {
  const allFilled = gdsPnr && ticketNumber && supplierName;

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden
      ${isAssignedToOther ? "border-gray-200 opacity-60" : "border-emerald-200"}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3.5 flex items-center gap-2">
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
          <Ticket size={15} className="text-white" />
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Ticket Information
        </h3>
        <span className="ml-auto text-[9px] font-black text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
          {isAssignedToOther ? "Locked" : "Required for Approval"}
        </span>
      </div>

      {/* Fields */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GDS PNR */}
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            GDS PNR <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              type="text"
              value={gdsPnr || ""}
              onChange={(e) => setGdsPnr(e.target.value.toUpperCase())}
              disabled={done || isAssignedToOther}
              autoComplete="off"
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm font-mono font-black outline-none transition disabled:bg-gray-50 disabled:opacity-60 uppercase"
            />
          </div>
        </div>

        {/* Ticket Number */}
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Ticket Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="e.g. 1234567890123"
              disabled={done || isAssignedToOther}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm font-mono outline-none transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Supplier Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Sabre / Amadeus / Galileo"
              disabled={done || isAssignedToOther}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm outline-none transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Issue Amount */}
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Issue Amount (SAR)
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              type="number"
              value={issueAmount}
              onChange={(e) => setIssueAmount(e.target.value)}
              placeholder={`${booking?.gross || "0.00"}`}
              disabled={done || isAssignedToOther}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl text-sm outline-none transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>
          <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
            <Tag size={8} /> Booking gross: SAR {booking?.gross?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Hints */}
      {!done && !isAssignedToOther && (
        <div className="px-5 pb-4">
          {!allFilled ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <Clock size={12} className="text-amber-500 shrink-0" />
              <p className="text-[9px] font-bold text-amber-700">
                GDS PNR, Ticket Number & Supplier Name are required before approving
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <p className="text-[9px] font-bold text-emerald-700">
                All required fields filled — ready to approve!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}