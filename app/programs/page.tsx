import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Open cohorts at Techne Institute. Build with AI in community.',
}

export const revalidate = 3600 // Re-fetch cohorts every hour

interface Cohort {
  id: string
  slug: string
  name: string
  description: string | null
  price_cents: number
  starts_at: string | null
  ends_at: string | null
  enrollment_open: boolean
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

export default async function ProgramsPage() {
  const supabase = await createClient()

  const { data: cohorts, error } = await supabase
    .from('cohorts')
    .select('id, slug, name, description, price_cents, starts_at, ends_at, enrollment_open')
    .eq('is_active', true)
    .order('starts_at', { ascending: true })

  const openCohorts = (cohorts as Cohort[] | null)?.filter((c) => c.enrollment_open) ?? []
  const upcomingCohorts = (cohorts as Cohort[] | null)?.filter((c) => !c.enrollment_open) ?? []

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="section-mark">Programs</p>
        <h1>Open Cohorts</h1>
        <p className="subtitle">Build with AI in community</p>
      </div>

      {error && (
        <div className="alert alert-error">
          Unable to load cohorts. Please refresh the page.
        </div>
      )}

      {openCohorts.length === 0 && upcomingCohorts.length === 0 && !error && (
        <div className="empty-state">
          <p>No cohorts are currently scheduled.</p>
          <p>
            Check back soon or{' '}
            <a href="mailto:ag@unforced.org" style={{ color: 'var(--ember)' }}>
              get in touch
            </a>{' '}
            to be notified when enrollment opens.
          </p>
        </div>
      )}

      {openCohorts.length > 0 && (
        <>
          <div className="programs-page-grid">
            {openCohorts.map((cohort) => (
              <div key={cohort.id} className="cohort-card">
                <div className="cohort-card-header">
                  <div>
                    <p className="section-mark" style={{ marginBottom: '0.5rem' }}>
                      Enrollment Open
                    </p>
                    <h2 className="enroll-cohort-name" style={{ fontSize: '1.75rem' }}>
                      {cohort.name}
                    </h2>
                  </div>
                  <p className="cohort-card-price">{formatPrice(cohort.price_cents)}</p>
                </div>

                {cohort.description && (
                  <p style={{ marginBottom: '1.5rem' }}>{cohort.description}</p>
                )}

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                  {cohort.starts_at && (
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'var(--stone)',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Starts
                      </p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(cohort.starts_at)}</p>
                    </div>
                  )}
                  {cohort.ends_at && (
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'var(--stone)',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Ends
                      </p>
                      <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(cohort.ends_at)}</p>
                    </div>
                  )}
                </div>

                <Link href={`/enroll/${cohort.slug}`} className="btn btn-primary">
                  Enroll — {formatPrice(cohort.price_cents)}
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {upcomingCohorts.length > 0 && (
        <>
          <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Upcoming</h3>
          <div className="programs-page-grid">
            {upcomingCohorts.map((cohort) => (
              <div key={cohort.id} className="cohort-card" style={{ opacity: 0.7 }}>
                <div className="cohort-card-header">
                  <h2 className="enroll-cohort-name" style={{ fontSize: '1.75rem' }}>
                    {cohort.name}
                  </h2>
                  <p className="cohort-card-price">{formatPrice(cohort.price_cents)}</p>
                </div>

                {cohort.description && <p>{cohort.description}</p>}

                {cohort.starts_at && (
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--stone)',
                      marginTop: '1rem',
                    }}
                  >
                    Starting {formatDate(cohort.starts_at)} — enrollment not yet open
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div
        style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--bone)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--stone)',
          letterSpacing: '0.05em',
        }}
      >
        <p>
          Sliding scale pricing available. Reach out to{' '}
          <a href="mailto:ag@unforced.org" style={{ color: 'var(--ember)' }}>
            ag@unforced.org
          </a>{' '}
          to discuss scholarship spots.
        </p>
      </div>
    </div>
  )
}
