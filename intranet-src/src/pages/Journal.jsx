import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { IntranetHeader } from '../components/IntranetHeader.jsx'

const EVENT_TYPES = ['', 'transfer', 'contribution', 'expense', 'vote', 'delegation', 'allocation', 'proposal']

const EVENT_COLORS = {
  transfer:     '#7eb8e8',
  contribution: '#4caf82',
  expense:      '#ff6b6b',
  vote:         '#c4956a',
  delegation:   '#a78bfa',
  allocation:   '#4caf82',
  proposal:     '#60a5fa',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtAmount(amount, resource_type) {
  const n = Number(amount || 0)
  if (resource_type === 'USD') {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  }
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${resource_type || ''}`
}

function truncHash(h) {
  if (!h) return '—'
  return h.slice(0, 8) + '…' + h.slice(-4)
}

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  useEffect(() => {
    load()
  }, [filter, page])

  async function load() {
    setLoading(true)
    let q = supabase
      .from('rea_journal')
      .select('*, participants!rea_journal_agent_id_fkey(name, participant_type)')
      .order('seq', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filter) q = q.eq('event_type', filter)

    const { data, error: err } = await q
    if (err) {
      setError(err.message)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  const currentRoot = entries[0]?.new_merkle_root

  return (
    <div style={styles.page}>
      <IntranetHeader />
      <div style={styles.main}>

        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Journal</span>
        </nav>

        <div style={styles.pageHeader}>
          <div style={styles.pageTag}>REA · Append-Only Event Log</div>
          <h1 style={styles.pageTitle}>Cooperative Journal</h1>
          <p style={styles.pageSub}>
            Every economic and governance event recorded with Resource · Event · Agent semantics.
            Each entry advances the merkle state machine.
          </p>
          {currentRoot && (
            <div style={styles.rootBadge}>
              <span style={styles.rootLabel}>Current State Root</span>
              <span style={styles.rootHash}>{truncHash(currentRoot)}</span>
              <a href="/intranet/verify/" style={styles.rootVerify}>Verify →</a>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setFilter(t); setPage(0) }}
              style={{
                ...styles.filterBtn,
                ...(filter === t ? styles.filterBtnActive : {}),
                ...(t && { borderColor: filter === t ? EVENT_COLORS[t] : undefined }),
              }}
            >
              {t || 'All'}
            </button>
          ))}
        </div>

        {loading && <div style={styles.loading}>Loading…</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && entries.length === 0 && (
          <div style={styles.empty}>
            <p style={{ marginBottom: '0.5rem' }}>No journal entries yet.</p>
            <p style={{ fontSize: '0.85rem', color: '#555' }}>
              Entries are created when capital transactions, votes, or labor contributions are recorded
              through the cooperative ledger system.
            </p>
          </div>
        )}

        {!loading && entries.map((e) => (
          <div
            key={e.id}
            style={styles.entry}
            onClick={() => setExpanded(expanded === e.id ? null : e.id)}
          >
            <div style={styles.entryRow}>
              <span
                style={{
                  ...styles.eventTag,
                  background: `${EVENT_COLORS[e.event_type] || '#888'}20`,
                  color: EVENT_COLORS[e.event_type] || '#888',
                  borderColor: `${EVENT_COLORS[e.event_type] || '#888'}40`,
                }}
              >
                {e.event_type}
              </span>
              <span style={styles.entrySeq}>#{e.seq}</span>
              <span style={styles.entryDesc}>{e.description || '—'}</span>
              <span style={styles.entryAmount}>
                {fmtAmount(e.amount, e.resource_type)}
              </span>
              <span style={styles.entryDate}>{fmtDate(e.recorded_at)}</span>
            </div>

            {expanded === e.id && (
              <div style={styles.entryDetail}>
                <div style={styles.detailGrid}>
                  <DetailRow label="Agent" value={e.participants?.name || e.agent_id || '—'} />
                  <DetailRow label="Resource" value={e.resource_type} />
                  <DetailRow label="Amount" value={fmtAmount(e.amount, e.resource_type)} />
                  <DetailRow label="From account" value={e.from_account_key || '—'} mono />
                  <DetailRow label="To account" value={e.to_account_key || '—'} mono />
                  <DetailRow label="Prev root" value={truncHash(e.prev_merkle_root)} mono />
                  <DetailRow label="New root" value={truncHash(e.new_merkle_root)} mono highlight />
                  {e.source_table && (
                    <DetailRow label="Source" value={`${e.source_table} / ${e.source_id?.slice(0, 8)}`} mono />
                  )}
                </div>
                {e.metadata && Object.keys(e.metadata).length > 0 && (
                  <div style={styles.metadataBox}>
                    <span style={styles.metaLabel}>Metadata</span>
                    <pre style={styles.metaPre}>{JSON.stringify(e.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span style={styles.pageNum}>Page {page + 1}</span>
          <button
            style={styles.pageBtn}
            onClick={() => setPage(page + 1)}
            disabled={entries.length < PAGE_SIZE}
          >
            Next →
          </button>
        </div>

        <div style={styles.footerNav}>
          <a href="/intranet/" style={styles.footerLink}>← Home</a>
          <a href="/intranet/ledger/" style={styles.footerLink}>Ledger →</a>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono, highlight }) {
  return (
    <div style={detailRowStyle}>
      <span style={{ color: '#666', fontSize: '0.82rem' }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono, monospace)' : undefined,
        fontSize: mono ? '0.78rem' : '0.85rem',
        color: highlight ? '#c4956a' : '#aaa',
        textAlign: 'right',
        maxWidth: '60%',
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}

const detailRowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  padding: '0.35rem 0', borderBottom: '1px solid #1e1e24',
}

const styles = {
  page: { background: '#141418', minHeight: '100vh', color: '#c8c2ba' },
  main: { maxWidth: 1000, margin: '0 auto', padding: '2rem 2rem 4rem' },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.78rem' },
  breadLink: { color: '#888', textDecoration: 'none' },
  breadSep: { color: '#3a3a42' },

  pageHeader: { marginBottom: '2rem' },
  pageTag: { fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c4956a', marginBottom: '0.5rem' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#ece6de', letterSpacing: '-0.02em', margin: '0 0 0.5rem' },
  pageSub: { fontSize: '0.9rem', color: '#888', lineHeight: 1.65, maxWidth: 600, margin: 0 },

  rootBadge: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(196,149,106,0.05)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: 6, fontFamily: 'monospace', fontSize: '0.78rem' },
  rootLabel: { color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' },
  rootHash: { color: '#c4956a', flex: 1 },
  rootVerify: { color: '#888', textDecoration: 'none', fontSize: '0.72rem' },

  filterBar: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filterBtn: { background: '#1e1e24', border: '1px solid #2a2a35', color: '#888', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.05em' },
  filterBtnActive: { background: 'rgba(196,149,106,0.08)', color: '#e8e8e0', borderColor: '#c4956a' },

  loading: { color: '#555', fontFamily: 'monospace', fontSize: '0.85rem', padding: '2rem 0' },
  error: { color: '#ff6b6b', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', background: 'rgba(255,107,107,0.06)', borderRadius: 6 },
  empty: { padding: '3rem 0', color: '#666', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' },

  entry: { background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '0.9rem 1.1rem', marginBottom: '0.5rem', cursor: 'pointer', transition: 'border-color 0.15s' },
  entryRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  eventTag: { fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.08em', padding: '0.2em 0.55em', borderRadius: 4, border: '1px solid', flexShrink: 0 },
  entrySeq: { fontFamily: 'monospace', fontSize: '0.72rem', color: '#444', flexShrink: 0 },
  entryDesc: { fontSize: '0.88rem', color: '#aaa', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  entryAmount: { fontFamily: 'monospace', fontSize: '0.82rem', color: '#e8e8e0', flexShrink: 0 },
  entryDate: { fontFamily: 'monospace', fontSize: '0.72rem', color: '#555', flexShrink: 0 },

  entryDetail: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #2a2a35' },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: 0 },

  metadataBox: { marginTop: '0.75rem', padding: '0.75rem', background: '#141418', borderRadius: 5 },
  metaLabel: { fontFamily: 'monospace', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '0.5rem' },
  metaPre: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#666', margin: 0, overflow: 'auto' },

  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '2rem 0', fontFamily: 'monospace', fontSize: '0.82rem' },
  pageBtn: { background: '#1e1e24', border: '1px solid #2a2a35', color: '#888', borderRadius: 5, padding: '0.4rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem' },
  pageNum: { color: '#555' },

  footerNav: { display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #2a2a35', marginTop: '2rem' },
  footerLink: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#888', textDecoration: 'none' },
}
