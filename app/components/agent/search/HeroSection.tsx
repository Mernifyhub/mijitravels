"use client";

import { Plane } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-[#021f3b] via-[#0a3a6b] to-[#021f3b] pt-2 pb-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-6 -left-6 opacity-5">
          <Plane size={180} className="text-white rotate-12" />
        </div>
        <div className="absolute top-8 right-16 opacity-5 animate-pulse">
          <Plane size={90} className="text-white -rotate-12" />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Find Your{" "}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">
              Perfect Flight
            </span>
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 300 8"
              fill="none"
            >
              <path
                d="M0 6 Q75 0 150 4 Q225 8 300 2"
                stroke="url(#grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="grad"
                  x1="0"
                  y1="0"
                  x2="300"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#93C5FD" />
                  <stop offset="1" stopColor="#6EE7B7" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>
      </div>
    </div>
  );
}