"use client";

import { Plane, Search } from "lucide-react";

interface Props {
  label: string;
  onClick: () => void;
}

export default function SearchButton({ label, onClick }: Props) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        className="group bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white py-4 px-16 rounded-xl shadow-lg hover:shadow-xl hover:from-[#0a3a6b] hover:to-[#0c5a9e] transition-all duration-300 font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        <Search
          size={20}
          className="group-hover:rotate-12 transition-transform"
        />
        <span>{label}</span>
        <Plane
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  );
}