import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { IntranetHeader } from '../components/IntranetHeader.jsx'

const statusColor = {
  active: '#4caf82',
  paused: '#f0c040',
  completed: '#7eb8e8',
  archived: '#666',
}

export default function Projects() {
  const { isSteward } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, name, description, type, status, created_at,
        project_participants(
          role,
          participants(id, name)
        ),
        project_milestones(id, title, status, due_date)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = projects.filter((p) => {
    if (typeFilter && p.type !== typeFilter) return false
    if (statusFilter && p.status !== statusFilter) return false
    return true
  })

  return (
    <div style={styles.page}>
      <IntranetHeader />
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>{selected ? <><a href="#" style={styles.breadLink} onClick={(e) => { e.preventDefault(); setSelected(null) }}>Projects</a> <span style={styles.breadSep}>/</span> {selected.name}</> : 'Projects & Ventures'}</span>
        </nav>

        {!selected && (
          <>
            <div style={styles.pageHeader}>
              <h1 style={styles.h1}>Projects & Ventures</h1>
              {isSteward && (
                <button style={styles.addBtn} onClick={() => setCreating(true)}>+ New</button>
              )}
            </div>

            <div style={styles.filters}>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={styles.select}>
                <option value="">All types</option>
                <option value="project">Projects</option>
                <option value="venture">Ventures</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {loading && <div style={styles.loading}>Loading…</div>}
            {!loading && error && <div style={styles.error}>{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div style={styles.empty}>No {typeFilter || ''} {statusFilter || ''} projects found.</div>
            )}

            {!loading && !error && (
              <div style={styles.list}>
                {filtered.map((p) => (
                  <ProjectRow key={p.id} project={p} onClick={() => setSelected(p)} />
                ))}
              </div>
            )}
          </>
        )}

        {selected && (
          <ProjectDetail
            project={selected}
            isSteward={isSteward}
            onBack={() => { setSelected(null); load() }}
          />
        )}

        {creating && isSteward && (
          <CreateProjectModal
            onClose={() => setCreating(false)}
            onCreate={() => { setCreating(false); load() }}
          />
        )}
      </div>
    </div>
  )
}

function ProjectRow({ project, onClick }) {
  const contributors = project.project_participants || []
  const activeMilestones = (project.project_milestones || []).filter(m => m.status !== 'completed' && m.status !== 'cancelled')

  return (
    <div style={styles.row} onClick={onClick}>
      <div style={styles.rowLeft}>
        <div style={styles.rowName}>{project.name}</div>
        {project.description && (
          <div style={styles.rowDesc}>{project.description.slice(0, 120)}{project.description.length > 120 ? '…' : ''}</div>
        )}
        <div style={styles.rowMeta}>
          {contributors.length > 0 && (
            <span style={styles.metaItem}>
              {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
            </span>
          )}
          {activeMilestones.length > 0 && (
            <span style={styles.metaItem}>
              {activeMilestones.length} open milestone{activeMilestones.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <div style={styles.rowRight}>
        <span style={{ ...styles.typeBadge, color: project.type === 'venture' ? 'var(--color-copper, #c87533)' : '#7eb8e8' }}>
          {project.type}
        </span>
        <span style={{ ...styles.statusDot, background: statusColor[project.status] || '#888' }} />
        <span style={styles.statusLabel}>{project.status}</span>
      </div>
    </div>
  )
}

function ProjectDetail({ project, isSteward, onBack }) {
  const contributors = project.project_participants || []
  const milestones = project.project_milestones || []

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>← Back to Projects</button>

      <div style={styles.detailHeader}>
        <h1 style={styles.h1}>{project.name}</h1>
        <div style={styles.detailBadges}>
          <span style={{ ...styles.typeBadge, color: project.type === 'venture' ? 'var(--color-copper, #c87533)' : '#7eb8e8' }}>
            {project.type}
          </span>
          <span style={{ ...styles.statusDot, background: statusColor[project.status] || '#888' }} />
          <span style={styles.statusLabel}>{project.status}</span>
        </div>
      </div>

      {project.description && (
        <p style={styles.detailDesc}>{project.description}</p>
      )}

      {contributors.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.h2}>Contributors</h2>
          <div style={styles.contributorList}>
            {contributors.map((cp) => (
              <div key={cp.participants?.id || cp.role} style={styles.contributor}>
                <div style={styles.contributorAvatar}>
                  {(cp.participants?.name || '?').charAt(0)}
                </div>
                <div>
                  <div style={styles.contributorName}>{cp.participants?.name}</div>
                  <div style={styles.contributorRole}>{cp.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestones.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.h2}>Milestones</h2>
          <div style={styles.milestoneList}>
            {milestones.map((m) => (
              <div key={m.id} style={styles.milestone}>
                <span style={{ ...styles.milestoneStatus, color: statusColor[m.status] || '#888' }}>●</span>
                <div>
                  <div style={styles.milestoneTitle}>{m.title}</div>
                  {m.due_date && (
                    <div style={styles.milestoneDue}>Due {new Date(m.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CreateProjectModal({ onClose, onCreate }) {
  const { participant } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('project')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('projects').insert({
      name: name.trim(),
      description: description.trim() || null,
      type,
      status: 'active',
      created_by: participant?.id,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
    } else {
      onCreate()
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>New Project / Venture</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            required
          />
          <label style={styles.label}>Type</label>
          <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="project">Project</option>
            <option value="venture">Venture</option>
          </select>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: '#888', marginBottom: '1rem' },
  breadLink: { color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' },
  addBtn: {
    padding: '0.5rem 1rem', background: 'var(--color-copper, #c87533)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem',
    fontWeight: 600, cursor: 'pointer',
  },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  select: {
    background: '#141418', border: '1px solid #2a2a35',
    color: '#e8e8e0', borderRadius: '6px', padding: '0.4rem 0.75rem',
    fontSize: '0.8rem', cursor: 'pointer',
  },
  loading: { color: '#888', padding: '2rem 0', fontSize: '0.875rem' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem' },
  empty: { padding: '2rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#141418', border: '1px solid #2a2a35',
    borderRadius: '10px', padding: '1.25rem', cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  rowLeft: { flex: 1, minWidth: 0, paddingRight: '1rem' },
  rowName: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' },
  rowDesc: { fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', lineHeight: 1.4 },
  rowMeta: { display: 'flex', gap: '1rem' },
  metaItem: { fontSize: '0.75rem', color: '#888' },
  rowRight: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
  typeBadge: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  statusLabel: { fontSize: '0.75rem', color: '#888' },
  backBtn: {
    background: 'none', border: 'none', color: '#888', cursor: 'pointer',
    fontSize: '0.875rem', marginBottom: '1.5rem', padding: 0,
  },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  detailBadges: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  detailDesc: { color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '600px' },
  section: { marginBottom: '2rem' },
  contributorList: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
  contributor: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#141418', border: '1px solid #2a2a35',
    borderRadius: '8px', padding: '0.75rem 1rem',
  },
  contributorAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(200,117,51,0.15)', color: 'var(--color-copper, #c87533)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
  },
  contributorName: { fontSize: '0.875rem', fontWeight: 600 },
  contributorRole: { fontSize: '0.75rem', color: '#888' },
  milestoneList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  milestone: {
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    background: '#141418', border: '1px solid #2a2a35',
    borderRadius: '8px', padding: '0.75rem 1rem',
  },
  milestoneStatus: { fontSize: '0.875rem', marginTop: '0.1rem', flexShrink: 0 },
  milestoneTitle: { fontSize: '0.875rem', fontWeight: 500 },
  milestoneDue: { fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#141418', border: '1px solid #2a2a35',
    borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px',
    margin: '1rem',
  },
  modalTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' },
  label: { display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    width: '100%', padding: '0.65rem 0.9rem',
    background: '#0a0a0f', border: '1px solid #2a2a35',
    color: '#e8e8e0', borderRadius: '6px', fontSize: '0.875rem',
    marginBottom: '1rem', boxSizing: 'border-box', outline: 'none',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: {
    background: 'none', border: '1px solid #2a2a35',
    color: '#888', borderRadius: '6px', padding: '0.5rem 1rem',
    fontSize: '0.875rem', cursor: 'pointer',
  },
  submitBtn: {
    background: 'var(--color-copper, #c87533)', border: 'none',
    color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
  },
}
