import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useEcosystemData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [metricsRes, govRes, bankRes] = await Promise.all([
          supabase.from('ecosystem_metrics').select('metric_key, metric_label, metric_value, metric_text, category'),
          supabase.from('governance_status').select('status_key, status_label, status_value, status_detail, is_blocker').order('is_blocker', { ascending: false }),
          supabase.from('bank_accounts').select('account_name, account_type, balance, currency, institution').eq('is_active', true),
        ])

        const metrics = {}
        for (const m of (metricsRes.data || [])) {
          metrics[m.metric_key] = m
        }

        const fiatTotal = (bankRes.data || []).reduce((s, a) => s + Number(a.balance || 0), 0)

        setData({
          metrics,
          governance: govRes.data || [],
          bankAccounts: bankRes.data || [],
          fiatTotal,
          // onchain from metrics seed (until digital_assets table is live)
          onchainTotal: Number(metrics.treasury_onchain?.metric_value || 0),
          totalTreasury: fiatTotal + Number(metrics.treasury_onchain?.metric_value || 0),
        })
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { data, loading, error }
}

// ─── Health indicator config ──────────────────────────────────────────────────

const HEALTH_INDICATORS = [
  {
    key: 'growth',
    label: 'Growth',
    status: 'Expanding',
    color: 'var(--status-ok)',
    summary: 'Third floor lease active. Revenue generation mode begins.',
    metrics: ['lease_monthly', 'capital_committed', 'pipeline_leads'],
  },
  {
    key: 'homeostasis',
    label: 'Homeostasis',
    status: 'Stabilizing',
    color: 'var(--status-warn)',
    summary: 'Governance structures forming. Family meetings formalized.',
    govKeys: ['board_formed', 'family_meetings', 'schedule_a_approved'],
  },
  {
    key: 'circulation',
    label: 'Circulation',
    status: '~$5K MRR',
    color: 'var(--status-info)',
    summary: 'Revenue growing. Target: $10–11K/mo by June 2027.',
    metrics: ['mrr_current', 'mrr_target'],
  },
  {
    key: 'symbiosis',
    label: 'Symbiosis',
    status: 'Deepening',
    color: 'var(--status-purple)',
    summary: 'Ethereum Foundation, Boulder tech community, 3 ventures committed.',
    metrics: ['institutional_committed', 'ventures_committed'],
  },
]

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt$(n) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K'
  return '$' + Number(n).toLocaleString()
}

function fmtVal(key, val) {
  if (!val) return '—'
  if (key.includes('committed') || key.includes('treasury') || key.includes('mrr') || key.includes('lease')) {
    return fmt$(val)
  }
  return String(val)
}

// ─── Components ──────────────────────────────────────────────────────────────

function PulseIndicator({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px',
      borderRadius: '50%', background: color, flexShrink: 0,
      boxShadow: `0 0 6px ${color}88`,
    }} />
  )
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={s.statBox}>
      <div style={{ ...s.statVal, color: color || 'var(--text-primary)' }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  )
}

function GovRow({ item }) {
  const statusColor = {
    active:      '#4ade80',
    pending:     '#facc15',
    in_progress: '#60a5fa',
    blocked:     '#f87171',
  }[item.status_value] || '#aaa'

  return (
    <div style={s.govRow}>
      <div style={s.govLeft}>
        {item.is_blocker && <span style={s.blockerChip}>Blocker</span>}
        <span style={s.govLabel}>{item.status_label}</span>
      </div>
      <div style={{ ...s.govStatus, color: statusColor }}>
        {item.status_value.replace('_', ' ')}
      </div>
      {item.status_detail && (
        <div style={s.govDetail}>{item.status_detail}</div>
      )}
    </div>
  )
}

function HealthCard({ indicator, metrics, governance }) {
  const govItems = (indicator.govKeys || [])
    .map(k => governance.find(g => g.status_key === k))
    .filter(Boolean)

  const metricItems = (indicator.metrics || [])
    .map(k => metrics[k])
    .filter(Boolean)

  return (
    <div style={s.healthCard}>
      <div style={s.healthHeader}>
        <PulseIndicator color={indicator.color} />
        <div style={s.healthLabel}>{indicator.label}</div>
        <div style={{ ...s.healthStatus, color: indicator.color }}>{indicator.status}</div>
      </div>
      <p style={s.healthSummary}>{indicator.summary}</p>

      {metricItems.length > 0 && (
        <div style={s.healthMetrics}>
          {metricItems.map(m => (
            <div key={m.metric_key} style={s.healthMetric}>
              <span style={s.healthMetricLabel}>{m.metric_label}</span>
              <span style={s.healthMetricVal}>{fmtVal(m.metric_key, m.metric_value)}</span>
            </div>
          ))}
        </div>
      )}

      {govItems.length > 0 && (
        <div style={s.healthGov}>
          {govItems.map(g => (
            <div key={g.status_key} style={s.healthGovRow}>
              <span style={s.healthMetricLabel}>{g.status_label}</span>
              <span style={{
                ...s.healthMetricVal,
                color: g.is_blocker ? '#f87171' : g.status_value === 'active' ? '#4ade80' : '#facc15'
              }}>
                {g.status_value.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Bulletin card ────────────────────────────────────────────────────────────

const TYPE_COLOR = { announcement: 'var(--gold)', decision: 'var(--status-info)', document: '#a78bfa', event: 'var(--status-ok)' }
const fmtRel = (d) => { if (!d) return ''; const diff = Date.now() - new Date(d).getTime(); const m = Math.floor(diff/60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m/60); if (h < 24) return `${h}h ago`; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) }

const inputStyle = { width: '100%', padding: '0.45rem 0.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }

function BulletinCard() {
  const { participant } = useAuth()
  const [posts, setPosts] = useState([])
  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', url: '', post_type: 'announcement' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function navigate(path) {
    window.history.pushState(null, '', `/intranet/${path}/`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  async function load() {
    const { data } = await supabase
      .from('bulletin_posts')
      .select('id, title, body, url, post_type, is_pinned, created_at, updated_at, participants(name), bulletin_comments(id)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(4)
    setPosts(data || [])
  }

  useEffect(() => { load() }, [])

  async function submitPost(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    setError(null)
    const { error: err } = await supabase.from('bulletin_posts').insert({
      title: form.title.trim(),
      body: form.body.trim() || null,
      url: form.url.trim() || null,
      post_type: form.post_type,
      author_id: participant?.id,
      is_pinned: false,
    })
    if (err) { setError(err.message); setSubmitting(false); return }
    setForm({ title: '', body: '', url: '', post_type: 'announcement' })
    setShowCompose(false)
    setSubmitting(false)
    load()
  }

  return (
    <div style={{ ...s.treasuryBar, marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={s.treasuryTitle}>Bulletin</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowCompose(v => !v)}
            style={{ padding: '0.25rem 0.65rem', background: showCompose ? 'none' : 'var(--gold-12, rgba(196,149,106,0.12))', border: '1px solid rgba(196,149,106,0.25)', color: 'var(--gold, #c4956a)', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >{showCompose ? 'Cancel' : '+ Post'}</button>
          <button
            onClick={() => navigate('bulletin')}
            style={{ padding: '0.25rem 0.65rem', background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >All →</button>
        </div>
      </div>

      {/* Compose form */}
      {showCompose && (
        <form onSubmit={submitPost} style={{ background: 'rgba(196,149,106,0.04)', border: '1px solid rgba(196,149,106,0.12)', borderRadius: '7px', padding: '0.9rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Post title" style={inputStyle} />
            <select value={form.post_type} onChange={e => setForm(f => ({...f, post_type: e.target.value}))} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="announcement">Announcement</option>
              <option value="decision">Decision</option>
              <option value="document">Document</option>
              <option value="event">Event</option>
            </select>
          </div>
          <textarea value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} rows={2} placeholder="Details (optional)" style={{ ...inputStyle, resize: 'vertical', minHeight: '48px', marginBottom: '0.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
            <input type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="Link (optional) — Google Doc, etc." style={inputStyle} />
            <button type="submit" disabled={submitting} style={{ padding: '0.45rem 0.9rem', background: 'var(--gold, #c4956a)', border: 'none', color: '#000', borderRadius: '5px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {submitting ? '…' : 'Post'}
            </button>
          </div>
          {error && <div style={{ color: 'var(--status-err)', fontSize: '0.75rem', marginTop: '0.4rem' }}>{error}</div>}
        </form>
      )}

      {/* Post feed */}
      {posts.length === 0 && !showCompose && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', padding: '0.5rem 0' }}>No posts yet. Be the first to post.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {posts.map(p => (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.6rem 0.75rem', background: p.is_pinned ? 'rgba(196,149,106,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${p.is_pinned ? 'rgba(196,149,106,0.15)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TYPE_COLOR[p.post_type] || 'var(--gold)', background: `${TYPE_COLOR[p.post_type] || 'var(--gold)'}18`, padding: '1px 5px', borderRadius: '3px' }}>{p.post_type}</span>
              {p.is_pinned && <span style={{ fontSize: '0.6rem', color: 'var(--gold, #c4956a)', opacity: 0.7 }}>pinned</span>}
              {p.updated_at && new Date(p.updated_at) - new Date(p.created_at) > 5000 && <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>edited</span>}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</div>
            {p.body && <div style={{ fontSize: '0.75rem', color: 'var(--text-accent)', lineHeight: 1.5 }}>{p.body}</div>}
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.73rem', color: 'var(--gold, #c4956a)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >Open document →</a>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>
                {p.participants?.name && <span>{p.participants.name} · </span>}
                {fmtRel(p.created_at)}
              </span>
              {p.bulletin_comments?.length > 0 && (
                <span style={{ color: 'var(--text-3a5a)' }}>{p.bulletin_comments.length} comment{p.bulletin_comments.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Ecosystem() {
  const { data, loading, error } = useEcosystemData()

  if (loading) return <div style={s.page}><div style={s.loadingText}>Loading ecosystem data…</div></div>
  if (error)   return <div style={s.page}><div style={s.errorText}>Error: {error}</div></div>
  if (!data)   return null

  const { metrics, governance, fiatTotal, onchainTotal, totalTreasury } = data

  const mrr     = metrics.mrr_current?.metric_value || 0
  const mrrTarget = metrics.mrr_target?.metric_value || 11000
  const mrrPct  = Math.min(100, Math.round((mrr / mrrTarget) * 100))

  const blockers = governance.filter(g => g.is_blocker)

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTitle}>Overview</div>
        <div style={s.headerSub}>RegenHub, LCA · Boulder, Colorado · Live metrics</div>
      </div>

      {/* Bulletin card */}
      <BulletinCard />

      {/* Treasury bar */}
      <div style={s.treasuryBar}>
        <div style={s.treasuryTitle}>Treasury</div>
        <div style={s.treasuryStats}>
          <StatBox
            label="Fiat"
            value={fmt$(fiatTotal)}
            sub="Mercury"
            color="var(--gold, #c4956a)"
          />
          <StatBox
            label="Onchain"
            value={fmt$(onchainTotal)}
            sub="Safe multisig"
            color="#60a5fa"
          />
          <StatBox
            label="Total"
            value={fmt$(totalTreasury)}
            sub="Combined"
            color="var(--text-primary)"
          />
          <StatBox
            label="MRR"
            value={fmt$(mrr)}
            sub={`${mrrPct}% of ${fmt$(mrrTarget)} target`}
            color="#4ade80"
          />
        </div>
        {/* MRR progress */}
        <div style={s.mrrBar}>
          <div style={s.mrrBarLabel}>
            <span>MRR toward target</span>
            <span>{mrrPct}%</span>
          </div>
          <div style={s.mrrBarTrack}>
            <div style={{ ...s.mrrBarFill, width: `${mrrPct}%` }} />
          </div>
        </div>
      </div>

      {/* Blockers — if any */}
      {blockers.length > 0 && (
        <div style={s.blockersPanel}>
          <div style={s.blockersPanelTitle}>
            <span style={{ color: 'var(--status-err)' }}>●</span> Active Blockers
          </div>
          {blockers.map(b => (
            <div key={b.status_key} style={s.blockerItem}>
              <span style={s.blockerItemLabel}>{b.status_label}</span>
              <span style={s.blockerItemDetail}>{b.status_detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* 4 health indicators */}
      <div style={s.healthGrid}>
        {HEALTH_INDICATORS.map(ind => (
          <HealthCard
            key={ind.key}
            indicator={ind}
            metrics={metrics}
            governance={governance}
          />
        ))}
      </div>

      {/* Governance status */}
      <div style={s.govPanel}>
        <div style={s.govPanelTitle}>Governance Status</div>
        {governance.map(g => <GovRow key={g.status_key} item={g} />)}
        <p style={s.govNote}>
          Data sourced from governance_status table. Stewards can update via Admin.
        </p>
      </div>

      {/* Formation link */}
      <div style={s.formationLink}>
        <a
          href="https://techne.institute/formation/"
          target="_blank"
          rel="noopener noreferrer"
          style={s.formationAnchor}
        >
          Read the full formation narrative →
        </a>
        <span style={s.formationSub}>
          Detailed financial, governance, and decision history at techne.institute/formation/
        </span>
      </div>

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: { padding: '1.5rem', maxWidth: '720px' },
  loadingText: { color: 'var(--text-dim)', fontSize: '0.875rem', padding: '2rem 0' },
  errorText: { color: 'var(--status-err)', fontSize: '0.875rem', padding: '2rem 0' },

  header: { marginBottom: '1.5rem' },
  headerTitle: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' },
  headerSub: { fontSize: '0.75rem', color: 'var(--text-dim)' },

  // Treasury bar
  treasuryBar: {
    background: 'var(--surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  treasuryTitle: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--text-dim)', marginBottom: '1rem',
  },
  treasuryStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' },
  statBox: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  statVal: { fontSize: '1.1rem', fontWeight: 700 },
  statLabel: { fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  statSub: { fontSize: '0.65rem', color: 'var(--text-dim)' },
  mrrBar: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  mrrBarLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' },
  mrrBarTrack: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' },
  mrrBarFill: { height: '100%', background: '#4ade80', borderRadius: '2px', transition: 'width 0.3s' },

  // Blockers
  blockersPanel: {
    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '8px', padding: '1rem', marginBottom: '1rem',
  },
  blockersPanelTitle: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--text-dim)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  blockerItem: { display: 'flex', flexDirection: 'column', gap: '0.1rem', marginBottom: '0.5rem' },
  blockerItemLabel: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-err)' },
  blockerItemDetail: { fontSize: '0.75rem', color: 'var(--text-accent)', lineHeight: 1.45 },

  // Health grid
  healthGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem',
  },
  healthCard: {
    background: 'var(--surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '1rem',
  },
  healthHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  healthLabel: { fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 },
  healthStatus: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' },
  healthSummary: { margin: '0 0 0.6rem', fontSize: '0.75rem', color: 'var(--text-accent)', lineHeight: 1.5 },
  healthMetrics: { display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' },
  healthGov: { display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' },
  healthMetric: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  healthGovRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  healthMetricLabel: { fontSize: '0.7rem', color: 'var(--text-dim)' },
  healthMetricVal: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-accent)' },

  // Governance panel
  govPanel: {
    background: 'var(--surface)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
  },
  govPanelTitle: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--text-dim)', marginBottom: '0.75rem',
  },
  govRow: {
    display: 'grid', gridTemplateColumns: '1fr auto',
    gap: '0.4rem 1rem', alignItems: 'start',
    padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  govLeft: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  govLabel: { fontSize: '0.825rem', color: 'var(--text-accent)' },
  govStatus: { fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', textAlign: 'right' },
  govDetail: {
    gridColumn: '1 / -1', fontSize: '0.72rem', color: 'var(--text-dim)',
    lineHeight: 1.45, paddingBottom: '0.25rem',
  },
  blockerChip: {
    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--status-err)', background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.25)', borderRadius: '3px',
    padding: '1px 4px', flexShrink: 0,
  },
  govNote: { margin: '0.75rem 0 0', fontSize: '0.7rem', color: 'var(--text-dim)', fontStyle: 'italic' },

  // Formation link
  formationLink: {
    display: 'flex', flexDirection: 'column', gap: '0.3rem',
    padding: '0.75rem 1rem',
    background: 'rgba(196,149,106,0.05)',
    border: '1px solid rgba(196,149,106,0.15)',
    borderRadius: '8px',
  },
  formationAnchor: {
    color: 'var(--gold, #c4956a)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none',
  },
  formationSub: { fontSize: '0.7rem', color: 'var(--text-dim)' },
}
