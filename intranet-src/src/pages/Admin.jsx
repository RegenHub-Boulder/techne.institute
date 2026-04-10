import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { useGovernanceParam } from '../hooks/useGovernanceParam.jsx'

const EDGE_BASE = 'https://hvbdpgkdcdskhpbdeeim.supabase.co/functions/v1'

export default function Admin() {
  const { participant, isSteward } = useAuth()

  if (!isSteward) {
    return (
      <div style={styles.page}>
        <div style={styles.main}>
          <div style={styles.denied}>
            <div style={styles.deniedTitle}>Steward access required</div>
            <p style={styles.deniedBody}>This section is restricted to stewards. If you believe this is an error, contact <a href="mailto:steward@techne.studio" style={styles.link}>steward@techne.studio</a>.</p>
            <a href="/intranet/" style={styles.backLink}>← Back to home</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Admin</span>
        </nav>
        <h1 style={styles.h1}>Admin</h1>
        <p style={styles.subtitle}>Steward tools — allocation entry, document upload, member management.</p>

        <div style={styles.launchGate}>
          <div style={styles.launchGateTitle}>Launch Gate</div>
          <p style={styles.launchGateBody}>
            MA sign-off on all member balances is required before the launch email is sent.
            Do not send the launch email until balances are confirmed accurate.
          </p>
        </div>

        <div style={styles.tabRow}>
          <AdminTabView />
        </div>
      </div>
    </div>
  )
}

function AdminTabView() {
  const [tab, setTab] = useState('members')

  return (
    <>
      <div style={styles.tabs}>
        {[['members', 'Member List'], ['allocation', 'Allocation Entry'], ['upload', 'K-1 Upload'], ['governance', 'Governance Params'], ['labor', 'Labor Review']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{ ...styles.tab, ...(tab === id ? styles.tabActive : {}) }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={styles.tabContent}>
        {tab === 'members' && <MemberList />}
        {tab === 'allocation' && <AllocationEntry />}
        {tab === 'upload' && <DocumentUpload />}
        {tab === 'governance' && <GovernanceParamsPanel />}
        {tab === 'labor' && <LaborAdmin />}
      </div>
    </>
  )
}

// ─── Member List ─────────────────────────────────────────────────────────────

function MemberList() {
  const [members, setMembers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const session = (await supabase.auth.getSession()).data.session
        const res = await fetch(`${EDGE_BASE}/admin-allocation-entry`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'list_members' }),
        })
        const json = await res.json()
        if (json.ok) setMembers(json.members)
        else setError(json.error)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const classLabel = { 1: 'Labor', 2: 'Patron', 3: 'Community', 4: 'Investor' }

  if (loading) return <div style={styles.loading}>Loading members…</div>
  if (error) return <div style={styles.error}>Error: {error}</div>

  return (
    <div>
      <p style={styles.sectionNote}>
        {members?.length ?? 0} participants · {members?.filter(m => m.auth_user_id).length ?? 0} linked to auth ·{' '}
        {members?.filter(m => m.last_allocation_date).length ?? 0} with capital accounts
      </p>
      <div style={styles.memberGrid}>
        {(members || []).map(m => (
          <div key={m.id} style={styles.memberRow}>
            <div style={styles.memberInfo}>
              <div style={styles.memberName}>{m.name || '(no name)'}</div>
              <div style={styles.memberMeta}>
                {m.email || '—'} · Class {m.membership_class || '?'} {classLabel[m.membership_class] ? `— ${classLabel[m.membership_class]}` : ''}
              </div>
              <div style={styles.memberMeta}>
                Auth: {m.auth_user_id ? <span style={{ color: '#4caf88' }}>linked</span> : <span style={{ color: 'var(--status-err)' }}>NOT LINKED</span>}
                {m.last_allocation_date && <> · Last allocation: {m.last_allocation_date}</>}
              </div>
            </div>
            <div style={styles.memberBalance}>
              {m.book_balance_cents != null ? (
                <div style={styles.balanceAmt}>{formatUSD(m.book_balance_cents)}</div>
              ) : (
                <div style={styles.balanceEmpty}>No account</div>
              )}
              <div style={styles.balanceLabel}>Book balance</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Allocation Entry ─────────────────────────────────────────────────────────

function AllocationEntry() {
  const { value: formula, status: formulaStatus } = useGovernanceParam('patronage_formula')
  const [members, setMembers] = useState(null)
  const [form, setForm] = useState({
    participant_id: '',
    quarter: '1',
    year: String(new Date().getFullYear()),
    labor_cents: '',
    revenue_cents: '',
    capital_cents: '',
    community_cents: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/admin-allocation-entry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_members' }),
      })
      const json = await res.json()
      if (json.ok) setMembers(json.members)
    }
    load()
  }, [])

  const totalCents = (['labor_cents', 'revenue_cents', 'capital_cents', 'community_cents'])
    .reduce((sum, k) => sum + (parseInt(form[k]) || 0), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.participant_id) { setError('Select a member.'); return }
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/admin-allocation-entry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enter_allocation',
          participant_id: form.participant_id,
          quarter: parseInt(form.quarter),
          year: parseInt(form.year),
          labor_cents: parseInt(form.labor_cents) || 0,
          revenue_cents: parseInt(form.revenue_cents) || 0,
          capital_cents: parseInt(form.capital_cents) || 0,
          community_cents: parseInt(form.community_cents) || 0,
          notes: form.notes || null,
        }),
      })
      const json = await res.json()
      if (json.ok) {
        setResult(json)
        setForm(f => ({ ...f, labor_cents: '', revenue_cents: '', capital_cents: '', community_cents: '', notes: '' }))
      } else {
        setError(json.error)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p style={styles.sectionNote}>
        {formula
          ? <>Allocations use formula: {Object.entries(formula).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k[0].toUpperCase()+k.slice(1)} ${v}%`).join(', ')}.</>
          : <>Allocations use the 40/30/20/10 formula: Labor 40%, Revenue 30%, Capital 20%, Community 10%.</>
        }
        {formulaStatus === 'proposed' && <span style={{ color: 'var(--gold)', marginLeft: '0.4rem' }}>(proposed — not yet ratified)</span>}
        {' '}Enter amounts in cents (USD × 100). All components can be zero.
      </p>

      {result && (
        <div style={styles.successBox}>
          Allocation recorded — {result.period_label} — total {formatUSD(result.total_cents)}.{' '}
          Event ID: <code>{result.event_id}</code>
        </div>
      )}
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Member
          <select
            value={form.participant_id}
            onChange={e => setForm(f => ({ ...f, participant_id: e.target.value }))}
            style={styles.select}
            required
          >
            <option value="">— select member —</option>
            {(members || []).map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
        </label>

        <div style={styles.formRow}>
          <label style={styles.label}>
            Year
            <input
              type="number" value={form.year} min="2020" max="2040"
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Quarter
            <select value={form.quarter} onChange={e => setForm(f => ({ ...f, quarter: e.target.value }))} style={styles.select}>
              {['1','2','3','4'].map(q => <option key={q} value={q}>Q{q}</option>)}
            </select>
          </label>
        </div>

        <div style={styles.formRow}>
          {[
            ['labor_cents', formula ? `Labor (${formula.labor}%)` : 'Labor (40%)'],
            ['revenue_cents', formula ? `Revenue (${formula.revenue}%)` : 'Revenue (30%)'],
            ['capital_cents', formula ? `Capital (${formula.capital}%)` : 'Capital (20%)'],
            ['community_cents', formula ? `Community (${formula.community}%)` : 'Community (10%)'],
          ].map(([k, label]) => (
            <label key={k} style={styles.label}>
              {label}
              <input
                type="number" value={form[k]} min="0" placeholder="0"
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={styles.input}
              />
            </label>
          ))}
        </div>

        <div style={styles.totalLine}>
          Total allocation: <strong>{formatUSD(totalCents)}</strong>
          {totalCents > 0 && (
            <span style={styles.formulaCheck}>
              {' '}· Labor {pct(parseInt(form.labor_cents)||0, totalCents)}%
              · Revenue {pct(parseInt(form.revenue_cents)||0, totalCents)}%
              · Capital {pct(parseInt(form.capital_cents)||0, totalCents)}%
              · Community {pct(parseInt(form.community_cents)||0, totalCents)}%
            </span>
          )}
        </div>

        <label style={styles.label}>
          Notes (optional)
          <input
            type="text" value={form.notes} placeholder="e.g. S25 Q1 patronage per MA sign-off"
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? 'Recording…' : 'Record allocation'}
        </button>
      </form>
    </div>
  )
}

// ─── Document Upload ──────────────────────────────────────────────────────────

function DocumentUpload() {
  const [members, setMembers] = useState(null)
  const [form, setForm] = useState({ participant_id: '', document_type: 'k1', tax_year: String(new Date().getFullYear() - 1), notes: '' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/admin-allocation-entry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_members' }),
      })
      const json = await res.json()
      if (json.ok) setMembers(json.members)
    }
    load()
  }, [])

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) { setError('Select a PDF file.'); return }
    if (!form.participant_id) { setError('Select a member.'); return }
    if (file.type !== 'application/pdf') { setError('File must be a PDF.'); return }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const session = (await supabase.auth.getSession()).data.session

      // Upload to Storage: path = {participant_id}/{document_type}_{tax_year}_{filename}
      const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${form.participant_id}/${form.document_type}_${form.tax_year}_${safeFilename}`

      const { error: uploadError } = await supabase.storage
        .from('member-documents')
        .upload(storagePath, file, { contentType: 'application/pdf', upsert: false })

      if (uploadError) { setError(`Storage upload failed: ${uploadError.message}`); setUploading(false); return }

      // Insert member_documents record
      const { error: dbError } = await supabase
        .from('member_documents')
        .insert({
          participant_id: form.participant_id,
          document_type: form.document_type,
          tax_year: form.document_type === 'k1' ? parseInt(form.tax_year) : null,
          filename: file.name,
          storage_path: storagePath,
          file_size_bytes: file.size,
          notes: form.notes || null,
          uploaded_by: (await supabase.from('participants').select('id').eq('auth_user_id', session.user.id).single()).data?.id,
        })

      if (dbError) { setError(`DB record failed: ${dbError.message}`); setUploading(false); return }

      setResult({ filename: file.name, storagePath })
      setFile(null)
      setForm(f => ({ ...f, notes: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <p style={styles.sectionNote}>
        Upload a K-1 or other document for a specific member. File must be PDF. Max 10 MB.
        Storage path: <code>{'{participant_id}/{type}_{year}_{filename}'}</code>
      </p>

      {result && (
        <div style={styles.successBox}>
          Uploaded {result.filename} → {result.storagePath}. Member will see it in their Documents tab.
        </div>
      )}
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleUpload} style={styles.form}>
        <label style={styles.label}>
          Member
          <select
            value={form.participant_id}
            onChange={e => setForm(f => ({ ...f, participant_id: e.target.value }))}
            style={styles.select}
            required
          >
            <option value="">— select member —</option>
            {(members || []).map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
        </label>

        <div style={styles.formRow}>
          <label style={styles.label}>
            Document type
            <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} style={styles.select}>
              <option value="k1">K-1 (Schedule K-1)</option>
              <option value="bylaws">Bylaws</option>
              <option value="formation">Formation</option>
              <option value="other">Other</option>
            </select>
          </label>
          {form.document_type === 'k1' && (
            <label style={styles.label}>
              Tax year
              <input
                type="number" value={form.tax_year} min="2020" max="2040"
                onChange={e => setForm(f => ({ ...f, tax_year: e.target.value }))}
                style={styles.input}
              />
            </label>
          )}
        </div>

        <label style={styles.label}>
          PDF file
          <input
            type="file" accept="application/pdf"
            onChange={e => setFile(e.target.files[0] || null)}
            style={styles.fileInput}
            required
          />
          {file && <span style={styles.fileHint}>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>}
        </label>

        <label style={styles.label}>
          Notes (optional)
          <input
            type="text" value={form.notes} placeholder="e.g. 2025 K-1, reviewed by MA"
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={uploading} style={styles.submitBtn}>
          {uploading ? 'Uploading…' : 'Upload document'}
        </button>
      </form>
    </div>
  )
}

// ─── Governance Params Panel ──────────────────────────────────────────────────

function GovernanceParamsPanel() {
  const { participant } = useAuth()
  const { value: formula, status, label, description, loading, error: fetchError } = useGovernanceParam('patronage_formula')

  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveOk, setSaveOk]     = useState(false)

  function startEdit() {
    setDraft({ ...(formula || { labor: 40, revenue: 30, capital: 20, community: 10 }) })
    setEditing(true)
    setSaveOk(false)
    setSaveError(null)
  }

  function handleChange(key, val) {
    const n = parseInt(val, 10)
    setDraft(d => ({ ...d, [key]: isNaN(n) ? 0 : Math.max(0, Math.min(100, n)) }))
  }

  const draftTotal = draft ? Object.values(draft).reduce((s, v) => s + v, 0) : 0

  async function handleSave() {
    if (draftTotal !== 100) { setSaveError('Weights must sum to 100.'); return }
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase
        .from('techne_governance_params')
        .update({ value: draft, updated_by: participant?.id, updated_at: new Date().toISOString() })
        .eq('key', 'patronage_formula')
      if (error) throw error
      setSaveOk(true)
      setEditing(false)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRatify() {
    if (!window.confirm('Mark this formula as ratified by governance? This cannot be undone without a new governance vote.')) return
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase
        .from('techne_governance_params')
        .update({ status: 'ratified', ratified_at: new Date().toISOString(), ratified_by: participant?.id })
        .eq('key', 'patronage_formula')
      if (error) throw error
      setSaveOk(true)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const STATUS_COLOR = { proposed: 'var(--gold)', ratified: 'var(--status-ok)', superseded: 'var(--text-dim)' }

  if (loading) return <div style={{ color: 'var(--text-nav)', fontSize: '0.85rem' }}>Loading governance parameters…</div>

  return (
    <div>
      <p style={styles.sectionNote}>
        Governance parameters are system variables set through collective decision-making.
        Parameters marked <em>proposed</em> have been tabled but not yet ratified.
        Ratified parameters take effect immediately.
      </p>

      {fetchError && <div style={styles.error}>Load error: {fetchError}</div>}
      {saveOk && <div style={styles.successBox}>Saved successfully.</div>}
      {saveError && <div style={styles.error}>{saveError}</div>}

      {/* Patronage formula card */}
      <div style={{ border: '1px solid var(--hud-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--hud-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              Patronage Allocation Formula
              <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: 'rgba(0,0,0,0.2)', color: STATUS_COLOR[status] || 'var(--text-dim)', border: `1px solid ${STATUS_COLOR[status] || 'var(--hud-border)'}`, borderRadius: '3px', padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{status || '—'}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-nav)' }}>{description || 'Weights governing patronage allocation. Must sum to 100.'}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {!editing && status !== 'ratified' && (
              <button onClick={startEdit} style={{ ...styles.submitBtn, padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>Edit</button>
            )}
            {!editing && status === 'proposed' && (
              <button onClick={handleRatify} disabled={saving} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: 'rgba(76,175,136,0.15)', border: '1px solid rgba(76,175,136,0.4)', color: 'var(--status-ok)', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}>Ratify</button>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem 1.1rem' }}>
          {!editing && formula && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {Object.entries(formula).sort((a,b)=>b[1]-a[1]).map(([key, weight]) => (
                <div key={key} style={{ background: 'var(--hud-surface)', border: '1px solid var(--hud-border)', borderRadius: '6px', padding: '0.6rem 0.9rem', minWidth: '90px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: { labor: 'var(--status-info)', revenue: 'var(--status-ok)', capital: '#4a9eff', community: '#b47cd4' }[key] || 'var(--text-muted)' }}>{weight}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-nav)', textTransform: 'capitalize', marginTop: '0.2rem' }}>{key}</div>
                </div>
              ))}
            </div>
          )}

          {editing && draft && (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {Object.entries(draft).sort((a,b)=>b[1]-a[1]).map(([key, weight]) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '90px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-nav)', textTransform: 'capitalize' }}>{key}</span>
                    <input
                      type="number" min="0" max="100" value={weight}
                      onChange={e => handleChange(key, e.target.value)}
                      style={{ ...styles.input, width: '80px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700 }}
                    />
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: draftTotal === 100 ? 'var(--status-ok)' : 'var(--status-err)', marginBottom: '0.75rem' }}>
                Total: {draftTotal}/100 {draftTotal === 100 ? '✓' : '— must equal 100'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSave} disabled={saving || draftTotal !== 100} style={styles.submitBtn}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setEditing(false)} style={{ ...styles.submitBtn, background: 'none', border: '1px solid var(--hud-border)', color: 'var(--text-nav)' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Labor Admin ─────────────────────────────────────────────────────────────

const LABOR_STATUS_STYLE = {
  draft:     { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',  label: 'Draft'     },
  submitted: { bg: 'rgba(196,149,106,0.14)', color: 'var(--ember, #c4956a)', label: 'Submitted' },
  approved:  { bg: 'rgba(76,175,136,0.14)',  color: 'var(--status-ok)',       label: 'Approved'  },
  rejected:  { bg: 'rgba(220,60,60,0.14)',   color: 'var(--status-err)',      label: 'Rejected'  },
}
function LaborStatusBadge({ status }) {
  const s = LABOR_STATUS_STYLE[status] || LABOR_STATUS_STYLE.draft
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: '4px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em' }}>
      {s.label}
    </span>
  )
}

function LaborAdmin() {
  const [subTab, setSubTab] = useState('entries')
  return (
    <div>
      <p style={styles.sectionNote}>Review submitted labor entries, manage FMV rate table, and generate member reports.</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[['entries', 'Entry Review'], ['rates', 'Rate Table'], ['reports', 'Reports']].map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            padding: '0.35rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer',
            borderRadius: '6px', border: '1px solid var(--color-border, #2a2a35)',
            background: subTab === id ? 'var(--ember, #c4956a)' : 'none',
            color: subTab === id ? '#fff' : 'var(--color-text-muted, #888)',
            fontFamily: 'inherit', fontWeight: subTab === id ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>
      {subTab === 'entries' && <LaborEntryReview />}
      {subTab === 'rates'   && <LaborRateTable />}
      {subTab === 'reports' && <LaborReportPanel />}
    </div>
  )
}

function LaborEntryReview() {
  const [entries, setEntries] = useState(null)
  const [statusFilter, setStatusFilter] = useState('submitted')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [acting, setActing] = useState(null) // entry id being actioned

  async function load(filter) {
    setLoading(true)
    setError(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/labor-entry-review`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_entries', status_filter: filter }),
      })
      const json = await res.json()
      if (json.ok) setEntries(json.data)
      else setError(json.error)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(statusFilter) }, [statusFilter])

  async function review(entryId, status) {
    setActing(entryId)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/labor-entry-review`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review_entry', entry_id: entryId, status }),
      })
      const json = await res.json()
      if (json.ok) {
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status, approved_by: json.data.approved_by, approved_at: json.data.approved_at } : e))
      } else { setError(json.error) }
    } catch (e) { setError(e.message) }
    finally { setActing(null) }
  }

  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const fmtUSDDec = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const pendingCount = entries?.filter(e => e.status === 'submitted').length ?? 0

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', alignItems: 'center' }}>
        {[['all','All'],['submitted','Submitted'],['approved','Approved'],['rejected','Rejected']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)} style={{
            padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer',
            borderRadius: '5px', border: `1px solid ${statusFilter === val ? 'rgba(196,149,106,0.5)' : 'var(--color-border, #2a2a35)'}`,
            background: statusFilter === val ? 'rgba(196,149,106,0.1)' : 'none',
            color: statusFilter === val ? 'var(--ember, #c4956a)' : 'var(--color-text-muted, #888)',
            fontFamily: 'inherit',
          }}>{label}{val === 'submitted' && pendingCount > 0 ? ` (${pendingCount})` : ''}</button>
        ))}
        <button onClick={() => load(statusFilter)} style={{ marginLeft: 'auto', padding: '0.3rem 0.7rem', fontSize: '0.78rem', background: 'none', border: '1px solid var(--color-border, #2a2a35)', borderRadius: '5px', color: 'var(--color-text-muted, #888)', cursor: 'pointer', fontFamily: 'inherit' }}>Refresh</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.loading}>Loading entries…</div>}

      {!loading && entries?.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #888)', fontSize: '0.875rem', border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px' }}>
          No entries with status: {statusFilter}.
        </div>
      )}

      {!loading && entries && entries.length > 0 && (
        <div style={{ border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 90px 110px 60px 70px 80px 90px 1fr', padding: '0.6rem 1rem', borderBottom: '1px solid var(--color-border, #2a2a35)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)' }}>
            <span>Member</span><span>Date</span><span>Craft</span><span>Hrs</span><span>Rate</span><span>Total</span><span>Status</span><span>Actions</span>
          </div>
          {entries.map(e => {
            const rate = e.rate?.hourly_rate ?? 0
            const total = parseFloat(e.hours || 0) * parseFloat(rate)
            const memberName = e.member?.display_name || e.member?.name || e.member?.email || '—'
            return (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '140px 90px 110px 60px 70px 80px 90px 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.83rem', alignItems: 'center' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{memberName}</span>
                <span style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.78rem' }}>{fmtDate(e.date)}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{e.labor_type}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{parseFloat(e.hours).toFixed(1)}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted, #888)', fontSize: '0.78rem' }}>{fmtUSDDec(rate)}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtUSDDec(total)}</span>
                <span><LaborStatusBadge status={e.status} /></span>
                <span style={{ display: 'flex', gap: '0.4rem' }}>
                  {e.status === 'submitted' && (
                    <>
                      <button
                        disabled={acting === e.id}
                        onClick={() => review(e.id, 'approved')}
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'rgba(76,175,136,0.15)', border: '1px solid rgba(76,175,136,0.4)', color: 'var(--status-ok)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}
                      >Approve</button>
                      <button
                        disabled={acting === e.id}
                        onClick={() => review(e.id, 'rejected')}
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', color: 'var(--status-err)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}
                      >Reject</button>
                    </>
                  )}
                  {e.status !== 'submitted' && e.approved_at && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #888)' }}>
                      {new Date(e.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LaborRateTable() {
  const { participant } = useAuth()
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ labor_type: '', hourly_rate: '', level: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(null)

  async function loadRates() {
    setLoading(true)
    setError(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/labor-entry-review`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_rates' }),
      })
      const json = await res.json()
      if (json.ok) { setRates(json.data); if (json.data.length) setForm(f => ({ ...f, labor_type: f.labor_type || json.data[0].labor_type })) }
      else setError(json.error)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadRates() }, [])

  async function handleAddRate(e) {
    e.preventDefault()
    if (!form.labor_type || !form.hourly_rate) { setError('Craft and rate are required.'); return }
    setSaving(true)
    setSaveOk(null)
    setError(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/labor-entry-review`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_rate', ...form }),
      })
      const json = await res.json()
      if (json.ok) {
        setSaveOk(`New rate for ${form.labor_type} set to $${parseFloat(form.hourly_rate).toFixed(2)}/hr. Prior rate deprecated.`)
        setForm(f => ({ ...f, hourly_rate: '', level: '', notes: '' }))
        setShowAdd(false)
        loadRates()
      } else { setError(json.error) }
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const fmtUSDDec = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <p style={{ ...styles.sectionNote, margin: 0 }}>Current active FMV rates. Adding a new rate for a craft automatically deprecates the prior one.</p>
        <button onClick={() => { setShowAdd(s => !s); setSaveOk(null) }} style={{ ...styles.submitBtn, padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
          {showAdd ? 'Cancel' : '+ Add New Rate'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {saveOk && <div style={styles.successBox}>{saveOk}</div>}

      {showAdd && (
        <form onSubmit={handleAddRate} style={{ ...styles.form, background: 'rgba(196,149,106,0.05)', border: '1px solid rgba(196,149,106,0.2)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>New Rate</div>
          <div style={styles.formRow}>
            <label style={styles.label}>
              Craft
              <select value={form.labor_type} onChange={e => setForm(f => ({ ...f, labor_type: e.target.value }))} style={styles.select} required>
                {(rates || []).map(r => <option key={r.id} value={r.labor_type}>{r.labor_type}</option>)}
              </select>
            </label>
            <label style={styles.label}>
              Rate ($/hr)
              <input type="number" step="0.01" min="0" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} style={styles.input} placeholder="0.00" required />
            </label>
            <label style={styles.label}>
              Level (optional)
              <input type="text" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={styles.input} placeholder="e.g. senior" />
            </label>
          </div>
          <label style={styles.label}>
            Notes (optional)
            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={styles.input} placeholder="Reason for rate change" />
          </label>
          <button type="submit" disabled={saving} style={styles.submitBtn}>{saving ? 'Saving…' : 'Save New Rate'}</button>
        </form>
      )}

      {loading && <div style={styles.loading}>Loading rates…</div>}
      {!loading && rates && (
        <div style={{ border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 130px 1fr', padding: '0.6rem 1rem', borderBottom: '1px solid var(--color-border, #2a2a35)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)' }}>
            <span>Craft</span><span>Rate/hr</span><span>Level</span><span>Effective</span><span>Notes</span>
          </div>
          {rates.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 130px 1fr', padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>{r.labor_type}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--ember, #c4956a)' }}>{fmtUSDDec(r.hourly_rate)}</span>
              <span style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.78rem' }}>{r.level || '—'}</span>
              <span style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.78rem' }}>{fmtDate(r.effective_date)}</span>
              <span style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LaborReportPanel() {
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [memberId, setMemberId] = useState('')
  const [fromDate, setFromDate] = useState(() => `${new Date().getFullYear()}-01-01`)
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadMembers() {
      try {
        const session = (await supabase.auth.getSession()).data.session
        const res = await fetch(`${EDGE_BASE}/admin-allocation-entry`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list_members' }),
        })
        const json = await res.json()
        if (json.ok) {
          setMembers(json.members || [])
          if (json.members?.length) setMemberId(json.members[0].id)
        }
      } catch (_) {}
      finally { setMembersLoading(false) }
    }
    loadMembers()
  }, [])

  async function generate() {
    if (!memberId) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch(`${EDGE_BASE}/labor-fmv-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, from_date: fromDate, to_date: toDate }),
      })
      const json = await res.json()
      if (json.ok) setReport(json.data)
      else setError(json.error)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function downloadCSV() {
    if (!report) return
    const rows = [
      ['Date', 'Craft', 'Hours', 'Rate', 'Total FMV', 'Status', 'Tax Class'],
      ...report.entries.map(e => [e.date, e.labor_type, e.hours, e.hourly_rate, e.total_fmv, e.status, e.tax_class]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labor-fmv-${(report.member.name || report.member.id).replace(/\s+/g,'-')}-${fromDate}-${toDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fmtUSDDec = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const fmtDateShort = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div>
      <p style={styles.sectionNote}>Generate an FMV labor report for any member over any period. Tax classification is a display scaffold — not legal advice.</p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <label style={styles.label}>
          Member
          <select value={memberId} onChange={e => setMemberId(e.target.value)} style={styles.select} disabled={membersLoading}>
            {membersLoading && <option>Loading…</option>}
            {members.map(m => <option key={m.id} value={m.id}>{m.name || m.email || m.id}</option>)}
          </select>
        </label>
        <label style={styles.label}>
          From
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={styles.input} />
        </label>
        <label style={styles.label}>
          To
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={styles.input} />
        </label>
        <button
          onClick={generate}
          disabled={loading || !memberId}
          style={{ ...styles.submitBtn, alignSelf: 'flex-end', opacity: (!memberId || loading) ? 0.6 : 1 }}
        >
          {loading ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {report && (
        <div>
          {/* Report header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{report.member.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #888)' }}>
                {report.member.email}
                {report.period.from_date && <> &middot; {report.period.from_date} → {report.period.to_date || 'today'}</>}
              </div>
            </div>
            <button onClick={downloadCSV} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', background: 'none', border: '1px solid var(--color-border, #2a2a35)', borderRadius: '6px', color: 'var(--color-text-muted, #888)', cursor: 'pointer', fontFamily: 'inherit' }}>
              Export CSV
            </button>
          </div>

          {/* Totals grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              ['Total Hours', report.totals.hours.toFixed(1) + ' hrs', null],
              ['Total FMV', fmtUSDDec(report.totals.fmv), null],
              ['Approved Hours', report.totals.approved_hours.toFixed(1) + ' hrs', 'var(--status-ok, #4caf88)'],
              ['Approved FMV', fmtUSDDec(report.totals.approved_fmv), 'var(--status-ok, #4caf88)'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)', marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: color || 'inherit', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* By-craft breakdown */}
          {Object.keys(report.by_craft).length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)', marginBottom: '0.6rem' }}>By Craft</div>
              <div style={{ border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 75px 100px 90px 120px', padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border, #2a2a35)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)' }}>
                  <span>Craft</span><span>Hrs</span><span>FMV</span><span>Appr. Hrs</span><span>Appr. FMV</span>
                </div>
                {Object.entries(report.by_craft).map(([craft, stats]) => (
                  <div key={craft} style={{ display: 'grid', gridTemplateColumns: '1fr 75px 100px 90px 120px', padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{craft}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{stats.hours.toFixed(1)}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtUSDDec(stats.fmv)}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--status-ok, #4caf88)' }}>{stats.approved_hours.toFixed(1)}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--status-ok, #4caf88)', fontWeight: 600 }}>{fmtUSDDec(stats.approved_fmv)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry detail */}
          {report.entries.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #888)', fontSize: '0.875rem', border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px' }}>
              No entries in this period.
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)', marginBottom: '0.6rem' }}>Entries ({report.entries.length})</div>
              <div style={{ border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr 50px 80px 90px 75px 165px', padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border, #2a2a35)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted, #888)' }}>
                  <span>Date</span><span>Craft</span><span>Hrs</span><span>Rate</span><span>Total</span><span>Status</span><span>Tax Class</span>
                </div>
                {report.entries.map(e => (
                  <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '95px 1fr 50px 80px 90px 75px 165px', padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.83rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.78rem' }}>{fmtDateShort(e.date)}</span>
                    <span>{e.labor_type}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{e.hours.toFixed(1)}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted, #888)', fontSize: '0.78rem' }}>{fmtUSDDec(e.hourly_rate)}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtUSDDec(e.total_fmv)}</span>
                    <span><LaborStatusBadge status={e.status} /></span>
                    <span style={{ fontSize: '0.75rem', color: e.tax_class === 'Patronage Dividend' ? 'var(--status-ok, #4caf88)' : e.tax_class.startsWith('Pending') ? 'var(--color-text-muted, #888)' : 'var(--ember, #c4956a)' }}>{e.tax_class}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--color-text-muted, #888)', fontStyle: 'italic' }}>
                Tax classification is a display scaffold only — not legal advice. Consult a qualified tax advisor.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(cents) {
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100)
}

function pct(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}



// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', borderBottom: '1px solid var(--color-border, #2a2a35)',
    background: 'var(--color-surface, #141418)',
  },
  wordmark: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  headerNav: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { fontSize: '0.875rem', color: 'var(--color-text-muted, #888)', textDecoration: 'none' },
  signOut: {
    background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '6px',
    padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
  },
  main: { maxWidth: '960px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', marginBottom: '1rem' },
  breadLink: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem' },
  subtitle: { fontSize: '1rem', color: 'var(--color-text-muted, #888)', margin: '0 0 1.5rem' },
  launchGate: {
    padding: '1rem 1.25rem', marginBottom: '1.5rem',
    background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.25)',
    borderRadius: '8px',
  },
  launchGateTitle: { fontWeight: 700, fontSize: '0.85rem', color: 'var(--status-err)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  launchGateBody: { fontSize: '0.875rem', color: 'var(--text-soft)', margin: 0 },
  tabRow: {},
  tabs: { display: 'flex', gap: '0.25rem', marginBottom: '0', borderBottom: '1px solid var(--color-border, #2a2a35)' },
  tab: {
    padding: '0.6rem 1.1rem', background: 'none', border: 'none',
    color: 'var(--color-text-muted, #888)', fontSize: '0.875rem', cursor: 'pointer',
    borderBottom: '2px solid transparent', marginBottom: '-1px',
  },
  tabActive: { color: 'var(--ember, #c4956a)', borderBottom: '2px solid var(--ember, #c4956a)', fontWeight: 600 },
  tabContent: {
    padding: '1.5rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderTop: 'none', borderRadius: '0 0 10px 10px',
  },
  sectionNote: { fontSize: '0.85rem', color: 'var(--color-text-muted, #999)', margin: '0 0 1.25rem', lineHeight: 1.6 },
  loading: { color: 'var(--color-text-muted, #888)', padding: '1rem 0' },
  error: {
    padding: '0.75rem 1rem', background: 'rgba(220,60,60,0.1)',
    border: '1px solid rgba(220,60,60,0.3)', borderRadius: '6px',
    color: 'var(--status-err)', fontSize: '0.875rem', marginBottom: '1rem',
  },
  successBox: {
    padding: '0.75rem 1rem', background: 'rgba(76,175,136,0.1)',
    border: '1px solid rgba(76,175,136,0.3)', borderRadius: '6px',
    color: '#4caf88', fontSize: '0.875rem', marginBottom: '1rem',
  },
  memberGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  memberRow: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    padding: '0.875rem 1rem', background: 'var(--hover-dim)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '6px',
  },
  memberInfo: { flex: 1 },
  memberName: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
  memberMeta: { fontSize: '0.8rem', color: 'var(--color-text-muted, #888)', marginBottom: '0.1rem' },
  memberBalance: { textAlign: 'right', flexShrink: 0 },
  balanceAmt: { fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' },
  balanceEmpty: { fontSize: '0.8rem', color: 'var(--color-text-muted, #888)' },
  balanceLabel: { fontSize: '0.7rem', color: 'var(--color-text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' },
  formRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted, #aaa)', flex: 1, minWidth: '140px' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.9rem',
  },
  select: {
    background: 'var(--color-surface, #141418)', border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.9rem',
  },
  fileInput: { fontSize: '0.85rem', color: 'var(--text-soft)', padding: '0.4rem 0' },
  fileHint: { fontSize: '0.8rem', color: '#4caf88' },
  totalLine: { fontSize: '0.9rem', padding: '0.5rem 0', borderTop: '1px solid var(--color-border, #2a2a35)' },
  formulaCheck: { color: 'var(--color-text-muted, #888)' },
  submitBtn: {
    background: 'var(--ember, #c4956a)', border: 'none', color: '#fff',
    borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start',
  },
  denied: {
    padding: '2rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '10px',
    maxWidth: '480px', margin: '3rem auto',
  },
  deniedTitle: { fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' },
  deniedBody: { fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: '0 0 1rem' },
  backLink: { fontSize: '0.875rem', color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  link: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
}
