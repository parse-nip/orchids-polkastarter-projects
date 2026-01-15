"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { TermsModal } from '@/components/auth/terms-modal';

const ProductShowcase = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const showcaseImage = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-coinlist-co/assets/images/befirst-0002efea7136c537672b58be9d6713143f3c306664-4.png";

  return (
    <section className="bg-white py-[120px] overflow-hidden">
      <div className="container max-w-[1240px] mx-auto px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          <div className="w-full lg:w-[45%] flex flex-col items-start text-left">
            <h2 className="text-[3rem] font-semibold leading-[1.2] tracking-[-0.01em] text-black mb-4">
              Be first.
            </h2>
            <div className="mb-8 max-w-[480px]">
              <p className="text-[1.25rem] font-normal leading-[1.5] text-[#949494]">
                Purchase a limited supply of the best new tokens before they list on other exchanges.
              </p>
            </div>
            
              <button 
                onClick={() => setShowTermsModal(true)}
                className="inline-block bg-white text-black border border-[#ebebeb] px-8 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-soft cursor-pointer"
              >
                Get Started
              </button>
          </div>

          <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

          {/* Mobile Mockup Image Container */}
          <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[688px] aspect-[688/440] rounded-[32px] overflow-hidden bg-[#F9F9F9]">
              <div 
                className="absolute inset-0 flex items-center justify-center p-0"
                style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, #FFFFFF 0%, #F9F9F9 100%)'
                }}
              >
                  <Image
                    src={showcaseImage}
                    alt="3SEARCH Capital Mobile App Interface Showcase"
                    width={688}
                    height={440}
                    className="object-contain w-full h-full"
                    priority
                  />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;