'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminProject {
  id: string
  cohort_id: string
  user_id: string
  title: string
  url: string | null
  description: string | null
  featured: boolean
  created_at: string
  profiles: { display_name: string | null } | null
}

function safeHostname(url: string) {
  try { return new URL(url).hostname } catch { return url }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectAdminTable({ projects }: { projects: AdminProject[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function toggleFeatured(project: AdminProject) {
    await supabase.from('projects').update({ featured: !project.featured }).eq('id', project.id)
    router.refresh()
  }

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects submitted yet.</p>
      </div>
    )
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Title</th>
          <th>URL</th>
          <th>Featured</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id}>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--stone)' }}>
              {p.profiles?.display_name ?? '—'}
            </td>
            <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              {p.title}
              {p.description && (
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--stone)', marginTop: '0.2rem' }}>
                  {p.description}
                </span>
              )}
            </td>
            <td>
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--stone)', textDecoration: 'none' }}
                >
                  {safeHostname(p.url)}
                </a>
              ) : (
                <span style={{ color: 'var(--bone)', fontSize: '0.75rem' }}>—</span>
              )}
            </td>
            <td>
              <button
                onClick={() => toggleFeatured(p)}
                className="action-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? 'var(--ember)' : undefined }}
              >
                {p.featured ? 'Unfeature' : 'Feature'}
              </button>
            </td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--stone)' }}>
              {formatDate(p.created_at)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
