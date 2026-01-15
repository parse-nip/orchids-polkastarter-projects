"use client";

import React, { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for subscription would go here
  };

  return (
    <section className="w-full py-[64px] bg-white border-t border-[#F3F4F6]">
      <div className="container mx-auto px-6 max-w-[1440px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-[540px]">
            <p className="text-[#00D1FF] font-medium text-[0.8125rem] mb-2 uppercase tracking-wide">
              Never want to miss a sale?
            </p>
            <h2 className="text-[2rem] font-bold leading-[1.2] text-[#000000] tracking-tight">
              Sign up for our newsletter and get the latest news and updates.
            </h2>
          </div>

          <div className="w-full lg:max-w-[480px]">
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-center md:bg-[#F3F4F6] md:rounded-full md:p-1"
            >
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full h-[52px] md:h-[48px] px-6 text-[0.9375rem] text-[#000000] bg-[#F3F4F6] md:bg-transparent rounded-full md:rounded-none outline-none placeholder:text-[#6B7280] focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="hidden md:block bg-[#00D1FF] hover:bg-[#00b8e6] text-white text-[0.9375rem] font-semibold h-[48px] px-8 rounded-full transition-all duration-300 ease-in-out whitespace-nowrap"
              >
                Subscribe
              </button>
              
              {/* Mobile Button - Shows below on very small screens, but the layout above handles typical mobile bg coloring */}
              <button
                type="submit"
                className="md:hidden mt-3 w-full bg-[#00D1FF] text-white text-[15px] font-semibold h-[52px] rounded-full transition-standard"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}