"use client";

interface Item {
  label: string;
  color: "green" | "blue" | "purple";
}

interface Props {
  items?: Item[];
}

const defaultItems: Item[] = [
  { label: "Best Price Guarantee", color: "green" },
  { label: "500+ Airlines", color: "blue" },
  { label: "24/7 Support", color: "purple" },
];

const colorMap = {
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
};

export default function TrustIndicators({ items = defaultItems }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${colorMap[item.color]}`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}