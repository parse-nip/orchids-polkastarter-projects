
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type PastProjectRow = {
  id: string;
  name: string;
  slug: string;
  ticker: string | null;
  logo_image_url: string | null;
  token_sale_info: string | null;
  target_amount: number | null;
  end_date: string | null;
  network: string | null;
};

const CHAIN_FILTERS = [
  'All',
  'Ethereum',
  'BNB Chain',
  'Polygon',
  'Celo',
  'Avalanche',
  'Arbitrum',
  'Base',
  'Sepolia',
  'Amoy',
  'BSC Testnet',
  'Sei',
  'Mode',
] as const;

const CHAIN_TO_NETWORK: Record<(typeof CHAIN_FILTERS)[number], string | null> = {
  All: null,
  Ethereum: 'Ethereum',
  'BNB Chain': 'BSC',
  Polygon: 'Polygon',
  Celo: 'Celo',
  Avalanche: 'Avalanche',
  Arbitrum: 'Arbitrum',
  Base: 'Base',
  Sepolia: 'Sepolia',
  Amoy: 'Amoy',
  'BSC Testnet': 'BSC Testnet',
  Sei: 'Sei',
  Mode: 'Mode',
};

const NETWORK_ICON: Record<string, string> = {
  Ethereum: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  Arbitrum: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  Polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  Base: 'https://assets.coingecko.com/coins/images/27508/large/base.png',
  BSC: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  Sepolia: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'Arbitrum Sepolia': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  Amoy: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'Base Sepolia': 'https://assets.coingecko.com/coins/images/27508/large/base.png',
  'BSC Testnet': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  Celo: 'https://cryptologos.cc/logos/celo-celo-logo.png',
  Avalanche: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  Sei: 'https://cryptologos.cc/logos/sei-sei-logo.png',
  Mode: 'https://assets.coingecko.com/coins/images/34816/large/mode.png',
};

function InlineSearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function InlineChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const FundedProjectsTable = () => {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<PastProjectRow[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [chain, setChain] = useState<(typeof CHAIN_FILTERS)[number]>('All');

  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;

    async function fetchPast() {
      setLoading(true);
      try {
        const q = search.trim();
        const selectedNetwork = CHAIN_TO_NETWORK[chain];

        let query = supabase
          .from('project_rounds')
          .select('id, name, slug, ticker, logo_image_url, token_sale_info, target_amount, end_date, network', { count: 'exact' })
          .eq('status', 'completed')
          .order('end_date', { ascending: false, nullsFirst: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (selectedNetwork) {
          query = query.eq('network', selectedNetwork);
        }

        if (q) {
          // Note: keep this in sync with the selected columns above.
          query = query.or(`name.ilike.%${q}%,ticker.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!cancelled) {
          setProjects((data as any) || []);
          setHasMore(((data as any)?.length || 0) === PAGE_SIZE);
        }
      } catch (e) {
        console.error('[FundedProjectsTable] fetch error', e);
        if (!cancelled) {
          setProjects([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPast();
    return () => {
      cancelled = true;
    };
  }, [supabase, page, search, chain]);

  const rows = projects.map((p) => {
    const ended = p.end_date ? new Date(p.end_date) : null;
    const endedDate = ended
      ? ended.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : 'TBA';
    const endedTime = ended ? ended.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : '—';

    const raisingGoal = `$${Number(p.target_amount || 0).toLocaleString()}`;
    const type = p.token_sale_info || 'Token Sale';
    const athSinceIdo = 'TBA';
    const network = p.network || '';
    const chainIcon = network ? NETWORK_ICON[network] : undefined;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      ticker: p.ticker ? `$${p.ticker}` : '',
      logo: p.logo_image_url || '',
      type,
      raisingGoal,
      athSinceIdo,
      endedDate,
      endedTime,
      chainIcons: chainIcon ? [chainIcon] : [],
    };
  });

  return (
    <section className="w-full bg-white pt-16 pb-20">
      <div className="container mx-auto px-6">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <h2 className="text-[2.5rem] font-bold leading-tight tracking-tight text-black mb-1">Funded Projects</h2>
            <p className="text-[1.125rem] text-[#6B7280]">We bring new technologies to our community</p>
          </div>
            
          </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <input 
              type="text" 
              placeholder="Search by project name, token contract, address or token symbol"
              className="w-full h-[52px] pl-12 pr-4 bg-white border border-[#F3F4F6] rounded-full text-[0.93rem] focus:outline-none focus:ring-2 focus:ring-[#00D1FF]"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
            />
            <InlineSearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CHAIN_FILTERS.map((c, idx) => (
              <button 
                key={c}
                onClick={() => {
                  setPage(0);
                  setChain(c);
                }}
                className={`whitespace-nowrap h-[42px] px-6 rounded-full text-[0.93rem] font-medium transition-colors ${
                  chain === c ? 'bg-[#F3F4F6] text-black' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full border border-[#F3F4F6] rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white">
                  <th className="py-6 px-8 text-[0.81rem] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6]">Project name</th>
                  <th className="py-6 px-4 text-[0.81rem] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6]">Type</th>
                  <th className="py-6 px-4 text-[0.81rem] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6]">Raising goal</th>
                  <th className="py-6 px-4 text-[0.81rem] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6]">ATH since IDO</th>
                  <th className="py-6 px-4 text-[0.81rem] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6] min-w-[180px]">
                    <div className="flex items-center gap-1">Ended in <InlineChevronDown className="w-4 h-4" /></div>
                  </th>
                  <th className="py-6 px-8 text-[0.81rem] font-medium text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6] text-right">Chains</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-10 px-8 text-[#6B7280]" colSpan={6}>
                      Loading past projects...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="py-10 px-8 text-[#6B7280]" colSpan={6}>
                      No past projects found.
                    </td>
                  </tr>
                ) : rows.map((project, index) => (
                  <tr key={index} className="group hover:bg-[#F9FAFB] transition-colors border-b border-[#F3F4F6] last:border-none">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#F3F4F6]">
                          {project.logo ? (
                            <Image 
                              src={project.logo} 
                              alt={project.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] font-bold">
                              {project.name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[0.93rem] font-bold text-black leading-tight">{project.name}</p>
                          <p className="text-[0.81rem] text-[#6B7280]">{project.ticker}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-[0.81rem] font-medium text-[#00D1FF] bg-[#F5FDFF] px-3 py-1 rounded-full border border-[#E0F7FF]">
                        {project.type}
                      </span>
                    </td>
                    <td className="py-5 px-4 font-bold text-black text-[0.93rem]">
                      {project.raisingGoal}
                    </td>
                    <td className="py-5 px-4 font-bold text-black text-[0.93rem]">
                      {project.athSinceIdo}
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-[0.93rem] font-medium text-black">{project.endedDate}</span>
                        <span className="text-[0.81rem] text-[#9CA3AF] font-medium">{project.endedTime}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-1">
                        {project.chainIcons.map((icon, idx) => (
                          <div key={idx} className="w-6 h-6 relative">
                            <Image src={icon} alt="chain" fill className="object-contain opacity-60" />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className="text-[0.93rem] font-medium text-black">Page {page + 1}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F3F4F6] text-black disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F3F4F6] text-black disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundedProjectsTable;