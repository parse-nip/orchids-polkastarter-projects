import React from 'react';
import Image from 'next/image';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About us', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Press Kit', href: '#' },
        { name: 'POLS Governance', href: '#' },
      ],
    },
    {
      title: 'Help',
      links: [
        { name: 'Support', href: '#' },
        { name: 'Terms & Conditions', href: '#' },
        { name: 'Privacy Policy', href: '#' },
      ],
      subSection: {
        title: 'Developers',
        links: [
          { name: 'Documentation', href: '#' },
          { name: 'Github repos', href: '#' },
        ],
      },
    },
    {
      title: 'Information',
      links: [
        { name: 'Apply for IDO', href: '#' },
      ],
      subSection: {
        title: 'Products',
        links: [
          { name: 'Launchpad', href: '#' },
          { name: 'Polkastarter Hub', href: '#' },
          { name: 'Polkastarter Ecosystem', href: '#' },
          { name: 'Polkapitch hub', href: '#' },
        ],
      },
    },
    {
      title: 'Resources',
      links: [
        { name: 'Projects', href: '#' },
        { name: 'Dashboard', href: '#' },
        { name: 'Staking', href: '#' },
        { name: 'Portfolio', href: '#' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-[#F3F4F6] pt-16 pb-8">
      <div className="container max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 mb-16">
          {/* Main Link Columns */}
          {footerLinks.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <div>
                <h3 className="text-[13px] font-semibold text-[#000000] mb-4 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        className="text-[0.93rem] text-[#6B7280] hover:text-[#000000] transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {section.subSection && (
                <div className="mt-4">
                  <h3 className="text-[13px] font-semibold text-[#000000] mb-4 uppercase tracking-wider">
                    {section.subSection.title}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {section.subSection.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <a
                          href={link.href}
                          className="text-[0.93rem] text-[#6B7280] hover:text-[#000000] transition-colors duration-200"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Brand/Logo Column */}
          <div className="lg:text-right flex flex-col lg:items-end gap-2">
            <div className="flex items-center lg:justify-end gap-2 mb-2">
              <svg 
                height="24" 
                viewBox="0 0 1426 183" 
                className="h-5 w-auto"
                aria-hidden="true"
              >
                <path d="M112.5 0C50.4 0 0 50.4 0 112.5l25 25c0-48.3 39.2-87.5 87.5-87.5s87.5 39.2 87.5 87.5l25-25C225 50.4 174.6 0 112.5 0z" fill="currentColor"/>
                <path d="M400 30h100v120h-100z" fill="currentColor"/>
              </svg>
              <span className="text-xl font-bold text-[#000000]">Polkastarter</span>
            </div>
            <p className="text-[0.93rem] text-[#6B7280]">Feels good to be early</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F3F4F6] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center p-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <Image 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-polkastarter-com/assets/icons/icon-w-pattern-1.png"
                  alt="System"
                  width={16}
                  height={16}
                />
              </div>
              <span className="text-[13px] text-[#6B7280]">System</span>
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="text-[#6B7280]">
                <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="flex gap-4 items-center">
              {[
                { name: 'Twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { name: 'Telegram', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.98-.65-.35-1.01.21-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.48 1.02-.73 4-1.74 6.67-2.88 8.01-3.41 3.81-1.52 4.6-1.79 5.12-1.79.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.02.19z' },
                { name: 'Mirror', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
              ].map((social, sIdx) => (
                <a key={sIdx} href="#" className="text-[#6B7280] hover:text-[#000000] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#F3F4F6] bg-white">
              <span className="text-[13px] font-medium text-[#000000]">$0.09</span>
            </div>
            <button className="bg-[#000000] hover:bg-[#333333] text-white text-[13px] font-medium px-4 py-2 rounded-full transition-all flex items-center gap-2">
              Buy POLS
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;