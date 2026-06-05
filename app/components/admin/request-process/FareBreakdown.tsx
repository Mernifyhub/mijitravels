// app/components/admin/request-process/FareBreakdown.tsx
"use client";

import { useState } from "react";
import {
  Tag, ChevronDown, TrendingUp, Percent, Zap, BarChart3,
} from "lucide-react";

interface FareBreakdownProps {
  booking: any;
  fareCalc: any;
  sourceCurrency: string;
}

export default function FareBreakdown({ booking, fareCalc, sourceCurrency }: FareBreakdownProps) {
  const [showMore, setShowMore] = useState(false);

  const net        = Number(booking?.net        || 0);
  const gross      = Number(booking?.gross      || 0);
  const commission = Number(booking?.commission || 0);

  if (!fareCalc) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Tag size={11} className="text-indigo-500" /> Fare Breakdown
        </h3>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-bold text-amber-700">Fare data not available.</p>
        </div>
      </div>
    );
  }

  const f   = fareCalc.agentUi;
  const a   = fareCalc.admin;
  const cur = f.currency || sourceCurrency;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <Tag size={11} className="text-indigo-500" /> Fare Breakdown
      </h3>

      <div className="space-y-1.5">
        {/* Agent View */}
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Agent View</p>

        {f.adults > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-500">Adult × {f.adults}</span>
            <span className="text-xs font-black text-slate-700">{cur} {f.totalBaseTax.toLocaleString()}</span>
          </div>
        )}
        {f.children > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-500">Child × {f.children}</span>
            <span className="text-xs font-black text-slate-700">Included</span>
          </div>
        )}
        {f.infants > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-500">Infant × {f.infants}</span>
            <span className="text-xs font-black text-slate-700">Included</span>
          </div>
        )}

        <div className="border-t border-slate-100 my-1" />

        {[
          { label: "Base Fare", value: f.baseFare },
          { label: "Tax & Fee", value: f.taxAmount },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-500">{item.label}</span>
            <span className="text-xs font-black text-slate-700">{cur} {item.value.toLocaleString()}</span>
          </div>
        ))}

        <div className="border-t border-slate-100 my-1" />

        <div className="flex justify-between items-center py-1.5 bg-slate-50 rounded-xl px-3">
          <span className="text-xs font-bold text-slate-600">Total Base & Tax</span>
          <span className="text-xs font-black text-slate-800">{cur} {f.totalBaseTax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 bg-blue-50 rounded-xl px-3">
          <span className="text-xs font-bold text-blue-700">Customer Invoice Total</span>
          <span className="text-xs font-black text-blue-800">{cur} {f.customerInvoiceTotal.toLocaleString()}</span>
        </div>
        {f.discountOrCommission > 0 && (
          <div className="flex justify-between items-center py-1.5 bg-emerald-50 rounded-xl px-3">
            <span className="text-xs font-bold text-emerald-700">Discount / Commission</span>
            <span className="text-xs font-black text-emerald-700">− {cur} {f.discountOrCommission.toLocaleString()}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between items-center py-3 px-3 mt-1 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl">
          <div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Grand Total</p>
            <p className="text-[10px] text-indigo-300 mt-0.5">{f.totalPax} Pax · {cur}</p>
          </div>
          <span className="text-xl font-black text-white">{cur} {f.grandTotal.toLocaleString()}</span>
        </div>

        {f.totalPax > 1 && (
          <div className="flex justify-between items-center py-1 px-1">
            <span className="text-xs font-bold text-slate-400">Per Person</span>
            <span className="text-xs font-black text-slate-500">{cur} {f.perPerson.toLocaleString()}</span>
          </div>
        )}

        {/* Show More toggle */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 transition active:scale-95"
        >
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
            {showMore ? "Show Less" : "Show More Details"}
          </span>
          <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${showMore ? "rotate-180" : ""}`} />
        </button>

        {/* Expanded */}
        {showMore && (
          <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">

            {/* Markup & Fees */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp size={10} className="text-amber-500" /> Markup & Fees
              </p>
              <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                {[
                  { label: "Markup",          value: a.markup,            show: true },
                  { label: "Service Fee",     value: a.serviceFee,        show: a.serviceFee > 0 },
                  { label: "Convenience Fee", value: a.convenienceFee,    show: a.convenienceFee > 0 },
                  { label: "Transaction Fee", value: a.transactionFee,    show: a.transactionFee > 0 },
                  { label: "Gateway Fee",     value: a.paymentGatewayFee, show: a.paymentGatewayFee > 0 },
                ].filter(i => i.show).map((item, i) => (
                  <div key={i} className="flex justify-between px-3 py-2 border-b border-amber-100 last:border-b-0">
                    <span className="text-xs text-amber-700">{item.label}</span>
                    <span className="text-xs font-black text-amber-800">+ {cur} {item.value.toLocaleString()}</span>
                  </div>
                ))}
                {a.markup === 0 && a.serviceFee === 0 && (
                  <div className="px-3 py-2 text-xs text-amber-600 italic">No markup applied</div>
                )}
              </div>
            </div>

            {/* Discounts */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Percent size={10} className="text-emerald-500" /> Discounts & Commission
              </p>
              <div className="bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden">
                {[
                  { label: "Agent Discount", value: a.agentDiscount, show: a.agentDiscount > 0 },
                  { label: "Promo Discount", value: a.promoDiscount, show: a.promoDiscount > 0 },
                  { label: "Commission",     value: a.commission,    show: a.commission > 0 },
                ].filter(i => i.show).map((item, i) => (
                  <div key={i} className="flex justify-between px-3 py-2 border-b border-emerald-100 last:border-b-0">
                    <span className="text-xs text-emerald-700">{item.label}</span>
                    <span className="text-xs font-black text-emerald-800">− {cur} {item.value.toLocaleString()}</span>
                  </div>
                ))}
                {!a.agentDiscount && !a.promoDiscount && !a.commission && (
                  <div className="px-3 py-2 text-xs text-emerald-600 italic">No discounts applied</div>
                )}
              </div>
            </div>

            {/* Tax */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Zap size={10} className="text-sky-500" /> Tax & Regulatory
              </p>
              <div className="bg-sky-50 rounded-xl border border-sky-100 overflow-hidden">
                {[
                  { label: "AIT",       value: a.ait,      show: a.ait !== 0 },
                  { label: "VAT",       value: a.vat,      show: a.vat !== 0 },
                  { label: "Round Off", value: a.roundOff, show: a.roundOff !== 0 },
                ].filter(i => i.show).map((item, i) => (
                  <div key={i} className="flex justify-between px-3 py-2 border-b border-sky-100 last:border-b-0">
                    <span className="text-xs text-sky-700">{item.label}</span>
                    <span className="text-xs font-black text-sky-800">{cur} {item.value.toLocaleString()}</span>
                  </div>
                ))}
                {!a.ait && !a.vat && !a.roundOff && (
                  <div className="px-3 py-2 text-xs text-sky-600 italic">No tax applied</div>
                )}
              </div>
            </div>

            {/* Admin Internal */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <BarChart3 size={10} className="text-slate-500" /> Admin / Internal
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                {[
                  { label: "Supplier Fare",  value: a.supplierFare  },
                  { label: "Published Fare", value: a.publishedFare },
                  { label: "Offered Fare",   value: a.offeredFare   },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between px-3 py-2 border-b border-slate-100 last:border-b-0">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-xs font-black text-slate-700">{cur} {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Settlement</p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <div className="flex justify-between px-3 py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Net Payable to Supplier</span>
                  <span className="text-xs font-black text-rose-700">{cur} {a.netPayableToSupplier.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-xs text-slate-500">Net Receivable from Agent</span>
                  <span className="text-xs font-black text-teal-700">{cur} {a.netReceivableFromAgent.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Profit */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp size={10} className="text-indigo-500" /> Profit Summary
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Gross Profit", value: `${cur} ${a.grossProfit.toLocaleString()}`, bg: "bg-indigo-50 border-indigo-100 text-indigo-800 text-indigo-500" },
                  { label: "Net Profit",   value: `${cur} ${a.netProfit.toLocaleString()}`,   bg: "bg-emerald-50 border-emerald-100 text-emerald-800 text-emerald-500" },
                  { label: "Margin",       value: `${a.marginPercent}%`,                       bg: "bg-purple-50 border-purple-100 text-purple-800 text-purple-500" },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl p-2.5 border text-center ${item.bg}`}>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-xs font-black">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DB Values */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Stored in DB</p>
              <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-xs text-slate-500">Net (Agent Payable)</span>
                  <span className="text-xs font-black text-slate-700">{cur} {net.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-xs text-slate-500">Gross (Invoice)</span>
                  <span className="text-xs font-black text-slate-700">{cur} {gross.toLocaleString()}</span>
                </div>
                {commission > 0 && (
                  <div className="flex justify-between px-3 py-2">
                    <span className="text-xs text-slate-500">Commission</span>
                    <span className="text-xs font-black text-emerald-700">− {cur} {commission.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Config */}
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pricing Config</p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-1">
                {[
                  { label: "Commission Type", value: fareCalc.meta.commissionType },
                  { label: "Commission Mode", value: fareCalc.meta.commissionMode },
                  { label: "Commission On",   value: fareCalc.meta.commissionOn   },
                  { label: "AIT Applied On",  value: fareCalc.meta.aitOn          },
                  { label: "Source",          value: fareCalc.meta.source         },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5">
                    <span className="text-[10px] font-semibold text-slate-400">{item.label}</span>
                    <span className="text-[10px] font-black text-slate-600 capitalize bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}