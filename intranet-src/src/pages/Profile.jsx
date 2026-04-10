import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

const TYPE_LABELS = {
  steward:  'Steward',
  member:   'Member',
  investor: 'Investor',
  ally:     'Ally',
}

export default function Profile({ onRerunOnboarding }) {
  const { participant, displayName, signOut, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showRerunConfirm, setShowRerunConfirm] = useState(false)

  const [fields, setFields] = useState({
    first_name:   participant?.first_name   || '',
    last_name:    participant?.last_name    || '',
    display_name: participant?.display_name || '',
    role:         participant?.role         || '',
    bio:          participant?.bio          || '',
    location:     participant?.location     || '',
  })

  if (!participant) return null

  const typeLabel = TYPE_LABELS[participant.participant_type] || participant.participant_type || 'Participant'
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function handleField(key, val) {
    setFields(f => {
      const next = { ...f, [key]: val }
      // Auto-derive display_name from first+last unless manually overridden
      if (key === 'first_name' || key === 'last_name') {
        next.display_name = [next.first_name, next.last_name].filter(Boolean).join(' ')
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error } = await updateProfile(fields)
    setSaving(false)
    if (error) { setSaveError('Save failed. Try again.'); return }
    setEditing(false)
  }

  function handleCancel() {
    setFields({
      first_name:   participant.first_name   || '',
      last_name:    participant.last_name    || '',
      display_name: participant.display_name || '',
      role:         participant.role         || '',
      bio:          participant.bio          || '',
      location:     participant.location     || '',
    })
    setSaveError(null)
    setEditing(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Avatar + name header */}
        <div style={s.avatarRow}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.avatarMeta}>
            <div style={s.name}>{displayName || '—'}</div>
            <div style={s.typeBadge}>{typeLabel}</div>
          </div>
          {!editing && (
            <button style={s.editBtn} onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>

        {/* Fields */}
        {editing ? (
          <div style={s.editForm}>
            <FieldRow label="First Name">
              <input style={s.input} value={fields.first_name} onChange={e => handleField('first_name', e.target.value)} placeholder="First name" />
            </FieldRow>
            <FieldRow label="Last Name">
              <input style={s.input} value={fields.last_name} onChange={e => handleField('last_name', e.target.value)} placeholder="Last name" />
            </FieldRow>
            <FieldRow label="Display Name">
              <input style={s.input} value={fields.display_name} onChange={e => handleField('display_name', e.target.value)} placeholder="How your name appears" />
              <span style={s.fieldNote}>Defaults to First + Last</span>
            </FieldRow>
            <FieldRow label="Email">
              <span style={{ ...s.value, opacity: 0.5 }}>{participant.email || '—'}</span>
            </FieldRow>
            <FieldRow label="Role">
              <input style={s.input} value={fields.role} onChange={e => handleField('role', e.target.value)} placeholder="Your role" />
            </FieldRow>
            <FieldRow label="Location">
              <input style={s.input} value={fields.location} onChange={e => handleField('location', e.target.value)} placeholder="City, region" />
            </FieldRow>
            <FieldRow label="Bio">
              <textarea style={s.textarea} value={fields.bio} onChange={e => handleField('bio', e.target.value)} placeholder="Brief bio" rows={3} />
            </FieldRow>
            {saveError && <div style={s.error}>{saveError}</div>}
            <div style={s.formActions}>
              <button style={s.cancelBtn} onClick={handleCancel} disabled={saving}>Cancel</button>
              <button style={{ ...s.saveBtn, ...(saving ? s.saveBtnDisabled : {}) }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={s.detailGrid}>
            <ProfileRow label="First Name"    value={participant.first_name   || '—'} />
            <ProfileRow label="Last Name"     value={participant.last_name    || '—'} />
            <ProfileRow label="Display Name"  value={participant.display_name || '—'} />
            <ProfileRow label="Email"         value={participant.email        || '—'} />
            <ProfileRow label="Role"          value={participant.role         || '—'} />
            <ProfileRow label="Location"      value={participant.location     || '—'} />
            {participant.bio && (
              <div style={s.bioRow}>
                <span style={s.label}>Bio</span>
                <span style={s.bioValue}>{participant.bio}</span>
              </div>
            )}
          </div>
        )}

        <div style={s.divider} />

        {/* Orientation */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Orientation</div>
          <p style={s.sectionDesc}>
            Re-run the intranet orientation to revisit the cooperative structure and navigation guide.
          </p>
          {showRerunConfirm ? (
            <div style={s.confirmRow}>
              <span style={s.confirmText}>Re-run orientation?</span>
              <button style={s.confirmBtn} onClick={() => { setShowRerunConfirm(false); onRerunOnboarding() }}>Yes, re-run</button>
              <button style={s.cancelBtn2} onClick={() => setShowRerunConfirm(false)}>Cancel</button>
            </div>
          ) : (
            <button style={s.rerunBtn} onClick={() => setShowRerunConfirm(true)}>Re-run orientation</button>
          )}
        </div>

        <div style={s.divider} />
        <div style={s.section}>
          <button style={s.signOutBtn} onClick={signOut}>Sign out</button>
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

function FieldRow({ label, children }) {
  return (
    <div style={s.fieldRow}>
      <span style={{ ...s.label, paddingTop: '0.45rem' }}>{label}</span>
      <div style={s.fieldRight}>{children}</div>
    </div>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '560px' },
  card: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '1.75rem',
  },
  avatarRow: {
    display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem',
  },
  avatar: {
    width: '56px', height: '56px', borderRadius: '50%',
    background: 'rgba(196,149,106,0.15)', border: '2px solid rgba(196,149,106,0.3)',
    color: 'var(--gold, #c4956a)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
  },
  avatarMeta: { display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 },
  name: { fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary, #e8e0d4)' },
  typeBadge: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--gold, #c4956a)', background: 'rgba(196,149,106,0.12)',
    border: '1px solid rgba(196,149,106,0.2)', borderRadius: '4px',
    padding: '0.15rem 0.5rem', display: 'inline-block',
  },
  editBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)', fontSize: '0.8rem',
    padding: '0.35rem 0.85rem', borderRadius: '5px', cursor: 'pointer', flexShrink: 0,
  },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  row: {
    display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem', alignItems: 'baseline',
    padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  bioRow: {
    display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem',
    padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  label: {
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim, #666)',
    letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  value: { fontSize: '0.875rem', color: 'var(--text-secondary, #aaa)' },
  bioValue: { fontSize: '0.875rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.55 },
  editForm: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  fieldRow: {
    display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem', alignItems: 'start',
    padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  fieldRight: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  input: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '5px', color: 'var(--text-primary, #e8e0d4)',
    fontSize: '0.875rem', padding: '0.4rem 0.6rem', width: '100%',
    outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '5px', color: 'var(--text-primary, #e8e0d4)',
    fontSize: '0.875rem', padding: '0.4rem 0.6rem', width: '100%',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  fieldNote: { fontSize: '0.7rem', color: 'var(--text-dim, #555)' },
  error: { color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' },
  cancelBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)', fontSize: '0.825rem',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--gold, #c4956a)', border: 'none', color: '#0a0a0f',
    fontSize: '0.825rem', fontWeight: 700, padding: '0.5rem 1.2rem',
    borderRadius: '6px', cursor: 'pointer',
  },
  saveBtnDisabled: { opacity: 0.6, cursor: 'default' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.25rem 0' },
  section: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  sectionTitle: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-dim, #666)',
  },
  sectionDesc: { margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.55 },
  rerunBtn: {
    background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.25)',
    color: 'var(--gold, #c4956a)', fontSize: '0.825rem', fontWeight: 600,
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start',
  },
  confirmRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  confirmText: { fontSize: '0.825rem', color: 'var(--text-secondary, #aaa)' },
  confirmBtn: {
    background: 'var(--gold, #c4956a)', border: 'none', color: '#0a0a0f',
    fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.9rem',
    borderRadius: '5px', cursor: 'pointer',
  },
  cancelBtn2: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)', fontSize: '0.8rem',
    padding: '0.4rem 0.9rem', borderRadius: '5px', cursor: 'pointer',
  },
  signOutBtn: {
    background: 'none', border: '1px solid rgba(255,100,100,0.2)',
    color: 'rgba(255,120,120,0.7)', fontSize: '0.825rem',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start',
  },
}
