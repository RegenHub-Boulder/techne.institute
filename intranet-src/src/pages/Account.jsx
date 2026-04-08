import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { IntranetHeader } from '../components/IntranetHeader.jsx'

export default function Account() {
  const { participant } = useAuth()
  const [account, setAccount] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const session = (await supabase.auth.getSession()).data.session
        if (!session) return

        const [acctRes, histRes] = await Promise.all([
          fetch(
            'https://hvbdpgkdcdskhpbdeeim.supabase.co/functions/v1/capital-account',
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          ),
          fetch(
            'https://hvbdpgkdcdskhpbdeeim.supabase.co/functions/v1/allocation-history?limit=8',
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          ),
        ])

        const acctData = await acctRes.json()
        const histData = await histRes.json()

        if (acctData.ok) setAccount(acctData.account)
        if (histData.ok) setHistory(histData.events || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const membershipLabel = {
    1: 'Class 1 — Labor',
    2: 'Class 2 — Patron',
    3: 'Class 3 — Community',
    4: 'Class 4 — Investor',
  }

  return (
    <div style={styles.page}>
      <IntranetHeader />
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Capital Account</span>
        </nav>

        <h1 style={styles.h1}>Capital Account</h1>
        {participant?.membership_class && (
          <div style={styles.memberClass}>
            {membershipLabel[participant.membership_class] || `Class ${participant.membership_class}`}
          </div>
        )}

        {loading && <LoadingCard />}

        {!loading && error && (
          <div style={styles.error}>Error loading account: {error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Balance cards */}
            <div style={styles.balanceRow}>
              <BalanceCard
                label="Book Balance (GAAP)"
                value={fmt(account?.book_balance)}
                sub="Economic fair value — basis for ownership and redemption"
              />
              <BalanceCard
                label="Tax Capital (IRC 704b)"
                value={fmt(account?.tax_balance)}
                sub="Subchapter K basis — used for K-1 preparation"
              />
            </div>

            {account?.last_updated && (
              <div style={styles.lastUpdated}>
                Last updated{' '}
                {new Date(account.last_updated).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            )}

            {/* Balance history sparkline (last 8 quarters) */}
            {history.length > 0 ? (
              <div style={styles.section}>
                <h2 style={styles.h2}>Balance History</h2>
                <MiniChart events={history} />
              </div>
            ) : (
              <div style={styles.emptyNotice}>
                No allocation history yet. Balance history will appear here after
                the first quarterly allocation is processed.
              </div>
            )}

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
              <a href="/intranet/patronage/" style={styles.linkBtn}>
                View full patronage history →
              </a>
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

function MiniChart({ events }) {
  const sorted = [...events].sort((a, b) => a.quarter.localeCompare(b.quarter))
  const max = Math.max(...sorted.map((e) => parseFloat(e.book_capital_balance || 0)), 1)
  return (
    <div style={styles.chart}>
      {sorted.map((e) => {
        const pct = (parseFloat(e.book_capital_balance || 0) / max) * 100
        return (
          <div key={e.id} style={styles.chartBar}>
            <div style={{ ...styles.chartFill, height: `${pct}%` }} />
            <div style={styles.chartLabel}>{e.quarter.replace('-', ' ')}</div>
          </div>
        )
      })}
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
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', borderBottom: '1px solid var(--color-border, #2a2a35)',
    background: 'var(--color-surface, #141418)',
  },
  wordmark: {
    fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-copper, #c87533)',
    textDecoration: 'none', letterSpacing: '-0.02em',
  },
  headerNav: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: {
    fontSize: '0.875rem', color: 'var(--color-text-muted, #888)',
    textDecoration: 'none',
  },
  signOut: {
    background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '6px',
    padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
  },
  main: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', marginBottom: '1rem' },
  breadLink: { color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.5rem' },
  memberClass: {
    display: 'inline-block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--color-copper, #c87533)', background: 'rgba(200,117,51,0.1)',
    padding: '0.25rem 0.6rem', borderRadius: '4px', marginBottom: '1.5rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  balanceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' },
  balanceCard: {
    background: 'var(--color-surface, #141418)', border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '10px', padding: '1.5rem',
  },
  balanceLabel: { fontSize: '0.75rem', color: 'var(--color-text-muted, #888)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' },
  balanceValue: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' },
  balanceSub: { fontSize: '0.8rem', color: 'var(--color-text-muted, #666)', lineHeight: 1.4 },
  lastUpdated: { fontSize: '0.8rem', color: 'var(--color-text-muted, #666)', marginBottom: '2rem' },
  section: { marginTop: '2rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' },
  chart: { display: 'flex', gap: '0.5rem', height: '80px', alignItems: 'flex-end', padding: '0.5rem 0' },
  chartBar: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartFill: { width: '100%', background: 'var(--color-copper, #c87533)', borderRadius: '3px 3px 0 0', minHeight: '4px', transition: 'height 0.3s' },
  chartLabel: { fontSize: '0.6rem', color: 'var(--color-text-muted, #666)', marginTop: '4px', textAlign: 'center', whiteSpace: 'nowrap' },
  emptyNotice: {
    padding: '1.25rem', background: 'rgba(200,117,51,0.06)', border: '1px solid rgba(200,117,51,0.15)',
    borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted, #aaa)', lineHeight: 1.6, marginTop: '1.5rem',
  },
  formulaGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' },
  formulaCard: {
    background: 'var(--color-surface, #141418)', border: '1px solid var(--color-border, #2a2a35)',
    borderRadius: '8px', padding: '1rem', textAlign: 'center',
  },
  formulaPct: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-copper, #c87533)', marginBottom: '0.25rem' },
  formulaLabel: { fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' },
  formulaDesc: { fontSize: '0.75rem', color: 'var(--color-text-muted, #888)', lineHeight: 1.4 },
  linksRow: { display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' },
  linkBtn: {
    padding: '0.65rem 1.25rem', background: 'var(--color-copper, #c87533)',
    color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
  },
  linkBtnSecondary: {
    padding: '0.65rem 1.25rem', background: 'none',
    border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem',
  },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#ff6b6b' },
  loadingCard: { padding: '1.5rem', background: 'var(--color-surface, #141418)', borderRadius: '10px', border: '1px solid var(--color-border, #2a2a35)' },
  loadingPulse: { height: '1.5rem', background: 'var(--color-border, #2a2a35)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' },
}
