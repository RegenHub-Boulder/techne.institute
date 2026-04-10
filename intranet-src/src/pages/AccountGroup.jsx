import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { TabShell } from '../components/TabShell.jsx'
import { useGovernanceParam } from '../hooks/useGovernanceParam.jsx'

// ─── Shared data hook ─────────────────────────────────────────────────────────

function useAccountData(participantId) {
  const [state, setState] = useState({
    account: null, transactions: [], contributions: [],
    patronageEvents: [], projects: [], fmvRates: {},
    loading: true, error: null,
  })

  useEffect(() => {
    if (!participantId) return
    async function load() {
      try {
        // Get capital account first
        const { data: acct, error: acctErr } = await supabase
          .from('capital_accounts')
          .select('id, book_balance, tax_balance, last_updated')
          .eq('participant_id', participantId)
          .maybeSingle()
        if (acctErr) throw acctErr

        const [txnRes, contribRes, projectsRes, ratesRes] = await Promise.all([
          acct
            ? supabase.from('capital_transactions')
                .select('id, transaction_type, amount, description, effective_date')
                .eq('capital_account_id', acct.id)
                .order('effective_date', { ascending: false })
                .limit(30)
            : Promise.resolve({ data: [] }),
          supabase.from('labor_contributions')
            .select('id, hours, fmv_total, date, labor_type, description, projects(name)')
            .eq('participant_id', participantId)
            .order('date', { ascending: false })
            .limit(50),
          supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
          supabase.from('fmv_rates').select('labor_type, hourly_rate'),
        ])

        const rateMap = {}
        for (const r of (ratesRes.data || [])) {
          rateMap[r.labor_type] = r.hourly_rate
        }

        // Patronage = capital_transactions filtered to relevant types
        const patronageTypes = ['patronage', 'labor', 'draw', 'adjustment']
        const patronageEvents = (txnRes.data || []).filter(t => patronageTypes.includes(t.transaction_type))

        setState({
          account: acct,
          transactions: txnRes.data || [],
          contributions: contribRes.data || [],
          patronageEvents,
          projects: projectsRes.data || [],
          fmvRates: rateMap,
          loading: false, error: null,
        })
      } catch (e) {
        setState(prev => ({ ...prev, loading: false, error: e.message }))
      }
    }
    load()
  }, [participantId])

  return state
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtUSD = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtHrs = (n) => Number(n || 0).toFixed(1) + ' hrs'
const fmtDate = (d) => d ? new Date(d + (d.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const TYPE_LABELS = {
  initial: 'Initial', labor: 'Labor', capital: 'Capital',
  patronage: 'Patronage', draw: 'Draw', adjustment: 'Adjustment',
}
const TYPE_COLORS = {
  initial: 'var(--gold)', labor: '#50b478', capital: '#4a9eff',
  patronage: '#b47cd4', draw: 'var(--status-err)', adjustment: 'var(--text-muted)',
}
const LABOR_TYPE_LABELS = {
  governance: 'Governance', operations: 'Operations',
  project_work: 'Project Work', community: 'Community',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '1.1rem 1.25rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-nav)', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: color || 'var(--text-primary)', fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.73rem', color: 'var(--text-nav)', marginTop: '0.3rem' }}>{sub}</div>}
    </div>
  )
}

function TxnRow({ txn }) {
  const color = TYPE_COLORS[txn.transaction_type] || 'var(--text-muted)'
  const isPositive = parseFloat(txn.amount) >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #12121e', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color, background: `${color}15`, padding: '1px 6px', borderRadius: '3px', display: 'inline-block' }}>
          {TYPE_LABELS[txn.transaction_type] || txn.transaction_type}
        </span>
        {txn.description && <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.description}</span>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isPositive ? 'var(--status-ok)' : 'var(--status-err)', fontFamily: 'monospace' }}>
          {isPositive ? '+' : ''}{fmtUSD(txn.amount)}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3a5a)' }}>{fmtDate(txn.effective_date)}</div>
      </div>
    </div>
  )
}

function ContribRow({ c }) {
  const label = LABOR_TYPE_LABELS[c.labor_type] || c.labor_type
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid #12121e', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--status-info)', background: 'rgba(107,131,107,0.1)', padding: '1px 6px', borderRadius: '3px', display: 'inline-block' }}>{label}</span>
        {c.projects?.name && <span style={{ fontSize: '0.78rem', color: 'var(--text-nav)' }}>{c.projects.name}</span>}
        {c.description && <span style={{ fontSize: '0.78rem', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</span>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{fmtHrs(c.hours)}</div>
        {c.fmv_total && <div style={{ fontSize: '0.72rem', color: 'var(--status-ok)', fontFamily: 'monospace' }}>{fmtUSD(c.fmv_total)}</div>}
        <div style={{ fontSize: '0.68rem', color: 'var(--text-3a5a)' }}>{fmtDate(c.date)}</div>
      </div>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

const FORMULA_META = {
  labor:     { label: 'Labor',     desc: 'Hours contributed',       color: 'var(--status-info)' },
  revenue:   { label: 'Revenue',   desc: 'Patronage transactions',  color: 'var(--status-ok)'   },
  capital:   { label: 'Capital',   desc: 'Capital deployed',        color: '#4a9eff'             },
  community: { label: 'Community', desc: 'Civic contributions',     color: '#b47cd4'             },
}

function OverviewTab({ data }) {
  const { account, transactions, contributions, patronageEvents } = data
  const { value: formula, status: formulaStatus } = useGovernanceParam('patronage_formula')

  const totalHours = contributions.reduce((s, c) => s + parseFloat(c.hours || 0), 0)
  const totalFmv   = contributions.reduce((s, c) => s + parseFloat(c.fmv_total || 0), 0)
  const totalPatronage = patronageEvents.filter(t => t.transaction_type === 'patronage')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0)

  const breakdown = transactions.reduce((acc, t) => {
    acc[t.transaction_type] = (acc[t.transaction_type] || 0) + parseFloat(t.amount || 0)
    return acc
  }, {})

  return (
    <div>
      {/* Primary balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
        <StatBox
          label="Book Balance"
          value={account ? fmtUSD(account.book_balance) : '—'}
          sub={account?.last_updated ? `Updated ${fmtDate(account.last_updated)}` : 'No account'}
          color="var(--gold)"
        />
        <StatBox
          label="Tax Capital (704b)"
          value={account ? fmtUSD(account.tax_balance) : '—'}
          sub="Subchapter K basis"
        />
        <StatBox
          label="Labor YTD"
          value={fmtHrs(totalHours)}
          sub={totalFmv > 0 ? `FMV: ${fmtUSD(totalFmv)}` : 'No FMV data'}
          color="var(--status-info)"
        />
      </div>

      {/* Two-column: contribution breakdown + patronage formula */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        {/* Contribution breakdown */}
        <div>
          <div style={headingStyle}>Contribution Breakdown</div>
          <div style={tableContainer}>
            {Object.keys(breakdown).length === 0 ? (
              <div style={emptyStyle}>No transactions yet.</div>
            ) : (
              Object.entries(breakdown).map(([type, total]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', borderBottom: '1px solid #12121e' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS[type] || 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>{TYPE_LABELS[type] || type}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace', color: parseFloat(total) >= 0 ? 'var(--status-ok)' : 'var(--status-err)' }}>
                    {parseFloat(total) >= 0 ? '+' : ''}{fmtUSD(total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patronage formula */}
        <div>
          <div style={{ ...headingStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Patronage Formula
            {formulaStatus === 'proposed' && (
              <span style={{ fontSize: '0.6rem', background: 'rgba(196,149,106,0.15)', color: 'var(--gold)', border: '1px solid rgba(196,149,106,0.3)', borderRadius: '3px', padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>proposed</span>
            )}
          </div>
          <div style={tableContainer}>
            {formula && Object.entries(formula)
              .sort((a, b) => b[1] - a[1])
              .map(([key, weight]) => {
                const meta = FORMULA_META[key] || { label: key, desc: '', color: 'var(--text-muted)' }
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.85rem', borderBottom: '1px solid #12121e' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: meta.color, fontFamily: 'monospace', minWidth: '2.75rem' }}>{weight}%</div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-ccc)' }}>{meta.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-nav)' }}>{meta.desc}</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      {/* Recent activity: labor + capital interleaved */}
      <div>
        <div style={headingStyle}>Recent Activity</div>
        <div style={tableContainer}>
          {[
            ...contributions.slice(0, 5).map(c => ({ _type: 'labor', _date: c.date, ...c })),
            ...transactions.slice(0, 5).map(t => ({ _type: 'txn', _date: t.effective_date, ...t })),
          ]
            .sort((a, b) => new Date(b._date) - new Date(a._date))
            .slice(0, 8)
            .map((item, i) => (
              item._type === 'labor'
                ? <ContribRow key={`l-${item.id}`} c={item} />
                : <TxnRow key={`t-${item.id}`} txn={item} />
            ))}
          {transactions.length === 0 && contributions.length === 0 && (
            <div style={emptyStyle}>No activity yet.</div>
          )}
        </div>
      </div>

      {/* K-1 link */}
      <div style={{ marginTop: '1.5rem' }}>
        <a href="/intranet/documents/" style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>K-1 documents →</a>
      </div>
    </div>
  )
}

// ─── Labor tab ────────────────────────────────────────────────────────────────
// P392: upgraded to use labor_entries table via edge functions (labor-fmv-rates,
// labor-entry-submit, labor-entry-list). Adds status lifecycle + realtime.

const SUPABASE_EDGE = 'https://hvbdpgkdcdskhpbdeeim.supabase.co/functions/v1'

const STATUS_STYLES = {
  draft:     { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',  label: 'Draft'     },
  submitted: { bg: 'rgba(196,149,106,0.14)', color: 'var(--gold)',            label: 'Submitted' },
  approved:  { bg: 'rgba(80,180,120,0.14)',  color: 'var(--status-ok)',       label: 'Approved'  },
  rejected:  { bg: 'rgba(220,60,60,0.14)',   color: 'var(--status-err)',      label: 'Rejected'  },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}30`,
      borderRadius: '4px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em',
    }}>
      {s.label}
    </span>
  )
}

function LaborTab() {
  const { session, participant } = useAuth()
  const accessToken = session?.access_token

  const [entries, setEntries]     = useState([])
  const [rates, setRates]         = useState([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ date: new Date().toISOString().slice(0,10), hours: '', labor_type: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [dateFilter, setDateFilter] = useState('')

  // Load FMV rates from edge function (public — no JWT needed)
  useEffect(() => {
    fetch(`${SUPABASE_EDGE}/labor-fmv-rates`)
      .then(r => r.json())
      .then(d => {
        const list = d.data ?? d ?? []
        setRates(list)
        if (list.length) setForm(f => ({ ...f, labor_type: f.labor_type || list[0].labor_type }))
      })
      .catch(() => {})
  }, [])

  // Load entries from edge function (requires JWT)
  async function loadEntries() {
    if (!accessToken) return
    setEntriesLoading(true)
    try {
      const res = await fetch(`${SUPABASE_EDGE}/labor-entry-list`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const d = await res.json()
      setEntries(d.data ?? d ?? [])
    } catch (_) {}
    setEntriesLoading(false)
  }

  useEffect(() => { if (accessToken) loadEntries() }, [accessToken])

  // Realtime: refresh on INSERT or UPDATE for own entries
  useEffect(() => {
    if (!participant?.id || !accessToken) return
    const ch = supabase
      .channel(`labor-entries-${participant.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'labor_entries', filter: `participant_id=eq.${participant.id}` }, loadEntries)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'labor_entries', filter: `participant_id=eq.${participant.id}` }, loadEntries)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [participant?.id, accessToken])

  // Submit via edge function
  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      const body = { date: form.date, labor_type: form.labor_type, hours: parseFloat(form.hours) }
      if (form.notes.trim()) body.notes = form.notes.trim()
      const res = await fetch(`${SUPABASE_EDGE}/labor-entry-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || d.message || `HTTP ${res.status}`)
      }
      setShowForm(false)
      setForm(f => ({ ...f, hours: '', notes: '' }))
    } catch (err) {
      setSubmitError(err.message)
    }
    setSubmitting(false)
  }

  const filtered  = entries.filter(e => !dateFilter || e.date?.startsWith(dateFilter))
  const totalHours = filtered.reduce((s, e) => s + parseFloat(e.hours || 0), 0)
  const totalFmv   = filtered.reduce((s, e) => s + parseFloat(e.total_fmv_usd || 0), 0)
  const approvedFmv = filtered.filter(e => e.status === 'approved').reduce((s, e) => s + parseFloat(e.total_fmv_usd || 0), 0)
  const years = [...new Set(entries.map(e => e.date?.slice(0,4)).filter(Boolean))].sort().reverse()
  const currentRate = rates.find(r => r.labor_type === form.labor_type)

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatBox label="Total Hours" value={fmtHrs(totalHours)} />
        <StatBox label="Total FMV" value={fmtUSD(totalFmv)} />
        <StatBox label="Approved FMV" value={fmtUSD(approvedFmv)} color="var(--status-ok)" />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.45rem 0.9rem', background: 'var(--gold-15)', border: '1px solid rgba(196,149,106,0.3)', color: 'var(--gold)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showForm ? 'Cancel' : '+ Log Hours'}
        </button>
        {years.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['', ...years].map(y => (
              <button key={y || 'all'} onClick={() => setDateFilter(y)} style={{ padding: '0.3rem 0.6rem', background: dateFilter === y ? 'var(--gold-15)' : 'none', border: `1px solid ${dateFilter === y ? 'rgba(196,149,106,0.4)' : 'var(--hud-border)'}`, color: dateFilter === y ? 'var(--gold)' : 'var(--text-nav)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {y || 'All'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Log form */}
      {showForm && (
        <form onSubmit={submit} style={{ background: 'rgba(196,149,106,0.06)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" required value={form.date} max={new Date().toISOString().slice(0,10)} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hours</label>
              <input type="number" step="0.25" min="0.25" max="24" required value={form.hours} onChange={e => setForm(f => ({...f, hours: e.target.value}))} placeholder="0.0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Craft</label>
              <select value={form.labor_type} onChange={e => setForm(f => ({...f, labor_type: e.target.value}))} style={inputStyle} required>
                {rates.length === 0 && <option value="">Loading…</option>}
                {rates.map(r => (
                  <option key={r.id} value={r.labor_type}>
                    {r.labor_type}{r.level ? ` (${r.level})` : ''} — {fmtUSD(r.hourly_rate)}/hr
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>Notes (optional)</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="What did you work on?" style={inputStyle} />
          </div>
          {currentRate && form.hours && (
            <div style={{ fontSize: '0.78rem', color: 'var(--status-ok)', marginBottom: '0.75rem' }}>
              FMV: {parseFloat(form.hours).toFixed(2)} hrs × {fmtUSD(currentRate.hourly_rate)}/hr = <strong>{fmtUSD(parseFloat(form.hours) * currentRate.hourly_rate)}</strong>
            </div>
          )}
          {submitError && <div style={{ color: 'var(--status-err)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{submitError}</div>}
          <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.25rem', background: 'var(--gold)', border: 'none', color: '#000', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Saving…' : 'Log Hours'}
          </button>
        </form>
      )}

      {/* Entry list */}
      <div style={tableContainer}>
        {entriesLoading ? (
          <div style={emptyStyle}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={emptyStyle}>No entries{dateFilter ? ` in ${dateFilter}` : ''} yet.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px 95px 95px 80px', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: '1px solid #1a1a2e', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-nav)', fontWeight: 700 }}>
              <span>Date</span><span>Craft</span><span style={{textAlign:'right'}}>Hrs</span><span style={{textAlign:'right'}}>Rate</span><span style={{textAlign:'right'}}>Total FMV</span><span style={{textAlign:'right'}}>Status</span>
            </div>
            {filtered.map(entry => (
              <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px 95px 95px 80px', gap: '0.5rem', padding: '0.8rem 1rem', borderBottom: '1px solid #111120', fontSize: '0.85rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-nav)', fontSize: '0.78rem' }}>{fmtDate(entry.date)}</span>
                <span>
                  <div>{entry.labor_type}</div>
                  {entry.notes && <div style={{ fontSize: '0.72rem', color: 'var(--text-nav)', marginTop: '1px' }}>{entry.notes}</div>}
                </span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{parseFloat(entry.hours).toFixed(2)}</span>
                <span style={{ textAlign: 'right', color: 'var(--text-nav)', fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(entry.hourly_rate)}/hr</span>
                <span style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(entry.total_fmv_usd)}</span>
                <span style={{ textAlign: 'right' }}><StatusBadge status={entry.status} /></span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Patronage tab ────────────────────────────────────────────────────────────

function PatronageTab({ data }) {
  const { patronageEvents } = data
  const [yearFilter, setYearFilter] = useState('')
  const { value: formula, status: formulaStatus } = useGovernanceParam('patronage_formula')
  const filtered = patronageEvents.filter(e => !yearFilter || e.effective_date?.startsWith(yearFilter))
  const years = [...new Set(patronageEvents.map(e => e.effective_date?.slice(0, 4)).filter(Boolean))].sort().reverse()

  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-nav)', background: 'rgba(196,149,106,0.06)', border: '1px solid rgba(196,149,106,0.12)', borderRadius: '6px', padding: '0.6rem 0.85rem', marginBottom: '1.25rem' }}>
        {formula
          ? Object.entries(formula).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${v}% ${FORMULA_META[k]?.label||k}`).join(' · ')
          : '40% labor · 30% revenue · 20% capital · 10% community'
        }
        {formulaStatus === 'proposed' && <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', color: 'var(--gold)', fontWeight: 600 }}>(proposed — not yet ratified)</span>}
      </div>

      {years.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
          {['', ...years].map(y => (
            <button key={y || 'all'} onClick={() => setYearFilter(y)} style={{ padding: '0.3rem 0.6rem', background: yearFilter === y ? 'var(--gold-15)' : 'none', border: `1px solid ${yearFilter === y ? 'rgba(196,149,106,0.4)' : 'var(--hud-border)'}`, color: yearFilter === y ? 'var(--gold)' : 'var(--text-nav)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {y || 'All'}
            </button>
          ))}
        </div>
      )}

      <div style={tableContainer}>
        {filtered.length === 0
          ? <div style={emptyStyle}>No patronage allocation events yet.</div>
          : filtered.map(e => <TxnRow key={e.id} txn={e} />)
        }
      </div>
    </div>
  )
}

// ─── Capital tab (full transaction history) ───────────────────────────────────

function CapitalTab({ data }) {
  const { account, transactions } = data
  return (
    <div>
      {account && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <StatBox label="Book Balance (GAAP)" value={fmtUSD(account.book_balance)} sub="Economic fair value — basis for ownership and redemption" color="var(--gold)" />
          <StatBox label="Tax Capital (IRC 704b)" value={fmtUSD(account.tax_balance)} sub="Subchapter K basis — used for K-1 preparation" />
        </div>
      )}
      <div style={tableContainer}>
        {transactions.length === 0
          ? <div style={emptyStyle}>No transactions yet.</div>
          : transactions.map(t => <TxnRow key={t.id} txn={t} />)
        }
      </div>
      <div style={{ marginTop: '1.25rem' }}>
        <a href="/intranet/documents/" style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}>K-1 documents →</a>
      </div>
    </div>
  )
}

// ─── Shared style constants ───────────────────────────────────────────────────

const tableContainer = {
  background: 'rgba(255,255,255,0.015)',
  border: '1px solid #1a1a2e',
  borderRadius: '8px',
  overflow: 'hidden',
}
const emptyStyle = { padding: '1.5rem', color: 'var(--text-3a5a)', fontSize: '0.85rem', textAlign: 'center' }
const headingStyle = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-nav)', marginBottom: '0.6rem' }
const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-nav)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }
const inputStyle = { width: '100%', padding: '0.5rem 0.65rem', background: 'var(--hud-bar)', border: '1px solid #2a2a40', borderRadius: '5px', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', boxSizing: 'border-box' }

// ─── Main component ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',  label: 'Overview' },
  { key: 'capital',   label: 'Capital' },
  { key: 'labor',     label: 'Labor' },
  { key: 'patronage', label: 'Patronage' },
]

export default function AccountGroup({ initialTab = 'overview' }) {
  const { participant } = useAuth()
  const [tab, setTab] = useState(initialTab)
  const data = useAccountData(participant?.id)

  const reloadData = () => {
    // Trigger re-fetch by re-mounting (simple approach)
    window.location.reload()
  }

  const totalHours = data.contributions.reduce((s, c) => s + parseFloat(c.hours || 0), 0)
  const openTab = (key) => {
    setTab(key)
    // Update URL without full navigation for browser history
    const paths = { overview: '/intranet/account/', capital: '/intranet/account/', labor: '/intranet/labor/', patronage: '/intranet/patronage/' }
    window.history.pushState(null, '', paths[key] || '/intranet/account/')
  }

  const tabsWithBadge = TABS.map(t => {
    if (t.key === 'labor') return { ...t, badge: totalHours > 0 ? totalHours.toFixed(0) + 'h' : null, badgeColor: 'var(--status-info)' }
    return t
  })

  if (data.loading) return <div style={{ padding: '3rem 2rem', color: 'var(--text-nav)', fontSize: '0.9rem' }}>Loading account…</div>
  if (data.error) return <div style={{ padding: '2rem', color: 'var(--status-err)', fontSize: '0.85rem' }}>Error: {data.error}</div>

  return (
    <TabShell
      title="My Account"
      subtitle={participant?.name ? `${participant.name} · ${participant.participant_type || 'member'}` : 'Capital position'}
      tabs={tabsWithBadge}
      active={tab}
      onTab={openTab}
    >
      {tab === 'overview'  && <OverviewTab data={data} />}
      {tab === 'capital'   && <CapitalTab  data={data} />}
      {tab === 'labor'     && <LaborTab />}
      {tab === 'patronage' && <PatronageTab data={data} />}
    </TabShell>
  )
}
