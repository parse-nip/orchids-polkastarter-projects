"use client";

import React, { useState } from 'react';
import { TermsModal } from '@/components/auth/terms-modal';

const HeroSection = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <section className="relative w-full min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-transparent pt-24 pb-20">
      {/* Content Container */}
      <div className="container relative z-10 flex flex-col items-center text-center px-4">
        {/* Main Heading */}
        <h1 
          className="max-w-[800px] text-center mb-6"
          style={{
            fontSize: '4.5rem',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#000000'
          }}
        >
          Join The Next Big Token Sale
        </h1>

        {/* Subheading */}
          <div className="max-w-[640px] mb-10">
            <p 
              style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                lineHeight: 1.5,
                color: '#949494'
              }}
            >
              3SEARCH Capital finds and launches the best new tokens before they list on other exchanges.
            </p>
          </div>

        {/* Call to Action Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowTermsModal(true)}
              className="pill-button bg-black text-white font-button transition-transform duration-200 hover:scale-105 active:scale-95 px-8 py-4 inline-flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: '#000000',
                color: '#FFFFFF',
                borderRadius: '50px',
                padding: '12px 24px',
                minWidth: '160px',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Get Started
            </button>
          </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </section>
  );
};

export default HeroSection;