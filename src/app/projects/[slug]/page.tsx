"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  ArrowLeft, 
  ExternalLink, 
  Lock, 
  Globe, 
  Twitter, 
  MessageSquare,
  Send,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/sections/navigation';
import Footer from '@/components/sections/coinlist-footer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getRoundDerivedState } from '@/lib/round-status';
import { formatTokenAmount } from '@/lib/format';

interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  cover_image_url: string;
  logo_image_url: string;
  token_icon_url?: string;
  status: string;
  target_amount: number;
  current_amount: number;
  max_allocation: string;
  token_price: string;
  token_sale_info: string;
  network: string;
  ticker: string;
  website_url: string;
  twitter_url: string;
  discord_url: string;
  telegram_url: string;
  whitepaper_url: string;
  wallet_address?: string;
  end_date?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const slug = params?.slug as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isCheckingWl, setIsCheckingWl] = useState(false);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);

  const toNum = (v: any) => {
    const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0;
    return Number.isFinite(n) ? n : 0;
  };

  const getChainIdForNetwork = (network: string) => {
    switch (network) {
      case 'Ethereum': return 1;
      case 'Arbitrum': return 42161;
      case 'Polygon': return 137;
      case 'Base': return 8453;
      case 'BSC': return 56;
      case 'Sepolia': return 11155111;
      case 'Arbitrum Sepolia': return 421614;
      case 'Amoy': return 80002;
      case 'Base Sepolia': return 84532;
      case 'BSC Testnet': return 97;
      default: return null;
    }
  };


  useEffect(() => {
    if (!slug) return;
    
    const supabase = createClient();
    let mounted = true;
    
    async function fetchProjectAndAccess() {
      try {
        // Fetch project data first (doesn't require auth)
        const { data: projectData, error } = await supabase
          .from('project_rounds')
          .select(`
            id, name, slug, tagline, description, cover_image_url, logo_image_url, 
            token_icon_url, status, target_amount, current_amount, max_allocation, 
            token_price, token_sale_info, network, ticker, website_url, twitter_url, 
            discord_url, telegram_url, whitepaper_url, wallet_address, end_date
          `)
          .eq('slug', slug)
          .single();

        if (!mounted) return;
        
        if (error || !projectData) {
          setIsLoading(false);
          return;
        }

        setProject(projectData);

        // Use getSession for faster local check first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) setIsLoading(false);
          return;
        }
        
        const user = session.user;
        if (mounted) setUser(user);

        // Run independent checks in parallel
        const [purchasesRes, profileRes, whitelistRes] = await Promise.all([
          supabase
            .from('round_applications')
            .select('amount, status, token_symbol, network, transaction_hash, usd_amount')
            .eq('round_id', projectData.id)
            .eq('user_id', user.id)
            .in('status', ['completed', 'pending']),
          supabase
            .from('profiles')
            .select('approved, has_inner_circle_role')
            .eq('id', user.id)
            .single(),
          address ? supabase
            .from('project_whitelists')
            .select('id')
            .eq('project_id', projectData.id)
            .eq('wallet_address', address.toLowerCase()) // Case-sensitive exact match on lowercase address (Issue 4)
            .maybeSingle() : Promise.resolve({ data: null })
        ]);

        if (!mounted) return;
        
        if (purchasesRes.data) setUserPurchases(purchasesRes.data);
        
        const profile = profileRes.data;
        if (profile?.approved || profile?.has_inner_circle_role || whitelistRes.data) {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('[Project] Error fetching details:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    fetchProjectAndAccess();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Refetch data when user signs in
        fetchProjectAndAccess();
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setHasAccess(false);
        }
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [slug, address]);

  // If user navigates away from /enter before confirmation, pending txs can get stuck.
  // Reconcile them here by checking the receipt on the correct chain and updating DB.
  // Must stay ABOVE early returns to avoid changing hook order between renders.
  useEffect(() => {
    if (!project?.id) return;

    const pendingPurchases = userPurchases.filter((p) => p.status === 'pending');
    if (pendingPurchases.length === 0) return;

    let cancelled = false;

    async function reconcilePending() {
      const supabase = createClient();

      for (const p of pendingPurchases) {
        if (cancelled) return;
        if (!p.transaction_hash || !p.network) continue;

        const chainId = getChainIdForNetwork(p.network);
        if (!chainId) continue;

        try {
          // Server-side fetch avoids RPC CORS/429 issues in the browser.
          const receiptRes = await fetch(
            `/api/tx/receipt?chainId=${chainId}&hash=${encodeURIComponent(p.transaction_hash)}`
          );
          const receiptJson = await receiptRes.json();
          if (!receiptRes.ok) continue;
          if (receiptJson?.status !== 'success') continue;

          // Flip pending -> completed exactly once
          const { data: updatedApp } = await supabase
            .from('round_applications')
            .update({ status: 'completed' })
            .eq('transaction_hash', p.transaction_hash)
            .eq('status', 'pending')
            .select('usd_amount')
            .maybeSingle();

          if (!updatedApp) continue; // already completed elsewhere

          const usd = updatedApp.usd_amount != null ? toNum(updatedApp.usd_amount) : toNum(p.usd_amount);

          // Increment round current_amount once
          const { data: roundRow } = await supabase
            .from('project_rounds')
            .select('current_amount, target_amount, status')
            .eq('id', project.id)
            .single();

          const cur = toNum(roundRow?.current_amount);
          const target = toNum(roundRow?.target_amount);
          const newAmount = cur + usd;
          // Use 0.01% tolerance for floating point comparison
          const tolerance = target * 0.0001;
          const shouldComplete = target > 0 && newAmount >= (target - tolerance) && roundRow?.status !== 'completed';

          await supabase
            .from('project_rounds')
            .update({ 
              current_amount: newAmount, 
              ...(shouldComplete ? { status: 'completed', completed_at: new Date().toISOString() } : {}) 
            })
            .eq('id', project.id);

          // Update local UI
          if (!cancelled) {
            setProject(prev => prev ? { ...prev, current_amount: newAmount, ...(shouldComplete ? { status: 'completed' } : {}) } : prev);
            setUserPurchases(prev => prev.map(x => x.transaction_hash === p.transaction_hash ? { ...x, status: 'completed', usd_amount: usd } : x));
          }
        } catch {
          // Ignore; will retry on next render/load
        }
      }
    }

    reconcilePending();
    const interval = setInterval(reconcilePending, 15000); // keep it fresh while user is on page

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [project?.id, userPurchases]);

  if (isLoading || (address && isCheckingWl)) {
    return (
      <main className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-10 w-10" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project not found</h1>
            <Link href="/projects" className="text-blue-600 hover:underline">
              Back to projects
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const { isClosed, displayStatus } = getRoundDerivedState({
    status: project?.status,
    end_date: project?.end_date,
    current_amount: project?.current_amount,
    target_amount: project?.target_amount,
  });

  const getExplorerUrl = (network: string, txHash: string) => {
    const baseUrl =
      network === 'Arbitrum' ? 'https://arbiscan.io' :
      network === 'Arbitrum Sepolia' ? 'https://sepolia.arbiscan.io' :
      network === 'BSC' ? 'https://bscscan.com' :
      network === 'BSC Testnet' ? 'https://testnet.bscscan.com' :
      network === 'Polygon' ? 'https://polygonscan.com' :
      network === 'Amoy' ? 'https://amoy.polygonscan.com' :
      network === 'Base' ? 'https://basescan.org' :
      network === 'Base Sepolia' ? 'https://sepolia.basescan.org' :
      network === 'Sepolia' ? 'https://sepolia.etherscan.io' :
      'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  };

  const getEstimatedUsd = (symbol: string, amount: number) => {
    const rates: Record<string, number> = {
      'ETH': 2500,
      'BNB': 600,
      'POL': 0.8,
      'USDC': 1,
      'USDT': 1
    };
    return amount * (rates[symbol] || 1);
  };

  const completedPurchases = userPurchases.filter((p) => p.status === 'completed');
  const pendingPurchases = userPurchases.filter((p) => p.status === 'pending');
  const pendingUsdTotal = pendingPurchases.reduce((acc, p) => {
    const amountNum = toNum(p.amount);
    const usd = p.usd_amount != null ? toNum(p.usd_amount) : getEstimatedUsd(p.token_symbol, amountNum);
    return acc + usd;
  }, 0);

  return (
    <main className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navigation />
      
      <div className="flex-1">
          <div className="relative h-[400px] w-full overflow-hidden">
            {project.cover_image_url && project.cover_image_url !== "" ? (
              <Image
                src={project.cover_image_url}
                alt={project.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-200" />
            )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="container mx-auto max-w-[1200px]">
              <Link 
                href="/projects" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Link>
              
              <div className="flex items-end gap-8">
                <div className="h-32 w-32 overflow-hidden rounded-3xl bg-white border-4 border-white shadow-2xl shrink-0 flex items-center justify-center">
                  {project.logo_image_url ? (
                    <Image
                      src={project.logo_image_url}
                      alt={`${project.name} logo`}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-slate-300">{project.name[0]}</span>
                    </div>
                  )}
                </div>
                
                <div className="pb-2">
                  <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{project.name}</h1>
                    {project.ticker && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white font-bold text-sm tracking-wider">
                        ${project.ticker}
                      </span>
                    )}
                  </div>
                  <p className="text-xl text-white/90 font-medium max-w-2xl">{project.tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-[1200px] px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">About {project.name}</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{project.description}</p>
                </div>
                
                  <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-gray-50">
                    {project.website_url && (
                      <a href={project.website_url} target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-black hover:bg-slate-100 transition-all font-semibold text-sm">
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                    {project.twitter_url && (
                      <a href={project.twitter_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-black hover:bg-slate-100 transition-all font-semibold text-sm">
                        <Twitter className="w-4 h-4" /> Twitter
                      </a>
                    )}
                    {project.discord_url && (
                      <a href={project.discord_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-black hover:bg-slate-100 transition-all font-semibold text-sm">
                        <MessageSquare className="w-4 h-4" /> Discord
                      </a>
                    )}
                    {project.telegram_url && (
                      <a href={project.telegram_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-black hover:bg-slate-100 transition-all font-semibold text-sm">
                        <Send className="w-4 h-4" /> Telegram
                      </a>
                    )}
                    {project.whitepaper_url && (
                      <a href={project.whitepaper_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-black hover:bg-slate-100 transition-all font-semibold text-sm">
                        <FileText className="w-4 h-4" /> Whitepaper
                      </a>
                    )}
                  </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm sticky top-8">
                <div className="flex items-center justify-between mb-8">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    displayStatus === 'Live' || displayStatus === 'Allowlist Open'
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {displayStatus}
                  </span>
                  {project.network && (
                    <span className="text-sm font-bold text-slate-400 tracking-tight">{project.network}</span>
                  )}
                </div>

                {hasAccess ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Round Progress</span>
                          <span className="text-slate-900 font-extrabold text-sm">
                            {project.target_amount > 0 
                              ? `${((Number(project.current_amount || 0) / Number(project.target_amount)) * 100).toFixed(1)}%`
                              : '0%'}
                          </span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
                          <div 
                            className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                            style={{ 
                              width: project.target_amount > 0 
                                ? `${Math.min(100, (Number(project.current_amount || 0) / Number(project.target_amount)) * 100)}%`
                                : '0%'
                            }} 
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>Raised: ${Number(project.current_amount || 0).toLocaleString()}</span>
                          <span>Goal: ${Number(project.target_amount).toLocaleString()}</span>
                        </div>
                      </div>

                      {userPurchases.length > 0 && (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100/50">
                          <h4 className="text-emerald-900 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Your Contribution
                          </h4>
                          <div className="space-y-3">
                              {userPurchases.map((p, i) => {
                                const amountNum = toNum(p.amount);
                                const displayUsd = p.usd_amount != null ? toNum(p.usd_amount) : getEstimatedUsd(p.token_symbol, amountNum);
                                return (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-emerald-700 font-medium flex items-center gap-2">
                                      <span>
                                        {formatTokenAmount(amountNum, p.token_symbol)} {p.token_symbol}
                                        {` ($${displayUsd.toLocaleString()})`}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                      }`}>
                                        {p.status}
                                      </span>
                                    </span>
                                    <a 
                                      href={getExplorerUrl(p.network, p.transaction_hash)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-500 hover:text-emerald-700"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                );
                              })}
                              <div className="pt-3 border-t border-emerald-100 flex justify-between items-center font-bold text-emerald-900">
                                <span>Total USD (Confirmed)</span>
                                <span>
                                  ${completedPurchases.reduce((acc, p) => {
                                    const amountNum = toNum(p.amount);
                                    const usd = p.usd_amount != null ? toNum(p.usd_amount) : getEstimatedUsd(p.token_symbol, amountNum);
                                    return acc + usd;
                                  }, 0).toLocaleString()}
                                </span>
                              </div>
                              {pendingPurchases.length > 0 && (
                                <div className="flex justify-between items-center font-bold text-amber-900">
                                  <span>Pending USD</span>
                                  <span>${pendingUsdTotal.toLocaleString()}</span>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Fundraise Goal</span>
                        <span className="font-extrabold text-slate-900">${project.target_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Token Price</span>
                        <span className="font-extrabold text-slate-900">{project.token_price || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-50">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Max Allocation</span>
                        <span className="font-extrabold text-slate-900">{project.max_allocation || 'TBA'}</span>
                      </div>
                      {project.wallet_address && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Payment Wallet</span>
                          <a 
                            href={`https://${project.network === 'Arbitrum' ? 'arbiscan.io' : 'etherscan.io'}/address/${project.wallet_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline"
                          >
                            {project.wallet_address.slice(0, 6)}...{project.wallet_address.slice(-4)}
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Token Sale</span>
                        <span className="font-extrabold text-slate-900">{project.token_sale_info || 'TBA'}</span>
                      </div>
                    </div>

                    {!isClosed && (project.status === 'active' || project.status === 'Allowlist Open') && (
                      <Button 
                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                        onClick={() => router.push(`/projects/${slug}/enter`)}
                      >
                        Enter Round
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-7 h-7 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">Access Required</h3>
                    <p className="text-slate-500 mb-8 font-medium">
                      {user 
                        ? "Your account is pending approval. You'll receive access once approved by the team."
                        : "Sign in to view round details and participate."}
                    </p>
                    {!user && (
                      <Link href="/">
                        <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
