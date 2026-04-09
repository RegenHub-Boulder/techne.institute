import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const categoryLabel = {
  income: 'Income',
  expense: 'Expense',
  capital_call: 'Capital Call',
  distribution: 'Distribution',
  transfer: 'Transfer',
  other: 'Other',
}

const categoryColor = {
  income: 'var(--status-ok)',
  expense: 'var(--status-err)',
  capital_call: 'var(--ember, #c4956a)',
  distribution: 'var(--status-info)',
  transfer: 'var(--text-soft)',
  other: 'var(--text-muted)',
}

export default function Treasury() {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [acctRes, txnRes] = await Promise.all([
        supabase
          .from('bank_accounts')
          .select('*')
          .eq('is_active', true)
          .order('account_name'),
        supabase
          .from('transactions')
          .select('*, bank_accounts(account_name)')
          .order('date', { ascending: false })
          .limit(200),
      ])

      if (acctRes.error) {
        setError(acctRes.error.message)
      } else {
        setAccounts(acctRes.data || [])
        setTransactions(txnRes.data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const totalAssets = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0)

  const filtered = transactions.filter(
    (t) => !categoryFilter || t.category === categoryFilter
  )
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Treasury</span>
        </nav>

        <h1 style={styles.h1}>Treasury</h1>

        {loading && <div style={styles.loading}>Loading treasury data…</div>}

        {!loading && error && (
          <div style={styles.error}>
            {error.includes('permission') || error.includes('policy')
              ? 'Treasury access requires steward permissions.'
              : `Error: ${error}`}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Total assets summary */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Assets</div>
              <div style={styles.summaryValue}>{fmt(totalAssets)}</div>
              <div style={styles.summaryMeta}>{accounts.length} active account{accounts.length !== 1 ? 's' : ''}</div>
            </div>

            {/* Account cards */}
            {accounts.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.h2}>Bank Accounts</h2>
                <div style={styles.accountGrid}>
                  {accounts.map((a) => (
                    <div key={a.id} style={styles.accountCard}>
                      <div style={styles.accountName}>{a.account_name}</div>
                      <div style={styles.accountInst}>{a.institution}</div>
                      <div style={styles.accountType}>{a.account_type}</div>
                      <div style={styles.accountBalance}>{fmt(a.balance)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions */}
            <div style={styles.section}>
              <div style={styles.txnHeader}>
                <h2 style={styles.h2}>Transactions</h2>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(0) }}
                  style={styles.select}
                >
                  <option value="">All categories</option>
                  {Object.entries(categoryLabel).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {paginated.length === 0 ? (
                <div style={styles.empty}>No transactions found.</div>
              ) : (
                <div style={styles.txnTable}>
                  <div style={styles.txnHead}>
                    <span>Date</span>
                    <span>Description</span>
                    <span>Category</span>
                    <span style={{ textAlign: 'right' }}>Amount</span>
                  </div>
                  {paginated.map((t) => (
                    <div key={t.id} style={styles.txnRow}>
                      <span style={styles.txnDate}>{fmtDate(t.date)}</span>
                      <span style={styles.txnDesc}>{t.description}</span>
                      <span>
                        <span style={{
                          ...styles.categoryBadge,
                          color: categoryColor[t.category] || 'var(--text-muted)',
                        }}>
                          {categoryLabel[t.category] || t.category}
                        </span>
                      </span>
                      <span style={{
                        ...styles.txnAmount,
                        color: t.amount >= 0 ? 'var(--status-ok)' : 'var(--status-err)',
                      }}>
                        {t.amount >= 0 ? '+' : ''}{fmt(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={styles.pageBtn}
                  >← Prev</button>
                  <span style={styles.pageInfo}>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    style={styles.pageBtn}
                  >Next →</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' },
  breadLink: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 1.5rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, margin: '0' },
  loading: { color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.875rem' },
  error: { padding: '1rem 1.25rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: 'var(--status-err)', fontSize: '0.875rem' },
  summaryCard: {
    background: 'var(--surface)', border: '1px solid #2a2a35',
    borderRadius: '12px', padding: '1.75rem 2rem', marginBottom: '2rem',
  },
  summaryLabel: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' },
  summaryValue: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.25rem' },
  summaryMeta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  section: { marginBottom: '2rem' },
  accountGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' },
  accountCard: {
    background: 'var(--surface)', border: '1px solid #2a2a35',
    borderRadius: '10px', padding: '1.25rem',
  },
  accountName: { fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' },
  accountInst: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' },
  accountType: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subdim)', marginBottom: '0.75rem' },
  accountBalance: { fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' },
  txnHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  select: {
    background: 'var(--surface)', border: '1px solid #2a2a35',
    color: 'var(--text-page)', borderRadius: '6px', padding: '0.4rem 0.75rem',
    fontSize: '0.8rem', cursor: 'pointer',
  },
  txnTable: { background: 'var(--surface)', border: '1px solid #2a2a35', borderRadius: '10px', overflow: 'hidden' },
  txnHead: {
    display: 'grid', gridTemplateColumns: '110px 1fr 120px 110px',
    padding: '0.75rem 1rem', borderBottom: '1px solid #2a2a35',
    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
  },
  txnRow: {
    display: 'grid', gridTemplateColumns: '110px 1fr 120px 110px',
    padding: '0.85rem 1rem', borderBottom: '1px solid #1e1e28',
    fontSize: '0.875rem', alignItems: 'center',
  },
  txnDate: { color: 'var(--text-muted)', fontSize: '0.8rem' },
  txnDesc: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' },
  txnAmount: { textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  categoryBadge: { fontSize: '0.75rem', fontWeight: 500 },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem' },
  pageBtn: {
    background: 'none', border: '1px solid #2a2a35',
    color: 'var(--text-muted)', borderRadius: '6px', padding: '0.35rem 0.75rem',
    cursor: 'pointer', fontSize: '0.8rem',
  },
  pageInfo: { color: 'var(--text-muted)' },
  empty: { padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid #2a2a35' },
}
