import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

export default function Ventures() {
  const { participant } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Venture basket data not yet available — show empty state
    setLoading(false)
  }, [])

  const statusLabel = {
    active: 'Active',
    exited: 'Exited',
    written_off: 'Written Off',
    pending: 'Pending',
  }

  const statusColor = {
    active: '#4caf88',
    exited: 'var(--color-copper, #c87533)',
    written_off: '#888',
    pending: '#aaa',
  }

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Venture Basket</span>
        </nav>

        <h1 style={styles.h1}>Venture Basket</h1>
        <p style={styles.subtitle}>Your Class 4 investor portfolio — basket composition, status, and returns.</p>

        {loading && <div style={styles.loading}>Loading portfolio…</div>}
        {!loading && error && <div style={styles.error}>Error: {error}</div>}

        {!loading && !error && data && (
          <>
            {/* Summary strip */}
            <div style={styles.summaryRow}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Committed</div>
                <div style={styles.summaryValue}>
                  {formatUSD(data.summary?.total_committed_cents)}
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Deployed</div>
                <div style={styles.summaryValue}>
                  {formatUSD(data.summary?.total_deployed_cents)}
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Current Value</div>
                <div style={styles.summaryValue}>
                  {formatUSD(data.summary?.total_current_value_cents)}
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Distributions</div>
                <div style={styles.summaryValue}>
                  {formatUSD(data.summary?.total_distributions_cents)}
                </div>
              </div>
            </div>

            {/* Position table */}
            {data.positions && data.positions.length > 0 ? (
              <div style={styles.section}>
                <h2 style={styles.h2}>Positions</h2>
                <div style={styles.positionList}>
                  {data.positions.map((pos) => (
                    <PositionRow key={pos.id} pos={pos} statusLabel={statusLabel} statusColor={statusColor} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.emptyNotice}>
                <div style={styles.emptyTitle}>No positions recorded</div>
                <p style={styles.emptyBody}>
                  Your venture basket positions will appear here once the steward has recorded them.
                  Contact a steward if you believe this is an error.
                </p>
              </div>
            )}
          </>
        )}

        <div style={styles.disclosureBox}>
          <strong style={styles.disclosureTitle}>Important disclosure</strong>
          <p style={styles.disclosureText}>
            Class 4 investor interests are non-transferable without written consent of the Board of
            Directors. Past returns do not guarantee future performance. Venture basket positions
            represent illiquid, high-risk investments. This portal is for informational purposes
            only and does not constitute investment advice.
          </p>
          <p style={styles.disclosureText}>
            Questions about your position?{' '}
            <a href="mailto:steward@techne.studio" style={styles.link}>
              Contact a steward
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

function PositionRow({ pos, statusLabel, statusColor }) {
  const moic =
    pos.committed_cents && pos.current_value_cents
      ? (pos.current_value_cents / pos.committed_cents).toFixed(2)
      : null

  return (
    <div style={styles.posRow}>
      <div style={styles.posMain}>
        <div style={styles.posName}>{pos.venture_name || 'Unnamed venture'}</div>
        <div style={styles.posMeta}>
          {pos.vintage_year ? `Vintage ${pos.vintage_year}` : ''}
          {pos.vintage_year && pos.instrument ? ' · ' : ''}
          {pos.instrument || ''}
        </div>
      </div>
      <div style={styles.posNumbers}>
        <div style={styles.posAmt}>
          <span style={styles.posAmtLabel}>Committed</span>
          <span>{formatUSD(pos.committed_cents)}</span>
        </div>
        <div style={styles.posAmt}>
          <span style={styles.posAmtLabel}>Value</span>
          <span>{formatUSD(pos.current_value_cents)}</span>
        </div>
        {moic && (
          <div style={styles.posAmt}>
            <span style={styles.posAmtLabel}>MOIC</span>
            <span>{moic}×</span>
          </div>
        )}
      </div>
      <div
        style={{
          ...styles.statusBadge,
          color: statusColor[pos.status] || '#888',
          borderColor: statusColor[pos.status] || '#888',
        }}
      >
        {statusLabel[pos.status] || pos.status || 'Unknown'}
      </div>
    </div>
  )
}

function formatUSD(cents) {
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}



const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', borderBottom: '1px solid var(--color-border, #2a2a35)',
    background: 'var(--color-surface, #141418)',
  },
  wordmark: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
  headerNav: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { fontSize: '0.875rem', color: 'var(--color-text-muted, #888)', textDecoration: 'none' },
  signOut: {
    background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '6px',
    padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
  },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', marginBottom: '1rem' },
  breadLink: { color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem' },
  subtitle: { fontSize: '1rem', color: 'var(--color-text-muted, #888)', margin: '0 0 2rem' },
  loading: { color: 'var(--color-text-muted, #888)', padding: '2rem 0' },
  error: {
    padding: '1rem', background: 'rgba(220,60,60,0.1)',
    border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#ff6b6b',
  },
  summaryRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem', marginBottom: '2rem',
  },
  summaryCard: {
    padding: '1.25rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '10px',
  },
  summaryLabel: { fontSize: '0.75rem', color: 'var(--color-text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' },
  summaryValue: { fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' },
  section: { marginBottom: '2rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' },
  positionList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  posRow: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    padding: '1rem 1.25rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '8px',
    flexWrap: 'wrap',
  },
  posMain: { flex: 1, minWidth: '160px' },
  posName: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
  posMeta: { fontSize: '0.8rem', color: 'var(--color-text-muted, #888)' },
  posNumbers: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  posAmt: { display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' },
  posAmtLabel: { fontSize: '0.7rem', color: 'var(--color-text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statusBadge: {
    padding: '0.25rem 0.6rem', borderRadius: '4px',
    border: '1px solid', fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
  },
  emptyNotice: {
    padding: '2rem', background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)', borderRadius: '10px', marginBottom: '2rem',
  },
  emptyTitle: { fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' },
  emptyBody: { fontSize: '0.9rem', color: 'var(--color-text-muted, #aaa)', lineHeight: 1.6, margin: 0 },
  disclosureBox: {
    marginTop: '2.5rem', padding: '1.25rem',
    background: 'rgba(200,117,51,0.04)', border: '1px solid rgba(200,117,51,0.12)',
    borderRadius: '8px',
  },
  disclosureTitle: { display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' },
  disclosureText: { fontSize: '0.8rem', color: 'var(--color-text-muted, #999)', lineHeight: 1.6, margin: '0 0 0.5rem' },
  link: { color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
}
