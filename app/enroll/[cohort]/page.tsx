import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EnrollButton from './_components/EnrollButton'

interface Props {
  params: Promise<{ cohort: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cohort: slug } = await params
  return {
    title: `Enroll — ${slug}`,
  }
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export default async function EnrollPage({ params }: Props) {
  const { cohort: slug } = await params
  const supabase = await createClient()

  const { data: cohort } = await supabase
    .from('cohorts')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!cohort) notFound()

  if (!cohort.enrollment_open) {
    return (
      <div className="enroll-container">
        <div className="enroll-closed">
          <p className="section-mark" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
            Enrollment Closed
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', marginBottom: '1rem' }}>
            {cohort.name}
          </h1>
          <p>Enrollment for this cohort is not currently open.</p>
          <a href="/programs" className="btn btn-secondary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            View All Programs
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="enroll-container">
      <p className="section-mark" style={{ marginBottom: '2rem' }}>Enrollment</p>

      <h1 className="enroll-cohort-name">{cohort.name}</h1>
      <p className="enroll-price">{formatPrice(cohort.price_cents)}</p>

      {cohort.description && (
        <p style={{ marginBottom: '2rem' }}>{cohort.description}</p>
      )}

      <div className="enroll-details">
        {cohort.starts_at && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', margin: 0 }}>
              Starts
            </p>
            <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(cohort.starts_at)}</p>
          </div>
        )}
        {cohort.ends_at && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', margin: 0 }}>
              Ends
            </p>
            <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(cohort.ends_at)}</p>
          </div>
        )}
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', margin: 0 }}>
            Investment
          </p>
          <p style={{ margin: 0, fontWeight: 500 }}>{formatPrice(cohort.price_cents)}</p>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--graphite)', marginBottom: '2rem' }}>
        Sliding scale available. Have a scholarship code? You can apply it at checkout.
        No refunds after week one begins — reach out if life intervenes.
      </p>

      <EnrollButton cohortSlug={slug} cohortName={cohort.name} />

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--stone)', marginTop: '1rem', letterSpacing: '0.05em' }}>
        Secure checkout via Stripe. You&apos;ll receive a sign-in link by email immediately after payment.
      </p>
    </div>
  )
}
