import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint checks for rounds that should be marked as completed:
// - end_date has passed
// - current_amount >= target_amount (cap reached)
// Marks them as completed immediately so they show as "Closed Recently" for 24 hours.

export async function GET(request: Request) {
  // Optional: verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without auth in development or if no secret is set
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()

  try {
    // Find rounds that should be completed:
    // 1. Status is not already 'completed'
    // 2. Either: end_date has passed
    // 3. Or: current_amount >= target_amount (cap reached)

    // First, get rounds where end_date has passed
    const { data: expiredRounds, error: expiredError } = await supabase
      .from('project_rounds')
      .select('id, name, status, end_date')
      .neq('status', 'completed')
      .lt('end_date', now)

    if (expiredError) throw expiredError

    // Second, get rounds where cap was reached (we need to check this separately)
    const { data: allActiveRounds, error: activeError } = await supabase
      .from('project_rounds')
      .select('id, name, status, target_amount, current_amount, created_at')
      .neq('status', 'completed')
      .gt('target_amount', 0)

    if (activeError) throw activeError

    // Filter to those where cap is reached
    const capReachedRounds = (allActiveRounds || []).filter(r => {
      const target = Number(r.target_amount) || 0
      const current = Number(r.current_amount) || 0
      const tolerance = target * 0.0001 // 0.01% tolerance
      return target > 0 && current >= (target - tolerance)
    })

    // Combine both lists (expired + cap reached), removing duplicates
    const roundsToComplete = [
      ...(expiredRounds || []),
      ...capReachedRounds
    ].filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)

    if (roundsToComplete.length === 0) {
      return NextResponse.json({ 
        message: 'No rounds to complete',
        checked: (expiredRounds?.length || 0) + (allActiveRounds?.length || 0)
      })
    }

    // Update them to completed
    const { error: updateError } = await supabase
      .from('project_rounds')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .in('id', roundsToComplete.map(r => r.id))

    if (updateError) throw updateError

    return NextResponse.json({
      message: `Marked ${roundsToComplete.length} round(s) as completed`,
      rounds: roundsToComplete.map(r => ({ id: r.id, name: r.name }))
    })

  } catch (err: any) {
    console.error('Cron complete-rounds error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

