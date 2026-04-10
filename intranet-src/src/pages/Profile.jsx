import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

const TYPE_LABELS = {
  steward:  'Steward',
  member:   'Member',
  investor: 'Investor',
  ally:     'Ally',
}

export default function Profile({ onRerunOnboarding }) {
  const { participant, signOut } = useAuth()
  const [showRerunConfirm, setShowRerunConfirm] = useState(false)

  if (!participant) return null

  function handleRerun() {
    setShowRerunConfirm(false)
    onRerunOnboarding()
  }

  const typeLabel = TYPE_LABELS[participant.participant_type] || participant.participant_type || 'Participant'

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Avatar / initials */}
        <div style={s.avatarRow}>
          <div style={s.avatar}>
            {(participant.name || 'P').charAt(0).toUpperCase()}
          </div>
          <div style={s.avatarMeta}>
            <div style={s.name}>{participant.name || '—'}</div>
            <div style={s.typeBadge}>{typeLabel}</div>
          </div>
        </div>

        {/* Details */}
        <div style={s.detailGrid}>
          <ProfileRow label="Email"    value={participant.email    || '—'} />
          <ProfileRow label="Role"     value={participant.role     || '—'} />
          <ProfileRow label="Location" value={participant.location || '—'} />
          {participant.bio && (
            <div style={s.bioRow}>
              <span style={s.label}>Bio</span>
              <span style={s.bioValue}>{participant.bio}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Onboarding section */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Orientation</div>
          <p style={s.sectionDesc}>
            You can re-run the intranet orientation at any time to revisit the cooperative structure and navigation guide.
          </p>
          {showRerunConfirm ? (
            <div style={s.confirmRow}>
              <span style={s.confirmText}>Re-run orientation?</span>
              <button style={s.confirmBtn} onClick={handleRerun}>Yes, re-run</button>
              <button style={s.cancelBtn} onClick={() => setShowRerunConfirm(false)}>Cancel</button>
            </div>
          ) : (
            <button style={s.rerunBtn} onClick={() => setShowRerunConfirm(true)}>
              Re-run orientation
            </button>
          )}
        </div>

        {/* Sign out */}
        <div style={s.divider} />
        <div style={s.section}>
          <button style={s.signOutBtn} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div style={s.row}>
      <span style={s.label}>{label}</span>
      <span style={s.value}>{value}</span>
    </div>
  )
}

const s = {
  page: {
    padding: '2rem',
    maxWidth: '560px',
  },
  card: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '1.75rem',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(196,149,106,0.15)',
    border: '2px solid rgba(196,149,106,0.3)',
    color: 'var(--gold, #c4956a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  avatarMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  name: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary, #e8e0d4)',
  },
  typeBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--gold, #c4956a)',
    background: 'rgba(196,149,106,0.12)',
    border: '1px solid rgba(196,149,106,0.2)',
    borderRadius: '4px',
    padding: '0.15rem 0.5rem',
    display: 'inline-block',
  },
  detailGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: '1rem',
    alignItems: 'baseline',
    padding: '0.35rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  bioRow: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: '1rem',
    padding: '0.35rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-dim, #666)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary, #aaa)',
  },
  bioValue: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary, #aaa)',
    lineHeight: 1.55,
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '1.25rem 0',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-dim, #666)',
  },
  sectionDesc: {
    margin: 0,
    fontSize: '0.825rem',
    color: 'var(--text-secondary, #aaa)',
    lineHeight: 1.55,
  },
  rerunBtn: {
    background: 'rgba(196,149,106,0.1)',
    border: '1px solid rgba(196,149,106,0.25)',
    color: 'var(--gold, #c4956a)',
    fontSize: '0.825rem',
    fontWeight: 600,
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  confirmText: {
    fontSize: '0.825rem',
    color: 'var(--text-secondary, #aaa)',
  },
  confirmBtn: {
    background: 'var(--gold, #c4956a)',
    border: 'none',
    color: '#0a0a0f',
    fontSize: '0.8rem',
    fontWeight: 700,
    padding: '0.4rem 0.9rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)',
    fontSize: '0.8rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  signOutBtn: {
    background: 'none',
    border: '1px solid rgba(255,100,100,0.2)',
    color: 'rgba(255,120,120,0.7)',
    fontSize: '0.825rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
}
