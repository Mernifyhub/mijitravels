// app/components/admin/request-process/RequestHeader.tsx
"use client";

import { ArrowLeft, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { ColorMapEntry, TypeMapEntry } from "./types";

interface RequestHeaderProps {
  current: TypeMapEntry;
  colors: ColorMapEntry;
  booking: any;
  request: any;
  isAssigned: boolean;
  isAssignedToMe: boolean;
  assignedPersonName: string;
}

export default function RequestHeader({
  current, colors, booking, request,
  isAssigned, isAssignedToMe, assignedPersonName,
}: RequestHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
      >
        <ArrowLeft size={18} />
      </button>

      <div className={`p-2.5 rounded-xl border ${colors.light}`}>
        <span className={colors.text}>{current.icon}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">{current.title}</h1>
        <p className="text-sm text-gray-500">
          Booking: {booking?.bookingId} · PNR: {booking?.pnr}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
        {isAssigned && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border
            ${isAssignedToMe
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-orange-100 text-orange-700 border-orange-200"}`}
          >
            <UserCheck size={13} />
            {isAssignedToMe ? "Assigned to You" : `Assigned: ${assignedPersonName}`}
          </span>
        )}
        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border
          ${request?.status === "PENDING"    ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
            request?.status === "PROCESSING" ? "bg-blue-100   text-blue-700   border-blue-200"   :
            request?.status === "APPROVED"   ? "bg-green-100  text-green-700  border-green-200"  :
            "bg-red-100 text-red-700 border-red-200"}`}
        >
          {request?.status}
        </span>
      </div>
    </div>
  );
}