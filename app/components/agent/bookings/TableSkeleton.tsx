// Loading skeleton shown while bookings data is being fetched

export default function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-slate-100"
        >
          <div className="w-5 h-5 bg-slate-200 rounded" />
          <div className="w-24 h-8 bg-slate-200 rounded-lg" />
          <div className="w-20 h-6 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-200 rounded-full" />
            <div className="space-y-1">
              <div className="w-28 h-4 bg-slate-200 rounded" />
              <div className="w-16 h-3 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-32 h-4 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-16 h-6 bg-slate-200 rounded" />
          <div className="w-16 h-8 bg-slate-200 rounded-lg" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-20 h-4 bg-slate-200 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}