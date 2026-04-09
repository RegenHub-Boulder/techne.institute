import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

const laborTypeLabel = {
  governance: 'Governance',
  operations: 'Operations',
  project_work: 'Project Work',
  community: 'Community',
}

export default function Labor() {
  const { participant } = useAuth()
  const [contributions, setContributions] = useState([])
  const [projects, setProjects] = useState([])
  const [fmvRates, setFmvRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [dateRange, setDateRange] = useState('')

  async function load() {
    setLoading(true)
    const [contribRes, projectsRes, ratesRes] = await Promise.all([
      supabase
        .from('labor_contributions')
        .select('*, projects(name)')
        .eq('participant_id', participant?.id)
        .order('date', { ascending: false }),
      supabase
        .from('projects')
        .select('id, name')
        .eq('status', 'active')
        .order('name'),
      supabase
        .from('fmv_rates')
        .select('labor_type, hourly_rate'),
    ])

    if (contribRes.error) {
      setError(contribRes.error.message)
    } else {
      setContributions(contribRes.data || [])
    }
    setProjects(projectsRes.data || [])

    const rateMap = {}
    for (const r of ratesRes.data || []) {
      rateMap[r.labor_type] = r.hourly_rate
    }
    setFmvRates(rateMap)
    setLoading(false)
  }

  useEffect(() => {
    if (participant?.id) load()
  }, [participant?.id])

  const filtered = contributions.filter((c) => {
    if (!dateRange) return true
    const year = dateRange
    return c.date?.startsWith(year)
  })

  const totalHours = filtered.reduce((s, c) => s + parseFloat(c.hours || 0), 0)
  const totalFMV = filtered.reduce((s, c) => s + parseFloat(c.fmv_total || 0), 0)

  const years = [...new Set(contributions.map((c) => c.date?.slice(0, 4)).filter(Boolean))].sort().reverse()

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const fmtDate = (d) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Labor Contributions</span>
        </nav>

        <div style={styles.pageHeader}>
          <h1 style={styles.h1}>Labor Contributions</h1>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ Log Hours</button>
        </div>

        {loading && <div style={styles.loading}>Loading…</div>}
        {!loading && error && <div style={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            {/* Summary cards */}
            <div style={styles.summaryRow}>
              <SummaryCard label="Total Hours" value={totalHours.toFixed(1)} unit="hrs" />
              <SummaryCard label="Total FMV" value={fmt(totalFMV)} />
              {Object.entries(laborTypeLabel).map(([type, label]) => {
                const typeContribs = filtered.filter((c) => c.labor_type === type)
                const typeHours = typeContribs.reduce((s, c) => s + parseFloat(c.hours || 0), 0)
                return typeHours > 0 ? (
                  <SummaryCard key={type} label={label} value={typeHours.toFixed(1)} unit="hrs" small />
                ) : null
              })}
            </div>

            {/* Filter */}
            {years.length > 1 && (
              <div style={styles.filters}>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={styles.select}>
                  <option value="">All time</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            {/* Table */}
            {filtered.length === 0 ? (
              <div style={styles.empty}>No labor contributions logged yet. Click "Log Hours" to add your first entry.</div>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHead}>
                  <span>Date</span>
                  <span>Type</span>
                  <span>Project</span>
                  <span>Description</span>
                  <span style={{ textAlign: 'right' }}>Hours</span>
                  <span style={{ textAlign: 'right' }}>FMV</span>
                </div>
                {filtered.map((c) => (
                  <div key={c.id} style={styles.tableRow}>
                    <span style={styles.cellDate}>{fmtDate(c.date)}</span>
                    <span>
                      <span style={styles.typeBadge}>{laborTypeLabel[c.labor_type] || c.labor_type}</span>
                    </span>
                    <span style={styles.cellMuted}>{c.projects?.name || '—'}</span>
                    <span style={styles.cellDesc}>{c.description || '—'}</span>
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{parseFloat(c.hours).toFixed(1)}</span>
                    <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmt(c.fmv_total)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showForm && (
          <LaborEntryModal
            participant={participant}
            projects={projects}
            fmvRates={fmvRates}
            onClose={() => setShowForm(false)}
            onSave={() => { setShowForm(false); load() }}
          />
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, unit, small }) {
  return (
    <div style={{ ...styles.summaryCard, ...(small ? styles.summaryCardSmall : {}) }}>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={small ? styles.summaryValueSmall : styles.summaryValue}>
        {value}{unit ? <span style={styles.summaryUnit}> {unit}</span> : ''}
      </div>
    </div>
  )
}

function LaborEntryModal({ participant, projects, fmvRates, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [laborType, setLaborType] = useState('project_work')
  const [hours, setHours] = useState('')
  const [projectId, setProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const rate = fmvRates[laborType] || 0
  const fmvTotal = parseFloat(hours || 0) * rate

  const fmt = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!hours || parseFloat(hours) <= 0) return
    setSaving(true)
    const { error } = await supabase.from('labor_contributions').insert({
      participant_id: participant.id,
      date,
      labor_type: laborType,
      hours: parseFloat(hours),
      hourly_rate: rate,
      project_id: projectId || null,
      description: description.trim() || null,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
    } else {
      onSave()
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Log Hours</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Date</label>
              <input type="date" style={styles.input} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Hours</label>
              <input
                type="number" step="0.25" min="0.25" style={styles.input}
                value={hours} onChange={(e) => setHours(e.target.value)}
                placeholder="0.0" required
              />
            </div>
          </div>
          <label style={styles.label}>Type</label>
          <select style={styles.input} value={laborType} onChange={(e) => setLaborType(e.target.value)}>
            {Object.entries(laborTypeLabel).map(([v, l]) => (
              <option key={v} value={v}>{l} — {fmt(fmvRates[v] || 0)}/hr</option>
            ))}
          </select>
          <label style={styles.label}>Project (optional)</label>
          <select style={styles.input} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, height: '70px', resize: 'vertical' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
          />
          {hours && rate > 0 && (
            <div style={styles.fmvPreview}>
              FMV total: <strong>{fmt(fmvTotal)}</strong> ({parseFloat(hours).toFixed(2)} hrs × {fmt(rate)}/hr)
            </div>
          )}
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? 'Saving…' : 'Log Hours'}
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
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 },
  addBtn: {
    padding: '0.5rem 1rem', background: 'var(--color-copper, #c87533)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem',
    fontWeight: 600, cursor: 'pointer',
  },
  loading: { color: '#888', padding: '2rem 0', fontSize: '0.875rem' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem' },
  summaryRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  summaryCard: { background: '#141418', border: '1px solid #2a2a35', borderRadius: '10px', padding: '1.25rem 1.5rem', minWidth: '140px' },
  summaryCardSmall: { padding: '1rem 1.25rem', minWidth: '120px' },
  summaryLabel: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: '0.4rem' },
  summaryValue: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
  summaryValueSmall: { fontSize: '1.25rem', fontWeight: 700 },
  summaryUnit: { fontSize: '0.875rem', fontWeight: 400, color: '#888' },
  filters: { marginBottom: '1rem' },
  select: { background: '#141418', border: '1px solid #2a2a35', color: '#e8e8e0', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' },
  empty: { padding: '2rem', textAlign: 'center', color: '#888', fontSize: '0.875rem', background: '#141418', borderRadius: '10px', border: '1px solid #2a2a35', lineHeight: 1.6 },
  table: { background: '#141418', border: '1px solid #2a2a35', borderRadius: '10px', overflow: 'hidden' },
  tableHead: {
    display: 'grid', gridTemplateColumns: '100px 110px 130px 1fr 70px 90px',
    padding: '0.75rem 1rem', borderBottom: '1px solid #2a2a35',
    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '100px 110px 130px 1fr 70px 90px',
    padding: '0.85rem 1rem', borderBottom: '1px solid #1e1e28',
    fontSize: '0.875rem', alignItems: 'center',
  },
  cellDate: { color: '#888', fontSize: '0.8rem' },
  cellMuted: { color: '#aaa', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cellDesc: { color: '#ccc', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem' },
  typeBadge: { fontSize: '0.72rem', fontWeight: 500, color: '#aaa' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#141418', border: '1px solid #2a2a35', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formField: { display: 'flex', flexDirection: 'column' },
  label: { display: 'block', fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '0.65rem 0.9rem', background: '#0a0a0f', border: '1px solid #2a2a35', color: '#e8e8e0', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem', boxSizing: 'border-box', outline: 'none' },
  fmvPreview: { background: 'rgba(200,117,51,0.08)', border: '1px solid rgba(200,117,51,0.2)', borderRadius: '6px', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#ccc', marginBottom: '1rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: { background: 'none', border: '1px solid #2a2a35', color: '#888', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' },
  submitBtn: { background: 'var(--color-copper, #c87533)', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
}
