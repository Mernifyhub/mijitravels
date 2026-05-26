// src/components/search-results/ExpandedBaggagePolicies.tsx

"use client";

import { Luggage, Building2, ShieldCheck, Edit3 } from "lucide-react";

interface Props {
  baggageChecked: string;
  baggageCabin: string;
  baggageCheckedRaw: number;
  baggageCabinRaw: number;
  refundLabel: string;
  changeLabel: string;
  isRefundable: boolean;
  isChangeable: boolean;
}

export function ExpandedBaggagePolicies({
  baggageChecked,
  baggageCabin,
  baggageCheckedRaw,
  baggageCabinRaw,
  refundLabel,
  changeLabel,
  isRefundable,
  isChangeable,
}: Props) {
  const items = [
    {
      icon: <Luggage size={14} />,
      label: "Check-in Bag",
      value: baggageChecked,
      color: baggageCheckedRaw > 0 ? "indigo" : "rose",
    },
    {
      icon: <Building2 size={14} />,
      label: "Cabin Bag",
      value: baggageCabin,
      color: baggageCabinRaw > 0 ? "indigo" : "rose",
    },
    {
      icon: <ShieldCheck size={14} />,
      label: "Cancellation",
      value: refundLabel,
      color: isRefundable ? "emerald" : "rose",
    },
    {
      icon: <Edit3 size={14} />,
      label: "Date Change",
      value: changeLabel,
      color: isChangeable ? "emerald" : "amber",
    },
  ];

  const bgMap: Record<string, string> = {
    indigo: "bg-indigo-50/60 border-indigo-100",
    emerald: "bg-emerald-50/60 border-emerald-100",
    rose: "bg-rose-50/60 border-rose-100",
    amber: "bg-amber-50/60 border-amber-100",
  };

  const iconBgMap: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
  };

  const textMap: Record<string, string> = {
    indigo: "text-indigo-700",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    amber: "text-amber-700",
  };

  return (
    <div>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <ShieldCheck size={11} className="text-indigo-500" /> Baggage & Policies
      </h5>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border ${bgMap[item.color]}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBgMap[item.color]}`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {item.label}
              </p>
              <p
                className={`text-[11px] font-bold mt-0.5 leading-tight ${textMap[item.color]}`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}