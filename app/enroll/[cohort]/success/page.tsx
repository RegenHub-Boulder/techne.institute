import { notFound } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You\'re In!',
}

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function EnrollSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) notFound()

  // Retrieve the Stripe session to get the customer's email
  let customerEmail: string | null = null

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    customerEmail = session.customer_details?.email ?? null
  } catch (err) {
    console.error('Failed to retrieve Stripe session:', err)
    // Non-fatal — we still show the success page
  }

  // Send magic link to the customer's email so they can access /cohort
  if (customerEmail) {
    try {
      const supabase = createAdminClient()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://techne.institute'

      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: customerEmail,
        options: {
          redirectTo: `${appUrl}/auth/callback?next=/cohort`,
        },
      })

      // Note: generateLink returns the link but doesn't send the email.
      // Use inviteUserByEmail or signInWithOtp to trigger actual email sending.
      // For now we use the admin client to find-or-create the user, and the
      // webhook handles enrollment. The magic link email is sent below.

      await supabase.auth.admin.inviteUserByEmail(customerEmail, {
        redirectTo: `${appUrl}/auth/callback?next=/cohort`,
      })
    } catch (err) {
      // Non-fatal — user can still sign in manually via /signin
      console.error('Failed to send magic link:', err)
    }
  }

  return (
    <div className="success-container">
      <div className="success-icon">✓</div>
      <h1>You&apos;re in.</h1>
      <p
        style={{
          fontSize: '1.1rem',
          color: 'var(--graphite)',
          marginBottom: '2rem',
          lineHeight: 1.7,
        }}
      >
        {customerEmail ? (
          <>
            Check <strong>{customerEmail}</strong> — your access link is on the way.
            Click it to enter the cohort.
          </>
        ) : (
          <>Your enrollment is confirmed. Check your email for a sign-in link.</>
        )}
      </p>

      <div
        style={{
          background: 'var(--cream)',
          padding: '1.5rem',
          borderLeft: '2px solid var(--ember)',
          textAlign: 'left',
          marginBottom: '2rem',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--stone)',
            margin: '0 0 0.5rem',
          }}
        >
          Next Steps
        </p>
        <ol
          style={{
            paddingLeft: '1.25rem',
            margin: 0,
            fontSize: '0.9rem',
            color: 'var(--graphite)',
            lineHeight: 1.8,
          }}
        >
          <li>Open the email from Techne Institute</li>
          <li>Click the sign-in link</li>
          <li>Your cohort materials will be waiting</li>
        </ol>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--stone)',
          letterSpacing: '0.05em',
        }}
      >
        Didn&apos;t receive an email? Check spam, then{' '}
        <a href="/signin" style={{ color: 'var(--ember)' }}>
          sign in here
        </a>{' '}
        with the email you used at checkout.
      </p>
    </div>
  )
}
