"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * AnnouncementHeader Component
 * 
 * Clones the top safety banner with pixel-perfect accuracy.
 * Background: Brand primary blue (#00D1FF)
 * Text: White, centered
 * Content: "Always make sure the URL is polkastarter.com - bookmark it to be safe."
 * Interactions: Dismissible close button.
 */
export default function AnnouncementHeader() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="relative w-full flex items-center justify-center py-[10px] px-4 md:px-8 bg-[#00D1FF] z-[100]"
      style={{
        // Using computed style equivalent for the brand's primary blue
        backgroundColor: "#00d1ff",
      }}
    >
      <div className="max-w-[1440px] w-full flex items-center justify-center">
        <p 
          className="text-white text-center font-medium leading-tight select-none"
          style={{
            fontSize: "0.875rem", // Approx 14px for standard warning banners
            fontFamily: "var(--font-sans)",
          }}
        >
          Always make sure the URL is{" "}
          <span className="font-bold">https://3searchcapital.com/</span> - bookmark it to
          be safe.
        </p>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        aria-label="close"
        className="absolute right-3 md:right-6 p-1 text-white opacity-80 hover:opacity-100 transition-opacity duration-200 focus:outline-none"
      >
        {/* Manually recreating the slim close icon path or using Lucide with specific sizing */}
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 18 18" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="13.5" y1="4.5" x2="4.5" y2="13.5" />
          <line x1="4.5" y1="4.5" x2="13.5" y2="13.5" />
        </svg>
      </button>
    </div>
  );
}