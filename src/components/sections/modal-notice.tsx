"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ModalNotice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-white/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-[540px] overflow-hidden bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB]"
        style={{ borderRadius: "1.5rem" }}
      >
        {/* Header */}
        <div className="border-b border-[#E5E7EB] py-6 text-center">
          <h2 className="text-[1.25rem] font-semibold tracking-tight text-black">
            Important Notice
          </h2>
        </div>

        {/* Body */}
        <div className="border-b border-[#E5E7EB] py-10 px-6 text-center">
          <p className="text-[1.125rem] leading-relaxed text-black/80 font-normal">
            Polkastarter is evolving beyond a launchpad
          </p>
        </div>

        {/* Footer / Buttons */}
        <div className="flex items-center justify-center gap-4 py-8 px-6">
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#00C6FB] px-8 text-[0.875rem] font-medium text-white transition-standard hover:opacity-90 active:scale-[0.98]"
          >
            Visit the Future
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#B2E4F2] px-8 text-[0.875rem] font-medium text-[#00C6FB] transition-standard hover:bg-[#a1d9e9] active:scale-[0.98]"
          >
            Dismiss
          </button>
        </div>

        {/* Close Icon (Optional based on screenshot) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 hidden p-2 text-gray-400 hover:text-black md:block"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ModalNotice;