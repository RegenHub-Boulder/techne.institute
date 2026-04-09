import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { computeMerkleRoot, computeLeafHash } from '../lib/merkle.js'

const RESOURCE_COLORS = {
  USD:          '#4a5f4a',
  CLOUD:        '#c4956a',
  labor_hours:  '#6b836b',
  voting_power: '#c4956a',
}

const RESOURCE_LABELS = {
  USD:          'USD',
  CLOUD:        'CLOUD Credits',
  labor_hours:  'Labor Hours',
  voting_power: 'Voting Power',
}

function fmtBalance(balance, resourceType) {
  const n = Number(balance || 0)
  if (resourceType === 'USD') {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  }
  if (resourceType === 'CLOUD') {
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' CLOUD'
  }
  if (resourceType === 'labor_hours') {
    return n.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' hrs'
  }
  if (resourceType === 'voting_power') {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' vp'
  }
  return n.toLocaleString() + ' ' + resourceType
}

function truncHash(h) {
  if (!h) return '—'
  return h.slice(0, 10) + '…' + h.slice(-6)
}

export default function Ledger() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [computedRoot, setComputedRoot] = useState(null)
  const [leafHashes, setLeafHashes] = useState({})
  const [verifying, setVerifying] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('rea_ledger')
      .select('*, participants(name, participant_type, membership_class)')
      .order('resource_type')
      .order('account_key')

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setAccounts(data || [])
    setLoading(false)

    // Compute client-side merkle root for verification
    if (data && data.length > 0) {
      computeClientRoot(data)
    }
  }

  async function computeClientRoot(data) {
    setVerifying(true)
    try {
      const root = await computeMerkleRoot(data)
      setComputedRoot(root)

      // Compute individual leaf hashes
      const hashes = {}
      await Promise.all(
        data.map(async (a) => {
          hashes[a.account_key] = await computeLeafHash(a.account_key, a.balance)
        })
      )
      setLeafHashes(hashes)
    } catch (e) {
      console.error('Merkle computation error:', e)
    }
    setVerifying(false)
  }

  // Group accounts by resource_type
  const grouped = {}
  for (const a of accounts) {
    if (filter && a.resource_type !== filter) continue
    if (!grouped[a.resource_type]) grouped[a.resource_type] = []
    grouped[a.resource_type].push(a)
  }

  const storedRoot = accounts[0]?.state_merkle_root
  const rootMatch = computedRoot && storedRoot
    ? computedRoot === storedRoot
    : null

  const resourceTypes = [...new Set(accounts.map((a) => a.resource_type))]

  return (
    <div style={styles.page}>
      <div style={styles.main}>

        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Ledger</span>
        </nav>

        <div style={styles.pageHeader}>
          <div style={styles.pageTag}>REA · Current Account Balances</div>
          <h1 style={styles.pageTitle}>Cooperative Ledger</h1>
          <p style={styles.pageSub}>
            Materialized view of all cooperative accounts — capital, CLOUD credits, labor, voting power.
            Each account balance is a leaf in the merkle state tree.
          </p>
        </div>

        {/* State verification banner */}
        <div style={{
          ...styles.verifyBanner,
          background: rootMatch === true
            ? 'rgba(74,95,74,0.06)'
            : rootMatch === false
            ? 'rgba(255,107,107,0.06)'
            : 'rgba(196,149,106,0.04)',
          borderColor: rootMatch === true
            ? 'rgba(74,95,74,0.25)'
            : rootMatch === false
            ? 'rgba(255,107,107,0.25)'
            : 'rgba(196,149,106,0.15)',
        }}>
          <div style={styles.verifyRow}>
            <span style={styles.verifyLabel}>Stored state root</span>
            <span style={{ ...styles.verifyHash, color: '#888' }}>{truncHash(storedRoot)}</span>
          </div>
          <div style={styles.verifyRow}>
            <span style={styles.verifyLabel}>Client-computed root</span>
            <span style={{ ...styles.verifyHash, color: verifying ? '#555' : '#c4956a' }}>
              {verifying ? 'Computing…' : truncHash(computedRoot)}
            </span>
          </div>
          <div style={styles.verifyRow}>
            <span style={styles.verifyLabel}>State integrity</span>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.78rem',
              color: rootMatch === true ? '#4a5f4a' : rootMatch === false ? '#c46a6a' : '#555',
            }}>
              {rootMatch === true ? '✓ Verified' : rootMatch === false ? '✗ Mismatch' : '—'}
            </span>
          </div>
        </div>

        {/* Resource type filter */}
        <div style={styles.filterBar}>
          <button
            onClick={() => setFilter('')}
            style={{ ...styles.filterBtn, ...(filter === '' ? styles.filterBtnActive : {}) }}
          >
            All
          </button>
          {resourceTypes.map((rt) => (
            <button
              key={rt}
              onClick={() => setFilter(rt)}
              style={{
                ...styles.filterBtn,
                ...(filter === rt ? styles.filterBtnActive : {}),
                borderColor: filter === rt ? RESOURCE_COLORS[rt] : undefined,
              }}
            >
              {RESOURCE_LABELS[rt] || rt}
            </button>
          ))}
        </div>

        {loading && <div style={styles.loading}>Loading…</div>}
        {error && <div style={styles.error}>{error}</div>}

        {Object.entries(grouped).map(([resourceType, accts]) => {
          const color = RESOURCE_COLORS[resourceType] || '#888'
          const total = accts.reduce((s, a) => s + Number(a.balance || 0), 0)

          return (
            <div key={resourceType} style={styles.group}>
              <div style={styles.groupHeader}>
                <span style={{ ...styles.groupDot, background: color }} />
                <span style={styles.groupTitle}>{RESOURCE_LABELS[resourceType] || resourceType}</span>
                <span style={{ ...styles.groupTotal, color }}>
                  {fmtBalance(total, resourceType)} total
                </span>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={th}>Account</th>
                    <th style={th}>Type</th>
                    <th style={{ ...th, textAlign: 'right' }}>Balance</th>
                    <th style={{ ...th, textAlign: 'right' }}>Leaf Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {accts.map((a) => (
                    <tr key={a.id}>
                      <td style={td}>
                        <div style={{ fontSize: '0.88rem', color: '#c8c2ba' }}>
                          {a.participants?.name || a.account_name}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#555', marginTop: '0.15rem' }}>
                          {a.account_key}
                        </div>
                      </td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.75rem', color: '#666' }}>
                        {a.account_type}
                      </td>
                      <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace', fontSize: '0.88rem', color }}>
                        {fmtBalance(a.balance, resourceType)}
                      </td>
                      <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace', fontSize: '0.68rem', color: '#444' }}>
                        {leafHashes[a.account_key]
                          ? truncHash(leafHashes[a.account_key])
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        <div style={styles.footerNav}>
          <a href="/intranet/journal/" style={styles.footerLink}>← Journal</a>
          <a href="/intranet/governance/" style={styles.footerLink}>Governance →</a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#141418', minHeight: '100vh', color: '#c8c2ba' },
  main: { maxWidth: 1000, margin: '0 auto', padding: '2rem 2rem 4rem' },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.78rem' },
  breadLink: { color: '#888', textDecoration: 'none' },
  breadSep: { color: '#3a3a42' },

  pageHeader: { marginBottom: '1.5rem' },
  pageTag: { fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c4956a', marginBottom: '0.5rem' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#ece6de', letterSpacing: '-0.02em', margin: '0 0 0.5rem' },
  pageSub: { fontSize: '0.9rem', color: '#888', lineHeight: 1.65, maxWidth: 600, margin: 0 },

  verifyBanner: { border: '1px solid', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  verifyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  verifyLabel: { fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' },
  verifyHash: { fontFamily: 'monospace', fontSize: '0.78rem' },

  filterBar: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filterBtn: { background: '#1e1e24', border: '1px solid #2a2a35', color: '#888', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(196,149,106,0.08)', color: '#e8e8e0', borderColor: '#c4956a' },

  loading: { color: '#555', fontFamily: 'monospace', fontSize: '0.85rem', padding: '2rem 0' },
  error: { color: '#c46a6a', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', background: 'rgba(255,107,107,0.06)', borderRadius: 6 },

  group: { marginBottom: '2rem' },
  groupHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  groupDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  groupTitle: { fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' },
  groupTotal: { fontFamily: 'monospace', fontSize: '0.82rem', marginLeft: 'auto' },

  table: { width: '100%', borderCollapse: 'collapse', background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, overflow: 'hidden' },

  footerNav: { display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #2a2a35', marginTop: '2rem' },
  footerLink: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#888', textDecoration: 'none' },
}

const th = {
  fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#555', textAlign: 'left',
  padding: '0.6rem 1rem', borderBottom: '1px solid #2a2a35', whiteSpace: 'nowrap',
}

const td = {
  padding: '0.65rem 1rem', borderBottom: '1px solid #1e1e24',
  verticalAlign: 'middle', color: '#888',
}
