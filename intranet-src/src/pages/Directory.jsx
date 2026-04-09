import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const membershipLabel = {
  1: 'Class 1 — Labor',
  2: 'Class 2 — Patron',
  3: 'Class 3 — Community',
  4: 'Class 4 — Investor',
}

export default function Directory() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('participants')
        .select('id, name, email, participant_type, account_type, membership_class, craft')
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        setMembers(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return (
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.craft?.toLowerCase().includes(q) ||
      m.participant_type?.toLowerCase().includes(q)
    )
  })

  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <nav style={styles.breadcrumb}>
          <a href="/intranet/" style={styles.breadLink}>Home</a>
          <span style={styles.breadSep}>/</span>
          <span>Member Directory</span>
        </nav>

        <h1 style={styles.h1}>Member Directory</h1>
        <p style={styles.subtitle}>{members.length} organizer{members.length !== 1 ? 's' : ''}</p>

        <input
          type="search"
          placeholder="Search by name, craft, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading && <LoadingList />}

        {!loading && error && (
          <div style={styles.error}>Error loading directory: {error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={styles.empty}>
            {search ? 'No members match that search.' : 'No members found.'}
          </div>
        )}

        {!loading && !error && (
          <div style={styles.grid}>
            {filtered.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MemberCard({ member }) {
  return (
    <div style={styles.card}>
      <div style={styles.avatar}>
        {(member.name || '?').charAt(0).toUpperCase()}
      </div>
      <div style={styles.cardBody}>
        <div style={styles.name}>{member.name || '—'}</div>
        {member.craft && <div style={styles.craft}>{member.craft}</div>}
        <div style={styles.tags}>
          {member.participant_type && (
            <span style={styles.tag}>{member.participant_type}</span>
          )}
          {member.membership_class && (
            <span style={{ ...styles.tag, ...styles.tagCopper }}>
              {membershipLabel[member.membership_class] || `Class ${member.membership_class}`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingList() {
  return (
    <div style={styles.grid}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ ...styles.card, opacity: 0.4 }}>
          <div style={{ ...styles.avatar, background: '#2a2a35' }} />
          <div style={styles.cardBody}>
            <div style={{ height: '1rem', width: '60%', background: '#2a2a35', borderRadius: 4, marginBottom: '0.5rem' }} />
            <div style={{ height: '0.75rem', width: '40%', background: '#2a2a35', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-void, #0a0a0f)' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: '#888', marginBottom: '1rem' },
  breadLink: { color: 'var(--ember, #c4956a)', textDecoration: 'none' },
  breadSep: { margin: '0 0.5rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem' },
  subtitle: { fontSize: '0.875rem', color: '#888', marginBottom: '1.5rem' },
  search: {
    width: '100%', maxWidth: '400px', padding: '0.6rem 1rem',
    background: '#141418', border: '1px solid #2a2a35',
    color: '#e8e8e0', borderRadius: '8px', fontSize: '0.875rem',
    marginBottom: '1.5rem', outline: 'none', boxSizing: 'border-box',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: {
    display: 'flex', alignItems: 'flex-start', gap: '1rem',
    background: '#141418', border: '1px solid #2a2a35',
    borderRadius: '10px', padding: '1.25rem',
  },
  avatar: {
    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(196,149,106,0.15)', color: 'var(--ember, #c4956a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', fontWeight: 700,
  },
  cardBody: { flex: 1, minWidth: 0 },
  name: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' },
  craft: { fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  tag: {
    fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: '#888', background: '#1e1e28',
    border: '1px solid #2a2a35', borderRadius: '4px', padding: '0.2rem 0.5rem',
  },
  tagCopper: { color: 'var(--ember, #c4956a)', background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.2)' },
  error: { padding: '1rem', background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: '8px', color: '#ff6b6b' },
  empty: { padding: '2rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' },
}
