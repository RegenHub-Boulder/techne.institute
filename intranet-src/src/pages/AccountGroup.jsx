import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { TabShell } from '../components/TabShell.jsx'

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
  initial: '#c4956a', labor: '#50b478', capital: '#4a9eff',
  patronage: '#b47cd4', draw: '#c46a6a', adjustment: '#888',
}
const LABOR_TYPE_LABELS = {
  governance: 'Governance', operations: 'Operations',
  project_work: 'Project Work', community: 'Community',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '1.1rem 1.25rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52526a', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: color || '#e0e0f0', fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.73rem', color: '#52526a', marginTop: '0.3rem' }}>{sub}</div>}
    </div>
  )
}

function TxnRow({ txn }) {
  const color = TYPE_COLORS[txn.transaction_type] || '#888'
  const isPositive = parseFloat(txn.amount) >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #12121e', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color, background: `${color}15`, padding: '1px 6px', borderRadius: '3px', display: 'inline-block' }}>
          {TYPE_LABELS[txn.transaction_type] || txn.transaction_type}
        </span>
        {txn.description && <span style={{ fontSize: '0.82rem', color: '#7070a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.description}</span>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isPositive ? '#4a5f4a' : '#c46a6a', fontFamily: 'monospace' }}>
          {isPositive ? '+' : ''}{fmtUSD(txn.amount)}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#3a3a5a' }}>{fmtDate(txn.effective_date)}</div>
      </div>
    </div>
  )
}

function ContribRow({ c }) {
  const label = LABOR_TYPE_LABELS[c.labor_type] || c.labor_type
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid #12121e', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b836b', background: 'rgba(107,131,107,0.1)', padding: '1px 6px', borderRadius: '3px', display: 'inline-block' }}>{label}</span>
        {c.projects?.name && <span style={{ fontSize: '0.78rem', color: '#52526a' }}>{c.projects.name}</span>}
        {c.description && <span style={{ fontSize: '0.78rem', color: '#7070a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</span>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e0e0f0', fontFamily: 'monospace' }}>{fmtHrs(c.hours)}</div>
        {c.fmv_total && <div style={{ fontSize: '0.72rem', color: '#4a5f4a', fontFamily: 'monospace' }}>{fmtUSD(c.fmv_total)}</div>}
        <div style={{ fontSize: '0.68rem', color: '#3a3a5a' }}>{fmtDate(c.date)}</div>
      </div>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ data }) {
  const { account, transactions, contributions, patronageEvents } = data

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '2rem' }}>
        <StatBox
          label="Book Balance"
          value={account ? fmtUSD(account.book_balance) : '—'}
          sub={account?.last_updated ? `Updated ${fmtDate(account.last_updated)}` : 'No account'}
          color="#c4956a"
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
          color="#6b836b"
        />
      </div>

      {/* Two-column: contribution breakdown + patronage formula */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>

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
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLORS[type] || '#888', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#9090b0' }}>{TYPE_LABELS[type] || type}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace', color: parseFloat(total) >= 0 ? '#4a5f4a' : '#c46a6a' }}>
                    {parseFloat(total) >= 0 ? '+' : ''}{fmtUSD(total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patronage formula */}
        <div>
          <div style={headingStyle}>Patronage Formula</div>
          <div style={tableContainer}>
            {[
              { pct: '40%', label: 'Labor', desc: 'Hours contributed', color: '#6b836b' },
              { pct: '30%', label: 'Revenue', desc: 'Patronage transactions', color: '#4a5f4a' },
              { pct: '20%', label: 'Capital', desc: 'Capital deployed', color: '#4a9eff' },
              { pct: '10%', label: 'Community', desc: 'Civic contributions', color: '#b47cd4' },
            ].map(({ pct, label, desc, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.85rem', borderBottom: '1px solid #12121e' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color, fontFamily: 'monospace', minWidth: '2.75rem' }}>{pct}</div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c0c0d0' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#52526a' }}>{desc}</div>
                </div>
              </div>
            ))}
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
        <a href="/intranet/documents/" style={{ fontSize: '0.8rem', color: '#c4956a', textDecoration: 'none' }}>K-1 documents →</a>
      </div>
    </div>
  )
}

// ─── Labor tab ────────────────────────────────────────────────────────────────

function LaborTab({ data, reload }) {
  const { contributions, projects, fmvRates, loading } = data
  const { participant } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', hours: '', labor_type: 'operations', project_id: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [dateFilter, setDateFilter] = useState('')

  const filtered = contributions.filter(c => !dateFilter || c.date?.startsWith(dateFilter))
  const totalHours = filtered.reduce((s, c) => s + parseFloat(c.hours || 0), 0)
  const totalFmv   = filtered.reduce((s, c) => s + parseFloat(c.fmv_total || 0), 0)
  const years = [...new Set(contributions.map(c => c.date?.slice(0, 4)).filter(Boolean))].sort().reverse()

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    const rate = fmvRates[form.labor_type] || 0
    const fmv = parseFloat(form.hours || 0) * parseFloat(rate)
    const { error } = await supabase.from('labor_contributions').insert({
      participant_id: participant.id,
      date: form.date,
      hours: parseFloat(form.hours),
      labor_type: form.labor_type,
      project_id: form.project_id || null,
      description: form.description || null,
      fmv_rate: rate,
      fmv_total: fmv,
    })
    if (error) { setSubmitError(error.message); setSubmitting(false); return }
    setShowForm(false)
    setForm({ date: '', hours: '', labor_type: 'operations', project_id: '', description: '' })
    setSubmitting(false)
    reload()
  }

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatBox label="Total Hours" value={fmtHrs(totalHours)} />
        <StatBox label="Total FMV" value={fmtUSD(totalFmv)} color="#4a5f4a" />
        {Object.entries(LABOR_TYPE_LABELS).map(([type, label]) => {
          const hrs = filtered.filter(c => c.labor_type === type).reduce((s, c) => s + parseFloat(c.hours || 0), 0)
          return hrs > 0 ? <StatBox key={type} label={label} value={fmtHrs(hrs)} /> : null
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.45rem 0.9rem', background: 'rgba(196,149,106,0.15)', border: '1px solid rgba(196,149,106,0.3)', color: '#c4956a', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showForm ? 'Cancel' : '+ Log Hours'}
        </button>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['', ...years].map(y => (
            <button key={y || 'all'} onClick={() => setDateFilter(y)} style={{ padding: '0.3rem 0.6rem', background: dateFilter === y ? 'rgba(196,149,106,0.15)' : 'none', border: `1px solid ${dateFilter === y ? 'rgba(196,149,106,0.4)' : '#1a1a2e'}`, color: dateFilter === y ? '#c4956a' : '#52526a', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {y || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Log form */}
      {showForm && (
        <form onSubmit={submit} style={{ background: 'rgba(196,149,106,0.06)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" required value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hours</label>
              <input type="number" step="0.25" min="0.25" required value={form.hours} onChange={e => setForm(f => ({...f, hours: e.target.value}))} placeholder="0.0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.labor_type} onChange={e => setForm(f => ({...f, labor_type: e.target.value}))} style={inputStyle}>
                {Object.entries(LABOR_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Project (optional)</label>
              <select value={form.project_id} onChange={e => setForm(f => ({...f, project_id: e.target.value}))} style={inputStyle}>
                <option value="">None</option>
                {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="What did you work on?" style={inputStyle} />
            </div>
          </div>
          {fmvRates[form.labor_type] && form.hours && (
            <div style={{ fontSize: '0.78rem', color: '#4a5f4a', marginBottom: '0.75rem' }}>
              FMV estimate: {fmtUSD(parseFloat(form.hours) * fmvRates[form.labor_type])} (${fmvRates[form.labor_type]}/hr × {form.hours} hrs)
            </div>
          )}
          {submitError && <div style={{ color: '#c46a6a', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{submitError}</div>}
          <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.25rem', background: '#c4956a', border: 'none', color: '#000', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Saving…' : 'Log Hours'}
          </button>
        </form>
      )}

      {/* Contribution list */}
      <div style={tableContainer}>
        {filtered.length === 0
          ? <div style={emptyStyle}>No contributions{dateFilter ? ` in ${dateFilter}` : ''} yet.</div>
          : filtered.map(c => <ContribRow key={c.id} c={c} />)
        }
      </div>
    </div>
  )
}

// ─── Patronage tab ────────────────────────────────────────────────────────────

function PatronageTab({ data }) {
  const { patronageEvents } = data
  const [yearFilter, setYearFilter] = useState('')
  const filtered = patronageEvents.filter(e => !yearFilter || e.effective_date?.startsWith(yearFilter))
  const years = [...new Set(patronageEvents.map(e => e.effective_date?.slice(0, 4)).filter(Boolean))].sort().reverse()

  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: '#52526a', background: 'rgba(196,149,106,0.06)', border: '1px solid rgba(196,149,106,0.12)', borderRadius: '6px', padding: '0.6rem 0.85rem', marginBottom: '1.25rem' }}>
        Formula: 40% labor · 30% revenue · 20% capital · 10% community
      </div>

      {years.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
          {['', ...years].map(y => (
            <button key={y || 'all'} onClick={() => setYearFilter(y)} style={{ padding: '0.3rem 0.6rem', background: yearFilter === y ? 'rgba(196,149,106,0.15)' : 'none', border: `1px solid ${yearFilter === y ? 'rgba(196,149,106,0.4)' : '#1a1a2e'}`, color: yearFilter === y ? '#c4956a' : '#52526a', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
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
          <StatBox label="Book Balance (GAAP)" value={fmtUSD(account.book_balance)} sub="Economic fair value — basis for ownership and redemption" color="#c4956a" />
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
        <a href="/intranet/documents/" style={{ fontSize: '0.8rem', color: '#c4956a', textDecoration: 'none' }}>K-1 documents →</a>
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
const emptyStyle = { padding: '1.5rem', color: '#3a3a5a', fontSize: '0.85rem', textAlign: 'center' }
const headingStyle = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52526a', marginBottom: '0.6rem' }
const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#52526a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }
const inputStyle = { width: '100%', padding: '0.5rem 0.65rem', background: '#0c0c1a', border: '1px solid #2a2a40', borderRadius: '5px', color: '#e0e0f0', fontSize: '0.82rem', fontFamily: 'inherit', boxSizing: 'border-box' }

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
    if (t.key === 'labor') return { ...t, badge: totalHours > 0 ? totalHours.toFixed(0) + 'h' : null, badgeColor: '#6b836b' }
    return t
  })

  if (data.loading) return <div style={{ padding: '3rem 2rem', color: '#52526a', fontSize: '0.9rem' }}>Loading account…</div>
  if (data.error) return <div style={{ padding: '2rem', color: '#c46a6a', fontSize: '0.85rem' }}>Error: {data.error}</div>

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
      {tab === 'labor'     && <LaborTab    data={data} reload={reloadData} />}
      {tab === 'patronage' && <PatronageTab data={data} />}
    </TabShell>
  )
}
