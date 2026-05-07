import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

export default function Ventures() {
  const { participant } = useAuth()
  const [positions, setPositions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Class 4 gate — non-investors see an explanatory redirect notice
  const isClass4 = participant?.membership_class === 4

  useEffect(() => {
    if (!participant?.id || !isClass4) { setLoading(false); return }

    async function load() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('venture_basket')
          .select('id, venture_name, equity_pct_absolute, equity_pct_relative, status, initial_contribution, accumulated_allocations, current_book_value, conversion_timeline, redemption_options, annualized_return_pct, entry_date, exit_date, notes')
          .eq('participant_id', participant.id)
          .order('entry_date', { ascending: true, nullsFirst: true })

        if (fetchErr) { setError(fetchErr.message); setLoading(false); return }
        setPositions(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [participant?.id, isClass4])

  // Compute summary totals from positions
  const summary = positions ? {
    totalCommitted:   positions.reduce((s, p) => s + Number(p.initial_contribution    || 0), 0),
    totalCurrentValue: positions.reduce((s, p) => s + Number(p.current_book_value      || 0), 0),
    totalAllocations: positions.reduce((s, p) => s + Number(p.accumulated_allocations || 0), 0),
    activeCount: positions.filter(p => p.status === 'active').length,
  } : null

  const statusLabel = { active: 'Active', exited: 'Exited', dissolved: 'Dissolved', transferred: 'Transferred', written_off: 'Written Off', pending: 'Pending' }
  const statusColor = { active: '#4caf88', exited: 'var(--gold)', dissolved: 'var(--text-muted)', written_off: 'var(--text-muted)', transferred: 'var(--text-muted)', pending: 'var(--text-soft)' }

  // Not Class 4 — show redirect notice
  if (!loading && !isClass4) {
    return (
      <div style={styles.page}>
        <div style={styles.main}>
          <nav style={styles.breadcrumb}>
            <a href="/intranet/" style={styles.breadLink}>Home</a>
            <span style={styles.breadSep}>/</span>
            <span>Venture Basket</span>
          </nav>
          <div style={styles.gateNotice}>
            <div style={styles.gateTitle}>Class 4 members only</div>
            <p style={styles.gateBody}>
              The Venture Basket portal is available to Class 4 (Investor) members.
              Your current membership class does not include access to this section.
            </p>
            <p style={styles.gateBody}>
              Interested in becoming a Class 4 investor?{' '}
              <a href="mailto:steward@techne.studio" style={styles.link}>Contact a steward</a> to learn more.
            </p>
            <a href="/intranet/" style={styles.backLink}>Back to home</a>
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
          <span>Venture Basket</span>
        </nav>

        <h1 style={styles.h1}>Venture Basket</h1>
        <p style={styles.subtitle}>Your Class 4 investor portfolio — basket composition, status, and returns.</p>

        {loading && <div style={styles.loading}>Loading portfolio…</div>}
        {!loading && error && <div style={styles.error}>Error: {error}</div>}

        {!loading && !error && summary && (
          <>
            {/* Summary strip */}
            <div style={styles.summaryRow}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Committed</div>
                <div style={styles.summaryValue}>{fmt(summary.totalCommitted)}</div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Current Value</div>
                <div style={styles.summaryValue}>{fmt(summary.totalCurrentValue)}</div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Accumulated Allocations</div>
                <div style={styles.summaryValue}>{fmt(summary.totalAllocations)}</div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Active Positions</div>
                <div style={styles.summaryValue}>{summary.activeCount}</div>
              </div>
            </div>

            {/* Position list */}
            {positions.length > 0 ? (
              <div style={styles.section}>
                <h2 style={styles.h2}>Positions</h2>
                <div style={styles.positionList}>
                  {positions.map((pos) => (
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
            <a href="mailto:steward@techne.studio" style={styles.link}>Contact a steward</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

function PositionRow({ pos, statusLabel, statusColor }) {
  const moic = pos.initial_contribution && pos.current_book_value
    ? (Number(pos.current_book_value) / Number(pos.initial_contribution)).toFixed(2)
    : null

  return (
    <div style={styles.posRow}>
      <div style={styles.posMain}>
        <div style={styles.posName}>{pos.venture_name || 'Unnamed venture'}</div>
        <div style={styles.posMeta}>
          {pos.entry_date ? `Entry ${new Date(pos.entry_date).getFullYear()}` : ''}
          {pos.entry_date && (pos.equity_pct_absolute != null) ? ' · ' : ''}
          {pos.equity_pct_absolute != null ? `${Number(pos.equity_pct_absolute).toFixed(2)}% equity` : ''}
          {pos.equity_pct_relative != null ? ` (${Number(pos.equity_pct_relative).toFixed(1)}% of basket)` : ''}
        </div>
        {(pos.conversion_timeline || pos.redemption_options) && (
          <div style={{ ...styles.posMeta, marginTop: '0.25rem' }}>
            {pos.conversion_timeline && `Conversion: ${pos.conversion_timeline}`}
            {pos.conversion_timeline && pos.redemption_options ? ' · ' : ''}
            {pos.redemption_options && `Redemption: ${pos.redemption_options}`}
          </div>
        )}
      </div>

      <div style={styles.posNumbers}>
        <div style={styles.posAmt}>
          <span style={styles.posAmtLabel}>Committed</span>
          <span>{fmt(pos.initial_contribution)}</span>
        </div>
        <div style={styles.posAmt}>
          <span style={styles.posAmtLabel}>Book Value</span>
          <span>{fmt(pos.current_book_value)}</span>
        </div>
        {pos.accumulated_allocations > 0 && (
          <div style={styles.posAmt}>
            <span style={styles.posAmtLabel}>Allocations</span>
            <span>{fmt(pos.accumulated_allocations)}</span>
          </div>
        )}
        {moic && (
          <div style={styles.posAmt}>
            <span style={styles.posAmtLabel}>MOIC</span>
            <span>{moic}x</span>
          </div>
        )}
        {pos.annualized_return_pct != null && (
          <div style={styles.posAmt}>
            <span style={styles.posAmtLabel}>Ann. Return</span>
            <span>{Number(pos.annualized_return_pct).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div style={{
        ...styles.statusBadge,
        color: statusColor[pos.status] || 'var(--text-muted)',
        borderColor: statusColor[pos.status] || 'var(--text-muted)',
      }}>
        {statusLabel[pos.status] || pos.status || 'Unknown'}
      </div>
    </div>
  )
}

function fmt(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--app-bg)' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' },
  breadLink: { color: 'var(--gold)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem' },
  subtitle: { fontSize: '1rem', color: 'var(--text-muted)', margin: '0 0 2rem' },
  loading: { color: 'var(--text-muted)', padding: '2rem 0' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: 'var(--status-err)' },
  gateNotice: {
    padding: '2rem', background: 'var(--surface)',
    border: '1px solid var(--border-mid)', borderRadius: '10px', maxWidth: '560px',
  },
  gateTitle: { fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' },
  gateBody: { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.75rem' },
  backLink: { display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none' },
  link: { color: 'var(--gold)', textDecoration: 'none' },
  summaryRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem', marginBottom: '2rem',
  },
  summaryCard: {
    padding: '1.25rem', background: 'var(--surface)',
    border: '1px solid var(--border-mid)', borderRadius: '10px',
  },
  summaryLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' },
  summaryValue: { fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' },
  section: { marginBottom: '2rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' },
  positionList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  posRow: {
    display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
    padding: '1rem 1.25rem', background: 'var(--surface)',
    border: '1px solid var(--border-mid)', borderRadius: '8px',
    flexWrap: 'wrap',
  },
  posMain: { flex: 1, minWidth: '160px' },
  posName: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' },
  posMeta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  posNumbers: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' },
  posAmt: { display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' },
  posAmtLabel: { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statusBadge: {
    padding: '0.25rem 0.6rem', borderRadius: '4px',
    border: '1px solid', fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, alignSelf: 'flex-start',
  },
  emptyNotice: {
    padding: '2rem', background: 'var(--surface)',
    border: '1px solid var(--border-mid)', borderRadius: '10px', marginBottom: '2rem',
  },
  emptyTitle: { fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' },
  emptyBody: { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 },
  disclosureBox: {
    marginTop: '2.5rem', padding: '1.25rem',
    background: 'rgba(196,149,106,0.04)', border: '1px solid rgba(196,149,106,0.12)',
    borderRadius: '8px',
  },
  disclosureTitle: { display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' },
  disclosureText: { fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.5rem' },
}
