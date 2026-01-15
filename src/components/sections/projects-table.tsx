"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

interface Project {
  name: string;
  ticker: string;
  logo: string;
  type: string;
  raisingGoal: string;
  ath: string;
  endDate: string;
  endTime: string;
  chains: string[];
}

const projectsData: Project[] = [
  {
    name: "MemeMarket",
    ticker: "$MFUN",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_5.png",
    type: "Token Sale",
    raisingGoal: "$250,000",
    ath: "TBA",
    endDate: "November 5th 2025",
    endTime: "9:00 AM - UTC",
    chains: ["ethereum"],
  },
  {
    name: "Project Merlin",
    ticker: "$MRLN",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_6.png",
    type: "Token Sale",
    raisingGoal: "$300,000",
    ath: "TBA",
    endDate: "September 16th 2025",
    endTime: "12:00 PM - UTC",
    chains: ["bnb"],
  },
  {
    name: "CHIPS Protocol",
    ticker: "$CHIPS",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_7.png",
    type: "Token Sale",
    raisingGoal: "$500,000",
    ath: "TBA",
    endDate: "August 12th 2025",
    endTime: "4:00 PM - UTC",
    chains: ["polygon"],
  },
  {
    name: "Grand Gangsta City",
    ticker: "$GGC",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_8.png",
    type: "Token Sale",
    raisingGoal: "$180,000",
    ath: "TBA",
    endDate: "July 23rd 2025",
    endTime: "4:00 PM - UTC",
    chains: ["ethereum"],
  },
  {
    name: "WAGMI HUB",
    ticker: "$INFOFI",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_9.png",
    type: "Token Sale",
    raisingGoal: "$100,000",
    ath: "TBA",
    endDate: "June 22nd 2025",
    endTime: "3:44 PM - UTC",
    chains: ["base"],
  },
  {
    name: "AI Dev Agent",
    ticker: "$AIDEV",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_10.png",
    type: "Token Sale",
    raisingGoal: "$100,000",
    ath: "TBA",
    endDate: "May 21st 2025",
    endTime: "4:00 PM - UTC",
    chains: ["arbitrum"],
  },
  {
    name: "Hydro: RWA DePIN",
    ticker: "$SUIRWAPIN",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_11.png",
    type: "Token Sale",
    raisingGoal: "$200,000",
    ath: "TBA",
    endDate: "May 15th 2025",
    endTime: "10:00 AM - UTC",
    chains: ["ethereum"],
  },
  {
    name: "aiSUI",
    ticker: "$SUIAGENT",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_12.png",
    type: "Token Sale",
    raisingGoal: "$100,000",
    ath: "TBA",
    endDate: "May 14th 2025",
    endTime: "11:00 AM - UTC",
    chains: ["sei"],
  },
  {
    name: "AgentWood",
    ticker: "$AWS",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_13.png",
    type: "Token Sale",
    raisingGoal: "$150,000",
    ath: "TBA",
    endDate: "March 4th 2025",
    endTime: "11:08 AM - UTC",
    chains: ["bnb"],
  },
  {
    name: "XO",
    ticker: "$XOXO",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_14.png",
    type: "Token Sale",
    raisingGoal: "$100,000",
    ath: "TBA",
    endDate: "February 17th 2025",
    endTime: "10:10 AM - UTC",
    chains: ["ethereum"],
  },
  {
    name: "AIvalanche DeFAI",
    ticker: "$AVAXAI",
    logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/images/images_15.png",
    type: "Token Sale",
    raisingGoal: "$100,000",
    ath: "TBA",
    endDate: "January 25th 2025",
    endTime: "11:18 PM - UTC",
    chains: ["avalanche"],
  },
];

const chains = [
  "All",
  "Ethereum",
  "BNB Chain",
  "Polygon",
  "Celo",
  "Avalanche",
  "Arbitrum",
  "Base",
  "Sepolia",
  "Amoy",
  "BSC Testnet",
  "Sei",
  "Mode",
];

const ProjectsTable = () => {
  const [activeChain, setActiveChain] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projectsData.filter((project) => {
    const matchesChain =
      activeChain === "All" ||
      project.chains.some((c) => c.toLowerCase() === activeChain.toLowerCase().replace(" chain", ""));
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChain && matchesSearch;
  });

  return (
    <section className="bg-white py-10">
      <div className="container mx-auto px-6 max-w-[1280px]">
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="relative w-full max-w-full">
            <input
              type="text"
              placeholder="Search by project name, token symbol, address or token name..."
              className="w-full bg-[#F9FAFB] border-none rounded-full py-3.5 pl-6 pr-12 focus:ring-1 focus:ring-[#00C6FB] outline-none text-[0.9375rem] placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {chains.map((chain) => (
                <button
                  key={chain}
                  onClick={() => setActiveChain(chain)}
                  className={`px-5 py-2 rounded-full text-[0.875rem] font-medium transition-standard whitespace-nowrap ${
                    activeChain === chain
                      ? "bg-[#00C6FB] text-white"
                      : "bg-[#F3F4F6] text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 font-table-header px-4">Project name</th>
                <th className="py-4 font-table-header px-4">Type</th>
                <th className="py-4 font-table-header px-4 text-right">Raising goal</th>
                <th className="py-4 font-table-header px-4 text-right">ATH since IDO</th>
                <th className="py-4 font-table-header px-4 text-right flex items-center justify-end gap-1">
                  Ended in <ChevronDown size={14} className="text-gray-300" />
                </th>
                <th className="py-4 font-table-header px-4 text-right">Chains</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.map((project, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-100 shrink-0">
                        <Image
                          src={project.logo}
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[0.9375rem] text-black mb-0.5">
                          {project.name}
                        </p>
                        <p className="text-gray-500 text-[0.8125rem]">
                          {project.ticker}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[0.75rem] font-medium">
                      {project.type}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right font-semibold text-[0.9375rem]">
                    {project.raisingGoal}
                  </td>
                  <td className="py-5 px-4 text-right font-semibold text-[0.9375rem]">
                    {project.ath}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <p className="font-semibold text-[0.9375rem]">{project.endDate}</p>
                    <p className="text-gray-400 text-[0.8125rem]">{project.endTime}</p>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {project.chains.map((chain, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center p-1"
                        >
                          <div className="w-full h-full bg-gray-300 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-100">
          <div className="text-gray-500 text-[0.875rem]">1 / 10</div>
          <div className="flex gap-4">
            <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-300 disabled:opacity-50 transition-standard cursor-not-allowed">
              <ChevronLeft size={20} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full border border-[#00C6FB] text-[#00C6FB] hover:bg-[#00C6FB] hover:text-white transition-standard">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsTable;