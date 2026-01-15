"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { getRoundDerivedState } from '@/lib/round-status';

interface ProjectCardProps {
  title: string;
  description: string;
  tagline?: string;
  coverImage: string;
  logoImage: string;
  status: string;
  fundraiseGoal: string;
  maxAllocation: string;
  tokenSale: string;
  href: string;
}

const ProjectCard = ({
  title,
  description,
  tagline,
  coverImage,
  logoImage,
  status,
  fundraiseGoal,
  maxAllocation,
  tokenSale,
  href,
}: ProjectCardProps) => {
  const isAllowlistOpen = status === 'active' || status === 'Allowlist Open' || status === 'Live';

  return (
    <a 
      href={href}
      className="group block relative overflow-hidden rounded-[24px] bg-white border border-[#f3f4f6] transition-all duration-300 hover:shadow-soft"
    >
      <div className="relative h-[211px] w-full overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide ${
              isAllowlistOpen 
              ? 'bg-[#10B981] text-white' 
              : 'bg-black/40 backdrop-blur-md text-white'
            }`}>
              {status}
            </span>
        </div>
      </div>

      {/* Logo Overlay */}
      <div className="absolute top-[171px] left-6 z-10">
        <div className="h-20 w-20 overflow-hidden rounded-[20px] bg-white border-[3px] border-white shadow-sm">
          {logoImage ? (
            <Image
              src={logoImage}
              alt={`${title} logo`}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-200">{title[0]}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[24px] font-bold text-black tracking-tight">{title}</h2>
          {isAllowlistOpen && (
             <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-100">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00d1ff]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
             </div>
          )}
        </div>
        
        <p className="text-[#6b7280] text-[15px] leading-relaxed mb-8 line-clamp-2 min-h-[45px]">
          {tagline || description}
        </p>

        <div className="space-y-4 pt-4 border-t border-[#f3f4f6]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6b7280]">Fundraise Goal</span>
            <div className="flex-1 mx-4 border-b border-dotted border-gray-200" />
            <span className="text-[15px] font-bold text-black">{fundraiseGoal}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6b7280]">Max allocation</span>
            <div className="flex-1 mx-4 border-b border-dotted border-gray-200" />
            <span className="text-[15px] font-bold text-black">{maxAllocation}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#f3f4f6]">
          <p className="text-[13px] font-medium text-[#6b7280] mb-1">Token Sale</p>
          <p className="text-[15px] font-bold text-black">{tokenSale}</p>
        </div>
      </div>
    </a>
  );
};

export default function UpcomingProjects() {
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProjects = useCallback(async (isRetry = false) => {
    setLoading(true);
    if (!isRetry) setError(null);
    
    try {
      const supabase = createClient();
      
      // Calculate 24 hours ago for filtering recently completed projects
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error: fetchError } = await supabase
        .from('project_rounds')
        .select('id, name, description, tagline, cover_image_url, logo_image_url, status, target_amount, current_amount, max_allocation, token_sale_info, slug, end_date, completed_at')
        .or(`status.neq.completed,completed_at.gte.${twentyFourHoursAgo}`)
        .order('created_at', { ascending: false });

      // If we get an auth error and this isn't already a retry, wait briefly and try again
      // This handles the case where the session token was stale and is being refreshed
      if (fetchError?.message?.includes('JWT') || fetchError?.code === 'PGRST301') {
        if (!isRetry) {
          console.info('Auth token might be refreshing, retrying in 1s...');
          setTimeout(() => fetchProjects(true), 1000);
          return;
        }
        throw fetchError;
      }

      if (fetchError) throw fetchError;

      if (data) {
        setProjects(data.map((p: any) => {
          const { displayStatus } = getRoundDerivedState({
            status: p.status,
            end_date: p.end_date,
            current_amount: p.current_amount,
            target_amount: p.target_amount,
          });
          
          return {
            title: p.name,
            description: p.description,
            tagline: p.tagline,
            coverImage: p.cover_image_url,
            logoImage: p.logo_image_url,
            status: displayStatus,
            fundraiseGoal: `$${(p.target_amount || 0).toLocaleString()}`,
            maxAllocation: p.max_allocation || 'TBA',
            tokenSale: p.token_sale_info || 'TBA',
            href: `/projects/${p.slug}`
          };
        }));
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to synchronize with market data. The database might be waking up.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, retryCount]);

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto max-w-[1440px] flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-[#00d1ff] animate-spin" />
          <p className="mt-4 text-slate-400 font-medium">Loading projects...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto max-w-[1440px] flex flex-col items-center justify-center text-center">
          <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] max-w-md">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCcw className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sync Error</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="container px-6 mx-auto max-w-[1440px]">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-[40px] font-black text-black tracking-tight leading-none mb-4">
              Upcoming Projects
            </h2>
            <div className="h-1.5 w-20 bg-[#00d1ff] rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <div className="text-slate-300 font-mono text-sm tracking-widest uppercase mb-4">No Active Rounds Found</div>
              <p className="text-slate-400">Stay tuned for upcoming token sales.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
