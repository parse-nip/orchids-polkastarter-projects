"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { RefreshCcw, Loader2 } from 'lucide-react';

const TokenSales = () => {
  const [featuredProject, setFeaturedProject] = useState<any>(null);
  const [closedSales, setClosedSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const assets = {
    rainbowLogo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-coinlist-co/assets/images/featuredtoken-08b151d4636b5c7340587a364bd82f72d671-5.png",
    arrowIcon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b60f07b-c202-4cfe-b381-c2ca971a98cf-coinlist-co/assets/svgs/uparrow-30e7fd7ac41d0e7f35d1f31dab82b4828d16edcb04-1.svg",
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const timeout = 45000;

      // Helper for timed promise
      const timed = async (promise: Promise<any>) => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        );
        return Promise.race([promise, timeoutPromise]);
      };

      // Fetch the most recent active project as featured
      const activePromise = supabase
        .from('project_rounds')
        .select('id, name, tagline, description, end_date, logo_image_url, slug')
        .eq('status', 'active')
        .gt('end_date', now)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch the 3 most recent closed projects
      const closedPromise = supabase
        .from('project_rounds')
        .select('id, name, logo_image_url, slug, end_date')
        .or(`status.eq.completed,end_date.lt.${now}`)
        .order('end_date', { ascending: false })
        .limit(3);

      const [activeResult, closedResult] = await Promise.all([
        timed(activePromise),
        timed(closedPromise)
      ]);

      if (activeResult.error) throw activeResult.error;
      if (closedResult.error) throw closedResult.error;

      if (activeResult.data && activeResult.data.length > 0) {
        setFeaturedProject(activeResult.data[0]);
      } else {
        setFeaturedProject(null);
      }

      if (closedResult.data) {
        setClosedSales(closedResult.data.map((p: any) => ({
          name: `${p.name} Token Sale`,
          icon: p.logo_image_url || assets.rainbowLogo,
          status: "Closed",
          href: `/projects/${p.slug}`,
        })));
      }
    } catch (err: any) {
      console.error('Failed to fetch projects for homepage:', err);
      setError(err.message === 'Timeout' 
        ? 'Connection timed out. Our database might be waking up.' 
        : 'Failed to synchronize with market data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, retryCount]);

  if (loading) {
    return (
      <section className="bg-white py-[120px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#00d1ff] animate-spin" />
          <p className="mt-4 text-slate-400 font-medium">Loading projects...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-[120px]">
        <div className="container mx-auto px-8 max-w-[1248px] flex flex-col items-center">
          <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] max-w-md text-center">
            <RefreshCcw className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sync Error</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 mx-auto"
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
    <section className="bg-white pt-[120px] pb-[60px]">
      <div className="container mx-auto px-8 max-w-[1248px]">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-[48px] font-semibold tracking-[-0.01em] leading-[1.2] mb-4 text-[#000000]">
            Token Sales
          </h2>
          <p className="text-[20px] text-[#949494] font-normal leading-normal">
            Get tokens before they list anywhere else
          </p>
        </div>

        {/* Featured Card */}
        {featuredProject ? (
          <div className="mb-6 group">
            <a 
              href={`/projects/${featuredProject.slug}`} 
              className="block relative overflow-hidden rounded-[16px] min-h-[460px] bg-black"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              }}
            >
              <div 
                className="absolute inset-0 opacity-40 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle at 70% 50%, #4a1d96, #2d1b69, transparent)',
                }}
              />
              
              <div className="relative z-10 p-12 flex flex-col md:flex-row items-center md:items-stretch justify-between h-full min-h-[460px]">
                <div className="flex flex-col justify-between max-w-[500px] w-full pt-4 pb-4">
                  <div>
                    <h3 className="text-[64px] font-bold text-white leading-[1.1] mb-8 tracking-tight">
                      {featuredProject.name}<br />Token Sale
                    </h3>
                    <div className="space-y-1">
                      <p className="text-[20px] text-white opacity-90 font-medium leading-normal m-0 p-0">
                        {featuredProject.tagline || featuredProject.description}
                      </p>
                      <p className="text-[16px] text-white opacity-60 font-medium leading-normal m-0 p-0">
                        Sale ends {new Date(featuredProject.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-12 md:mt-auto">
                    <span className="inline-block bg-white text-black px-[32px] py-[14px] rounded-full font-semibold text-[16px] transition-transform duration-200 group-hover:scale-[1.02]">
                      Purchase
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex flex-1 justify-end items-center pr-8">
                  <div className="relative w-[340px] h-[340px] transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                    <Image 
                      src={featuredProject.logo_image_url || assets.rainbowLogo} 
                      alt={featuredProject.name} 
                      fill
                      className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </a>
          </div>
        ) : (
          <div className="mb-6 py-20 text-center bg-slate-50 rounded-[16px] border border-slate-100">
            <p className="text-slate-400 font-medium">No active token sales at the moment.</p>
          </div>
        )}

        {/* Closed Sales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {closedSales.map((sale, index) => (
            <a
              key={index}
              href={sale.href}
              className="flex items-center justify-between p-6 bg-white border border-[#ebebeb] rounded-[16px] hover:shadow-soft transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image 
                    src={sale.icon} 
                    alt={sale.name} 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] font-semibold text-[#000000]">
                    {sale.name}
                  </span>
                  <span className="text-[14px] font-medium text-[#949494]">
                    {sale.status}
                  </span>
                </div>
              </div>
              <div className="w-[18px] h-[18px] opacity-20 group-hover:opacity-100 transition-opacity">
                <Image src={assets.arrowIcon} alt="Go" width={18} height={18} />
              </div>
            </a>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <a
            href="/projects"
            className="w-full text-center py-4 bg-[#f0f0f0] text-[#404040] rounded-full font-semibold text-[16px] hover:bg-[#e5e5e5] transition-colors"
          >
            View All
          </a>
        </div>
      </div>
    </section>
  );
};

export default TokenSales;
