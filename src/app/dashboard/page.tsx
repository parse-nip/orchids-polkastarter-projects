"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/sections/navigation';
import Footer from '@/components/sections/coinlist-footer';
import WithdrawalsSection from '@/components/WithdrawalsSection';
import { Loader2 } from 'lucide-react';
import { 
  PiggyBank, 
  Layers, 
  Rocket, 
  GitBranch, 
  Plus, 
  Trash2, 
  Wallet,
  ShieldCheck,
  TrendingUp,
  History,
  Clock,
  ExternalLink,
  ChevronRight,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatTokenAmount, toFiniteNumber } from "@/lib/format";

interface UserWallet {
  id: string;
  wallet_address: string;
  label: string | null;
}

interface DashboardStats {
  fundsInvested: number;
  polsStaked: number;
  idosParticipated: number;
  completedMissions: number;
}

interface Application {
  id: string;
  amount: number;
  status: string;
  token_symbol?: string;
  created_at: string;
  usd_amount?: number;
  project_rounds: {
    name: string;
  };
}

interface UserData {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface RoundWithContract {
  id: string;
  name: string;
  contract_address: string;
}

const PAGE_SIZE = 5;

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    fundsInvested: 0,
    polsStaked: 0,
    idosParticipated: 0,
    completedMissions: 0
  });
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [roundsWithContracts, setRoundsWithContracts] = useState<RoundWithContract[]>([]);
  const [page, setPage] = useState(0);
  const [hasMoreApps, setHasMoreApps] = useState(true);

  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  const getEstimatedUsd = (symbol?: string, amount?: unknown) => {
    const rates: Record<string, number> = {
      ETH: 2500,
      BNB: 600,
      POL: 0.8,
      MATIC: 0.8,
      USDC: 1,
      USDT: 1,
    };
    const amt = toFiniteNumber(amount);
    const sym = (symbol || "").toUpperCase();
    return amt * (rates[sym] || 1);
  };

  const fetchWallets = async (userId: string) => {
    const { data: userWallets } = await supabase
      .from('user_wallets')
      .select('id, wallet_address, label')
      .eq('user_id', userId);
    setWallets(userWallets || []);
  };

  useEffect(() => {
    const autoLinkWallet = async () => {
      if (!address || !user?.id) return;

      try {
        const { data: existing } = await supabase
          .from('user_wallets')
          .select('id')
          .eq('user_id', user.id)
          .eq('wallet_address', address.toLowerCase())
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabase
            .from('user_wallets')
            .insert([
              { 
                user_id: user.id, 
                wallet_address: address.toLowerCase(), 
                label: 'Connected Wallet' 
              }
            ]);
          
          if (!insertError) {
            await fetchWallets(user.id);
          }
        }
      } catch (error) {
        console.error('Auto-link wallet error:', error);
      }
    };

    autoLinkWallet();
  }, [address, user?.id, supabase]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          window.location.href = '/';
          return;
        }
        setUser(user as UserData);
        
        // Fetch stats and initial apps
        const [profileRes, appsCountRes, roundsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('pols_staked, completed_missions')
            .eq('id', user.id)
            .single(),
          supabase
            .from('round_applications')
            .select('amount, usd_amount, token_symbol', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('project_rounds')
            .select('id, name, contract_address')
            .not('contract_address', 'is', null)
        ]);

        const profile = profileRes.data;
        const invested = appsCountRes.data?.reduce((acc: number, app: any) => {
          const usd = app?.usd_amount != null ? toFiniteNumber(app.usd_amount) : getEstimatedUsd(app?.token_symbol, app?.amount);
          return acc + usd;
        }, 0) || 0;
        const participated = appsCountRes.count || 0;

        setStats({
          fundsInvested: invested,
          polsStaked: profile?.pols_staked || 0,
          idosParticipated: participated,
          completedMissions: profile?.completed_missions || 0
        });

        setRoundsWithContracts(roundsRes.data || []);
        fetchWallets(user.id);
        fetchApplications(user.id, 0);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const fetchApplications = async (userId: string, targetPage: number) => {
    const { data: apps } = await supabase
      .from('round_applications')
      .select(`
        id, amount, usd_amount, status, token_symbol, created_at,
        project_rounds (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1);

    setApplications((apps as any) || []);
    setHasMoreApps((apps?.length || 0) === PAGE_SIZE);
  };

  const handlePageChange = (newPage: number) => {
    if (!user) return;
    setPage(newPage);
    fetchApplications(user.id, newPage);
  };

  const handleDeleteWallet = async (id: string) => {
    const { error } = await supabase
      .from('user_wallets')
      .delete()
      .eq('id', id);

    if (!error) {
      setWallets(wallets.filter(w => w.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 container max-w-7xl mx-auto py-12 px-6 md:px-12 lg:px-16 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-foreground flex flex-col font-sans">
      <Navigation />
      
      <div className="flex-1 container max-w-7xl mx-auto py-8 px-6 md:px-12 lg:px-16 md:py-12">
        <div className="space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight">
                  Hi, {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Welcome back. Here&apos;s an overview of your activity.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <Button 
                  onClick={() => open()}
                  size="lg"
                  className="rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 font-mono text-sm shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={<PiggyBank className="w-5 h-5" />}
              label="Funds Invested"
              value={stats.fundsInvested > 0 ? `$${stats.fundsInvested.toLocaleString()}` : "$0"}
              trend="Total allocation"
              variant="emerald"
            />
            <StatCard 
              icon={<Layers className="w-5 h-5" />}
              label="POLS Staked"
              value={stats?.polsStaked > 0 ? stats.polsStaked.toLocaleString() : "0"}
              trend="Network power"
              variant="indigo"
            />
            <StatCard 
              icon={<Rocket className="w-5 h-5" />}
              label="IDOs Joined"
              value={stats?.idosParticipated > 0 ? stats.idosParticipated.toString() : "0"}
              trend="Active participation"
              variant="violet"
            />
            <StatCard 
              icon={<GitBranch className="w-5 h-5" />}
              label="Missions"
              value={stats?.completedMissions > 0 ? stats.completedMissions.toString() : "0"}
              trend="Completed tasks"
              variant="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Investment History */}
            <div className="lg:col-span-2 space-y-8">
              <WithdrawalsSection rounds={roundsWithContracts} />
              
              <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Activity History</CardTitle>
                      <CardDescription>Your recent participation in projects</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                        <Rocket className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                      </div>
                      <h3 className="text-xl font-semibold">No activity yet</h3>
                      <p className="text-muted-foreground max-w-xs mx-auto">
                        Your investment applications and activity will appear here once you join a project round.
                      </p>
                      <Button asChild variant="outline" className="mt-4 rounded-full">
                        <Link href="/projects">Browse Projects</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider">Project</TableHead>
                            <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-right">Amount</TableHead>
                            <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-center">Status</TableHead>
                            <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-right">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications.map((app) => (
                            <TableRow key={app.id} className="group transition-colors">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {app.project_rounds?.name?.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                    {app.project_rounds?.name || 'Unknown Project'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-right font-medium">
                                <span className="text-slate-900 dark:text-slate-100">
                                  {formatTokenAmount(app.amount || 0, app.token_symbol)}
                                </span>
                                <span className="ml-1 text-slate-400 text-xs font-normal">
                                  {app.token_symbol}
                                </span>
                              </TableCell>
                              <TableCell className="px-8 py-6">
                                <div className="flex justify-center">
                                  <StatusBadge status={app.status} />
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-slate-400 text-right text-sm font-medium">
                                {new Date(app.created_at).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                
                {applications.length > 0 && (
                  <CardFooter className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Page {page + 1}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePageChange(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="h-8 w-8 rounded-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!hasMoreApps}
                        className="h-8 w-8 rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>

            {/* Right Column: Wallets & Support */}
            <div className="space-y-8">
              <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900/50">
                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">Wallets</CardTitle>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => open()}
                    className="rounded-full h-8"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Link
                  </Button>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {(() => {
                    const allWallets = [...wallets];
                    const isAddressLinked = wallets.some(w => w.wallet_address.toLowerCase() === address?.toLowerCase());
                    
                    if (isConnected && address && !isAddressLinked) {
                      allWallets.unshift({
                        id: 'temp-connected',
                        wallet_address: address,
                        label: 'Connected Wallet'
                      });
                    }

                    if (allWallets.length === 0) {
                      return (
                        <div className="text-center py-10 text-muted-foreground space-y-4">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ShieldCheck className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                          </div>
                          <p className="text-sm">No wallets linked yet.</p>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-bold text-xs"
                            onClick={() => open()}
                          >
                            Connect your wallet
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {allWallets.map((wallet) => {
                          const isTemp = wallet.id === 'temp-connected';
                          const isCurrentlyActive = address?.toLowerCase() === wallet.wallet_address.toLowerCase();

                          return (
                            <div key={wallet.id} className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                              isCurrentlyActive 
                                ? "bg-emerald-500/5 border-emerald-500/20 ring-1 ring-emerald-500/10" 
                                : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700"
                            )}>
                              <div className="flex flex-col gap-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest truncate",
                                    isCurrentlyActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                                  )}>
                                    {wallet.label || 'Web3 Wallet'}
                                  </span>
                                  {isCurrentlyActive && (
                                    <Badge variant="secondary" className="bg-emerald-500 text-white border-none h-4 px-1.5 text-[8px] animate-pulse">
                                      LIVE
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm font-mono font-medium truncate">
                                  {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300"
                                  onClick={() => {
                                    navigator.clipboard.writeText(wallet.wallet_address);
                                    // You could add a toast here
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                {!isTemp && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteWallet(wallet.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
              
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg h-fit shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-100">Security Note</p>
                        <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/60 leading-relaxed">
                          Link multiple wallets to track allocations across different addresses. We never store your private keys.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="bg-slate-900 dark:bg-slate-900/80 text-white border-none relative overflow-hidden shadow-xl p-0">
                <CardHeader className="relative z-10 p-8">
                  <CardTitle className="text-2xl text-white">Need help?</CardTitle>
                  <CardDescription className="text-slate-400 text-base leading-relaxed mt-2">
                    Have questions about your investment or need to update your details? Our team is here to assist.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold shadow-sm active:scale-95 transition-all">
                    Contact Support
                  </Button>
                </CardContent>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute right-8 top-8 opacity-10">
                  <Settings className="w-24 h-24" />
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  
  if (normalized === 'approved' || normalized === 'completed') {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 gap-1.5 rounded-full px-3 py-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {status}
      </Badge>
    );
  }
  
  if (normalized === 'pending') {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 gap-1.5 rounded-full px-3 py-1">
        <Clock className="w-3.5 h-3.5" />
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 gap-1.5 rounded-full px-3 py-1">
      <AlertCircle className="w-3.5 h-3.5" />
      {status}
    </Badge>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  trend,
  variant
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string,
  trend: string,
  variant: 'emerald' | 'indigo' | 'violet' | 'amber'
}) {
  const variants = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-indigo-500/5",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 shadow-violet-500/5",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-amber-500/5",
  };

  return (
    <Card className="group transition-all duration-300 border-none shadow-sm hover:shadow-md hover:-translate-y-1 bg-white dark:bg-slate-900/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className={cn("p-3 rounded-2xl border transition-colors", variants[variant])}>
            {icon}
          </div>
          <div className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800">
            <TrendingUp className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <div className="flex items-center gap-1.5 pt-2">
            <span className="text-[10px] font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

