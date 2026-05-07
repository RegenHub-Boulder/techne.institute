import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { TabShell } from '../components/TabShell.jsx'

// ─── Shared ───────────────────────────────────────────────────────────────────

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const STATUS_COLOR = { active: 'var(--status-ok)', paused: 'var(--gold)', completed: 'var(--status-info)', archived: 'var(--text-dim)', open: 'var(--status-ok)', closed: 'var(--text-dim)', passed: 'var(--status-info)', rejected: 'var(--status-err)', pending: 'var(--gold)' }
const MEMBER_CLASS = { 1: 'Class 1 · Labor', 2: 'Class 2 · Patron', 3: 'Class 3 · Community', 4: 'Class 4 · Investor' }
const inputStyle = { width: '100%', padding: '0.5rem 0.65rem', background: 'var(--hud-bar)', border: '1px solid #2a2a40', borderRadius: '5px', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', boxSizing: 'border-box' }
const tableContainer = { background: 'rgba(255,255,255,0.015)', border: '1px solid #1a1a2e', borderRadius: '8px', overflow: 'hidden' }
const emptyStyle = { padding: '1.5rem', color: 'var(--text-3a5a)', fontSize: '0.85rem', textAlign: 'center' }
const Badge = ({ label, color }) => (
  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: color || 'var(--text-accent)', background: `${color || 'var(--text-accent)'}18`, padding: '2px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>{label}</span>
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
      <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginBottom: '1.25rem', fontFamily: 'inherit' }}>← All Projects</button>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{selected.name}</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge label={selected.status} color={STATUS_COLOR[selected.status]} />
          {selected.type && <Badge label={selected.type} />}
        </div>
      </div>
      {selected.description && <p style={{ fontSize: '0.88rem', color: 'var(--text-accent)', lineHeight: 1.65, marginBottom: '1.25rem' }}>{selected.description}</p>}

      {selected.project_participants?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-nav)', marginBottom: '0.5rem' }}>Contributors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selected.project_participants.map((pp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--hover-dim)', border: '1px solid #1a1a2e', borderRadius: '6px', padding: '0.4rem 0.7rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-15)', color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                  {(pp.participants?.name || '?').charAt(0)}
                </span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-ccc)' }}>{pp.participants?.name || 'Unknown'}</div>
                  {pp.role && <div style={{ fontSize: '0.68rem', color: 'var(--text-nav)' }}>{pp.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected.project_milestones?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-nav)', marginBottom: '0.5rem' }}>Milestones</div>
          <div style={tableContainer}>
            {selected.project_milestones.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', borderBottom: '1px solid #12121e' }}>
                <div style={{ display: 'flex', align: 'center', gap: '0.5rem' }}>
                  <span style={{ color: m.status === 'completed' ? 'var(--status-ok)' : 'var(--text-nav)', fontSize: '0.85rem' }}>{m.status === 'completed' ? '✓' : '○'}</span>
                  <span style={{ fontSize: '0.85rem', color: m.status === 'completed' ? 'var(--text-nav)' : 'var(--text-ccc)' }}>{m.title}</span>
                </div>
                {m.due_date && <span style={{ fontSize: '0.75rem', color: 'var(--text-3a5a)' }}>{fmtDate(m.due_date)}</span>}
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
          <button key={v} onClick={() => setStatusFilter(v)} style={{ padding: '0.3rem 0.65rem', background: statusFilter === v ? 'var(--gold-15)' : 'none', border: `1px solid ${statusFilter === v ? 'rgba(196,149,106,0.4)' : 'var(--hud-border)'}`, color: statusFilter === v ? 'var(--gold)' : 'var(--text-nav)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {l}
          </button>
        ))}
      </div>

      {loading && <div style={emptyStyle}>Loading projects…</div>}
      {error && <div style={{ color: 'var(--status-err)', padding: '0.75rem' }}>{error}</div>}

      <div style={tableContainer}>
        {!loading && filtered.length === 0 && <div style={emptyStyle}>No projects found.</div>}
        {filtered.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderBottom: '1px solid #12121e', cursor: 'pointer', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-ccc)' }}>{p.name}</span>
                <Badge label={p.status} color={STATUS_COLOR[p.status]} />
                {p.type && <Badge label={p.type} />}
              </div>
              {p.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-nav)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{p.description}</div>}
              {p.project_participants?.length > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3a5a)' }}>
                  {p.project_participants.slice(0, 3).map(pp => pp.participants?.name).filter(Boolean).join(', ')}
                  {p.project_participants.length > 3 ? ` +${p.project_participants.length - 3}` : ''}
                </div>
              )}
            </div>
            <span style={{ color: 'var(--text-3a5a)', fontSize: '0.9rem' }}>→</span>
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
    supabase.from('participants').select('id, name, email, participant_type, account_type, membership_class, craft_primary')
    .in('membership_class', [1, 2, 3, 4]).order('name')
    .then(({ data, error }) => {
      if (error) setError(error.message)
      else setMembers(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return !q || m.name?.toLowerCase().includes(q) || m.craft_primary?.toLowerCase().includes(q) || m.participant_type?.toLowerCase().includes(q)
  })

  return (
    <div>
      <input
        type="search" placeholder="Search by name, craft, or role…" value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle, maxWidth: '360px', marginBottom: '1.25rem' }}
      />
      {loading && <div style={emptyStyle}>Loading members…</div>}
      {error && <div style={{ color: 'var(--status-err)', fontSize: '0.85rem' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {filtered.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', background: 'rgba(255,255,255,0.025)', border: '1px solid #1a1a2e', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--gold-12)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>
              {(m.name || '?').charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{m.name || '—'}</div>
              {m.craft_primary && <div style={{ fontSize: '0.78rem', color: 'var(--text-accent)', marginBottom: '0.4rem' }}>{m.craft_primary}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {m.participant_type && <Badge label={m.participant_type} />}
                {m.membership_class && <Badge label={MEMBER_CLASS[m.membership_class] || `Class ${m.membership_class}`} color="var(--gold)" />}
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
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '0.3rem 0.65rem', background: filter === v ? 'var(--gold-15)' : 'none', border: `1px solid ${filter === v ? 'rgba(196,149,106,0.4)' : 'var(--hud-border)'}`, color: filter === v ? 'var(--gold)' : 'var(--text-nav)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: '0.4rem 0.85rem', background: 'var(--gold-12)', border: '1px solid rgba(196,149,106,0.25)', color: 'var(--gold)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {showNew ? 'Cancel' : '+ Propose'}
        </button>
      </div>

      {/* New proposal form */}
      {showNew && (
        <form onSubmit={submitProposal} style={{ background: 'rgba(196,149,106,0.05)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Title</label>
            <input required value={newForm.title} onChange={e => setNewForm(f => ({...f, title: e.target.value}))} placeholder="Proposal title" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Description</label>
            <textarea value={newForm.description} onChange={e => setNewForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Describe the proposal…" style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
          </div>
          <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.1rem', background: 'var(--gold)', border: 'none', color: '#000', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Submitting…' : 'Submit Proposal'}
          </button>
        </form>
      )}

      {loading && <div style={emptyStyle}>Loading proposals…</div>}
      {error && <div style={{ color: 'var(--status-err)', fontSize: '0.85rem' }}>{error}</div>}

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
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-ccc)', marginBottom: '0.3rem' }}>{p.title}</div>
                  {p.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-nav)', lineHeight: 1.5 }}>{p.description}</div>}
                </div>
                <Badge label={p.status} color={STATUS_COLOR[p.status]} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {/* Vote counts */}
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                  {(counts.yes || 0) > 0 && <span style={{ color: 'var(--status-ok)' }}>Yes: {counts.yes}</span>}
                  {(counts.no || 0) > 0 && <span style={{ color: 'var(--status-err)' }}>No: {counts.no}</span>}
                  {(counts.abstain || 0) > 0 && <span style={{ color: 'var(--text-dim)' }}>Abstain: {counts.abstain}</span>}
                  {p.proposal_votes?.length === 0 && <span style={{ color: 'var(--text-3a5a)' }}>No votes</span>}
                </div>
                {/* Vote buttons */}
                {isOpen && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[['yes', 'var(--status-ok)', 'Yes'], ['no', 'var(--status-err)', 'No'], ['abstain', 'var(--text-dim)', 'Abstain']].map(([v, c, l]) => (
                      <button key={v}
                        onClick={() => castVote(p.id, v)}
                        disabled={voting[p.id] === 'loading'}
                        style={{ padding: '0.3rem 0.7rem', background: myVote === v ? `${c}20` : 'none', border: `1px solid ${myVote === v ? c : 'var(--hud-border)'}`, color: myVote === v ? c : 'var(--text-nav)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: myVote === v ? 700 : 400 }}
                      >{l}</button>
                    ))}
                  </div>
                )}
              </div>
              {p.participants?.name && <div style={{ fontSize: '0.7rem', color: 'var(--text-3a5a)', marginTop: '0.5rem' }}>Proposed by {p.participants.name} · {fmtDate(p.created_at)}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Bulletin tab ─────────────────────────────────────────────────────────────

const TYPE_META = {
  announcement: { label: 'Announcement', color: 'var(--gold)' },
  decision:     { label: 'Decision',     color: 'var(--status-info)' },
  document:     { label: 'Document',     color: '#a78bfa' },
  event:        { label: 'Event',        color: 'var(--status-ok)' },
}

const fmtRelative = (d) => {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function AttachmentLink({ att }) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    supabase.storage.from('bulletin-attachments').createSignedUrl(att.storage_path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setUrl(data.signedUrl) })
  }, [att.storage_path])
  const ext = att.file_name.split('.').pop().toUpperCase()
  return (
    <a
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={!url ? e => e.preventDefault() : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: url ? 'var(--gold)' : 'var(--text-dim)', textDecoration: 'none', padding: '0.25rem 0.55rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}
    >
      <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '2px' }}>{ext}</span>
      {att.file_name}
    </a>
  )
}

// Chip style helpers
const crudChip = (color) => ({ padding: '0.2rem 0.55rem', background: 'none', border: `1px solid ${color}40`, color, borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' })

function BulletinPost({ post, onDelete, onUpdate, isSteward, onTogglePin }) {
  const { participant } = useAuth()
  const meta = TYPE_META[post.post_type] || TYPE_META.announcement
  const isAuthor = participant?.id && post.author_id === participant.id
  const wasEdited = post.updated_at && new Date(post.updated_at) - new Date(post.created_at) > 5000

  // Edit state
  const [editing, setEditing]     = useState(false)
  const [editForm, setEditForm]   = useState({ title: post.title, body: post.body || '', url: post.url || '', post_type: post.post_type })
  const [saving, setSaving]       = useState(false)
  const [editError, setEditError] = useState(null)

  // Comment state
  const [showComments, setShowComments]       = useState(false)
  const [comments, setComments]               = useState(post.bulletin_comments || [])
  const [commentText, setCommentText]         = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  async function saveEdit(e) {
    e.preventDefault()
    if (!editForm.title.trim()) return
    setSaving(true); setEditError(null)
    const { error } = await supabase.from('bulletin_posts').update({
      title: editForm.title.trim(),
      body: editForm.body.trim() || null,
      url: editForm.url.trim() || null,
      post_type: editForm.post_type,
      updated_at: new Date().toISOString(),
    }).eq('id', post.id)
    if (error) { setEditError(error.message); setSaving(false); return }
    setSaving(false); setEditing(false)
    onUpdate()
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    const { data, error } = await supabase
      .from('bulletin_comments')
      .insert({ post_id: post.id, author_id: participant?.id, body: commentText.trim() })
      .select('*, participants(name)')
      .single()
    if (!error && data) setComments(c => [...c, data])
    setCommentText('')
    setSubmittingComment(false)
  }

  async function deleteComment(id) {
    await supabase.from('bulletin_comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id))
  }

  const attachments = post.bulletin_attachments || []

  // ── Inline edit form ──
  if (editing) return (
    <div style={{ background: 'rgba(196,149,106,0.04)', border: '1px solid rgba(196,149,106,0.2)', borderRadius: '8px', padding: '1.1rem 1.25rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '0.85rem' }}>Edit post</div>
      <form onSubmit={saveEdit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.25rem' }}>Title</label>
            <input required value={editForm.title} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.25rem' }}>Type</label>
            <select value={editForm.post_type} onChange={e => setEditForm(f => ({...f, post_type: e.target.value}))} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="announcement">Announcement</option>
              <option value="decision">Decision</option>
              <option value="document">Document</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '0.65rem' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.25rem' }}>Body</label>
          <textarea value={editForm.body} onChange={e => setEditForm(f => ({...f, body: e.target.value}))} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '64px' }} />
        </div>
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.25rem' }}>Link</label>
          <input type="url" value={editForm.url} onChange={e => setEditForm(f => ({...f, url: e.target.value}))} placeholder="https://…" style={inputStyle} />
        </div>
        {editError && <div style={{ color: 'var(--status-err)', fontSize: '0.75rem', marginBottom: '0.65rem' }}>{editError}</div>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={saving} style={{ padding: '0.4rem 0.9rem', background: 'var(--gold)', border: 'none', color: '#000', borderRadius: '5px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={() => setEditing(false)} style={{ padding: '0.4rem 0.9rem', background: 'none', border: '1px solid var(--hud-border)', color: 'var(--text-dim)', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        </div>
      </form>
    </div>
  )

  return (
    <div style={{
      background: post.is_pinned ? 'rgba(196,149,106,0.04)' : 'rgba(255,255,255,0.018)',
      border: `1px solid ${post.is_pinned ? 'rgba(196,149,106,0.18)' : '#1a1a2e'}`,
      borderRadius: '8px',
      padding: '1.1rem 1.25rem',
      position: 'relative',
    }}>
      {post.is_pinned && (
        <span style={{ position: 'absolute', top: '0.75rem', right: '0.85rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', opacity: 0.7 }}>pinned</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <Badge label={meta.label} color={meta.color} />
        {wasEdited && <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>edited</span>}
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-ccc)', marginBottom: post.body ? '0.4rem' : 0 }}>{post.title}</div>
      {post.body && <div style={{ fontSize: '0.83rem', color: 'var(--text-accent)', lineHeight: 1.6, marginBottom: '0.5rem' }}>{post.body}</div>}
      {post.url && (
        <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none', marginBottom: '0.5rem' }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >Open document →</a>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
          {attachments.map(att => <AttachmentLink key={att.id} att={att} />)}
        </div>
      )}

      {/* Footer: meta + CRUD chips */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3a5a)' }}>
            {post.participants?.name && <span>{post.participants.name} · </span>}
            <span>{fmtRelative(post.created_at)}</span>
          </div>
          <button
            onClick={() => setShowComments(v => !v)}
            style={{ background: 'none', border: 'none', color: showComments ? 'var(--gold)' : 'var(--text-3a5a)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}` : 'Comment'}
          </button>
        </div>
        {/* CRUD chips */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {isAuthor && (
            <button onClick={() => setEditing(true)} style={crudChip('var(--gold)')}>Edit</button>
          )}
          {isSteward && (
            <button onClick={() => onTogglePin(post)} style={crudChip(post.is_pinned ? 'var(--gold)' : 'var(--text-nav)')}>
              {post.is_pinned ? 'Unpin' : 'Pin'}
            </button>
          )}
          {(isSteward || isAuthor) && (
            <button onClick={() => onDelete(post.id)} style={crudChip('var(--status-err)')}>Delete</button>
          )}
        </div>
      </div>

      {/* Comments thread */}
      {showComments && (
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #1a1a2e' }}>
          {comments.length === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>No comments yet.</div>}
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-nav)', marginBottom: '0.2rem' }}>
                  {c.participants?.name || 'Member'} · {fmtRelative(c.created_at)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-accent)', lineHeight: 1.55 }}>{c.body}</div>
              </div>
              {(isSteward || c.author_id === participant?.id) && (
                <button onClick={() => deleteComment(c.id)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', padding: '0 0.2rem', flexShrink: 0 }}>×</button>
              )}
            </div>
          ))}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              style={{ ...inputStyle, fontSize: '0.78rem', flex: 1 }}
            />
            <button type="submit" disabled={submittingComment || !commentText.trim()} style={{ padding: '0.4rem 0.85rem', background: 'var(--gold)', border: 'none', color: '#000', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              {submittingComment ? '…' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function BulletinTab() {
  const { participant, isSteward } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState([])
  const [form, setForm] = useState({ title: '', body: '', url: '', post_type: 'announcement' })

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('bulletin_posts')
      .select('*, participants(name), bulletin_comments(id, author_id, body, created_at, participants(name)), bulletin_attachments(id, file_name, storage_path, file_type, file_size)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function submitPost(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    setError(null)
    const { data: post, error: postErr } = await supabase.from('bulletin_posts').insert({
      title: form.title.trim(),
      body: form.body.trim() || null,
      url: form.url.trim() || null,
      post_type: form.post_type,
      author_id: participant?.id,
      is_pinned: false,
    }).select('id').single()
    if (postErr) { setError(postErr.message); setSubmitting(false); return }

    // Upload attachments
    for (const file of files) {
      const path = `${post.id}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('bulletin-attachments').upload(path, file)
      if (!upErr) {
        await supabase.from('bulletin_attachments').insert({
          post_id: post.id,
          uploader_id: participant?.id,
          file_name: file.name,
          storage_path: path,
          file_type: file.type,
          file_size: file.size,
        })
      }
    }

    setForm({ title: '', body: '', url: '', post_type: 'announcement' })
    setFiles([])
    setShowCompose(false)
    setSubmitting(false)
    load()
  }

  async function deletePost(id) {
    await supabase.from('bulletin_posts').delete().eq('id', id)
    load()
  }

  async function togglePin(post) {
    await supabase.from('bulletin_posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id)
    load()
  }

  const pinned = posts.filter(p => p.is_pinned)
  const feed   = posts.filter(p => !p.is_pinned)

  return (
    <div>
      {/* Compose controls */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => setShowCompose(!showCompose)} style={{ padding: '0.4rem 0.85rem', background: 'var(--gold-12)', border: '1px solid rgba(196,149,106,0.25)', color: 'var(--gold)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {showCompose ? 'Cancel' : '+ Post'}
        </button>
      </div>

      {/* Compose form */}
      {showCompose && (
        <form onSubmit={submitPost} style={{ background: 'rgba(196,149,106,0.04)', border: '1px solid rgba(196,149,106,0.15)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Title</label>
              <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Post title" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Type</label>
              <select value={form.post_type} onChange={e => setForm(f => ({...f, post_type: e.target.value}))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="announcement">Announcement</option>
                <option value="decision">Decision</option>
                <option value="document">Document</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Body (optional)</label>
            <textarea value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} rows={3} placeholder="Details, context, or summary…" style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Link (optional)</label>
            <input type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="https://docs.google.com/…" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-nav)', marginBottom: '0.3rem' }}>Attachments (optional)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.txt"
              onChange={e => setFiles(Array.from(e.target.files))}
              style={{ ...inputStyle, cursor: 'pointer', padding: '0.35rem 0.5rem' }}
            />
            {files.length > 0 && (
              <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {files.map((f, i) => (
                  <span key={i} style={{ fontSize: '0.72rem', color: 'var(--text-accent)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '2px 6px' }}>{f.name}</span>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1.1rem', background: 'var(--gold)', border: 'none', color: '#000', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      )}

      {error && <div style={{ color: 'var(--status-err)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
      {loading && <div style={emptyStyle}>Loading…</div>}

      {/* Pinned zone */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-nav)', marginBottom: '0.6rem' }}>Pinned</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {pinned.map(p => <BulletinPost key={p.id} post={p} isSteward={isSteward} onDelete={deletePost} onUpdate={load} onTogglePin={togglePin} />)}
          </div>
        </div>
      )}

      {/* Feed */}
      {!loading && (
        <div>
          {feed.length === 0 && pinned.length === 0 && <div style={{ ...emptyStyle, background: 'rgba(255,255,255,0.015)', border: '1px solid #1a1a2e', borderRadius: '8px' }}>No posts yet.</div>}
          {feed.length > 0 && (
            <div>
              {pinned.length > 0 && <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-nav)', marginBottom: '0.6rem' }}>Recent</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {feed.map(p => <BulletinPost key={p.id} post={p} isSteward={isSteward} onDelete={deletePost} onUpdate={load} onTogglePin={togglePin} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'bulletin',    label: 'Bulletin'    },
  { key: 'projects',    label: 'Projects'    },
  { key: 'members',     label: 'Members'     },
  { key: 'governance',  label: 'Governance'  },
]

export default function CooperativeGroup({ initialTab = 'bulletin' }) {
  const [tab, setTab] = useState(initialTab)
  const openTab = (key) => {
    setTab(key)
    const paths = { projects: '/intranet/projects/', members: '/intranet/directory/', governance: '/intranet/governance/', bulletin: '/intranet/bulletin/' }
    window.history.pushState(null, '', paths[key] || '/intranet/projects/')
  }
  return (
    <TabShell title="Cooperative" subtitle="Bulletin · Projects · Members · Governance" tabs={TABS} active={tab} onTab={openTab}>
      {tab === 'projects'   && <ProjectsTab />}
      {tab === 'members'    && <MembersTab />}
      {tab === 'governance' && <GovernanceTab />}
      {tab === 'bulletin'   && <BulletinTab />}
    </TabShell>
  )
}
