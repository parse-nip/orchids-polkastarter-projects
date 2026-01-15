"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Menu, LogOut, User, Wallet, Moon, Sun, Settings } from 'lucide-react';
import { TermsModal } from '@/components/auth/terms-modal';
import { createClient } from '@/lib/supabase/client';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useTheme } from 'next-themes';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string }; is_admin?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginRedirectTo, setLoginRedirectTo] = useState<string | undefined>(undefined);
  const supabase = useMemo(() => createClient(), []);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  
  useEffect(() => {
    const autoLinkWallet = async () => {
      if (!address || !user?.id) return;

      const client = createClient();
      const { data: existing } = await client
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (!existing) {
        await client
          .from('user_wallets')
          .insert([
            { 
              user_id: user.id, 
              wallet_address: address.toLowerCase(), 
              label: 'Connected Wallet' 
            }
          ]);
      }
    };

    autoLinkWallet();
  }, [address, user?.id]);
  
    useEffect(() => {
      setMounted(true);
      let mounted = true;
      
      const loadUserProfile = async (sessionUser: any) => {
        if (!mounted) return;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', sessionUser.id)
            .single();
          if (mounted) {
            setUser({ ...sessionUser, is_admin: profile?.is_admin } as any);
          }
        } catch {
          if (mounted) setUser(sessionUser as any);
        }
      };
      
      // Listen to auth state changes FIRST - this catches INITIAL_SESSION event
      // which fires after Supabase validates/refreshes the session
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        // Always ensure loading is false after auth state change
        setIsLoading(false);
      });
      
      // Then do an initial check - this returns cached session for fast UI
      const checkUser = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user) {
            if (mounted) {
              setUser(null);
              setIsLoading(false);
            }
            return;
          }
          
          // Show user immediately from cache, onAuthStateChange will update if needed
          await loadUserProfile(session.user);
        } catch (err) {
          console.error('Navigation checkUser error:', err);
          if (mounted) setUser(null);
        } finally {
          if (mounted) setIsLoading(false);
        }
      };
    
      checkUser();

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getLinkStyles = (path: string) => {
    const isActive = pathname === path || (path === '/projects' && pathname?.startsWith('/projects'));
    return `transition-colors outline-none h-9 rounded-full px-4 py-2 text-[0.93rem] font-medium duration-300 ease-in-out flex items-center justify-center ${
      isActive 
        ? "text-primary bg-secondary/50" 
        : "text-muted-foreground hover:bg-secondary"
    }`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md py-3.5 transition-colors duration-300 border-b border-slate-200 dark:border-slate-800">
      <div className="container-fluid-2xl px-6 md:px-12 lg:px-16 mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center">
                  <Link href="/" className="flex items-center gap-2">
                    <img 
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3search-1767084163944.png?width=8000&height=8000&resize=contain" 
                      alt="3SEARCH Capital Logo" 
                      className="h-10 w-auto dark:invert"
                      style={{ filter: mounted && theme === 'dark' ? 'none' : 'brightness(0)' }}
                    />
                  </Link>
            </div>

                {/* Center Links - Desktop */}
                <div className="hidden md:flex items-center gap-1">
                  <Link 
                    href="/" 
                    className={getLinkStyles('/')}
                  >
                    Home
                  </Link>
                    <button
                      onClick={(e) => {
                        if (!user && !isLoading) {
                          e.preventDefault();
                          setLoginRedirectTo('/projects');
                          setShowTermsModal(true);
                        } else if (user) {
                          router.push('/projects');
                        }
                      }}
                      className={getLinkStyles('/projects')}
                      disabled={isLoading}
                    >
                      Projects
                    </button>
                  </div>

          {/* Right Section - Login/User */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Auth Section */}
                <div className="flex justify-end">
                    {isLoading ? (
                      <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
                    ) : user ? (
                      <div className="relative">
                        <button 
                          onClick={() => setShowUserDropdown(!showUserDropdown)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-all duration-200 px-3 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100"
                        >
                          <User className="w-4 h-4" />
                          <span className="max-w-[100px] truncate font-medium hidden sm:inline">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                          </span>
                        </button>

                        {showUserDropdown && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowUserDropdown(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="p-2 space-y-1">
                                  <Link 
                                    href="/dashboard"
                                    onClick={() => setShowUserDropdown(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                  >
                                    <User className="w-4 h-4 text-gray-400" />
                                    Dashboard
                                  </Link>

                                  {user?.is_admin && (
                                    <Link 
                                      href="/admin"
                                      onClick={() => setShowUserDropdown(false)}
                                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                      <Settings className="w-4 h-4 text-indigo-500" />
                                      Admin Panel
                                    </Link>
                                  )}
                                  
                                    {isConnected && (
                                      <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700">
                                        <Wallet className="w-4 h-4 text-emerald-500" />
                                        <span className="font-mono text-xs">
                                          {address?.slice(0, 6)}...{address?.slice(-4)}
                                        </span>
                                      </div>
                                    )}

                                <div className="h-px bg-gray-100 my-1 mx-2" />
                                
                                <button 
                                  onClick={() => {
                                    setShowUserDropdown(false);
                                    handleLogout();
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Logout
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                    <button 
                      onClick={() => {
                        setLoginRedirectTo(undefined);
                        setShowTermsModal(true);
                      }}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full font-sans font-medium outline-none transition-all duration-200 ease-in-out border-transparent h-9 gap-2 px-4 sm:px-5 py-1.5 text-[0.875rem] bg-black text-white hover:opacity-90 active:scale-95 shadow-soft"
                    >
                      Login
                      <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                    </button>
                  )}
                </div>
                
                {/* Theme Toggle */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition-colors" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                    )}
                  </button>
                )}
              </div>
            </div>


            {/* Mobile Menu Toggle */}
            <button className="text-2xl md:hidden text-foreground hover:text-primary transition-colors">
              <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => {
          setShowTermsModal(false);
          setLoginRedirectTo(undefined);
        }}
        redirectTo={loginRedirectTo}
      />
    </nav>
  );
};

export default Navigation;