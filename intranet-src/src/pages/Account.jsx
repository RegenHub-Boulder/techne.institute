import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

const TYPE_LABELS = {
  initial: 'Initial Contribution',
  labor: 'Labor Patronage',
  capital: 'Capital Contribution',
  patronage: 'Patronage Dividend',
  draw: 'Draw / Distribution',
  adjustment: 'Adjustment',
}

const TYPE_COLORS = {
  initial: 'var(--ember, #c4956a)',
  labor: '#50b478',
  capital: '#4a9eff',
  patronage: '#b47cd4',
  draw: '#ff6b6b',
  adjustment: '#888',
}

export default function Account() {
  const { participant } = useAuth()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!participant) return

    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Fetch capital account for current participant
        const { data: acctData, error: acctErr } = await supabase
          .from('capital_accounts')
          .select('id, book_balance, tax_balance, last_updated')
          .eq('participant_id', participant.id)
          .maybeSingle()

        if (acctErr) throw acctErr

        setAccount(acctData)

        if (acctData) {
          // Fetch transactions for this account
          const { data: txns, error: txnErr } = await supabase
            .from('capital_transactions')
            .select('id, transaction_type, amount, description, effective_date, created_at')
            .eq('capital_account_id', acctData.id)
            .order('effective_date', { ascending: false })
            .limit(20)

          if (txnErr) throw txnErr
          setTransactions(txns || [])
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [participant])

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  // Compute breakdown by type
  const breakdown = transactions.reduce((acc, t) => {
    const type = t.transaction_type
    if (!acc[type]) acc[type] = 0
    acc[type] += parseFloat(t.amount || 0)
    return acc
  }, {})

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Capital Account</span>
        </nav>

        <h1 style={styles.h1}>Capital Account</h1>
        {participant?.name && (
          <div style={styles.memberName}>{participant.name}</div>
        )}

        {loading && <LoadingCard />}

        {!loading && error && (
          <div style={styles.error}>Error loading account: {error}</div>
        )}

        {!loading && !error && !account && (
          <div style={styles.emptyNotice}>
            No capital account found. Contact a steward to set up your account.
          </div>
        )}

        {!loading && !error && account && (
          <>
            {/* Balance cards */}
            <div style={styles.balanceRow}>
              <BalanceCard
                label="Book Balance (GAAP)"
                value={fmt(account.book_balance)}
                sub="Economic fair value — basis for ownership and redemption"
              />
              <BalanceCard
                label="Tax Capital (IRC 704b)"
                value={fmt(account.tax_balance)}
                sub="Subchapter K basis — used for K-1 preparation"
              />
            </div>

            {account.last_updated && (
              <div style={styles.lastUpdated}>
                Last updated{' '}
                {new Date(account.last_updated).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            )}

            {/* Contribution breakdown */}
            {Object.keys(breakdown).length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.h2}>Contribution Breakdown</h2>
                <div style={styles.breakdownGrid}>
                  {Object.entries(breakdown).map(([type, total]) => (
                    <div key={type} style={styles.breakdownCard}>
                      <div
                        style={{
                          ...styles.breakdownDot,
                          background: TYPE_COLORS[type] || '#888',
                        }}
                      />
                      <div style={styles.breakdownLabel}>
                        {TYPE_LABELS[type] || type}
                      </div>
                      <div style={styles.breakdownValue}>{fmt(total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction history */}
            <div style={styles.section}>
              <h2 style={styles.h2}>Transaction History</h2>
              {transactions.length === 0 ? (
                <div style={styles.emptyNotice}>
                  No transactions recorded yet.
                </div>
              ) : (
                <div style={styles.txnList}>
                  {transactions.map((t) => (
                    <div key={t.id} style={styles.txnRow}>
                      <div style={styles.txnLeft}>
                        <span
                          style={{
                            ...styles.txnTypeBadge,
                            background: TYPE_COLORS[t.transaction_type]
                              ? `${TYPE_COLORS[t.transaction_type]}22`
                              : 'rgba(128,128,128,0.1)',
                            color: TYPE_COLORS[t.transaction_type] || '#888',
                          }}
                        >
                          {TYPE_LABELS[t.transaction_type] || t.transaction_type}
                        </span>
                        <span style={styles.txnDesc}>{t.description}</span>
                      </div>
                      <div style={styles.txnRight}>
                        <span
                          style={{
                            ...styles.txnAmount,
                            color:
                              parseFloat(t.amount) < 0 ? '#ff6b6b' : '#50b478',
                          }}
                        >
                          {parseFloat(t.amount) >= 0 ? '+' : ''}
                          {fmt(t.amount)}
                        </span>
                        <span style={styles.txnDate}>
                          {new Date(t.effective_date).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patronage formula */}
            <div style={styles.section}>
              <h2 style={styles.h2}>Patronage Formula</h2>
              <div style={styles.formulaGrid}>
                {[
                  { label: 'Labor', pct: '40%', desc: 'Hours contributed to cooperative work' },
                  { label: 'Revenue', pct: '30%', desc: 'Patronage transactions with the cooperative' },
                  { label: 'Capital', pct: '20%', desc: 'Capital deployed to cooperative ventures' },
                  { label: 'Community', pct: '10%', desc: 'Civic and community contributions' },
                ].map(({ label, pct, desc }) => (
                  <div key={label} style={styles.formulaCard}>
                    <div style={styles.formulaPct}>{pct}</div>
                    <div style={styles.formulaLabel}>{label}</div>
                    <div style={styles.formulaDesc}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.linksRow}>
              <a href="/intranet/documents/" style={styles.linkBtnSecondary}>
                K-1 documents →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BalanceCard({ label, value, sub }) {
  return (
    <div style={styles.balanceCard}>
      <div style={styles.balanceLabel}>{label}</div>
      <div style={styles.balanceValue}>{value}</div>
      <div style={styles.balanceSub}>{sub}</div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div style={styles.loadingCard}>
      <div style={styles.loadingPulse} />
      <div style={{ ...styles.loadingPulse, width: '60%', marginTop: '0.5rem' }} />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  breadcrumb: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted, #888)',
    marginBottom: '1rem',
  },
  breadLink: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: {
    fontSize: '1.75rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: '0 0 0.25rem',
  },
  memberName: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted, #888)',
    marginBottom: '1.5rem',
  },
  balanceRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  balanceCard: {
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  balanceLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #888)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '0.5rem',
  },
  balanceValue: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: '0.5rem',
  },
  balanceSub: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted, #666)',
    lineHeight: 1.4,
  },
  lastUpdated: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted, #666)',
    marginBottom: '2rem',
  },
  section: { marginTop: '2rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.75rem',
  },
  breakdownCard: {
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  breakdownDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  breakdownLabel: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted, #888)',
  },
  breakdownValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  txnList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  txnRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid var(--color-border, #2a2a35)',
    gap: '1rem',
  },
  txnLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: 0,
  },
  txnRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.2rem',
    flexShrink: 0,
  },
  txnTypeBadge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'inline-block',
  },
  txnDesc: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted, #aaa)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  txnAmount: {
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  txnDate: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #666)',
  },
  formulaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
  },
  formulaCard: {
    background: 'var(--color-surface, #141418)',
    border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
  },
  formulaPct: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--ember, #c4956a)',
    marginBottom: '0.25rem',
  },
  formulaLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  formulaDesc: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #888)',
    lineHeight: 1.4,
  },
  linksRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  linkBtnSecondary: {
    padding: '0.65rem 1.25rem',
    background: 'none',
    border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  emptyNotice: {
    padding: '1.25rem',
    background: 'rgba(196,149,106,0.06)',
    border: '1px solid rgba(196,149,106,0.15)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: 1.6,
    marginTop: '1.5rem',
  },
  error: {
    padding: '1rem',
    background: 'rgba(220,60,60,0.1)',
    border: '1px solid rgba(220,60,60,0.3)',
    borderRadius: '8px',
    color: '#ff6b6b',
  },
  loadingCard: {
    padding: '1.5rem',
    background: 'var(--color-surface, #141418)',
    borderRadius: '10px',
    border: '1px solid var(--color-border, #2a2a35)',
  },
  loadingPulse: {
    height: '1.5rem',
    background: 'var(--color-border, #2a2a35)',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}
