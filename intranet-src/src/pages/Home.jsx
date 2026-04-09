import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

// ─── Mini-panel data fetchers ─────────────────────────────────────────────────

function useDashboardMetrics(participantId) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!participantId) return

    async function fetchAll() {
      const [capitalRes, laborRes, projectsRes, proposalsRes, ledgerRes] = await Promise.all([
        supabase
          .from('capital_accounts')
          .select('book_balance, last_updated')
          .eq('participant_id', participantId)
          .maybeSingle(),
        supabase
          .from('labor_contributions')
          .select('hours, fmv_value')
          .eq('participant_id', participantId),
        supabase
          .from('projects')
          .select('id, status')
          .eq('status', 'active'),
        supabase
          .from('proposals')
          .select('id, status')
          .eq('status', 'open'),
        supabase
          .from('rea_ledger')
          .select('resource_type, balance, state_merkle_root')
          .order('resource_type'),
      ])

      const totalLabor = (laborRes.data || []).reduce((s, r) => s + Number(r.hours || 0), 0)
      const totalFmv   = (laborRes.data || []).reduce((s, r) => s + Number(r.fmv_value || 0), 0)

      // Get the most recent merkle root (from first rea_ledger entry that has one)
      const rootEntry = (ledgerRes.data || []).find(r => r.state_merkle_root)

      setData({
        capital:     capitalRes.data || null,
        laborHours:  totalLabor,
        laborFmv:    totalFmv,
        activeProjects: (projectsRes.data || []).length,
        openProposals:  (proposalsRes.data || []).length,
        merkleRoot:  rootEntry?.state_merkle_root || null,
        ledger:      ledgerRes.data || [],
      })
      setLoading(false)
    }

    fetchAll()
  }, [participantId])

  return { data, loading }
}

// ─── Metric card component ────────────────────────────────────────────────────

function MetricCard({ title, icon, href, color, children, badge }) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid #1a1a2e',
        borderRadius: '10px',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color || '#c2512a'
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1a1a2e'
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
      }}
    >
      {/* Color accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${color || '#c2512a'} 0%, transparent 100%)`,
        opacity: 0.7,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#52526a',
        }}>{title}</span>
        <span style={{ fontSize: '1rem', opacity: 0.5 }}>{icon}</span>
      </div>

      {/* Content */}
      {children}

      {badge && (
        <div style={{
          position: 'absolute', bottom: '0.75rem', right: '0.75rem',
          fontSize: '0.62rem', color: color || '#c2512a',
          background: `${color || '#c2512a'}18`,
          padding: '2px 6px', borderRadius: '3px',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
        }}>{badge}</div>
      )}
    </a>
  )
}

function MetricValue({ value, sub, mono }) {
  return (
    <div>
      <div style={{
        fontSize: '1.6rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: '#e0e0f0',
        fontFamily: mono ? "'JetBrains Mono', 'Fira Code', Consolas, monospace" : 'inherit',
        lineHeight: 1.1,
      }}>{value}</div>
      {sub && (
        <div style={{
          fontSize: '0.75rem',
          color: '#52526a',
          marginTop: '0.3rem',
          lineHeight: 1.4,
        }}>{sub}</div>
      )}
    </div>
  )
}

function MerkleIndicator({ root }) {
  if (!root) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>◎ No root</span>
    </div>
  )
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem',
      }}>
        <span style={{ color: '#4caf82', fontSize: '0.72rem', fontWeight: 700 }}>✓ Verifiable</span>
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: '0.68rem',
        color: '#52526a',
        letterSpacing: '0.02em',
        wordBreak: 'break-all',
      }}>
        {root.slice(0, 20)}…{root.slice(-8)}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Home() {
  const { participant, isSteward } = useAuth()
  const { data, loading } = useDashboardMetrics(participant?.id)

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const fmtHrs = (n) =>
    Number(n || 0).toFixed(1) + ' hrs'

  const membershipLabel = {
    1: 'Class 1 · Labor',
    2: 'Class 2 · Patron',
    3: 'Class 3 · Community',
    4: 'Class 4 · Investor',
  }

  return (
    <div style={styles.page}>
      {/* Panel header */}
      <div style={styles.panelHeader}>
        <div>
          <h1 style={styles.title}>
            {participant?.name ? `${participant.name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p style={styles.subtitle}>
            {participant?.membership_class
              ? membershipLabel[participant.membership_class]
              : 'Cooperative member'}
            {' · '}
            <span style={{ color: '#52526a' }}>techne.institute</span>
          </p>
        </div>
        <div style={styles.headerMeta}>
          <span style={styles.onlineDot} />
          <span style={styles.onlineLabel}>Live</span>
        </div>
      </div>

      {/* Metric grid */}
      {loading ? (
        <div style={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <div style={styles.grid}>

          {/* Capital Account */}
          <MetricCard
            title="Capital Account"
            icon="◉"
            href="/intranet/account/"
            color="#c2512a"
          >
            <MetricValue
              value={data.capital ? fmt(data.capital.book_balance) : '—'}
              sub={data.capital?.last_updated
                ? `Last updated ${new Date(data.capital.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'No account data'}
              mono
            />
          </MetricCard>

          {/* Labor */}
          <MetricCard
            title="Labor Contributions"
            icon="⏱"
            href="/intranet/labor/"
            color="#7eb8e8"
          >
            <MetricValue
              value={fmtHrs(data.laborHours)}
              sub={data.laborFmv > 0 ? `FMV: ${fmt(data.laborFmv)}` : 'Log hours to track FMV'}
            />
          </MetricCard>

          {/* Projects */}
          <MetricCard
            title="Active Projects"
            icon="◇"
            href="/intranet/projects/"
            color="#a78bfa"
          >
            <MetricValue
              value={String(data.activeProjects ?? 0)}
              sub="Currently running"
            />
          </MetricCard>

          {/* Governance */}
          <MetricCard
            title="Governance"
            icon="⊕"
            href="/intranet/governance/"
            color={data.openProposals > 0 ? '#f59e0b' : '#4caf82'}
            badge={data.openProposals > 0 ? `${data.openProposals} open` : null}
          >
            <MetricValue
              value={String(data.openProposals ?? 0)}
              sub={data.openProposals > 0 ? 'Proposals awaiting votes' : 'No pending proposals'}
            />
          </MetricCard>

          {/* REA Ledger state */}
          <MetricCard
            title="State Verifier"
            icon="◈"
            href="/intranet/verify/"
            color="#4caf82"
          >
            <MerkleIndicator root={data.merkleRoot} />
          </MetricCard>

          {/* Cloud */}
          <MetricCard
            title="Cloud Micro-Grid"
            icon="⬡"
            href="/intranet/cloud/"
            color="#7eb8e8"
          >
            <MetricValue
              value="R13"
              sub="Solar compute · 3 scenarios"
            />
          </MetricCard>

          {/* REA Journal */}
          <MetricCard
            title="REA Journal"
            icon="≡"
            href="/intranet/journal/"
            color="#8888a8"
          >
            <MetricValue
              value="Append-only"
              sub="Economic event log"
            />
          </MetricCard>

          {/* REA Ledger */}
          <MetricCard
            title="REA Ledger"
            icon="⊞"
            href="/intranet/ledger/"
            color="#52526a"
          >
            <MetricValue
              value={String(data.ledger?.length ?? 0)}
              sub="Account balances"
            />
          </MetricCard>

          {/* Patronage */}
          <MetricCard
            title="Patronage"
            icon="★"
            href="/intranet/patronage/"
            color="#c2512a"
          >
            <MetricValue
              value="40/30/20/10"
              sub="Labor · Revenue · Cash · Community"
            />
          </MetricCard>

          {/* Treasury — steward only */}
          {isSteward && (
            <MetricCard
              title="Treasury"
              icon="⌖"
              href="/intranet/treasury/"
              color="#c2512a"
              badge="Steward"
            >
              <MetricValue
                value="Bank accounts"
                sub="Transactions & balances"
              />
            </MetricCard>
          )}

          {/* Member Guide */}
          <MetricCard
            title="Member Guide"
            icon="≡"
            href="/intranet/guide/"
            color="#2a2a40"
          >
            <MetricValue
              value="Bylaws &amp; Docs"
              sub="Articles, member agreement"
            />
          </MetricCard>

          {/* Directory */}
          <MetricCard
            title="Directory"
            icon="⊛"
            href="/intranet/directory/"
            color="#4caf82"
          >
            <MetricValue
              value="Organizers"
              sub="Roles, crafts, membership"
            />
          </MetricCard>

        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    padding: '2rem',
    maxWidth: '1100px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#e0e0f0',
    margin: 0,
    lineHeight: 1.15,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#52526a',
    margin: '0.35rem 0 0',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '0.25rem',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4caf82',
    boxShadow: '0 0 6px #4caf82',
    flexShrink: 0,
  },
  onlineLabel: {
    fontSize: '0.68rem',
    color: '#4caf82',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  skeletonCard: {
    height: '120px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1a1a2e',
    borderRadius: '10px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}
