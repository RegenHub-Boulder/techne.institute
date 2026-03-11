import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from './_components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin',
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'sessions' } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/signin?next=/admin')

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/cohort')

  // Load all cohorts, sessions, resources, and projects
  const [cohortsResult, sessionsResult, resourcesResult, projectsResult] = await Promise.all([
    supabase
      .from('cohorts')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('starts_at', { ascending: true }),

    supabase
      .from('sessions')
      .select('id, cohort_id, week_number, title, youtube_url, notes, published_at, created_at')
      .order('cohort_id')
      .order('week_number'),

    supabase
      .from('resources')
      .select('id, cohort_id, title, url, resource_type, created_at')
      .order('cohort_id')
      .order('created_at'),

    supabase
      .from('projects')
      .select('id, cohort_id, user_id, title, url, description, featured, created_at, profiles(display_name)')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <p className="section-mark" style={{ marginBottom: '0.25rem' }}>Admin</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', margin: 0 }}>
            Dashboard
          </h1>
        </div>
        <a href="/cohort" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--stone)', textDecoration: 'none' }}>
          ← View Cohort
        </a>
      </div>

      <AdminDashboard
        cohorts={cohortsResult.data ?? []}
        sessions={sessionsResult.data ?? []}
        resources={resourcesResult.data ?? []}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projects={(projectsResult.data ?? []) as any[]}
        activeTab={tab}
      />
    </div>
  )
}
