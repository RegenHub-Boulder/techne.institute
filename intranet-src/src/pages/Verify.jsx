import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { IntranetHeader } from '../components/IntranetHeader.jsx'
import { computeMerkleRoot, generateMerkleProof, verifyMerkleProof, computeLeafHash } from '../lib/merkle.js'

/**
 * Verify.jsx — Merkle Proof Verification Tool
 *
 * Two modes:
 * 1. Live state: load current ledger → compute root → verify it matches stored root
 * 2. Manual: paste account_key + state_root → look up snapshot → verify proof
 */

function truncHash(h) {
  if (!h) return '—'
  return h.slice(0, 12) + '…' + h.slice(-8)
}

export default function Verify() {
  // Live verification state
  const [liveAccounts, setLiveAccounts] = useState(null)
  const [liveRoot, setLiveRoot] = useState(null)
  const [storedRoot, setStoredRoot] = useState(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveMatch, setLiveMatch] = useState(null)

  // Manual proof state
  const [accountKey, setAccountKey] = useState('')
  const [inputRoot, setInputRoot] = useState('')
  const [proof, setProof] = useState(null)
  const [proofLoading, setProofLoading] = useState(false)
  const [proofResult, setProofResult] = useState(null)

  // Snapshot browser state
  const [snapshots, setSnapshots] = useState([])
  const [snapsLoading, setSnapsLoading] = useState(false)
  const [selectedSnap, setSelectedSnap] = useState(null)

  // -------------------------------------------------------------------------
  // Live state verification
  // -------------------------------------------------------------------------
  async function verifyLiveState() {
    setLiveLoading(true)
    setLiveMatch(null)

    const { data, error } = await supabase
      .from('rea_ledger')
      .select('account_key, balance, state_merkle_root')
      .order('account_key')

    if (error || !data) {
      setLiveLoading(false)
      return
    }

    setLiveAccounts(data)
    setStoredRoot(data[0]?.state_merkle_root || null)

    const computed = await computeMerkleRoot(data)
    setLiveRoot(computed)
    setLiveMatch(computed === data[0]?.state_merkle_root)
    setLiveLoading(false)
  }

  // -------------------------------------------------------------------------
  // Manual proof lookup + verification
  // -------------------------------------------------------------------------
  async function lookupProof() {
    if (!accountKey.trim() || !inputRoot.trim()) return
    setProofLoading(true)
    setProof(null)
    setProofResult(null)

    // Look up the merkle state snapshot for this root
    const { data: stateData, error: stateErr } = await supabase
      .from('merkle_states')
      .select('*')
      .eq('state_root', inputRoot.trim())
      .limit(1)
      .single()

    if (stateErr || !stateData) {
      setProofResult({ error: `State root not found: ${inputRoot.slice(0, 20)}…` })
      setProofLoading(false)
      return
    }

    // Find account in snapshot
    const accounts = stateData.accounts_snapshot || []
    const accountInSnap = accounts.find((a) => a.account_key === accountKey.trim())

    if (!accountInSnap) {
      setProofResult({ error: `Account not found in this state: ${accountKey}` })
      setProofLoading(false)
      return
    }

    // Generate proof from snapshot
    const generated = await generateMerkleProof(
      accounts.map((a) => ({ account_key: a.account_key, balance: a.balance })),
      accountKey.trim()
    )

    if (!generated) {
      setProofResult({ error: 'Failed to generate proof' })
      setProofLoading(false)
      return
    }

    // Verify the proof
    const valid = await verifyMerkleProof(
      generated.leafHash,
      generated.proofPath,
      generated.root
    )

    // Also verify leaf hash matches snapshot
    const expectedLeaf = await computeLeafHash(accountKey.trim(), accountInSnap.balance)
    const leafValid = expectedLeaf === generated.leafHash

    setProof(generated)
    setProofResult({
      valid: valid && leafValid,
      accountKey: accountKey.trim(),
      accountName: accountInSnap.account_name || accountKey,
      balance: accountInSnap.balance,
      leafHash: generated.leafHash,
      expectedLeaf,
      leafValid,
      rootMatch: valid,
      snapshotRoot: stateData.state_root,
      computedRoot: generated.root,
      entryCount: stateData.entry_count,
      computedAt: stateData.computed_at,
      proofSteps: generated.proofPath.length,
    })

    setProofLoading(false)
  }

  // -------------------------------------------------------------------------
  // State snapshot browser
  // -------------------------------------------------------------------------
  async function loadSnapshots() {
    setSnapsLoading(true)
    const { data } = await supabase
      .from('merkle_states')
      .select('id, state_root, prev_state_root, entry_count, account_count, computed_at, rea_journal(event_type, description, amount, resource_type)')
      .order('computed_at', { ascending: false })
      .limit(20)
    setSnapshots(data || [])
    setSnapsLoading(false)
  }

  return (
    <div style={styles.page}>
      <IntranetHeader />
      <div style={styles.main}>

        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Verify</span>
        </nav>

        <div style={styles.pageHeader}>
          <div style={styles.pageTag}>REA · Merkle State Verification</div>
          <h1 style={styles.pageTitle}>State Verifier</h1>
          <p style={styles.pageSub}>
            Cryptographically verify cooperative account balances and state transitions.
            An external auditor can confirm any account balance at any historical state
            without access to the full ledger.
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 1: Live state verification */}
        {/* ----------------------------------------------------------------- */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>1 — Live State Verification</div>
          <p style={styles.sectionDesc}>
            Fetch the current ledger from the database, compute the merkle root client-side
            using Web Crypto API, and check it matches the stored root.
            If they match, no unauthorized changes have occurred.
          </p>

          <button onClick={verifyLiveState} disabled={liveLoading} style={styles.actionBtn}>
            {liveLoading ? 'Computing…' : 'Verify Current State'}
          </button>

          {liveMatch !== null && (
            <div style={{
              ...styles.resultBox,
              borderColor: liveMatch ? 'rgba(76,175,130,0.3)' : 'rgba(255,107,107,0.3)',
              background: liveMatch ? 'rgba(76,175,130,0.05)' : 'rgba(255,107,107,0.05)',
            }}>
              <div style={{ ...styles.resultStatus, color: liveMatch ? '#4caf82' : '#ff6b6b' }}>
                {liveMatch ? '✓ State Verified' : '✗ State Mismatch — possible tampering'}
              </div>
              <div style={styles.resultRows}>
                <ResultRow label="Accounts checked" value={liveAccounts?.length || 0} />
                <ResultRow label="Stored root" value={truncHash(storedRoot)} mono />
                <ResultRow label="Client-computed root" value={truncHash(liveRoot)} mono highlight />
                <ResultRow label="Match" value={liveMatch ? 'Yes' : 'No'} />
              </div>
              <div style={styles.explainBox}>
                <strong>How it works:</strong> Each account balance is hashed as
                <code style={styles.code}> sha256(account_key + ':' + balance)</code>.
                All leaf hashes are concatenated in alphabetical order and hashed again to produce
                the root. The stored root was computed by the database at transaction time.
                Client recomputation uses Web Crypto API (no external dependencies).
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 2: Manual proof verification */}
        {/* ----------------------------------------------------------------- */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>2 — Account Proof Verification</div>
          <p style={styles.sectionDesc}>
            Verify that a specific account held a specific balance at a specific historical state.
            Provide an account key and state root — the system will find the snapshot and
            generate a merkle proof.
          </p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Key</label>
            <input
              style={styles.input}
              placeholder="e.g. USD:capital:a4a0a0ab-…"
              value={accountKey}
              onChange={(e) => setAccountKey(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>State Root (hex)</label>
            <input
              style={styles.input}
              placeholder="64-character hex string"
              value={inputRoot}
              onChange={(e) => setInputRoot(e.target.value)}
            />
          </div>

          <button
            onClick={lookupProof}
            disabled={proofLoading || !accountKey.trim() || !inputRoot.trim()}
            style={styles.actionBtn}
          >
            {proofLoading ? 'Verifying…' : 'Generate & Verify Proof'}
          </button>

          {proofResult && (
            <div style={{
              ...styles.resultBox,
              borderColor: proofResult.error
                ? 'rgba(255,107,107,0.3)'
                : proofResult.valid
                ? 'rgba(76,175,130,0.3)'
                : 'rgba(255,107,107,0.3)',
              background: proofResult.error
                ? 'rgba(255,107,107,0.05)'
                : proofResult.valid
                ? 'rgba(76,175,130,0.05)'
                : 'rgba(255,107,107,0.05)',
            }}>
              {proofResult.error ? (
                <div style={{ color: '#ff6b6b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {proofResult.error}
                </div>
              ) : (
                <>
                  <div style={{ ...styles.resultStatus, color: proofResult.valid ? '#4caf82' : '#ff6b6b' }}>
                    {proofResult.valid ? '✓ Proof Valid' : '✗ Proof Invalid'}
                  </div>
                  <div style={styles.resultRows}>
                    <ResultRow label="Account" value={proofResult.accountName} />
                    <ResultRow label="Balance at state" value={proofResult.balance} />
                    <ResultRow label="Leaf hash" value={truncHash(proofResult.leafHash)} mono />
                    <ResultRow label="Leaf valid" value={proofResult.leafValid ? 'Yes' : 'No'} />
                    <ResultRow label="Root match" value={proofResult.rootMatch ? 'Yes' : 'No'} highlight />
                    <ResultRow label="Proof depth" value={`${proofResult.proofSteps} steps`} />
                    <ResultRow label="Snapshot entries" value={proofResult.entryCount} />
                    <ResultRow label="State recorded" value={new Date(proofResult.computedAt).toLocaleString()} />
                  </div>

                  {proof && proof.proofPath.length > 0 && (
                    <div style={styles.proofPath}>
                      <div style={styles.proofPathTitle}>Merkle Proof Path</div>
                      {proof.proofPath.map((step, i) => (
                        <div key={i} style={styles.proofStep}>
                          <span style={styles.proofStepPos}>{step.position}</span>
                          <span style={styles.proofStepHash}>{truncHash(step.hash)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 3: State history */}
        {/* ----------------------------------------------------------------- */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>3 — State History</div>
          <p style={styles.sectionDesc}>
            Browse historical state snapshots. Each entry is a point-in-time merkle root
            capturing all account balances at that moment.
          </p>

          <button onClick={loadSnapshots} disabled={snapsLoading} style={styles.actionBtn}>
            {snapsLoading ? 'Loading…' : 'Load State History'}
          </button>

          {snapshots.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              {snapshots.map((s) => (
                <div
                  key={s.id}
                  style={{
                    ...styles.snapCard,
                    borderColor: selectedSnap === s.id ? 'rgba(196,149,106,0.4)' : '#2a2a35',
                  }}
                  onClick={() => {
                    setSelectedSnap(selectedSnap === s.id ? null : s.id)
                    setInputRoot(s.state_root)
                  }}
                >
                  <div style={styles.snapTop}>
                    <span style={styles.snapRoot}>{truncHash(s.state_root)}</span>
                    <span style={styles.snapMeta}>
                      {s.entry_count} entries · {s.account_count} accounts
                    </span>
                    <span style={styles.snapDate}>
                      {new Date(s.computed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {s.rea_journal && (
                    <div style={styles.snapEvent}>
                      <span style={{ color: '#666' }}>{s.rea_journal.event_type}</span>
                      {' — '}
                      <span style={{ color: '#555' }}>{s.rea_journal.description || '—'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footerNav}>
          <a href="/intranet/governance/" style={styles.footerLink}>← Governance</a>
          <a href="/intranet/" style={styles.footerLink}>Home</a>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ label, value, mono, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #1e1e2410' }}>
      <span style={{ fontSize: '0.82rem', color: '#666' }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'monospace' : undefined,
        fontSize: mono ? '0.78rem' : '0.85rem',
        color: highlight ? '#4caf82' : '#aaa',
      }}>
        {String(value)}
      </span>
    </div>
  )
}

const styles = {
  page: { background: '#141418', minHeight: '100vh', color: '#c8c2ba' },
  main: { maxWidth: 800, margin: '0 auto', padding: '2rem 2rem 4rem' },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.78rem' },
  breadLink: { color: '#888', textDecoration: 'none' },
  breadSep: { color: '#3a3a42' },

  pageHeader: { marginBottom: '2rem' },
  pageTag: { fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c4956a', marginBottom: '0.5rem' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#ece6de', letterSpacing: '-0.02em', margin: '0 0 0.5rem' },
  pageSub: { fontSize: '0.9rem', color: '#888', lineHeight: 1.65, maxWidth: 600, margin: 0 },

  section: { marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #2a2a35' },
  sectionTitle: { fontFamily: 'monospace', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '0.65rem' },
  sectionDesc: { fontSize: '0.9rem', color: '#666', lineHeight: 1.65, marginBottom: '1.25rem' },

  actionBtn: { background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.25)', color: '#c4956a', borderRadius: 6, padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.05em' },

  resultBox: { border: '1px solid', borderRadius: 8, padding: '1.25rem', marginTop: '1.25rem' },
  resultStatus: { fontFamily: 'monospace', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 600 },
  resultRows: { display: 'flex', flexDirection: 'column', marginBottom: '1rem' },
  explainBox: { fontSize: '0.82rem', color: '#555', lineHeight: 1.65, paddingTop: '0.75rem', borderTop: '1px solid #252530' },
  code: { fontFamily: 'monospace', fontSize: '0.8rem', background: '#1e1e24', padding: '0.1em 0.35em', borderRadius: 3, color: '#c4956a' },

  inputGroup: { marginBottom: '0.85rem' },
  label: { display: 'block', fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', marginBottom: '0.4rem' },
  input: { background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 5, color: '#c8c2ba', padding: '0.65rem 0.9rem', fontSize: '0.85rem', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box', marginBottom: '0.25rem' },

  proofPath: { marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #252530' },
  proofPathTitle: { fontFamily: 'monospace', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' },
  proofStep: { display: 'flex', gap: '1rem', padding: '0.25rem 0', fontFamily: 'monospace', fontSize: '0.78rem' },
  proofStepPos: { color: '#666', width: '3rem', flexShrink: 0 },
  proofStepHash: { color: '#555' },

  snapCard: { background: '#1e1e24', border: '1px solid', borderRadius: 6, padding: '0.85rem 1rem', marginBottom: '0.4rem', cursor: 'pointer' },
  snapTop: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  snapRoot: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#c4956a', flex: 1 },
  snapMeta: { fontFamily: 'monospace', fontSize: '0.72rem', color: '#555' },
  snapDate: { fontFamily: 'monospace', fontSize: '0.72rem', color: '#444' },
  snapEvent: { fontFamily: 'monospace', fontSize: '0.72rem', marginTop: '0.35rem' },

  footerNav: { display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #2a2a35', marginTop: '1rem' },
  footerLink: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#888', textDecoration: 'none' },
}
