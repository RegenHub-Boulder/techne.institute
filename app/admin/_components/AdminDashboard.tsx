'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SessionForm from './SessionForm'
import ResourceForm from './ResourceForm'
import ProjectAdminTable from './ProjectAdminTable'

interface Cohort { id: string; name: string; slug: string }
interface Session {
  id: string; cohort_id: string; week_number: number; title: string
  youtube_url: string | null; notes: string | null; published_at: string | null; created_at: string
}
interface Resource {
  id: string; cohort_id: string; title: string; url: string; resource_type: string; created_at: string
}
interface AdminProject {
  id: string; cohort_id: string; user_id: string; title: string
  url: string | null; description: string | null; featured: boolean; created_at: string
  profiles: { display_name: string | null } | null
}

interface Props {
  cohorts: Cohort[]
  sessions: Session[]
  resources: Resource[]
  projects: AdminProject[]
  activeTab: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function AdminDashboard({ cohorts, sessions, resources, projects, activeTab }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState(activeTab)
  const [selectedCohortId, setSelectedCohortId] = useState(cohorts[0]?.id ?? '')
  const [showAddSession, setShowAddSession] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [showAddResource, setShowAddResource] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)

  const cohortSessions = sessions.filter((s) => s.cohort_id === selectedCohortId)
  const cohortResources = resources.filter((r) => r.cohort_id === selectedCohortId)
  const cohortProjects = projects.filter((p) => p.cohort_id === selectedCohortId)

  async function deleteSession(id: string) {
    if (!confirm('Delete this session? This cannot be undone.')) return
    await supabase.from('sessions').delete().eq('id', id)
    router.refresh()
  }

  async function deleteResource(id: string) {
    if (!confirm('Delete this resource? This cannot be undone.')) return
    await supabase.from('resources').delete().eq('id', id)
    router.refresh()
  }

  if (cohorts.length === 0) {
    return (
      <div className="empty-state">
        <p>No active cohorts. Create one in the Supabase dashboard.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Cohort selector */}
      {cohorts.length > 1 && (
        <div className="form-group" style={{ maxWidth: '300px', marginBottom: '2rem' }}>
          <label>Cohort</label>
          <select
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="cohort-tabs" style={{ marginBottom: '2rem' }}>
        <button
          className={`cohort-tab${tab === 'sessions' ? ' active' : ''}`}
          onClick={() => setTab('sessions')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Sessions ({cohortSessions.length})
        </button>
        <button
          className={`cohort-tab${tab === 'resources' ? ' active' : ''}`}
          onClick={() => setTab('resources')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Resources ({cohortResources.length})
        </button>
        <button
          className={`cohort-tab${tab === 'projects' ? ' active' : ''}`}
          onClick={() => setTab('projects')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Builds ({cohortProjects.length})
        </button>
      </div>

      {/* Sessions tab */}
      {tab === 'sessions' && (
        <div>
          {!showAddSession && !editingSession && (
            <button
              onClick={() => setShowAddSession(true)}
              className="btn btn-primary"
              style={{ marginBottom: '1.5rem' }}
            >
              + Add Session
            </button>
          )}

          {showAddSession && (
            <SessionForm
              cohortId={selectedCohortId}
              onCancel={() => setShowAddSession(false)}
            />
          )}

          {editingSession && (
            <SessionForm
              cohortId={selectedCohortId}
              session={editingSession}
              onCancel={() => setEditingSession(null)}
            />
          )}

          {cohortSessions.length === 0 ? (
            <div className="empty-state">
              <p>No sessions yet. Add the first one above.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Wk</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cohortSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--stone)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{s.week_number}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{s.title}</td>
                    <td>
                      <span className={`badge ${s.published_at ? 'badge-published' : 'badge-draft'}`}>
                        {s.published_at ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--stone)' }}>
                      {formatDate(s.created_at)}
                    </td>
                    <td>
                      <button
                        onClick={() => { setEditingSession(s); setShowAddSession(false) }}
                        className="action-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSession(s.id)}
                        className="action-link danger"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Resources tab */}
      {tab === 'resources' && (
        <div>
          {!showAddResource && !editingResource && (
            <button
              onClick={() => setShowAddResource(true)}
              className="btn btn-primary"
              style={{ marginBottom: '1.5rem' }}
            >
              + Add Resource
            </button>
          )}

          {showAddResource && (
            <ResourceForm
              cohortId={selectedCohortId}
              onCancel={() => setShowAddResource(false)}
            />
          )}

          {editingResource && (
            <ResourceForm
              cohortId={selectedCohortId}
              resource={editingResource}
              onCancel={() => setEditingResource(null)}
            />
          )}

          {cohortResources.length === 0 ? (
            <div className="empty-state">
              <p>No resources yet. Add the first one above.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cohortResources.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="badge badge-draft" style={{ textTransform: 'capitalize' }}>
                        {r.resource_type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{r.title}</td>
                    <td>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--stone)', textDecoration: 'none' }}
                      >
                        {safeHostname(r.url)}
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => { setEditingResource(r); setShowAddResource(false) }}
                        className="action-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteResource(r.id)}
                        className="action-link danger"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Builds tab */}
      {tab === 'projects' && (
        <ProjectAdminTable projects={cohortProjects} />
      )}
    </div>
  )
}
