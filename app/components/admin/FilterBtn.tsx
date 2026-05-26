"use client";

type Props = {
  label: string;
  active?: boolean;
};

export default function FilterBtn({ label, active = false }: Props) {
  return (
    <button
      className={`px-4 py-2 text-sm rounded-lg

      ${
        active
          ? "bg-blue-900 text-white"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}