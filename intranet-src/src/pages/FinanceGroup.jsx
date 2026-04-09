// FinanceGroup.jsx
// Tabs: Overview | Ledger | Journal | Verify | Treasury (steward)

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { computeMerkleRoot, computeLeafHash, generateMerkleProof, verifyMerkleProof } from '../lib/merkle.js'
import { TabShell } from '../components/TabShell.jsx'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RESOURCE_COLORS = {
  USD: 'var(--status-ok)', CLOUD: 'var(--gold)', labor_hours: 'var(--status-info)', voting_power: 'var(--gold)',
}
const RESOURCE_LABELS = {
  USD: 'USD', CLOUD: 'CLOUD Credits', labor_hours: 'Labor Hours', voting_power: 'Voting Power',
}
const EVENT_COLORS = {
  transfer: 'var(--status-info)', contribution: 'var(--status-ok)', expense: 'var(--status-err)',
  vote: 'var(--gold)', delegation: 'var(--gold)', allocation: 'var(--status-ok)', proposal: '#60a5fa',
}
const EVENT_TYPES = ['', 'transfer', 'contribution', 'expense', 'vote', 'delegation', 'allocation', 'proposal']

function fmtBalance(balance, rt) {
  const n = Number(balance || 0)
  if (rt === 'USD') return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  if (rt === 'CLOUD') return n.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' CLOUD'
  if (rt === 'labor_hours') return n.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' hrs'
  if (rt === 'voting_power') return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' vp'
  return n.toLocaleString() + ' ' + rt
}

function truncHash(h) {
  if (!h) return '—'
  return h.slice(0, 10) + '…' + h.slice(-6)
}

// ─── Shared ledger data (fetched once, used in Overview + Ledger) ─────────────

function useLedgerData() {
  const [accounts, setAccounts] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [computedRoot, setComputedRoot] = useState(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [ledgerRes, journalRes] = await Promise.all([
        supabase
          .from('rea_ledger')
          .select('*, participants(name, participant_type, membership_class)')
          .order('resource_type')
          .order('account_key'),
        supabase
          .from('rea_journal')
          .select('*, participants!rea_journal_agent_id_fkey(name)')
          .order('seq', { ascending: false })
          .limit(5),
      ])
      if (ledgerRes.error) { setError(ledgerRes.error.message); setLoading(false); return }
      setAccounts(ledgerRes.data || [])
      setRecentEvents(journalRes.data || [])
      setLoading(false)
      if (ledgerRes.data?.length > 0) {
        setVerifying(true)
        computeMerkleRoot(ledgerRes.data)
          .then(root => { setComputedRoot(root); setVerifying(false) })
          .catch(() => setVerifying(false))
      }
    }
    load()
  }, [])

  return { accounts, recentEvents, loading, error, computedRoot, verifying }
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function FinanceGroup({ initialTab = 'overview' }) {
  const { isSteward } = useAuth()
  const [tab, setTab] = useState(initialTab)
  const ledgerData = useLedgerData()

  const openTab = (key) => {
    setTab(key)
    const paths = {
      overview: '/intranet/journal/',
      ledger:   '/intranet/ledger/',
      journal:  '/intranet/journal/',
      verify:   '/intranet/verify/',
      treasury: '/intranet/treasury/',
    }
    window.history.pushState(null, '', paths[key] || '/intranet/journal/')
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'ledger',   label: 'Ledger' },
    { key: 'journal',  label: 'Journal' },
    { key: 'verify',   label: 'Verify' },
    ...(isSteward ? [{ key: 'treasury', label: 'Treasury', badge: 'S', badgeColor: 'var(--gold)' }] : []),
  ]

  return (
    <TabShell
      title="Finance"
      subtitle="REA state machine · cooperative accounts · cryptographic verification"
      tabs={tabs}
      active={tab}
      onTab={openTab}
    >
      {tab === 'overview' && <OverviewTab data={ledgerData} />}
      {tab === 'ledger'   && <LedgerTab data={ledgerData} />}
      {tab === 'journal'  && <JournalTab />}
      {tab === 'verify'   && <VerifyTab />}
      {tab === 'treasury' && isSteward && <TreasuryTab />}
    </TabShell>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ data }) {
  const { accounts, recentEvents, loading, error, computedRoot, verifying } = data

  if (loading) return <div style={s.loading}>Loading financial state…</div>
  if (error)   return <div style={s.error}>{error}</div>

  const storedRoot = accounts[0]?.state_merkle_root
  const rootMatch = computedRoot && storedRoot ? computedRoot === storedRoot : null

  // Resource totals
  const totals = {}
  for (const a of accounts) {
    if (!totals[a.resource_type]) totals[a.resource_type] = 0
    totals[a.resource_type] += Number(a.balance || 0)
  }

  return (
    <div>
      {/* State integrity banner */}
      <div style={{
        ...s.integrityBadge,
        borderColor: rootMatch === true
          ? 'rgba(74,95,74,0.25)'
          : rootMatch === false
          ? 'rgba(255,107,107,0.25)'
          : 'var(--gold-15)',
        background: rootMatch === true
          ? 'rgba(74,95,74,0.04)'
          : rootMatch === false
          ? 'rgba(255,107,107,0.04)'
          : 'rgba(196,149,106,0.02)',
      }}>
        <div style={s.integrityRow}>
          <span style={s.integrityLabel}>State root</span>
          <span style={s.integrityHash}>{truncHash(storedRoot)}</span>
          <span style={{
            ...s.integrityStatus,
            color: rootMatch === true ? 'var(--status-ok)' : rootMatch === false ? 'var(--status-err)' : 'var(--text-dim)',
          }}>
            {verifying ? 'verifying…' : rootMatch === true ? '✓ verified' : rootMatch === false ? '✗ mismatch' : '—'}
          </span>
        </div>
      </div>

      {/* Resource totals */}
      {Object.keys(totals).length > 0 && (
        <div style={s.resourceGrid}>
          {Object.entries(totals).map(([rt, total]) => (
            <div key={rt} style={s.resourceCard}>
              <div style={{ ...s.resourceDot, background: RESOURCE_COLORS[rt] || 'var(--text-muted)' }} />
              <div style={s.resourceLabel}>{RESOURCE_LABELS[rt] || rt}</div>
              <div style={{ ...s.resourceValue, color: RESOURCE_COLORS[rt] || 'var(--text-primary)' }}>
                {fmtBalance(total, rt)}
              </div>
              <div style={s.resourceCount}>
                {accounts.filter(a => a.resource_type === rt).length} accounts
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(totals).length === 0 && (
        <div style={s.emptyNotice}>
          No ledger accounts yet. Cooperative accounts will appear here once the steward
          initializes the REA state machine.
        </div>
      )}

      {/* Recent journal events */}
      {recentEvents.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Recent Journal Events</div>
          <div style={s.eventList}>
            {recentEvents.map(e => (
              <div key={e.id} style={s.eventRow}>
                <span style={{
                  ...s.eventTag,
                  background: `${EVENT_COLORS[e.event_type] || 'var(--text-muted)'}18`,
                  color: EVENT_COLORS[e.event_type] || 'var(--text-muted)',
                }}>
                  {e.event_type}
                </span>
                <span style={s.eventDesc}>{e.description || '—'}</span>
                <span style={s.eventAmt}>
                  {e.amount
                    ? `${Number(e.amount).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${e.resource_type || ''}`
                    : '—'}
                </span>
                <span style={s.eventDate}>
                  {new Date(e.recorded_at || e.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ledger Tab ───────────────────────────────────────────────────────────────

function LedgerTab({ data }) {
  const { accounts, loading, error } = data
  const [filter, setFilter] = useState('')

  if (loading) return <div style={s.loading}>Loading ledger…</div>
  if (error)   return <div style={s.error}>{error}</div>
  if (accounts.length === 0) return <div style={s.emptyNotice}>No ledger accounts yet.</div>

  const resourceTypes = [...new Set(accounts.map(a => a.resource_type))]
  const grouped = {}
  for (const a of accounts) {
    if (filter && a.resource_type !== filter) continue
    if (!grouped[a.resource_type]) grouped[a.resource_type] = []
    grouped[a.resource_type].push(a)
  }

  return (
    <div>
      <div style={s.filterBar}>
        <button
          onClick={() => setFilter('')}
          style={{ ...s.filterBtn, ...(filter === '' ? s.filterBtnActive : {}) }}
        >
          All
        </button>
        {resourceTypes.map(rt => (
          <button
            key={rt}
            onClick={() => setFilter(rt)}
            style={{ ...s.filterBtn, ...(filter === rt ? s.filterBtnActive : {}) }}
          >
            {RESOURCE_LABELS[rt] || rt}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([rt, accts]) => {
        const color = RESOURCE_COLORS[rt] || 'var(--text-muted)'
        const total = accts.reduce((sum, a) => sum + Number(a.balance || 0), 0)
        return (
          <div key={rt} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {RESOURCE_LABELS[rt] || rt}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color, marginLeft: 'auto' }}>
                {fmtBalance(total, rt)} total
              </span>
            </div>
            <table style={{ ...s.table, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={s.th}>Account</th>
                  <th style={s.th}>Type</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {accts.map(a => (
                  <tr key={a.id}>
                    <td style={s.td}>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-warm)' }}>
                        {a.participants?.name || a.account_name}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-ghost)', marginTop: '0.1rem' }}>
                        {a.account_key}
                      </div>
                    </td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-subdim)' }}>
                      {a.account_type}
                    </td>
                    <td style={{ ...s.td, textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem', color }}>
                      {fmtBalance(a.balance, rt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

// ─── Journal Tab ──────────────────────────────────────────────────────────────

const JOURNAL_PAGE_SIZE = 25

function JournalTab() {
  const [entries, setEntries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [filter, setFilter]     = useState('')
  const [page, setPage]         = useState(0)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase
        .from('rea_journal')
        .select('*, participants!rea_journal_agent_id_fkey(name)')
        .order('seq', { ascending: false })
        .range(page * JOURNAL_PAGE_SIZE, (page + 1) * JOURNAL_PAGE_SIZE - 1)
      if (filter) q = q.eq('event_type', filter)
      const { data, error: err } = await q
      if (err) setError(err.message)
      else setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [filter, page])

  function fmtAmt(amount, rt) {
    const n = Number(amount || 0)
    if (rt === 'USD') return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${rt || ''}`
  }

  if (loading && entries.length === 0) return <div style={s.loading}>Loading journal…</div>
  if (error) return <div style={s.error}>{error}</div>

  const currentRoot = entries[0]?.new_merkle_root

  return (
    <div>
      {currentRoot && (
        <div style={{
          fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-subdim)',
          marginBottom: '1rem', padding: '0.5rem 0.75rem',
          background: 'rgba(196,149,106,0.04)',
          border: '1px solid rgba(196,149,106,0.1)',
          borderRadius: 5,
        }}>
          Current root: <span style={{ color: 'var(--gold)' }}>{truncHash(currentRoot)}</span>
        </div>
      )}

      <div style={s.filterBar}>
        {EVENT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => { setFilter(t); setPage(0) }}
            style={{ ...s.filterBtn, ...(filter === t ? s.filterBtnActive : {}) }}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {entries.length === 0 && (
        <div style={s.empty}>No journal entries yet.</div>
      )}

      {entries.map(e => (
        <div
          key={e.id}
          style={s.journalEntry}
          onClick={() => setExpanded(expanded === e.id ? null : e.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{
              ...s.eventTag,
              background: `${EVENT_COLORS[e.event_type] || 'var(--text-muted)'}20`,
              color: EVENT_COLORS[e.event_type] || 'var(--text-muted)',
              border: `1px solid ${EVENT_COLORS[e.event_type] || 'var(--text-muted)'}40`,
            }}>
              {e.event_type}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-ghost)' }}>#{e.seq}</span>
            <span style={{
              flex: 1, fontSize: '0.875rem', color: 'var(--text-soft)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {e.description || '—'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-warm)', flexShrink: 0 }}>
              {fmtAmt(e.amount, e.resource_type)}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>
              {new Date(e.recorded_at || e.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })}
            </span>
          </div>

          {expanded === e.id && (
            <div style={{
              marginTop: '0.75rem', paddingTop: '0.75rem',
              borderTop: '1px solid #1a1a2e',
              display: 'flex', flexDirection: 'column', gap: '0.3rem',
            }}>
              {[
                ['Agent',    e.participants?.name || e.agent_id || '—', false],
                ['From',     e.from_account_key || '—',                 true],
                ['To',       e.to_account_key   || '—',                 true],
                ['New root', truncHash(e.new_merkle_root),               true],
              ].map(([label, val, mono]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                  <span style={{
                    fontFamily: mono ? 'monospace' : undefined,
                    color: 'var(--text-muted)',
                    fontSize: mono ? '0.75rem' : undefined,
                  }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '1rem', marginTop: '1.5rem',
        fontFamily: 'monospace', fontSize: '0.8rem',
      }}>
        <button
          style={s.pageBtn}
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          ← Prev
        </button>
        <span style={{ color: 'var(--text-dim)' }}>Page {page + 1}</span>
        <button
          style={s.pageBtn}
          onClick={() => setPage(page + 1)}
          disabled={entries.length < JOURNAL_PAGE_SIZE}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Verify Tab ───────────────────────────────────────────────────────────────

function VerifyTab() {
  const [mode, setMode] = useState('live')

  // Live state
  const [liveResult, setLiveResult]   = useState(null)
  const [liveLoading, setLiveLoading] = useState(false)

  // Manual proof
  const [accountKey, setAccountKey]     = useState('')
  const [inputRoot, setInputRoot]       = useState('')
  const [proofResult, setProofResult]   = useState(null)
  const [proofLoading, setProofLoading] = useState(false)
  const [proofPath, setProofPath]       = useState([])

  async function verifyLive() {
    setLiveLoading(true)
    setLiveResult(null)
    const { data } = await supabase
      .from('rea_ledger')
      .select('account_key, balance, state_merkle_root')
      .order('account_key')
    if (!data) { setLiveLoading(false); return }
    const stored   = data[0]?.state_merkle_root
    const computed = await computeMerkleRoot(data)
    setLiveResult({ match: computed === stored, stored, computed, count: data.length })
    setLiveLoading(false)
  }

  async function verifyProof() {
    if (!accountKey.trim() || !inputRoot.trim()) return
    setProofLoading(true)
    setProofResult(null)
    setProofPath([])

    const { data: stateData } = await supabase
      .from('merkle_states')
      .select('*')
      .eq('state_root', inputRoot.trim())
      .limit(1)
      .single()

    if (!stateData) {
      setProofResult({ error: 'State root not found' })
      setProofLoading(false)
      return
    }

    const accts = stateData.accounts_snapshot || []
    const acct  = accts.find(a => a.account_key === accountKey.trim())
    if (!acct) {
      setProofResult({ error: 'Account not found in snapshot' })
      setProofLoading(false)
      return
    }

    const generated = await generateMerkleProof(
      accts.map(a => ({ account_key: a.account_key, balance: a.balance })),
      accountKey.trim()
    )
    if (!generated) {
      setProofResult({ error: 'Failed to generate proof' })
      setProofLoading(false)
      return
    }

    const valid        = await verifyMerkleProof(generated.leafHash, generated.proofPath, generated.root)
    const expectedLeaf = await computeLeafHash(accountKey.trim(), acct.balance)

    setProofPath(generated.proofPath)
    setProofResult({
      valid:   valid && expectedLeaf === generated.leafHash,
      balance: acct.balance,
      leafHash: generated.leafHash,
      steps:   generated.proofPath.length,
    })
    setProofLoading(false)
  }

  return (
    <div>
      <div style={s.filterBar}>
        {[['live', 'Live State'], ['proof', 'Account Proof']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            style={{ ...s.filterBtn, ...(mode === key ? s.filterBtnActive : {}) }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'live' && (
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6, maxWidth: 560 }}>
            Fetch the current ledger and recompute the merkle root client-side (Web Crypto API)
            to verify no unauthorized state changes have occurred.
          </p>
          <button onClick={verifyLive} disabled={liveLoading} style={s.actionBtn}>
            {liveLoading ? 'Computing…' : 'Verify Current State'}
          </button>
          {liveResult && (
            <div style={{
              ...s.resultBox,
              borderColor: liveResult.match ? 'rgba(74,95,74,0.3)' : 'rgba(255,107,107,0.3)',
              background:  liveResult.match ? 'rgba(74,95,74,0.04)' : 'rgba(255,107,107,0.04)',
              marginTop: '1.25rem',
            }}>
              <div style={{
                color: liveResult.match ? 'var(--status-ok)' : 'var(--status-err)',
                fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'monospace',
              }}>
                {liveResult.match ? '✓ State Verified' : '✗ State Mismatch — possible tampering'}
              </div>
              {[
                ['Accounts checked', liveResult.count,               false],
                ['Stored root',      truncHash(liveResult.stored),   true],
                ['Computed root',    truncHash(liveResult.computed),  true],
              ].map(([l, v, mono]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-subdim)' }}>{l}</span>
                  <span style={{ fontFamily: mono ? 'monospace' : undefined, color: 'var(--text-soft)', fontSize: mono ? '0.75rem' : undefined }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.6, marginTop: '0.75rem' }}>
                Each balance is hashed as{' '}
                <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.1em 0.35em', borderRadius: 3, color: 'var(--gold)' }}>
                  sha256(account_key + ':' + balance)
                </code>
                . Leaf hashes are concatenated alphabetically and re-hashed to produce the root.
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'proof' && (
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6, maxWidth: 560 }}>
            Verify that a specific account held a balance at a historical state root.
            An external auditor can confirm any balance without access to the full ledger.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={s.inputLabel}>Account Key</label>
            <input
              style={s.input}
              placeholder="e.g. USD:capital:a4a0a0ab-…"
              value={accountKey}
              onChange={e => setAccountKey(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={s.inputLabel}>State Root (hex)</label>
            <input
              style={s.input}
              placeholder="64-character hex string"
              value={inputRoot}
              onChange={e => setInputRoot(e.target.value)}
            />
          </div>
          <button
            onClick={verifyProof}
            disabled={proofLoading || !accountKey.trim() || !inputRoot.trim()}
            style={s.actionBtn}
          >
            {proofLoading ? 'Verifying…' : 'Generate & Verify Proof'}
          </button>

          {proofResult && (
            <div style={{
              ...s.resultBox,
              borderColor: proofResult.error ? 'rgba(255,107,107,0.3)' : proofResult.valid ? 'rgba(74,95,74,0.3)' : 'rgba(255,107,107,0.3)',
              background:  proofResult.error ? 'rgba(255,107,107,0.04)' : proofResult.valid ? 'rgba(74,95,74,0.04)' : 'rgba(255,107,107,0.04)',
              marginTop: '1.25rem',
            }}>
              {proofResult.error ? (
                <div style={{ color: 'var(--status-err)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {proofResult.error}
                </div>
              ) : (
                <>
                  <div style={{
                    color: proofResult.valid ? 'var(--status-ok)' : 'var(--status-err)',
                    fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'monospace',
                  }}>
                    {proofResult.valid ? '✓ Proof Valid' : '✗ Proof Invalid'}
                  </div>
                  {[
                    ['Balance',     proofResult.balance,              false],
                    ['Leaf hash',   truncHash(proofResult.leafHash),  true],
                    ['Proof depth', `${proofResult.steps} steps`,     false],
                  ].map(([l, v, mono]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: 'var(--text-subdim)' }}>{l}</span>
                      <span style={{ fontFamily: mono ? 'monospace' : undefined, color: 'var(--text-soft)' }}>{v}</span>
                    </div>
                  ))}
                  {proofPath.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-ghost)', marginBottom: '0.4rem' }}>
                        Proof path
                      </div>
                      {proofPath.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.2rem 0' }}>
                          <span style={{ color: 'var(--text-dim)', width: '3rem' }}>{step.position}</span>
                          <span style={{ color: 'var(--text-ghost)' }}>{truncHash(step.hash)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Treasury Tab (steward only) ──────────────────────────────────────────────

const CATEGORY_LABEL = {
  income: 'Income', expense: 'Expense', capital_call: 'Capital Call',
  distribution: 'Distribution', transfer: 'Transfer', other: 'Other',
}
const CATEGORY_COLOR = {
  income: 'var(--status-ok)', expense: 'var(--status-err)', capital_call: 'var(--gold)',
  distribution: 'var(--status-info)', transfer: 'var(--text-soft)', other: 'var(--text-muted)',
}
const TREASURY_PAGE_SIZE = 20

function TreasuryTab() {
  const [accounts, setAccounts]       = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [catFilter, setCatFilter]     = useState('')
  const [page, setPage]               = useState(0)

  const fmt     = n => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [ar, tr] = await Promise.all([
        supabase.from('bank_accounts').select('*').eq('is_active', true).order('account_name'),
        supabase.from('transactions').select('*, bank_accounts(account_name)').order('date', { ascending: false }).limit(200),
      ])
      if (ar.error) {
        setError(ar.error.message?.includes('permission') || ar.error.message?.includes('policy')
          ? 'Treasury access requires steward permissions.'
          : ar.error.message)
      } else {
        setAccounts(ar.data || [])
        setTransactions(tr.data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={s.loading}>Loading treasury…</div>
  if (error)   return <div style={s.error}>{error}</div>

  const totalAssets = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)
  const filtered    = transactions.filter(t => !catFilter || t.category === catFilter)
  const paginated   = filtered.slice(page * TREASURY_PAGE_SIZE, (page + 1) * TREASURY_PAGE_SIZE)
  const totalPages  = Math.ceil(filtered.length / TREASURY_PAGE_SIZE)

  return (
    <div>
      {/* Summary */}
      <div style={{ background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Total Assets
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
          {fmt(totalAssets)}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {accounts.length} active account{accounts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Bank account cards */}
      {accounts.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.6rem', marginBottom: '1.75rem',
        }}>
          {accounts.map(a => (
            <div key={a.id} style={{ background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 8, padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.15rem' }}>{a.account_name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subdim)', marginBottom: '0.75rem' }}>
                {a.institution} · {a.account_type}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                {fmt(a.balance)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Transactions</div>
        <select
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setPage(0) }}
          style={{
            background: 'var(--ink)', border: '1px solid #1a1a2e',
            color: 'var(--text-warm)', borderRadius: 6, padding: '0.35rem 0.6rem',
            fontSize: '0.78rem', cursor: 'pointer',
          }}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div style={{ background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 8, overflow: 'hidden' }}>
        {paginated.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            No transactions.
          </div>
        ) : (
          paginated.map(t => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 110px 100px',
                padding: '0.8rem 1rem',
                borderBottom: '1px solid #1a1a28',
                fontSize: '0.875rem',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--text-subdim)', fontSize: '0.78rem' }}>{fmtDate(t.date)}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem', color: 'var(--text-warm)' }}>
                {t.description}
              </span>
              <span style={{ color: CATEGORY_COLOR[t.category] || 'var(--text-muted)', fontSize: '0.78rem' }}>
                {CATEGORY_LABEL[t.category] || t.category}
              </span>
              <span style={{
                textAlign: 'right', fontWeight: 600,
                color: t.amount >= 0 ? 'var(--status-ok)' : 'var(--status-err)',
                fontFamily: 'monospace', fontSize: '0.82rem',
              }}>
                {t.amount >= 0 ? '+' : ''}{fmt(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem' }}>
          <button style={s.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            ← Prev
          </button>
          <span style={{ color: 'var(--text-subdim)' }}>{page + 1} / {totalPages}</span>
          <button style={s.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const s = {
  loading: {
    color: 'var(--text-dim)', padding: '3rem 0', textAlign: 'center', fontSize: '0.875rem',
  },
  error: {
    padding: '1rem', background: 'rgba(220,60,60,0.1)',
    border: '1px solid rgba(220,60,60,0.3)', borderRadius: 8, color: 'var(--status-err)', fontSize: '0.875rem',
  },
  emptyNotice: {
    padding: '1.5rem', background: 'rgba(196,149,106,0.05)',
    border: '1px solid rgba(196,149,106,0.12)', borderRadius: 8,
    fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6,
  },
  integrityBadge: {
    border: '1px solid', borderRadius: 6, padding: '0.65rem 1rem', marginBottom: '1.5rem',
  },
  integrityRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    fontFamily: 'monospace', fontSize: '0.78rem',
  },
  integrityLabel: {
    color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.68rem',
  },
  integrityHash: { color: 'var(--gold)', flex: 1 },
  integrityStatus: { fontWeight: 600, flexShrink: 0 },
  resourceGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem', marginBottom: '1.75rem',
  },
  resourceCard: {
    background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 8, padding: '1rem',
  },
  resourceDot: { width: 8, height: 8, borderRadius: '50%', marginBottom: '0.5rem' },
  resourceLabel: {
    fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em',
    color: 'var(--text-ghost)', marginBottom: '0.35rem',
  },
  resourceValue: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.15rem' },
  resourceCount: { fontSize: '0.7rem', color: '#333' },
  section: { marginTop: '1.5rem' },
  sectionTitle: {
    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-ghost)', marginBottom: '0.65rem',
  },
  eventList: {
    background: 'var(--ink)', border: '1px solid #1a1a2e', borderRadius: 8, overflow: 'hidden',
  },
  eventRow: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.7rem 1rem', borderBottom: '1px solid #1a1a28',
  },
  eventTag: {
    fontFamily: 'monospace', fontSize: '0.68rem', padding: '0.15em 0.45em',
    borderRadius: 3, flexShrink: 0, letterSpacing: '0.04em',
  },
  eventDesc: {
    flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  eventAmt: { fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-warm)', flexShrink: 0 },
  eventDate: { fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-ghost)', flexShrink: 0 },
  filterBar: { display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  filterBtn: {
    background: 'var(--hover-dim)', border: '1px solid #1a1a2e',
    color: 'var(--text-nav)', borderRadius: 5, padding: '0.3rem 0.7rem',
    fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.03em',
  },
  filterBtnActive: {
    background: 'rgba(196,149,106,0.1)', color: 'var(--text-primary)',
    borderColor: 'rgba(196,149,106,0.3)',
  },
  table: {
    background: 'var(--ink)', border: '1px solid #1a1a2e',
    borderRadius: 8, overflow: 'hidden',
  },
  th: {
    fontFamily: 'monospace', fontSize: '0.68rem', letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--text-ghost)', textAlign: 'left',
    padding: '0.55rem 1rem', borderBottom: '1px solid #1a1a2e', background: 'var(--hud-surface)',
  },
  td: { padding: '0.65rem 1rem', borderBottom: '1px solid #1a1a28', verticalAlign: 'middle', color: 'var(--text-muted)' },
  journalEntry: {
    background: 'var(--ink)', border: '1px solid #1a1a2e',
    borderRadius: 7, padding: '0.85rem 1rem', marginBottom: '0.4rem', cursor: 'pointer',
  },
  pageBtn: {
    background: 'var(--hover-dim)', border: '1px solid #1a1a2e',
    color: 'var(--text-subdim)', borderRadius: 5, padding: '0.35rem 0.75rem',
    cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace',
  },
  actionBtn: {
    background: 'var(--gold-06)', border: '1px solid rgba(196,149,106,0.25)',
    color: 'var(--gold)', borderRadius: 6, padding: '0.5rem 1.1rem',
    fontSize: '0.82rem', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.04em',
  },
  resultBox: { border: '1px solid', borderRadius: 8, padding: '1.1rem 1.25rem' },
  inputLabel: {
    display: 'block', fontFamily: 'monospace', fontSize: '0.7rem',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-dim)', marginBottom: '0.35rem',
  },
  input: {
    background: 'var(--ink)', border: '1px solid #1a1a2e',
    borderRadius: 5, color: 'var(--text-warm)', padding: '0.6rem 0.85rem',
    fontSize: '0.82rem', fontFamily: 'monospace',
    width: '100%', boxSizing: 'border-box',
  },
  empty: {
    padding: '2rem', textAlign: 'center', color: 'var(--text-ghost)',
    fontFamily: 'monospace', fontSize: '0.85rem',
  },
}
