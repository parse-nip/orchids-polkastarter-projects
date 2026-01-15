"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * NoticeModal Component
 * 
 * A pixel-perfect clone of the Polkastarter "Important Notice" modal.
 * It features a blurred backdrop, a structured white container, and 
 * specific action buttons ("Visit the Future" and "Dismiss").
 */
const NoticeModal: React.FC = () => {
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

  const handleDismiss = () => setIsOpen(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur effect as seen in high_level_design and screenshots */}
      <div 
        className="fixed inset-0 bg-white/60 backdrop-blur-[12px] transition-opacity duration-300"
        onClick={handleDismiss}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-[480px] bg-white rounded-[24px] shadow-soft border border-border overflow-hidden animate-in fade-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-center items-center relative">
          <h2 className="text-[1.125rem] font-bold text-foreground tracking-tight">
            Important Notice
          </h2>
          <button 
            onClick={handleDismiss}
            className="absolute right-6 p-1 text-muted-foreground hover:text-foreground transition-standard"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="px-10 py-10 flex flex-col items-center text-center">
          <p className="text-[1.0625rem] leading-relaxed text-foreground font-medium">
            Polkastarter is evolving beyond a launchpad
          </p>
        </div>

        {/* Action Buttons Section */}
        <div className="px-6 pb-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="https://polkastarter.com" // Placeholder for the evolution link
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-primary text-primary-foreground h-[44px] px-8 text-[0.9375rem] font-semibold hover:opacity-90 transition-standard border-2 border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Visit the Future
          </a>
          <button
            onClick={handleDismiss}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#B2E3F1] text-[#34444C] h-[44px] px-8 text-[0.9375rem] font-semibold hover:bg-[#A1D7E6] transition-standard focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;