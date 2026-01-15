'use server';

import { sendApprovalMessage } from '@/lib/discord';
import { createClient } from '@/lib/supabase/server';

export async function submitDueDiligenceAction(values: {
  referral: string;
  twitter: string;
  yearsExperience: string;
  averageInvestment: string;
  aboutSelf: string;
  country: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if Panama
  if (values.country.toLowerCase().includes('panama')) {
    return { success: false, rejected: true };
  }

  // Insert into DB
  const { error: dbError } = await supabase.from('due_diligence_submissions').insert({
    user_id: user.id,
    referral: values.referral,
    twitter: values.twitter,
    years_experience: values.yearsExperience,
    average_investment: values.averageInvestment,
    about_self: values.aboutSelf,
    country: values.country,
    disclaimer_accepted: true,
    status: 'pending',
  });

  if (dbError) {
    console.error('Error submitting DD to DB:', dbError);
    return { success: false, error: dbError.message };
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({ 
      has_completed_onboarding: true,
    })
    .eq('id', user.id);

  // Send Discord message
  const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub;
  const discordUsername = user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown';
  
  if (discordId) {
    await sendApprovalMessage(
      user.id,
      discordId,
      discordUsername,
      user.email || '',
      values
    );
  }

  return { success: true };
}
