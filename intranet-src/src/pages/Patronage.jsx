import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

export default function Patronage() {
  const { participant } = useAuth()
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const session = (await supabase.auth.getSession()).data.session
        if (!session) return

        const params = new URLSearchParams({ limit: '50', offset: '0' })
        if (yearFilter) params.set('year', yearFilter)

        const res = await fetch(
          `https://hvbdpgkdcdskhpbdeeim.supabase.co/functions/v1/allocation-history?${params}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        )
        const data = await res.json()
        if (data.ok) {
          setEvents(data.events || [])
          setTotal(data.total || 0)
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [yearFilter])

  function downloadCSV() {
    const headers = ['Quarter', 'Labor', 'Revenue', 'Capital', 'Community', 'Total', 'Book Balance', 'Tax Balance', 'Notes']
    const rows = events.map((e) => [
      e.quarter,
      e.components?.labor ?? 0,
      e.components?.revenue ?? 0,
      e.components?.capital ?? 0,
      e.components?.community ?? 0,
      e.total_allocation,
      e.book_capital_balance,
      e.tax_capital_balance,
      e.notes || '',
    ])
    const csv = [headers, ...rows].map((r) => r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patronage-history-${participant?.name?.toLowerCase().replace(/\s+/g, '-') || 'member'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const years = [...new Set(events.map((e) => e.quarter?.split('-')[0]).filter(Boolean))].sort().reverse()

  return (
    <div style={styles.page}>
      <IntranetHeader />
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <a href="/intranet/account/" style={styles.breadLink}>Account</a>
          <span style={styles.breadSep}>/</span>
          <span>Patronage History</span>
        </nav>

        <div style={styles.titleRow}>
          <h1 style={styles.h1}>Patronage History</h1>
          {events.length > 0 && (
            <button onClick={downloadCSV} style={styles.csvBtn}>
              Export CSV
            </button>
          )}
        </div>

        <div style={styles.formulaBar}>
          Formula: 40% labor · 30% revenue · 20% capital · 10% community
        </div>

        {/* Year filter */}
        {years.length > 1 && (
          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Filter by year:</span>
            <button
              style={{ ...styles.filterBtn, ...(yearFilter === '' ? styles.filterBtnActive : {}) }}
              onClick={() => setYearFilter('')}
            >All</button>
            {years.map((y) => (
              <button
                key={y}
                style={{ ...styles.filterBtn, ...(yearFilter === y ? styles.filterBtnActive : {}) }}
                onClick={() => setYearFilter(y)}
              >{y}</button>
            ))}
          </div>
        )}

        {loading && (
          <div style={styles.loadingBar}>Loading allocation history…</div>
        )}

        {!loading && error && (
          <div style={styles.error}>Error: {error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div style={styles.emptyNotice}>
            No allocation events yet. Quarterly patronage allocations will appear
            here after the steward completes the data backfill.
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Quarter', 'Labor', 'Revenue', 'Capital', 'Community', 'Total Allocation', 'Book Balance', 'Tax Balance'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={e.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.tdQuarter}>{e.quarter}</td>
                    <td style={styles.td}>{fmt(e.components?.labor)}</td>
                    <td style={styles.td}>{fmt(e.components?.revenue)}</td>
                    <td style={styles.td}>{fmt(e.components?.capital)}</td>
                    <td style={styles.td}>{fmt(e.components?.community)}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{fmt(e.total_allocation)}</td>
                    <td style={styles.td}>{fmt(e.book_capital_balance)}</td>
                    <td style={styles.td}>{fmt(e.tax_capital_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.tableFooter}>
              Showing {events.length} of {total} events
              {events.some((e) => e.notes?.includes('proration')) && (
                <span style={styles.prorationNote}> · Proration applied for mid-quarter joins — see notes in CSV export</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function IntranetHeader() {
  const { signOut } = useAuth()
  return (
    <div style={styles.header}>
      <a href="/intranet/" style={styles.wordmark}>Techne</a>
      <nav style={styles.headerNav}>
        <a href="/intranet/account/" style={styles.navLink}>Account</a>
        <a href="/intranet/patronage/" style={styles.navLink}>Patronage</a>
        <a href="/intranet/documents/" style={styles.navLink}>Documents</a>
        <button onClick={signOut} style={styles.signOut}>Sign out</button>
      </nav>
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
  wordmark: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
  headerNav: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { fontSize: '0.875rem', color: 'var(--color-text-muted, #888)', textDecoration: 'none' },
  signOut: {
    background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '6px',
    padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
  },
  main: { maxWidth: '960px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--color-text-muted, #888)', marginBottom: '1rem' },
  breadLink: { color: 'var(--color-copper, #c87533)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 },
  csvBtn: {
    padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-copper, #c87533)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
  },
  formulaBar: {
    fontSize: '0.8rem', color: 'var(--color-text-muted, #888)',
    padding: '0.5rem 0.75rem', background: 'rgba(200,117,51,0.06)',
    border: '1px solid rgba(200,117,51,0.15)', borderRadius: '6px', marginBottom: '1.25rem',
  },
  filterRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' },
  filterLabel: { fontSize: '0.8rem', color: 'var(--color-text-muted, #888)' },
  filterBtn: {
    padding: '0.3rem 0.7rem', background: 'none', border: '1px solid var(--color-border, #2a2a35)',
    color: 'var(--color-text-muted, #888)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
  },
  filterBtnActive: {
    background: 'rgba(200,117,51,0.15)', border: '1px solid rgba(200,117,51,0.4)',
    color: 'var(--color-copper, #c87533)',
  },
  loadingBar: { color: 'var(--color-text-muted, #888)', padding: '2rem 0', textAlign: 'center' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#ff6b6b' },
  emptyNotice: {
    padding: '1.5rem', background: 'rgba(200,117,51,0.06)', border: '1px solid rgba(200,117,51,0.15)',
    borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted, #aaa)', lineHeight: 1.6,
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: {
    padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600,
    color: 'var(--color-text-muted, #888)', fontSize: '0.75rem', textTransform: 'uppercase',
    letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border, #2a2a35)',
    background: 'var(--color-surface, #141418)',
  },
  td: { padding: '0.6rem 0.75rem', textAlign: 'right', borderBottom: '1px solid rgba(42,42,53,0.5)' },
  tdQuarter: {
    padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600,
    borderBottom: '1px solid rgba(42,42,53,0.5)', whiteSpace: 'nowrap',
  },
  trEven: { background: 'transparent' },
  trOdd: { background: 'rgba(255,255,255,0.02)' },
  tableFooter: { fontSize: '0.8rem', color: 'var(--color-text-muted, #666)', padding: '0.75rem 0', textAlign: 'right' },
  prorationNote: { color: 'var(--color-text-muted, #888)' },
}
