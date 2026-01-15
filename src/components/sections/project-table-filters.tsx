"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const networks = [
  { id: "all", label: "All" },
  { id: "ethereum", label: "Ethereum" },
  { id: "bnb", label: "BNB Chain" },
  { id: "polygon", label: "Polygon" },
  { id: "celo", label: "Celo" },
  { id: "avalanche", label: "Avalanche" },
  { id: "arbitrum", label: "Arbitrum" },
  { id: "base", label: "Base" },
  { id: "sepolia", label: "Sepolia" },
  { id: "amoy", label: "Amoy" },
  { id: "bsc-testnet", label: "BSC Testnet" },
  { id: "sei", label: "Sei" },
  { id: "mode", label: "Mode" },
];

export default function ProjectTableFilters() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="relative w-full max-w-[1440px] mx-auto">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Search by project name, token contract addresses or token symbols"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] pl-4 pr-12 text-[0.9375rem] font-sans text-foreground bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
            aria-label="search-input"
          />
          <button
            aria-label="submit"
            className="absolute right-2 p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Network Tabs */}
      <div className="w-full overflow-hidden">
        <div 
          role="tablist" 
          className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2"
          style={{ width: "min-content", minWidth: "100%" }}
        >
          {networks.map((network) => (
            <button
              key={network.id}
              role="tab"
              aria-selected={activeTab === network.id}
              onClick={() => setActiveTab(network.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 text-[0.9375rem] font-medium rounded-full transition-all duration-300 ease-in-out border border-transparent",
                activeTab === network.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {network.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}