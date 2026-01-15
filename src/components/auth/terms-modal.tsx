"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

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

  export function TermsModal({ isOpen, onClose, redirectTo }: TermsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();
  
    const handleDiscordLogin = async () => {
      setIsLoading(true);
      const callbackUrl = redirectTo 
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: callbackUrl,
        },
      });
  
      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[420px] p-8 border-none bg-white rounded-[32px] shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-[1.75rem] font-bold text-black text-center">Welcome to 3SEARCH</DialogTitle>
            <p className="text-base text-[#949494] text-center leading-relaxed mt-2">
              Sign in with Discord to access private rounds and community features.
            </p>
          </DialogHeader>
  
          <div className="space-y-4">
            <Button 
              onClick={handleDiscordLogin}
              disabled={isLoading}
              className="w-full h-[56px] rounded-full text-base font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all flex items-center justify-center gap-3 border-none shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  Connecting...
                </span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.2259 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                  Sign in with Discord
                </>
              )}
            </Button>
            
            <button 
              onClick={onClose}
              className="w-full text-center text-[#949494] hover:text-black font-medium py-2 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

