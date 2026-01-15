import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkUserHasInnerCircleRole, sendApprovalMessage } from '@/lib/discord'

async function createServiceClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding/due-diligence'

    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub
          const discordUsername = user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown'
          const email = user.email || ''
          
          const serviceClient = await createServiceClient()
          
          const { data: existingProfile } = await serviceClient
            .from('profiles')
            .select('approved, has_inner_circle_role, terms_accepted, has_completed_onboarding')
            .eq('id', user.id)
            .single()

          let hasInnerCircleRole = false
          let approved = existingProfile?.approved || false
          
          if (discordId) {
            hasInnerCircleRole = await checkUserHasInnerCircleRole(discordId)
          }
          
          if (hasInnerCircleRole) {
            approved = true
          }

          await serviceClient
            .from('profiles')
            .upsert({
              id: user.id,
              email: email,
              discord_id: discordId,
              discord_username: discordUsername,
              has_inner_circle_role: hasInnerCircleRole,
              approved: approved,
            })

          // Determine where to redirect based on onboarding status
          let redirectPath = next
          if (!existingProfile?.terms_accepted) {
            redirectPath = `/onboarding/terms${next !== '/onboarding/due-diligence' ? `?next=${encodeURIComponent(next)}` : ''}`
          } else if (!existingProfile?.has_completed_onboarding) {
            redirectPath = `/onboarding/due-diligence${next !== '/onboarding/due-diligence' ? `?next=${encodeURIComponent(next)}` : ''}`
          } else if (next === '/onboarding/due-diligence') {
            redirectPath = '/dashboard'
          }

          const forwardedHost = request.headers.get('x-forwarded-host')
          const isLocalEnv = process.env.NODE_ENV === 'development'
          
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${redirectPath}`)
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
          } else {
            return NextResponse.redirect(`${origin}${redirectPath}`)
          }
        }
      }
    }


  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
