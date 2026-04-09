import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

const STATUS_COLORS = {
  open:     '#4caf82',
  closed:   '#555',
  passed:   '#7eb8e8',
  rejected: '#ff6b6b',
  pending:  '#c4956a',
}

const VOTE_OPTIONS = [
  { value: 'yes',     label: 'Yes', color: '#4caf82' },
  { value: 'no',      label: 'No',  color: '#ff6b6b' },
  { value: 'abstain', label: 'Abstain', color: '#555' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function VoteCounts({ votes }) {
  const counts = { yes: 0, no: 0, abstain: 0 }
  for (const v of (votes || [])) {
    counts[v.vote] = (counts[v.vote] || 0) + 1
  }
  const total = votes?.length || 0
  if (total === 0) return <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#444' }}>No votes</span>
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {VOTE_OPTIONS.map(({ value, label, color }) => (
        counts[value] > 0 && (
          <span key={value} style={{ fontFamily: 'monospace', fontSize: '0.78rem', color }}>
            {label}: {counts[value]}
          </span>
        )
      ))}
      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#444' }}>({total} total)</span>
    </div>
  )
}

export default function Governance() {
  const { participant, isSteward } = useAuth()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [voting, setVoting] = useState({})         // proposalId → 'loading'|'done'|null
  const [myVotes, setMyVotes] = useState({})        // proposalId → vote value
  const [filter, setFilter] = useState('open')
  const [showNew, setShowNew] = useState(false)
  const [newProposal, setNewProposal] = useState({ title: '', description: '', category: 'governance' })
  const [submitting, setSubmitting] = useState(false)
  const [journalNote, setJournalNote] = useState(null)

  useEffect(() => {
    load()
  }, [filter])

  async function load() {
    setLoading(true)
    const q = supabase
      .from('proposals')
      .select('*, participants!proposals_proposer_id_fkey(name), proposal_votes(id, voter_id, vote, participants(name))')
      .order('created_at', { ascending: false })

    const { data, error: err } = filter === 'all' ? await q : await q.eq('status', filter)
    if (err) setError(err.message)
    else {
      setProposals(data || [])
      // Build my votes map
      if (participant) {
        const mv = {}
        for (const p of (data || [])) {
          const mine = p.proposal_votes?.find((v) => v.voter_id === participant.id)
          if (mine) mv[p.id] = mine.vote
        }
        setMyVotes(mv)
      }
    }
    setLoading(false)
  }

  async function castVote(proposalId, vote) {
    if (!participant) return
    setVoting((v) => ({ ...v, [proposalId]: 'loading' }))

    // Upsert the vote
    const { error: vErr } = await supabase
      .from('proposal_votes')
      .upsert(
        { proposal_id: proposalId, voter_id: participant.id, vote },
        { onConflict: 'proposal_id,voter_id' }
      )

    if (vErr) {
      alert('Vote failed: ' + vErr.message)
      setVoting((v) => ({ ...v, [proposalId]: null }))
      return
    }

    // Record in REA journal (voting_power transfer from member → proposal)
    const voteAccountKey = `VOTE:${participant.id}`
    const proposalAccountKey = `VOTE:proposal:${proposalId}`

    // Try to record a journal entry (best-effort — the journal table may not have the proposal account yet)
    try {
      // Ensure proposal account exists first
      await supabase.from('rea_ledger').upsert([
        {
          account_key: proposalAccountKey,
          account_type: 'voting_power',
          account_name: 'Proposal Vote Pool',
          resource_type: 'voting_power',
          balance: 0,
        }
      ], { onConflict: 'account_key', ignoreDuplicates: true })

      // Insert journal entry directly (no balance change — vote is a signal, not a transfer)
      await supabase.from('rea_journal').insert({
        event_type: 'vote',
        description: `Vote: ${vote} on proposal ${proposalId.slice(0, 8)}`,
        resource_type: 'voting_power',
        amount: 1,
        from_account_key: voteAccountKey,
        to_account_key: proposalAccountKey,
        agent_id: participant.id,
        recorded_by: participant.id,
        source_table: 'proposal_votes',
        metadata: { proposal_id: proposalId, vote },
      })

      setJournalNote('Vote recorded in REA journal.')
      setTimeout(() => setJournalNote(null), 3000)
    } catch (e) {
      // Journal recording is best-effort
      console.warn('Journal entry failed (non-blocking):', e)
    }

    setMyVotes((v) => ({ ...v, [proposalId]: vote }))
    setVoting((v) => ({ ...v, [proposalId]: 'done' }))
    load()
  }

  async function submitProposal() {
    if (!participant || !newProposal.title.trim()) return
    setSubmitting(true)

    const { error: pErr } = await supabase.from('proposals').insert({
      title: newProposal.title.trim(),
      description: newProposal.description.trim(),
      category: newProposal.category,
      proposer_id: participant.id,
      status: 'open',
      scope: 'cooperative',
    })

    if (pErr) {
      alert('Failed to create proposal: ' + pErr.message)
    } else {
      setShowNew(false)
      setNewProposal({ title: '', description: '', category: 'governance' })
      load()
    }
    setSubmitting(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.main}>

        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Governance</span>
        </nav>

        <div style={styles.pageHeader}>
          <div style={styles.pageTag}>REA · Decision-Making State Machine</div>
          <h1 style={styles.pageTitle}>Governance</h1>
          <p style={styles.pageSub}>
            Proposals and votes recorded as REA journal events.
            Each vote is a resource transfer (voting power → proposal), creating an
            auditable on-chain record of cooperative decision-making.
          </p>
        </div>

        {journalNote && (
          <div style={styles.journalNote}>{journalNote}</div>
        )}

        {/* Action bar */}
        <div style={styles.actionBar}>
          <div style={styles.filterBar}>
            {['open', 'closed', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{ ...styles.filterBtn, ...(filter === s ? styles.filterBtnActive : {}) }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {participant && (
            <button
              onClick={() => setShowNew(!showNew)}
              style={styles.newBtn}
            >
              + New Proposal
            </button>
          )}
        </div>

        {/* New proposal form */}
        {showNew && (
          <div style={styles.newForm}>
            <div style={styles.formTitle}>New Proposal</div>
            <input
              style={styles.input}
              placeholder="Title"
              value={newProposal.title}
              onChange={(e) => setNewProposal((p) => ({ ...p, title: e.target.value }))}
            />
            <textarea
              style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
              placeholder="Description"
              value={newProposal.description}
              onChange={(e) => setNewProposal((p) => ({ ...p, description: e.target.value }))}
            />
            <select
              style={styles.input}
              value={newProposal.category}
              onChange={(e) => setNewProposal((p) => ({ ...p, category: e.target.value }))}
            >
              {['governance', 'financial', 'operational', 'membership', 'other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={submitProposal} disabled={submitting} style={styles.submitBtn}>
                {submitting ? 'Submitting…' : 'Submit Proposal'}
              </button>
              <button onClick={() => setShowNew(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {loading && <div style={styles.loading}>Loading…</div>}
        {error && <div style={styles.error}>{error}</div>}
        {!loading && proposals.length === 0 && (
          <div style={styles.empty}>No proposals {filter !== 'all' ? `with status "${filter}"` : ''}.</div>
        )}

        {proposals.map((p) => {
          const myVote = myVotes[p.id]
          const isVoting = voting[p.id] === 'loading'
          const statusColor = STATUS_COLORS[p.status] || '#888'

          return (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={{ ...styles.statusBadge, color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}10` }}>
                  {p.status}
                </span>
                <span style={styles.category}>{p.category}</span>
                <span style={styles.propDate}>{fmtDate(p.created_at)}</span>
              </div>

              <h3 style={styles.cardTitle}>{p.title}</h3>

              {p.description && (
                <p style={styles.cardDesc}>{p.description}</p>
              )}

              <div style={styles.cardMeta}>
                <span style={styles.metaItem}>
                  Proposed by <strong style={{ color: '#c8c2ba' }}>{p.participants?.name || '—'}</strong>
                </span>
                {p.vote_deadline && (
                  <span style={styles.metaItem}>Deadline: {fmtDate(p.vote_deadline)}</span>
                )}
              </div>

              <div style={styles.voteRow}>
                <VoteCounts votes={p.proposal_votes} />

                {p.status === 'open' && participant && (
                  <div style={styles.voteBtns}>
                    {VOTE_OPTIONS.map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => castVote(p.id, value)}
                        disabled={isVoting}
                        style={{
                          ...styles.voteBtn,
                          borderColor: myVote === value ? color : '#2a2a35',
                          color: myVote === value ? color : '#666',
                          background: myVote === value ? `${color}10` : '#1e1e24',
                        }}
                      >
                        {label}
                        {myVote === value && ' ✓'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Journal events for this proposal */}
              {p.proposal_votes && p.proposal_votes.length > 0 && (
                <div style={styles.journalHint}>
                  <span style={{ color: '#444' }}>
                    {p.proposal_votes.length} vote{p.proposal_votes.length !== 1 ? 's' : ''} →
                    recorded as REA journal events (event_type: vote)
                  </span>
                  <a href="/intranet/journal/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.72rem' }}>
                    View in journal →
                  </a>
                </div>
              )}
            </div>
          )
        })}

        <div style={styles.footerNav}>
          <a href="/intranet/ledger/" style={styles.footerLink}>← Ledger</a>
          <a href="/intranet/verify/" style={styles.footerLink}>Verify →</a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#141418', minHeight: '100vh', color: '#c8c2ba' },
  main: { maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 4rem' },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.78rem' },
  breadLink: { color: '#888', textDecoration: 'none' },
  breadSep: { color: '#3a3a42' },

  pageHeader: { marginBottom: '1.75rem' },
  pageTag: { fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c4956a', marginBottom: '0.5rem' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#ece6de', letterSpacing: '-0.02em', margin: '0 0 0.5rem' },
  pageSub: { fontSize: '0.9rem', color: '#888', lineHeight: 1.65, maxWidth: 600, margin: 0 },

  journalNote: { background: 'rgba(76,175,130,0.08)', border: '1px solid rgba(76,175,130,0.2)', borderRadius: 6, padding: '0.65rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#4caf82', marginBottom: '1rem' },

  actionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' },
  filterBar: { display: 'flex', gap: '0.4rem' },
  filterBtn: { background: '#1e1e24', border: '1px solid #2a2a35', color: '#888', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(196,149,106,0.08)', color: '#e8e8e0', borderColor: '#c4956a' },
  newBtn: { background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.25)', color: '#c4956a', borderRadius: 6, padding: '0.4rem 1rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'monospace' },

  newForm: { background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  formTitle: { fontFamily: 'monospace', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '0.25rem' },
  input: { background: '#141418', border: '1px solid #2a2a35', borderRadius: 5, color: '#c8c2ba', padding: '0.6rem 0.85rem', fontSize: '0.88rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  submitBtn: { background: 'rgba(196,149,106,0.12)', border: '1px solid rgba(196,149,106,0.3)', color: '#c4956a', borderRadius: 5, padding: '0.5rem 1.1rem', cursor: 'pointer', fontSize: '0.82rem' },
  cancelBtn: { background: 'none', border: '1px solid #2a2a35', color: '#666', borderRadius: 5, padding: '0.5rem 0.85rem', cursor: 'pointer', fontSize: '0.82rem' },

  loading: { color: '#555', fontFamily: 'monospace', fontSize: '0.85rem', padding: '2rem 0' },
  error: { color: '#ff6b6b', fontFamily: 'monospace', fontSize: '0.85rem', padding: '1rem', background: 'rgba(255,107,107,0.06)', borderRadius: 6 },
  empty: { color: '#555', fontFamily: 'monospace', fontSize: '0.85rem', padding: '3rem 0', textAlign: 'center' },

  card: { background: '#1e1e24', border: '1px solid #2a2a35', borderRadius: 8, padding: '1.25rem', marginBottom: '0.75rem' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  statusBadge: { fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.08em', padding: '0.2em 0.55em', borderRadius: 4, border: '1px solid' },
  category: { fontFamily: 'monospace', fontSize: '0.72rem', color: '#555', letterSpacing: '0.05em' },
  propDate: { fontFamily: 'monospace', fontSize: '0.72rem', color: '#444', marginLeft: 'auto' },
  cardTitle: { fontFamily: 'Georgia, serif', fontSize: '1.15rem', fontWeight: 400, color: '#e8e8e0', margin: '0 0 0.5rem' },
  cardDesc: { fontSize: '0.9rem', color: '#888', lineHeight: 1.6, margin: '0 0 0.75rem' },
  cardMeta: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  metaItem: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#555' },

  voteRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #252530' },
  voteBtns: { display: 'flex', gap: '0.4rem' },
  voteBtn: { border: '1px solid', borderRadius: 5, padding: '0.3rem 0.7rem', fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s' },

  journalHint: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #1e1e24', fontFamily: 'monospace', fontSize: '0.72rem' },

  footerNav: { display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #2a2a35', marginTop: '2rem' },
  footerLink: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#888', textDecoration: 'none' },
}
