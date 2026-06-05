"use client";

import { FileInput, Search, UsersRound } from "lucide-react";
import type { ActiveTab } from "./types";

interface Props {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}

const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: "SEARCH", label: "Search Flights", icon: <Search size={18} /> },
  { id: "PNR", label: "PNR Import", icon: <FileInput size={18} /> },
  { id: "GROUP", label: "Group Fare", icon: <UsersRound size={18} /> },
];

export default function SearchTabs({ activeTab, onChange }: Props) {
  return (
    <div className="bg-white rounded-t-2xl shadow-sm border-b border-gray-100 p-1 flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
            activeTab === tab.id
              ? "bg-[#021f3b] text-white shadow-lg"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}