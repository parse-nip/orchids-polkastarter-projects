"use client";

  import React, { useState, useEffect } from 'react';
  import { useRouter, useSearchParams } from 'next/navigation';
  import { Checkbox } from '@/components/ui/checkbox';
  import { Button } from '@/components/ui/button';
  import Navigation from '@/components/sections/navigation';
  import Footer from '@/components/sections/coinlist-footer';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
    
    const terms = [
    {
      id: 'tos',
      label: 'I agree to the Terms of Service and the Privacy Policy',
    },
    {
      id: 'shell-bank',
      label: 'I agree that this account is not a foreign financial institution or foreign shell bank',
    },
    {
      id: 'private-banking',
      label: 'I agree not to fund this account from a private banking account',
    },
    {
      id: 'pep',
      label: 'I agree that I am not a politically exposed person (PEP) or immediate family or close associate of a politically exposed person',
    },
    {
      id: 'finra',
      label: 'I agree that I am not – nor is anyone in my immediate household – associated with FINRA, a FINRA-member broker-dealer, or the SEC',
    },
  ];
  
    export default function TermsPage() {
      const router = useRouter();
      const searchParams = useSearchParams();
      const next = searchParams.get('next');
      const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      const supabase = createClient();
    
      useEffect(() => {
        const checkUser = async () => {
          const timeoutId = setTimeout(() => {
            console.warn('Terms check timed out');
            setIsLoading(false);
          }, 8000);

          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              router.push('/auth/login?next=/onboarding/terms');
              return;
            }

            const { data: profile } = await supabase
              .from('profiles')
              .select('terms_accepted')
              .eq('id', user.id)
              .single();

            if (profile?.terms_accepted) {
              router.push(`/onboarding/due-diligence${next ? `?next=${encodeURIComponent(next)}` : ''}`);
              return;
            }
          } catch (err) {
            console.error('Terms check error:', err);
          } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
          }
        };
        checkUser();
      }, [router, supabase, next]);

      const handleCheckboxChange = (id: string, checked: boolean) => {
        setCheckedItems((prev) => ({ ...prev, [id]: checked }));
      };
    
      const allChecked = terms.every((term) => checkedItems[term.id]);
    
      const handleContinue = async () => {
        if (!allChecked || isSubmitting) return;
        
        setIsSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }
    
        const { error } = await supabase
          .from('profiles')
          .update({ 
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString()
          })
          .eq('id', user.id);
    
        if (error) {
          console.error('Error updating terms:', error);
          setIsSubmitting(false);
          return;
        }
    
        const ddPath = `/onboarding/due-diligence${next ? `?next=${encodeURIComponent(next)}` : ''}`;
        router.push(ddPath);
      };
  
    if (isLoading) {
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
    <main className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[480px] w-full">
          <h1 className="text-[2.5rem] font-bold text-black mb-4">Verify your identity</h1>
          <p className="text-[1.25rem] text-[#949494] mb-12 leading-relaxed">
            Agree to the terms below to start your identity verification. You can continue to 3SEARCH Capital once we have verified your identity.
          </p>

          <div className="space-y-8 mb-12">
            {terms.map((term) => (
              <div key={term.id} className="flex items-start gap-4 group cursor-pointer" onClick={() => handleCheckboxChange(term.id, !checkedItems[term.id])}>
                <Checkbox 
                  id={term.id} 
                  checked={checkedItems[term.id]}
                  onCheckedChange={(checked) => handleCheckboxChange(term.id, checked as boolean)}
                  className="mt-1 h-6 w-6 rounded-md border-2 border-[#ebebeb] data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
                <label 
                  htmlFor={term.id}
                  className="text-lg text-[#333333] leading-snug font-medium cursor-pointer group-hover:text-black transition-colors"
                >
                  {term.label}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleContinue}
              disabled={!allChecked}
              className="w-full h-[60px] rounded-full text-lg font-bold bg-black text-white hover:bg-black/90 disabled:bg-[#ebebeb] disabled:text-[#949494] transition-all"
            >
              Agree and continue
            </Button>
            
            <button 
              onClick={() => router.push('/')}
              className="w-full text-center text-[#949494] hover:text-black font-medium py-2 transition-colors"
            >
              Decline and go back
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
