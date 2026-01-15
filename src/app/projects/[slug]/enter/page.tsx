"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Wallet, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/sections/navigation';
import Footer from '@/components/sections/coinlist-footer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useSendTransaction } from 'wagmi';
import { parseEther, formatEther, parseUnits, erc20Abi } from 'viem';
import { toast } from 'sonner';
import { useAppKit } from '@reown/appkit/react';
import { getRoundDerivedState } from '@/lib/round-status';

type TokenConfig = {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  logo: string;
};

const TOKEN_CONFIG: Record<number, TokenConfig[]> = {
  1: [ // Ethereum
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  42161: [ // Arbitrum
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  56: [ // BSC
    { symbol: 'BNB', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  11155111: [ // Sepolia
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDT', address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', address: '0x1c7D4B196Cb0232b3044b3373f8d6E02214318c2', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  421614: [ // Arbitrum Sepolia
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDC', address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  80002: [ // Amoy
    { symbol: 'POL', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
    { symbol: 'USDC', address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  84532: [ // Base Sepolia
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDC', address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', decimals: 6, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ],
  97: [ // BSC Testnet
    { symbol: 'BNB', address: '0x0000000000000000000000000000000000000000', decimals: 18, logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    { symbol: 'USDT', address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', decimals: 18, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  ]
};

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

export default function EnterRoundPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  
  const [project, setProject] = useState<{
    id: string;
    title: string;
    logoImage: string;
    ticker: string;
    walletAddress?: string;
    network?: string;
    isWhitelistRequired: boolean;
    targetAmount: number;
    currentAmount: number;
    status?: string;
    endDate?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [activeTransactionType, setActiveTransactionType] = useState<'invest' | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [isDbWhitelisted, setIsDbWhitelisted] = useState(false);
  const [isCheckingDbWl, setIsCheckingDbWl] = useState(false);
  const [dbMinInvestment, setDbMinInvestment] = useState<string>('0');
  const [dbMaxInvestment, setDbMaxInvestment] = useState<string>('1000');
  
  const supabase = createClient();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;
    
    async function fetchData() {
      if (!slug) return;
      
      timeoutId = setTimeout(() => {
        if (mounted) setIsLoading(false);
      }, 15000);

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('project_rounds')
          .select('id, name, logo_image_url, ticker, wallet_address, network, is_whitelist_required, target_amount, current_amount, status, end_date')
          .eq('slug', slug)
          .single();

        if (!mounted) return;
        
        if (projectError || !projectData) {
          console.error('Project fetch error:', projectError);
          setIsLoading(false);
          return;
        }

        setProject({
          id: projectData.id,
          title: projectData.name,
          logoImage: projectData.logo_image_url || '',
          ticker: projectData.ticker || '',
          walletAddress: projectData.wallet_address,
          network: projectData.network,
          isWhitelistRequired: projectData.is_whitelist_required ?? true,
          targetAmount: projectData.target_amount || 0,
          currentAmount: projectData.current_amount || 0,
          status: projectData.status,
          endDate: projectData.end_date,
        });

        // Use getSession for faster local check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push(`/auth/login?next=/projects/${slug}/enter`);
          return;
        }
        
        const user = session.user;
        if (mounted) setUser(user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('approved, has_inner_circle_role, terms_accepted, has_completed_onboarding')
          .eq('id', user.id)
          .single();
        
        if (!mounted) return;
        
        if (!profile?.terms_accepted) {
          router.push(`/onboarding/terms?next=/projects/${slug}/enter`);
          return;
        }

        if (!profile?.has_completed_onboarding) {
          router.push(`/onboarding/due-diligence?next=/projects/${slug}/enter`);
          return;
        }

        if (profile?.approved || profile?.has_inner_circle_role) {
          setHasAccess(true);
        } else {
          router.push(`/projects/${slug}`);
          return;
        }
      } catch (err) {
        console.error('Enter round fetch error:', err);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) setIsLoading(false);
      }
    }
    
    fetchData();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchData();
      } else if (event === 'SIGNED_OUT') {
        router.push(`/auth/login?next=/projects/${slug}/enter`);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, slug]);

  const projectChainId = project?.network ? NETWORK_CHAIN_IDS[project.network] : 1;
  const isWrongNetwork = isConnected && chainId !== projectChainId;

  const currentTokens = project?.network 
    ? (TOKEN_CONFIG[NETWORK_CHAIN_IDS[project.network]] || [])
    : [];

  useEffect(() => {
    if (!selectedToken && currentTokens.length > 0) {
      setSelectedToken(currentTokens[0]);
    }
  }, [currentTokens, selectedToken]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: projectChainId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch network');
    }
  };
  
  useEffect(() => {
    async function checkDbWhitelist() {
      if (!project?.id || !address) return;
      
      setIsCheckingDbWl(true);
      try {
        const { data: whitelistData, error } = await supabase
          .from('project_whitelists')
          .select('id, min_investment, max_investment')
          .eq('project_id', project.id)
          .eq('wallet_address', address.toLowerCase())
          .single();
        
        if (whitelistData && !error) {
          setIsDbWhitelisted(true);
          setDbMinInvestment(String(whitelistData.min_investment ?? '0'));
          setDbMaxInvestment(String(whitelistData.max_investment ?? '1000'));
        } else {
          setIsDbWhitelisted(false);
        }
      } finally {
        setIsCheckingDbWl(false);
      }
    }
    
    checkDbWhitelist();
  }, [project?.id, address, supabase]);

  // Get user's total invested from database
  const [userTotalInvested, setUserTotalInvested] = useState<number>(0);

  useEffect(() => {
    async function fetchUserInvestments() {
      if (!project?.id || !address) {
        setUserTotalInvested(0);
        return;
      }
      
      try {
        const { data: investments } = await supabase
          .from('round_applications')
          .select('usd_amount')
          .eq('round_id', project.id)
          .eq('wallet_address', address.toLowerCase())
          .eq('status', 'completed');
        
        const total = investments?.reduce((sum, inv) => {
          const n = typeof inv.usd_amount === 'string' ? Number(inv.usd_amount) : (inv.usd_amount || 0);
          return sum + (Number.isFinite(n) ? n : 0);
        }, 0) || 0;
        setUserTotalInvested(total);
      } catch (err) {
        console.error('Failed to fetch user investments:', err);
      }
    }
    
    fetchUserInvestments();
  }, [project?.id, address, supabase]);

  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  const { sendTransaction, data: ethHash, error: ethError, isPending: isEthPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: hash || ethHash });

  const getEstimatedUsdAmount = (symbol: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    // Fallback only; real pricing is fetched server-side when recording.
    // Keep these non-zero so UI doesn't look "broken" if pricing API is unavailable.
    const fallbackRates: Record<string, number> = {
      'ETH': 2500,
      'BNB': 600,
      'POL': 0.8,
      'USDC': 1,
      'USDT': 1
    };
    return numAmount * (fallbackRates[symbol] || 0);
  };

  const [tokenUsdPrice, setTokenUsdPrice] = useState<number | null>(null);

  const fetchUsdPrice = async (symbol: string): Promise<number | null> => {
    if (!symbol) return null;
    if (symbol === 'USDC' || symbol === 'USDT') return 1;
    try {
      const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbol)}`);
      const json = await res.json();
      const price = json?.prices?.[symbol];
      return typeof price === 'number' && Number.isFinite(price) ? price : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadPrice() {
      if (!selectedToken?.symbol) {
        setTokenUsdPrice(null);
        return;
      }
      const p = await fetchUsdPrice(selectedToken.symbol);
      if (!cancelled) {
        setTokenUsdPrice(p);
      }
    }
    loadPrice();
    return () => {
      cancelled = true;
    };
  }, [selectedToken?.symbol]);

  const { data: tokenBalanceData } = useBalance({
    address,
    token:
      selectedToken?.address && selectedToken.address !== '0x0000000000000000000000000000000000000000'
        ? (selectedToken.address as `0x${string}`)
        : undefined,
    chainId: projectChainId,
    query: { enabled: Boolean(address && selectedToken && !isWrongNetwork) },
  });

  useEffect(() => {
    async function recordPendingTx() {
      const activeHash = hash || ethHash;
      if (!activeHash || !user || !project || !selectedToken || !investmentAmount || activeTransactionType !== 'invest') return;

      try {
        const walletLower = address?.toLowerCase();
        if (!walletLower) return;

        const { data: existing } = await supabase
          .from('round_applications')
          .select('id')
          .eq('transaction_hash', activeHash)
          .maybeSingle();

        if (existing) return;

        const price = await fetchUsdPrice(selectedToken.symbol);
        const estimatedUsd = price ? (parseFloat(investmentAmount) * price) : getEstimatedUsdAmount(selectedToken.symbol, investmentAmount);

        await supabase
          .from('round_applications')
          .insert([{
            user_id: user.id,
            round_id: project.id,
            wallet_address: walletLower,
            email: user.email,
            amount: parseFloat(investmentAmount),
            token_symbol: selectedToken.symbol,
            usd_amount: estimatedUsd,
            network: project.network,
            transaction_hash: activeHash,
            status: 'pending'
          }]);
      } catch (err) {
        console.error('Failed to record pending investment:', err);
      }
    }
    recordPendingTx();
  }, [hash, ethHash, user, project, selectedToken, investmentAmount, activeTransactionType, address, supabase]);

  useEffect(() => {
    async function handleTxSuccess() {
      const activeHash = hash || ethHash;
      if (!isConfirmed || !activeHash || activeTransactionType !== 'invest') return;
      if (!user || !project || !selectedToken || !investmentAmount) return;
      
      try {
        const price = await fetchUsdPrice(selectedToken.symbol);
        const estimatedUsd = price ? (parseFloat(investmentAmount) * price) : getEstimatedUsdAmount(selectedToken.symbol, investmentAmount);

        await supabase
          .from('round_applications')
          .update({ 
            status: 'completed',
            usd_amount: estimatedUsd
          })
          .eq('transaction_hash', activeHash);

        const { data: currentProject } = await supabase
          .from('project_rounds')
          .select('current_amount, target_amount, status')
          .eq('id', project.id)
          .single();
        
        const currentAmtNum = Number(currentProject?.current_amount || 0);
        const targetAmtNum = Number(currentProject?.target_amount || project.targetAmount || 0);
        const newAmount = currentAmtNum + estimatedUsd;
        
        // Check if project should be marked as completed (use 1% tolerance for floating point)
        const tolerance = targetAmtNum * 0.01;
        const shouldComplete = targetAmtNum > 0 && newAmount >= (targetAmtNum - tolerance) && currentProject?.status !== 'completed';
        
        const updateData: { current_amount: number; status?: string; completed_at?: string } = { current_amount: newAmount };
        if (shouldComplete) {
          updateData.status = 'completed';
          updateData.completed_at = new Date().toISOString();
        }
        
        await supabase
          .from('project_rounds')
          .update(updateData)
          .eq('id', project.id);

        // Update local state
        setProject(prev => prev ? { 
          ...prev, 
          currentAmount: newAmount,
          ...(shouldComplete ? { status: 'completed' } : {})
        } : null);
        setUserTotalInvested(prev => prev + estimatedUsd);

        if (shouldComplete) {
          toast.success('Investment recorded successfully! Project funding goal reached!');
        } else {
          toast.success('Investment recorded successfully');
        }
        setActiveTransactionType(null);
      } catch (err) {
        console.error('Failed to update investment in DB:', err);
        toast.error('Failed to update investment record');
      }
    }
    handleTxSuccess();
  }, [isConfirmed, activeTransactionType, user, project, selectedToken, investmentAmount, hash, ethHash, address, supabase]);

  const effectivelyWhitelisted = isDbWhitelisted;
  const minInvestmentUsd = Number(dbMinInvestment || '0') || 0;
  const maxInvestmentUsd = Number(dbMaxInvestment || '0') || 0;
  
  const totalRaised = project?.currentAmount || 0;
  const maxBalance = project?.targetAmount || 0;
  const { isClosed: isRoundClosed } = getRoundDerivedState({
    status: project?.status,
    end_date: project?.endDate,
    current_amount: project?.currentAmount,
    target_amount: project?.targetAmount,
  });

  const currentPrice = tokenUsdPrice ?? (selectedToken?.symbol ? (selectedToken.symbol === 'USDC' || selectedToken.symbol === 'USDT' ? 1 : null) : null);
  const fallbackEstimatedUsd = selectedToken?.symbol ? getEstimatedUsdAmount(selectedToken.symbol, investmentAmount || '0') : 0;
  const estimatedUsd = currentPrice != null
    ? ((parseFloat(investmentAmount || '0') || 0) * currentPrice)
    : fallbackEstimatedUsd;

  const remainingRoundUsd = Math.max(0, maxBalance - totalRaised);
  const remainingUserUsd = maxInvestmentUsd > 0 ? Math.max(0, maxInvestmentUsd - userTotalInvested) : Number.POSITIVE_INFINITY;
  const maxUsdAllowed = Math.min(remainingRoundUsd || Number.POSITIVE_INFINITY, remainingUserUsd);

  const maxTokenByUsd =
    (currentPrice != null && currentPrice > 0 && Number.isFinite(maxUsdAllowed))
      ? (maxUsdAllowed / currentPrice)
      : null;

  const tokenBalance = tokenBalanceData?.formatted ? Number(tokenBalanceData.formatted) : null;
  const nativeGasBuffer = selectedToken?.address === '0x0000000000000000000000000000000000000000' ? 0.005 : 0;
  const maxTokenByBalance = tokenBalance != null && Number.isFinite(tokenBalance)
    ? Math.max(0, tokenBalance - nativeGasBuffer)
    : null;

  const maxTokenAllowed = (() => {
    const candidates = [maxTokenByUsd, maxTokenByBalance].filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    if (candidates.length === 0) return null;
    return Math.max(0, Math.min(...candidates));
  })();

  const belowMin = minInvestmentUsd > 0 && estimatedUsd > 0 && estimatedUsd < minInvestmentUsd;
  const exceedsUserMax = maxInvestmentUsd > 0 && estimatedUsd > 0 && (userTotalInvested + estimatedUsd) > maxInvestmentUsd + 1e-9;

  const handleInvestment = async () => {
    if (!address || !project?.walletAddress || !selectedToken) {
      toast.error('Missing required information');
      return;
    }

    if (!investmentAmount || Number(investmentAmount) <= 0) {
      toast.error('Enter an amount');
      return;
    }

    if (belowMin) {
      toast.error('Amount is below the minimum allowed.');
      return;
    }

    if (exceedsUserMax) {
      toast.error('Amount exceeds your maximum allocation.');
      return;
    }

    if (maxTokenAllowed != null && Number(investmentAmount) > maxTokenAllowed + 1e-12) {
      toast.error('Amount exceeds your available maximum.');
      return;
    }

    try {
      const amountWei = parseUnits(investmentAmount, selectedToken.decimals);
      
      setActiveTransactionType('invest');
      
      if (selectedToken.address === '0x0000000000000000000000000000000000000000') {
        // Native token (ETH, BNB, etc.) - send directly to wallet
        sendTransaction({
          to: project.walletAddress as `0x${string}`,
          value: amountWei,
        });
      } else {
        // ERC20 token - transfer directly to wallet (no approval needed)
        writeContract({
          address: selectedToken.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [project.walletAddress as `0x${string}`, amountWei],
        });
      }
    } catch (err: any) {
      console.error('Investment error:', err);
      toast.error(err.message || 'Investment failed');
      setActiveTransactionType(null);
    }
  };
  
  if (isLoading || (address && isCheckingDbWl)) {
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
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Project not found</h1>
            <Link href="/projects" className="text-blue-600 hover:underline">Back to projects</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (isConfirmed && activeTransactionType === 'invest') {
    return (
      <main className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-[2rem] p-10 border border-gray-100 text-center shadow-xl shadow-slate-100">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-slate-900">Transaction Successful!</h1>
            <p className="text-slate-500 mb-8 text-lg font-medium leading-relaxed">
              Your transaction has been confirmed on-chain.
            </p>
            <div className="space-y-4">
              <Link href={`/projects/${slug}`} className="block">
                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg">
                  Back to Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const isCapReached = maxBalance > 0 && totalRaised >= maxBalance;
  
  let amountExceedsCap = false;
  if (maxBalance > 0 && investmentAmount && Number(investmentAmount) > 0) {
    const estimatedUsd = getEstimatedUsdAmount(selectedToken?.symbol || '', investmentAmount);
    amountExceedsCap = (totalRaised + estimatedUsd > maxBalance);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navigation />
      
      <div className="flex-1 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <Link 
            href={`/projects/${slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-10 transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {project.title}
          </Link>

          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-50">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0 flex items-center justify-center">
                  {project.logoImage ? (
                    <Image src={project.logoImage} alt={project.title} width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-300">{project.title[0]}</span>
                  )}
                </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Enter {project.title} Round</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400 font-bold tracking-tight">${project.ticker}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-slate-400 font-bold tracking-tight uppercase">
                      {chainId === 56 ? 'BSC' : 
                       chainId === 97 ? 'BSC Testnet' :
                       chainId === 42161 ? 'Arbitrum' : 
                       chainId === 421614 ? 'Arbitrum Sepolia' :
                       chainId === 80002 ? 'Polygon Amoy' :
                       chainId === 84532 ? 'Base Sepolia' :
                       chainId === 11155111 ? 'Sepolia' :
                       'Ethereum'}
                    </span>
                </div>
              </div>
            </div>

            {!isConnected ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Connect Wallet</h3>
                <p className="text-slate-500 mb-8 font-medium">Please connect your wallet to participate.</p>
                <Button onClick={() => open()} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg">Connect Wallet</Button>
              </div>
            ) : !project.walletAddress ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-amber-900 mb-2">Wallet Address Pending</h3>
                <p className="text-amber-800 text-sm font-medium">The payment wallet address for this round hasn't been configured yet.</p>
              </div>
            ) : project.isWhitelistRequired && !effectivelyWhitelisted ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-900 mb-2">Not Whitelisted</h3>
                <p className="text-red-800 text-sm font-medium leading-relaxed">Your wallet (<span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>) is not whitelisted.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Min Investment</span>
                      <span className="text-xl font-extrabold text-slate-900">${minInvestmentUsd.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Max Investment</span>
                      <span className="text-xl font-extrabold text-slate-900">${maxInvestmentUsd.toLocaleString()}</span>
                    </div>
                  </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Progress</span>
                    <span className="text-slate-900 font-extrabold text-sm">{maxBalance > 0 ? `${((totalRaised / maxBalance) * 100).toFixed(1)}%` : '0%'}</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full transition-all duration-500" style={{ width: maxBalance > 0 ? `${Math.min(100, (totalRaised / maxBalance) * 100)}%` : '0%' }} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select Payment Token</Label>
                  <div className="relative">
                    <button 
                      onClick={() => setIsTokenSelectorOpen(!isTokenSelectorOpen)}
                      className="w-full h-16 rounded-2xl bg-slate-50 border border-slate-100 px-6 flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {selectedToken && <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-8 h-8 rounded-full" />}
                        <span className="text-xl font-extrabold text-slate-900">{selectedToken?.symbol}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isTokenSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isTokenSelectorOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                        {currentTokens.map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => { setSelectedToken(token); setIsTokenSelectorOpen(false); }}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                              <span className="font-extrabold text-slate-900">{token.symbol}</span>
                            </div>
                            {selectedToken?.symbol === token.symbol && <Check className="w-5 h-5 text-emerald-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <Label htmlFor="amount" className="text-slate-400 text-xs font-bold uppercase tracking-widest">Investment Amount</Label>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Already: ${userTotalInvested.toFixed(2)}</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="amount" type="number" step="0.01" placeholder="0.00"
                      value={investmentAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        setInvestmentAmount(v);
                      }}
                      className="h-16 rounded-2xl bg-slate-50 border-slate-100 text-xl font-extrabold focus:ring-slate-900 pr-16"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">{selectedToken?.symbol}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {maxTokenAllowed != null ? `Max: ${maxTokenAllowed.toFixed(6)} ${selectedToken?.symbol}` : 'Max: —'}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (maxTokenAllowed == null || !selectedToken) return;
                        const precision = Math.min(6, selectedToken.decimals);
                        const buffer = Math.pow(10, -precision);
                        const next = (Math.floor(maxTokenAllowed * Math.pow(10, precision)) / Math.pow(10, precision) - buffer).toFixed(precision);
                        setInvestmentAmount(next);
                      }}
                      disabled={maxTokenAllowed == null || isWrongNetwork}
                      className="h-7 px-2 rounded-lg text-xs font-bold"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {(belowMin || exceedsUserMax || (maxTokenAllowed != null && Number(investmentAmount) > maxTokenAllowed + 1e-12)) && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {belowMin
                        ? `Below minimum ($${minInvestmentUsd.toLocaleString()}).`
                        : exceedsUserMax
                          ? `Exceeds your max ($${maxInvestmentUsd.toLocaleString()}).`
                          : 'Exceeds available max.'}
                    </span>
                  </div>
                )}

                {amountExceedsCap && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex gap-2">
                     <AlertCircle className="w-4 h-4 shrink-0" />
                     <span>Amount exceeds remaining round capacity.</span>
                   </div>
                )}

                {(writeError || ethError) && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="break-all">{(writeError || ethError)?.message.includes('User denied') || (writeError || ethError)?.message.includes('User rejected') ? 'Transaction rejected' : 
                          (writeError || ethError)?.message.includes('insufficient funds') ? 'Insufficient funds for gas' :
                          (writeError || ethError)?.shortMessage || (writeError || ethError)?.message || 'Transaction failed'}</span>
                  </div>
                )}

                <Button 
                  onClick={isWrongNetwork ? handleSwitchNetwork : handleInvestment}
                  disabled={
                    isRoundClosed ||
                    isWritePending ||
                    isEthPending ||
                    isConfirming ||
                    (!isWrongNetwork && (
                      !investmentAmount ||
                      Number(investmentAmount) <= 0 ||
                      isCapReached ||
                      amountExceedsCap ||
                      belowMin ||
                      exceedsUserMax ||
                      (maxTokenAllowed != null && Number(investmentAmount) > maxTokenAllowed + 1e-12)
                    ))
                  }
                  className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xl shadow-xl shadow-slate-200"
                >
                  {isWrongNetwork ? `Switch to ${project.network}` : 
                   (isWritePending || isEthPending) ? 'Waiting...' : 
                   isConfirming ? 'Confirming...' : 
                   isRoundClosed ? 'Closed Recently' :
                   isCapReached ? 'Round Sold Out' :
                   amountExceedsCap ? 'Exceeds Cap' :
                   'Invest Now'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
