"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/sections/navigation';
import Footer from '@/components/sections/coinlist-footer';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import WhitelistManager from '@/components/admin/whitelist-manager';
import { formatTokenAmount } from '@/lib/format';
import { 
  LayoutDashboard, 
  Plus, 
  Edit2, 
  Download, 
  Search, 
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Upload,
  ImageIcon,
  Globe,
  Twitter,
  MessageSquare,
  Send,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  start_date: string;
  end_date: string;
  target_amount: number;
  current_amount: number;
  status: string;
  cover_image_url?: string;
  logo_image_url?: string;
  token_icon_url?: string;
  max_allocation?: string;
  token_price?: string;
  token_sale_info?: string;
  network?: string;
  ticker?: string;
  website_url?: string;
  twitter_url?: string;
  discord_url?: string;
  telegram_url?: string;
  whitepaper_url?: string;
  wallet_address?: string;
  default_min_investment?: number;
  default_max_investment?: number;
}

interface Purchase {
  id: string;
  user_id: string;
  round_id: string;
  wallet_address: string;
  email: string;
  transaction_hash: string;
  status: string;
  amount: number;
  usd_amount?: number;
  created_at: string;
  token_symbol: string;
  network: string;
  project_rounds: {
    name: string;
  };
  profiles: {
    email: string;
  };
}

const NETWORK_CHAIN_IDS: Record<string, number> = {
  'Ethereum': 1,
  'Arbitrum': 42161,
  'Polygon': 137,
  'Base': 8453,
  'BSC': 56,
  'Sepolia': 11155111,
  'Arbitrum Sepolia': 421614,
  'Amoy': 80002,
  'Base Sepolia': 84532,
  'BSC Testnet': 97
};

const NETWORKS = [
  { value: 'Ethereum', label: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', symbol: 'ETH' },
  { value: 'Arbitrum', label: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', symbol: 'ARB' },
  { value: 'Polygon', label: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', symbol: 'MATIC' },
  { value: 'Base', label: 'Base', icon: 'https://assets.coingecko.com/coins/images/27508/large/base.png', symbol: 'BASE' },
  { value: 'BSC', label: 'BSC', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', symbol: 'BNB' },
  { value: 'Sepolia', label: 'Sepolia', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', symbol: 'ETH' },
  { value: 'Arbitrum Sepolia', label: 'Arbitrum Sepolia', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', symbol: 'ARB' },
  { value: 'Amoy', label: 'Amoy', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', symbol: 'MATIC' },
  { value: 'Base Sepolia', label: 'Base Sepolia', icon: 'https://assets.coingecko.com/coins/images/27508/large/base.png', symbol: 'BASE' },
  { value: 'BSC Testnet', label: 'BSC Testnet', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', symbol: 'BNB' },
];

const PAGE_SIZE = 10;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'purchases'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [whitelistingProject, setWhitelistingProject] = useState<Project | null>(null);
  const [selectedPurchaseProjectId, setSelectedPurchaseProjectId] = useState<string>('all');
  const [supabase] = useState(() => createClient());
  
  // Pagination states
  const [projectsPage, setProjectsPage] = useState(0);
  const [purchasesPage, setPurchasesPage] = useState(0);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [hasMorePurchases, setHasMorePurchases] = useState(true);

  // Image states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingTokenIcon, setUploadingTokenIcon] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [tokenIconUrl, setTokenIconUrl] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const { address: adminAddress } = useAccount();

  const saveProjectToDatabase = async (projectData: any) => {
    try {
      if (editingProject) {
        const res = await fetch('/api/admin/project-rounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'update',
            id: editingProject.id,
            projectData,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          toast.error(`Failed to update round: ${json?.error || 'Unknown error'}`);
          return;
        }

        toast.success('Round updated successfully');
        fetchData();
      } else {
        const res = await fetch('/api/admin/project-rounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'create',
            projectData,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          toast.error(`Failed to create round: ${json?.error || 'Unknown error'}`);
          return;
        }

        toast.success('Round created successfully');
        fetchData();
      }
      setShowProjectModal(false);
      setEditingProject(null);
      // Reset image URLs
      setCoverUrl(null);
      setLogoUrl(null);
      setTokenIconUrl(null);
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(`Failed to save round: ${err.message || 'Unknown error'}`);
    }
  };

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const tokenIconInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = async () => {
    try {
      // Fetch all purchases (not just current page)
      let purchasesQuery = supabase
        .from('round_applications')
        .select(`
          id, user_id, round_id, wallet_address, amount, usd_amount, status, created_at, token_symbol, network, transaction_hash,
          project_rounds (name),
          profiles!round_applications_user_id_fkey (email)
        `)
        .order('created_at', { ascending: false });

      if (selectedPurchaseProjectId !== 'all') {
        purchasesQuery = purchasesQuery.eq('round_id', selectedPurchaseProjectId);
      }

      const { data: allPurchases, error } = await purchasesQuery;

      if (error) throw error;

      if (!allPurchases || allPurchases.length === 0) {
        toast.error('No purchases to export');
        return;
      }

      // Convert to CSV
      const headers = ['Date', 'Buyer Email', 'Project', 'Wallet Address', 'Token Amount', 'Token Symbol', 'USD Amount', 'Status', 'Network', 'Transaction Hash'];
      const rows = allPurchases.map((p: any) => [
        new Date(p.created_at).toLocaleString(),
        p.profiles?.email || p.email || '',
        p.project_rounds?.name || '',
        p.wallet_address || '',
        p.amount || 0,
        p.token_symbol || '',
        p.usd_amount || '',
        p.status || '',
        p.network || '',
        p.transaction_hash || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape commas and quotes in CSV
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `purchases-${selectedPurchaseProjectId === 'all' ? 'all' : selectedPurchaseProjectId}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${allPurchases.length} purchases to CSV`);
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error(`Export failed: ${err.message}`);
    }
  };

  const fetchData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 45000)
      );
      
      const fetchProjects = supabase
        .from('project_rounds')
        .select('*')
        .order('created_at', { ascending: false })
        .range(projectsPage * PAGE_SIZE, (projectsPage + 1) * PAGE_SIZE - 1);

      let purchasesQuery = supabase
        .from('round_applications')
        .select(`
          id, user_id, round_id, wallet_address, amount, usd_amount, status, created_at, token_symbol, network,
          project_rounds (name),
          profiles!round_applications_user_id_fkey (email)
        `)
        .order('created_at', { ascending: false })
        .range(purchasesPage * PAGE_SIZE, (purchasesPage + 1) * PAGE_SIZE - 1);

      if (selectedPurchaseProjectId !== 'all') {
        purchasesQuery = purchasesQuery.eq('round_id', selectedPurchaseProjectId);
      }

      const [projectsRes, purchasesRes] = await Promise.all([
        Promise.race([fetchProjects, timeoutPromise]) as any,
        Promise.race([purchasesQuery, timeoutPromise]) as any
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (purchasesRes.error) throw purchasesRes.error;

      setProjects(projectsRes.data || []);
      setPurchases((purchasesRes.data as any) || []);
      setHasMoreProjects((projectsRes.data?.length || 0) === PAGE_SIZE);
      setHasMorePurchases((purchasesRes.data?.length || 0) === PAGE_SIZE);
    } catch (err: any) {
      console.error('[Admin] Data fetch error:', err);
      toast.error(err?.message === 'Timeout' ? 'Admin data load timed out. Try a refresh.' : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, projectsPage, purchasesPage, selectedPurchaseProjectId]);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        // First try local session (fast), then subscribe to auth changes
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) setLoading(false);
          if (mounted) window.location.href = '/';
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (error || !profile?.is_admin) {
          if (mounted) setLoading(false);
          if (mounted) window.location.href = '/dashboard';
          return;
        }

        if (mounted) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('[Admin] Check error:', err);
        if (mounted) setLoading(false);
      }
    }

    checkAdmin();
    
    // Listen for auth state changes to handle token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      
      // Re-check admin status on session change
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (mounted) {
          setIsAdmin(!!profile?.is_admin);
        }
      }
    });
    
    return () => { 
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (editingProject) {
      setCoverUrl(editingProject.cover_image_url || null);
      setLogoUrl(editingProject.logo_image_url || null);
      setTokenIconUrl(editingProject.token_icon_url || null);
    } else {
      setCoverUrl(null);
      setLogoUrl(null);
      setTokenIconUrl(null);
    }
  }, [editingProject]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo' | 'token_icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'cover') setUploadingCover(true);
    else if (type === 'logo') setUploadingLogo(true);
    else setUploadingTokenIcon(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (type === 'cover') setCoverUrl(result.url);
      else if (type === 'logo') setLogoUrl(result.url);
      else setTokenIconUrl(result.url);
      
      toast.success(`${type} uploaded successfully`);
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`);
    } finally {
      if (type === 'cover') setUploadingCover(false);
      else if (type === 'logo') setUploadingLogo(false);
      else setUploadingTokenIcon(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (savingProject) return; // Prevent double submission
    setSavingProject(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const targetAmount = Number(formData.get('target_amount'));
      const walletAddress = formData.get('wallet_address') as string;
      const endDate = formData.get('end_date') as string;
      
      if (!name || !name.trim()) {
        toast.error('Project name is required');
        setSavingProject(false);
        return;
      }

      if (!targetAmount || targetAmount <= 0) {
        toast.error('Target amount must be greater than 0');
        setSavingProject(false);
        return;
      }

      if (!walletAddress || !walletAddress.trim()) {
        toast.error('Wallet address is required');
        setSavingProject(false);
        return;
      }
      
      const projectData = {
        name: name.trim(),
        slug: (formData.get('slug') as string)?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        tagline: (formData.get('tagline') as string)?.trim() || '',
        description: (formData.get('description') as string)?.trim() || '',
        target_amount: targetAmount,
        status: formData.get('status') as string || 'active',
        start_date: formData.get('start_date') as string || null,
        end_date: endDate || null,
        ticker: (formData.get('ticker') as string)?.trim() || '',
        network: formData.get('network') as string || 'Ethereum',
        token_price: (formData.get('token_price') as string)?.trim() || '',
        max_allocation: (formData.get('max_allocation') as string)?.trim() || '',
        token_sale_info: (formData.get('token_sale_info') as string)?.trim() || '',
        website_url: (formData.get('website_url') as string)?.trim() || '',
        twitter_url: (formData.get('twitter_url') as string)?.trim() || '',
        discord_url: (formData.get('discord_url') as string)?.trim() || '',
        telegram_url: (formData.get('telegram_url') as string)?.trim() || '',
        whitepaper_url: (formData.get('whitepaper_url') as string)?.trim() || '',
        wallet_address: walletAddress.trim(),
        cover_image_url: coverUrl,
        logo_image_url: logoUrl,
        token_icon_url: tokenIconUrl,
        default_min_investment: Number(formData.get('default_min_investment')) || 0,
        default_max_investment: Number(formData.get('default_max_investment')) || 1000,
      };

      await saveProjectToDatabase(projectData);
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(`Failed to save: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingProject(false);
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[100] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#00d1ff] animate-spin" />
          <p className="mt-4 text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navigation />
      
      <div className="flex-1 container mx-auto py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectModal(true);
                }}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" /> New Round
              </button>
            </div>
          </div>

          <div className="flex border-b border-slate-200 justify-between items-center">
            <div className="flex">
              <button onClick={() => setActiveTab('projects')} className={`px-8 py-4 font-bold text-sm tracking-widest uppercase transition-all border-b-2 ${activeTab === 'projects' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}>Rounds</button>
              <button onClick={() => setActiveTab('purchases')} className={`px-8 py-4 font-bold text-sm tracking-widest uppercase transition-all border-b-2 ${activeTab === 'purchases' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}>Purchases</button>
            </div>
            
            {activeTab === 'purchases' && (
              <div className="px-8 flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                  title="Export all purchases to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by Project:</span>
                <select 
                  value={selectedPurchaseProjectId} 
                  onChange={(e) => {
                    setSelectedPurchaseProjectId(e.target.value);
                    setPurchasesPage(0);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'projects' ? (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-50">
                      <th className="px-8 py-5">Project</th>
                      <th className="px-8 py-5">Target</th>
                      <th className="px-8 py-5">Onchain</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-8 py-6 font-bold">{project.name}</td>
                        <td className="px-8 py-6">${project.target_amount.toLocaleString()}</td>
                        <td className="px-8 py-6 font-mono text-sm">
                          {project.wallet_address ? (
                            <span className="text-slate-400 text-xs">{project.wallet_address.slice(0, 6)}...{project.wallet_address.slice(-4)}</span>
                          ) : (
                            <span className="text-slate-300 text-xs">No wallet</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase ${
                            project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            project.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right flex justify-end gap-2">
                          <button onClick={() => setWhitelistingProject(project)} className="p-2 text-indigo-400 hover:text-indigo-900" title="Whitelist"><ShieldCheck className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingProject(project); setShowProjectModal(true); }} className="p-2 text-slate-400 hover:text-slate-900" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-slate-400">No projects found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between bg-white">
                  <span className="text-xs text-slate-400 font-bold uppercase">Page {projectsPage + 1}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setProjectsPage(p => Math.max(0, p - 1))}
                      disabled={projectsPage === 0}
                      className="p-2 bg-slate-50 rounded-lg disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setProjectsPage(p => p + 1)}
                      disabled={!hasMoreProjects}
                      className="p-2 bg-slate-50 rounded-lg disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-50">
                      <th className="px-8 py-5">Buyer</th>
                      <th className="px-8 py-5">Wallet</th>
                      <th className="px-8 py-5">Token Amount</th>
                      <th className="px-8 py-5">USD</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">TX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td className="px-8 py-6">
                          <div className="font-bold">{purchase.profiles?.email || purchase.email}</div>
                          <div className="text-[10px] text-slate-400">{purchase.project_rounds?.name}</div>
                        </td>
                        <td className="px-8 py-6 font-mono text-xs text-slate-500">
                          {purchase.wallet_address?.slice(0, 6)}...{purchase.wallet_address?.slice(-4)}
                        </td>
                        <td className="px-8 py-6 font-bold">
                          {formatTokenAmount(purchase.amount, purchase.token_symbol)} {purchase.token_symbol}
                        </td>
                        <td className="px-8 py-6 font-extrabold text-slate-900">
                          {purchase.usd_amount ? `$${purchase.usd_amount.toLocaleString()}` : (
                            <span className="text-slate-400 font-medium italic text-[10px]">Estimated</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${
                            purchase.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            purchase.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <a 
                            href={`${purchase.network === 'Arbitrum' ? 'https://arbiscan.io' : 'https://etherscan.io'}/tx/${purchase.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                    {purchases.length === 0 && !loading && (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium">No purchases found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between bg-white">
                  <span className="text-xs text-slate-400 font-bold uppercase">Page {purchasesPage + 1}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPurchasesPage(p => Math.max(0, p - 1))}
                      disabled={purchasesPage === 0}
                      className="p-2 bg-slate-50 rounded-lg disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPurchasesPage(p => p + 1)}
                      disabled={!hasMorePurchases}
                      className="p-2 bg-slate-50 rounded-lg disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showProjectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowProjectModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProject ? 'Edit Round' : 'New Round'}</h3>
              <button onClick={() => setShowProjectModal(false)}><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleSaveProject} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Name</label>
                        <input name="name" defaultValue={editingProject?.name} placeholder="Project Name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Slug (optional)</label>
                        <input name="slug" defaultValue={editingProject?.slug} placeholder="project-slug" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tagline</label>
                      <input name="tagline" defaultValue={editingProject?.tagline} placeholder="Short tagline" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                      <textarea name="description" defaultValue={editingProject?.description} placeholder="Full description" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl min-h-[120px]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Target Amount (USD)</label>
                        <input name="target_amount" type="number" defaultValue={editingProject?.target_amount} placeholder="50000" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Round Status</label>
                        <select name="status" defaultValue={editingProject?.status || 'active'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <option value="active">Active</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Token Ticker</label>
                        <input name="ticker" defaultValue={editingProject?.ticker} placeholder="POLS" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Network</label>
                        <select name="network" defaultValue={editingProject?.network || 'Ethereum'} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                          {NETWORKS.map((network) => (
                            <option key={network.value} value={network.value}>
                              {network.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Token Price</label>
                        <input name="token_price" defaultValue={editingProject?.token_price} placeholder="$0.10" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Max Allocation</label>
                        <input name="max_allocation" defaultValue={editingProject?.max_allocation} placeholder="$5,000" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Token Sale Info</label>
                        <input name="token_sale_info" defaultValue={editingProject?.token_sale_info} placeholder="Public Sale" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start Date</label>
                        <input name="start_date" type="datetime-local" defaultValue={editingProject?.start_date ? new Date(editingProject.start_date).toISOString().slice(0, 16) : ''} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End Date / Claim Date</label>
                        <input name="end_date" type="datetime-local" defaultValue={editingProject?.end_date ? new Date(editingProject.end_date).toISOString().slice(0, 16) : ''} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Payment Wallet Address (Receives funds)</label>
                        <input name="wallet_address" defaultValue={editingProject?.wallet_address || adminAddress} placeholder="0x..." required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono" />
                        <p className="text-[10px] text-slate-400 mt-1">All payments will be sent directly to this address</p>
                      </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Default Min Investment (USD)</label>
                        <input name="default_min_investment" type="number" defaultValue={editingProject?.default_min_investment || 0} placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                        <p className="text-[10px] text-slate-400 mt-1">Auto-applied to whitelisted users</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Default Max Investment (USD)</label>
                        <input name="default_max_investment" type="number" defaultValue={editingProject?.default_max_investment || 1000} placeholder="1000" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl" />
                        <p className="text-[10px] text-slate-400 mt-1">Auto-applied to whitelisted users</p>
                      </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase">Project Images</h4>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {/* Cover Image */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cover Image</label>
                          <div 
                            onClick={() => coverInputRef.current?.click()}
                            className="h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors overflow-hidden"
                          >
                            {uploadingCover ? (
                              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                            ) : coverUrl ? (
                              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                                <span className="text-[9px] text-slate-400">Upload</span>
                              </div>
                            )}
                          </div>
                          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'cover')} />
                        </div>

                        {/* Logo Image */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Logo Image</label>
                          <div 
                            onClick={() => logoInputRef.current?.click()}
                            className="h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors overflow-hidden"
                          >
                            {uploadingLogo ? (
                              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                            ) : logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                                <span className="text-[9px] text-slate-400">Upload</span>
                              </div>
                            )}
                          </div>
                          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
                        </div>

                        {/* Token Icon */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Token Icon</label>
                          <div 
                            onClick={() => tokenIconInputRef.current?.click()}
                            className="h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors overflow-hidden"
                          >
                            {uploadingTokenIcon ? (
                              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                            ) : tokenIconUrl ? (
                              <img src={tokenIconUrl} alt="Token Icon" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                                <span className="text-[9px] text-slate-400">Upload</span>
                              </div>
                            )}
                          </div>
                          <input ref={tokenIconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'token_icon')} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={savingProject} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {savingProject ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingProject ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingProject ? 'Update Round' : 'Create Round'
                    )}
                  </button>
                </form>
            </div>
          </div>
        </div>
      )}

      {whitelistingProject && (
        <WhitelistManager
          projectId={whitelistingProject.id}
          projectName={whitelistingProject.name}
          contractAddress={undefined}
          onClose={() => setWhitelistingProject(null)}
          defaultMinInvestment={whitelistingProject.default_min_investment || 0}
          defaultMaxInvestment={whitelistingProject.default_max_investment || 1000}
        />
      )}

      <Footer />
    </main>
  );
}
