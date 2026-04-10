import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

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
    color: '#4ade80',
    summary: 'Third floor lease active. Revenue generation mode begins.',
    metrics: ['lease_monthly', 'capital_committed', 'pipeline_leads'],
  },
  {
    key: 'homeostasis',
    label: 'Homeostasis',
    status: 'Stabilizing',
    color: '#facc15',
    summary: 'Governance structures forming. Family meetings formalized.',
    govKeys: ['board_formed', 'family_meetings', 'schedule_a_approved'],
  },
  {
    key: 'circulation',
    label: 'Circulation',
    status: '~$5K MRR',
    color: '#60a5fa',
    summary: 'Revenue growing. Target: $10–11K/mo by June 2027.',
    metrics: ['mrr_current', 'mrr_target'],
  },
  {
    key: 'symbiosis',
    label: 'Symbiosis',
    status: 'Deepening',
    color: '#c084fc',
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
      <div style={{ ...s.statVal, color: color || 'var(--text-primary, #e8e0d4)' }}>{value}</div>
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
        <div style={s.headerTitle}>Ecosystem Health</div>
        <div style={s.headerSub}>RegenHub, LCA · Boulder, Colorado · Live metrics</div>
      </div>

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
            color="var(--text-primary, #e8e0d4)"
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
            <span style={{ color: '#f87171' }}>●</span> Active Blockers
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
  loadingText: { color: 'var(--text-dim, #666)', fontSize: '0.875rem', padding: '2rem 0' },
  errorText: { color: '#f87171', fontSize: '0.875rem', padding: '2rem 0' },

  header: { marginBottom: '1.5rem' },
  headerTitle: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary, #e8e0d4)', marginBottom: '0.2rem' },
  headerSub: { fontSize: '0.75rem', color: 'var(--text-dim, #666)' },

  // Treasury bar
  treasuryBar: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  treasuryTitle: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--text-dim, #555)', marginBottom: '1rem',
  },
  treasuryStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' },
  statBox: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  statVal: { fontSize: '1.1rem', fontWeight: 700 },
  statLabel: { fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim, #666)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  statSub: { fontSize: '0.65rem', color: 'var(--text-dim, #555)' },
  mrrBar: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  mrrBarLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim, #666)' },
  mrrBarTrack: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' },
  mrrBarFill: { height: '100%', background: '#4ade80', borderRadius: '2px', transition: 'width 0.3s' },

  // Blockers
  blockersPanel: {
    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '8px', padding: '1rem', marginBottom: '1rem',
  },
  blockersPanelTitle: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--text-dim, #666)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  blockerItem: { display: 'flex', flexDirection: 'column', gap: '0.1rem', marginBottom: '0.5rem' },
  blockerItemLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#f87171' },
  blockerItemDetail: { fontSize: '0.75rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.45 },

  // Health grid
  healthGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem',
  },
  healthCard: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '1rem',
  },
  healthHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  healthLabel: { fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #e8e0d4)', flex: 1 },
  healthStatus: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' },
  healthSummary: { margin: '0 0 0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.5 },
  healthMetrics: { display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' },
  healthGov: { display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' },
  healthMetric: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  healthGovRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  healthMetricLabel: { fontSize: '0.7rem', color: 'var(--text-dim, #666)' },
  healthMetricVal: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #aaa)' },

  // Governance panel
  govPanel: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
  },
  govPanelTitle: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--text-dim, #555)', marginBottom: '0.75rem',
  },
  govRow: {
    display: 'grid', gridTemplateColumns: '1fr auto',
    gap: '0.4rem 1rem', alignItems: 'start',
    padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  govLeft: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  govLabel: { fontSize: '0.825rem', color: 'var(--text-secondary, #aaa)' },
  govStatus: { fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', textAlign: 'right' },
  govDetail: {
    gridColumn: '1 / -1', fontSize: '0.72rem', color: 'var(--text-dim, #666)',
    lineHeight: 1.45, paddingBottom: '0.25rem',
  },
  blockerChip: {
    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: '#f87171', background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.25)', borderRadius: '3px',
    padding: '1px 4px', flexShrink: 0,
  },
  govNote: { margin: '0.75rem 0 0', fontSize: '0.7rem', color: 'var(--text-dim, #555)', fontStyle: 'italic' },

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
  formationSub: { fontSize: '0.7rem', color: 'var(--text-dim, #666)' },
}
