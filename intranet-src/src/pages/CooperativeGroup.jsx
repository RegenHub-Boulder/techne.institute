import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { TabShell } from '../components/TabShell.jsx'

// ─── Shared ───────────────────────────────────────────────────────────────────

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const STATUS_COLOR = { active: '#4a5f4a', paused: '#c4956a', completed: '#6b836b', archived: '#555', open: '#4a5f4a', closed: '#555', passed: '#6b836b', rejected: '#c46a6a', pending: '#c4956a' }
const MEMBER_CLASS = { 1: 'Class 1 · Labor', 2: 'Class 2 · Patron', 3: 'Class 3 · Community', 4: 'Class 4 · Investor' }
const inputStyle = { width: '100%', padding: '0.5rem 0.65rem', background: '#0c0c1a', border: '1px solid #2a2a40', borderRadius: '5px', color: '#e0e0f0', fontSize: '0.82rem', fontFamily: 'inherit', boxSizing: 'border-box' }
const tableContainer = { background: 'rgba(255,255,255,0.015)', border: '1px solid #1a1a2e', borderRadius: '8px', overflow: 'hidden' }
const emptyStyle = { padding: '1.5rem', color: '#3a3a5a', fontSize: '0.85rem', textAlign: 'center' }
const Badge = ({ label, color }) => (
  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: color || '#8888a8', background: `${color || '#8888a8'}18`, padding: '2px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>{label}</span>
)

// ─── Projects tab ─────────────────────────────────────────────────────────────

function ProjectsTab() {
  const { isSteward } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('active')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase.from('projects').select(`
      id, name, description, type, status, created_at,
      project_participants(role, participants(id, name)),
      project_milestones(id, title, status, due_date)
    `).order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) setError(error.message)
      else setProjects(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = projects.filter(p => !statusFilter || p.status === statusFilter)

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#c4956a', fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginBottom: '1.25rem', fontFamily: 'inherit' }}>← All Projects</button>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#e0e0f0', marginBottom: '0.35rem' }}>{selected.name}</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge label={selected.status} color={STATUS_COLOR[selected.status]} />
          {selected.type && <Badge label={selected.type} />}
        </div>
      </div>
      {selected.description && <p style={{ fontSize: '0.88rem', color: '#8888a8', lineHeight: 1.65, marginBottom: '1.25rem' }}>{selected.description}</p>}

      {selected.project_participants?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52526a', marginBottom: '0.5rem' }}>Contributors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selected.project_participants.map((pp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a2e', borderRadius: '6px', padding: '0.4rem 0.7rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(196,149,106,0.15)', color: '#c4956a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                  {(pp.participants?.name || '?').charAt(0)}
                </span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c0c0d0' }}>{pp.participants?.name || 'Unknown'}</div>
                  {pp.role && <div style={{ fontSize: '0.68rem', color: '#52526a' }}>{pp.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected.project_milestones?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52526a', marginBottom: '0.5rem' }}>Milestones</div>
          <div style={tableContainer}>
            {selected.project_milestones.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', borderBottom: '1px solid #12121e' }}>
                <div style={{ display: 'flex', align: 'center', gap: '0.5rem' }}>
                  <span style={{ color: m.status === 'completed' ? '#4a5f4a' : '#52526a', fontSize: '0.85rem' }}>{m.status === 'completed' ? '✓' : '○'}</span>
                  <span style={{ fontSize: '0.85rem', color: m.status === 'completed' ? '#52526a' : '#c0c0d0' }}>{m.title}</span>
                </div>
                {m.due_date && <span style={{ fontSize: '0.75rem', color: '#3a3a5a' }}>{fmtDate(m.due_date)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[['', 'All'], ['active', 'Active'], ['paused', 'Paused'], ['completed', 'Completed']].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)} style={{ padding: '0.3rem 0.65rem', background: statusFilter === v ? 'rgba(196,149,106,0.15)' : 'none', border: `1px solid ${statusFilter === v ? 'rgba(196,149,106,0.4)' : '#1a1a2e'}`, color: statusFilter === v ? '#c4956a' : '#52526a', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div style={emptyStyle}>Loading projects…</div>}
      {error && <div style={{ color: '#c46a6a', padding: '0.75rem' }}>{error}</div>}

      <div style={tableContainer}>
        {!loading && filtered.length === 0 && <div style={emptyStyle}>No projects found.</div>}
        {filtered.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderBottom: '1px solid #12121e', cursor: 'pointer', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#d0d0e8' }}>{p.name}</span>
                <Badge label={p.status} color={STATUS_COLOR[p.status]} />
                {p.type && <Badge label={p.type} />}
              </div>
              {p.description && <div style={{ fontSize: '0.78rem', color: '#52526a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{p.description}</div>}
              {p.project_participants?.length > 0 && (
                <div style={{ fontSize: '0.72rem', color: '#3a3a5a' }}>
                  {p.project_participants.slice(0, 3).map(pp => pp.participants?.name).filter(Boolean).join(', ')}
                  {p.project_participants.length > 3 ? ` +${p.project_participants.length - 3}` : ''}
                </div>
              )}
            </div>
            <span style={{ color: '#3a3a5a', fontSize: '0.9rem' }}>→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function MembersTab() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('participants').select('id, name, email, participant_type, account_type, membership_class, craft').order('name')
    .then(({ data, error }) => {
      if (error) setError(error.message)
      else setMembers(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return !q || m.name?.toLowerCase().includes(q) || m.craft?.toLowerCase().includes(q) || m.participant_type?.toLowerCase().includes(q)
  })

  return (
    <div>
      <input
        type="search" placeholder="Search by name, craft, or role…" value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle, maxWidth: '360px', marginBottom: '1.25rem' }}
      />
      {loading && <div style={emptyStyle}>Loading members…</div>}
      {error && <div style={{ color: '#c46a6a', fontSize: '0.85rem' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {filtered.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', background: 'rgba(255,255,255,0.025)', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'rgba(196,149,106,0.12)', color: '#c4956a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>
              {(m.name || '?').charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e0e0f0', marginBottom: '0.2rem' }}>{m.name || '—'}</div>
              {m.craft && <div style={{ fontSize: '0.78rem', color: '#8888a8', marginBottom: '0.4rem' }}>{m.craft}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {m.participant_type && <Badge label={m.participant_type} />}
                {m.membership_class && <Badge label={MEMBER_CLASS[m.membership_class] || `Class ${m.membership_class}`} color="#c4956a" />}
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <div style={{ ...emptyStyle, gridColumn: '1/-1' }}>{search ? 'No matches.' : 'No members found.'}</div>}
      </div>
    </div>
  )
}

// ─── Governance tab ───────────────────────────────────────────────────────────

function GovernanceTab() {
  const { participant, isSteward } = useAuth()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myVotes, setMyVotes] = useState({})
  const [voting, setVoting] = useState({})
  const [filter, setFilter] = useState('open')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ title: '', description: '', category: 'governance' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const q = supabase.from('proposals')
      .select('*, participants!proposals_proposer_id_fkey(name), proposal_votes(id, voter_id, vote, participants(name))')
      .order('created_at', { ascending: false })
    const { data, error: err } = filter === 'all' ? await q : await q.eq('status', filter)
    if (err) setError(err.message)
    else {
      setProposals(data || [])
      const mv = {}
      for (const p of (data || [])) {
        const mine = p.proposal_votes?.find(v => v.voter_id === participant?.id)
        if (mine) mv[p.id] = mine.vote
      }
      setMyVotes(mv)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function castVote(proposalId, vote) {
    if (!participant) return
    setVoting(prev => ({ ...prev, [proposalId]: 'loading' }))
    await supabase.from('proposal_votes').upsert({ proposal_id: proposalId, voter_id: participant.id, vote }, { onConflict: 'proposal_id,voter_id' })
    // Record in REA journal (best effort)
    supabase.from('rea_journal').insert({ event_type: 'vote', resource_type: 'voting_power', amount: 1, to_account_key: `voting_power:${participant.id}`, description: `Vote ${vote} on proposal ${proposalId}`, agent_id: participant.id }).then(() => {})
    setVoting(prev => ({ ...prev, [proposalId]: null }))
    await load()
  }

  async function submitProposal(e) {
    e.preventDefault()
    setSubmitting(true)
    await supabase.from('proposals').insert({ ...newForm, proposer_id: participant?.id, status: 'open', scope: 'cooperative' })
    setShowNew(false)
    setNewForm({ title: '', description: '', category: 'governance' })
    setSubmitting(false)
    load()
  }

  const openCount = proposals.filter(p => p.status === 'open').length

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {[['open', 'Open'], ['closed', 'Closed'], ['all', 'All']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '0.3rem 0.65rem', background: filter === v ? 'rgba(196,149,106,0.15)' : 'none', border: `1px solid ${filter === v ? 'rgba(196,149,106,0.4)' : '#1a1a2e'}`, color: filter === v ? '#c4956a' : '#52526a', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: '0.4rem 0.85rem', background: 'rgba(196,149,106,0.12)', border: '1px solid rgba(196,149,106,0.25)', color: '#c4956a', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {showNew ? 'Cancel' : '+ Propose'}
        </button>
      </div>

      {/* New proposal form */}
      {showNew && (
        <form onSubmit={submitProposal} style={{ background: 'rgba(196,149,106,0.05)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#52526a', marginBottom: '0.3rem' }}>Title</label>
            <input required value={newForm.title} onChange={e => setNewForm(f => ({...f, title: e.target.value}))} placeholder="Proposal title" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#52526a', marginBottom: '0.3rem' }}>Description</label>
            <textarea value={newForm.description} onChange={e => setNewForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Describe the proposal…" style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
          </div>
          <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.1rem', background: '#c4956a', border: 'none', color: '#000', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Submitting…' : 'Submit Proposal'}
          </button>
        </form>
      )}

      {loading && <div style={emptyStyle}>Loading proposals…</div>}
      {error && <div style={{ color: '#c46a6a', fontSize: '0.85rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {!loading && proposals.length === 0 && <div style={{ ...emptyStyle, background: 'rgba(255,255,255,0.015)', border: '1px solid #1a1a2e', borderRadius: '8px' }}>No {filter === 'all' ? '' : filter} proposals.</div>}
        {proposals.map(p => {
          const counts = (p.proposal_votes || []).reduce((acc, v) => { acc[v.vote] = (acc[v.vote] || 0) + 1; return acc }, {})
          const myVote = myVotes[p.id]
          const isOpen = p.status === 'open'
          return (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#d0d0e8', marginBottom: '0.3rem' }}>{p.title}</div>
                  {p.description && <div style={{ fontSize: '0.8rem', color: '#52526a', lineHeight: 1.5 }}>{p.description}</div>}
                </div>
                <Badge label={p.status} color={STATUS_COLOR[p.status]} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {/* Vote counts */}
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                  {(counts.yes || 0) > 0 && <span style={{ color: '#4a5f4a' }}>Yes: {counts.yes}</span>}
                  {(counts.no || 0) > 0 && <span style={{ color: '#c46a6a' }}>No: {counts.no}</span>}
                  {(counts.abstain || 0) > 0 && <span style={{ color: '#555' }}>Abstain: {counts.abstain}</span>}
                  {p.proposal_votes?.length === 0 && <span style={{ color: '#3a3a5a' }}>No votes</span>}
                </div>
                {/* Vote buttons */}
                {isOpen && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[['yes', '#4a5f4a', 'Yes'], ['no', '#c46a6a', 'No'], ['abstain', '#555', 'Abstain']].map(([v, c, l]) => (
                      <button key={v}
                        onClick={() => castVote(p.id, v)}
                        disabled={voting[p.id] === 'loading'}
                        style={{ padding: '0.3rem 0.7rem', background: myVote === v ? `${c}20` : 'none', border: `1px solid ${myVote === v ? c : '#1a1a2e'}`, color: myVote === v ? c : '#52526a', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: myVote === v ? 700 : 400 }}
                      >{l}</button>
                    ))}
                  </div>
                )}
              </div>
              {p.participants?.name && <div style={{ fontSize: '0.7rem', color: '#3a3a5a', marginTop: '0.5rem' }}>Proposed by {p.participants.name} · {fmtDate(p.created_at)}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'projects',    label: 'Projects'    },
  { key: 'members',     label: 'Members'     },
  { key: 'governance',  label: 'Governance'  },
]

export default function CooperativeGroup({ initialTab = 'projects' }) {
  const [tab, setTab] = useState(initialTab)
  const openTab = (key) => {
    setTab(key)
    const paths = { projects: '/intranet/projects/', members: '/intranet/directory/', governance: '/intranet/governance/' }
    window.history.pushState(null, '', paths[key] || '/intranet/projects/')
  }
  return (
    <TabShell title="Cooperative" subtitle="Projects · Members · Governance" tabs={TABS} active={tab} onTab={openTab}>
      {tab === 'projects'   && <ProjectsTab />}
      {tab === 'members'    && <MembersTab />}
      {tab === 'governance' && <GovernanceTab />}
    </TabShell>
  )
}
