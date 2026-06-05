// app/components/admin/request-process/PassengerList.tsx
"use client";

import {
  Users, User, Baby, Globe,
  FileText, Mail, Phone, Clock, Calendar,
} from "lucide-react";

interface PassengerListProps {
  passengers: any[];
}

export default function PassengerList({ passengers }: PassengerListProps) {
  if (!passengers.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Users size={14} className="text-white" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Passengers</h3>
        </div>
        <div className="flex items-center gap-2">
          {(["ADULT", "CHILD", "INFANT"] as const).map((t) => {
            const count = passengers.filter((p: any) => p.type === t).length;
            if (!count) return null;
            return (
              <span key={t}
                className={`text-[9px] font-black px-2 py-0.5 rounded-full
                  ${t === "ADULT" ? "bg-indigo-400/30 text-indigo-100" :
                    t === "CHILD" ? "bg-amber-400/30  text-amber-100"  :
                    "bg-pink-400/30 text-pink-100"}`}
              >
                {count} {t}
              </span>
            );
          })}
          <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">
            {passengers.length} Total
          </span>
        </div>
      </div>

      {/* Passenger Cards */}
      <div className="p-4 space-y-3">
        {passengers.map((pax: any, i: number) => (
          <div key={i}
            className={`rounded-xl border overflow-hidden
              ${pax.type === "ADULT" ? "border-indigo-100" :
                pax.type === "CHILD" ? "border-amber-100"  : "border-pink-100"}`}
          >
            {/* Pax Header */}
            <div className={`px-4 py-2.5 flex items-center justify-between
              ${pax.type === "ADULT" ? "bg-indigo-50" :
                pax.type === "CHILD" ? "bg-amber-50"  : "bg-pink-50"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm
                  ${pax.type === "ADULT" ? "bg-indigo-600 text-white" :
                    pax.type === "CHILD" ? "bg-amber-500  text-white" : "bg-pink-500 text-white"}`}
                >
                  {pax.type === "INFANT"
                    ? <Baby size={16} />
                    : pax.firstName?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-900">
                      {pax.title} {pax.firstName} {pax.lastName}
                    </p>
                    <span className="text-[8px] font-black text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md">
                      PAX {i + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md
                      ${pax.type === "ADULT" ? "bg-indigo-100 text-indigo-700" :
                        pax.type === "CHILD" ? "bg-amber-100  text-amber-700"  :
                        "bg-pink-100 text-pink-700"}`}
                    >
                      {pax.type}
                    </span>
                    {pax.gender && (
                      <span className="text-[8px] font-bold text-gray-400 uppercase">
                        · {pax.gender}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {pax.dateOfBirth && (
                <div className="text-right hidden sm:block">
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Date of Birth</p>
                  <p className="text-[10px] font-black text-gray-700">
                    {new Date(pax.dateOfBirth).toLocaleDateString("en-US", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Pax Details */}
            <div className="px-4 py-3 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5">
                {[
                  { icon: <FileText size={11} />, label: "Passport No.", value: pax.passportNumber, mono: true },
                  { icon: <Globe    size={11} />, label: "Nationality",  value: pax.nationality },
                  { icon: <Mail     size={11} />, label: "Email",        value: pax.email,        truncate: true },
                  { icon: <Phone    size={11} />, label: "Phone",        value: pax.phone },
                ].filter(f => f.value).map((field, fi) => (
                  <div key={fi} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-500">{field.icon}</span>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">
                        {field.label}
                      </p>
                      <p className={`text-[10px] font-black text-gray-800 ${field.mono ? "font-mono" : ""} ${field.truncate ? "truncate max-w-[120px]" : ""}`}>
                        {field.value}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Passport Expiry */}
                {pax.passportExpiry && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={11} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">
                        Passport Expiry
                      </p>
                      <p className={`text-[10px] font-black
                        ${new Date(pax.passportExpiry) < new Date() ? "text-red-600" :
                          new Date(pax.passportExpiry) < new Date(Date.now() + 180 * 86400000)
                          ? "text-amber-600" : "text-gray-800"}`}
                      >
                        {new Date(pax.passportExpiry).toLocaleDateString("en-US", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                        {new Date(pax.passportExpiry) < new Date() && (
                          <span className="ml-1 text-[8px] bg-red-100 text-red-600 px-1 rounded">EXPIRED</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* DOB mobile */}
                {pax.dateOfBirth && (
                  <div className="flex items-start gap-2 sm:hidden">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar size={11} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-[10px] font-black text-gray-800">
                        {new Date(pax.dateOfBirth).toLocaleDateString("en-US", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}