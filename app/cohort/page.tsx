import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SessionCard from './_components/SessionCard'
import ResourceList from './_components/ResourceList'
import CohortDirectory from './_components/CohortDirectory'

export const metadata: Metadata = {
  title: 'Cohort',
}

export default async function CohortPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'sessions' } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/signin?next=/cohort')

  // Get enrollment + cohort info
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('cohort_id, cohorts(id, name, starts_at, ends_at)')
    .eq('user_id', user.id)
    .single()

  if (!enrollment) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>You don&apos;t have an active cohort enrollment.</p>
          <Link href="/programs" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            View Open Cohorts
          </Link>
        </div>
      </div>
    )
  }

  const cohort = enrollment.cohorts as unknown as { id: string; name: string; starts_at: string | null; ends_at: string | null }

  // Fetch sessions, resources, directory members in parallel
  const [sessionsResult, resourcesResult, directoryResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, week_number, title, youtube_url, notes, published_at')
      .eq('cohort_id', cohort.id)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('week_number', { ascending: true })
      .order('published_at', { ascending: true }),

    supabase
      .from('resources')
      .select('id, title, url, resource_type')
      .eq('cohort_id', cohort.id)
      .order('created_at', { ascending: true }),

    supabase
      .from('enrollments')
      .select('profiles(display_name)')
      .eq('cohort_id', cohort.id),
  ])

  const sessions = sessionsResult.data ?? []
  const resources = resourcesResult.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const directoryMembers = ((directoryResult.data ?? []) as any[])
    .map((e) => ({
      display_name: (Array.isArray(e.profiles) ? e.profiles[0]?.display_name : e.profiles?.display_name) ?? null,
    }))
    .filter((m: { display_name: string | null }) => m.display_name)

  function formatDate(iso: string | null) {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.25rem' }}>
          {cohort.name}
        </h1>
        {cohort.starts_at && (
          <p className="subtitle">
            {formatDate(cohort.starts_at)}
            {cohort.ends_at && ` — ${formatDate(cohort.ends_at)}`}
          </p>
        )}
        <div style={{ marginTop: '0.75rem' }}>
          <Link href="/cohort/profile" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--stone)', textDecoration: 'none', letterSpacing: '0.08em' }}>
            Edit Profile →
          </Link>
        </div>
      </div>

      <div className="cohort-tabs">
        <Link
          href="/cohort?tab=sessions"
          className={`cohort-tab${tab === 'sessions' ? ' active' : ''}`}
        >
          Sessions {sessions.length > 0 && `(${sessions.length})`}
        </Link>
        <Link
          href="/cohort?tab=resources"
          className={`cohort-tab${tab === 'resources' ? ' active' : ''}`}
        >
          Resources {resources.length > 0 && `(${resources.length})`}
        </Link>
        <Link
          href="/cohort?tab=directory"
          className={`cohort-tab${tab === 'directory' ? ' active' : ''}`}
        >
          Directory
        </Link>
      </div>

      {tab === 'sessions' && (
        <div>
          {sessions.length === 0 ? (
            <div className="empty-state">
              <p>Sessions will appear here as they&apos;re published.</p>
              {cohort.starts_at && new Date(cohort.starts_at) > new Date() && (
                <p>This cohort starts {formatDate(cohort.starts_at)}.</p>
              )}
            </div>
          ) : (
            sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </div>
      )}

      {tab === 'resources' && <ResourceList resources={resources} />}

      {tab === 'directory' && <CohortDirectory members={directoryMembers} />}
    </div>
  )
}
