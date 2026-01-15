"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * AnnouncementBar Component
 * 
 * A slim top notification bar with a specific pinkish/salmon background color,
 * URL verification message, and a close button.
 * 
 * Styles are derived from the provided HTML structure and high-level design.
 */
const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="w-full flex items-center justify-between px-4 py-2"
      style={{
        backgroundColor: "rgb(255, 107, 107)", // Matches the "pinkish/warning" aesthetic from screenshots
        minHeight: "40px",
        zIndex: 50,
        position: 'relative'
      }}
    >
      {/* Spacer for centering logic */}
      <div className="hidden md:block w-8" aria-hidden="true" />

      {/* Warning Message */}
      <div className="flex-1 text-center">
        <p 
          className="text-white font-medium m-0 leading-normal inline-block"
          style={{
            fontSize: "0.875rem", // Consistent with design instructions for slim bar
            fontFamily: "var(--font-sans)",
          }}
        >
          Always make sure the URL is{" "}
          <span className="font-bold">https://3searchcapital.com/</span> - bookmark it to be safe.
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        aria-label="close"
        className="flex items-center justify-center p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
        style={{
          width: "32px",
          height: "32px",
          color: "white",
          border: "none",
          background: "transparent",
          cursor: "pointer"
        }}
      >
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default AnnouncementBar;