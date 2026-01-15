import React from 'react';
import Image from 'next/image';

/**
 * FundedStats component
 * Cloned based on the design instructions, HTML structure, and computed styles.
 * 
 * Target: "Funded Projects" statistics section with a white background and three data cards.
 */

const FundedStats = () => {
  const stats = [
    {
      title: 'Funded Projects',
      value: '138',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      iconBg: 'bg-[#00C6FB]/10',
      iconColor: 'text-[#00C6FB]',
    },
    {
      title: 'Unique Participants',
      value: '141,186',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconBg: 'bg-[#10B981]/10',
      iconColor: 'text-[#10B981]',
    },
    {
      title: 'Raised Capital',
      value: '$45,722,502.04',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      iconBg: 'bg-[#6B7280]/10',
      iconColor: 'text-[#6B7280]',
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6 max-w-[1280px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-black mb-1">
              Funded Projects
            </h2>
            <p className="text-[0.9375rem] text-[#6B7280] font-normal">
              We bring new technologies to our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 w-full md:w-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4"
              >
                <div 
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex-shrink-0`}
                >
                  {stat.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#6B7280] mb-0.5">
                    {stat.title}
                  </h3>
                  <p className="text-[1.5rem] font-bold text-black leading-none">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundedStats;