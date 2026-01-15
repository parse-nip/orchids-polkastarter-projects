"use client";

import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';

const Header = () => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-[8px]">
      <div className="max-w-[1248px] mx-auto px-6 h-[76px] flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center">
            <div className="flex items-center scale-[1.1]">
              <svg 
                width="142" 
                height="28" 
                viewBox="0 0 142 28" 
                fill="none" 
                className="text-black"
                aria-label="CoinList Logo"
              >
                <path d="M11.6 6.4c-4.4 0-7.8 3.5-7.8 7.6 0 4.1 3.4 7.6 7.8 7.6s7.8-3.5 7.8-7.6c0-4.1-3.4-7.6-7.8-7.6zm0 18.2c-5.9 0-10.7-4.7-10.7-10.6S5.7 3.4 11.6 3.4c5.9 0 10.7 4.7 10.7 10.6S17.5 24.6 11.6 24.6z" fill="currentColor"/>
                <path d="M37.9 3.4h-5.2v21.2h5.2V3.4zM53.1 3.4H48v21.2h5.1V3.4zM75.3 3.4h-5.4l-9.4 12.8V3.4h-5.1v21.2h5.4l9.4-12.8v12.8h5.1V3.4zM86.8 3.4H81.7v21.2h5.1V3.4zM108.7 3.4h-5.2v17.4h-9.1v3.8h14.3V3.4zM116.8 3.4h-5.2v21.2h5.2V3.4zM138 6.4c-1.8-1.9-4.3-3-7.1-3-5.2 0-9.4 4.1-9.4 9.1s4.2 9.1 9.4 9.1c2.8 0 5.3-1.1 7.1-3l.5-.5-2.6-2.6-.5.5c-.8.8-1.9 1.4-3.1 1.4-2.8 0-5.1-2.1-5.1-4.9s2.3-4.9 5.1-4.9c1.2 0 2.3.6 3.1 1.4l.5.5 2.6-2.6-.5-.5z" fill="currentColor"/>
                <path d="M141.2 3.4h-10.4v3.8h10.4V3.4z" fill="currentColor"/>
              </svg>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="/" 
              className="text-[15px] font-medium text-black hover:opacity-70 transition-opacity"
            >
              Home
            </a>
            <a 
              href="/projects" 
              className="text-[15px] font-medium text-black hover:opacity-70 transition-opacity"
            >
              Projects
            </a>
            <a 
              href="/projects" 
              className="text-[15px] font-medium text-black hover:opacity-70 transition-opacity"
            >
              Token Sales
            </a>
            
            <div 
              className="relative group"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <button className="flex items-center gap-1 text-[15px] font-medium text-black group-hover:opacity-70 transition-opacity">
                Resources
              </button>
              
              {/* Resources Dropdown */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-200 ${
                  isResourcesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] shadow-soft w-[520px] overflow-hidden flex">
                  {/* Blog Item */}
                  <a 
                    href="https://blog.coinlist.co/" 
                    className="flex-1 p-6 hover:bg-[#F9F9F9] transition-colors group/item"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[15px] font-medium text-black">Blog</h4>
                      <ArrowUpRight className="w-4 h-4 text-black opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[14px] text-[#949494] leading-normal">
                      The latest news and resources.
                    </p>
                  </a>
                  
                  {/* Divider */}
                  <div className="w-[1px] bg-[#EBEBEB]" />
                  
                  {/* Help Item */}
                  <a 
                    href="/help" 
                    className="flex-1 p-6 hover:bg-[#F9F9F9] transition-colors group/item"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[15px] font-medium text-black">Help</h4>
                      <ArrowUpRight className="w-4 h-4 text-black opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[14px] text-[#949494] leading-normal">
                      Your questions answered.
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <a 
            href="/login" 
            className="hidden sm:flex items-center justify-center px-6 h-[44px] text-[15px] font-semibold text-black border border-[#EBEBEB] rounded-pill hover:bg-black/5 hover:scale-[1.02] transition-all"
          >
            Log in
          </a>
          <a 
            href="/register" 
            className="flex items-center justify-center px-6 h-[44px] text-[15px] font-semibold text-white bg-black rounded-pill hover:opacity-90 hover:scale-[1.02] transition-all"
          >
            Sign up
          </a>
          
          {/* Mobile Menu Icon (Placeholder for functionality) */}
          <button className="md:hidden p-2 text-black">
            <span className="text-[15px] font-medium">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
