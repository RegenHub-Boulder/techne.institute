import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { cohortSlug } = await request.json()

    if (!cohortSlug) {
      return NextResponse.json({ error: 'cohortSlug is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: cohort, error } = await supabase
      .from('cohorts')
      .select('id, name, price_cents, stripe_price_id, enrollment_open, is_active')
      .eq('slug', cohortSlug)
      .single()

    if (error || !cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 })
    }

    if (!cohort.is_active || !cohort.enrollment_open) {
      return NextResponse.json({ error: 'Enrollment is not open for this cohort' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://techne.institute'

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      line_items: cohort.stripe_price_id
        ? [
            {
              price: cohort.stripe_price_id,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency: 'usd',
                unit_amount: cohort.price_cents,
                product_data: {
                  name: cohort.name,
                  description: 'Techne Institute — AI Building Cohort',
                },
              },
              quantity: 1,
            },
          ],
      success_url: `${appUrl}/enroll/${cohortSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/enroll/${cohortSlug}`,
      metadata: {
        cohort_slug: cohortSlug,
        cohort_id: cohort.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
