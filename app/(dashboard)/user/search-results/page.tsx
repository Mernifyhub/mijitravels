// app/(dashboard)/user/search-results/page.tsx

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SearchResultsPage from "@/app/components/search-results/SearchResultsPage";

function SearchResultsLoading() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm
          flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#021f3b]" />
        </div>
        <p className="text-slate-500 font-medium text-sm">
          Searching flights...
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SearchResultsLoading />}>
      <SearchResultsPage />
    </Suspense>
  );
}