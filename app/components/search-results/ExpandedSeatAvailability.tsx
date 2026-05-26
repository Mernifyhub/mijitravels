// src/components/search-results/ExpandedSeatAvailability.tsx

"use client";

interface Props {
  availableSeats: number;
}

function SeatSvg({ color }: { color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-80"
    >
      <path d="M4 18v3h3" />
      <path d="M20 18v3h-3" />
      <path d="M12 2v8" />
      <path d="M2 10h20" />
      <rect x="4" y="10" width="16" height="8" rx="2" />
    </svg>
  );
}

export function ExpandedSeatAvailability({ availableSeats }: Props) {
  const isLow = availableSeats <= 3;
  const isMedium = availableSeats <= 5;

  return (
    <div>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <SeatSvg color="#4F46E5" />
        Seat Availability
      </h5>
      <div
        className={`rounded-xl border p-3 ${
          isLow ? "bg-rose-50 border-rose-200" : "bg-indigo-50 border-indigo-100"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(availableSeats, 7) }).map((_, i) => (
              <SeatSvg key={i} color={isLow ? "#E11D48" : "#4F46E5"} />
            ))}
          </div>
          <span
            className={`text-sm font-extrabold ${
              isLow ? "text-rose-600" : "text-indigo-700"
            }`}
          >
            {availableSeats} seats
          </span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLow
                ? "bg-rose-500"
                : isMedium
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
            style={{
              width: `${Math.min(100, (availableSeats / 10) * 100)}%`,
            }}
          />
        </div>
        <p
          className={`text-[10px] font-bold mt-1 ${
            isLow ? "text-rose-600" : "text-indigo-600"
          }`}
        >
          {isLow
            ? "🔥 Almost sold out — book now!"
            : isMedium
            ? "⚡ Limited seats remaining"
            : "✅ Good availability"}
        </p>
      </div>
    </div>
  );
}