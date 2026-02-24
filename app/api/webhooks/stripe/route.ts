import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle checkout completion — covers both paid and 100%-off promo codes
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  try {
    await processEnrollment(session)
  } catch (err) {
    console.error('Enrollment processing error:', err)
    // Return 500 so Stripe retries with exponential backoff (up to 72 hours).
    // Idempotency check at the top of processEnrollment makes retries safe.
    return NextResponse.json({ error: 'Enrollment processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function processEnrollment(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()

  // Idempotency check — if we already processed this session, skip
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existing) {
    console.log(`Enrollment already exists for session ${session.id} — skipping`)
    return
  }

  const cohortId = session.metadata?.cohort_id
  const customerEmail = session.customer_details?.email

  if (!cohortId || !customerEmail) {
    throw new Error(`Missing cohort_id or customer email in session ${session.id}`)
  }

  // Find or create the Supabase user by email.
  // Uses a security-definer RPC to query auth.users directly — avoids the
  // listUsers() pagination issue where users beyond page 1 would not be found.
  const { data: existingUserId } = await supabase
    .rpc('get_auth_user_id_by_email', { p_email: customerEmail })

  let userId = existingUserId as string | null

  if (!userId) {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
    })

    if (createError || !newUser.user) {
      throw new Error(`Failed to create user for ${customerEmail}: ${createError?.message}`)
    }

    userId = newUser.user.id
  }

  // Create enrollment row
  const { error: enrollError } = await supabase.from('enrollments').insert({
    user_id: userId,
    cohort_id: cohortId,
    stripe_session_id: session.id,
  })

  if (enrollError) {
    // Unique constraint violation = already enrolled — idempotent
    if (enrollError.code === '23505') {
      console.log(`User ${userId} already enrolled in cohort ${cohortId}`)
    } else {
      throw new Error(`Failed to create enrollment: ${enrollError.message}`)
    }
  } else {
    console.log(`Enrolled ${customerEmail} in cohort ${cohortId} via session ${session.id}`)
  }

  // Send magic link so the student can access /cohort without going through /signin manually.
  // inviteUserByEmail works for both new and existing users.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://techne.institute'
  try {
    await supabase.auth.admin.inviteUserByEmail(customerEmail, {
      redirectTo: `${appUrl}/auth/callback?next=/cohort`,
    })
  } catch (err) {
    // Non-fatal — student can always sign in manually via /signin
    console.error(`Failed to send magic link for ${customerEmail}:`, err)
  }
}
