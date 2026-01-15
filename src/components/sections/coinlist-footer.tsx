import React from 'react';
import Image from 'next/image';
import { Twitter, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#f9f9f9] border-t border-[#ebebeb] pt-16 pb-12">
      <div className="container mx-auto px-8 max-w-[1200px]">
        {/* Top Section: Logo, Links, Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex items-center">
                <a href="/" className="flex items-center gap-2">
                  <img 
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3search-1767084163944.png?width=8000&height=8000&resize=contain" 
                    alt="3SEARCH Capital Logo" 
                    className="h-8 w-auto"
                    style={{ filter: 'brightness(0)' }}
                  />
                </a>
            </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Privacy', href: '/legal#privacy' },
              { label: 'Terms', href: '/legal#terms' },
              { label: 'Legal', href: '/legal' },
              { label: 'Status', href: '#' },
              { label: 'Press Inquiries', href: '#' },
              { label: 'Media Kit', href: '#' },
              { label: 'Manage Cookies', href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-[#949494] hover:text-[#000000] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="#" className="text-[#949494] hover:text-[#000000] transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M50 0c27.6 0 50 22.4 50 50S77.6 100 50 100 0 77.6 0 50 22.4 0 50 0zM35.1 82.2c1.7.3 3.3.4 5 .4 3.7 0 7.4-.6 10.9-1.9 6.2-2.3 11-6.5 13.9-12 2.6-4.9 3.5-10.4 2.7-15.9-.6-3.8-2.2-7.3-4.6-10.2s-5.4-5.1-8.9-6.3c-1.7-.6-3.4-.8-5.1-.8-4 0-7.8.8-11.3 2.5-5.9 2.7-10.2 7.4-12.4 13.5-1.7 4.7-2.1 9.8-1 14.7 1.2 5.3 4.1 10.1 8.1 13.7 2.1 1.9 4.6 1.9 2.7 2.4z"/>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="text-[#949494] hover:text-[#000000] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#949494] hover:text-[#000000] transition-colors">
              <Send className="w-5 h-5" fill="currentColor" stroke="none" />
            </a>
          </div>
        </div>

        {/* Legal Disclaimer Text */}
        <div className="border-t border-[#ebebeb] pt-8 space-y-4">
          <p className="text-[12px] leading-[1.6] text-[#949494]">
            This site is operated by 3SEARCH Capital Services Inc. and services are provided through its wholly-owned subsidiaries (altogether, “3SEARCH Capital”). 3SEARCH Capital does not give investment advice, endorse or make recommendations with respect to any assets or provide legal or tax advice. 3SEARCH Capital Markets LLC (NMLS #1785267) is a Money Services Business registered with the Financial Crimes Enforcement Network and certain states as a money transmitter. Neither 3SEARCH Capital nor any of its officers, directors, agents, or employees makes any warranty, express or implied, of any kind whatsoever related to the adequacy, accuracy, or completeness of any information on this site or the use of information on this site. This site contains external links to third-party content (content hosted on sites unaffiliated with 3SEARCH Capital). As such, 3SEARCH Capital makes no representations or endorsements whatsoever regarding any third-party content/sites that may be accessible directly or indirectly from this site. 3SEARCH Capital services are only directed toward the residents of jurisdictions where such services are permitted. Some services may be limited to residents of certain jurisdictions, and disclosures may be required in specific jurisdictions, <a href="#" className="underline">available here</a>. Use of the site is subject to certain risks, including but not limited to those <a href="#" className="underline">listed here</a>. Assets offered on the platform are not insured by the FDIC, SIPC, or any similar organization. Users must conduct their own due diligence of any digital asset. Participating in digital assets is highly risky and may lead to total loss of funds. By using this site, you explicitly agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>. 3SEARCH Capital and its employees, officers, directors, and affiliates may have interests in assets listed on this site and may also participate in certain offerings using the sit
          </p>
          
          <p className="text-[12px] text-[#949494]">
            * Not available in all jurisdictions. Past rewards are not an indicator of future results.
          </p>

          <p className="text-[12px] font-medium text-[#111111] pt-4">
            Copyright © 2025 3SEARCH Capital
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;