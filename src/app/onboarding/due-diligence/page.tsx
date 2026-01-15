"use client";

  import React, { useState, useEffect } from 'react';
  import { useRouter, useSearchParams } from 'next/navigation';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Textarea } from '@/components/ui/textarea';
  import { Checkbox } from '@/components/ui/checkbox';
  import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
  import Navigation from '@/components/sections/navigation';
  import Footer from '@/components/sections/coinlist-footer';
import { createClient } from '@/lib/supabase/client';
import { submitDueDiligenceAction } from './actions';
import { Loader2 } from 'lucide-react';
  
  const formSchema = z.object({
    referral: z.string().min(1, "Please tell us where you heard about us"),
    twitter: z.string().min(1, "Please provide your X (Twitter) account"),
    yearsExperience: z.string().min(1, "Please specify your years of experience"),
    averageInvestment: z.string().min(1, "Please specify your average investment amount"),
    aboutSelf: z.string().min(10, "Please tell us more about yourself (min 10 characters)"),
    country: z.string().min(1, "Please specify your country of residence"),
    disclaimer: z.boolean().refine(val => val === true, "You must accept the disclaimer to proceed"),
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  export default function DueDiligencePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next');
    const [isRejected, setIsRejected] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
  
      useEffect(() => {
        const getUser = async () => {
          const timeoutId = setTimeout(() => {
            console.warn('Due diligence check timed out');
            setIsLoading(false);
          }, 8000);

          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              router.push('/');
              return;
            }
            
            // Check if user already completed onboarding
            const { data: profile } = await supabase
              .from('profiles')
              .select('has_completed_onboarding, terms_accepted')
              .eq('id', user.id)
              .single();
    
            if (!profile?.terms_accepted) {
              router.push(`/onboarding/terms${next ? `?next=${encodeURIComponent(next)}` : ''}`);
              return;
            }
  
            if (profile?.has_completed_onboarding) {
              router.push(next || '/projects');
              return;
            }
    
            setUser(user);
          } catch (err) {
            console.error('Due diligence check error:', err);
          } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
          }
        };
        getUser();
      }, [router, supabase.auth, next]);
  
    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        referral: "",
        twitter: "",
        yearsExperience: "",
        averageInvestment: "",
        aboutSelf: "",
        country: "",
        disclaimer: false,
      },
    });
  
    async function onSubmit(values: FormValues) {
      if (!user) return;
  
      if (values.country.toLowerCase().includes("panama")) {
        setIsRejected(true);
        return;
      }
  
      setIsSubmitting(true);
  
      try {
        const result = await submitDueDiligenceAction(values);
  
        if (result.rejected) {
          setIsRejected(true);
          setIsSubmitting(false);
          return;
        }
  
        if (!result.success) {
          console.error('Error submitting form:', result.error);
          setIsSubmitting(false);
          return;
        }
  
        router.push(next || '/projects');
      } catch (error) {
        console.error('Submission error:', error);
        setIsSubmitting(false);
      }
    }


  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#00d1ff] animate-spin" />
            <p className="mt-4 text-slate-400 font-medium">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (isRejected) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-[480px] w-full text-center">
            <h1 className="text-[2.5rem] font-bold text-black mb-4">Application Declined</h1>
            <p className="text-[1.25rem] text-[#949494] mb-8 leading-relaxed">
              Unfortunately, we cannot proceed with your application at this time as we do not support residents of Panama.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full h-[60px] rounded-full text-lg font-bold bg-black text-white hover:bg-black/90 transition-all"
            >
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      <div className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="max-w-[600px] w-full">
          <h1 className="text-[2.5rem] font-bold text-black mb-2">Due Diligence</h1>
          <p className="text-[1.125rem] text-[#949494] mb-12">
            Please fill out this form to help us understand your experience and investment goals.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="referral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-black">
                      Where did you hear about 3SEARCH? Please specify the crypto community, person, or platform that brought you here.
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Twitter, Friend, Telegram..." className="h-[50px] rounded-xl border-[#ebebeb] focus:border-black transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-black">
                      What is your X (Twitter) account? Don't forget to follow us on our socials for a higher chance of getting in our Inner Circle.
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="@username" className="h-[50px] rounded-xl border-[#ebebeb] focus:border-black transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-black">
                        Years involved in the crypto space
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 3 years" className="h-[50px] rounded-xl border-[#ebebeb] focus:border-black transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="averageInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-black">
                        Average amount ready to invest per private round
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $5,000" className="h-[50px] rounded-xl border-[#ebebeb] focus:border-black transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="aboutSelf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-black">
                      Tell us more about yourself and your crypto experience, and why you believe 3SEARCH is the place for you
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="I've been trading since..." 
                        className="min-h-[120px] rounded-xl border-[#ebebeb] focus:border-black transition-all resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-black">
                      Country of residence
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="United States, United Kingdom..." className="h-[50px] rounded-xl border-[#ebebeb] focus:border-black transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disclaimer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-2xl border border-[#ebebeb] p-6 bg-[#fafafa]">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-6 w-6 rounded-md border-2 border-[#ebebeb] data-[state=checked]:bg-black data-[state=checked]:border-black mt-1"
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="text-sm text-[#666] leading-relaxed cursor-pointer">
                        <span className="font-bold text-black block mb-2">Disclaimer</span>
                        I confirm that I am an accredited or professional investor participating voluntarily and at my own risk. I declare that I am not a resident of Panama, that all funds used are from legitimate and non-fraudulent sources. I understand that opportunities do not constitute financial advice, and that 3SEARCH Capital is not liable for any losses, including but not limited to project failure, rug pulls, scams, token misdelivery, hacks, vesting changes, currency risk, or user error. I accept full responsibility for my decision and confirm that I conduct my own due diligence. I will not rely on 3SEARCH's involvement or endorsement as a basis for my investments.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-[60px] rounded-full text-lg font-bold bg-black text-white hover:bg-black/90 transition-all disabled:bg-[#ebebeb] disabled:text-[#949494]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
