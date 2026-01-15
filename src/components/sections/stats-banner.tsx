import React from 'react';
import { Rocket, Users, DollarSign } from 'lucide-react';

/**
 * StatsBanner Component
 * 
 * Clones the "Funded Projects" statistics section from Polkastarter.
 * Shows metrics for "Funded Projects", "Unique Participants", and "Raised Capital".
 */
export default function StatsBanner() {
  return (
    <section className="w-full bg-white pt-16 pb-12">
      <div className="container mx-auto max-w-[1440px] px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4">
          
          {/* Header Section */}
          <div className="md:max-w-[320px]">
            <h2 className="text-[1.5rem] font-bold tracking-tight text-[#000000] mb-2 font-display">
              Funded Projects
            </h2>
            <p className="text-[0.9375rem] text-[#6b7280] leading-normal font-sans">
              We bring new technologies to our community
            </p>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-12 flex-1 justify-start md:justify-end">
            
            {/* Funded Projects Stat */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center min-w-[48px] h-12 rounded-full bg-[#f3f4f6] text-[#00d1ff]">
                <Rocket className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[0.8125rem] font-medium text-[#6b7280] uppercase tracking-wider font-sans">
                  Funded Projects
                </h3>
                <h2 className="text-[1.25rem] font-bold text-[#000000] font-sans">
                  138
                </h2>
              </div>
            </div>

            {/* Unique Participants Stat */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center min-w-[48px] h-12 rounded-full bg-[#f3f4f6] text-[#00d1ff]">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[0.8125rem] font-medium text-[#6b7280] uppercase tracking-wider font-sans">
                  Unique Participants
                </h3>
                <h2 className="text-[1.25rem] font-bold text-[#000000] font-sans">
                  141,186
                </h2>
              </div>
            </div>

            {/* Raised Capital Stat */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center min-w-[48px] h-12 rounded-full bg-[#f3f4f6] text-[#00d1ff]">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[0.8125rem] font-medium text-[#6b7280] uppercase tracking-wider font-sans">
                  Raised Capital
                </h3>
                <h2 className="text-[1.25rem] font-bold text-[#000000] font-sans">
                  $45,722,502.04
                </h2>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}